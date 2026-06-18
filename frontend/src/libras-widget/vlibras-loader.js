/**
 * vlibras-loader.js
 *
 * Injeta o VLibras Widget no DOM e fornece funções utilitárias
 * para controlar o painel do VLibras programaticamente.
 */

const VLIBRAS_APP_URL = 'https://vlibras.gov.br/app';
const VLIBRAS_PLUGIN_SRC = `${VLIBRAS_APP_URL}/vlibras-plugin.js`;

let _loadPromise = null;
let _panelOpen = false;

/**
 * Carrega o VLibras no DOM (idempotente — chame quantas vezes quiser).
 * @returns {Promise<void>} Resolve quando o VLibras estiver pronto.
 */
export function loadVLibras() {
  if (_loadPromise) return _loadPromise;

  _loadPromise = new Promise((resolve, reject) => {
    // Markup exigido pelo VLibras
    const vwContainer = document.createElement('div');
    vwContainer.setAttribute('vw', '');
    vwContainer.setAttribute('data-lw-managed', '');
    vwContainer.className = 'enabled';
    vwContainer.innerHTML = `
      <div vw-access-button class="active"></div>
      <div vw-plugin-wrapper>
        <div class="vw-plugin-top-wrapper"></div>
      </div>
    `;
    // Insere no início do body para não interferir no layout da página
    document.body.insertBefore(vwContainer, document.body.firstChild);

    const script = document.createElement('script');
    script.src = VLIBRAS_PLUGIN_SRC;
    script.async = true;

    script.onload = () => {
      try {
        new window.VLibras.Widget(VLIBRAS_APP_URL);
        // VLibras faz setup assíncrono — aguarda antes de resolver
        setTimeout(resolve, 1800);
      } catch (err) {
        reject(new Error(`[LibrasWidget] Falha ao inicializar VLibras: ${err.message}`));
      }
    };

    script.onerror = () =>
      reject(new Error('[LibrasWidget] Falha ao carregar vlibras-plugin.js'));

    document.body.appendChild(script);
  });

  return _loadPromise;
}

/**
 * Esconde o botão nativo do VLibras.
 * O LibrasWidget usa seu próprio botão customizável.
 */
export function hideVLibrasNativeButton() {
  if (document.getElementById('_lw-hide-native')) return;
  const style = document.createElement('style');
  style.id = '_lw-hide-native';
  style.textContent = `[data-lw-managed] [vw-access-button] { display: none !important; }`;
  document.head.appendChild(style);
}

/**
 * Abre ou fecha o painel do VLibras clicando no seu botão interno.
 * Como o VLibras é estado-based (toggle), chamadas alternadas abrem/fecham.
 */
export function toggleVLibrasPanel() {
  const btn = document.querySelector('[data-lw-managed] [vw-access-button]');
  if (btn) {
    btn.click();
    _panelOpen = !_panelOpen;
  }
}

/** Abre o painel do VLibras (se estiver fechado). */
export function openVLibrasPanel() {
  if (!_panelOpen) toggleVLibrasPanel();
}

/** Fecha o painel do VLibras (se estiver aberto). */
export function closeVLibrasPanel() {
  if (_panelOpen) toggleVLibrasPanel();
}

/** Retorna se o painel está aberto. */
export function isPanelOpen() {
  return _panelOpen;
}
