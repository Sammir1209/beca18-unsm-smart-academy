// ==========================================================================
// VIEW: PRACTICA ADAPTATIVA CON TUTOR 3D Y SELECTOR DE VOCES AMIGABLES
// ==========================================================================

import { repo } from '../core/repository.js';
import { RecommendationEngine } from '../core/recommendation.js';
import { voiceTutor } from '../core/voiceTutor.js';
import { Avatar3D } from './avatar3d.js';
import { icon } from './icons.js';

export function renderPractice(container, navigateTo) {
  let activeFilterInstitution = 'ALL';
  let activeFilterSubject = 'ALL';
  let activeFilterOnlyFijas = false;

  let currentIndex = 0;
  let selectedOption = null;
  let hasSubmitted = false;
  let wasDoubtMode = false;
  let voiceStatusText = '';
  let avatarInstance = null;

  function getFilteredQuestions() {
    return repo.questions.filter(q => {
      if (activeFilterInstitution !== 'ALL' && q.institution !== activeFilterInstitution) return false;
      if (activeFilterSubject !== 'ALL' && q.subject !== activeFilterSubject) return false;
      if (activeFilterOnlyFijas && !q.isFija) return false;
      return true;
    });
  }

  function renderView() {
    const questions = getFilteredQuestions();

    container.innerHTML = `
      <div class="practice-layout" style="display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap;">
        
        <!-- COLUMNA PRINCIPAL DE PREGUNTAS (IZQUIERDA) -->
        <div style="flex: 1; min-width: 320px;" class="question-container">
          
          <!-- Barra de Filtros de Banco (Fijas, Institución, Cursos) -->
          <div class="card" style="padding: 16px 20px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
              <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-dim); text-transform: uppercase; display: flex; align-items: center; gap: 6px;">
                  ${icon('filter', { size: 14, color: 'var(--text-dim)' })} Filtrar:
                </span>
                
                <button class="btn btn-sm ${activeFilterInstitution === 'ALL' ? 'btn-primary' : 'btn-secondary'}" id="filter-inst-all">
                  Todas (${repo.questions.length})
                </button>
                <button class="btn btn-sm ${activeFilterInstitution === 'PRONABEC' ? 'btn-beca' : 'btn-secondary'}" id="filter-inst-beca">
                  Beca 18
                </button>
                <button class="btn btn-sm ${activeFilterInstitution === 'UNSM' ? 'btn-primary' : 'btn-secondary'}" id="filter-inst-unsm">
                  UNSM
                </button>
              </div>

              <div style="display: flex; gap: 10px; align-items: center;">
                <button class="btn btn-sm ${activeFilterOnlyFijas ? 'btn-beca' : 'btn-secondary'}" id="filter-toggle-fijas" style="border: 1px solid var(--accent-alert); display: flex; align-items: center; gap: 6px;">
                  ${icon('star', { size: 14, color: activeFilterOnlyFijas ? '#064E3B' : 'var(--accent-alert)' })}
                  Solo Fijas
                </button>

                <select id="select-subject-filter" style="background-color: var(--bg-input); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 6px 12px; border-radius: var(--radius-md); font-size: 0.85rem;">
                  <option value="ALL">Todos los Cursos</option>
                  <option value="Aritmetica" ${activeFilterSubject === 'Aritmetica' ? 'selected' : ''}>Aritmética</option>
                  <option value="Algebra" ${activeFilterSubject === 'Algebra' ? 'selected' : ''}>Álgebra</option>
                  <option value="Geometria" ${activeFilterSubject === 'Geometria' ? 'selected' : ''}>Geometría</option>
                  <option value="Razonamiento Matematico" ${activeFilterSubject === 'Razonamiento Matematico' ? 'selected' : ''}>Razonamiento Matemático (RM)</option>
                  <option value="Comprension Lectora" ${activeFilterSubject === 'Comprension Lectora' ? 'selected' : ''}>Comprensión Lectora</option>
                  <option value="Razonamiento Verbal" ${activeFilterSubject === 'Razonamiento Verbal' ? 'selected' : ''}>Razonamiento Verbal</option>
                  <option value="Fisica" ${activeFilterSubject === 'Fisica' ? 'selected' : ''}>Física</option>
                  <option value="Quimica" ${activeFilterSubject === 'Quimica' ? 'selected' : ''}>Química</option>
                  <option value="Biologia" ${activeFilterSubject === 'Biologia' ? 'selected' : ''}>Biología</option>
                  <option value="Historia del Peru" ${activeFilterSubject === 'Historia del Peru' ? 'selected' : ''}>Historia del Perú</option>
                  <option value="Geografia" ${activeFilterSubject === 'Geografia' ? 'selected' : ''}>Geografía</option>
                  <option value="Cultura General" ${activeFilterSubject === 'Cultura General' ? 'selected' : ''}>Cultura General</option>
                </select>
              </div>
            </div>
          </div>

          ${questions.length === 0 ? `
            <div class="card" style="text-align: center; padding: 48px;">
              <div style="margin-bottom: 12px;">${icon('doubt', { size: 40, color: 'var(--text-dim)' })}</div>
              <h3>No se encontraron preguntas con los filtros seleccionados.</h3>
            </div>
          ` : `
            <!-- Header de Navegación & Progreso -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <div>
                <span style="font-size: 0.85rem; font-weight: 700; color: var(--accent-unsm); text-transform: uppercase; display: flex; align-items: center; gap: 6px;">
                  ${icon('compass', { size: 16, color: 'var(--accent-unsm)' })}
                  Pregunta ${currentIndex + 1} de ${questions.length}
                </span>
                <div style="font-size: 0.85rem; color: var(--text-dim); margin-top: 2px;">
                  ${questions[currentIndex].subject} &bull; ${questions[currentIndex].topic}
                </div>
              </div>
              <div style="display: flex; gap: 8px;">
                <button id="btn-prev" class="btn btn-secondary" style="padding: 8px 14px;" ${currentIndex === 0 ? 'disabled' : ''}>
                  ${icon('arrowLeft', { size: 16 })} Anterior
                </button>
                <button id="btn-next" class="btn btn-secondary" style="padding: 8px 14px;" ${currentIndex === questions.length - 1 ? 'disabled' : ''}>
                  Siguiente ${icon('arrowRight', { size: 16 })}
                </button>
              </div>
            </div>

            <!-- Metadatos de la Pregunta Oficial -->
            <div class="question-meta">
              <span class="tag ${questions[currentIndex].institution === 'PRONABEC' ? 'tag-beca' : 'tag-unsm'}">${questions[currentIndex].institution}</span>
              <span class="tag tag-unsm">${questions[currentIndex].examType} ${questions[currentIndex].year}</span>
              <span class="tag ${questions[currentIndex].difficulty === 'BASICO' ? 'tag-diff-basic' : questions[currentIndex].difficulty === 'INTERMEDIO' ? 'tag-diff-mid' : 'tag-diff-adv'}">${questions[currentIndex].difficulty}</span>
              ${questions[currentIndex].isFija ? `<span class="tag tag-diff-mid" style="background-color: rgba(245, 158, 11, 0.2); color: #FBBF24; display: inline-flex; align-items: center; gap: 4px;">${icon('star', { size: 12, color: '#FBBF24' })} FIJA DE EXAMEN</span>` : ''}
              
              ${questions[currentIndex].sourceReference ? `
                <span style="font-size: 0.75rem; color: var(--text-dim); margin-left: auto; display: inline-flex; align-items: center; gap: 4px;">
                  ${icon('sources', { size: 12, color: 'var(--text-dim)' })}
                  ${questions[currentIndex].sourceReference.document} (Pág. ${questions[currentIndex].sourceReference.page}, Preg. ${questions[currentIndex].sourceReference.questionNumber})
                </span>
              ` : ''}
            </div>

            <!-- Enunciado -->
            <div class="question-body">
              ${questions[currentIndex].rawQuestion}
            </div>

            <!-- Alternativas Múltiples (A - E) -->
            <div class="options-list">
              ${questions[currentIndex].options.map(opt => {
                let optionClass = 'option-item';
                if (hasSubmitted) {
                  if (opt.id === questions[currentIndex].correctAnswer) optionClass += ' correct';
                  else if (opt.id === selectedOption) optionClass += ' incorrect';
                } else if (selectedOption === opt.id) {
                  optionClass += ' selected';
                }

                return `
                  <div class="${optionClass}" data-option="${opt.id}">
                    <div class="option-key">${opt.id}</div>
                    <div style="flex: 1; font-size: 1rem;">${opt.text}</div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Panel de Acciones -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
              <button id="btn-dont-know" class="btn btn-doubt" ${hasSubmitted ? 'disabled' : ''}>
                ${icon('doubt', { size: 18, color: '#FBBF24' })}
                No lo sé (Aprender con el Tutor 3D)
              </button>

              <button id="btn-submit-answer" class="btn btn-primary" ${hasSubmitted || !selectedOption ? 'disabled' : ''}>
                ${icon('check', { size: 18 })}
                Verificar Respuesta
              </button>
            </div>

            <!-- Retroalimentación / Explicación Cognitiva -->
            <div id="explanation-box" style="display: ${hasSubmitted ? 'block' : 'none'};">
              <div style="background-color: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 28px; border-left: 5px solid ${selectedOption === questions[currentIndex].correctAnswer ? 'var(--accent-beca)' : wasDoubtMode ? 'var(--accent-alert)' : 'var(--accent-danger)'};">
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    ${selectedOption === questions[currentIndex].correctAnswer
                      ? `<div class="card-icon emerald" style="width: 38px; height: 38px;">${icon('check', { size: 24, color: 'var(--accent-beca)' })}</div>
                         <div><h4 style="font-weight: 800; font-size: 1.2rem; color: #A7F3D0;">¡Excelente deducción! Respuesta Correcta</h4><div style="font-size: 0.85rem; color: var(--text-muted);">Dominio consolidado</div></div>`
                      : wasDoubtMode
                      ? `<div class="card-icon amber" style="width: 38px; height: 38px;">${icon('lightbulb', { size: 24, color: 'var(--accent-alert)' })}</div>
                         <div><h4 style="font-weight: 800; font-size: 1.2rem; color: #FDE68A;">Modo Aprendizaje Guiado</h4><div style="font-size: 0.85rem; color: var(--text-muted);">El tutor 3D te guía paso a paso</div></div>`
                      : `<div class="card-icon" style="width: 38px; height: 38px; background-color: rgba(239, 68, 68, 0.15);">${icon('warning', { size: 24, color: 'var(--accent-danger)' })}</div>
                         <div><h4 style="font-weight: 800; font-size: 1.2rem; color: #FECACA;">Respuesta Incorrecta &bull; Análisis</h4><div style="font-size: 0.85rem; color: var(--text-muted);">Aprende la trampa del examen</div></div>`
                    }
                  </div>

                  <button id="btn-voice-explain" class="btn btn-secondary btn-sm" style="display: inline-flex; align-items: center; gap: 6px;">
                    ${icon('zap', { size: 14, color: '#60A5FA' })}
                    Explicar con Gestos 3D
                  </button>
                </div>

                <div style="margin-bottom: 20px; background-color: var(--bg-card); padding: 20px; border-radius: var(--radius-md);">
                  <div style="font-size: 0.95rem; font-weight: 700; color: #93C5FD; display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    ${icon('step', { size: 18, color: '#93C5FD' })}
                    Resolución Paso a Paso:
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${questions[currentIndex].explanation.solutionStepByStep.map((step, idx) => `
                      <div style="display: flex; align-items: flex-start; gap: 12px; font-size: 0.95rem; color: var(--text-main); line-height: 1.6;">
                        <span style="background-color: #1E293B; color: #60A5FA; font-family: var(--font-mono); font-weight: 700; font-size: 0.8rem; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px;">
                          ${idx + 1}
                        </span>
                        <span>${step}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <div style="background-color: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.25); padding: 14px 18px; border-radius: var(--radius-md); font-size: 0.9rem; margin-bottom: 16px; display: flex; align-items: flex-start; gap: 12px;">
                  <div style="flex-shrink: 0; margin-top: 2px;">${icon('brain', { size: 20, color: 'var(--accent-unsm)' })}</div>
                  <div>
                    <strong style="color: #93C5FD;">Concepto Clave Fundamental:</strong>
                    <div style="color: var(--text-main); margin-top: 4px;">${questions[currentIndex].explanation.keyConcept}</div>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; margin-bottom: 20px;">
                  <div style="background-color: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: var(--radius-md); padding: 16px; display: flex; align-items: flex-start; gap: 10px;">
                    <div style="flex-shrink: 0; margin-top: 2px;">${icon('lightbulb', { size: 20, color: 'var(--accent-alert)' })}</div>
                    <div>
                      <strong style="color: var(--accent-alert); font-size: 0.85rem; display: block; margin-bottom: 4px;">Tip Rápido de Examen:</strong>
                      <div style="font-size: 0.85rem; color: var(--text-muted);">${questions[currentIndex].explanation.quickTip}</div>
                    </div>
                  </div>

                  <div style="background-color: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-md); padding: 16px; display: flex; align-items: flex-start; gap: 10px;">
                    <div style="flex-shrink: 0; margin-top: 2px;">${icon('warning', { size: 20, color: 'var(--accent-danger)' })}</div>
                    <div>
                      <strong style="color: var(--accent-danger); font-size: 0.85rem; display: block; margin-bottom: 4px;">Trampa Clásica de Postulante:</strong>
                      <div style="font-size: 0.85rem; color: var(--text-muted);">${questions[currentIndex].explanation.commonPitfall}</div>
                    </div>
                  </div>
                </div>

                ${questions[currentIndex].relatedFichaId ? `
                  <div style="display: flex; justify-content: flex-end; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 16px;">
                    <button class="btn btn-secondary btn-sm" id="btn-view-ficha" style="display: inline-flex; align-items: center; gap: 8px;">
                      ${icon('book', { size: 16, color: 'var(--accent-unsm)' })}
                      Estudiar Ficha Completa de este Tema ${icon('chevronRight', { size: 14 })}
                    </button>
                  </div>
                ` : ''}

              </div>
            </div>
          `}
        </div>

        <!-- PANEL LATERAL DERECHO: TUTOR 3D HOLOGRÁFICO CON SELECTOR DE VOZ -->
        <div class="practice-tutor-sidebar" style="width: 300px; position: sticky; top: 90px; display: flex; flex-direction: column; gap: 16px;">
          <div class="card" style="padding: 16px; background: linear-gradient(180deg, #182234 0%, #0F172A 100%); border: 1px solid rgba(59, 130, 246, 0.4); box-shadow: 0 0 25px rgba(59, 130, 246, 0.15); text-align: center;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span class="tag tag-beca" style="font-size: 0.7rem;">TUTOR IA 3D</span>
              <span style="font-size: 0.75rem; color: var(--accent-beca); font-weight: 700;">EN LÍNEA</span>
            </div>

            <!-- Canvas Container 3D WebGL -->
            <div id="avatar-3d-viewport" style="width: 100%; height: 240px; border-radius: var(--radius-md); background: radial-gradient(circle at center, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.9) 100%); overflow: hidden; position: relative;">
              <!-- 3D Scene renders here -->
            </div>

            <!-- Selector de Voz y Tonalidad -->
            <div style="margin-top: 12px; text-align: left; background-color: var(--bg-card); padding: 10px 12px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <label style="font-size: 0.75rem; font-weight: 700; color: #93C5FD; display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span>🇵🇪 Seleccionar Voz (Perú / Latam):</span>
              </label>
              <select id="select-tutor-voice" style="width: 100%; background-color: var(--bg-input); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 6px 8px; border-radius: var(--radius-sm); font-size: 0.8rem; margin-bottom: 8px;">
                ${voiceTutor.availableVoices.length > 0
                  ? voiceTutor.availableVoices.map(v => {
                      const isPeru = v.lang === 'es-PE' || v.name.toLowerCase().includes('peru');
                      const label = isPeru ? `🇵🇪 ${v.name} (Perú)` : `🌎 ${v.name} (${v.lang})`;
                      return `<option value="${v.name}" ${voiceTutor.selectedVoice && voiceTutor.selectedVoice.name === v.name ? 'selected' : ''}>${label}</option>`;
                    }).join('')
                  : `<option>Cargando voces en español...</option>`
                }
              </select>

              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-dim); margin-bottom: 4px;">
                <span>Velocidad de Lectura:</span>
                <input type="range" id="range-tutor-rate" min="0.8" max="1.3" step="0.05" value="${voiceTutor.rate}" style="width: 100px; cursor: pointer;">
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-dim);">
                <span>Calidez de Tono:</span>
                <input type="range" id="range-tutor-pitch" min="0.8" max="1.3" step="0.05" value="${voiceTutor.pitch}" style="width: 100px; cursor: pointer;">
              </div>
            </div>

            <!-- Estado de Voz del Tutor -->
            <div style="margin-top: 10px; font-size: 0.85rem; color: var(--text-muted); min-height: 40px; display: flex; align-items: center; justify-content: center; padding: 0 8px; text-align: center;">
              <span id="voice-status-label">${voiceStatusText || '¡Hola! Soy tu Tutor IA. Pregúntame o di tu respuesta.'}</span>
            </div>

            <!-- Botón de Parada Inmediata (Siempre Accesible) -->
            <div style="margin-top: 8px;">
              <button id="btn-tutor-stop" class="btn btn-sm" style="width: 100%; background-color: rgba(239, 68, 68, 0.2); border: 1px solid var(--accent-danger); color: #FECACA; display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 700; padding: 8px 10px;">
                ${icon('stop', { size: 14, color: 'var(--accent-danger)' })}
                ⏹️ Parar Voz del Tutor
              </button>
            </div>

            <!-- Controles de Interacción Rápida -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
              <button id="btn-tutor-speak-q" class="btn btn-secondary btn-sm" style="font-size: 0.75rem; padding: 8px 4px; display: flex; align-items: center; justify-content: center; gap: 4px;">
                ${icon('compass', { size: 14, color: 'var(--accent-unsm)' })} Leer Pregunta
              </button>
              <button id="btn-tutor-listen" class="btn btn-primary btn-sm" style="font-size: 0.75rem; padding: 8px 4px; display: flex; align-items: center; justify-content: center; gap: 4px;">
                ${icon('mic', { size: 14, color: '#fff' })} Dictar Clave
              </button>
            </div>

            <!-- Botón de Ayuda / Permiso de Celular -->
            <button id="btn-mic-permission-help" class="btn btn-secondary btn-sm" style="margin-top: 8px; width: 100%; font-size: 0.72rem; padding: 6px; color: var(--text-muted); display: flex; align-items: center; justify-content: center; gap: 4px; border: 1px dashed var(--border-subtle);">
              📱 Permiso de Micrófono en Celular
            </button>
          </div>
        </div>

      </div>
    `;

    // 1. Inicializar Avatar 3D
    const viewport = document.getElementById('avatar-3d-viewport');
    if (viewport) {
      if (avatarInstance) avatarInstance.destroy();
      avatarInstance = new Avatar3D(viewport);
      voiceTutor.attachAvatar(avatarInstance);
    }

    // 2. Enlazar Selector de Voz Dinámico
    const voiceSelect = document.getElementById('select-tutor-voice');
    if (voiceSelect) {
      voiceSelect.addEventListener('change', (e) => {
        voiceTutor.setVoiceByName(e.target.value);
        voiceTutor.speak('Hola, he cambiado mi voz. ¿Qué tal me escuchas ahora?');
      });
    }

    // Slider de velocidad y tono/calidez
    document.getElementById('range-tutor-rate')?.addEventListener('input', (e) => {
      voiceTutor.setRate(e.target.value);
    });

    document.getElementById('range-tutor-pitch')?.addEventListener('input', (e) => {
      voiceTutor.setPitch(e.target.value);
    });

    // Botón para PARAR la voz inmediatamente si está hablando
    document.getElementById('btn-tutor-stop')?.addEventListener('click', () => {
      voiceTutor.stopSpeaking();
      voiceTutor.stopListening();
      updateStatus('Voz detenida. Haz clic en "Leer Pregunta" o "Dictar Clave" cuando desees.');
    });

    // Botón para solicitar explícitamente permiso de micrófono en celulares
    document.getElementById('btn-mic-permission-help')?.addEventListener('click', async () => {
      updateStatus('Solicitando permiso de micrófono...');
      const res = await voiceTutor.promptPermissionOnMobile();
      if (res.ok) {
        alert('✅ ¡Permiso de micrófono concedido! Ya puedes usar "Dictar Clave" en tu celular.');
        updateStatus('Micrófono activado con éxito. Di tu alternativa (A, B, C, D o E).');
      } else {
        alert(`⚠️ ${res.message}`);
        updateStatus('Permiso pendiente o bloqueado en el navegador.');
      }
    });

    voiceTutor.onVoicesReadyCallback = (voices) => {
      if (voiceSelect && voices.length > 0) {
        voiceSelect.innerHTML = voices.map(v => {
          const isPeru = v.lang === 'es-PE' || v.name.toLowerCase().includes('peru');
          const label = isPeru ? `🇵🇪 ${v.name} (Perú)` : `🌎 ${v.name} (${v.lang})`;
          return `<option value="${v.name}" ${voiceTutor.selectedVoice && voiceTutor.selectedVoice.name === v.name ? 'selected' : ''}>${label}</option>`;
        }).join('');
      }
    };

    // 3. Filtros de Institución
    document.getElementById('filter-inst-all')?.addEventListener('click', () => {
      activeFilterInstitution = 'ALL';
      currentIndex = 0;
      selectedOption = null;
      hasSubmitted = false;
      wasDoubtMode = false;
      renderView();
    });
    document.getElementById('filter-inst-beca')?.addEventListener('click', () => {
      activeFilterInstitution = 'PRONABEC';
      currentIndex = 0;
      selectedOption = null;
      hasSubmitted = false;
      wasDoubtMode = false;
      renderView();
    });
    document.getElementById('filter-inst-unsm')?.addEventListener('click', () => {
      activeFilterInstitution = 'UNSM';
      currentIndex = 0;
      selectedOption = null;
      hasSubmitted = false;
      wasDoubtMode = false;
      renderView();
    });
    document.getElementById('filter-toggle-fijas')?.addEventListener('click', () => {
      activeFilterOnlyFijas = !activeFilterOnlyFijas;
      currentIndex = 0;
      selectedOption = null;
      hasSubmitted = false;
      wasDoubtMode = false;
      renderView();
    });
    document.getElementById('select-subject-filter')?.addEventListener('change', (e) => {
      activeFilterSubject = e.target.value;
      currentIndex = 0;
      selectedOption = null;
      hasSubmitted = false;
      wasDoubtMode = false;
      renderView();
    });

    if (questions.length === 0) return;

    const q = questions[currentIndex];

    // TUTOR CONTROLS
    const updateStatus = (txt) => {
      voiceStatusText = txt;
      const el = document.getElementById('voice-status-label');
      if (el) el.innerText = txt;
    };

    document.getElementById('btn-tutor-speak-q')?.addEventListener('click', () => {
      updateStatus('Hablando con tono natural...');
      const readText = `Pregunta ${currentIndex + 1}. Curso de ${q.subject}. ${q.rawQuestion}. Alternativas: ${q.options.map(o => `Opción ${o.id}: ${o.text}`).join('. ')}.`;
      voiceTutor.speak(readText, () => updateStatus('¿Cuál es tu respuesta?'));
    });

    document.getElementById('btn-tutor-listen')?.addEventListener('click', () => {
      updateStatus('Te escucho con atención... (Di: A, B, C, D, E o "No lo sé")');
      voiceTutor.listen((spokenText) => {
        const text = spokenText.toLowerCase();
        let detected = null;

        if (text.includes('no lo sé') || text.includes('no se') || text.includes('duda')) {
          handleDoubt();
          return;
        }

        if (text.includes('opción a') || text.includes('la a') || text.trim() === 'a') detected = 'A';
        else if (text.includes('opción b') || text.includes('la b') || text.trim() === 'b') detected = 'B';
        else if (text.includes('opción c') || text.includes('la c') || text.trim() === 'c') detected = 'C';
        else if (text.includes('opción d') || text.includes('la d') || text.trim() === 'd') detected = 'D';
        else if (text.includes('opción e') || text.includes('la e') || text.trim() === 'e') detected = 'E';

        if (detected) {
          selectedOption = detected;
          updateStatus(`Entendí Opción ${detected}. Verificando...`);
          handleSubmit();
        } else {
          updateStatus(`Escuché: "${spokenText}". Intenta decir: A, B, C, D, E o "No lo sé".`);
        }
      });
    });

    document.getElementById('btn-voice-explain')?.addEventListener('click', () => {
      updateStatus('Explicando solución detallada...');
      const explainText = `Atención: la respuesta correcta es la opción ${q.correctAnswer}. ${q.explanation.solutionStepByStep.join('. ')}. Concepto clave: ${q.explanation.keyConcept}. Tip rápido de examen: ${q.explanation.quickTip}.`;
      voiceTutor.speak(explainText, () => updateStatus('Explicación finalizada. ¿Listo para la siguiente?'));
    });

    // Opciones
    container.querySelectorAll('.option-item').forEach(item => {
      item.addEventListener('click', () => {
        if (hasSubmitted) return;
        selectedOption = item.getAttribute('data-option');
        renderView();
      });
    });

    async function handleSubmit() {
      hasSubmitted = true;
      wasDoubtMode = false;
      const isCorrect = selectedOption === q.correctAnswer;
      const speechFeedback = isCorrect 
        ? `¡Muy bien! Acertaste con la opción ${q.correctAnswer}.`
        : `Atención, la respuesta correcta era la opción ${q.correctAnswer}.`;
      
      voiceTutor.speak(speechFeedback);

      await RecommendationEngine.recordAnswer({
        questionId: q.id,
        selectedAnswer: selectedOption,
        correctAnswer: q.correctAnswer,
        timeSpentSeconds: 45,
        topic: q.topic,
        isDoubt: false
      });
      renderView();
    }

    async function handleDoubt() {
      hasSubmitted = true;
      wasDoubtMode = true;
      selectedOption = null;

      voiceTutor.speak(`Modo formativo activado. No te preocupes, te explico el concepto: la clave es la opción ${q.correctAnswer}. ${q.explanation.solutionStepByStep[0] || ''}`);

      await RecommendationEngine.recordAnswer({
        questionId: q.id,
        selectedAnswer: null,
        correctAnswer: q.correctAnswer,
        timeSpentSeconds: 15,
        topic: q.topic,
        isDoubt: true
      });
      renderView();
    }

    document.getElementById('btn-submit-answer')?.addEventListener('click', handleSubmit);
    document.getElementById('btn-dont-know')?.addEventListener('click', handleDoubt);

    document.getElementById('btn-prev')?.addEventListener('click', () => {
      if (currentIndex > 0) {
        voiceTutor.stopSpeaking();
        voiceTutor.stopListening();
        currentIndex--;
        selectedOption = null;
        hasSubmitted = false;
        wasDoubtMode = false;
        voiceStatusText = '';
        renderView();
      }
    });

    document.getElementById('btn-next')?.addEventListener('click', () => {
      if (currentIndex < questions.length - 1) {
        voiceTutor.stopSpeaking();
        voiceTutor.stopListening();
        currentIndex++;
        selectedOption = null;
        hasSubmitted = false;
        wasDoubtMode = false;
        voiceStatusText = '';
        renderView();
      }
    });

    document.getElementById('btn-view-ficha')?.addEventListener('click', () => {
      voiceTutor.stopSpeaking();
      window.location.hash = '#fichas';
    });
  }

  renderView();
}
