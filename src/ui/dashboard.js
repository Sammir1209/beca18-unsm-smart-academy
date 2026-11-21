// ==========================================================================
// VIEW: DASHBOARD / HOME CON ICONOGRAFÍA LUCIDE
// ==========================================================================

import { repo } from '../core/repository.js';
import { RecommendationEngine } from '../core/recommendation.js';
import { icon } from './icons.js';
import { supabase } from '../core/supabase.js';

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

export async function renderDashboard(container, navigateTo) {
  const diag = await RecommendationEngine.getDiagnosticSummary(repo.questions);
  const { data: authData } = await supabase?.auth.getSession?.() || { data: { session: null } };
  const user = authData?.session?.user;
  const studentName = String(user?.user_metadata?.full_name || user?.user_metadata?.name || '').trim();
  const greetingName = escapeHtml(studentName ? studentName.split(/\s+/)[0] : 'Postulante');

  container.innerHTML = `
    <div class="dashboard-stack">
      
      <!-- Saludo & Target Banner -->
      <section class="dashboard-hero">
        <div class="dashboard-hero-copy">
          <div class="dashboard-hero-tags">
            <span class="tag tag-beca">Beca 18</span>
            <span class="tag tag-unsm">UNSM Tarapoto</span>
            <span style="font-size: 0.8rem; color: var(--text-dim);">Convocatoria 2027</span>
          </div>
          <h1 class="dashboard-hero-title">
            Buenos días, ${greetingName}
          </h1>
          <p class="dashboard-hero-description">
            Tu ruta de preparación está optimizada para el <strong>Núcleo Común (Matemática + Comprensión Lectora)</strong> y la especialización en Ciencias para la UNSM.
          </p>
        </div>
        <div class="dashboard-einstein-note"><img src="/stickers/einstein-explaining.svg" alt="Einstein explicando"><div><strong>Tu compañero de estudio</strong><span>Einstein te ayuda a comprender, practicar y corregir tus errores.</span></div></div>
        <div class="dashboard-hero-actions">
          <button id="btn-start-practice" class="btn btn-beca">
            ${icon('practice', { size: 18, color: '#064E3B' })}
            Práctica Adaptativa
          </button>
          <button id="btn-start-simulator" class="btn btn-primary">
            ${icon('simulator', { size: 18, color: '#fff' })}
            Simulacro Oficial
          </button>
        </div>
      </section>

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
            <div class="recommendation-row">
              <div class="recommendation-copy">
                <span class="tag ${rec.priority === 'ALTA' ? 'tag-diff-adv' : 'tag-diff-mid'}">${escapeHtml(rec.priority)} PRIORIDAD</span>
                <strong style="margin-left: 8px; font-size: 0.95rem;">${escapeHtml(rec.topic)}</strong>
                <span style="color: var(--text-muted); font-size: 0.85rem; margin-left: 6px;">(${escapeHtml(rec.subject)})</span>
                <div style="color: var(--text-muted); font-size: 0.85rem; margin-top: 4px;">${escapeHtml(rec.action)}</div>
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
        <div class="frequency-grid">
          <div class="frequency-card frequency-card-beca">
            <div style="font-weight: 700; display: flex; align-items: center; gap: 6px;">
              ${icon('star', { size: 16, color: 'var(--accent-beca)' })} Tanto por Ciento & Comercio
            </div>
            <div style="font-size: 0.8rem; color: var(--accent-beca); font-weight: 600; margin-top: 4px;">FRECUENCIA MUY ALTA</div>
            <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 4px;">6 preguntas promedio por examen</div>
          </div>
          <div class="frequency-card frequency-card-unsm">
            <div style="font-weight: 700; display: flex; align-items: center; gap: 6px;">
              ${icon('star', { size: 16, color: 'var(--accent-unsm)' })} Ecuaciones Cuadráticas & Cardano
            </div>
            <div style="font-size: 0.8rem; color: var(--accent-unsm); font-weight: 600; margin-top: 4px;">FRECUENCIA ALTA</div>
            <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 4px;">4 preguntas promedio en Álgebra</div>
          </div>
          <div class="frequency-card frequency-card-beca">
            <div style="font-weight: 700; display: flex; align-items: center; gap: 6px;">
              ${icon('star', { size: 16, color: 'var(--accent-beca)' })} Inferencia & Idea Principal (RV)
            </div>
            <div style="font-size: 0.8rem; color: var(--accent-beca); font-weight: 600; margin-top: 4px;">FRECUENCIA MUY ALTA</div>
            <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 4px;">50% del ENP Beca 18</div>
          </div>
          <div class="frequency-card frequency-card-alert">
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
