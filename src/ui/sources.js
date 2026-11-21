// ==========================================================================
 // VIEW: INVENTARIO DE FUENTES Y AUDITORÍA DOCUMENTAL
 // ==========================================================================

import { repo } from '../core/repository.js';

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

function safeSourceUrl(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  try {
    const normalized = raw.startsWith('public/') ? `./${raw.slice('public/'.length)}` : raw;
    const url = new URL(normalized, window.location.href);
    if (!['https:', 'http:'].includes(url.protocol)) return null;
    if (url.origin !== window.location.origin && url.protocol !== 'https:') return null;
    return url.href;
  } catch {
    return null;
  }
}

function sourceKind(source) {
  if (source.sourceType === 'USER_PROVIDED') return 'Archivo aportado';
  if (source.sourceType === 'SECUNDARIA') return 'Fuente secundaria · No oficial';
  if (source.sourceType === 'PROCESADO_DESDE_OFICIAL') return 'Derivado de referencia institucional · Por verificar';
  return 'Referencia institucional declarada · Por verificar';
}

function checksumLabel(source) {
  const value = String(source.checksum ?? '');
  if (source.checksumStatus === 'COMPUTED' && /^[a-f0-9]{64}$/i.test(value)) return value;
  return 'No calculado sobre el documento original';
}

export function renderSources(container) {
  const sources = Array.isArray(repo.sources) ? repo.sources : [];
  container.innerHTML = `
    <div style="max-width: 1000px; margin: 0 auto;">
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 1.6rem; font-weight: 800; margin-bottom: 6px;">Inventario de fuentes y trazabilidad</h2>
        <p style="color: var(--text-muted); font-size: 0.95rem;">
          Reúne portales institucionales, referencias secundarias y archivos aportados para la preparación académica.
          La inclusión de una referencia no valida automáticamente el documento, las preguntas ni sus claves.
        </p>
        <p class="simulator-note-muted" style="margin-top: 10px;">
          Las huellas SHA-256 no se mostrarán como verificadas hasta calcularlas sobre el archivo original descargado.
        </p>
      </div>

      ${sources.length ? `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          ${sources.map((source) => {
            const href = safeSourceUrl(source.url);
            const sourceUrl = escapeHtml(source.url || 'Sin dirección registrada');
            const sourceTitle = escapeHtml(source.title || 'Fuente sin título');
            const subjects = Array.isArray(source.subjectsCovered) ? source.subjectsCovered : [];
            return `
              <article class="card">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
                  <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
                    <span class="tag ${source.institution === 'PRONABEC' ? 'tag-beca' : 'tag-unsm'}">${escapeHtml(source.institution || 'Institución no indicada')}</span>
                    <span class="tag tag-unsm">${escapeHtml(source.modality || 'Modalidad no indicada')}</span>
                    <span class="tag tag-diff-basic">${escapeHtml(source.documentType || 'Tipo no indicado')}</span>
                    <span class="tag">${escapeHtml(sourceKind(source))}</span>
                  </div>
                  <span class="tag">${escapeHtml(source.availability || 'Estado no indicado')}</span>
                </div>

                <h3 style="font-size:1.1rem;font-weight:700;margin-bottom:10px;">${sourceTitle}</h3>

                <div style="display:flex;flex-direction:column;gap:7px;font-size:.82rem;color:var(--text-dim);margin-bottom:12px;">
                  <div>
                    <strong>Referencia:</strong>
                    ${href
                      ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" style="color:#60A5FA;text-decoration:none;overflow-wrap:anywhere;">${sourceUrl}</a>`
                      : `<span>${sourceUrl}</span>`}
                  </div>
                  <div><strong>Huella SHA-256:</strong> <code style="font-family:var(--font-mono);color:var(--text-muted);overflow-wrap:anywhere;">${escapeHtml(checksumLabel(source))}</code></div>
                  <div><strong>Verificación:</strong> ${source.checksumStatus === 'COMPUTED' ? 'Hash calculado sobre archivo original' : 'Documento original no hasheado; contenido en revisión'}</div>
                </div>

                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                  ${subjects.map((subject) => `<span class="tag tag-unsm" style="font-size:.7rem;">${escapeHtml(subject)}</span>`).join('')}
                </div>
              </article>
            `;
          }).join('')}
        </div>
      ` : `
        <div class="card" style="padding:32px;text-align:center;color:var(--text-muted);">
          No hay fuentes registradas para mostrar.
        </div>
      `}
    </div>
  `;
}
