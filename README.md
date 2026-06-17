# Diversa AI

MVP do assistente virtual especializado em **Educação Inclusiva** do [Portal Diversa](https://diversa.org.br).

O assistente usa **RAG** (Retrieval-Augmented Generation): busca os artigos mais relevantes da base via TF-IDF e responde com o **Llama 3.1 8B** via [Groq API](https://console.groq.com), com streaming de tokens em tempo real.

## Arquitetura

```
artigos.json  →  TF-IDF (scikit-learn)  →  busca por similaridade
                                              ↓
pergunta do usuário  ─────────────────►  contexto + prompt  →  Groq (streaming)
                                                                    ↓
                                                          SSE  →  index.html
```

## Estrutura do projeto

```
.
├── server.py        # Servidor HTTP + SSE (stdlib pura, sem frameworks)
├── index.html       # Frontend do chat (HTML/CSS/JS puro)
├── artigos.json     # Base de artigos do Portal Diversa (gerada localmente)
├── .env             # Chaves de API (não versionado)
├── .env.example     # Modelo do .env
└── requirements.txt # Dependências Python
```

## Como rodar

### 1. Clonar o repositório

```bash
git clone https://github.com/ThiagoVenturaV/Diversa-AI.git
cd Diversa-AI
```

### 2. Instalar as dependências

```bash
pip install -r requirements.txt
```

### 3. Configurar o `.env`

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
> O arquivo `artigos.json` também está no `.gitignore` por ser grande (1.5 MB). Você precisará gerá-lo localmente antes de rodar o servidor.

### 4. Iniciar o servidor

```bash
python server.py
```

Acesse **http://localhost:8080** no navegador.

## Dependências

| Pacote | Uso |
|---|---|
| `requests` | Chamadas à API do Groq com streaming |
| `pandas` | Manipulação do DataFrame de artigos |
| `scikit-learn` | Vetorização TF-IDF e similaridade cosseno |
| `python-dotenv` | Leitura do `.env` |

> Todo o servidor HTTP e SSE usa apenas a **stdlib do Python** (`http.server`) — sem Flask, FastAPI ou Chainlit.
