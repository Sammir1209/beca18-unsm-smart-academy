import { supabase } from '../core/supabase.js';
import renderMathInElement from 'katex/contrib/auto-render';

const LIVE_URL = 'wss://ai-gateway.vercel.sh/v1/live/sessions';
const LIVE_MAX_MS = 5 * 60 * 1000;
const SAMPLE_RATE = 24000;
const FRAME_SAMPLES = 480;

const tutorNames = {
  male: 'Profe Alfredo',
  female: 'Profe Sofía',
};

const liveInstructions = (character) => {
  const name = tutorNames[character] || tutorNames.male;
  return [
    `Eres ${name}, un profesor particular que conversa en español peruano/latino natural.`,
    'Tu trabajo es enseñar, no solo dar respuestas. Escucha con atención, responde a lo que el estudiante realmente pregunta y mantén el hilo de la conversación.',
    'Explica con calma y con suficiente detalle. En matemáticas, desglosa el procedimiento paso a paso, verbaliza qué operación haces y por qué, y comprueba el resultado.',
    'Usa ejemplos sencillos relacionados con secundaria y preparación para Beca 18 y admisión UNSM. Ajusta la profundidad al nivel del estudiante.',
    'No inventes claves oficiales, fuentes, fechas ni datos institucionales. Si no sabes algo, dilo con honestidad.',
    'Si el estudiante está resolviendo una pregunta activa, primero guíalo con pistas; no reveles la clave hasta que la solicite o haya terminado su intento.',
    'Permite interrupciones naturales. No monopolices la conversación. Haz una pregunta breve para comprobar comprensión cuando sea oportuno.',
    'Pronuncia las expresiones matemáticas de forma comprensible. Cuando escribas texto, usa LaTeX válido delimitado con \\( ... \\) o \\[ ... \\].',
  ].join(' ');
};

function renderMath(target) {
  if (!target) return;
  try {
    renderMathInElement(target, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '\\[', right: '\\]', display: true },
        { left: '\\(', right: '\\)', display: false },
      ],
      throwOnError: false,
      strict: 'ignore',
      ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
    });
  } catch (error) {
    console.warn('No se pudo representar una fórmula del tutor:', error);
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]));
}

