import { motion } from 'framer-motion'

export default function UserMsg({ text }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="user-msg-container"
    >
      <div className="bubble-user">
        {text}
      </div>
    </motion.div>
  )
}
