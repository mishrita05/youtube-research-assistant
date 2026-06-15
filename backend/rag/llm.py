import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

def check_topic_relevance(topic, context):

    prompt = f"""
Determine whether the following topic is related to the provided video context.

Topic:
{topic}

Video Context:
{context}

Answer ONLY with:
RELATED
or
NOT_RELATED
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0
    )

    return response.choices[0].message.content.strip()

def generate_answer(query, context):

    prompt = f"""
You are an expert assistant.

Answer the user's question using ONLY the provided context.

Explain clearly and concisely in 2-4 well-structured paragraphs.

Do not use bullet points.

If multiple parts of the context make the same point, merge them into ONE explanation. Do not repeat the same idea across multiple paragraphs, and do not write a separate paragraph for every chunk if they overlap in content.

If the context does not contain enough information to answer fully, clearly state that instead of guessing or inventing details.

CITATION RULES — follow this structure exactly:
- If you state that the context does not contain relevant information to answer the question, do NOT include any citation blocks at all. Citations should only appear after paragraphs that directly use information from the context to answer the question.

- Each paragraph of explanation must be followed by a BLANK LINE, then its citation block, then another BLANK LINE before the next paragraph.
- A citation block is written on its own three lines, exactly like this:

📌 Citation:
Video Title: <title>
Timestamp: <timestamp>

- If a paragraph draws on multiple sources, list multiple citation blocks back to back, each separated by a blank line.
- Never place a citation inside a paragraph or mid-sentence.
- Never put two citations on the same line.
- Never invent citations — use only the SOURCE information provided in the context below.

Example of the required structure:

<paragraph of explanation>

📌 Citation:
Video Title: <title>
Timestamp: <timestamp>

<next paragraph of explanation>

📌 Citation:
Video Title: <title>
Timestamp: <timestamp>

📌 Citation:
Video Title: <title>
Timestamp: <timestamp>

Context:
{context}

Question:
{query}

Answer:
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3,
        max_tokens=1500
    )

    return response.choices[0].message.content

    return response.choices[0].message.content
def generate_research_questions(topic, context):

    prompt = f"""
    You are an expert research assistant.

    The user has provided YouTube videos.

    Use the video context to understand the domain and meaning of terms.

    Video Context:
    {context}

    Research Topic:
    {topic}

    Generate exactly 5 research questions that would help create a comprehensive research report.

    Keep the questions relevant to the video's domain.

    Return ONLY valid JSON:

    {{
        "questions": [
            "question 1",
            "question 2",
            "question 3",
            "question 4",
            "question 5"
        ]
    }}

    Return JSON only.
    No markdown.
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2
    )

    return response.choices[0].message.content
def generate_report(topic, context):

    prompt = f"""
You are an expert research writer.

Write a detailed, accurate, and well-structured research report using ONLY the provided context.

Synthesize information from multiple retrieved chunks and videos.

Explain concepts clearly and in simple language.

Do not copy transcript text word-for-word.

If multiple sources discuss the same concept, combine them into one coherent explanation.

Write a detailed research report.

Explain concepts clearly for beginners.

Synthesize information from multiple videos.

Avoid repeating the same information.

If information is missing, explicitly state that the videos do not provide enough information.

Write 1–2 detailed paragraphs per section.

Use simple language.

Place citations on a NEW LINE after each paragraph.

Write citations on separate lines.

Place citations only after a paragraph.

Never place citations inline.

Format exactly:

📌 Citation:
Video Title: <title>
Timestamp: <timestamp>

If multiple citations exist, put each citation on a new line.

Never place two citations on the same line
Never invent citations.
Use only the SOURCE information provided in the context.

Do NOT mention that information is missing unless absolutely necessary.

Context:
{context}

Research Topic:
{topic}

Generate the report in the following structure:

# Introduction

# Key Concepts

# Applications

# Challenges

# Conclusion
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3
    )

    return response.choices[0].message.content