import { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

export default function InputArea({ value, onChange, onSend, loading }) {
  const ref = useRef(null)
  const [isListening, setIsListening] = useState(false)
  const [srAnnouncement, setSrAnnouncement] = useState('')
  const recognitionRef = useRef(null)
  const valueRef = useRef(value)

  // Sincroniza o valor atual do input para evitar recriação do callback
  useEffect(() => {
    valueRef.current = value
  }, [value])

  const resize = () => {
    if (!ref.current) return
    ref.current.style.height = 'auto'
    ref.current.style.height = Math.min(ref.current.scrollHeight, 140) + 'px'
  }

  useEffect(() => {
    resize()
  }, [value])

  const onKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  const toggleListening = useCallback(() => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) {
        alert("Desculpe, o seu navegador não suporta reconhecimento de voz (Speech Recognition). Recomendamos o Google Chrome.")
        setSrAnnouncement("O reconhecimento de voz não é suportado neste navegador.")
        return
      }

      const baseValue = valueRef.current

      try {
        const rec = new SpeechRecognition()
        rec.lang = 'pt-BR'
        rec.continuous = true // Gravação contínua
        rec.interimResults = true // Captura em tempo real (streaming)

        rec.onstart = () => {
          setIsListening(true)
          setSrAnnouncement("Reconhecimento de voz ativado. Fale agora.")
        }

        rec.onresult = (event) => {
          let finalTranscript = ''
          let interimTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const result = event.results[i]
            if (result.isFinal) {
              finalTranscript += result[0].transcript
            } else {
              interimTranscript += result[0].transcript
            }
          }

          const currentSpeechText = (finalTranscript + interimTranscript).trim()
          if (currentSpeechText) {
            const base = baseValue.trim()
            onChange(base ? `${base} ${currentSpeechText}` : currentSpeechText)
            setSrAnnouncement(`Texto reconhecido em tempo real: ${currentSpeechText}`)
          }
        }

        rec.onerror = (e) => {
          console.error("Erro no reconhecimento de voz:", e.error)
          setIsListening(false)
          setSrAnnouncement(`Erro no reconhecimento de voz: ${e.error}`)
        }

        rec.onend = () => {
          setIsListening(false)
          setSrAnnouncement("Reconhecimento de voz desativado.")
        }

        recognitionRef.current = rec
        rec.start()
      } catch (err) {
        console.error("Falha ao iniciar reconhecimento:", err)
        setIsListening(false)
      }
    }
  }, [isListening, onChange])

  // Setup Keyboard Shortcut Alt+M / Ctrl+M
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.altKey || e.ctrlKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault()
        toggleListening()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleListening])

  const canSend = !loading && value.trim()

  return (
    <div
      className="flex-shrink-0 px-2 sm:px-4 pb-3 sm:pb-5 pt-2 sm:pt-3 border-t border-[rgba(168,19,247,0.12)] bg-[rgba(0,0,0,0.65)] backdrop-blur-md"
    >
      {/* Screen Reader Live Region for Accessibility Announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {srAnnouncement}
      </div>

      <div className="max-w-3xl mx-auto">
        <div
          className="input-wrap flex items-center gap-2 sm:gap-3 px-3 py-2.5 sm:px-5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[rgba(255,255,255,0.03)]"
        >
          <textarea
            ref={ref}
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={onKey}
            placeholder="Pergunte alguma coisa"
            rows={1}
            disabled={loading}
            className="flex-1 text-sm sm:text-base leading-relaxed bg-transparent border-none outline-none text-white resize-none min-h-[28px] sm:min-h-[32px] max-h-[140px] placeholder-[rgba(255,255,255,0.3)] py-1.5"
          />

          {/* Speech-to-Text Microphone Button */}
          <motion.button
            type="button"
            onClick={toggleListening}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isListening ? "Parar gravação de voz" : "Gravar pergunta com voz (Atalho Alt+M)"}
            className={`-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer transition-all ${isListening
              ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.6)]'
              : 'bg-transparent border border-[rgba(168,19,247,0.3)] hover:bg-[rgba(168,19,247,0.1)] text-[#c44ef9]'
              }`}
          >
            {isListening ? (
              <div className="audio-wave-container" aria-hidden="true">
                <div className="audio-wave-bar bg-white w-[2px]" style={{ height: '10px' }} />
                <div className="audio-wave-bar bg-white w-[2px]" style={{ height: '14px' }} />
                <div className="audio-wave-bar bg-white w-[2px]" style={{ height: '8px' }} />
                <div className="audio-wave-bar bg-white w-[2px]" style={{ height: '12px' }} />
                <div className="audio-wave-bar bg-white w-[2px]" style={{ height: '6px' }} />
              </div>
            ) : (
              <i className="fa-solid fa-microphone text-[14px] sm:text-[16px]" />
            )}
          </motion.button>

          {/* Send Button */}
          <motion.button
            onClick={onSend}
            disabled={!canSend}
            whileHover={canSend ? { scale: 1.05 } : {}}
            whileTap={canSend ? { scale: 0.95 } : {}}
            aria-label="Enviar mensagem"
            className="btn-send w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer disabled:cursor-not-allowed text-white"
          >
            <i className="fa-solid fa-paper-plane text-[14px] sm:text-[16px]" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
