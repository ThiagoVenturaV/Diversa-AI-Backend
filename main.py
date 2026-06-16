import os
import requests
from bs4 import BeautifulSoup
import time
import re
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import gradio as gr
from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

# Configurações do Groq
GROQ_KEY = os.getenv("GROQ_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL")
GROQ_URL = os.getenv("GROQ_URL")

HEADERS = {
    "Authorization": f"Bearer {GROQ_KEY}",
    "Content-Type":  "application/json",
}
# ── Parâmetros de geração ─────────────────────────────────────────────────────
# max_tokens  : limite de tokens na resposta (400 ≈ 3-4 parágrafos)
# temperature : 0.3 = mais focado/determinístico; 1.0 = mais criativo
PARAMS_GERACAO = {
    "model":       GROQ_MODEL,
    "max_tokens":  400,
    "temperature": 0.3,
}
# ════════════════════════════════════════════════════════════════════════════
# BASE COMPLETA — Texto institucional + artigos do Portal Diversa
# Fonte: https://diversa.org.br
# Copiado em: junho/2025
# ════════════════════════════════════════════════════════════════════════════

artigos_brutos = [

    # ── Texto institucional ──────────────────────────────────────────────────

    {
        "titulo": "Sobre o Diversa — O que é o projeto",
        "url":    "https://diversa.org.br/sobre/",
        "texto":  (
            "O DIVERSA é uma plataforma digital que tem como objetivo construir e compartilhar "
            "conhecimento sobre boas práticas de educação inclusiva. Seu público-alvo é formado "
            "por educadores, gestores escolares, técnicos de secretaria de educação, familiares "
            "de estudantes e outros profissionais comprometidos com o tema. "
            "Aqui você terá acesso a relatos de experiência, estudos de caso, pesquisas, artigos, "
            "notícias e outros materiais que podem servir como referência para redes de ensino que "
            "almejam oferecer um atendimento de qualidade a todos os estudantes, independentemente "
            "de suas especificidades. "
            "O DIVERSA é uma iniciativa do Instituto Rodrigo Mendes (IRM) em parceria com diferentes "
            "organizações que se dedicam à melhoria da educação do país. O projeto foi concebido "
            "durante um seminário realizado na Universidade de Harvard."
        ),
    },
    {
        "titulo": "Sobre o Diversa — Princípios da Educação Inclusiva",
        "url":    "https://diversa.org.br/sobre/",
        "texto":  (
            "Toda pessoa tem o direito à educação de qualidade. Todos devem exercer seu direito de "
            "estudar na escola inclusiva e, quando necessário, receber atendimento especializado "
            "complementar, de acordo com suas especificidades. "
            "Toda pessoa aprende. Sejam quais forem as particularidades intelectuais, sensoriais e "
            "físicas do estudante, todos têm potencial de aprender e ensinar. É papel da comunidade "
            "escolar desenvolver estratégias pedagógicas diversificadas. "
            "O processo de aprendizagem de cada pessoa é singular. As necessidades educacionais e o "
            "desenvolvimento de cada estudante são únicos. Modelos de ensino que pressupõem "
            "homogeneidade geram, inevitavelmente, exclusão. "
            "O convívio no ambiente escolar comum beneficia todos. A experiência de interação entre "
            "pessoas diferentes é fundamental para o pleno desenvolvimento de qualquer um. "
            "A educação inclusiva diz respeito a todos. A diversidade é uma característica inerente "
            "a qualquer ser humano. É abrangente, complexa e irredutível."
        ),
    },
    {
        "titulo": "Sobre o Diversa — Metodologia e cinco dimensões",
        "url":    "https://diversa.org.br/sobre/",
        "texto":  (
            "O modelo conceitual do Instituto Rodrigo Mendes foi construído com base em cinco "
            "dimensões: políticas públicas, gestão escolar, estratégias pedagógicas, famílias e "
            "parcerias. "
            "Políticas públicas referem-se a todos os aspectos de criação e gestão de normas voltadas "
            "para a garantia do direito à educação para todos, abrangendo leis, diretrizes e decisões "
            "judiciais. "
            "Gestão escolar diz respeito às diversas etapas de planejamento e desenvolvimento das "
            "atividades de direção de uma instituição de ensino, incluindo projetos político-pedagógicos "
            "e planos de ação. "
            "Estratégias pedagógicas correspondem aos procedimentos planejados por educadores para "
            "atingir seus objetivos de ensino. No contexto da educação inclusiva, contemplam tanto "
            "as atividades da sala de aula comum como do Atendimento Educacional Especializado (AEE). "
            "Famílias: as relações com famílias ou responsáveis legais pelos estudantes são elemento "
            "fundamental para o processo de inclusão escolar, pautadas por cooperação e apoio mútuo. "
            "Parcerias referem-se a relações entre a escola e atores externos que apoiam o processo "
            "de inclusão, como organizações de educação especial, saúde e assistência social."
        ),
    },

    # ── Artigos do portal ────────────────────────────────────────────────────

    {
        "titulo": "Educação inclusiva: como garantir que o direito não se fragmente pelo caminho?",
        "url":    "https://diversa.org.br/artigos/educacao-inclusiva-como-garantir-que-o-direito-nao-se-fragmente/",
        "texto":  (
            "O Dia Nacional de Luta pela Educação Inclusiva, celebrado em 14 de abril, convida a "
            "fazer um balanço com quem está na linha de frente: educadores e gestores que, todos os "
            "dias, constroem na prática o que os marcos legais determinam. "
            "O crescimento de estudantes com deficiência em classes comuns alcançou 93,5% em 2025, "
            "de acordo com o Censo Escolar, evidenciando a consolidação do acesso à escolarização "
            "em ambientes comuns. Pessoas autistas passaram de 5,6% para 44,2% das matrículas desse "
            "público em toda a Educação Básica entre 2015 e 2024. "
            "A aprovação nos anos iniciais do Ensino Fundamental subiu de 74,5% para 91,5%, e o "
            "abandono recuou para 0,6%. "
            "O principal desafio está na formação: somente 6,4% dos professores regentes da Educação "
            "Básica têm formação continuada em Educação Especial. A formação continuada cai "
            "progressivamente ao longo da trajetória escolar: na pré-escola 9,0%, nos anos iniciais "
            "do Ensino Fundamental 8,8%, nos anos finais 4,4%, no Ensino Médio 2,9% e na educação "
            "profissional apenas 0,6%. "
            "Um estudante com deficiência que avança para o Ensino Fundamental encontra, "
            "progressivamente, um corpo docente menos preparado para recebê-lo. A inclusão vai se "
            "fragilizando ao longo do percurso, justamente quando o estudante mais precisa de suporte. "
            "A resposta começa no incremento da formação continuada como política de Estado, não como "
            "iniciativa isolada."
        ),
    },
    {
        "titulo": "Educação inclusiva é questão de justiça",
        "url":    "https://diversa.org.br/artigos/educacao-inclusiva-e-questao-de-justica/",
        "texto":  (
            "O Decreto 12.686/2025, assinado em 20 de outubro de 2025, instituiu a Política Nacional "
            "de Educação Especial Inclusiva (PNEEI). Ela busca conferir efetividade ao que está previsto "
            "na Convenção Internacional sobre os Direitos da Pessoa com Deficiência, à Lei Brasileira "
            "de Inclusão (LBI) e à Política Nacional de Educação Especial na Perspectiva da Educação "
            "Inclusiva (PNEEPEI) de 2008. "
            "O Decreto 12.686/2025 não trata do fim de instituições como as Apaes e a Pestalozzi, "
            "que desempenham papel fundamental na promoção dos direitos das pessoas com deficiência. "
            "O Decreto reafirma o caráter pedagógico, complementar e suplementar do Atendimento "
            "Educacional Especializado (AEE), fundamental para a eliminação de barreiras. "
            "Desburocratiza a matrícula no AEE e a oferta do profissional de apoio escolar, "
            "reforçando que laudos e diagnósticos não são obrigatórios para acessá-los. "
            "Estabelece pela primeira vez o piso mínimo de 80 horas para a formação continuada de "
            "professores de AEE e Profissionais de Apoio Escolar. "
            "Explicita o compromisso da inclusão acontecer em classes comuns da rede regular de ensino, "
            "com medidas de apoio individualizadas e coletivas, oferta de materiais acessíveis, "
            "tecnologias assistivas e adaptações razoáveis. "
            "A escolarização de pessoas com deficiência é um processo histórico e um imperativo "
            "constitucional no Brasil. Desde 2008, com a PNEEPEI, o Brasil avança com forte queda "
            "de matrículas em salas de aulas especiais."
        ),
    },
    {
        "titulo": "Não há inclusão sem trabalho coletivo da comunidade escolar",
        "url":    "https://diversa.org.br/artigos/nao-ha-inclusao-sem-trabalho-coletivo/",
        "texto":  (
            "A escolarização de pessoas com deficiência, transtorno do espectro autista (TEA) e altas "
            "habilidades ou superdotação em escolas comuns é um direito garantido por lei. "
            "O Censo Escolar 2023 mostra que 91% dos estudantes com deficiência estão matriculados "
            "em classes comuns. A presença desses estudantes fortalece a escola como espaço democrático. "
            "Quando a diversidade está presente no dia a dia escolar, educadores e comunidades adotam "
            "práticas pedagógicas acessíveis, colaborativas, com ganhos de aprendizagem para todos. "
            "A Lei Brasileira de Inclusão (LBI) prevê o profissional de apoio escolar para locomoção, "
            "alimentação e higiene dos estudantes que dele necessitarem — não cabendo a ele nenhuma "
            "atuação no campo pedagógico. "
            "A Política Nacional de Educação Especial na Perspectiva da Educação Inclusiva (PNEEPEI, "
            "de 2008) já prevê o Atendimento Educacional Especializado (AEE) como o serviço "
            "responsável por identificar barreiras e desenvolver estratégias para garantir a "
            "participação dos estudantes com deficiência. "
            "Hoje apenas 38,2% dos estudantes da Educação Especial têm acesso ao AEE, e só 42,1% dos "
            "professores responsáveis por esse atendimento têm formação continuada sobre Educação Especial. "
            "A individualização pode reforçar estereótipos, estigmas e o isolamento de pessoas com "
            "deficiência, além de criar empecilhos à aprendizagem e ao desenvolvimento da autonomia. "
            "Os desafios não serão resolvidos por medidas individuais, mas por investimentos sistemáticos "
            "que fortaleçam o AEE, garantam formação adequada e condições dignas de trabalho para os "
            "professores e ofereçam suporte a toda a rede de ensino."
        ),
    },
]

