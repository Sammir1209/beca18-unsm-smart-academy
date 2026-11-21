import { supabase, supabaseConfigured } from '../core/supabase.js';

const safeMessage = (value) => String(value || '').replace(/[<>]/g, '');
let altchaModulesPromise;

async function loadAltchaSolver() {
  if (!altchaModulesPromise) {
    altchaModulesPromise = Promise.all([
      import('https://esm.sh/altcha-lib@2.10.0'),
      import('https://esm.sh/altcha-lib@2.10.0/algorithms/pbkdf2'),
    ]).then(([library, algorithms]) => ({
      solveChallenge: library.solveChallenge,
      deriveKey: algorithms.deriveKey,
    }));
  }
  return altchaModulesPromise;
}

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
            ${mode === 'register' ? `
              <label for="auth-route-confirm">Confirmar contraseña</label>
              <input id="auth-route-confirm" type="password" autocomplete="new-password" minlength="8" placeholder="Repite tu contraseña" required>
              <section class="pei-captcha" aria-labelledby="pei-captcha-title">
                <div class="pei-captcha-heading">
                  <span class="pei-captcha-mark" aria-hidden="true">P</span>
                  <div><strong id="pei-captcha-title">Verificación de seguridad</strong><small>PRE - EINSTEIN Verify · Protección propia</small></div>
                  <span class="pei-captcha-lock" aria-hidden="true">⌑</span>
                </div>
                <p class="pei-captcha-copy">Vamos a comprobar que tu navegador puede completar una pequeña prueba de seguridad. No necesitas seleccionar imágenes.</p>
                <div class="pei-captcha-status" id="pei-captcha-status" role="status" aria-live="polite">Preparando verificación…</div>
                <button class="pei-captcha-button" id="pei-captcha-start" type="button">Verificar mi navegador</button>
                <div class="pei-captcha-foot"><span class="pei-captcha-dot"></span> Verificación privada · Sin anuncios · Sin servicios CAPTCHA externos</div>
              </section>
            ` : ''}
            <button class="btn btn-primary auth-submit" type="submit" ${mode === 'register' ? 'disabled' : ''}>${mode === 'login' ? 'Iniciar sesión' : 'Crear mi cuenta'}</button>
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

  const form = container.querySelector('#auth-route-form');
  const submitButton = form?.querySelector('button[type="submit"]');
  const captchaButton = container.querySelector('#pei-captcha-start');
  const captchaStatus = container.querySelector('#pei-captcha-status');
  let captchaProof = '';
  let captchaProofExpiresAt = 0;
  let captchaBusy = false;

  const setCaptchaStatus = (message, state = 'idle') => {
    if (!captchaStatus) return;
    captchaStatus.textContent = message;
    captchaStatus.dataset.state = state;
  };

  const resetCaptcha = () => {
    captchaProof = '';
    captchaProofExpiresAt = 0;
    if (submitButton && mode === 'register') submitButton.disabled = true;
  };

  const verifyBrowser = async () => {
    if (captchaBusy || mode !== 'register' || !supabase) return;
    captchaBusy = true;
    resetCaptcha();
    captchaButton.disabled = true;
    captchaButton.textContent = 'Verificando…';
    setCaptchaStatus('Preparando un desafío criptográfico seguro…', 'working');

    try {
      const { data: issued, error: issueError } = await supabase.functions.invoke('captcha-challenge', { body: { purpose: 'signup' } });
      if (issueError || !issued?.challenge || !issued?.challengeId) throw new Error('No se pudo iniciar la verificación. Intenta nuevamente.');

      setCaptchaStatus('Comprobando tu navegador. Esto puede tardar unos segundos…', 'working');
      const { solveChallenge, deriveKey } = await loadAltchaSolver();
      const solution = await solveChallenge({
        challenge: issued.challenge,
        deriveKey,
        timeout: 60000,
      });
      if (!solution) throw new Error('La verificación tardó demasiado. Vuelve a intentarlo.');

      const { data: verified, error: verifyError } = await supabase.functions.invoke('captcha-verify', {
        body: { challengeId: issued.challengeId, challenge: issued.challenge, solution },
      });
      if (verifyError || !verified?.verified || !verified?.proofToken) throw new Error('No se pudo validar la prueba. Genera una nueva verificación.');

      captchaProof = verified.proofToken;
      captchaProofExpiresAt = new Date(verified.expiresAt).getTime();
      if (!Number.isFinite(captchaProofExpiresAt) || captchaProofExpiresAt <= Date.now()) throw new Error('La verificación ya venció. Inténtalo otra vez.');
      setCaptchaStatus('Navegador verificado. Ya puedes crear tu cuenta.', 'success');
      captchaButton.textContent = 'Verificación completada';
      if (submitButton) submitButton.disabled = false;
    } catch (error) {
      resetCaptcha();
      setCaptchaStatus(error?.message || 'No se pudo completar la verificación. Inténtalo nuevamente.', 'error');
      captchaButton.textContent = 'Reintentar verificación';
    } finally {
      captchaBusy = false;
      captchaButton.disabled = Boolean(captchaProof);
    }
  };

  if (mode === 'register') {
    captchaButton?.addEventListener('click', verifyBrowser);
    if (!supabaseConfigured || !supabase) {
      setFeedback('La conexión de cuentas todavía no está configurada. El registro requiere conexión segura.', 'warning');
      setCaptchaStatus('La verificación estará disponible cuando se configure Supabase.', 'error');
      if (captchaButton) captchaButton.disabled = true;
    } else {
      setCaptchaStatus('Listo para verificar tu navegador.', 'idle');
    }
  }

  if (!supabaseConfigured || !supabase) {
    if (mode === 'login') setFeedback('La conexión de cuentas todavía no está configurada. Puedes continuar en modo local.', 'warning');
    return;
  }

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const activeForm = event.currentTarget;
    const button = activeForm.querySelector('button[type="submit"]');
    const email = activeForm.querySelector('#auth-route-email').value.trim();
    const password = activeForm.querySelector('#auth-route-password').value;
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

      const fullName = activeForm.querySelector('#auth-route-name').value.trim();
      const confirm = activeForm.querySelector('#auth-route-confirm').value;
      if (fullName.length < 2) throw new Error('Escribe tu nombre completo.');
      if (password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');
      if (password !== confirm) throw new Error('Las contraseñas no coinciden.');
      if (!captchaProof || captchaProofExpiresAt <= Date.now()) throw new Error('Completa nuevamente la verificación de seguridad.');

      const oneTimeProof = captchaProof;
      resetCaptcha();
      setCaptchaStatus('Usando la verificación de un solo uso…', 'working');

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, pre_einstein_captcha_proof: oneTimeProof } },
      });
      if (error) throw error;

      if (data.session) {
        setFeedback('Cuenta creada correctamente.', 'success');
        navigate('dashboard');
      } else {
        setFeedback('Cuenta creada. Revisa tu correo y confirma la dirección; después podrás iniciar sesión.', 'success');
      }
    } catch (error) {
      const message = error?.message || 'No se pudo completar la solicitud.';
      setFeedback(message, 'error');
      if (mode === 'register') {
        resetCaptcha();
        setCaptchaStatus('Necesitas una nueva verificación para volver a intentarlo.', 'error');
        if (captchaButton) {
          captchaButton.disabled = false;
          captchaButton.textContent = 'Reintentar verificación';
        }
      }
    } finally {
      if (mode === 'login') button.disabled = false;
      else button.disabled = !captchaProof || captchaProofExpiresAt <= Date.now();
    }
  });
}
