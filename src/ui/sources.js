// ==========================================================================
// VIEW: FUENTES OFICIALES & AUDITORÍA DOCUMENTAL
// ==========================================================================

import { repo } from '../core/repository.js';

export function renderSources(container, navigateTo) {
  container.innerHTML = `
    <div style="max-width: 1000px; margin: 0 auto;">
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 1.6rem; font-weight: 800; margin-bottom: 6px;">Inventario de Fuentes Oficiales & Auditoría</h2>
        <p style="color: var(--text-muted); font-size: 0.95rem;">
          Trazabilidad documental y hash SHA-256 de bases, prospectos y exámenes de PRONABEC (Beca 18) y UNSM (2023 - 2025).
        </p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 14px;">
        ${repo.sources.map(src => `
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
              <div>
                <span class="tag ${src.institution === 'PRONABEC' ? 'tag-beca' : 'tag-unsm'}">${src.institution}</span>
                <span class="tag tag-unsm">${src.modality}</span>
                <span class="tag tag-diff-basic">${src.documentType}</span>
                <span style="font-weight: 700; font-size: 0.9rem; margin-left: 8px;">Año ${src.year}</span>
              </div>
              <span class="tag tag-beca">${src.availability}</span>
            </div>

            <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 8px;">${src.title}</h3>

            <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; color: var(--text-dim); margin-bottom: 12px;">
              <div><strong>Portal Oficial:</strong> <a href="${src.url}" target="_blank" rel="noreferrer" style="color: #60A5FA; text-decoration: none;">${src.url}</a></div>
              <div><strong>Huella Digital (SHA-256):</strong> <code style="font-family: var(--font-mono); color: var(--text-muted);">${src.checksum}</code></div>
            </div>

            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              ${src.subjectsCovered ? src.subjectsCovered.map(s => `<span class="tag tag-unsm" style="font-size: 0.7rem;">${s}</span>`).join('') : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
