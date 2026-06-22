import { motion } from 'framer-motion'

export default function Header({ layoutMode, onChangeLayoutMode, onClose, currentProfile, onChangeProfile }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="chat-header"
    >
      {/* Logo */}
      <div className="chat-header-logo">
        <i className="fa-solid fa-star text-white" style={{ fontSize: '11px' }} />
      </div>

      <div className="chat-header-title-container">
        <h1 className="chat-header-title">Assistente Diversa AI</h1>
        <select
          value={currentProfile}
          onChange={(e) => onChangeProfile(e.target.value)}
          className="profile-selector-dropdown"
          title="Escolha o perfil de resposta"
        >
          <option value="familia">Família 👨‍👩‍👧‍👦</option>
          <option value="professor">Professor 🏫</option>
          <option value="gestor">Gestor 💼</option>
        </select>
      </div>

      {/* Controls Container */}
      <div className="chat-header-controls">
        {/* Layout Mode Toggler */}
        <button
          onClick={() => onChangeLayoutMode(layoutMode === 'sidebar' ? 'floating' : 'sidebar')}
          className="btn-layout-toggle"
          title={layoutMode === 'sidebar' ? "Mudar para Janela Flutuante" : "Mudar para Painel Lateral"}
          aria-label={layoutMode === 'sidebar' ? "Mudar para Janela Flutuante" : "Mudar para Painel Lateral"}
        >
          {layoutMode === 'sidebar' ? (
            <i className="fa-solid fa-window-restore" style={{ fontSize: '12px' }} />
          ) : (
            <i className="fa-solid fa-table-columns" style={{ fontSize: '12px' }} />
          )}
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-chat-close"
          title="Fechar assistente"
          aria-label="Fechar assistente"
        >
          <i className="fa-solid fa-xmark" style={{ fontSize: '14px' }} />
        </button>
      </div>
    </motion.header>
  )
}