def limpar_texto(texto):
    texto = re.sub(r'\s+', ' ', texto)
    texto = re.sub(r'\[.*?\]', '', texto)
    texto = re.sub(r'http\S+', '', texto)
    return texto.strip()

# Verifica se há artigos antes de prosseguir
if not artigos_brutos:
    print("❌ Nenhum artigo coletado.")
    print("   Verifique se o User-Agent foi adicionado e rode a coleta novamente.")
else:
    df = pd.DataFrame(artigos_brutos)
    df["texto_limpo"] = df["texto"].apply(limpar_texto)

    antes  = len(df)
    df     = df[df["texto_limpo"].str.len() > 200].reset_index(drop=True)
    depois = len(df)

    df["conteudo_busca"] = df["titulo"] + ". " + df["titulo"] + ". " + df["texto_limpo"]

# ngram_range=(1,2) : captura "autismo" e "educação inclusiva"
# max_features=8000  : vocabulário limitado para eficiência
# sublinear_tf=True  : log na frequência — reduz dominância de termos comuns
vectorizer   = TfidfVectorizer(ngram_range=(1, 2), max_features=8000, sublinear_tf=True)
matriz_tfidf = vectorizer.fit_transform(df["conteudo_busca"])

# ─────────────────────────────────────────────────────────────────────────────
# Função: buscar_artigos_relevantes
# Vetoriza a pergunta e retorna os artigos mais similares da base.
# Parâmetros: pergunta (str), top_k (int)
# Retorna   : list de dicts com titulo, url, trecho e score
# ─────────────────────────────────────────────────────────────────────────────
def buscar_artigos_relevantes(pergunta, top_k=3):
    vetor    = vectorizer.transform([pergunta])
    scores   = cosine_similarity(vetor, matriz_tfidf)[0]
    indices  = scores.argsort()[::-1][:top_k]

    return [
        {
            "titulo": df.iloc[i]["titulo"],
            "url":    df.iloc[i]["url"],
            "trecho": df.iloc[i]["texto_limpo"][:600],
            "score":  round(float(scores[i]), 4),
        }
        for i in indices if scores[i] > 0.01
    ]

