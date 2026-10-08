// ==========================================================================
// MAIN CONTROLLER & APPLICATION SHELL CON ICONOGRAFÍA LUCIDE
// ==========================================================================

import './style.css';
import { repo } from './core/repository.js';
import { icon } from './ui/icons.js';
import { renderDashboard } from './ui/dashboard.js';
import { renderPractice } from './ui/practice.js';
import { renderSimulators } from './ui/simulators.js';
import { renderFichas } from './ui/fichas.js';
import { renderFlashcards } from './ui/flashcards.js';
import { renderMistakes } from './ui/mistakes.js';
import { renderSources } from './ui/sources.js';

class App {
  constructor() {
    this.currentRoute = 'dashboard';
    this.init();
  }

  async init() {
    const appEl = document.getElementById('app');
    appEl.innerHTML = `
      <div class="app-layout">
        
        <!-- Sidebar Navigation (Desktop) -->
        <aside class="sidebar">
          <div class="sidebar-header">
            <div class="sidebar-logo">
              ${icon('award', { size: 22, color: '#fff' })}
            </div>
            <div>
              <div class="sidebar-title">Smart Academy</div>
              <div class="sidebar-subtitle">Beca 18 + UNSM</div>
            </div>
          </div>

          <nav class="sidebar-nav">
            <a class="nav-item active" data-route="dashboard">
              ${icon('home', { size: 18 })}
              Inicio
            </a>
            <a class="nav-item" data-route="practice">
              ${icon('practice', { size: 18 })}
              Práctica Activa
            </a>
            <a class="nav-item" data-route="simulators">
              ${icon('simulator', { size: 18 })}
              Simuladores Oficiales
            </a>
            <a class="nav-item" data-route="fichas">
              ${icon('fichas', { size: 18 })}
              Fichas Temáticas
            </a>
            <a class="nav-item" data-route="flashcards">
              ${icon('flashcards', { size: 18 })}
              Flashcards
            </a>
            <a class="nav-item" data-route="mistakes">
              ${icon('mistakes', { size: 18 })}
              Mis Errores
            </a>
            <a class="nav-item" data-route="sources">
              ${icon('sources', { size: 18 })}
              Fuentes & Auditoría
            </a>
          </nav>

          <div class="sidebar-footer">
            <div class="goal-card">
              <div class="goal-header">
                <span>OBJETIVO DUAL</span>
                <span class="tag tag-beca" style="padding: 2px 6px;">2027</span>
              </div>
              <div class="goal-title">Beca 18 + UNSM Ordinario</div>
              <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 4px; display: flex; align-items: center; gap: 4px;">
                ${icon('zap', { size: 12, color: 'var(--accent-beca)' })}
                Núcleo común activado
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Wrapper -->
        <div class="main-wrapper">
          <header class="topbar">
            <div style="display: flex; align-items: center; gap: 12px;">
              <h2 id="topbar-title" class="page-title">Inicio</h2>
            </div>
            <div class="topbar-actions">
              <div class="target-badge">
                <span class="dot-beca"></span>
                <span>Beca 18 (ENP)</span>
                <span style="color: var(--border-subtle);">&bull;</span>
                <span class="dot-unsm"></span>
                <span>UNSM</span>
              </div>
            </div>
          </header>

          <main id="main-content" class="content-container">
            <!-- Dynamic view injected here -->
          </main>
        </div>

        <!-- Bottom Navigation (Mobile) -->
        <nav class="bottom-nav">
          <a class="bottom-nav-item active" data-route="dashboard">
            ${icon('home', { size: 20 })}
            <span>Inicio</span>
          </a>
          <a class="bottom-nav-item" data-route="practice">
            ${icon('practice', { size: 20 })}
            <span>Práctica</span>
          </a>
          <a class="bottom-nav-item" data-route="simulators">
            ${icon('simulator', { size: 20 })}
            <span>Simulador</span>
          </a>
          <a class="bottom-nav-item" data-route="fichas">
            ${icon('fichas', { size: 20 })}
            <span>Fichas</span>
          </a>
          <a class="bottom-nav-item" data-route="mistakes">
            ${icon('mistakes', { size: 20 })}
            <span>Errores</span>
          </a>
        </nav>

      </div>
    `;

    // Bind navigation listeners
    document.querySelectorAll('[data-route]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const route = link.getAttribute('data-route');
        this.navigate(route);
      });
    });

    // Hash change routing support
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'dashboard';
      this.navigate(hash);
    });

    // Load initial data repository and render first route
    await repo.loadInitialData();
    const initialRoute = window.location.hash.replace('#', '') || 'dashboard';
    this.navigate(initialRoute);
  }

  navigate(route) {
    this.currentRoute = route;
    window.location.hash = `#${route}`;

    // Update active nav links
    document.querySelectorAll('[data-route]').forEach(link => {
      if (link.getAttribute('data-route') === route) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update title
    const titles = {
      dashboard: 'Inicio',
      practice: 'Práctica Adaptativa',
      simulators: 'Simuladores de Examen Oficial',
      fichas: 'Fichas Temáticas de Alto Rendimiento',
      flashcards: 'Flashcards Mnemotécnicas',
      mistakes: 'Banco de Errores',
      sources: 'Fuentes Oficiales & Auditoría'
    };
    const titleEl = document.getElementById('topbar-title');
    if (titleEl) titleEl.innerText = titles[route] || 'Smart Academy';

    // Render View
    const contentEl = document.getElementById('main-content');
    if (!contentEl) return;

    switch (route) {
      case 'dashboard':
        renderDashboard(contentEl, this.navigate.bind(this));
        break;
      case 'practice':
        renderPractice(contentEl, this.navigate.bind(this));
        break;
      case 'simulators':
        renderSimulators(contentEl, this.navigate.bind(this));
        break;
      case 'fichas':
        renderFichas(contentEl, this.navigate.bind(this));
        break;
      case 'flashcards':
        renderFlashcards(contentEl, this.navigate.bind(this));
        break;
      case 'mistakes':
        renderMistakes(contentEl, this.navigate.bind(this));
        break;
      case 'sources':
        renderSources(contentEl, this.navigate.bind(this));
        break;
      default:
        renderDashboard(contentEl, this.navigate.bind(this));
        break;
    }
  }
}

new App();
