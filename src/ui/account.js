import { supabase, supabaseConfigured } from '../core/supabase.js';
import { syncPendingProgress } from '../core/progress-sync.js';
import { storage } from '../core/storage.js';

const displayName = (user) => {
  const value = user?.user_metadata?.full_name || user?.user_metadata?.name || '';
  return String(value).trim();
};

export function mountAccount(container) {
  if (!container) return;
  if (!supabaseConfigured || !supabase) {
    container.innerHTML = '<span class="tag">Modo sin conexión · Cuenta no configurada</span>';
    return;
  }

  container.innerHTML = `
    <details class="account-menu" id="account-menu">
      <summary class="account-trigger" id="account-summary" aria-label="Abrir menú de cuenta">
        <span class="account-trigger-icon" aria-hidden="true"> <i data-lucide="user-round"></i> </span>
        <span class="account-trigger-label">Mi cuenta</span>
        <i data-lucide="chevron-down" class="account-chevron" aria-hidden="true"></i>
      </summary>
      <div class="card account-panel" id="account-panel">
        <div class="account-panel-heading">
          <span class="account-avatar" id="account-avatar"><i data-lucide="user-round"></i></span>
          <div class="account-identity">
            <strong id="account-name">Mi cuenta</strong>
            <small id="account-email-label">No has iniciado sesión</small>
          </div>
        </div>
        <div id="account-status" role="status" aria-live="polite"></div>
        <div class="account-guest-actions" id="account-guest-actions">
          <a href="#login" class="btn btn-primary btn-sm" data-account-route="login">Iniciar sesión</a>
          <a href="#register" class="btn btn-secondary btn-sm" data-account-route="register">Crear cuenta</a>
        </div>
        <div class="account-user-actions" id="account-user-actions" hidden>
          <a href="#dashboard" class="account-menu-link" data-account-route="dashboard"><i data-lucide="layout-dashboard"></i> Mi panel</a>
          <button class="account-menu-link account-logout" id="account-signout" type="button"><i data-lucide="log-out"></i> Cerrar sesión</button>
        </div>
        <p id="account-sync" class="account-sync-note"></p>
      </div>
    </details>`;

  const menu = container.querySelector('#account-menu');
  const status = container.querySelector('#account-status');
  const nameLabel = container.querySelector('#account-name');
  const emailLabel = container.querySelector('#account-email-label');
  const avatar = container.querySelector('#account-avatar');
  const triggerLabel = container.querySelector('.account-trigger-label');
  const guestActions = container.querySelector('#account-guest-actions');
  const userActions = container.querySelector('#account-user-actions');
  const syncLabel = container.querySelector('#account-sync');
  const signout = container.querySelector('#account-signout');

  const setStatus = (message) => { status.textContent = message; };
  const refresh = async (session) => {
    const user = session?.user;
    const name = displayName(user);
    const shortName = name ? name.split(/\s+/)[0] : '';
    const email = user?.email || '';
    triggerLabel.textContent = user ? (shortName || 'Mi cuenta') : 'Mi cuenta';
    nameLabel.textContent = user ? (name || 'Estudiante') : 'Bienvenido';
    emailLabel.textContent = user ? email : 'Accede o crea tu cuenta';
    avatar.textContent = (shortName || email || 'U').charAt(0).toUpperCase();
    guestActions.hidden = Boolean(user);
    userActions.hidden = !user;
    setStatus(user ? 'Tu cuenta está activa.' : 'Inicia sesión para sincronizar tu progreso.');
    const outbox = await storage.getAll('sync_outbox').catch(() => []);
    const pending = user
      ? outbox.filter(event => event.owner_user_id === user.id).length
      : 0;
    syncLabel.textContent = pending
      ? `${pending} cambios pendientes de sincronizar`
      : user
        ? 'Tu progreso está guardado en tu cuenta.'
        : 'Tu avance local se conserva en este dispositivo y no se mezcla con otras cuentas.';
  };

  supabase.auth.getSession().then(({ data }) => refresh(data.session)).catch(() => setStatus('No se pudo comprobar la sesión.'));
  const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
    // Defer storage reads outside the auth callback to avoid blocking Supabase's lock.
    queueMicrotask(() => refresh(session));
  });

  container.querySelectorAll('[data-account-route]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      menu.open = false;
      window.location.hash = link.dataset.accountRoute;
    });
  });

  signout.addEventListener('click', async () => {
    signout.disabled = true;
    const { error } = await supabase.auth.signOut();
    setStatus(error ? error.message : 'Sesión cerrada correctamente.');
    signout.disabled = false;
    if (!error) menu.open = false;
  });

  // Icon renderer is optional here because this component can mount before route rendering.
  if (window.lucide?.createIcons) window.lucide.createIcons();
  return () => authListener?.subscription?.unsubscribe?.();
}
