
# from langchain_experimental.text_splitter import SemanticChunker
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_community.vectorstores.utils import DistanceStrategy
from langchain_core.documents import Document
import re

def extract_start_time(text):

    match = re.search(
        r"\[START:(.*?)\]",
        text
    )

    if match:
        return match.group(1)

    return "Unknown"


def extract_video_id(text):

    match = re.search(
        r"\[VIDEO_ID:(.*?)\]",
        text
    )

    if match:
        return match.group(1)

    return "Unknown"
# def extract_title(text):

#     match = re.search(
#         r"\[TITLE:(.*?)\]",
#         text
#     )

#     if match:
#         return match.group(1)

#     return "Unknown Video"

def create_vector_store(text, video_titles=None):

    video_titles = video_titles or {}

    # Embedding Model
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    # # Semantic Chunking
    # splitter = SemanticChunker(
    #     embeddings=embeddings,
    #     breakpoint_threshold_type="percentile",
    #     breakpoint_threshold_amount=80
    # )

    docs = []

    lines = [line for line in text.split("\n") if line.strip()]

    chunk_size = 8

    for i in range(0, len(lines), chunk_size):

        chunk_lines = lines[i:i+chunk_size]

        chunk_text = "\n".join(chunk_lines)

        start = extract_start_time(chunk_text)
        video_id = extract_video_id(chunk_text)
        title = video_titles.get(video_id, "Unknown Video")

        clean_lines = []

        for line in chunk_lines:

            clean_line = re.sub(
                r"\[VIDEO_ID:.*?\]\s*\[START:.*?\]\s*",
                "",
                line
            )

            clean_lines.append(clean_line)

        clean_text = "\n".join(clean_lines)

        docs.append(
            Document(
                page_content=clean_text,
                metadata={
                    "video_id": video_id,
                    "video_title": title,
                    "timestamp": start
                }
            )
        )

    print(f"Number of chunks created: {len(docs)}")

    # FAISS with Cosine Similarity
    vector_db = FAISS.from_documents(
        docs,
        embeddings,
        distance_strategy=DistanceStrategy.COSINE
    )

    print(type(vector_db.index))  

    return vector_db


# def search_vector_db(vector_db, query, k=5):

#     results = vector_db.similarity_search(
#         query,
#         k=k
#     )

#     return results

def search_vector_db(vector_db, query, k=5):

    results = vector_db.max_marginal_relevance_search(
        query=query,
        k=5,
        fetch_k=25,
        lambda_mult=0.7
    )

    return results
