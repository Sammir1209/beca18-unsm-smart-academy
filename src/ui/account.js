import { supabase, supabaseConfigured } from '../core/supabase.js';
import { syncPendingProgress } from '../core/progress-sync.js';
import { storage } from '../core/storage.js';

export function mountAccount(container) {
  if (!container) return;
  if (!supabaseConfigured) {
    container.innerHTML = '<span class="tag">Modo sin conexión · Cuenta no configurada</span>';
    return;
  }
  container.innerHTML = `
    <details class="account-menu">
      <summary class="btn btn-secondary btn-sm" id="account-summary">Mi cuenta</summary>
      <div class="card account-panel">
        <div id="account-status" role="status" aria-live="polite">Comprobando sesión…</div>
        <form id="account-form">
          <label for="account-email">Correo electrónico</label>
          <input id="account-email" type="email" autocomplete="email" required placeholder="tu@correo.com">
          <label for="account-password">Contraseña</label>
          <input id="account-password" type="password" autocomplete="current-password" minlength="8" required placeholder="Mínimo 8 caracteres">
          <div class="account-actions">
            <button class="btn btn-primary btn-sm" type="submit" data-action="signin">Iniciar sesión</button>
            <button class="btn btn-secondary btn-sm" type="submit" data-action="signup">Crear cuenta</button>
          </div>
          <button class="btn btn-secondary btn-sm" type="button" data-action="reset">Recuperar contraseña</button>
        </form>
        <button class="btn btn-secondary btn-sm" id="account-signout" type="button" hidden>Cerrar sesión</button>
        <p id="account-sync" class="text-muted"></p>
      </div>
    </details>`;
  const status = container.querySelector('#account-status');
  const form = container.querySelector('#account-form');
  const signout = container.querySelector('#account-signout');
  const syncLabel = container.querySelector('#account-sync');
  const setStatus = (message) => { status.textContent = message; };
  const refresh = async (session) => {
    const user = session?.user;
    setStatus(user ? `Sesión iniciada: ${user.email}` : 'Estás usando el modo local. Inicia sesión para sincronizar.');
    form.hidden = Boolean(user);
    signout.hidden = !user;
    const pending = (await storage.getAll('sync_outbox').catch(() => [])).length;
    syncLabel.textContent = pending ? `${pending} cambios pendientes de sincronizar` : 'Progreso sincronizado o guardado localmente.';
  };
  supabase.auth.getSession().then(({data}) => refresh(data.session)).catch(() => setStatus('No se pudo comprobar la sesión.'));
  supabase.auth.onAuthStateChange((_event, session) => { refresh(session); });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('[type="submit"]');
    const email = form.querySelector('#account-email').value.trim();
    const password = form.querySelector('#account-password').value;
    const action = event.submitter?.dataset.action || 'signin';
    button.disabled = true;
    try {
      if (action === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}/` } });
        if (error) throw error;
        setStatus('Solicitud enviada. Revisa tu correo para confirmar la cuenta.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const result = await syncPendingProgress();
        setStatus(`Sesión iniciada. ${result.synced} cambios sincronizados.`);
      }
    } catch (error) { setStatus(error.message || 'No se pudo completar la operación.'); }
    finally { button.disabled = false; }
  });
  form.querySelector('[data-action="reset"]').addEventListener('click', async () => {
    const email = form.querySelector('#account-email').value.trim();
    if (!email) return setStatus('Escribe tu correo para enviarte el enlace de recuperación.');
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/` });
    setStatus(error ? error.message : 'Revisa tu correo para recuperar la contraseña.');
  });
  signout.addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();
    setStatus(error ? error.message : 'Sesión cerrada. Tus datos locales permanecen en este dispositivo.');
  });
}
