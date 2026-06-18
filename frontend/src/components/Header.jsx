import { motion } from 'framer-motion'

export default function Header({ layoutMode, onChangeLayoutMode, onClose }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex-shrink-0 flex items-center gap-3 px-4 py-3 z-10 border-b border-white/10 bg-black/80 backdrop-blur-md"
    >
      {/* Logo */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 select-none bg-[#a813f7] shadow-[0_0_15px_rgba(168,19,247,0.4)]"
      >
        <i className="fa-solid fa-sparkles text-[13px] text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-bold tracking-tight leading-tight m-0 text-white">Assistente Diversa AI</h1>
      </div>

      {/* Controls Container */}
      <div className="flex items-center gap-1">
        {/* Layout Mode Toggler */}
        <button
          onClick={() => onChangeLayoutMode(layoutMode === 'sidebar' ? 'floating' : 'sidebar')}
          className="w-8 h-8 rounded-lg hidden sm:flex items-center justify-center text-[rgba(255,255,255,0.5)] hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-all cursor-pointer"
          title={layoutMode === 'sidebar' ? "Mudar para Janela Flutuante" : "Mudar para Painel Lateral"}
          aria-label={layoutMode === 'sidebar' ? "Mudar para Janela Flutuante" : "Mudar para Painel Lateral"}
        >
          {layoutMode === 'sidebar' ? (
            <i className="fa-solid fa-window-restore text-xs" />
          ) : (
            <i className="fa-solid fa-table-columns text-xs" />
          )}
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[rgba(255,255,255,0.5)] hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-all cursor-pointer"
          title="Fechar assistente"
          aria-label="Fechar assistente"
        >
          <i className="fa-solid fa-xmark text-sm" />
        </button>
      </div>
    </motion.header>
  )
}
