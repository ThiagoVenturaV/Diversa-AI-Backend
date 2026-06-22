import os
import sys
import json
import numpy as np
from pymongo import MongoClient
from sentence_transformers import SentenceTransformer
import faiss
from dotenv import load_dotenv

# Garante UTF-8 no terminal Windows (evita UnicodeEncodeError)
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

# Carrega variáveis de ambiente
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGO_DB", "diversa_db")
FAISS_INDEX_PATH = "diversa.index"

def chunk_texto(texto, chunk_size=1000, overlap=200):
    """
    Divide o texto em blocos de tamanho aproximado chunk_size
    com sobreposição overlap, respeitando finais de frases sempre que possível.
    """
    chunks = []
    texto_len = len(texto)
    if texto_len <= chunk_size:
        return [texto]
    
    start = 0
    while start < texto_len:
        end = start + chunk_size
        if end >= texto_len:
            chunks.append(texto[start:])
            break
        
        # Tenta encontrar uma quebra amigável (ponto final ou espaço) no overlap
        trecho_procura = texto[end - overlap : end]
        # Primeiro busca ponto final
        idx = trecho_procura.rfind('. ')
        if idx != -1:
            end = (end - overlap) + idx + 1
        else:
            # Senão busca espaço
            idx = trecho_procura.rfind(' ')
            if idx != -1:
                end = (end - overlap) + idx
        
        # Garante progresso para evitar loop infinito
        if end <= start:
            end = start + chunk_size
            
        chunks.append(texto[start:end].strip())
        start = end - overlap
        
    return chunks

def main():
    # 1. Conecta ao MongoDB
    print(f"[*] Conectando ao MongoDB em: {MONGO_URI}...")
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        # Força uma conexão para testar se o banco está de fato ativo
        client.admin.command('ping')
        print("[+] Conectado com sucesso ao MongoDB!")
    except Exception as e:
        print(f"\n[AVISO] Erro ao conectar ao MongoDB: {e}")
        print("[AVISO] Certifique-se de que o MongoDB está rodando localmente ou de que sua URI está correta no .env.")
        print("[AVISO] Não foi possível prosseguir com o povoamento do banco.")
        return

    db = client[DB_NAME]
    col_artigos = db["artigos"]
    col_chunks = db["artigos_chunks"]

    # Limpa as coleções antigas
    print("[*] Limpando coleções antigas no MongoDB...")
    col_artigos.delete_many({})
    col_chunks.delete_many({})

    # 2. Carrega modelo de Embeddings
    print("\n[*] Carregando modelo de embeddings local (paraphrase-multilingual-MiniLM-L12-v2)...")
    print("    (Nota: Se for a primeira vez executando, isso fará o download do modelo de ~420MB)")
    model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')
    print("[+] Modelo carregado com sucesso!")

    # 3. Lê o JSON de artigos
    json_path = "artigos.json"
    if not os.path.exists(json_path):
        print(f"[-] Erro: Arquivo {json_path} não encontrado!")
        return

    print(f"\n[*] Lendo arquivo {json_path}...")
    with open(json_path, "r", encoding="utf-8") as f:
        artigos = json.load(f)

    # 4. Processa cada artigo
    embeddings_lista = []
    faiss_id = 0

    print(f"[*] Processando e dividindo {len(artigos)} artigos...")

    for i, art in enumerate(artigos):
        titulo = art.get("titulo", "").strip()
        url = art.get("url", "").strip()
        texto = art.get("texto", "").strip()
        
        if not titulo or not texto:
            continue
            
        # Salva o artigo completo (para histórico ou referência futura)
        art_doc = {
            "titulo": titulo,
            "url": url,
            "texto_completo": texto
        }
        art_insert = col_artigos.insert_one(art_doc)
        artigo_id = art_insert.inserted_id
        
        # Faz o chunking do texto
        chunks = chunk_texto(texto, chunk_size=1000, overlap=200)
        
        # Processa cada chunk
        for chunk in chunks:
            if len(chunk.strip()) < 50:
                continue
                
            # Conteúdo que será vetorizado
            conteudo_chunk = f"{titulo}. {chunk}"
            
            # Gera o embedding do chunk
            embedding = model.encode(conteudo_chunk)
            embeddings_lista.append(embedding)
            
            # Salva o chunk no MongoDB
            chunk_doc = {
                "artigo_id": artigo_id,
                "titulo": titulo,
                "url": url,
                "texto_chunk": chunk,
                "faiss_id": faiss_id
            }
            col_chunks.insert_one(chunk_doc)
            faiss_id += 1
        
        if (i + 1) % 50 == 0 or (i + 1) == len(artigos):
            print(f"    -> {i + 1}/{len(artigos)} artigos processados (total de chunks: {faiss_id})")

    print(f"\n[+] Total de chunks salvos no MongoDB: {faiss_id}")

    # 5. Cria e salva o índice FAISS
    if embeddings_lista:
        print("[*] Criando e treinando o índice FAISS...")
        embeddings_np = np.array(embeddings_lista).astype('float32')
        dimensao = embeddings_np.shape[1]
        
        # Normaliza os vetores (L2 normalization)
        faiss.normalize_L2(embeddings_np)
        
        # Cria o índice de Produto Interno (Inner Product) que calcula similaridade de cosseno com vetores normalizados
        index = faiss.IndexFlatIP(dimensao)
        index.add(embeddings_np)
        
        # Salva o índice no disco
        faiss.write_index(index, FAISS_INDEX_PATH)
        print(f"[+] Índice FAISS salvo com sucesso em: {FAISS_INDEX_PATH}")
    else:
        print("[-] Erro: Nenhum embedding gerado.")

if __name__ == "__main__":
    main()
