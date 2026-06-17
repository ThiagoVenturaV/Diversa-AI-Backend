import { useState, useRef, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Header from './components/Header'
import Welcome from './components/Welcome'
import UserMsg from './components/UserMsg'
import BotMsg from './components/BotMsg'
import Typing from './components/Typing'
import InputArea from './components/InputArea'
import PortalMock from './components/PortalMock'

let _id = 0
const uid = () => ++_id

export default function App() {
  const [isOpen, setIsOpen] = useState(false)
  const [layoutMode, setLayoutMode] = useState('sidebar') // 'sidebar' | 'floating'
  const [msgs, setMsgs] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEl = useRef(null)

  const scroll = useCallback(() => {
    requestAnimationFrame(() => {
      if (chatEl.current) {
        chatEl.current.scrollTop = chatEl.current.scrollHeight
      }
    })
  }, [])

  useEffect(scroll, [msgs, loading, scroll])

  const send = useCallback(async (override) => {
    const q = (override ?? input).trim()
    if (!q || loading) return

    setInput('')
    setLoading(true)

    const uUser = uid()
    const uBot = uid()

    setMsgs(p => [
      ...p,
      { id: uUser, role: 'user', text: q },
      { id: uBot, role: 'bot', text: '', sources: null, streaming: true },
    ])

    let full = ''

    try {
      const res = await fetch('/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta: q }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })

        const parts = buf.split('\n\n')
        buf = parts.pop()

        for (const part of parts) {
          if (!part.trim()) continue
          let ev = 'message', data = ''
          for (const line of part.split('\n')) {
            if (line.startsWith('event: ')) ev = line.slice(7).trim()
            if (line.startsWith('data: ')) data = line.slice(6)
          }
          if (!data) continue
          let obj
          try {
            obj = JSON.parse(data)
          } catch {
            continue
          }

          if (ev === 'sources' && Array.isArray(obj)) {
            setMsgs(p => p.map(m => m.id === uBot ? { ...m, sources: obj } : m))
          }
          if (ev === 'token') {
            full += obj.text
            const snap = full
            setMsgs(p => p.map(m => m.id === uBot ? { ...m, text: snap } : m))
            scroll()
          }
          if (ev === 'done') {
            setMsgs(p => p.map(m => m.id === uBot ? { ...m, streaming: false } : m))
          }
          if (ev === 'error') {
            setMsgs(p => p.map(m => m.id === uBot
              ? {
                  ...m,
                  text: `<i class="fa-solid fa-circle-xmark" style="color:#f75757;margin-right:6px"></i>${obj.message || 'Erro'}`,
                  streaming: false
                }
              : m
            ))
          }
        }
      }
    } catch (e) {
      setMsgs(p => p.map(m => m.id === uBot
        ? {
            ...m,
            text: `<i class="fa-solid fa-triangle-exclamation" style="color:#f75757;margin-right:6px"></i>Falha na conexão: ${e.message}`,
            streaming: false
          }
        : m
      ))
    } finally {
      setLoading(false)
      setMsgs(p => p.map(m => m.id === uBot ? { ...m, streaming: false } : m))
    }
  }, [input, loading, scroll])

  const handleOpenChat = useCallback((mode, initialQuery) => {
    setIsOpen(true)
    if (mode) {
      setLayoutMode(mode)
    }
    if (initialQuery && initialQuery.trim()) {
      send(initialQuery)
    }
  }, [send])

  const noMsgs = msgs.length === 0
  const lastBot = [...msgs].reverse().find(m => m.role === 'bot')
  const showTyping = loading && (!lastBot || lastBot.text === '')

  const renderChatContent = () => (
    <div className="flex flex-col h-full w-full overflow-hidden bg-black text-white">
      <Header 
        layoutMode={layoutMode}
        onChangeLayoutMode={setLayoutMode}
        onClose={() => setIsOpen(false)}
      />

      <div ref={chatEl} className="flex-1 overflow-y-auto w-full px-4">
        <div className="max-w-3xl mx-auto py-6 space-y-4">
          {noMsgs && <Welcome onChip={t => send(t)} />}

          {msgs.map(m =>
            m.role === 'user' ? (
              <UserMsg key={m.id} text={m.text} />
            ) : (
              <BotMsg
                key={m.id}
                text={m.text}
                sources={m.sources}
                streaming={m.streaming}
              />
            )
          )}

          <AnimatePresence>
            {showTyping && <Typing key="typing" />}
          </AnimatePresence>
        </div>
      </div>

      <InputArea
        value={input}
        onChange={setInput}
        onSend={() => send()}
        loading={loading}
      />
    </div>
  )

  return (
    <div className="relative min-h-screen w-full bg-[#f5f8fa] overflow-x-hidden">
      {/* Background site portal mock */}
      <PortalMock onOpenChat={handleOpenChat} />

      {/* Sidebar Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && layoutMode === 'sidebar' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black z-45 cursor-pointer backdrop-blur-xs"
          />
        )}
      </AnimatePresence>

      {/* Chat Widget Container */}
      <AnimatePresence>
        {isOpen && (
          layoutMode === 'sidebar' ? (
            /* Sidebar Drawer Mode */
            <motion.div
              key="sidebar-chat"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 right-0 w-full sm:w-auto sm:max-w-lg md:max-w-xl z-50 glass-premium shadow-2xl flex flex-col overflow-hidden text-white sm:rounded-l-3xl sm:border-l sm:border-[rgba(168,19,247,0.3)]"
            >
              {renderChatContent()}
            </motion.div>
          ) : (
            /* Floating Chat Window Mode */
            <motion.div
              key="floating-chat"
              initial={{ scale: 0.85, opacity: 0, y: 60 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 60 }}
              transition={{ type: 'spring', damping: 20, stiffness: 180 }}
              className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 w-full sm:w-[420px] h-full sm:h-[600px] sm:max-h-[75vh] z-50 glass-premium rounded-none sm:rounded-3xl shadow-[0_24px_50px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden text-white border-none sm:border sm:border-[rgba(168,19,247,0.3)]"
            >
              {renderChatContent()}
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  )
}
