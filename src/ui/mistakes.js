// ==========================================================================
// VIEW: MIS ERRORES CON ICONOGRAFÍA LUCIDE
// ==========================================================================

import { storage } from '../core/storage.js';
import { repo } from '../core/repository.js';
import { icon } from './icons.js';

export async function renderMistakes(container, navigateTo) {
  const mistakes = await storage.getAll('mistakes');
  const activeMistakes = (mistakes || []).filter(m => !m.mastered);

  container.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto;">
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 1.6rem; font-weight: 800; margin-bottom: 6px; display: flex; align-items: center; gap: 10px;">
          ${icon('mistakes', { size: 28, color: 'var(--accent-alert)' })}
          Banco Inteligente de Errores ("Mis Errores")
        </h2>
        <p style="color: var(--text-muted); font-size: 0.95rem;">
          Registro automatizado de conceptos fallados y dudas marcadas como "No lo sé". Cada fallo es una oportunidad de refuerzo guiado.
        </p>
      </div>

      ${activeMistakes.length === 0 ? `
        <div class="card" style="text-align: center; padding: 48px;">
          <div style="display: flex; justify-content: center; margin-bottom: 16px;">
            ${icon('check', { size: 48, color: 'var(--accent-beca)' })}
          </div>
          <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 8px;">¡Excelente trabajo! No tienes errores pendientes</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 20px;">
            Has consolidado todos los temas practicados o aún no has iniciado tu sesión diaria.
          </p>
          <button id="btn-go-practice" class="btn btn-beca" style="display: inline-flex; align-items: center; gap: 8px;">
            ${icon('practice', { size: 18, color: '#064E3B' })}
            Comenzar Sesión de Práctica
          </button>
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          ${activeMistakes.map(m => {
            const q = repo.questions.find(item => item.id === m.questionId);
            return `
              <div class="card" style="border-left: 4px solid var(--accent-alert);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                  <div>
                    <span class="tag tag-diff-mid">${m.topic || 'Tema General'}</span>
                    <strong style="margin-left: 8px;">${q ? q.subject : 'Curso'}</strong>
                  </div>
                  <span style="font-size: 0.8rem; color: var(--accent-alert); font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                    ${icon('warning', { size: 14, color: 'var(--accent-alert)' })}
                    ${m.failCount > 0 ? `${m.failCount} fallos` : ''} ${m.doubtCount > 0 ? `&bull; ${m.doubtCount} dudas` : ''}
                  </span>
                </div>

                <p style="font-size: 0.95rem; color: var(--text-main); margin-bottom: 14px;">
                  ${q ? q.rawQuestion : 'Pregunta en análisis...'}
                </p>

                <div style="display: flex; justify-content: flex-end; gap: 10px;">
                  <button class="btn btn-secondary btn-sm" onclick="window.location.hash='#practice'" style="display: inline-flex; align-items: center; gap: 6px;">
                    ${icon('practice', { size: 14, color: 'var(--accent-unsm)' })}
                    Reintentar Pregunta
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;

  document.getElementById('btn-go-practice')?.addEventListener('click', () => {
    window.location.hash = '#practice';
  });
}
