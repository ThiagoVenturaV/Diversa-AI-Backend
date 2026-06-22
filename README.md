# Diversa AI

MVP do assistente virtual especializado em **Educação Inclusiva** do [Portal Diversa](https://diversa.org.br).

O assistente utiliza uma arquitetura **RAG Híbrida** avançada: combina busca densa por embeddings (FAISS) com busca esparsa (TF-IDF/scikit-learn), realiza a fusão dos rankings via **RRF (Reciprocal Rank Fusion)** e responde usando o **Llama 3.1** via [Groq API](https://console.groq.com), com streaming de tokens em tempo real via Server-Sent Events (SSE).

---

## 🚀 Principais Funcionalidades

1. **Perfis de Usuário (Roles)**:
   - **Família (Padrão)**: Respostas em linguagem simples, acolhedora, afetuosa, livre de jargões técnicos.
   - **Professor**: Respostas detalhadas com foco pedagógico, sugestões de atividades práticas e planos de aula.
   - **Gestor**: Respostas objetivas, formais e técnicas com foco em legislação (LBI, LDB, BNCC) e gestão escolar.
2. **Histórico e Memória Conversacional**:
   - Memória contínua entre turnos baseada em uma **Janela Deslizante** (envia as últimas 8 mensagens da conversa para economizar tokens e reter foco).
   - Armazenamento persistente no **MongoDB** e cache rápido em memória ativa no backend.
3. **Consolidação de Fontes**:
   - Evita repetição visual de links idênticos na interface. Agrupa trechos relevantes do mesmo artigo sob uma única fonte e mescla seu conteúdo para enriquecer o contexto da LLM.
4. **Guardrail de Escopo Local**:
   - Classificador local (Regressão Logística treinada sobre embeddings do SentenceTransformer) que bloqueia perguntas fora do escopo (ex: receitas, política, etc.).
   - Bypass inteligente de saudações e contatos de apresentação para permitir um diálogo fluido e interativo com a assistente.

---

## 🛠️ Arquitetura do Sistema

```
                        ┌──────────────────┐
                        │   artigos.json   │
                        └─────────┬────────┘
                                  │
                          [ popula_db.py ]
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
             [ MongoDB ]                 [ FAISS Index ]
          (Texto & Metadados)         (Busca Densa/Embeddings)
                    │                           │
                    └─────────────┬─────────────┘
                                  ▼
                      [ Busca RAG Híbrida ]
                      - FAISS (Embedding local)
                      - TF-IDF (Scikit-Learn)
                      - Rank Fusion (RRF)
                                  │
                                  ▼
Pergunta do Usuário ──► [ Guardrail Local ] ──► [ FastAPI / Uvicorn ] ──► [ Groq API ] (Llama 3.1)
                                                                               │
                                                                               ▼
                                                                     SSE (Stream de tokens)
                                                                               │
                                                                               ▼
                                                                       [ React Frontend ]
```

---

## 📂 Estrutura do Projeto

```
.
├── server.py             # Servidor FastAPI com endpoints de chat, SSE e arquivos estáticos
├── popula_db.py          # Script que lê o artigos.json, gera embeddings e popula o MongoDB e FAISS
├── artigos.json          # Base de artigos raspados do Portal Diversa
├── diversa.index         # Arquivo binário do índice FAISS pré-treinado
├── requirements.txt      # Dependências Python do backend
├── Dockerfile            # Configuração do contêiner do backend (Python 3.11-slim + PyTorch CPU)
├── docker-compose.yml    # Orquestração do MongoDB e do Backend FastAPI
├── .env                  # Chaves de API e variáveis de banco (não versionado)
├── .env.example          # Modelo de variáveis de ambiente
└── frontend/             # Interface Single Page Application em React + Vite
    ├── src/
    │   ├── App.jsx       # Componente principal (gerenciamento de sessão, perfil e histórico)
    │   ├── index.css     # CSS Vanilla Design System (premium, responsivo, glassmorphism)
    │   └── components/   # Componentes modulares do chat (Header, Welcome, BotMsg, etc.)
    └── vite.config.js    # Proxy para rotas de backend (/ask) em desenvolvimento
```

---

## ⚙️ Como Rodar com Docker (Recomendado)

O projeto está totalmente conteinerizado com **Docker Compose**, o que gerencia automaticamente a conexão do MongoDB e inicialização do servidor.

### 1. Clonar o repositório
```bash
git clone https://github.com/ThiagoVenturaV/Diversa-AI.git
cd Diversa-AI
```

### 2. Configurar variáveis de ambiente (`.env`)
Copie o arquivo de exemplo e insira sua chave do Groq:
```bash
cp .env.example .env
```
Preencha a variável `GROQ_KEY` no arquivo `.env`:
```env
GROQ_KEY="gsk_sua_chave_real_da_api_groq"
```

### 3. Compilar o Frontend
Certifique-se de compilar os arquivos estáticos do frontend localmente para que o FastAPI os sirva:
```bash
cd frontend
npm install
npm run build
cd ..
```

### 4. Subir os serviços com Docker
```bash
docker compose up --build
```
Este comando irá:
1. Subir a instância do **MongoDB**.
2. Compilar o contêiner do **FastAPI**, baixando o modelo de embeddings local.
3. Executar o script `popula_db.py` para ler os artigos, vetorizar e salvar no MongoDB e FAISS.
4. Iniciar o servidor HTTP na porta `8080`.

Acesse **http://localhost:8080** no navegador.

---

## 🛠️ Como Rodar Localmente (Sem Docker)

Se preferir rodar os serviços individualmente em sua máquina:

1. **Inicie o MongoDB** localmente na porta padrão `27017`.
2. **Crie um ambiente virtual e instale as dependências**:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # ou .venv\Scripts\activate no Windows
   pip install -r requirements.txt
   ```
3. **Popule a base de dados**:
   ```bash
   python popula_db.py
   ```
4. **Compile o frontend**:
   ```bash
   cd frontend && npm install && npm run build && cd ..
   ```
5. **Inicie o backend**:
   ```bash
   python server.py
   ```
6. Acesse **http://localhost:8080**.
