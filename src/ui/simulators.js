// ==========================================================================
// VIEW: SIMULADORES REALISTAS CON ICONOGRAFÍA LUCIDE
// ==========================================================================

import { repo } from '../core/repository.js';
import { icon } from './icons.js';
import confetti from 'canvas-confetti';

export function renderSimulators(container, navigateTo) {
  let activeSession = null;
  let timerInterval = null;

  function renderLobby() {
    container.innerHTML = `
      <div style="max-width: 900px; margin: 0 auto;">
        <div style="margin-bottom: 28px;">
          <h2 style="font-size: 1.6rem; font-weight: 800; margin-bottom: 8px; display: flex; align-items: center; gap: 10px;">
            ${icon('simulator', { size: 28, color: 'var(--accent-unsm)' })}
            Simuladores de Examen Oficial
          </h2>
          <p style="color: var(--text-muted); font-size: 0.95rem;">
            Reproducción fiel de las condiciones de evaluación de Beca 18 (ENP) y la Universidad Nacional de San Martín (UNSM).
          </p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 20px;">
          
          <!-- Beca 18 Card -->
          <div class="card" style="border-top: 4px solid var(--accent-beca);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
              <span class="tag tag-beca">PRONABEC</span>
              <span style="font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-mono); display: flex; align-items: center; gap: 4px;">
                ${icon('simulator', { size: 14, color: 'var(--text-dim)' })} 120 MINUTOS
              </span>
            </div>
            <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 8px;">Examen Nacional de Preselección (ENP)</h3>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 16px;">
              60 preguntas (30 Matemática y 30 Competencia Lectora). Sin penalización por error (estrategia 100% de llenado).
            </p>
            <div style="background-color: var(--bg-card); padding: 12px; border-radius: var(--radius-md); font-size: 0.8rem; margin-bottom: 20px;">
              <strong>Estructura Oficial:</strong> 50% Matemática &bull; 50% Lectura
            </div>
            <button id="btn-start-enp" class="btn btn-beca" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;">
              ${icon('practice', { size: 18, color: '#064E3B' })}
              Iniciar Simulacro Beca 18
            </button>
          </div>

          <!-- UNSM Ordinario Card -->
          <div class="card" style="border-top: 4px solid var(--accent-unsm);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
              <span class="tag tag-unsm">UNSM TARAPOTO</span>
              <span style="font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-mono); display: flex; align-items: center; gap: 4px;">
                ${icon('simulator', { size: 14, color: 'var(--text-dim)' })} 180 MINUTOS
              </span>
            </div>
            <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 8px;">Examen Ordinario de Admisión</h3>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 16px;">
              100 preguntas evaluando Ciencias, Matemáticas y Humanidades. Aplica penalización oficial de puntaje en contra por error.
            </p>
            <div style="background-color: var(--bg-card); padding: 12px; border-radius: var(--radius-md); font-size: 0.8rem; margin-bottom: 20px;">
              <strong>Ponderación UNSM:</strong> +4.0 por acierto &bull; -0.5 por fallo
            </div>
            <button id="btn-start-unsm" class="btn btn-primary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;">
              ${icon('practice', { size: 18, color: '#fff' })}
              Iniciar Simulacro UNSM
            </button>
          </div>

        </div>
      </div>
    `;

    document.getElementById('btn-start-enp')?.addEventListener('click', () => startSimulator('PRONABEC', 120));
    document.getElementById('btn-start-unsm')?.addEventListener('click', () => startSimulator('UNSM', 180));
  }

  function startSimulator(institution, durationMinutes) {
    const pool = repo.questions.filter(q => q.institution === institution || q.institution === 'GENERAL');
    const questions = pool.length > 0 ? pool : repo.questions;

    // Epoch based resilient timestamp
    const endTimestamp = Date.now() + durationMinutes * 60 * 1000;

    activeSession = {
      institution,
      durationMinutes,
      endTimestamp,
      questions,
      currentIndex: 0,
      answers: {}, // questionId -> optionId
      finished: false
    };

    renderActiveExam();
  }

  function renderActiveExam() {
    if (!activeSession) return;

    if (activeSession.finished) {
      renderResults();
      return;
    }

    const q = activeSession.questions[activeSession.currentIndex];
    const remainingMs = Math.max(0, activeSession.endTimestamp - Date.now());
    const totalSec = Math.floor(remainingMs / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const timeFormatted = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

    container.innerHTML = `
      <div style="max-width: 900px; margin: 0 auto;">
        
        <!-- Top Bar del Simulacro: Timer & Finalizar -->
        <div style="display: flex; justify-content: space-between; align-items: center; background-color: var(--bg-surface); padding: 16px 24px; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle); margin-bottom: 24px;">
          <div>
            <span class="tag ${activeSession.institution === 'PRONABEC' ? 'tag-beca' : 'tag-unsm'}">${activeSession.institution}</span>
            <span style="font-weight: 700; margin-left: 8px;">Pregunta ${activeSession.currentIndex + 1} de ${activeSession.questions.length}</span>
          </div>

          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="display: flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 1.25rem; font-weight: 700; color: ${m < 10 ? 'var(--accent-danger)' : 'var(--accent-beca)'};">
              ${icon('simulator', { size: 20, color: m < 10 ? 'var(--accent-danger)' : 'var(--accent-beca)' })}
              <span id="timer-display">${timeFormatted}</span>
            </div>

            <button id="btn-finish-exam" class="btn btn-secondary" style="font-size: 0.85rem; padding: 8px 16px;">
              Finalizar Examen
            </button>
          </div>
        </div>

        <!-- Enunciado del Examen (Modo Estricto: sin soluciones intermedias) -->
        <div class="question-body">
          <div style="font-size: 0.8rem; color: var(--text-dim); margin-bottom: 8px;">
            ${q.subject} &bull; ${q.topic}
          </div>
          ${q.rawQuestion}
        </div>

        <!-- Alternativas -->
        <div class="options-list">
          ${q.options.map(opt => `
            <div class="option-item ${activeSession.answers[q.id] === opt.id ? 'selected' : ''}" data-option="${opt.id}">
              <div class="option-key">${opt.id}</div>
              <div style="flex: 1;">${opt.text}</div>
            </div>
          `).join('')}
        </div>

        <!-- Navegación & Matriz de Preguntas -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 24px;">
          <button id="btn-exam-prev" class="btn btn-secondary" ${activeSession.currentIndex === 0 ? 'disabled' : ''}>
            ${icon('arrowLeft', { size: 16 })} Anterior
          </button>
          <button id="btn-exam-next" class="btn btn-primary" ${activeSession.currentIndex === activeSession.questions.length - 1 ? 'disabled' : ''}>
            Siguiente ${icon('arrowRight', { size: 16 })}
          </button>
        </div>

        <!-- Matriz Rápida de Preguntas -->
        <div class="card" style="padding: 16px;">
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-dim); margin-bottom: 8px; text-transform: uppercase;">
            Navegador Rápido de Preguntas
          </div>
          <div class="navigator-grid">
            ${activeSession.questions.map((item, idx) => `
              <div class="nav-pill ${activeSession.answers[item.id] ? 'answered' : ''} ${idx === activeSession.currentIndex ? 'active' : ''}" data-index="${idx}">
                ${idx + 1}
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;

    // Listeners de Opciones
    container.querySelectorAll('.option-item').forEach(item => {
      item.addEventListener('click', () => {
        const opt = item.getAttribute('data-option');
        activeSession.answers[q.id] = opt;
        renderActiveExam();
      });
    });

    container.querySelectorAll('.nav-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        activeSession.currentIndex = parseInt(pill.getAttribute('data-index'), 10);
        renderActiveExam();
      });
    });

    document.getElementById('btn-exam-prev')?.addEventListener('click', () => {
      if (activeSession.currentIndex > 0) {
        activeSession.currentIndex--;
        renderActiveExam();
      }
    });

    document.getElementById('btn-exam-next')?.addEventListener('click', () => {
      if (activeSession.currentIndex < activeSession.questions.length - 1) {
        activeSession.currentIndex++;
        renderActiveExam();
      }
    });

    document.getElementById('btn-finish-exam')?.addEventListener('click', () => {
      if (confirm('¿Seguro que deseas finalizar y calificar tu examen?')) {
        finishSession();
      }
    });

    // Worker/Timer ticker
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, activeSession.endTimestamp - now);
      if (diff <= 0) {
        clearInterval(timerInterval);
        finishSession();
      } else {
        const sec = Math.floor(diff / 1000);
        const mm = Math.floor(sec / 60);
        const ss = sec % 60;
        const el = document.getElementById('timer-display');
        if (el) el.innerText = `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
      }
    }, 1000);
  }

  function finishSession() {
    if (timerInterval) clearInterval(timerInterval);
    activeSession.finished = true;
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    renderActiveExam();
  }

  function renderResults() {
    let correct = 0;
    let incorrect = 0;
    let blank = 0;

    activeSession.questions.forEach(q => {
      const ans = activeSession.answers[q.id];
      if (!ans) blank++;
      else if (ans === q.correctAnswer) correct++;
      else incorrect++;
    });

    const isUNSM = activeSession.institution === 'UNSM';
    const score = isUNSM 
      ? Math.max(0, correct * 4.0 - incorrect * 0.5)
      : correct * 2.0;

    container.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto;">
        <div style="background-color: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 36px; text-align: center; margin-bottom: 24px;">
          <div style="margin-bottom: 12px;">${icon('award', { size: 48, color: 'var(--accent-beca)' })}</div>
          <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 8px;">Resultados del Simulacro</h2>
          <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 24px;">
            ${activeSession.institution} &bull; Evaluación Completada
          </p>

          <div style="font-size: 3.5rem; font-weight: 800; color: var(--accent-beca); margin-bottom: 4px;">
            ${score.toFixed(1)} <span style="font-size: 1.2rem; color: var(--text-muted);">pts</span>
          </div>
          <div style="font-size: 0.85rem; color: var(--text-dim); margin-bottom: 32px;">
            ${isUNSM ? 'Puntuación con penalización oficial (-0.5 pts por fallo)' : 'Puntuación ENP Beca 18'}
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px;">
            <div style="background-color: var(--bg-card); padding: 16px; border-radius: var(--radius-md);">
              <div style="font-size: 1.5rem; font-weight: 700; color: var(--accent-beca);">${correct}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">Aciertos</div>
            </div>
            <div style="background-color: var(--bg-card); padding: 16px; border-radius: var(--radius-md);">
              <div style="font-size: 1.5rem; font-weight: 700; color: var(--accent-danger);">${incorrect}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">Fallos</div>
            </div>
            <div style="background-color: var(--bg-card); padding: 16px; border-radius: var(--radius-md);">
              <div style="font-size: 1.5rem; font-weight: 700; color: var(--text-dim);">${blank}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">En Blanco</div>
            </div>
          </div>

          <div style="display: flex; justify-content: center; gap: 12px;">
            <button id="btn-back-lobby" class="btn btn-primary">
              Volver a Simuladores
            </button>
            <button id="btn-view-errors" class="btn btn-secondary">
              Revisar Banco de Errores
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-back-lobby')?.addEventListener('click', () => {
      activeSession = null;
      renderLobby();
    });

    document.getElementById('btn-view-errors')?.addEventListener('click', () => {
      window.location.hash = '#mistakes';
    });
  }

  renderLobby();
}
