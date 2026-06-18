import { useState } from 'react'
import { motion } from 'framer-motion'

const MOCK_ARTICLES = [
  {
    tag: 'Educação Física',
    titulo: 'Você sabe o que é educação física inclusiva?',
    snippet: 'Historicamente baseada no rendimento, a educação física evolui para uma perspectiva de convívio, participação ativa e flexibilização de regras para todos.',
    query: 'O que é educação física inclusiva?'
  },
  {
    tag: 'Acessibilidade',
    titulo: 'Ouvintismo estrutural e exclusão social da pessoa surda',
    snippet: 'Uma reflexão sobre como o mundo é narrado a partir da matriz ouvinte e a importância de valorizar a identidade, cultura e língua visual (Libras).',
    query: 'O que é ouvintismo estrutural?'
  },
  {
    tag: 'Ensino Superior',
    titulo: 'Como oportunizar o acesso de alunos com Asperger à universidade',
    snippet: 'A importância de disponibilizar intérpretes de enunciados e recursos de acessibilidade adequados durante os processos seletivos e vestibulares.',
    query: 'Como apoiar alunos com Asperger no ensino superior?'
  },
  {
    tag: 'Sobre o Projeto',
    titulo: 'Princípios fundamentais da Educação Inclusiva',
    snippet: 'Toda pessoa tem o direito de estudar na escola comum, toda pessoa aprende de forma singular, e o convívio beneficia a todos os estudantes.',
    query: 'Quais são os princípios da educação inclusiva?'
  }
]

