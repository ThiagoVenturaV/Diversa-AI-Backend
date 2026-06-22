import { motion } from 'framer-motion'
import BotAvatar from './BotAvatar'
import SourceCard from './SourceCard'

// ── Markdown mínimo ─────────────────────────────────────────────
function md(raw) {
  if (!raw) return '';
  // Evita re-escapar HTML já processado (ícones FA em msgs de erro)
  if (raw.startsWith('<i ')) return raw;
  
  let html = raw
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/(https?:\/\/[^\s<"]+)/g, '<a href="$&" target="_blank" rel="noopener">$&</a>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
    .replace(/\n/g, '<br/>');

  // Remove o <br/> logo após títulos/strong block para evitar espaçamento duplo
  html = html.replace(/<\/strong><br\s*\/?>/g, '</strong>');
  // Substitui múltiplos quebras de linha por espaçadores limpos
  html = html.replace(/(<br\s*\/?>){2,}/g, '<div style="height: 14px"></div>');
  
  return html;
}

export default function BotMsg({ text, sources, streaming, onTranslate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="bot-msg-container"
    >
      <BotAvatar />
      <div className="bot-text-wrapper">
        {/* Traduzir para Libras Button */}
        {text && (
          <button
            onClick={() => onTranslate?.(text)}
            className="btn-translate-libras"
            title="Traduzir resposta para LIBRAS"
            disabled={streaming}
          >
            <i className="fa-solid fa-hands-asl-interpreting" />
            <span>Traduzir LIBRAS</span>
          </button>
        )}

        {/* Texto corrido — sem fundo, sem borda */}
        <div
          className={`prose-bot${streaming && text ? ' streaming-cursor' : ''}`}
          dangerouslySetInnerHTML={{ __html: md(text) }}
        />

        {/* Sources */}
        {sources && sources.length > 0 && (
          <div>
            <p className="sources-title">
              FONTES CONSULTADAS
            </p>
            <div className="sources-container">
              {sources.map((s, i) => (
                <SourceCard key={s.url + i} titulo={s.titulo} url={s.url} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