# ── System Prompt ─────────────────────────────────────────────────────────────
SYSTEM_PROMPT = (
    "Você é um assistente especialista em Educação Inclusiva do Portal Diversa (diversa.org.br).\n\n"
    "Seu papel é apoiar professores, gestores escolares, familiares de pessoas com deficiência "
    "e demais interessados em Educação Inclusiva, com base nos conteúdos do Portal Diversa.\n\n"
    "RESPONDA perguntas sobre:\n"
    "- Deficiências e transtornos: autismo (TEA), TDAH, deficiência visual, auditiva, intelectual e física\n"
    "- Legislação: LBI, LDB, BNCC, Política Nacional de Educação Especial\n"
    "- Estratégias pedagógicas inclusivas e adaptações curriculares\n"
    "- Atendimento Educacional Especializado (AEE)\n"
    "- Tecnologia assistiva\n"
    "- Orientações práticas para professores, gestores e famílias\n\n"
    "NAO RESPONDA (redirecione educadamente):\n"
    "- Diagnósticos médicos ou psicológicos\n"
    "- Opiniões políticas ou partidárias\n"
    "- Assuntos sem relação com educação inclusiva\n\n"
    "Se a pergunta estiver fora do escopo, responda exatamente:\n"
    "'Minha especialidade é Educação Inclusiva. Posso te ajudar com alguma dúvida sobre esse tema?'\n\n"
    "Responda sempre em português brasileiro, de forma clara, acessível e empática.\n"
    "Quando disponível, cite o título e a URL do artigo consultado ao final da resposta."
)
# ─────────────────────────────────────────────────────────────────────────────
# Função: chamar_groq
# Envia mensagens para o Llama 3.1 via Groq com retry automático.
# Parâmetros: messages (list), tentativas (int)
# Retorna   : str — texto gerado ou mensagem de erro
# ─────────────────────────────────────────────────────────────────────────────
def chamar_groq(messages, tentativas=3):
    payload = {**PARAMS_GERACAO, "messages": messages}

    for tentativa in range(1, tentativas + 1):
        try:
            resp = requests.post(GROQ_URL, headers=HEADERS, json=payload, timeout=30)

            if resp.status_code == 200:
                return resp.json()["choices"][0]["message"]["content"].strip()

            elif resp.status_code == 429:
                # Rate limit — aguarda antes de tentar novamente
                espera = tentativa * 20
                print(f"  ⚠️  Rate limit (tentativa {tentativa}/{tentativas}). Aguardando {espera}s...")
                time.sleep(espera)

            elif resp.status_code == 401:
                return "❌ Chave inválida. Verifique o GROQ_KEY na Seção 3."

            else:
                return f"❌ Erro HTTP {resp.status_code}: {resp.text[:200]}"

        except requests.exceptions.Timeout:
            print(f"  ⏱️  Timeout na tentativa {tentativa}/{tentativas}")
            if tentativa < tentativas:
                time.sleep(10)
        except Exception as e:
            return f"❌ Erro inesperado: {str(e)}"

    return "⏳ Serviço indisponível. Tente novamente em instantes."


