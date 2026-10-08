// ==========================================================================
// VOICE TUTOR ENGINE: Voces de Perú/Latinoamérica, Parada Inmediata y Permisos Móvil
// ==========================================================================

export class VoiceTutorEngine {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.recognition = null;
    this.isListening = false;
    this.isSpeaking = false;
    this.availableVoices = [];
    this.selectedVoice = null;
    this.rate = 1.0;
    this.pitch = 1.05;
    this.avatar = null;
    this.onTranscriptCallback = null;
    this.onStateChangeCallback = null;
    this.onVoicesReadyCallback = null;

    this.initRecognition();
    this.initVoices();
  }

  attachAvatar(avatarInstance) {
    this.avatar = avatarInstance;
  }

  initVoices() {
    if (!this.synth) return;

    const loadVoices = () => {
      const all = this.synth.getVoices();
      if (!all || all.length === 0) return;

      // Filtrar voces en español disponibles en el sistema y navegador móvil
      this.availableVoices = all.filter(v => v.lang.startsWith('es') || v.lang.includes('Spanish'));

      // Ordenar priorizando:
      // 1. Perú (es-PE o que contenga 'Peru' o 'Perú')
      // 2. Latinoamericanas amigables (es-419, es-MX, es-CO, etc.)
      // 3. Voces Neurales / Naturales en español
      this.availableVoices.sort((a, b) => {
        const getScore = (v) => {
          const name = (v.name || '').toLowerCase();
          const lang = (v.lang || '').toLowerCase();
          if (lang === 'es-pe' || name.includes('peru') || name.includes('perú')) return 100;
          if (lang === 'es-419' || name.includes('latin') || name.includes('sabina') || name.includes('paulina') || name.includes('camila')) return 80;
          if (name.includes('natural') || name.includes('neural') || name.includes('online')) return 70;
          if (name.includes('google') && lang.startsWith('es')) return 60;
          if (lang === 'es-mx' || lang === 'es-co' || lang === 'es-cl' || lang === 'es-ar' || lang === 'es-us') return 50;
          if (lang.startsWith('es')) return 30;
          return 1;
        };
        return getScore(b) - getScore(a);
      });

      // Si no hay voz explícita de Perú en el sistema, etiquetar visualmente las voces amigables
      if (this.availableVoices.length > 0 && !this.selectedVoice) {
        this.selectedVoice = this.availableVoices[0];
      }

      if (this.onVoicesReadyCallback) {
        this.onVoicesReadyCallback(this.availableVoices);
      }
    };

    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
    loadVoices();
  }

  setVoiceByName(name) {
    const found = this.availableVoices.find(v => v.name === name);
    if (found) {
      this.selectedVoice = found;
    }
  }

  setPitch(val) {
    this.pitch = parseFloat(val);
  }

  setRate(val) {
    this.rate = parseFloat(val);
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition no disponible nativamente.');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'es-PE'; // Español Perú
    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.avatar) this.avatar.setListening(true);
      if (this.onStateChangeCallback) this.onStateChangeCallback({ isListening: true });
    };

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (this.onTranscriptCallback) {
        this.onTranscriptCallback(transcript);
      }
    };

    this.recognition.onerror = (event) => {
      console.warn('Voice recognition error:', event.error);
      this.isListening = false;
      if (this.avatar) this.avatar.setListening(false);
      if (this.onStateChangeCallback) this.onStateChangeCallback({ isListening: false });
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.avatar) this.avatar.setListening(false);
      if (this.onStateChangeCallback) this.onStateChangeCallback({ isListening: false });
    };
  }

  // Solicitar explícitamente permisos de micrófono en celulares
  async requestMicrophonePermission() {
    // 1. Si navigator.mediaDevices está disponible (HTTPS o localhost)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        return true;
      } catch (err) {
        console.warn('Permiso de micrófono denegado:', err);
        return false;
      }
    }
    
    // 2. En celulares entrando por IP HTTP local (ej: http://192.168.1.5:5173),
    // navegadores como Chrome deshabilitan navigator.mediaDevices por política de seguridad,
    // pero el objeto SpeechRecognition (webkitSpeechRecognition) aún puede solicitar el permiso directo al activarse.
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      return true;
    }

    return false;
  }

  // Comprobar estado o solicitar con mensaje claro de ayuda para móvil
  async promptPermissionOnMobile() {
    const isHttpsOrLocalhost = window.location.protocol === 'https:' || 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1';

    if (!isHttpsOrLocalhost) {
      return {
        ok: false,
        isHttpIp: true,
        message: `⚠️ Estás entrando por HTTP (${window.location.hostname}). Los navegadores móviles bloquean el micrófono en IPs locales sin SSL.\n\n👉 SOLUCIÓN FÁCIL EN CELULAR:\n1. Abre en Chrome en tu celular: chrome://flags\n2. Busca: "unsafely-treat-insecure-origin-as-secure"\n3. Actívalo y agrega: ${window.location.origin}\n4. Reinicia Chrome.\n\nO prueba presionando directamente "Dictar Clave".`
      };
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        return { ok: true, message: 'Permiso de micrófono concedido exitosamente.' };
      } catch (e) {
        return { 
          ok: false, 
          message: 'Permiso denegado. Para activar en celular: toca el icono de configuración/candado al lado del link y permite "Micrófono".' 
        };
      }
    }

    return { 
      ok: true, 
      message: 'Reconocimiento de voz listo en tu dispositivo.' 
    };
  }

  cleanTextForNaturalSpeech(text) {
    return text
      .replace(/x²/g, 'x al cuadrado')
      .replace(/x³/g, 'x al cubo')
      .replace(/x⁴/g, 'x a la cuarta')
      .replace(/√/g, 'raíz cuadrada de ')
      .replace(/Δ/g, 'discriminante ')
      .replace(/S\/\s*(\d+)/g, '$1 soles')
      .replace(/g\s*=\s*10\s*m\/s²/gi, 'gravedad igual a diez metros por segundo al cuadrado')
      .replace(/km\/h/gi, 'kilómetros por hora')
      .replace(/m\/s/gi, 'metros por segundo')
      .replace(/d\.C\./gi, 'después de Cristo')
      .replace(/a\.C\./gi, 'antes de Cristo')
      .replace(/::/g, 'es a')
      .replace(/:/g, 'es a')
      .replace(/=>/g, 'por lo tanto')
      .replace(/\*/g, 'por')
      .replace(/Paso\s*(\d+):/gi, 'Paso número $1. ')
      .replace(/[⭐✓✕💡⚠️]/g, '');
  }

  speak(text, onEnd) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    this.stopSpeaking(); // Parar de inmediato si ya estaba hablando

    const naturalText = this.cleanTextForNaturalSpeech(text);
    const utterance = new SpeechSynthesisUtterance(naturalText);
    
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    
    utterance.lang = this.selectedVoice ? this.selectedVoice.lang : 'es-PE';
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (this.avatar) this.avatar.setSpeaking(true);
      if (this.onStateChangeCallback) this.onStateChangeCallback({ isSpeaking: true });
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (this.avatar) this.avatar.setSpeaking(false);
      if (this.onStateChangeCallback) this.onStateChangeCallback({ isSpeaking: false });
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      if (this.avatar) this.avatar.setSpeaking(false);
      if (this.onStateChangeCallback) this.onStateChangeCallback({ isSpeaking: false });
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  // Parar inmediatamente cualquier locución en curso
  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    if (this.avatar) this.avatar.setSpeaking(false);
    if (this.onStateChangeCallback) this.onStateChangeCallback({ isSpeaking: false });
  }

  async listen(onTranscript) {
    // Si estaba hablando, callar a la IA antes de escuchar
    this.stopSpeaking();

    if (!this.recognition) {
      alert('Tu navegador no cuenta con reconocimiento de voz (SpeechRecognition). En celulares se recomienda Google Chrome.');
      return;
    }

    // 1. Intentar asegurar permiso si el navegador lo permite
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const hasPermission = await this.requestMicrophonePermission();
      if (!hasPermission) {
        alert('Por favor autoriza el permiso de micrófono en tu navegador para responder por voz.');
        return;
      }
    }

    this.onTranscriptCallback = onTranscript;
    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Reconocimiento ya en ejecución o reiniciando...');
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
    this.isListening = false;
    if (this.avatar) this.avatar.setListening(false);
    if (this.onStateChangeCallback) this.onStateChangeCallback({ isListening: false });
  }
}

export const voiceTutor = new VoiceTutorEngine();
