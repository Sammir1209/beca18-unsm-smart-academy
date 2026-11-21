// ==========================================================================
// VIEW: SIMULACROS DE ADMISIÓN — Beca 18 ENP / UNSM Ordinario / Extraordinario
// ==========================================================================

import { repo } from '../core/repository.js';
import { icon } from './icons.js';
import confetti from 'canvas-confetti';

const MODALITIES = {
  ENP: {
    id: 'ENP', institution: 'PRONABEC', examType: 'ENP',
    title: 'Beca 18 · ENP', subtitle: 'Examen Nacional de Preselección',
    duration: 120, standardQuestions: 60, correctPoints: 2, wrongPoints: 0,
    penaltyLabel: 'Sin descuento por error', accent: 'beca',
    description: 'Matemática y Competencia Lectora. Responde todas las preguntas: las respuestas incorrectas no descuentan puntos.'
  },
  ORDINARIO: {
    id: 'ORDINARIO', institution: 'UNSM', examType: 'ORDINARIO',
    title: 'UNSM · Ordinario', subtitle: 'Examen de admisión ordinario',
    duration: 180, standardQuestions: 100, correctPoints: 4, wrongPoints: -0.5,
    penaltyLabel: '−0.5 puntos por error', accent: 'unsm',
    description: 'Evaluación de ciencias, matemática y letras con descuento por cada respuesta incorrecta.'
  },
  EXTRAORDINARIO: {
    id: 'EXTRAORDINARIO', institution: 'UNSM', examType: 'EXTRAORDINARIO',
    title: 'UNSM · Extraordinario', subtitle: 'Modalidad extraordinaria',
    duration: 180, standardQuestions: null, correctPoints: 4, wrongPoints: -0.5,
    penaltyLabel: '−0.5 puntos por error*', accent: 'unsm',
    description: 'Simulacro separado para la modalidad extraordinaria. Se habilitará con preguntas verificadas de esta modalidad.'
  }
};

export function renderSimulators(container, navigateTo) {
  let activeSession = null;
  let timerInterval = null;

  const getPool = (modality) => repo.questions.filter(q =>
    q.institution === modality.institution && q.examType === modality.examType &&
    Array.isArray(q.options) && q.options.length > 1 && q.correctAnswer
  );

  function renderLobby() {
    if (timerInterval) clearInterval(timerInterval);
    const cards = Object.values(MODALITIES).map(modality => {
      const pool = getPool(modality);
      const available = pool.length > 0;
      const countLabel = modality.standardQuestions
        ? `${modality.standardQuestions} preguntas objetivo`
        : 'Banco de preguntas por incorporar';
      return `
        <article class="sim-modality-card ${modality.accent}" data-modality="${modality.id}">
          <div class="sim-card-topline">
            <span class="sim-card-kicker">${modality.institution === 'PRONABEC' ? 'PRONABEC' : 'UNIVERSIDAD NACIONAL DE SAN MARTÍN'}</span>
            <span class="sim-card-duration">${modality.duration} min</span>
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
              ${available ? 'Preparar simulacro' : 'En preparación'}
              ${icon(available ? 'arrowRight' : 'lock', { size: 16 })}
            </button>
          </div>
          ${modality.id === 'EXTRAORDINARIO' && !available ? '<p class="sim-card-note">No se han cargado preguntas extraordinarias validadas. No se reutilizarán preguntas ordinarias como si fueran extraordinarias.</p>' : ''}
        </article>
      `;
    }).join('');

    container.innerHTML = `
      <section class="simulator-hub">
        <header class="simulator-heading">
          <span class="simulator-eyebrow">PREPARACIÓN DE ADMISIÓN</span>
          <h2>Simulacros</h2>
          <p>Elige una modalidad para practicar en condiciones de examen. Cada simulacro tiene su propio tiempo y sistema de puntuación.</p>
        </header>
        <div class="simulator-section-label">
          <div><strong>Modalidades disponibles</strong><span>Selecciona solo una para comenzar</span></div>
          <span class="simulator-bank-count">${repo.questions.length} preguntas en el banco</span>
        </div>
        <div class="simulator-modalities">${cards}</div>
        <aside class="simulator-scoring-note">
          <strong>Cómo se calcula tu puntaje</strong>
          <p><b>ENP:</b> +2 por acierto y 0 por error o pregunta en blanco, según el esquema configurado para este simulador.</p>
          <p><b>UNSM Ordinario:</b> +4 por acierto, −0.5 por error y 0 por pregunta en blanco.</p>
          <p class="simulator-note-muted">La modalidad extraordinaria usará su propia matriz cuando se incorpore documentación y banco de preguntas verificados.</p>
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
    const questions = [...pool].sort(() => Math.random() - 0.5);
    activeSession = {
      modality, institution: modality.institution, durationMinutes: modality.duration,
      endTimestamp: Date.now() + modality.duration * 60 * 1000,
      questions, currentIndex: 0, answers: {}, finished: false
    };
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
      renderActiveExam();
    }));
    container.querySelectorAll('[data-index]').forEach(item => item.addEventListener('click', () => {
      activeSession.currentIndex = Number(item.dataset.index);
      renderActiveExam();
    }));
    document.getElementById('btn-exam-prev')?.addEventListener('click', () => {
      if (activeSession.currentIndex > 0) { activeSession.currentIndex--; renderActiveExam(); }
    });
    document.getElementById('btn-exam-next')?.addEventListener('click', () => {
      if (activeSession.currentIndex < activeSession.questions.length - 1) { activeSession.currentIndex++; renderActiveExam(); }
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
    const score = Math.max(0, correct * modality.correctPoints + incorrect * modality.wrongPoints);
    const penalty = incorrect * Math.abs(modality.wrongPoints);
    const subjectRows = Object.entries(bySubject).map(([subject, data]) => `
      <div class="sim-result-subject"><span>${subject}</span><strong>${data.correct}/${data.correct + data.incorrect + data.blank}</strong></div>
    `).join('');

    container.innerHTML = `
      <section class="sim-results-shell">
        <header class="sim-results-heading"><span class="simulator-eyebrow">SIMULACRO COMPLETADO</span><h2>Tu resultado</h2><p>${modality.title} · ${questions.length} preguntas</p></header>
        <div class="sim-score-panel"><span>Puntaje obtenido</span><strong>${score.toFixed(1)} <small>pts</small></strong><div>+ ${(correct * modality.correctPoints).toFixed(1)} por aciertos · − ${penalty.toFixed(1)} por errores</div></div>
        <div class="sim-result-stats">
          <div><strong class="positive">${correct}</strong><span>Aciertos</span></div>
          <div><strong class="negative">${incorrect}</strong><span>Errores</span><small>−${penalty.toFixed(1)} pts</small></div>
          <div><strong>${blank}</strong><span>En blanco</span><small>0 pts</small></div>
        </div>
        <div class="sim-result-breakdown"><h3>Desglose por curso</h3>${subjectRows || '<p>Sin datos por curso.</p>'}</div>
        <div class="sim-result-actions"><button id="btn-back-lobby" class="btn btn-primary">Volver a modalidades</button><button id="btn-view-errors" class="btn btn-secondary">Revisar errores</button></div>
        <p class="simulator-note-muted">Puntaje calculado con la escala configurada para esta modalidad. Verifica siempre las bases oficiales de admisión de tu convocatoria.</p>
      </section>
    `;

    document.getElementById('btn-back-lobby')?.addEventListener('click', () => { activeSession = null; renderLobby(); });
    document.getElementById('btn-view-errors')?.addEventListener('click', () => { window.location.hash = '#mistakes'; });
  }

  renderLobby();
}
