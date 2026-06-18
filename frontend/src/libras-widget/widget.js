/**
 * widget.js
 *
 * Classe principal do LibrasWidget.
 * Renderiza o botão flutuante via Shadow DOM e orquestra
 * o VLibras + translator + MutationObserver.
 */

import { translate } from './translator.js';
import {
  loadVLibras,
  hideVLibrasNativeButton,
  openVLibrasPanel,
  closeVLibrasPanel,
  isPanelOpen,
} from './vlibras-loader.js';
import { getStyles } from './styles.js';

/* ── Ícones SVG ─────────────────────────────────────────────────── */

// Ícone de mão (LIBRAS)
const ICON_HAND = `
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M21 7a1 1 0 0 0-2 0v1.18A3.94 3.94 0 0 0 17 8V7a1 1 0 0 0-2 0v1.18A3.94 3.94 0 0 0 13 8V4a1 1 0 0 0-2 0v8.28a3.95 3.95 0 0 0-2-2.1V7a1 1 0 0 0-2 0v5a7 7 0 0 0 14 0V8a1 1 0 0 0-1-1zM19 12a5 5 0 0 1-10 0v-.54A3.94 3.94 0 0 0 9 12a1 1 0 0 0 2 0 2 2 0 0 1 4 0 1 1 0 0 0 2 0 3.94 3.94 0 0 0-.06-.54A3.93 3.93 0 0 0 19 12z"/>
</svg>`;

// Ícone de fechar (×)
const ICON_CLOSE = `
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
</svg>`;

/* ── Widget ─────────────────────────────────────────────────────── */

export class Widget {
  /**
   * @param {Object} options
   * @param {'bottom-right'|'bottom-left'|'top-right'|'top-left'} [options.position='bottom-right']
   * @param {string}  [options.color='#0078d4']    - Cor principal do botão (hex/hsl/rgb)
   * @param {string}  [options.watchSelector=null] - Seletor CSS dos elementos a observar
   * @param {boolean} [options.autoTranslate=true] - Traduz automaticamente ao detectar elemento novo
   * @param {number}  [options.autoTranslateDelay=400] - Delay (ms) antes de traduzir elemento novo
   */
  constructor(options = {}) {
    this.options = {
      position: 'bottom-right',
      color: '#0078d4',
      watchSelector: null,
      autoTranslate: true,
      autoTranslateDelay: 400,
      ...options,
    };

    this._ready = false;
    this._open = false;
    this._observer = null;

    // Elementos do Shadow DOM
    this._host = null;
    this._shadow = null;
    this._btn = null;
    this._badge = null;
    this._tooltip = null;
    this._ring = null;

    this._build();
  }

  /* ── Setup ──────────────────────────────────────────────────── */

  async _build() {
    // Host element (invisível no DOM principal)
    this._host = document.createElement('div');
    this._host.id = 'libras-widget-host';
    this._host.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:none;';
    document.body.appendChild(this._host);

    // Shadow root
    this._shadow = this._host.attachShadow({ mode: 'open' });

    // Estilos isolados
    const styleEl = document.createElement('style');
    styleEl.textContent = getStyles(this.options);
    this._shadow.appendChild(styleEl);

    // Anel pulsante (atrás do botão)
    this._ring = document.createElement('div');
    this._ring.id = 'lw-ring';
    this._shadow.appendChild(this._ring);

    // Botão principal
    this._btn = document.createElement('button');
    this._btn.id = 'lw-btn';
    this._btn.setAttribute('aria-label', 'Ativar tradução para LIBRAS');
    this._btn.style.pointerEvents = 'all';
    this._btn.innerHTML = `<div id="lw-loader"></div>`;
    this._shadow.appendChild(this._btn);

    // Badge de status
    this._badge = document.createElement('div');
    this._badge.id = 'lw-badge';
    this._badge.setAttribute('aria-hidden', 'true');
    this._btn.appendChild(this._badge);

    // Tooltip
    this._tooltip = document.createElement('div');
    this._tooltip.id = 'lw-tooltip';
    this._tooltip.textContent = 'Traduzir para LIBRAS';
    this._tooltip.setAttribute('role', 'tooltip');
    this._shadow.appendChild(this._tooltip);

    // Eventos
    this._btn.addEventListener('click', () => this._toggle());
    this._btn.addEventListener('mouseenter', () => {
      if (!this._open) this._tooltip.classList.add('visible');
    });
    this._btn.addEventListener('mouseleave', () => {
      this._tooltip.classList.remove('visible');
    });

    // Carrega VLibras
    try {
      await loadVLibras();
      this._ready = true;

      // Troca loader pelo ícone de mão
      this._btn.innerHTML = ICON_HAND;
      this._btn.appendChild(this._badge);
      this._badge.classList.add('visible');

      // Inicia observer se configurado
      if (this.options.watchSelector) {
        this._startObserver();
      }
    } catch (err) {
      console.error('[LibrasWidget]', err);
      this._btn.innerHTML = '⚠️';
      this._btn.title = 'Erro ao carregar VLibras';
    }
  }

  /* ── Toggle do painel ───────────────────────────────────────── */

  _toggle() {
    if (!this._ready) return;
    this._tooltip.classList.remove('visible');

    this._open = !this._open;

    if (this._open) {
      this._btn.classList.add('is-open');
      this._btn.setAttribute('aria-label', 'Fechar tradutor LIBRAS');
      this._btn.innerHTML = ICON_CLOSE;
      this._btn.appendChild(this._badge);
      openVLibrasPanel();
    } else {
      this._btn.classList.remove('is-open');
      this._btn.setAttribute('aria-label', 'Ativar tradução para LIBRAS');
      this._btn.innerHTML = ICON_HAND;
      this._btn.appendChild(this._badge);
      closeVLibrasPanel();
    }
  }

  /* ── Pulsação visual ao traduzir ────────────────────────────── */

  _pulse() {
    this._ring.classList.remove('pulse');
    // Força reflow para reiniciar a animação
    void this._ring.offsetWidth;
    this._ring.classList.add('pulse');
  }

  /* ── MutationObserver ───────────────────────────────────────── */

  _startObserver() {
    const { watchSelector, autoTranslate, autoTranslateDelay } = this.options;

    this._observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;

          // Verifica se o nó adicionado é o alvo ou contém o alvo
          const targets = node.matches?.(watchSelector)
            ? [node]
            : [...(node.querySelectorAll?.(watchSelector) ?? [])];

          for (const target of targets) {
            if (target.dataset.lwObserved) continue;
            target.dataset.lwObserved = '1';

            if (autoTranslate) {
              setTimeout(() => {
                const text = target.innerText || target.textContent || '';
                if (text.trim()) this.translate(text.trim());
              }, autoTranslateDelay);
            }
          }
        }
      }
    });

    this._observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /* ── API pública ────────────────────────────────────────────── */

  /**
   * Traduz um texto específico para LIBRAS.
   * Abre o painel automaticamente se estiver fechado.
   * @param {string} texto
   */
  translate(texto) {
    if (!this._ready) {
      console.warn('[LibrasWidget] Widget ainda não está pronto. Aguarde o carregamento.');
      return;
    }
    if (!texto?.trim()) return;

    // Garante que o painel está aberto
    openVLibrasPanel();

    this._pulse();
    translate(texto);
  }

  /**
   * Para o MutationObserver e remove o widget do DOM.
   */
  destroy() {
    this._observer?.disconnect();
    this._host?.remove();
  }
}