export function mountTutorChat(container, {
  getContext = () => '',
  onCharacterChange = () => {},
  onReadQuestion = () => {},
  onLiveState = () => {},
} = {}) {
  if (!container) return () => {};

  let character = localStorage.getItem('unsm-tutor-character') === 'female' ? 'female' : 'male';
  let messages = [];
  let socket = null;
  let mediaStream = null;
  let audioContext = null;
  let processor = null;
  let micSource = null;
  let silentGain = null;
  let sendTimer = null;
  let sessionTimer = null;
  let isStarting = false;
  let isLive = false;
  let isClosing = false;
  let sessionStartedAt = 0;
  let pendingSamples = new Int16Array(0);
  let outgoingFrames = [];
  let nextPlaybackTime = 0;
  let liveUserBubble = null;
  let liveAssistantBubble = null;
  let currentAudioSources = new Set();

  container.innerHTML = `
    <section class="tutor-chat-shell" aria-label="Asistente académico interactivo">
      <div class="tutor-character-picker" role="group" aria-label="Seleccionar profesor">
        <button type="button" class="tutor-character-option ${character === 'male' ? 'active' : ''}" data-character="male" aria-pressed="${character === 'male'}">
          <span class="tutor-character-avatar tutor-avatar-male">A</span>
          <span class="tutor-character-copy"><strong>Profe Alfredo</strong><small>Explicación y práctica</small></span>
          <span class="tutor-character-check" aria-hidden="true">✓</span>
        </button>
        <button type="button" class="tutor-character-option ${character === 'female' ? 'active' : ''}" data-character="female" aria-pressed="${character === 'female'}">
          <span class="tutor-character-avatar tutor-avatar-female">S</span>
          <span class="tutor-character-copy"><strong>Profe Sofía</strong><small>Guía y acompañamiento</small></span>
          <span class="tutor-character-check" aria-hidden="true">✓</span>
        </button>
      </div>

      <div class="tutor-live-panel">
        <div class="tutor-live-heading">
          <div>
            <span class="tutor-overline">AULA INTERACTIVA</span>
            <strong id="tutor-active-name">${tutorNames[character]}</strong>
          </div>
          <span class="tutor-status-pill" id="tutor-status-pill"><i></i><span id="tutor-status-text">Listo para conversar</span></span>
        </div>

        <div class="tutor-live-actions">
          <button type="button" class="tutor-live-button" id="tutor-live-start">
            <span class="tutor-live-button-icon">◉</span>
            <span><strong>Hablar en vivo</strong><small>Conversación natural por voz</small></span>
          </button>
          <button type="button" class="tutor-live-stop" id="tutor-live-stop" hidden aria-label="Finalizar conversación">■</button>
        </div>
        <div class="tutor-live-footnote">
          <span>Full dúplex · Puedes interrumpir y volver a hablar</span>
          <span>Máx. 5 min por sesión</span>
        </div>
      </div>

      <div class="tutor-conversation">
        <div class="tutor-conversation-head">
          <div><strong>Conversación</strong><span>Pregunta lo que necesites, sin limitarte a una alternativa</span></div>
          <button type="button" class="tutor-read-question" id="tutor-read-question" title="Leer la pregunta actual">Leer pregunta</button>
        </div>
        <div class="tutor-message-list" id="tutor-message-list" aria-live="polite">
          <div class="tutor-welcome-message">
            <span class="tutor-welcome-mark">✦</span>
            <div><strong>¡Hola! Soy ${tutorNames[character]}.</strong><p>Podemos resolver ejercicios, repasar temas o conversar sobre cualquier duda de tu preparación.</p></div>
          </div>
        </div>
        <div class="tutor-quick-prompts">
          <button type="button" data-prompt="Explícame esta pregunta paso a paso.">Explícame esta pregunta</button>
          <button type="button" data-prompt="Enséñame el tema desde cero con un ejemplo.">Enséñame desde cero</button>
          <button type="button" data-prompt="Hazme una pregunta para comprobar si entendí.">Ponme a prueba</button>
        </div>
        <form class="tutor-composer" id="tutor-chat-form">
          <textarea id="tutor-chat-input" rows="1" maxlength="1800" placeholder="Escribe tu duda o procedimiento…" aria-label="Escribe un mensaje para el tutor"></textarea>
          <button type="submit" id="tutor-chat-send" aria-label="Enviar mensaje">↑</button>
        </form>
        <div class="tutor-composer-hint"><span>Enter para enviar · Shift + Enter para nueva línea</span><span>Respuestas con fórmulas matemáticas</span></div>
      </div>
      <div class="tutor-cost-note">La voz en vivo utiliza AI Gateway y se factura por tiempo conectado (incluido el silencio). Tarifa de referencia: US$ 0.05/min.</div>
    </section>
  `;

  const $ = (selector) => container.querySelector(selector);
  const messageList = $('#tutor-message-list');
  const statusPill = $('#tutor-status-pill');
  const statusText = $('#tutor-status-text');
  const liveStartButton = $('#tutor-live-start');
  const liveStopButton = $('#tutor-live-stop');
  const chatInput = $('#tutor-chat-input');
  const chatSendButton = $('#tutor-chat-send');

  function setStatus(text, state = 'ready') {
    statusText.textContent = text;
    statusPill.dataset.state = state;
  }

  function addMessage(role, text) {
    const row = document.createElement('div');
    row.className = `tutor-message-row ${role === 'user' ? 'is-user' : 'is-assistant'}`;
    const bubble = document.createElement('div');
    bubble.className = 'tutor-message-bubble';
    bubble.textContent = text;
    row.appendChild(bubble);
    messageList.appendChild(row);
    messageList.scrollTop = messageList.scrollHeight;
    renderMath(bubble);
    return bubble;
  }

  function updateLiveBubble(role, delta) {
    if (role === 'user') {
      if (!liveUserBubble) liveUserBubble = addMessage('user', '');
      liveUserBubble.textContent += delta;
      renderMath(liveUserBubble);
    } else {
      if (!liveAssistantBubble) liveAssistantBubble = addMessage('assistant', '');
      liveAssistantBubble.textContent += delta;
      renderMath(liveAssistantBubble);
    }
    messageList.scrollTop = messageList.scrollHeight;
  }

  function finalizeLiveTurn() {
    liveUserBubble = null;
    liveAssistantBubble = null;
  }

  function getContextText() {
    const value = getContext();
    return typeof value === 'string' ? value.slice(0, 3500) : JSON.stringify(value || {}).slice(0, 3500);
  }

  async function getAccessToken() {
    if (!supabase) throw new Error('La autenticación no está configurada.');
    const { data, error } = await supabase.auth.getSession();
    if (error || !data?.session?.access_token) throw new Error('Inicia sesión para conversar con tu tutor.');
    return data.session.access_token;
  }

  async function sendText(text) {
    const clean = String(text || '').trim();
    if (!clean || isStarting) return;
    const userMessage = { role: 'user', content: clean };
    messages.push(userMessage);
    addMessage('user', clean);
    chatInput.value = '';
    chatSendButton.disabled = true;
    setStatus('El tutor está pensando…', 'thinking');

    try {
      const token = await getAccessToken();
      const response = await fetch('/api/tutor/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: messages.slice(-10),
          context: getContextText(),
          character,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'No se pudo enviar el mensaje.');
      messages.push({ role: 'assistant', content: data.answer });
      addMessage('assistant', data.answer);
      setStatus('Listo para continuar', 'ready');
    } catch (error) {
      messages.pop();
      addMessage('assistant', error.message || 'No se pudo conectar con el tutor.');
      setStatus('No se pudo conectar', 'error');
    } finally {
      chatSendButton.disabled = false;
      chatInput.focus();
    }
  }

  function encodeBase64(bytes) {
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
  }

  function resampleTo24k(floatSamples, inputRate) {
    if (inputRate === SAMPLE_RATE) return floatSamples;
    const ratio = inputRate / SAMPLE_RATE;
    const outputLength = Math.floor(floatSamples.length / ratio);
    const output = new Float32Array(outputLength);
    for (let i = 0; i < outputLength; i += 1) {
      const position = i * ratio;
      const left = Math.floor(position);
      const right = Math.min(left + 1, floatSamples.length - 1);
      const weight = position - left;
      output[i] = floatSamples[left] * (1 - weight) + floatSamples[right] * weight;
    }
    return output;
  }

  function floatToPcm16(floatSamples) {
    const output = new Int16Array(floatSamples.length);
    for (let i = 0; i < floatSamples.length; i += 1) {
      const sample = Math.max(-1, Math.min(1, floatSamples[i]));
      output[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }
    return output;
  }

  function appendMicSamples(floatSamples) {
    const converted = floatToPcm16(resampleTo24k(floatSamples, audioContext.sampleRate));
    const merged = new Int16Array(pendingSamples.length + converted.length);
    merged.set(pendingSamples, 0);
    merged.set(converted, pendingSamples.length);
    pendingSamples = merged;
    while (pendingSamples.length >= FRAME_SAMPLES) {
      outgoingFrames.push(encodeBase64(new Uint8Array(pendingSamples.buffer, pendingSamples.byteOffset, FRAME_SAMPLES * 2)));
      pendingSamples = pendingSamples.slice(FRAME_SAMPLES);
    }
  }

  function startMicrophonePump() {
    processor = audioContext.createScriptProcessor(2048, 1, 1);
    micSource = audioContext.createMediaStreamSource(mediaStream);
    silentGain = audioContext.createGain();
    silentGain.gain.value = 0;
    processor.onaudioprocess = (event) => {
      if (!isLive || isClosing) return;
      appendMicSamples(event.inputBuffer.getChannelData(0));
    };
    micSource.connect(processor);
    processor.connect(silentGain);
    silentGain.connect(audioContext.destination);
    sendTimer = window.setInterval(() => {
      if (!isLive || isClosing || socket?.readyState !== WebSocket.OPEN) return;
      const frame = outgoingFrames.shift();
      if (frame) socket.send(JSON.stringify({ type: 'session.input_audio.append', audio: frame }));
    }, 20);
  }

  function playPcmChunk(base64Audio) {
    if (!audioContext || !base64Audio) return;
    const binary = atob(base64Audio);
    const samples = new Int16Array(Math.floor(binary.length / 2));
    const view = new DataView(new ArrayBuffer(samples.length * 2));
    for (let i = 0; i < samples.length; i += 1) {
      view.setInt16(i * 2, binary.charCodeAt(i * 2) | (binary.charCodeAt(i * 2 + 1) << 8), true);
    }
    for (let i = 0; i < samples.length; i += 1) {
      samples[i] = view.getInt16(i * 2, true);
    }
    const audioBuffer = audioContext.createBuffer(1, samples.length, SAMPLE_RATE);
    const channel = audioBuffer.getChannelData(0);
    for (let i = 0; i < samples.length; i += 1) channel[i] = samples[i] / 32768;
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    const startAt = Math.max(audioContext.currentTime + 0.015, nextPlaybackTime);
    nextPlaybackTime = startAt + audioBuffer.duration;
    currentAudioSources.add(source);
    source.onended = () => currentAudioSources.delete(source);
    source.start(startAt);
  }

  function stopAudioGraph() {
    if (sendTimer) window.clearInterval(sendTimer);
    sendTimer = null;
    if (processor) {
      processor.onaudioprocess = null;
      try { processor.disconnect(); } catch {}
    }
    if (micSource) { try { micSource.disconnect(); } catch {} }
    if (silentGain) { try { silentGain.disconnect(); } catch {} }
    processor = null;
    micSource = null;
    silentGain = null;
    if (mediaStream) mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
    currentAudioSources.forEach((source) => { try { source.stop(); } catch {} });
    currentAudioSources.clear();
    if (audioContext) {
      const context = audioContext;
      audioContext = null;
      context.close().catch(() => {});
    }
    pendingSamples = new Int16Array(0);
    outgoingFrames = [];
    nextPlaybackTime = 0;
  }

  function finishLive(message = 'Conversación finalizada', state = 'ready') {
    if (sessionTimer) window.clearTimeout(sessionTimer);
    sessionTimer = null;
    isLive = false;
    isStarting = false;
    isClosing = true;
    stopAudioGraph();
    liveStartButton.hidden = false;
    liveStartButton.disabled = false;
    liveStopButton.hidden = true;
    onLiveState({ isListening: false, isSpeaking: false });
    setStatus(message, state);
    if (socket && socket.readyState === WebSocket.OPEN) {
      try { socket.send(JSON.stringify({ type: 'session.close' })); } catch {}
      window.setTimeout(() => {
        if (socket?.readyState === WebSocket.OPEN) socket.close();
      }, 4500);
    } else if (socket && socket.readyState !== WebSocket.CLOSED) {
      socket.close();
    }
    socket = null;
    finalizeLiveTurn();
  }

  async function startLive() {
    if (isStarting || isLive) return;
    isStarting = true;
    isClosing = false;
    liveStartButton.disabled = true;
    setStatus('Solicitando micrófono…', 'connecting');

    try {
      const token = await getAccessToken();
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Este navegador no permite acceder al micrófono. Abre UNSM Academy en Chrome con HTTPS.');
      }
      mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: false,
      });
      const tokenResponse = await fetch('/api/tutor/live-token', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const tokenData = await tokenResponse.json().catch(() => ({}));
      if (!tokenResponse.ok) throw new Error(tokenData.error || 'No se pudo abrir la sesión de voz.');
      if (Date.now() >= tokenData.expiresAt * 1000) throw new Error('El token de voz expiró. Vuelve a intentarlo.');

      audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SAMPLE_RATE });
      await audioContext.resume();
      socket = new WebSocket(LIVE_URL, [
        'ai-gateway-realtime.v1',
        `ai-gateway-auth.${tokenData.token}`,
      ]);

      socket.addEventListener('open', () => {
        socket.send(JSON.stringify({
          type: 'session.start',
          session: {
            model: 'openai/gpt-live-1',
            store: false,
            delegation: { type: 'client' },
            audio: {
              format: { type: 'audio/pcm', rate: SAMPLE_RATE },
              output: { voice: character === 'female' ? 'marin' : 'cedar' },
            },
            instructions: liveInstructions(character),
          },
        }));
      });

      socket.addEventListener('message', (messageEvent) => {
        let event;
        try { event = JSON.parse(messageEvent.data); } catch { return; }
        switch (event.type) {
          case 'session.started':
            isStarting = false;
            isLive = true;
            sessionStartedAt = Date.now();
            liveStartButton.hidden = true;
            liveStartButton.disabled = false;
            liveStopButton.hidden = false;
            setStatus('Te escucho. Habla con naturalidad.', 'live');
            startMicrophonePump();
            socket.send(JSON.stringify({
              type: 'session.thinking.append',
              delegation_id: null,
              content: `Contexto académico de la pantalla actual: ${getContextText()}. Si el estudiante está viendo una pregunta activa, úsala como referencia. No des la clave si aún no ha enviado su respuesta.`,
            }));
            onLiveState({ isListening: true, isSpeaking: false });
            sessionTimer = window.setTimeout(() => {
              finishLive('Sesión de 5 minutos finalizada automáticamente', 'ready');
            }, LIVE_MAX_MS);
            break;
          case 'session.input_transcript.delta':
            if (event.delta) updateLiveBubble('user', event.delta);
            onLiveState({ isListening: true, isSpeaking: false });
            break;
          case 'session.output_transcript.delta':
            if (event.delta) updateLiveBubble('assistant', event.delta);
            onLiveState({ isListening: false, isSpeaking: true });
            break;
          case 'session.output_audio.delta':
            if (event.delta) playPcmChunk(event.delta);
            break;
          case 'session.output_audio.done':
            onLiveState({ isListening: true, isSpeaking: false });
            break;
          case 'session.input_transcript.done':
            liveUserBubble = null;
            break;
          case 'session.output_transcript.done':
            liveAssistantBubble = null;
            break;
          case 'session.usage.updated': {
            const seconds = Number(event.usage?.seconds || 0);
            const cost = (seconds / 60) * 0.05;
            setStatus(`En vivo · ${Math.ceil(seconds)} s · aprox. $${cost.toFixed(3)}`, 'live');
            break;
          }
          case 'session.closed': {
            const seconds = Number(event.usage?.seconds || 0);
            const cost = (seconds / 60) * 0.05;
            finishLive(`Sesión cerrada · ${Math.ceil(seconds)} s · aprox. $${cost.toFixed(3)}`, 'ready');
            break;
          }
          case 'error':
            console.error('GPT Live error:', event.error);
            finishLive(event.error?.message || 'La sesión de voz encontró un error.', 'error');
            break;
          default:
            break;
        }
      });

      socket.addEventListener('error', () => {
        finishLive('No se pudo establecer la conexión de voz.', 'error');
      });
      socket.addEventListener('close', () => {
        if (isLive || isStarting) finishLive('La conexión de voz se cerró.', 'error');
      });
    } catch (error) {
      stopAudioGraph();
      isStarting = false;
      isLive = false;
      liveStartButton.hidden = false;
      liveStartButton.disabled = false;
      liveStopButton.hidden = true;
      setStatus(error.message || 'No se pudo iniciar la conversación.', 'error');
    }
  }

  function stopLive() {
    if (!isLive && !isStarting) return;
    finishLive('Cerrando conversación…', 'ready');
  }

  container.querySelectorAll('[data-character]').forEach((button) => {
    button.addEventListener('click', () => {
      if (isLive || isStarting) stopLive();
      character = button.dataset.character === 'female' ? 'female' : 'male';
      localStorage.setItem('unsm-tutor-character', character);
      container.querySelectorAll('[data-character]').forEach((item) => {
        const active = item.dataset.character === character;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      $('#tutor-active-name').textContent = tutorNames[character];
      onCharacterChange(character);
      setStatus(`${tutorNames[character]} está listo para ayudarte.`, 'ready');
    });
  });

  liveStartButton.addEventListener('click', startLive);
  liveStopButton.addEventListener('click', stopLive);
  $('#tutor-read-question').addEventListener('click', onReadQuestion);

  $('#tutor-chat-form').addEventListener('submit', (event) => {
    event.preventDefault();
    sendText(chatInput.value);
  });

  chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendText(chatInput.value);
    }
  });

  container.querySelectorAll('[data-prompt]').forEach((button) => {
    button.addEventListener('click', () => sendText(button.dataset.prompt));
  });

  const onVisibilityChange = () => {
    if (document.hidden && (isLive || isStarting)) stopLive();
  };
  document.addEventListener('visibilitychange', onVisibilityChange);
  const onPageHide = () => stopLive();
  window.addEventListener('pagehide', onPageHide);

  return () => {
    stopLive();
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('pagehide', onPageHide);
    container.replaceChildren();
  };
}
