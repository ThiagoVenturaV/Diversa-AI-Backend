FROM python:3.11-slim

# Define o diretório de trabalho
WORKDIR /app

# Instala dependências do sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copia o arquivo de dependências
COPY requirements.txt .

# Instala o PyTorch versão CPU (apenas ~170MB em vez do pacote CUDA padrão de 2.5GB)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Instala as dependências de Python restantes
RUN pip install --no-cache-dir -r requirements.txt

# Pré-baixa o modelo de embeddings para o cache interno do contêiner durante o build.
# Isso acelera o tempo de boot do contêiner significativamente.
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')"

# Copia o código da aplicação
COPY . .

# Expõe a porta padrão do servidor FastAPI
EXPOSE 8080

# Comando padrão
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8080"]
