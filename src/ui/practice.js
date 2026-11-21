// ==========================================================================
// VIEW: PRACTICA ADAPTATIVA CON TUTOR 3D Y SELECTOR DE VOCES AMIGABLES
// ==========================================================================

import { repo } from '../core/repository.js';
import { RecommendationEngine } from '../core/recommendation.js';
import { voiceTutor } from '../core/voiceTutor.js';
import { icon } from './icons.js';
import { mountTutorChat } from './tutor-chat.js';
import { renderMath } from '../core/math-renderer.js';
import { supabase } from '../core/supabase.js';

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

export function renderPractice(container, navigateTo) {
  let activeFilterInstitution = 'ALL';
  let activeFilterSubjects = new Set();

  let currentIndex = 0;
  let selectedOption = null;
  let hasSubmitted = false;
  let wasDoubtMode = false;
  let tutorChatCleanup = null;
  let currentUserId = 'guest';
  let stateSaveQueue = Promise.resolve();
  const practiceStateKey = () => `pre-einstein:practice:${currentUserId}`;

  function savePracticeState() {
    const filtered = getFilteredQuestions();
    const snapshot = {
      institution: activeFilterInstitution,
      subjects: [...activeFilterSubjects],
      currentQuestionId: filtered[currentIndex]?.id || null,
      currentIndex, selectedOption, hasSubmitted, wasDoubtMode,
      updatedAt: new Date().toISOString()
    };
    try { localStorage.setItem(practiceStateKey(), JSON.stringify(snapshot)); }
    catch (error) { console.warn('No se pudo guardar la práctica localmente:', error); }
    if (!supabase || currentUserId === 'guest') return;
    stateSaveQueue = stateSaveQueue.then(async () => {
      const { data: { user } = {} } = await supabase.auth.getUser();
      if (!user || user.id !== currentUserId) return;
      const { error } = await supabase.from('student_learning_state').upsert({
        user_id: user.id, state_key: 'practice', state_data: snapshot, updated_at: snapshot.updatedAt
      }, { onConflict: 'user_id,state_key' });
      if (error) throw error;
    }).catch(error => console.warn('Sincronización de práctica pendiente:', error.message));
  }

  async function restorePracticeState() {
    let snapshot = null;
    if (supabase) {
      try {
        const { data: { user } = {} } = await supabase.auth.getUser();
        if (user) {
          currentUserId = user.id;
          const { data, error } = await supabase.from('student_learning_state').select('state_data,updated_at').eq('user_id', user.id).eq('state_key', 'practice').maybeSingle();
          if (!error && data?.state_data) snapshot = data.state_data;
        }
      } catch (error) { console.warn('No se pudo recuperar la práctica desde la nube:', error.message); }
    }
    try {
      const local = JSON.parse(localStorage.getItem(practiceStateKey()) || 'null');
      if (local && (!snapshot || local.updatedAt > snapshot.updatedAt)) snapshot = local;
    } catch { /* Ignorar un respaldo local inválido sin bloquear la práctica. */ }
    if (!snapshot) return;
    activeFilterInstitution = ['ALL', 'PRONABEC', 'UNSM'].includes(snapshot.institution) ? snapshot.institution : 'ALL';
    activeFilterSubjects = new Set(Array.isArray(snapshot.subjects) ? snapshot.subjects : []);
    const filtered = getFilteredQuestions();
    const restoredIndex = snapshot.currentQuestionId ? filtered.findIndex(question => question.id === snapshot.currentQuestionId) : -1;
    currentIndex = restoredIndex >= 0 ? restoredIndex : Math.max(0, Math.min(Number(snapshot.currentIndex) || 0, Math.max(0, filtered.length - 1)));
    selectedOption = snapshot.selectedOption || null;
    hasSubmitted = Boolean(snapshot.hasSubmitted);
    wasDoubtMode = Boolean(snapshot.wasDoubtMode);
  }

  function getFilteredQuestions() {
    return repo.questions.filter(q => {
      if (activeFilterInstitution !== 'ALL' && q.institution !== activeFilterInstitution) return false;
      if (activeFilterSubjects.size > 0 && !activeFilterSubjects.has(q.subject)) return false;
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
          
          <!-- Filtros por institución y curso -->
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
                <button type="button" class="btn btn-sm btn-secondary" id="clear-subject-filters">Limpiar temas</button>
              </div>
              <div class="practice-subject-picker" aria-label="Seleccionar varios temas">
                <div class="practice-subject-picker-head"><strong>Temas para practicar</strong><span id="selected-subject-count">${activeFilterSubjects.size ? activeFilterSubjects.size + ' seleccionados' : 'Todos los temas'}</span></div>
                <div class="practice-subject-chips">
                  ${[...new Set(repo.questions.map(question => question.subject).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es')).map(subject => `
                    <button type="button" class="subject-chip ${activeFilterSubjects.has(subject) ? 'is-selected' : ''}" data-subject="${subject}" aria-pressed="${activeFilterSubjects.has(subject)}">${subject}</button>
                  `).join('')}
                </div>
                <p class="practice-subject-hint">Puedes combinar tantos cursos como quieras. Si no eliges ninguno, se mostrarán todos.</p>
              </div>
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
                  ${escapeHtml(questions[currentIndex].subject)} &bull; ${escapeHtml(questions[currentIndex].topic)}
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

            <!-- Institución, modalidad y procedencia declarada -->
            <div class="question-meta">
              <span class="tag ${questions[currentIndex].institution === 'PRONABEC' ? 'tag-beca' : 'tag-unsm'}">${escapeHtml(questions[currentIndex].institution)}</span>
              <span class="tag tag-unsm">${escapeHtml(questions[currentIndex].examType)} · ${escapeHtml(questions[currentIndex].year)}</span>
              <span class="tag ${questions[currentIndex].difficulty === 'BASICO' ? 'tag-diff-basic' : questions[currentIndex].difficulty === 'INTERMEDIO' ? 'tag-diff-mid' : 'tag-diff-adv'}">${escapeHtml(questions[currentIndex].difficulty)}</span>
              ${questions[currentIndex].status === 'REVIEW_REQUIRED' ? '<span class="tag" style="background:rgba(245,158,11,.12);color:#B45309;">REFERENCIA EN REVISIÓN</span>' : ''}
              ${questions[currentIndex].isFija ? `<span class="tag tag-diff-mid" style="background-color: rgba(245, 158, 11, 0.2); color: #FBBF24; display: inline-flex; align-items: center; gap: 4px;">${icon('star', { size: 12, color: '#FBBF24' })} FIJA DE EXAMEN</span>` : ''}
              
              ${questions[currentIndex].sourceReference ? `
                <span style="font-size: 0.75rem; color: var(--text-dim); margin-left: auto; display: inline-flex; align-items: center; gap: 4px;">
                  ${icon('sources', { size: 12, color: 'var(--text-dim)' })}
                  ${escapeHtml(questions[currentIndex].sourceReference.document)} (Pág. ${escapeHtml(questions[currentIndex].sourceReference.page)}, Preg. ${escapeHtml(questions[currentIndex].sourceReference.questionNumber)})
                </span>
              ` : ''}
            </div>

            <!-- Enunciado -->
            <div class="question-body">
              ${escapeHtml(questions[currentIndex].rawQuestion)}
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
                  <div class="${optionClass}" data-option="${escapeHtml(opt.id)}">
                    <div class="option-key">${escapeHtml(opt.id)}</div>
                    <div style="flex: 1; font-size: 1rem;">${escapeHtml(opt.text)}</div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Panel de Acciones -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
              <button id="btn-dont-know" class="btn btn-doubt" ${hasSubmitted ? 'disabled' : ''}>
                ${icon('doubt', { size: 18, color: '#FBBF24' })}
                No lo sé (Aprender con Einstein)
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
                         <div><h4 style="font-weight: 800; font-size: 1.2rem; color: #FDE68A;">Modo Aprendizaje Guiado</h4><div style="font-size: 0.85rem; color: var(--text-muted);">Einstein te guía paso a paso</div></div>`
                      : `<div class="card-icon" style="width: 38px; height: 38px; background-color: rgba(239, 68, 68, 0.15);">${icon('warning', { size: 24, color: 'var(--accent-danger)' })}</div>
                         <div><h4 style="font-weight: 800; font-size: 1.2rem; color: #FECACA;">Respuesta Incorrecta &bull; Análisis</h4><div style="font-size: 0.85rem; color: var(--text-muted);">Aprende la trampa del examen</div></div>`
                    }
                  </div>

                  <button id="btn-voice-explain" class="btn btn-secondary btn-sm" style="display: inline-flex; align-items: center; gap: 6px;">
                    ${icon('zap', { size: 14, color: '#60A5FA' })}
                    Explicación de Einstein
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

        <!-- PRE-EINSTEIN: tutor único -->
<aside class="practice-tutor-sidebar">
  <section class="einstein-intro-card">
    <div class="einstein-mascot" role="img" aria-label="Einstein, tu compañero de estudio">
      <svg viewBox="0 0 120 128" aria-hidden="true">
        <path d="M22 49C7 36 18 18 34 24C31 6 53 4 61 19C73 1 96 12 91 29C111 22 119 45 102 56L99 79H20Z" fill="#E8EDF4" stroke="#263D70" stroke-width="4"/>
        <path d="M29 47C14 35 28 26 40 34C39 18 54 17 62 32C76 14 91 24 83 39C101 31 108 45 94 53L91 73H28Z" fill="#FFF" stroke="#263D70" stroke-width="3"/>
        <ellipse cx="60" cy="67" rx="36" ry="39" fill="#F5B27E" stroke="#263D70" stroke-width="4"/>
        <circle cx="46" cy="68" r="13" fill="none" stroke="#263D70" stroke-width="4"/><circle cx="75" cy="68" r="13" fill="none" stroke="#263D70" stroke-width="4"/><path d="M59 68H62" stroke="#263D70" stroke-width="4"/>
        <circle cx="46" cy="68" r="4" fill="#263D70"/><circle cx="75" cy="68" r="4" fill="#263D70"/>
        <path d="M52 91Q61 99 70 91" fill="none" stroke="#A84D40" stroke-width="3" stroke-linecap="round"/>
        <path d="M43 103L60 113L77 103L88 126H32Z" fill="#FFF" stroke="#263D70" stroke-width="3"/><path d="M55 105L60 113L65 105L62 124H58Z" fill="#F28A00"/>
      </svg>
    </div>
    <div class="einstein-intro-copy"><span class="einstein-eyebrow">TU COMPAÑERO DE ESTUDIO</span><h3>Aprende con Einstein</h3><p>Pide una pista, comprende el procedimiento y resuelve cada ejercicio paso a paso.</p></div>
    <span class="einstein-online"><i></i> Disponible para ayudarte</span>
  </section>
  <div id="tutor-chat-mount"></div>
</aside>

      </div>
    `;

    void renderMath(container);

    // 3. Filtros de Institución
    document.getElementById('filter-inst-all')?.addEventListener('click', () => {
      activeFilterInstitution = 'ALL';
      currentIndex = 0;
      selectedOption = null;
      hasSubmitted = false;
      wasDoubtMode = false;
      savePracticeState();
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
        document.getElementById('clear-subject-filters')?.addEventListener('click', () => {
      activeFilterSubjects.clear();
      currentIndex = 0; selectedOption = null; hasSubmitted = false; wasDoubtMode = false;
      savePracticeState();
      renderView();
    });
    container.querySelectorAll('[data-subject]').forEach(button => {
      button.addEventListener('click', () => {
        const subject = button.getAttribute('data-subject');
        if (activeFilterSubjects.has(subject)) activeFilterSubjects.delete(subject);
        else activeFilterSubjects.add(subject);
        currentIndex = 0; selectedOption = null; hasSubmitted = false; wasDoubtMode = false;
        savePracticeState();
        renderView();
      });
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
      onReadQuestion: () => {
        const current = questions[currentIndex];
        if (!current) return;
        const readText = `Pregunta ${currentIndex + 1}. Curso de ${current.subject}. ${current.rawQuestion}. Alternativas: ${current.options.map((option) => `Opción ${option.id}: ${option.text}`).join('. ')}.`;
        voiceTutor.speak(readText);
      },
    });

    // Opciones
    container.querySelectorAll('.option-item').forEach(item => {
      item.addEventListener('click', () => {
        if (hasSubmitted) return;
        selectedOption = item.getAttribute('data-option');
        savePracticeState();
        renderView();
      });
    });

    async function handleSubmit() {
      if (!selectedOption || hasSubmitted) return;
      hasSubmitted = true;
      wasDoubtMode = false;
      savePracticeState();
      const isCorrect = selectedOption === q.correctAnswer;
      const speechFeedback = isCorrect 
        ? `¡Muy bien! Acertaste con la opción ${q.correctAnswer}.`
        : `Atención, la respuesta correcta era la opción ${q.correctAnswer}.`;
      
      voiceTutor.speak(speechFeedback);

      try {
        await RecommendationEngine.recordAnswer({
          questionId: q.id, selectedAnswer: selectedOption, correctAnswer: q.correctAnswer,
          timeSpentSeconds: 45, topic: q.topic, isDoubt: false
        });
      } catch (error) {
        console.error('No se pudo guardar el intento; se mantiene la corrección local:', error);
      } finally {
        renderView();
      }
    }

    async function handleDoubt() {
      hasSubmitted = true;
      wasDoubtMode = true;
      selectedOption = null;
      savePracticeState();

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
        savePracticeState();
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

  void (async () => { await restorePracticeState(); renderView(); })();
}
