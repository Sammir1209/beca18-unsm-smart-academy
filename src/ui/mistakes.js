// ==========================================================================
 // VIEW: MIS ERRORES CON HISTORIAL AISLADO POR CUENTA
 // ==========================================================================

import { storage } from '../core/storage.js';
import { repo } from '../core/repository.js';
import { supabase } from '../core/supabase.js';
import { icon } from './icons.js';

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

async function currentOwnerId() {
  try {
    const { data, error } = await supabase?.auth.getSession?.() || {};
    if (error) return 'guest';
    return data?.session?.user?.id || 'guest';
  } catch {
    return 'guest';
  }
}

export async function renderMistakes(container, navigateTo) {
  const ownerId = await currentOwnerId();
  const [allMistakes, legacyGuestMistakes] = await Promise.all([
    storage.getAll('mistakes_by_user'),
    ownerId === 'guest' ? storage.getAll('mistakes') : Promise.resolve([])
  ]);
  const userMistakes = allMistakes.filter(item => item.userId === ownerId);
  const merged = new Map(userMistakes.map(item => [item.questionId, item]));
  for (const item of legacyGuestMistakes) {
    if (!merged.has(item.questionId)) merged.set(item.questionId, { ...item, userId: 'guest' });
  }
  const activeMistakes = [...merged.values()]
    .filter(item => !item.mastered)
    .sort((a, b) => (b.lastFailedAt || 0) - (a.lastFailedAt || 0));

  container.innerHTML = `
    <div style="max-width:900px;margin:0 auto;">
      <div style="margin-bottom:24px;">
        <h2 style="font-size:1.6rem;font-weight:800;margin-bottom:6px;display:flex;align-items:center;gap:10px;">
          ${icon('mistakes', { size: 28, color: 'var(--accent-alert)' })}
          Banco Inteligente de Errores
        </h2>
        <p style="color:var(--text-muted);font-size:.95rem;">
          Tus errores y dudas se guardan separados de los demás perfiles de este dispositivo.
        </p>
      </div>

      ${activeMistakes.length === 0 ? `
        <div class="card" style="text-align:center;padding:48px;">
          <div style="display:flex;justify-content:center;margin-bottom:16px;">
            ${icon('check', { size: 48, color: 'var(--accent-beca)' })}
          </div>
          <h3 style="font-size:1.25rem;font-weight:700;margin-bottom:8px;">No tienes errores pendientes</h3>
          <p style="color:var(--text-muted);font-size:.9rem;margin-bottom:20px;">
            Cuando registres un error o una duda, aparecerá aquí para que puedas reforzar ese tema.
          </p>
          <button id="btn-go-practice" class="btn btn-beca" style="display:inline-flex;align-items:center;gap:8px;">
            ${icon('practice', { size: 18, color: '#064E3B' })}
            Comenzar práctica
          </button>
        </div>
      ` : `
        <div style="display:flex;flex-direction:column;gap:14px;">
          ${activeMistakes.map((mistake) => {
            const question = repo.questions.find(item => item.id === mistake.questionId);
            const counts = [
              mistake.failCount ? `${mistake.failCount} fallos` : '',
              mistake.doubtCount ? `${mistake.doubtCount} dudas` : ''
            ].filter(Boolean).join(' · ');
            return `
              <article class="card" style="border-left:4px solid var(--accent-alert);">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap;margin-bottom:8px;">
                  <div>
                    <span class="tag tag-diff-mid">${escapeHtml(mistake.topic || 'Tema general')}</span>
                    <strong style="margin-left:8px;">${escapeHtml(question?.subject || 'Curso')}</strong>
                  </div>
                  <span style="font-size:.8rem;color:var(--accent-alert);font-weight:600;">
                    ${escapeHtml(counts || 'Reforzar')}
                  </span>
                </div>
                <p style="font-size:.95rem;color:var(--text-main);margin-bottom:14px;">
                  ${escapeHtml(question?.rawQuestion || 'La pregunta original ya no está en el banco local.')}
                </p>
                <div style="display:flex;justify-content:flex-end;">
                  <button class="btn btn-secondary btn-sm" data-retry-question>
                    ${icon('practice', { size: 14, color: 'var(--accent-unsm)' })}
                    Volver a practicar
                  </button>
                </div>
              </article>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;

  document.getElementById('btn-go-practice')?.addEventListener('click', () => navigateTo?.('practice'));
  container.querySelectorAll('[data-retry-question]').forEach(button =>
    button.addEventListener('click', () => navigateTo?.('practice'))
  );
}
