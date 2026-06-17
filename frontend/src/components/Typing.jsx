import { motion } from 'framer-motion'
import BotAvatar from './BotAvatar'

export default function Typing() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-3 px-4 py-1"
    >
      <BotAvatar />
      <div className="glass flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-[4px]">
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
      </div>
    </motion.div>
  )
}