# ─────────────────────────────────────────────────────────────────────────────
# Função: responder
# Pipeline RAG completo: busca → monta mensagens → Groq → resposta com fontes.
# Parâmetro : pergunta (str)
# Retorna   : str — resposta com referências
# ─────────────────────────────────────────────────────────────────────────────
def responder(pergunta):
    if not pergunta.strip():
        return "Por favor, digite sua pergunta sobre Educação Inclusiva."

    # Passo 1: buscar artigos relevantes na base indexada
    artigos = buscar_artigos_relevantes(pergunta, top_k=3)

    # Passo 2: montar contexto com os trechos encontrados
    if artigos:
        contexto = "\n\n".join([
            f"Artigo {i+1}: {a['titulo']}\nTrecho: {a['trecho']}\nFonte: {a['url']}"
            for i, a in enumerate(artigos)
        ])
        instrucao = (
            "Use os trechos abaixo do Portal Diversa para responder a pergunta. "
            "Cite o título e a URL do artigo mais relevante ao final da resposta."
        )
    else:
        contexto  = "Nenhum artigo relevante encontrado na base atual do Portal Diversa."
        instrucao = (
            "Não há artigos disponíveis sobre esse tema na base atual. "
            "Se o tema for educação inclusiva, responda com conhecimento geral "
            "e informe que o portal pode ter mais conteúdos."
        )

    # Passo 3: montar lista de mensagens no formato Groq/OpenAI
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user",   "content": (
            f"{instrucao}\n\n"
            f"TRECHOS DO PORTAL DIVERSA:\n{contexto}\n\n"
            f"PERGUNTA: {pergunta}"
        )},
    ]

    # Passo 4: chamar o modelo com retry
    resposta = chamar_groq(messages)

    # Passo 5: adicionar lista de fontes ao final
    if artigos:
        fontes = "\n\n---\n📚 **Fontes consultadas (Portal Diversa):**\n" + "\n".join(
            f"- [{a['titulo']}]({a['url']})" for a in artigos
        )
        return resposta + fontes

    return resposta
