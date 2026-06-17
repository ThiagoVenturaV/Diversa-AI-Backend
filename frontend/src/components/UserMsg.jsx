import { motion } from 'framer-motion'

export default function UserMsg({ text }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="flex justify-end px-4 py-1"
    >
      <div className="bubble-user rounded-2xl rounded-tr-[4px] px-4 py-3 text-sm leading-relaxed max-w-[78%] text-white">
        {text}
      </div>
    </motion.div>
  )
}
