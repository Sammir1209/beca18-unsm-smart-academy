// ==========================================================================
// VIEW: FLASHCARDS (Repetición Espaciada / Leitner System)
// ==========================================================================

import { repo } from '../core/repository.js';
import { storage } from '../core/storage.js';

export function renderFlashcards(container, navigateTo) {
  let currentIndex = 0;
  let isFlipped = false;
  const cards = repo.flashcards;

  function renderCard() {
    if (!cards || cards.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 48px;">
          <h3>No hay tarjetas mnemotécnicas disponibles.</h3>
        </div>
      `;
      return;
    }

    const c = cards[currentIndex];

    container.innerHTML = `
      <div style="max-width: 680px; margin: 0 auto;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <span class="tag tag-unsm">${c.subject}</span>
            <span class="tag tag-beca">${c.topic}</span>
          </div>
          <span style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-dim);">
            Tarjeta ${currentIndex + 1} de ${cards.length}
          </span>
        </div>

        <!-- Tarjeta Interactiva 3D Flip -->
        <div id="flashcard-box" class="card" style="min-height: 320px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; cursor: pointer; border: 2px dashed ${isFlipped ? 'var(--accent-beca)' : 'var(--border-subtle)'}; background-color: var(--bg-surface); padding: 40px; margin-bottom: 24px; transition: all 0.3s ease;">
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-dim); text-transform: uppercase; margin-bottom: 16px;">
            ${isFlipped ? 'Respuesta & Explicación' : 'Pregunta o Reto Conceptual (Toca para voltear)'}
          </div>

          <div style="font-size: 1.35rem; font-weight: 700; line-height: 1.6; color: ${isFlipped ? '#A7F3D0' : '#fff'};">
            ${isFlipped ? c.back : c.front}
          </div>

          <div style="margin-top: 24px; font-size: 0.8rem; color: var(--text-dim);">
            ${isFlipped ? '✓ Repasado' : '💡 Haz clic en la tarjeta para revelar la respuesta'}
          </div>
        </div>

        <!-- Botones de Autoevaluación Espaciada -->
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button id="btn-fc-hard" class="btn btn-doubt" style="flex: 1;" ${!isFlipped ? 'disabled' : ''}>
            Difícil (Repetir pronto)
          </button>
          <button id="btn-fc-easy" class="btn btn-beca" style="flex: 1;" ${!isFlipped ? 'disabled' : ''}>
            Fácil / Dominada
          </button>
        </div>

      </div>
    `;

    document.getElementById('flashcard-box')?.addEventListener('click', () => {
      isFlipped = !isFlipped;
      renderCard();
    });

    document.getElementById('btn-fc-hard')?.addEventListener('click', () => nextCard(false));
    document.getElementById('btn-fc-easy')?.addEventListener('click', () => nextCard(true));
  }

  function nextCard(mastered) {
    isFlipped = false;
    currentIndex = (currentIndex + 1) % cards.length;
    renderCard();
  }

  renderCard();
}
