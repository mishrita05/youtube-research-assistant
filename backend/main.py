from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from youtube_transcript_api import YouTubeTranscriptApi
from dotenv import load_dotenv
import os
from pydantic import BaseModel
from typing import List
import re
import json
from collections import Counter
from rag.vector_store import create_vector_store, search_vector_db
from rag.llm import (
    generate_research_questions,
    generate_report,
    generate_answer,
    check_topic_relevance
)
from youtube_transcript_api.proxies import WebshareProxyConfig
from yt_dlp import YoutubeDL

load_dotenv()

ytt_api = YouTubeTranscriptApi(
    proxy_config=WebshareProxyConfig(
        proxy_username=os.getenv("WEBSHARE_USERNAME"),
        proxy_password=os.getenv("WEBSHARE_PASSWORD"),
    )
)

def get_video_title(url):

    try:
        ydl_opts = {
            "quiet": True
        }

        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(
                url,
                download=False
            )

            return info.get(
                "title",
                "Unknown Video"
            )

    except Exception as e:
        print(e)
        return "Unknown Video"
    
def seconds_to_time(seconds):

    seconds = int(float(seconds))

    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    seconds = seconds % 60

    if hours > 0:
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"

    return f"{minutes:02d}:{seconds:02d}"


def format_citations(text):
    pattern = r"(📌\s*Citation:\s*Video Title:.*?Timestamp:\s*[\d:]+)"
    text = re.sub(pattern, r"\n\n\1\n\n", text, flags=re.DOTALL)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()

app = FastAPI()
GLOBAL_VECTOR_DB = None
# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    urls: List[str]
    question: str

class ChatRequest(BaseModel):
    question: str

@app.get("/")
def home():
    return {"message": "YouTube Learner Backend Running"}


# @app.get("/transcript")
# def get_transcript(url: str):

#     video_id = re.search(r"v=([a-zA-Z0-9_-]+)", url)

#     if not video_id:
#         return {"error": "Invalid YouTube URL"}

#     video_id = video_id.group(1)

#     try:
#         transcript = YouTubeTranscriptApi().fetch(video_id)

#         text = " ".join([item.text for item in transcript])

#         return {
#             "video_id": video_id,
#             "transcript": text
#         }

#     except Exception as e:
#         import traceback
#         traceback.print_exc()

#         return {
#             "error": str(e)
#         }


# @app.post("/transcripts")
# def get_transcripts(urls: List[str]):

#     all_text = ""

#     for url in urls:

#         video_id = re.search(r"v=([a-zA-Z0-9_-]+)", url)

#         if not video_id:
#             continue

#         video_id = video_id.group(1)

#         try:
#             transcript = YouTubeTranscriptApi().fetch(video_id)

#             text = " ".join([item.text for item in transcript])

#             all_text += text + "\n"

#         except Exception:
#             import traceback
#             print(f"Could not fetch transcript for {video_id}")
#             traceback.print_exc()

#     return {
#         "combined_transcript": all_text
#     }


@app.post("/ask")
def ask_question(data: QueryRequest):

    combined_text = ""
    video_titles = {}
    # Fetch transcripts
    for url in data.urls:

        video_id = re.search(
            r"v=([a-zA-Z0-9_-]+)",
            url
        )

        if not video_id:
            continue

        video_id = video_id.group(1)
        title = get_video_title(url)
        video_titles[video_id] = title
        print("TITLE FETCHED:", title)
        try:
            transcript = ytt_api.fetch(video_id)

            for item in transcript:

                combined_text += (
                    f"[VIDEO_ID:{video_id}] "
                    f"[START:{item.start}] "
                    f"{item.text}\n"
                )

        except Exception as e:
            print(e)
    if combined_text == "":
        return {
            "error": "No transcript found"
        }

    # Create vector database
    vector_db = create_vector_store(
        combined_text,
        video_titles
    )
    global GLOBAL_VECTOR_DB
    GLOBAL_VECTOR_DB = vector_db

    # Generate research questions
    context_preview = combined_text[:8000]

    relevance = check_topic_relevance(
    data.question,
    context_preview
    )

    if relevance == "NOT_RELATED":
        return {
            "error": f'The uploaded videos do not contain information about "{data.question}".'
        }

    questions_json = generate_research_questions(
        data.question,
        context_preview
    )

    questions = json.loads(
        questions_json
    )["questions"]

    all_queries = [data.question] + questions

    all_docs = []

    for query in all_queries:

        docs = search_vector_db(
            vector_db,
            query,
            k=15
        )

        all_docs.extend(docs)

    # Remove duplicate chunks
    unique_docs = list(
        {
            doc.page_content: doc
            for doc in all_docs
        }.values()
    )

    context = ""

    for doc in unique_docs[:15]:
        print(doc.metadata)
        video_title = doc.metadata.get(
            "video_title",
            "Unknown Video"
        )

        timestamp = doc.metadata.get(
            "timestamp",
            "Unknown"
        )

        if timestamp != "Unknown":
            timestamp = seconds_to_time(timestamp)

        context += f"""
TEXT:
{doc.page_content}

SOURCE:
Video Title: {video_title}
Timestamp: {timestamp}

"""

    # Limit context size
    context = context[:10000]
    # Generate final report
    report = format_citations(
        generate_report(
            data.question,
            context
        )
    )
        
    videos_used = len(set(
        doc.metadata.get("video_title")
        for doc in unique_docs
    ))

    video_chunk_counts = Counter(
        doc.metadata.get("video_id") for doc in unique_docs
    )

    videos_info = [
        {
            "video_id": vid,
            "title": title,
            "chunks_used": video_chunk_counts.get(vid, 0)
        }
        for vid, title in video_titles.items()
    ]

    return {
        "research_questions": questions,
        "report": report,
        "sources_used": len(unique_docs),
        "videos_used": videos_used,
        "videos": videos_info
    }
@app.post("/chat")
def chat(data: ChatRequest):

    global GLOBAL_VECTOR_DB

    if GLOBAL_VECTOR_DB is None:
        return {
            "error": "Generate a report first."
        }

    docs = search_vector_db(
        GLOBAL_VECTOR_DB,
        data.question,
        k=8
    )

    context = ""

    for doc in docs:

        video_title = doc.metadata.get(
            "video_title",
            "Unknown Video"
        )

        timestamp = doc.metadata.get(
            "timestamp",
            "Unknown"
        )

        if timestamp != "Unknown":
            timestamp = seconds_to_time(timestamp)

        context += f"""
TEXT:
{doc.page_content}

SOURCE:
Video Title: {video_title}
Timestamp: {timestamp}

"""
    relevance = check_topic_relevance(
        data.question,
        context[:2000]
    )

    if relevance == "NOT_RELATED":
        return {
            "answer": "This question doesn't seem related to the content of the videos you provided. Try asking something about the topics covered in the videos."
        }

    answer = format_citations(
        generate_answer(
            data.question,
            context
        )
    )

    return {
        "answer": answer
    }