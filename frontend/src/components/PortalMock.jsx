import { useState } from 'react'
import { motion } from 'framer-motion'

const MOCK_ARTICLES = [
  {
    tag: 'Educação Física',
    titulo: 'Como adaptar a Educação Física para ser inclusiva?',
    snippet: 'Entenda os princípios práticos e as estratégias necessárias para adaptar atividades corporais e integrar todos os alunos nas aulas de educação física.',
    query: 'O que é educação física inclusiva?'
  },
  {
    tag: 'Inclusão Escolar',
    titulo: 'Como implementar a educação inclusiva nas escolas?',
    snippet: 'Diretrizes fundamentais para gestores e educadores adaptarem o ambiente escolar, promovendo a acessibilidade, equidade e o acolhimento à diversidade.',
    query: 'Como implementar educação inclusiva na escola?'
  },
  {
    tag: 'Educação Especial',
    titulo: 'O papel do Atendimento Educacional Especializado (AEE)',
    snippet: 'Conheça o funcionamento das salas de recursos multifuncionais e a importância do suporte pedagógico complementar para estudantes com deficiência.',
    query: 'O que é o AEE?'
  },
  {
    tag: 'Legislação',
    titulo: 'Diretrizes de inclusão escolar e legislação vigente',
    snippet: 'Aprenda sobre os direitos garantidos por lei no Brasil, incluindo a Lei Brasileira de Inclusão (LBI) e as normas que amparam o acesso à educação para todos.',
    query: 'Direitos garantidos pela LBI'
  },
  {
    tag: 'Inclusão Escolar',
    titulo: 'Como adaptar metodologias para alunos com autismo (TEA)',
    snippet: 'Estratégias pedagógicas e metodologias ativas eficientes para acolher e facilitar a aprendizagem de crianças e adolescentes no espectro autista.',
    query: 'Como incluir alunos com autismo (TEA)?'
  },
  {
    tag: 'Materiais Adaptados',
    titulo: 'Tecnologias Assistivas aplicadas à educação',
    snippet: 'Explore recursos tecnológicos, softwares e ferramentas de comunicação alternativa que removem barreiras e ampliam a autonomia dos estudantes na sala de aula.',
    query: 'Tecnologia assistiva na escola'
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
    <div className="portal-wrapper">
      {/* Grain overlay for filmic premium texture */}
      <div className="grain-overlay" />

      {/* Grid of dots for futuristic geometric layout */}
      <div className="hero-grid-bg" />

      {/* Background glow spots */}
      <div className="hero-glow" />

      {/* Institutional Header */}
      <header className="portal-header">
        <div className="portal-header-inner">
          <div className="portal-header-left">
            {/* Logo — plain text, no icon */}
            <span
              className="portal-logo"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              DIVERSA
            </span>

            {/* Desktop Nav */}
            <nav className="portal-nav">
              <a href="#artigos" className="portal-nav-link">
                Artigos
              </a>
              <a href="#relatos" className="portal-nav-link">
                Relatos de Experiência
              </a>
              <a href="#materiais" className="portal-nav-link">
                Materiais Pedagógicos
              </a>
              <a href="#sobre" className="portal-nav-link">
                Sobre o DIVERSA
              </a>
            </nav>
          </div>

          <div className="portal-header-right">
            {/* Accessibility Button */}
            <button
              className="btn-accessibility"
              aria-label="Ativar Alto Contraste"
            >
              <i className="fa-solid fa-circle-half-stroke" />
              <span>Alto Contraste</span>
            </button>

            {/* CTA — pill button */}
            <button
              onClick={() => onOpenChat('floating', 'Quais são os princípios da educação inclusiva?')}
              className="btn-chat-cta"
            >
              Falar com Assistente
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-inner">
          <h1 className="hero-title">
            EDUCAÇÃO INCLUSIVA
            <span className="hero-subtitle">
              na prática
            </span>
          </h1>

          {/* Ask AI Bar in Hero */}
          <div className="search-wrapper">
            <form onSubmit={handleSearchSubmit} className="search-form">
              <div className="search-input-group">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={handleSearchFocus}
                  placeholder="Perguntar à IA do Diversa..."
                  className="search-input"
                  aria-label="Ask AI Bar"
                />
                <button
                  type="submit"
                  className="search-submit-btn"
                >
                  <span>Perguntar IA</span>
                  <i className="fa-solid fa-magnifying-glass" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Articles Grid — 3 columns on xl */}
      <main id="artigos" className="articles-main">
        <div className="articles-container">
          <div className="section-title-header">
            <h2 className="section-title">
              Artigos em Destaque
            </h2>
          </div>

          <div className="articles-grid">
            {MOCK_ARTICLES.map((art, idx) => (
              <div
                key={idx}
                className="article-card"
              >
                {/* Card header */}
                <span className={`card-tag ${
                  art.tag === 'Inclusão Escolar' || art.tag === 'Materiais Adaptados'
                    ? 'blue'
                    : 'purple'
                }`}>
                  {art.tag}
                </span>
                <h3 className="card-title">
                  {art.titulo}
                </h3>
                <p className="card-snippet">
                  {art.snippet}
                </p>

                {/* Card footer */}
                <div className="card-footer">
                  <a
                    href="#ler"
                    className="card-link"
                  >
                    <span>Ler artigo</span>
                    <i className="fa-solid fa-arrow-up-right-from-square" />
                  </a>

                  <button
                    onClick={() => onOpenChat('sidebar', art.query)}
                    className="card-ask-btn"
                    aria-label={`Perguntar à IA sobre ${art.titulo}`}
                  >
                    Perguntar IA
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="portal-footer">
        <div className="articles-container">
          <p className="portal-footer-text">
            © {new Date().getFullYear()} DIVERSA AI. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Floating Assistant Icon */}
      <motion.button
        onClick={() => onOpenChat('floating', '')}
        className="floating-assistant btn-floating-assistant"
        aria-label="Abrir Assistente Virtual Diversa AI"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <i className="fa-solid fa-comment-dots" />
      </motion.button>
    </div>
  )
}
