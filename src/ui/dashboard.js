// ==========================================================================
// VIEW: DASHBOARD / HOME CON ICONOGRAFÍA LUCIDE
// ==========================================================================

import { repo } from '../core/repository.js';
import { RecommendationEngine } from '../core/recommendation.js';
import { icon } from './icons.js';

export async function renderDashboard(container, navigateTo) {
  const diag = await RecommendationEngine.getDiagnosticSummary(repo.questions);

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 32px;">
      
      <!-- Saludo & Target Banner -->
      <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(59, 130, 246, 0.12)); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: var(--radius-lg); padding: 32px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 24px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span class="tag tag-beca">Beca 18</span>
            <span class="tag tag-unsm">UNSM Tarapoto</span>
            <span style="font-size: 0.8rem; color: var(--text-dim);">Convocatoria 2027</span>
          </div>
          <h1 style="font-size: 1.85rem; font-weight: 800; margin-bottom: 8px; display: flex; align-items: center; gap: 10px;">
            Buenos días, Postulante
          </h1>
          <p style="color: var(--text-muted); max-width: 600px; font-size: 0.95rem;">
            Tu ruta de preparación está optimizada para el <strong>Núcleo Común (Matemática + Comprensión Lectora)</strong> y la especialización en Ciencias para la UNSM.
          </p>
        </div>
        <div style="display: flex; gap: 12px;">
          <button id="btn-start-practice" class="btn btn-beca">
            ${icon('practice', { size: 18, color: '#064E3B' })}
            Práctica Adaptativa
          </button>
          <button id="btn-start-simulator" class="btn btn-primary">
            ${icon('simulator', { size: 18, color: '#fff' })}
            Simulacro Oficial
          </button>
        </div>
      </div>

      <!-- Métricas Clave -->
      <div class="grid-cards">
        <div class="card">
          <div class="card-header">
            <div>
              <div class="stat-value">${diag.accuracy}%</div>
              <div class="stat-label">Precisión Global</div>
            </div>
            <div class="card-icon emerald">
              ${icon('target', { size: 24, color: 'var(--accent-beca)' })}
            </div>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
            ${icon('check', { size: 14, color: 'var(--accent-beca)' })}
            ${diag.correct} aciertos de ${diag.total} respuestas registradas
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <div class="stat-value">${diag.unresolvedMistakesCount}</div>
              <div class="stat-label">Mis Errores por Dominar</div>
            </div>
            <div class="card-icon amber">
              ${icon('mistakes', { size: 24, color: 'var(--accent-alert)' })}
            </div>
          </div>
          <div style="font-size: 0.8rem; color: var(--accent-alert); display: flex; align-items: center; gap: 6px;">
            ${icon('warning', { size: 14, color: 'var(--accent-alert)' })}
            Repaso inteligente programado
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <div class="stat-value">${repo.fichas.length}</div>
              <div class="stat-label">Fichas Temáticas</div>
            </div>
            <div class="card-icon blue">
              ${icon('fichas', { size: 24, color: 'var(--accent-unsm)' })}
            </div>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
            ${icon('book', { size: 14, color: 'var(--accent-unsm)' })}
            Teoría, trucos y mini-prácticas
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <div class="stat-value">${repo.questions.length}</div>
              <div class="stat-label">Preguntas Oficiales</div>
            </div>
            <div class="card-icon emerald">
              ${icon('star', { size: 24, color: 'var(--accent-beca)' })}
            </div>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
            ${icon('sources', { size: 14, color: 'var(--accent-beca)' })}
            UNSM (Ordinario) y Beca 18 (ENP)
          </div>
        </div>
      </div>

      <!-- Prescripción Adaptativa del Día -->
      <div class="card">
        <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
          ${icon('compass', { size: 20, color: 'var(--accent-beca)' })}
          Recomendado para ti hoy (Motor Diagnóstico)
        </h3>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${diag.recommendations.map(rec => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background-color: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); flex-wrap: wrap; gap: 12px;">
              <div>
                <span class="tag ${rec.priority === 'ALTA' ? 'tag-diff-adv' : 'tag-diff-mid'}">${rec.priority} PRIORIDAD</span>
                <strong style="margin-left: 8px; font-size: 0.95rem;">${rec.topic}</strong>
                <span style="color: var(--text-muted); font-size: 0.85rem; margin-left: 6px;">(${rec.subject})</span>
                <div style="color: var(--text-muted); font-size: 0.85rem; margin-top: 4px;">${rec.action}</div>
              </div>
              <button class="btn btn-secondary btn-sm" onclick="window.location.hash='#fichas'">
                Estudiar Ficha ${icon('chevronRight', { size: 14 })}
              </button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Mapa de Frecuencia Curricular -->
      <div class="card">
        <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
          ${icon('zap', { size: 18, color: 'var(--accent-alert)' })}
          Frecuencia Histórica en Exámenes (2023 - 2025)
        </h3>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 20px;">
          Distribución de temas que han concentrado mayor recurrencia oficial en Beca 18 y UNSM.
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px;">
          <div style="padding: 16px; background-color: var(--bg-card); border-radius: var(--radius-md); border-left: 4px solid var(--accent-beca);">
            <div style="font-weight: 700; display: flex; align-items: center; gap: 6px;">
              ${icon('star', { size: 16, color: 'var(--accent-beca)' })} Tanto por Ciento & Comercio
            </div>
            <div style="font-size: 0.8rem; color: var(--accent-beca); font-weight: 600; margin-top: 4px;">FRECUENCIA MUY ALTA</div>
            <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 4px;">6 preguntas promedio por examen</div>
          </div>
          <div style="padding: 16px; background-color: var(--bg-card); border-radius: var(--radius-md); border-left: 4px solid var(--accent-unsm);">
            <div style="font-weight: 700; display: flex; align-items: center; gap: 6px;">
              ${icon('star', { size: 16, color: 'var(--accent-unsm)' })} Ecuaciones Cuadráticas & Cardano
            </div>
            <div style="font-size: 0.8rem; color: var(--accent-unsm); font-weight: 600; margin-top: 4px;">FRECUENCIA ALTA</div>
            <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 4px;">4 preguntas promedio en Álgebra</div>
          </div>
          <div style="padding: 16px; background-color: var(--bg-card); border-radius: var(--radius-md); border-left: 4px solid var(--accent-beca);">
            <div style="font-weight: 700; display: flex; align-items: center; gap: 6px;">
              ${icon('star', { size: 16, color: 'var(--accent-beca)' })} Inferencia & Idea Principal (RV)
            </div>
            <div style="font-size: 0.8rem; color: var(--accent-beca); font-weight: 600; margin-top: 4px;">FRECUENCIA MUY ALTA</div>
            <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 4px;">50% del ENP Beca 18</div>
          </div>
          <div style="padding: 16px; background-color: var(--bg-card); border-radius: var(--radius-md); border-left: 4px solid var(--accent-alert);">
            <div style="font-weight: 700; display: flex; align-items: center; gap: 6px;">
              ${icon('star', { size: 16, color: 'var(--accent-alert)' })} Cinemática & MRUV (Física)
            </div>
            <div style="font-size: 0.8rem; color: var(--accent-alert); font-weight: 600; margin-top: 4px;">RECURRENTE UNSM</div>
            <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 4px;">Clave para ingenierías y ciencias</div>
          </div>
        </div>
      </div>

    </div>
  `;

  document.getElementById('btn-start-practice')?.addEventListener('click', () => navigateTo('practice'));
  document.getElementById('btn-start-simulator')?.addEventListener('click', () => navigateTo('simulators'));
}
