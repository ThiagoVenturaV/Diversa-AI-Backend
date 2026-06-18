import { motion } from 'framer-motion'
import BotAvatar from './BotAvatar'
import SourceCard from './SourceCard'

// ── Markdown mínimo ─────────────────────────────────────────────
function md(raw) {
  if (!raw) return '';
  // Evita re-escapar HTML já processado (ícones FA em msgs de erro)
  if (raw.startsWith('<i ')) return raw;
  return raw
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/(https?:\/\/[^\s<"]+)/g, '<a href="$&" target="_blank" rel="noopener">$&</a>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul class="list-disc pl-5 my-1">$1</ul>')
    .replace(/\n/g, '<br/>');
}

export default function BotMsg({ text, sources, streaming }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="flex items-start gap-4 px-4 sm:px-6 py-2"
    >
      <BotAvatar />
      <div className="flex-1 min-w-0">
        {/* Bubble */}
        <div className="bubble-assistant rounded-2xl rounded-tl-[4px] px-5 py-4 sm:px-6 sm:py-5">
          <div
            className={`text-[15px] sm:text-base leading-8 prose-bot text-[rgba(255,255,255,0.88)] break-words${streaming && text ? ' streaming-cursor' : ''
              }`}
            dangerouslySetInnerHTML={{ __html: md(text) }}
          />
        </div>

        {/* Sources */}
        {sources && sources.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-[11px] font-semibold tracking-wider px-1 mb-2 text-[rgba(168,19,247,0.6)]">
              <i className="fa-solid fa-book mr-1.5" />FONTES CONSULTADAS
            </p>
            {sources.map((s, i) => (
              <SourceCard key={s.url + i} titulo={s.titulo} url={s.url} index={i} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
