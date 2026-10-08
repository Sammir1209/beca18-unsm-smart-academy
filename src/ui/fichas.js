// ==========================================================================
// VIEW: FICHAS TEMÁTICAS CON TEORÍA ENRIQUECIDA, FÓRMULAS E ICONOS
// ==========================================================================

import { repo } from '../core/repository.js';
import { voiceTutor } from '../core/voiceTutor.js';
import { icon } from './icons.js';

export function renderFichas(container, navigateTo) {
  let selectedFicha = null;
  let activeSubjectFilter = 'ALL';

  function getFilteredFichas() {
    if (activeSubjectFilter === 'ALL') return repo.fichas;
    return repo.fichas.filter(f => f.subject === activeSubjectFilter);
  }

  function renderList() {
    const list = getFilteredFichas();

    container.innerHTML = `
      <div style="max-width: 1000px; margin: 0 auto;">
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 1.6rem; font-weight: 800; margin-bottom: 6px; display: flex; align-items: center; gap: 10px;">
            ${icon('fichas', { size: 28, color: 'var(--accent-unsm)' })}
            Fichas Temáticas de Alto Rendimiento (${repo.fichas.length} Fichas)
          </h2>
          <p style="color: var(--text-muted); font-size: 0.95rem;">
            Teoría comprensible y visual, fórmulas esenciales, ejemplos paso a paso, trucos rápidos de examen y mini-prácticas inmediatas.
          </p>
        </div>

        <!-- Barra de Filtros de Curso en Fichas -->
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px;">
          <button class="btn btn-sm ${activeSubjectFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}" data-filter="ALL">
            Todos (${repo.fichas.length})
          </button>
          <button class="btn btn-sm ${activeSubjectFilter === 'Aritmetica' ? 'btn-beca' : 'btn-secondary'}" data-filter="Aritmetica">
            Aritmética
          </button>
          <button class="btn btn-sm ${activeSubjectFilter === 'Algebra' ? 'btn-primary' : 'btn-secondary'}" data-filter="Algebra">
            Álgebra
          </button>
          <button class="btn btn-sm ${activeSubjectFilter === 'Geometria' ? 'btn-primary' : 'btn-secondary'}" data-filter="Geometria">
            Geometría
          </button>
          <button class="btn btn-sm ${activeSubjectFilter === 'Razonamiento Matematico' ? 'btn-beca' : 'btn-secondary'}" data-filter="Razonamiento Matematico">
            RM
          </button>
          <button class="btn btn-sm ${activeSubjectFilter === 'Fisica' ? 'btn-primary' : 'btn-secondary'}" data-filter="Fisica">
            Física
          </button>
          <button class="btn btn-sm ${activeSubjectFilter === 'Quimica' ? 'btn-primary' : 'btn-secondary'}" data-filter="Quimica">
            Química
          </button>
          <button class="btn btn-sm ${activeSubjectFilter === 'Historia del Peru' ? 'btn-primary' : 'btn-secondary'}" data-filter="Historia del Peru">
            Historia
          </button>
          <button class="btn btn-sm ${activeSubjectFilter === 'Cultura General' ? 'btn-beca' : 'btn-secondary'}" data-filter="Cultura General">
            Cultura General
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 18px;">
          ${list.map(f => `
            <div class="card ficha-card" data-id="${f.id}" style="cursor: pointer; display: flex; flex-direction: column;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <span class="tag tag-unsm">${f.subject}</span>
                <span class="tag ${f.level === 'BASICO' ? 'tag-diff-basic' : 'tag-diff-mid'}">${f.level}</span>
              </div>
              <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 8px;">${f.title}</h3>
              <p style="color: var(--text-muted); font-size: 0.85rem; line-height: 1.5; margin-bottom: 16px; flex: 1;">
                ${f.summary}
              </p>
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; color: var(--accent-beca); font-weight: 600; border-top: 1px solid var(--border-subtle); padding-top: 12px;">
                <span style="display: flex; align-items: center; gap: 4px;">
                  ${icon(f.iconKey || 'book', { size: 14, color: 'var(--accent-beca)' })}
                  ${f.formulas ? f.formulas.length : 0} Fórmulas &bull; 3 Ejercicios
                </span>
                <span style="display: flex; align-items: center; gap: 2px;">
                  Estudiar ${icon('chevronRight', { size: 14 })}
                </span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeSubjectFilter = btn.getAttribute('data-filter');
        renderList();
      });
    });

    container.querySelectorAll('.ficha-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        selectedFicha = repo.getFichaById(id);
        renderDetail();
      });
    });
  }

  function renderDetail() {
    if (!selectedFicha) return;
    const f = selectedFicha;

    container.innerHTML = `
      <div style="max-width: 880px; margin: 0 auto;">
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <button id="btn-back-fichas" class="btn btn-secondary" style="padding: 6px 14px; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 6px;">
            ${icon('arrowLeft', { size: 14 })} Volver a Fichas
          </button>

          <div style="display: flex; gap: 8px;">
            <button id="btn-voice-stop-ficha" class="btn btn-secondary btn-sm" style="display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--accent-danger); color: #FECACA;">
              ${icon('stop', { size: 14, color: 'var(--accent-danger)' })}
              Detener Voz
            </button>
            <button id="btn-voice-read-ficha" class="btn btn-primary btn-sm" style="display: inline-flex; align-items: center; gap: 6px;">
              ${icon('zap', { size: 14, color: '#fff' })}
              Escuchar Teoría con IA
            </button>
          </div>
        </div>

        <div class="card" style="margin-bottom: 24px;">
          <div style="display: flex; gap: 8px; margin-bottom: 12px;">
            <span class="tag tag-unsm">${f.subject}</span>
            <span class="tag tag-beca">${f.topic}</span>
            <span class="tag tag-diff-basic">${f.subtopic || ''}</span>
          </div>
          <h1 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 12px;">${f.title}</h1>
          <p style="color: var(--text-muted); font-size: 1.05rem; line-height: 1.7; margin-bottom: 24px;">
            ${f.summary}
          </p>

          <!-- Conceptos Nucleares Visuales -->
          ${f.concepts && f.concepts.length > 0 ? `
            <div style="margin-bottom: 28px;">
              <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 14px; color: #93C5FD; display: flex; align-items: center; gap: 8px;">
                ${icon('brain', { size: 20, color: 'var(--accent-unsm)' })}
                Marco Teórico Esencial (Sin rodeos)
              </h3>
              <div style="display: flex; flex-direction: column; gap: 12px;">
                ${f.concepts.map(c => `
                  <div style="background-color: var(--bg-card); padding: 16px 20px; border-radius: var(--radius-md); border-left: 3px solid var(--accent-unsm);">
                    <strong style="color: #60A5FA; font-size: 0.95rem; display: block; margin-bottom: 6px;">${c.name}</strong>
                    <div style="color: var(--text-main); font-size: 0.9rem; line-height: 1.6;">${c.description}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Fórmulas y Reglas Destacadas -->
          ${f.formulas && f.formulas.length > 0 ? `
            <div style="margin-bottom: 28px;">
              <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 14px; color: var(--accent-beca); display: flex; align-items: center; gap: 8px;">
                ${icon('zap', { size: 20, color: 'var(--accent-beca)' })}
                Formulario de Examen & Atajos Rápidos
              </h3>
              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${f.formulas.map(formula => `
                  <div style="background-color: var(--bg-card); padding: 14px 18px; border-radius: var(--radius-md); border-left: 3px solid var(--accent-beca); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                    <span style="font-size: 0.9rem; font-weight: 600;">${formula.label}</span>
                    <code style="font-family: var(--font-mono); font-size: 0.95rem; color: #A7F3D0; font-weight: 700; background-color: rgba(16, 185, 129, 0.1); padding: 4px 10px; border-radius: 6px;">${formula.formula}</code>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Ejemplo Resuelto Paso a Paso -->
          ${f.examples && f.examples.length > 0 ? `
            <div style="margin-bottom: 28px;">
              <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 14px; color: var(--accent-beca); display: flex; align-items: center; gap: 8px;">
                ${icon('check', { size: 20, color: 'var(--accent-beca)' })}
                Ejemplo Guiado Paso a Paso
              </h3>
              <div style="background-color: var(--bg-card); padding: 20px; border-radius: var(--radius-md);">
                <div style="font-weight: 600; font-size: 1rem; margin-bottom: 12px;">${f.examples[0].statement}</div>
                <div style="border-top: 1px solid var(--border-subtle); padding-top: 12px;">
                  <strong style="font-size: 0.85rem; color: var(--accent-beca);">Solución Guiada:</strong>
                  <ul style="margin-top: 8px; margin-left: 20px; font-size: 0.95rem; color: var(--text-muted);">
                    ${f.examples[0].solution.map(s => `<li style="margin-bottom: 6px;">${s}</li>`).join('')}
                  </ul>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Tips y Trampas con Iconos Claros -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 28px;">
            <div style="background-color: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: var(--radius-md); padding: 16px; display: flex; align-items: flex-start; gap: 10px;">
              <div style="flex-shrink: 0; margin-top: 2px;">${icon('lightbulb', { size: 22, color: 'var(--accent-alert)' })}</div>
              <div>
                <strong style="color: var(--accent-alert); font-size: 0.9rem; display: block; margin-bottom: 6px;">Tips de Resolución Rápida</strong>
                <ul style="margin-left: 18px; font-size: 0.85rem; color: var(--text-muted);">
                  ${f.tips ? f.tips.map(t => `<li style="margin-bottom: 4px;">${t}</li>`).join('') : ''}
                </ul>
              </div>
            </div>

            <div style="background-color: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-md); padding: 16px; display: flex; align-items: flex-start; gap: 10px;">
              <div style="flex-shrink: 0; margin-top: 2px;">${icon('warning', { size: 22, color: 'var(--accent-danger)' })}</div>
              <div>
                <strong style="color: var(--accent-danger); font-size: 0.9rem; display: block; margin-bottom: 6px;">Trampa Clásica en el Examen</strong>
                <ul style="margin-left: 18px; font-size: 0.85rem; color: var(--text-muted);">
                  ${f.commonMistakes ? f.commonMistakes.map(m => `<li style="margin-bottom: 4px;">${m}</li>`).join('') : ''}
                </ul>
              </div>
            </div>
          </div>

          <!-- Mini Práctica de Validación Inmediata -->
          ${f.miniPractice && f.miniPractice.length > 0 ? `
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
                ${icon('target', { size: 20, color: 'var(--accent-unsm)' })}
                Mini Práctica de Validación Inmediata (3 Preguntas)
              </h3>
              <div style="display: flex; flex-direction: column; gap: 12px;">
                ${f.miniPractice.map((p, idx) => `
                  <div style="background-color: var(--bg-card); padding: 16px; border-radius: var(--radius-md);">
                    <div style="font-weight: 600; font-size: 0.95rem; margin-bottom: 8px;">
                      ${idx + 1}. ${p.question}
                    </div>
                    <div style="font-size: 0.85rem; color: var(--accent-beca); font-weight: 700;">
                      ✓ Respuesta: ${p.answer}
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-dim); margin-top: 4px;">
                      ${p.quickExplanation}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

        </div>
      </div>
    `;

    document.getElementById('btn-back-fichas')?.addEventListener('click', () => {
      voiceTutor.stopSpeaking();
      selectedFicha = null;
      renderList();
    });

    document.getElementById('btn-voice-stop-ficha')?.addEventListener('click', () => {
      voiceTutor.stopSpeaking();
    });

    document.getElementById('btn-voice-read-ficha')?.addEventListener('click', () => {
      const textToRead = `Ficha de ${f.title}. En el curso de ${f.subject}. ${f.summary}. Concepto fundamental: ${f.concepts ? f.concepts[0].description : ''}. Tip de examen: ${f.tips ? f.tips[0] : ''}.`;
      voiceTutor.speak(textToRead);
    });
  }

  renderList();
}