#Gradio a interface grafica temporaria
EXEMPLOS = [
    "O que é o Atendimento Educacional Especializado (AEE)?",
    "Como adaptar atividades para alunos com autismo?",
    "Quais são os direitos das pessoas com deficiência na escola?",
    "O que diz a Lei Brasileira de Inclusão sobre educação?",
    "Como a tecnologia assistiva pode ajudar alunos com deficiência visual?",
    "Como orientar familiares de crianças com deficiência intelectual?",
    "O que é uma sala de recursos multifuncionais?",
]

def chat_gradio(mensagem, historico):
    return responder(mensagem)

interface = gr.ChatInterface(
    fn=chat_gradio,
    title="🌐 Assistente Diversa — Educação Inclusiva",
    description=(
        "Assistente especializado em Educação Inclusiva, baseado nos conteúdos do "
        "[Portal Diversa](https://diversa.org.br).\n\n"
        "Faça perguntas sobre inclusão, deficiências, legislação e práticas pedagógicas. "
        "Modelo: **Llama 3.1 8B** via Groq."
    ),
    examples=EXEMPLOS,
    submit_btn="Enviar",
    stop_btn="Parar",
)

interface.launch(
    theme=gr.themes.Soft(primary_hue="blue", secondary_hue="slate"),
    share=True
)

