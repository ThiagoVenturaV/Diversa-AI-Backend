# Diversa AI

MVP do assistente virtual especializado em **Educação Inclusiva** do [Portal Diversa](https://diversa.org.br).

O assistente usa **RAG** (Retrieval-Augmented Generation): busca os artigos mais relevantes da base via TF-IDF e responde com o **Llama 3.1 8B** via [Groq API](https://console.groq.com), com streaming de tokens em tempo real via SSE.

## Arquitetura

```
artigos.json  →  TF-IDF (scikit-learn)  →  busca por similaridade
                                              ↓
pergunta do usuário  ─────────────────►  contexto + prompt  →  Groq (streaming)
                                                                    ↓
                                                          SSE  →  React (frontend)
```

## Estrutura do projeto

```
.
├── server.py           # Servidor HTTP + SSE (stdlib pura, sem frameworks)
├── artigos.json        # Base de artigos do Portal Diversa (gerada localmente)
├── requirements.txt    # Dependências Python
├── .env                # Chaves de API (não versionado)
├── .env.example        # Modelo do .env
└── frontend/           # Interface React + Vite + Custom CSS
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css   # Custom CSS Design System
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Como rodar localmente

### 1. Clonar o repositório

```bash
git clone https://github.com/ThiagoVenturaV/Diversa-AI.git
cd Diversa-AI
```

### 2. Configurar o `.env`

Copie o arquivo de exemplo e preencha sua chave do Groq:

```bash
cp .env.example .env
```

```env
GROQ_KEY="gsk_sua_chave_real_aqui"
GROQ_MODEL="llama-3.1-8b-instant"
GROQ_URL="https://api.groq.com/openai/v1/chat/completions"
```

> [!WARNING]
> Nunca suba o arquivo `.env` para o Git. Ele já está no `.gitignore`.

> [!NOTE]
> O arquivo `artigos.json` também está no `.gitignore` por ser grande (~1.5 MB). Você precisará gerá-lo localmente antes de rodar o servidor.

### 3. Instalar dependências do backend

```bash
pip install -r requirements.txt
```

### 4. Instalar dependências e buildar o frontend

```bash
cd frontend
npm install
npm run build
cd ..
```

O build gera a pasta `dist/` na raiz do projeto, que é servida pelo `server.py`.

### 5. Iniciar o servidor

```bash
python server.py
```

Acesse **http://localhost:8080** no navegador.

---

## Deploy

A arquitetura recomendada é **deploy separado** para frontend e backend:

| Camada | Plataforma sugerida | Observação |
|---|---|---|
| **Backend** (Python + TF-IDF) | Heroku / Railway | Requer dyno sempre ativo para evitar cold start lento |
| **Frontend** (React) | Vercel / Netlify | Grátis, CDN global, HTTPS automático |

> [!TIP]
> O **Railway** é uma boa alternativa ao Heroku: não hiberna o app, detecta Python automaticamente e tem $5 de crédito gratuito/mês.

Para o deploy separado, configure a variável de ambiente no frontend:

```env
VITE_API_URL=https://seu-backend.up.railway.app
```

O backend já tem CORS configurado (`Access-Control-Allow-Origin: *`).

---

## Dependências Python

| Pacote | Uso |
|---|---|
| `requests` | Chamadas à API do Groq com streaming |
| `pandas` | Manipulação do DataFrame de artigos |
| `scikit-learn` | Vetorização TF-IDF e similaridade cosseno |
| `python-dotenv` | Leitura do `.env` |

> Todo o servidor HTTP e SSE usa apenas a **stdlib do Python** (`http.server`) — sem Flask, FastAPI ou Chainlit.

## Stack do frontend

| Tecnologia | Uso |
|---|---|
| React 19 | Interface do chat |
| Vite | Bundler e dev server |
| Custom CSS (Vanilla) | Estilização responsiva, glassmorphism e efeitos Awwwards |
| Framer Motion | Animações |
