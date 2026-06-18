import { motion } from 'framer-motion'

export default function SourceCard({ titulo, url, index }) {
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index, 2) * 0.07 }}
      className="source-card flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-decoration-none active:scale-[0.99]"
      whileHover={{ scale: 1.01, x: 3 }}
    >
      {/* Accent bar */}
      <div className="w-[3px] self-stretch rounded-full flex-shrink-0 bg-[#a813f7]" />
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-medium leading-snug text-[rgba(255,255,255,0.85)] m-0"
          style={{ WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {titulo}
        </p>
        <p className="text-[10px] mt-0.5 truncate text-[rgba(168,19,247,0.65)] m-0">
          {url}
        </p>
      </div>
      <i className="fa-solid fa-arrow-up-right-from-square flex-shrink-0 mt-0.5 text-[10px] text-[rgba(168,19,247,0.45)]" />
    </motion.a>
  )
}
