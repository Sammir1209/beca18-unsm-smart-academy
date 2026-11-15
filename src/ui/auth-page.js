import { supabase, supabaseConfigured } from '../core/supabase.js';

const safeMessage = (value) => String(value || '').replace(/[<>]/g, '');

export function renderAuthPage(container, route, navigate) {
  if (!container) return;
  const mode = route === 'register' ? 'register' : 'login';
  const title = mode === 'register' ? 'Crea tu cuenta' : 'Qué bueno verte de nuevo';
  const subtitle = mode === 'register'
    ? 'Regístrate y guarda tu avance para continuar estudiando desde otros dispositivos.'
    : 'Inicia sesión y continúa tu preparación para la UNSM y Beca 18.';

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
          <form id="auth-route-form" class="auth-route-form">
            ${mode === 'register' ? '<label for="auth-route-name">Nombre completo</label><input id="auth-route-name" type="text" autocomplete="name" maxlength="80" placeholder="Ej. María López" required>' : ''}
            <label for="auth-route-email">Correo electrónico</label>
            <input id="auth-route-email" type="email" autocomplete="email" placeholder="nombre@correo.com" required>
            <label for="auth-route-password">Contraseña</label>
            <input id="auth-route-password" type="password" autocomplete="${mode === 'register' ? 'new-password' : 'current-password'}" minlength="8" placeholder="Mínimo 8 caracteres" required>
            ${mode === 'register' ? '<label for="auth-route-confirm">Confirmar contraseña</label><input id="auth-route-confirm" type="password" autocomplete="new-password" minlength="8" placeholder="Repite tu contraseña" required>' : ''}
            <button class="btn btn-primary auth-submit" type="submit">${mode === 'login' ? 'Iniciar sesión' : 'Crear mi cuenta'}</button>
          </form>
          <div class="auth-links">
            ${mode === 'login' ? '<span>¿Aún no tienes cuenta? <a href="#register">Regístrate</a></span>' : '<span>¿Ya tienes cuenta? <a href="#login">Inicia sesión</a></span>'}
          </div>
          <p class="auth-privacy">Tus datos y tu progreso se sincronizan de forma privada con tu cuenta.</p>
        </div>
      </div>
    </section>`;

  container.querySelector('[data-auth-back]')?.addEventListener('click', (event) => {
    event.preventDefault();
    navigate('dashboard');
  });

  const feedback = container.querySelector('#auth-feedback');
  const setFeedback = (message, type = 'info') => {
    feedback.textContent = safeMessage(message);
    feedback.dataset.type = type;
  };

  if (!supabaseConfigured || !supabase) {
    setFeedback('La conexión de cuentas todavía no está configurada. Puedes continuar en modo local.', 'warning');
    return;
  }

  container.querySelector('#auth-route-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector('button[type="submit"]');
    const email = form.querySelector('#auth-route-email').value.trim();
    const password = form.querySelector('#auth-route-password').value;
    button.disabled = true;
    setFeedback(mode === 'login' ? 'Iniciando sesión…' : 'Creando cuenta…');

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setFeedback('Sesión iniciada correctamente.', 'success');
        navigate('dashboard');
        return;
      }

      const confirm = form.querySelector('#auth-route-confirm').value;
      if (password !== confirm) throw new Error('Las contraseñas no coinciden.');

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: form.querySelector('#auth-route-name').value.trim() } },
      });
      if (error) throw error;

      if (data.session) {
        setFeedback('Cuenta creada correctamente.', 'success');
        navigate('dashboard');
      } else {
        setFeedback('Supabase todavía está exigiendo confirmación de correo. Desactiva “Confirm email” en Authentication → Providers → Email para habilitar el registro directo.', 'error');
      }
    } catch (error) {
      const message = error?.message || 'No se pudo completar la solicitud.';
      setFeedback(message, 'error');
    } finally {
      button.disabled = false;
    }
  });
}
