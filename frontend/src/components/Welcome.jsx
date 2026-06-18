import { motion } from 'framer-motion'

const CHIPS = [
  { fa: 'fa-graduation-cap', text: 'O que é educação inclusiva?' },
  { fa: 'fa-puzzle-piece', text: 'Como incluir alunos com autismo (TEA)?' },
  { fa: 'fa-clipboard-list', text: 'O que é o AEE?' },
  { fa: 'fa-scale-balanced', text: 'Direitos garantidos pela LBI' },
  { fa: 'fa-microchip', text: 'Tecnologia assistiva na escola' },
  { fa: 'fa-people-group', text: 'Como a família pode apoiar a inclusão?' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.15
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

export default function Welcome({ onChip }) {
  return (
    <div className="welcome-container">
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.05 }}
        className="welcome-icon"
      >
        <i className="fa-solid fa-star text-white" style={{ fontSize: '32px' }} />
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ y: 14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.12 }}
        className="welcome-title"
      >
        Olá! Eu sou a Diversa, assistente de Educação Inclusiva.
      </motion.h2>

      {/* Chips */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="chips-container"
      >
        {CHIPS.map((c) => (
          <motion.button
            key={c.text}
            variants={itemVariants}
            onClick={() => onChip(c.text)}
            className="chip"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <i className={`fa-solid ${c.fa}`} style={{ color: 'var(--color-brand-light)', fontSize: '13px' }} />
            <span>{c.text}</span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}
