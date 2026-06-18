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
    <div className="flex flex-col items-center text-center px-5 py-8 sm:py-16 sm:px-8 max-w-4xl mx-auto">
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.05 }}
        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6 select-none bg-gradient-to-br from-[#a813f7] to-[#5c09ab] shadow-[0_0_48px_rgba(168,19,247,0.5)]"
      >
        <i className="fa-solid fa-star text-[28px] sm:text-[34px] text-white" />
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ y: 14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.12 }}
        className="text-2xl sm:text-3xl font-bold mb-3 text-white leading-tight"
      >
        Olá! Eu sou a <span className="text-[#a813f7]">Diversa</span>
      </motion.h2>

      {/* Chips */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-3xl"
      >
        {CHIPS.map((c) => (
          <motion.button
            key={c.text}
            variants={itemVariants}
            onClick={() => onChip(c.text)}
            className="chip flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium cursor-pointer active:scale-95 text-center"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <i cclassName={`fa-solid ${c.fa} text-[12px] sm:text-[14px] text-[#a813f7]`} />
            <span>{c.text}</span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}
