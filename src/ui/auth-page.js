import { supabase, supabaseConfigured } from '../core/supabase.js';

const safeMessage = (value) => String(value || '').replace(/[<>]/g, '');

export function renderAuthPage(container, route, navigate) {
  if (!container) return;
  const mode = route === 'register' ? 'register' : route === 'forgot-password' ? 'forgot' : route === 'reset-password' ? 'new-password' : route === 'auth-confirm' ? 'confirm' : 'login';
  const titles = {
    login: ['Qué bueno verte de nuevo', 'Continúa tu preparación para la UNSM y Beca 18.'],
    register: ['Crea tu cuenta', 'Guarda tu avance y continúa estudiando desde otros dispositivos.'],
    forgot: ['Recupera tu acceso', 'Te enviaremos un enlace seguro para restablecer tu contraseña.'],
    'new-password': ['Crea una nueva contraseña', 'Elige una contraseña segura para volver a tu academia.'],
    confirm: ['Verifica tu correo', 'Estamos comprobando el estado de tu cuenta.'],
  };
  const [title, subtitle] = titles[mode];
  container.innerHTML = `
    <section class="auth-screen">
      <div class="auth-brand-panel">
        <div class="auth-brand-mark">U<span>A</span></div>
        <p class="auth-eyebrow">UNSM ACADEMY · ADMISIÓN 2027</p>
        <h1>Tu esfuerzo de hoy abre las puertas de mañana.</h1>
        <p>Una preparación inteligente, constante y diseñada para acompañarte hasta tu objetivo.</p>
        <div class="auth-feature-list"><span>✓ Progreso sincronizado</span><span>✓ Práctica adaptativa</span><span>✓ Preparación UNSM + Beca 18</span></div>
      </div>
      <div class="auth-form-panel">
        <a href="#dashboard" class="auth-back-link" data-auth-back>← Volver a la academia</a>
        <div class="auth-form-wrap">
          <span class="auth-kicker">TU ESPACIO DE APRENDIZAJE</span>
          <h2>${title}</h2><p class="auth-subtitle">${subtitle}</p>
          <div id="auth-feedback" class="auth-feedback" role="status" aria-live="polite"></div>
          ${mode === 'confirm' ? '<button id="auth-continue" class="btn btn-primary auth-submit">Continuar a la academia</button>' : `
            <form id="auth-route-form" class="auth-route-form">
              ${['login', 'register', 'forgot'].includes(mode) ? '<label for="auth-route-email">Correo electrónico</label><input id="auth-route-email" type="email" autocomplete="email" placeholder="nombre@correo.com" required>' : ''}
              ${mode === 'login' || mode === 'register' ? '<label for="auth-route-password">Contraseña</label><input id="auth-route-password" type="password" autocomplete="current-password" minlength="8" placeholder="Mínimo 8 caracteres" required>' : ''}
              ${mode === 'forgot' ? '' : ''}
              ${mode === 'register' ? '<label for="auth-route-confirm">Confirmar contraseña</label><input id="auth-route-confirm" type="password" autocomplete="new-password" minlength="8" placeholder="Repite tu contraseña" required>' : ''}
              ${mode === 'new-password' ? '<label for="auth-route-new-password">Nueva contraseña</label><input id="auth-route-new-password" type="password" autocomplete="new-password" minlength="8" placeholder="Mínimo 8 caracteres" required><label for="auth-route-confirm-new-password">Confirmar nueva contraseña</label><input id="auth-route-confirm-new-password" type="password" autocomplete="new-password" minlength="8" placeholder="Repite la contraseña" required>' : ''}
              <button class="btn btn-primary auth-submit" type="submit">${mode === 'login' ? 'Iniciar sesión' : mode === 'register' ? 'Crear mi cuenta' : mode === 'forgot' ? 'Enviar enlace de recuperación' : 'Guardar contraseña'}</button>
            </form>`}
          <div class="auth-links">
            ${mode === 'login' ? '<a href="#reset-password">¿Olvidaste tu contraseña?</a><span>¿Aún no tienes cuenta? <a href="#register">Regístrate</a></span>' : ''}
            ${mode === 'register' ? '<span>¿Ya tienes cuenta? <a href="#login">Inicia sesión</a></span>' : ''}
            ${mode === 'forgot' || mode === 'new-password' ? '<a href="#login">Volver al inicio de sesión</a>' : ''}
          </div>
          <p class="auth-privacy">Tus datos y tu progreso se sincronizan de forma privada con tu cuenta.</p>
        </div>
      </div>
    </section>`;

  container.querySelector('[data-auth-back]')?.addEventListener('click', (event) => { event.preventDefault(); navigate('dashboard'); });
  const feedback = container.querySelector('#auth-feedback');
  const setFeedback = (message, type = 'info') => {
    if (!feedback) return;
    feedback.textContent = safeMessage(message);
    feedback.dataset.type = type;
  };

  if (!supabaseConfigured || !supabase) {
    setFeedback('La conexión de cuentas todavía no está configurada. Puedes continuar en modo local.', 'warning');
    return;
  }

  if (mode === 'confirm') {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) setFeedback('No se pudo verificar la sesión. Vuelve a iniciar sesión.', 'error');
      else if (data.session) setFeedback('Correo confirmado. Tu cuenta está lista.', 'success');
      else setFeedback('Si acabas de registrarte, abre el enlace de confirmación enviado a tu correo.', 'info');
    });
    container.querySelector('#auth-continue')?.addEventListener('click', () => navigate('dashboard'));
    return;
  }

  container.querySelector('#auth-route-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector('button[type="submit"]');
    const email = form.querySelector('#auth-route-email')?.value.trim();
    button.disabled = true;
    setFeedback('Procesando solicitud…');
    try {
      if (mode === 'login') {
        const password = form.querySelector('#auth-route-password').value;
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setFeedback('Sesión iniciada. Redirigiendo…', 'success');
        navigate('dashboard');
      } else if (mode === 'register') {
        const password = form.querySelector('#auth-route-password').value;
        const confirm = form.querySelector('#auth-route-confirm').value;
        if (password !== confirm) throw new Error('Las contraseñas no coinciden.');
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${location.origin}/?auth=confirm` },
        });
        if (error) throw error;
        setFeedback(data.session ? 'Cuenta creada correctamente.' : 'Cuenta creada. Revisa tu correo y confirma el registro para continuar.', 'success');
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/?auth=recovery` });
        if (error) throw error;
        setFeedback('Si el correo está registrado, recibirás un enlace para recuperar tu acceso.', 'success');
      } else if (mode === 'new-password') {
        const password = form.querySelector('#auth-route-new-password').value;
        const confirm = form.querySelector('#auth-route-confirm-new-password').value;
        if (password !== confirm) throw new Error('Las contraseñas no coinciden.');
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setFeedback('Contraseña actualizada. Ya puedes iniciar sesión.', 'success');
        setTimeout(() => navigate('login'), 900);
      }
    } catch (error) {
      setFeedback(error.message || 'No se pudo completar la solicitud.', 'error');
    } finally {
      button.disabled = false;
    }
  });
}
