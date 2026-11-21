// ==========================================================================
// VIEW: SIMULACROS DE ADMISIÓN — Beca 18 ENP / UNSM Ordinario / Extraordinario
// ==========================================================================

import { repo } from '../core/repository.js';
import { icon } from './icons.js';
import confetti from 'canvas-confetti';
import { supabase } from '../core/supabase.js';

const MODALITIES = {
  ENP: {
    id: 'ENP', institution: 'PRONABEC', examType: 'ENP',
    title: 'Beca 18 · ENP', subtitle: 'Examen Nacional de Preselección',
    duration: null, standardQuestions: null, correctPoints: null, wrongPoints: null, blueprintVerified: false,
    penaltyLabel: 'Ponderación pendiente de verificar', accent: 'beca',
    description: 'Modalidad identificada. Su estructura, duración y reglas de calificación deben verificarse con las bases vigentes.'
  },
  ORDINARIO: {
    id: 'ORDINARIO', institution: 'UNSM', examType: 'ORDINARIO',
    title: 'UNSM · Ordinario', subtitle: 'Examen de admisión ordinario',
    duration: null, standardQuestions: null, correctPoints: null, wrongPoints: null, blueprintVerified: false,
    penaltyLabel: 'Ponderación pendiente de verificar', accent: 'unsm',
    description: 'Modalidad identificada. Su estructura, duración y reglas de calificación deben verificarse con el prospecto vigente.'
  },
  EXTRAORDINARIO: {
    id: 'EXTRAORDINARIO', institution: 'UNSM', examType: 'EXTRAORDINARIO',
    title: 'UNSM · Extraordinario', subtitle: 'Modalidad extraordinaria',
    duration: null, standardQuestions: null, correctPoints: null, wrongPoints: null, blueprintVerified: false,
    penaltyLabel: 'Ponderación pendiente de verificar', accent: 'unsm',
    description: 'Modalidad identificada. Requiere un banco propio y un blueprint oficial verificado antes de habilitarse.'
  },
  CONCURSO_ESCOLAR: {
    id: 'CONCURSO_ESCOLAR', institution: 'UNSM', examType: 'CONCURSO_ESCOLAR',
    title: 'UNSM · Concurso escolar', subtitle: 'Quinto de secundaria',
    duration: null, standardQuestions: null, correctPoints: null, wrongPoints: null, blueprintVerified: false,
    penaltyLabel: 'Ponderación pendiente de verificar', accent: 'unsm',
    description: 'Modalidad identificada. Requiere bases vigentes, distribución oficial y banco de preguntas validado.'
  }
};

