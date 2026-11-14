// ==========================================================================
// VIEW: PRACTICA ADAPTATIVA CON TUTOR 3D Y SELECTOR DE VOCES AMIGABLES
// ==========================================================================

import { repo } from '../core/repository.js';
import { RecommendationEngine } from '../core/recommendation.js';
import { voiceTutor } from '../core/voiceTutor.js';
import { icon } from './icons.js';
import { mountTutorChat } from './tutor-chat.js';

export function renderPractice(container, navigateTo) {
  let activeFilterInstitution = 'ALL';
  let activeFilterSubject = 'ALL';
  let activeFilterOnlyFijas = false;

  let currentIndex = 0;
  let selectedOption = null;
  let hasSubmitted = false;
  let wasDoubtMode = false;
  let tutorChatCleanup = null;
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
    if (tutorChatCleanup) { tutorChatCleanup(); tutorChatCleanup = null; }
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

        <!-- PANEL DEL TUTOR: selección, avatar y conversación -->
<aside class="practice-tutor-sidebar">
  <section class="tutor-panel-card">
    <div class="tutor-visual-header">
      <div class="tutor-visual-identity">
        <span class="tutor-visual-icon">${icon('brain', { size: 18 })}</span>
        <span><strong>Tu espacio de aprendizaje</strong><small>Asistencia académica inteligente</small></span>
      </div>
      <span class="tutor-online-indicator"><i></i> Disponible</span>
    </div>
    <div id="avatar-3d-viewport" class="tutor-avatar-stage">
      <div class="tutor-avatar-stage-glow"></div>
      <div class="tutor-avatar-stage-placeholder"><span>IA</span><small>Activa el avatar visual 3D</small></div>
    </div>
    <div id="tutor-chat-mount"></div>
  </section>
</aside>

      </div>
    `;

    // 1. El tutor 3D se descarga únicamente si el estudiante decide activarlo.
    const viewport = document.getElementById('avatar-3d-viewport');
    if (viewport) {
      if (avatarInstance) avatarInstance.destroy();
      const activateTutor = document.createElement('button');
      activateTutor.type = 'button';
      activateTutor.className = 'btn btn-secondary btn-sm';
      activateTutor.textContent = 'Activar avatar visual 3D';
      activateTutor.setAttribute('aria-label', 'Cargar avatar visual 3D');
      viewport.replaceChildren(activateTutor);
      activateTutor.addEventListener('click', async () => {
        activateTutor.disabled = true;
        activateTutor.textContent = 'Cargando tutor visual…';
        try {
          const { Avatar3D } = await import('./avatar3d.js');
          if (!viewport.isConnected) return;
          avatarInstance = new Avatar3D(viewport);
          voiceTutor.attachAvatar(avatarInstance);
        } catch (error) {
          console.error('No se pudo cargar el tutor visual 3D:', error);
          if (viewport.isConnected) {
            activateTutor.disabled = false;
            activateTutor.textContent = 'Reintentar avatar 3D';
          }
        }
      });
    }

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

    // Tutor conversacional: voz full-duplex y chat con contexto de la pregunta actual.
    tutorChatCleanup = mountTutorChat(document.getElementById('tutor-chat-mount'), {
      getContext: () => {
        const current = questions[currentIndex];
        if (!current) return 'No hay una pregunta seleccionada. El estudiante puede consultar cualquier tema de secundaria.';
        const context = {
          curso: current.subject,
          tema: current.topic,
          enunciado: current.rawQuestion,
          alternativas: current.options.map((option) => ({ alternativa: option.id, texto: option.text })),
          estado: hasSubmitted ? 'El estudiante ya terminó su intento.' : 'Pregunta todavía activa; guiar con pistas sin revelar la clave.',
        };
        if (hasSubmitted) {
          context.respuestaCorrecta = current.correctAnswer;
          context.resolucion = current.explanation.solutionStepByStep;
          context.conceptoClave = current.explanation.keyConcept;
          context.consejo = current.explanation.quickTip;
        }
        return JSON.stringify(context);
      },
      onCharacterChange: (character) => voiceTutor.setCharacter(character),
      onReadQuestion: () => {
        const current = questions[currentIndex];
        if (!current) return;
        const readText = `Pregunta ${currentIndex + 1}. Curso de ${current.subject}. ${current.rawQuestion}. Alternativas: ${current.options.map((option) => `Opción ${option.id}: ${option.text}`).join('. ')}.`;
        voiceTutor.speak(readText);
      },
      onLiveState: ({ isListening, isSpeaking }) => {
        if (!avatarInstance) return;
        avatarInstance.setListening(Boolean(isListening));
        avatarInstance.setSpeaking(Boolean(isSpeaking));
      },
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
