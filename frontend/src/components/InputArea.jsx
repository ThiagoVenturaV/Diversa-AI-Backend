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
    <div className="input-section-wrapper">
      {/* Screen Reader Live Region for Accessibility Announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {srAnnouncement}
      </div>

      <div className="input-area-container">
        <div className="input-wrap">
          <textarea
            ref={ref}
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={onKey}
            placeholder="Pergunte alguma coisa"
            rows={1}
            disabled={loading}
            className="chat-textarea"
          />

          {/* Speech-to-Text Microphone Button */}
          <motion.button
            type="button"
            onClick={toggleListening}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isListening ? "Parar gravação de voz" : "Gravar pergunta com voz (Atalho Alt+M)"}
            className={`btn-mic ${isListening ? 'recording' : ''}`}
          >
            {isListening ? (
              <div className="audio-wave-container" aria-hidden="true">
                <div className="audio-wave-bar" />
                <div className="audio-wave-bar" />
                <div className="audio-wave-bar" />
                <div className="audio-wave-bar" />
                <div className="audio-wave-bar" />
              </div>
            ) : (
              <i className="fa-solid fa-microphone" style={{ fontSize: '15px' }} />
            )}
          </motion.button>

          {/* Send Button */}
          <motion.button
            onClick={onSend}
            disabled={!canSend}
            whileHover={canSend ? { scale: 1.05 } : {}}
            whileTap={canSend ? { scale: 0.95 } : {}}
            aria-label="Enviar mensagem"
            className="btn-send"
          >
            <i className="fa-solid fa-paper-plane" style={{ fontSize: '13px' }} />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