export function renderSimulators(container, navigateTo) {
  let activeSession = null;
  let timerInterval = null;
  let currentUserId = 'guest';
  let saveInFlight = Promise.resolve();
  const localStateKey = () => `pre-einstein:simulator:${currentUserId}`;

  function snapshotSession() {
    if (!activeSession) return null;
    return {
      modalityId: activeSession.modality.id,
      questionIds: activeSession.questions.map(question => question.id),
      currentIndex: activeSession.currentIndex,
      answers: activeSession.answers,
      endTimestamp: activeSession.endTimestamp,
      startedAt: activeSession.startedAt,
      finished: Boolean(activeSession.finished),
      updatedAt: new Date().toISOString()
    };
  }

  function persistSession() {
    const snapshot = snapshotSession();
    if (!snapshot) return Promise.resolve();
    try { localStorage.setItem(localStateKey(), JSON.stringify(snapshot)); } catch (error) { console.warn('No se pudo guardar el simulacro localmente:', error); }
    if (!supabase || currentUserId === 'guest') return Promise.resolve();
    saveInFlight = saveInFlight.then(async () => {
      const { data: { user } = {} } = await supabase.auth.getUser();
      if (!user || user.id !== currentUserId) return;
      const { error } = await supabase.from('student_learning_state').upsert({
        user_id: user.id, state_key: 'simulator', state_data: snapshot, updated_at: snapshot.updatedAt
      }, { onConflict: 'user_id,state_key' });
      if (error) throw error;
    }).catch(error => console.warn('Sincronización del simulacro pendiente:', error.message));
    return saveInFlight;
  }

  async function restoreSession() {
    let snapshot = null;
    if (supabase) {
      try {
        const { data: { user } = {} } = await supabase.auth.getUser();
        if (user) {
          currentUserId = user.id;
          const { data, error } = await supabase.from('student_learning_state').select('state_data,updated_at').eq('user_id', user.id).eq('state_key', 'simulator').maybeSingle();
          if (!error && data?.state_data && (!snapshot || data.updated_at > snapshot.updatedAt)) snapshot = data.state_data;
        }
      } catch (error) { console.warn('No se pudo recuperar el simulacro desde la nube:', error.message); }
    }
    try {
      const local = JSON.parse(localStorage.getItem(localStateKey()) || 'null');
      if (local && (!snapshot || local.updatedAt > snapshot.updatedAt)) snapshot = local;
    } catch { snapshot = snapshot || null; }
    if (!snapshot?.modalityId || !Array.isArray(snapshot.questionIds)) return false;
    const modality = MODALITIES[snapshot.modalityId];
    const byId = new Map(repo.questions.map(question => [question.id, question]));
    const questions = snapshot.questionIds.map(id => byId.get(id)).filter(Boolean);
    if (!modality || modality.blueprintVerified !== true || questions.length !== snapshot.questionIds.length || !questions.length) return false;
    activeSession = { modality, institution: modality.institution, durationMinutes: modality.duration, endTimestamp: Number(snapshot.endTimestamp), startedAt: snapshot.startedAt || Date.now(), questions, currentIndex: Math.max(0, Math.min(Number(snapshot.currentIndex) || 0, questions.length - 1)), answers: snapshot.answers || {}, finished: Boolean(snapshot.finished) };
    if (!activeSession.finished && activeSession.endTimestamp <= Date.now()) activeSession.finished = true;
    return true;
  }

  const getPool = (modality) => repo.questions.filter(q =>
    q.institution === modality.institution && q.examType === modality.examType &&
    Array.isArray(q.options) && q.options.length >= 2 && q.correctAnswer && ['VALIDATED', 'PUBLISHED'].includes(q.status)
  );

  function renderLobby() {
    if (timerInterval) clearInterval(timerInterval);
    const cards = Object.values(MODALITIES).map(modality => {
      const pool = getPool(modality);
      const available = modality.blueprintVerified === true
        && Number.isInteger(modality.duration) && modality.duration > 0
        && Number.isInteger(modality.standardQuestions) && modality.standardQuestions > 0
        && Number.isFinite(modality.correctPoints) && modality.correctPoints > 0
        && Number.isFinite(modality.wrongPoints) && pool.length >= modality.standardQuestions;
      const countLabel = modality.blueprintVerified ? `${modality.standardQuestions} preguntas requeridas` : 'Estructura oficial pendiente de validar';
      return `
        <article class="sim-modality-card ${modality.accent}" data-modality="${modality.id}">
          <div class="sim-card-topline">
            <span class="sim-card-kicker">${modality.institution === 'PRONABEC' ? 'PRONABEC' : 'UNIVERSIDAD NACIONAL DE SAN MARTÍN'}</span>
            <span class="sim-card-duration">${modality.duration ? `${modality.duration} min` : "Tiempo por validar"}</span>
          </div>
          <h3>${modality.title}</h3>
          <p class="sim-card-subtitle">${modality.subtitle}</p>
          <p class="sim-card-description">${modality.description}</p>
          <div class="sim-card-meta">
            <span>${countLabel}</span>
            <span>${pool.length} preguntas disponibles</span>
          </div>
          <div class="sim-card-footer">
            <span class="sim-score-rule">${modality.penaltyLabel}</span>
            <button class="btn ${modality.accent === 'beca' ? 'btn-beca' : 'btn-primary'} sim-start-button" data-start="${modality.id}" ${available ? '' : 'disabled'}>
              ${available ? 'Preparar simulacro' : modality.blueprintVerified ? `Banco insuficiente (${pool.length}/${modality.standardQuestions})` : 'Aún no disponible'}
              ${icon(available ? 'arrowRight' : 'lock', { size: 16 })}
            </button>
          </div>
          ${!available ? `<p class="sim-card-note">No se habilitará hasta validar el prospecto de la convocatoria, su distribución y el banco de preguntas correspondiente.</p>` : ''}
        </article>
      `;
    }).join('');

    container.innerHTML = `
      <section class="simulator-hub">
        <header class="simulator-heading">
          <span class="simulator-eyebrow">PREPARACIÓN DE ADMISIÓN</span>
          <h2>Simulacros</h2>
          <p>Consulta las modalidades de preparación. Los simulacros cronometrados se habilitarán cuando exista una estructura oficial verificada y un banco suficiente.</p>
        </header>
        <div class="simulator-section-label">
          <div><strong>Modalidades disponibles</strong><span>Selecciona solo una para comenzar</span></div>
          <span class="simulator-bank-count">${repo.questions.length} preguntas en el banco</span>
        </div>
        <div class="simulator-modalities">${cards}</div>
        <aside class="simulator-scoring-note">
          <strong>Transparencia académica</strong>
          <p>Los tiempos, la cantidad de preguntas, la distribución por áreas y la puntuación deben verificarse con el prospecto vigente de cada convocatoria.</p>
          
          <p class="simulator-note-muted">No se mostrarán simulacros como oficiales ni se inventarán preguntas para completar un banco insuficiente.</p>
        </aside>
      </section>
    `;

    container.querySelectorAll('[data-start]').forEach(button => {
      button.addEventListener('click', () => {
        const modality = MODALITIES[button.dataset.start];
        if (modality && getPool(modality).length) startSimulator(modality);
      });
    });
  }

  function startSimulator(modality) {
    const pool = getPool(modality);
    if (!pool.length) return;
    if (modality.blueprintVerified !== true
        || !Number.isInteger(modality.duration) || modality.duration <= 0
        || !Number.isInteger(modality.standardQuestions) || modality.standardQuestions <= 0
        || !Number.isFinite(modality.correctPoints) || modality.correctPoints <= 0
        || !Number.isFinite(modality.wrongPoints)
        || pool.length < modality.standardQuestions) return;
    const questions = [...pool];
    for (let i = questions.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [questions[i], questions[j]] = [questions[j], questions[i]]; }
    questions.length = modality.standardQuestions;
    activeSession = {
      modality, institution: modality.institution, durationMinutes: modality.duration,
      startedAt: Date.now(), endTimestamp: Date.now() + modality.duration * 60 * 1000,
      questions, currentIndex: 0, answers: {}, finished: false
    };
    void persistSession();
    renderActiveExam();
  }

  function renderActiveExam() {
    if (!activeSession) return;
    if (activeSession.finished) return renderResults();
    const q = activeSession.questions[activeSession.currentIndex];
    const remainingMs = Math.max(0, activeSession.endTimestamp - Date.now());
    const totalSec = Math.floor(remainingMs / 1000);
    const m = Math.floor(totalSec / 60), s = totalSec % 60;
    const timeFormatted = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    const answered = Object.keys(activeSession.answers).length;

    container.innerHTML = `
      <section class="sim-exam-shell">
        <header class="sim-exam-header">
          <div><span class="simulator-eyebrow">${activeSession.modality.title}</span><strong>Pregunta ${activeSession.currentIndex + 1} <small>de ${activeSession.questions.length}</small></strong></div>
          <div class="sim-exam-header-actions"><span class="sim-exam-timer" id="timer-display">${timeFormatted}</span><button id="btn-finish-exam" class="btn btn-secondary btn-sm">Finalizar</button></div>
        </header>
        <div class="sim-exam-progress"><span style="width:${(answered / activeSession.questions.length) * 100}%"></span></div>
        <div class="sim-exam-context"><span>${q.subject || q.area || 'Área general'}</span><span>${q.topic || ''}</span></div>
        <article class="question-body sim-question-body">${q.rawQuestion}</article>
        <div class="options-list sim-options-list">
          ${q.options.map(opt => `<button type="button" class="option-item ${activeSession.answers[q.id] === opt.id ? 'selected' : ''}" data-option="${opt.id}"><span class="option-key">${opt.id}</span><span>${opt.text}</span></button>`).join('')}
        </div>
        <nav class="sim-exam-navigation">
          <button id="btn-exam-prev" class="btn btn-secondary" ${activeSession.currentIndex === 0 ? 'disabled' : ''}>${icon('arrowLeft', {size:16})} Anterior</button>
          <span>${answered} respondidas</span>
          <button id="btn-exam-next" class="btn btn-primary" ${activeSession.currentIndex === activeSession.questions.length - 1 ? 'disabled' : ''}>Siguiente ${icon('arrowRight', {size:16})}</button>
        </nav>
        <details class="sim-question-navigator">
          <summary>Ver preguntas <span>${answered}/${activeSession.questions.length} respondidas</span></summary>
          <div class="navigator-grid">
            ${activeSession.questions.map((item, idx) => `<button type="button" class="nav-pill ${activeSession.answers[item.id] ? 'answered' : ''} ${idx === activeSession.currentIndex ? 'active' : ''}" data-index="${idx}">${idx + 1}</button>`).join('')}
          </div>
        </details>
      </section>
    `;

    container.querySelectorAll('[data-option]').forEach(item => item.addEventListener('click', () => {
      activeSession.answers[q.id] = item.dataset.option;
      void persistSession();
      renderActiveExam();
    }));
    container.querySelectorAll('[data-index]').forEach(item => item.addEventListener('click', () => {
      activeSession.currentIndex = Number(item.dataset.index);
      void persistSession();
      renderActiveExam();
    }));
    document.getElementById('btn-exam-prev')?.addEventListener('click', () => {
      if (activeSession.currentIndex > 0) { activeSession.currentIndex--; void persistSession(); renderActiveExam(); }
    });
    document.getElementById('btn-exam-next')?.addEventListener('click', () => {
      if (activeSession.currentIndex < activeSession.questions.length - 1) { activeSession.currentIndex++; void persistSession(); renderActiveExam(); }
    });
    document.getElementById('btn-finish-exam')?.addEventListener('click', () => {
      if (confirm('¿Finalizar y calificar este simulacro?')) finishSession();
    });

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      const diff = Math.max(0, activeSession.endTimestamp - Date.now());
      if (diff <= 0) { clearInterval(timerInterval); finishSession(); return; }
      const sec = Math.floor(diff / 1000), el = document.getElementById('timer-display');
      if (el) el.textContent = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
    }, 1000);
  }

  function finishSession() {
    if (!activeSession || activeSession.finished) return;
    if (timerInterval) clearInterval(timerInterval);
    activeSession.finished = true;
    void persistSession();
    confetti({ particleCount: 55, spread: 58, origin: { y: 0.65 } });
    renderResults();
  }

  function renderResults() {
    const { questions, answers, modality } = activeSession;
    let correct = 0, incorrect = 0, blank = 0;
    const bySubject = {};
    questions.forEach(q => {
      const answer = answers[q.id];
      if (!bySubject[q.subject]) bySubject[q.subject] = { correct: 0, incorrect: 0, blank: 0 };
      if (!answer) { blank++; bySubject[q.subject].blank++; }
      else if (answer === q.correctAnswer) { correct++; bySubject[q.subject].correct++; }
      else { incorrect++; bySubject[q.subject].incorrect++; }
    });
    const score = correct * modality.correctPoints + incorrect * modality.wrongPoints;
    const penalty = incorrect * Math.abs(modality.wrongPoints);
    const subjectRows = Object.entries(bySubject).map(([subject, data]) => `
      <div class="sim-result-subject"><span>${subject}</span><strong>${data.correct}/${data.correct + data.incorrect + data.blank}</strong></div>
    `).join('');

    container.innerHTML = `
      <section class="sim-results-shell">
        <header class="sim-results-heading"><span class="simulator-eyebrow">SIMULACRO COMPLETADO</span><h2>Tu resultado</h2><p>${modality.title} · ${questions.length} preguntas</p></header>
        <div class="sim-score-panel"><span>Puntaje obtenido</span><strong>${score.toFixed(1)} <small>pts</small></strong><div>+ ${(correct * modality.correctPoints).toFixed(1)} por aciertos · − ${penalty.toFixed(1)} por errores · 0 en blanco</div></div>
        <div class="sim-result-stats">
          <div><strong class="positive">${correct}</strong><span>Aciertos</span></div>
          <div><strong class="negative">${incorrect}</strong><span>Errores</span><small>−${(incorrect * Math.abs(modality.wrongPoints)).toFixed(1)} pts</small></div>
          <div><strong>${blank}</strong><span>En blanco</span><small>0 pts</small></div>
        </div>
        <div class="sim-result-breakdown"><h3>Desglose por curso</h3>${subjectRows || '<p>Sin datos por curso.</p>'}</div>
        <div class="sim-result-actions"><button id="btn-back-lobby" class="btn btn-primary">Volver a modalidades</button><button id="btn-view-errors" class="btn btn-secondary">Revisar errores</button></div>
        <p class="simulator-note-muted">Puntaje calculado con los parámetros configurados en PRE - EINSTEIN. Confirma la ponderación de la convocatoria vigente antes de tomarlo como puntaje oficial.</p>
      </section>
    `;

    document.getElementById('btn-back-lobby')?.addEventListener('click', () => { activeSession = null; try { localStorage.removeItem(localStateKey()); } catch {} if (supabase && currentUserId !== 'guest') void supabase.from('student_learning_state').delete().eq('user_id', currentUserId).eq('state_key', 'simulator'); renderLobby(); });
    document.getElementById('btn-view-errors')?.addEventListener('click', () => { window.location.hash = '#mistakes'; });
  }

  void (async () => { const restored = await restoreSession(); if (restored) { if (activeSession.finished) renderResults(); else renderActiveExam(); } else renderLobby(); })();
}
