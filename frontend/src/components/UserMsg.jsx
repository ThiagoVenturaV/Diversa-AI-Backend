import { motion } from 'framer-motion'

export default function UserMsg({ text }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="flex justify-end px-4 sm:px-6 py-2"
    >
      <div className="bubble-user rounded-2xl rounded-tr-[4px] px-5 py-4 text-[15px] sm:text-base leading-7 max-w-[88%] sm:max-w-[80%] break-words text-white">
        {text}
      </div>
    </motion.div>
  )
}