export default function PortalMock({ onOpenChat }) {
  const [searchValue, setSearchValue] = useState('')

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchValue.trim()) {
      onOpenChat('sidebar', searchValue)
      setSearchValue('')
    }
  }

  const handleSearchFocus = () => {
    onOpenChat('sidebar', '')
  }

  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col font-sans relative">
      {/* Grain overlay for filmic premium texture */}
      <div className="grain-overlay" />

      {/* Grid of dots for futuristic geometric layout */}
      <div className="hero-grid-bg" />

      {/* Background glow spots */}
      <div className="hero-glow" />

      {/* Institutional Header */}
      <header className="w-full sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/10 flex justify-center">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo Diversa */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <span className="w-8 h-8 rounded-lg bg-[#a813f7] flex items-center justify-center text-white font-black text-lg shadow-[0_0_12px_rgba(168,19,247,0.5)]">
                D
              </span>
              <span className="text-xl font-extrabold tracking-tight text-white">
                DIVERSA
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#artigos" className="text-sm font-medium text-white/60 hover:text-[#a813f7] transition-colors">
                Artigos
              </a>
              <a href="#relatos" className="text-sm font-medium text-white/60 hover:text-[#a813f7] transition-colors">
                Relatos de Experiência
              </a>
              <a href="#materiais" className="text-sm font-medium text-white/60 hover:text-[#a813f7] transition-colors">
                Materiais Pedagógicos
              </a>
              <a href="#sobre" className="text-sm font-medium text-white/60 hover:text-[#a813f7] transition-colors">
                Sobre o DIVERSA
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Accessibility Buttons (Visual Mock) */}
            <button
              className="h-9 px-2.5 sm:px-3 rounded-lg border border-white/10 hover:border-white/20 text-xs font-semibold text-white/80 hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              aria-label="Ativar Alto Contraste"
            >
              <i className="fa-solid fa-circle-half-stroke" />
              <span className="hidden sm:inline">Alto Contraste</span>
            </button>

            <button
              onClick={() => onOpenChat('floating', 'Quais são os princípios da educação inclusiva?')}
              className="h-9 px-4 rounded-lg bg-[#a813f7] hover:bg-[#c44ef9] text-xs font-bold text-white shadow-[0_0_15px_rgba(168,19,247,0.3)] hover:shadow-[0_0_22px_rgba(168,19,247,0.5)] transition-all cursor-pointer hidden sm:flex items-center justify-center gap-1.5"
            >
              Falar com Assistente
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full pt-24 pb-10 sm:pt-28 sm:pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-white/5 flex flex-col items-center justify-center">
        <div className="w-full max-w-3xl flex flex-col items-center text-center relative z-10 gap-5">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-5 leading-[1.05] uppercase text-center">
            Educação Inclusiva <p className="text-lg sm:text-xl text-[#c44ef9] font-medium">
              na prática
            </p>
          </h1>

          {/* Ask AI Bar in Hero */}
          <div className="w-full max-w-3xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 pl-3 sm:pl-4 pr-1.5 py-1.5 flex items-center gap-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-[#a813f7]/30 focus-within:border-[#a813f7] focus-within:shadow-[0_0_30px_rgba(168,19,247,0.2)]">
                <div className="flex items-center text-white/40 flex-shrink-0">
                  <i className="fa-solid fa-magnifying-glass text-sm sm:text-lg" />
                </div>
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={handleSearchFocus}
                  placeholder="Perguntar à IA do Diversa..."
                  className="flex-1 min-w-0 bg-transparent text-white placeholder-white/30 outline-none text-xs sm:text-base font-medium py-2 px-1"
                  aria-label="Ask AI Bar: digite sua pergunta para abrir a inteligência artificial"
                />
                <button
                  type="submit"
                  className="bg-[#a813f7] hover:bg-[#c44ef9] text-white h-10 sm:h-11 px-4 sm:px-6 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 flex-shrink-0"
                >
                  <span className="hidden sm:inline">Perguntar IA</span>
                  <i className="fa-solid fa-paper-plane sm:hidden" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Main Content Articles Grid */}  
      <main id="artigos" className="w-full flex-1 flex flex-col items-center py-10">
        <div className="w-full max-w-[1600px] px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Artigos em Destaque
              </h2>
            </div>
            <a href="#todos" className="text-sm font-semibold text-[#a813f7] hover:text-[#c44ef9] hover:underline flex items-center gap-1">
              Ver todos os artigos
              <i className="fa-solid fa-arrow-right text-xs" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {MOCK_ARTICLES.map((art, idx) => (
              <div
                key={idx}
                className="glass-card rounded-2xl p-5 lg:p-6 flex flex-col justify-between group shadow-xl min-h-[100px]"
              >
                <div>
                  <span className="inline-block bg-white/5 text-white/80 border border-white/10 text-[10px] font-bold px-2.5 py-1 rounded-md mb-4 uppercase tracking-wider">
                    {art.tag}
                  </span>
                  <h3 className="text-xl font-bold text-white group-hover:text-[#a813f7] transition-colors mb-3">
                    {art.titulo}
                  </h3>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                  <a
                    href="#ler"
                    className="text-sm font-bold text-white/80 hover:text-[#a813f7] transition-colors flex items-center gap-1.5"
                  >
                    Ler artigo
                    <i className="fa-solid fa-arrow-up-right-from-square text-xs text-white/40" />
                  </a>

                  {/* Glowing AI Ask Button on Card */}
                  <button
                    onClick={() => onOpenChat('sidebar', art.query)}
                    className="flex items-center gap-1.5 px-4.0 py-2 rounded-lg text-xs font-bold text-white bg-[#a813f7] hover:bg-[#c44ef9] transition-all cursor-pointer shadow-[0_0_12px_rgba(168,19,247,0.3)] hover:shadow-[0_0_20px_rgba(168,19,247,0.5)]"
                    aria-label={`Perguntar à IA sobre ${art.titulo}`}
                  >
                    <i className="fa-solid fa-sparkles text-[10px]" />
                    Perguntar IA
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Institutional Footer */}
      <footer className="w-full bg-black text-white/40 py-12 border-t border-white/10 flex justify-center">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">       
          </div>
          <p className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            © {new Date().getFullYear()} DIVERSA AI. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Floating Assistant Icon - Fixed Bottom Right */}
      <motion.button
        onClick={() => onOpenChat('floating', '')}
        className="floating-assistant fixed bottom-6 right-6 w-14 h-14 bg-[#a813f7] hover:bg-[#c44ef9] text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(168,19,247,0.5)] cursor-pointer z-40 focus-visible:ring-4 focus-visible:ring-[#a813f7]/50"
        aria-label="Abrir Assistente Virtual Diversa AI"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <i className="fa-solid fa-comment-dots text-xl" />
      </motion.button>
    </div>
  )
}
