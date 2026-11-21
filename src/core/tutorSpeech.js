import { supabase, supabaseConfigured } from './supabase.js';

let activeAudio = null;
let activeObjectUrl = null;

export async function speakWithNeuralVoice(text, character = 'male', callbacks = {}) {
  if (!supabaseConfigured || !supabase) throw new Error('La voz neuronal requiere una cuenta conectada.');
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) throw new Error('Inicia sesión para activar la voz neuronal.');

  stopNeuralVoice();
  const response = await fetch('/api/tutor/tts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${data.session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: String(text).slice(0, 1800), character }),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || 'No se pudo generar la voz neuronal.');
  }

  const blob = await response.blob();
  activeObjectUrl = URL.createObjectURL(blob);
  activeAudio = new Audio(activeObjectUrl);
  activeAudio.preload = 'auto';
  activeAudio.onplay = () => callbacks.onStart?.();
  activeAudio.onended = () => {
    callbacks.onEnd?.();
    stopNeuralVoice();
  };
  activeAudio.onerror = () => {
    callbacks.onError?.();
    stopNeuralVoice();
  };
  await activeAudio.play();
  return true;
}

export function stopNeuralVoice() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.removeAttribute('src');
    activeAudio.load();
    activeAudio = null;
  }
  if (activeObjectUrl) {
    URL.revokeObjectURL(activeObjectUrl);
    activeObjectUrl = null;
  }
}
