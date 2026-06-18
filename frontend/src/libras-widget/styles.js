/**
 * styles.js
 *
 * CSS do widget injetado no Shadow DOM.
 * Os estilos ficam completamente isolados da página host.
 */

/**
 * @param {{ color?: string, position?: string }} options
 * @returns {string} CSS completo do widget
 */
export function getStyles(options = {}) {
  const color = options.color || '#0078d4';
  const { v, h } = _parsePosition(options.position || 'bottom-right');

  // Offset da tooltip dependendo do lado
  const tooltipOffset = h === 'right' ? 'right: 16px;' : 'left: 16px;';
  const tooltipVOffset = v === 'bottom' ? 'bottom: 90px;' : 'top: 90px;';

  return `
    :host {
      --lw-color: ${color};
      --lw-color-dark: color-mix(in srgb, ${color} 70%, black);
      --lw-size: 58px;
      --lw-z: 2147483647;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    /* ── Botão principal ──────────────────────────────── */
    #lw-btn {
      position: fixed;
      ${v}: 24px;
      ${h}: 24px;
      z-index: var(--lw-z);
      width: var(--lw-size);
      height: var(--lw-size);
      border-radius: 50%;
      border: none;
      cursor: pointer;
      background: var(--lw-color);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 0 var(--lw-color);
      transition:
        transform 0.18s cubic-bezier(.34,1.56,.64,1),
        box-shadow 0.2s ease,
        background 0.2s ease;
      outline: none;
      -webkit-tap-highlight-color: transparent;
    }

    #lw-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 28px rgba(0, 0, 0, 0.4), 0 0 0 0 var(--lw-color);
      background: var(--lw-color-dark);
    }

    #lw-btn:active {
      transform: scale(0.95);
    }

    #lw-btn:focus-visible {
      box-shadow: 0 0 0 3px white, 0 0 0 5px var(--lw-color);
    }

    /* Estado: painel aberto */
    #lw-btn.is-open {
      background: #1e1e2e;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    }

    /* ── Anel pulsante "traduzindo" ─────────────────── */
    #lw-ring {
      position: fixed;
      ${v}: 24px;
      ${h}: 24px;
      z-index: calc(var(--lw-z) - 1);
      width: var(--lw-size);
      height: var(--lw-size);
      border-radius: 50%;
      background: var(--lw-color);
      pointer-events: none;
      opacity: 0;
    }

    #lw-ring.pulse {
      animation: lw-pulse 1.1s ease-out forwards;
    }

    @keyframes lw-pulse {
      0%   { transform: scale(1);   opacity: 0.6; }
      100% { transform: scale(1.9); opacity: 0; }
    }

    /* ── Ícone SVG ──────────────────────────────────── */
    #lw-btn svg {
      width: 28px;
      height: 28px;
      fill: white;
      transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), opacity 0.15s;
      pointer-events: none;
    }

    /* ── Badge "online" ─────────────────────────────── */
    #lw-badge {
      position: absolute;
      top: 3px;
      right: 3px;
      width: 13px;
      height: 13px;
      border-radius: 50%;
      background: #22c55e;
      border: 2.5px solid white;
      opacity: 0;
      transform: scale(0);
      transition: opacity 0.3s, transform 0.3s cubic-bezier(.34,1.56,.64,1);
    }

    #lw-badge.visible {
      opacity: 1;
      transform: scale(1);
    }

    /* ── Tooltip ────────────────────────────────────── */
    #lw-tooltip {
      position: fixed;
      ${tooltipVOffset}
      ${tooltipOffset}
      z-index: var(--lw-z);
      background: rgba(15, 15, 25, 0.92);
      color: #f0f0f0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.02em;
      padding: 6px 11px;
      border-radius: 7px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transform: translateY(4px);
      transition: opacity 0.18s ease, transform 0.18s ease;
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.08);
    }

    #lw-tooltip.visible {
      opacity: 1;
      transform: translateY(0);
    }

    /* ── Loader (enquanto VLibras carrega) ────────────── */
    #lw-loader {
      width: 20px;
      height: 20px;
      border: 2.5px solid rgba(255,255,255,0.35);
      border-top-color: white;
      border-radius: 50%;
      animation: lw-spin 0.7s linear infinite;
    }

    @keyframes lw-spin {
      to { transform: rotate(360deg); }
    }
  `;
}

function _parsePosition(pos) {
  const [vert, horiz] = (pos || 'bottom-right').split('-');
  return {
    v: ['top', 'bottom'].includes(vert) ? vert : 'bottom',
    h: ['left', 'right'].includes(horiz) ? horiz : 'right',
  };
}
