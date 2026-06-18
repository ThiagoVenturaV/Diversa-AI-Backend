import { Widget } from './widget.js';

class LibrasWidget {
  /**
   * @param {Object} [options]
   * @param {'bottom-right'|'bottom-left'|'top-right'|'top-left'} [options.position='bottom-right']
   * @param {string}  [options.color='#0078d4']
   * @param {string}  [options.watchSelector]    - Seletor CSS p/ auto-tradução de elementos novos
   * @param {boolean} [options.autoTranslate=true]
   * @param {number}  [options.autoTranslateDelay=400]
   */
  constructor(options = {}) {
    this._widget = new Widget(options);
  }

  /**
   * Traduz um texto específico para LIBRAS.
   * Use após uma resposta do chat ser renderizada.
   * @param {string} texto
   */
  translate(texto) {
    this._widget.translate(texto);
    return this;
  }

  /**
   * Remove o widget do DOM e para todos os observers.
   */
  destroy() {
    this._widget.destroy();
  }
}

export default LibrasWidget;

// Expõe globalmente no browser (UMD / script tag)
if (typeof window !== 'undefined') {
  window.LibrasWidget = LibrasWidget;
}
