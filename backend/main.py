import os
from pathlib import Path

import chromadb
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google import genai

load_dotenv(dotenv_path=Path(__file__).with_name(".env"))

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise RuntimeError("GOOGLE_API_KEY is missing. Add it to backend/.env before starting the server.")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load persisted DB
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_collection("resume_tips_collection")

print(chroma_client.list_collections())
genai_client = genai.Client(api_key=GOOGLE_API_KEY)


def get_embedding(text):
    response = genai_client.models.embed_content(
        model="gemini-embedding-2-preview",
        contents=text,
        config={"task_type": "RETRIEVAL_QUERY"},
    )
    return response.embeddings[0].values


@app.get("/search")
def search(query: str):
    query_embedding = get_embedding(query)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=3,
    )

    formatted = []

    for doc, dist, meta in zip(
        results["documents"][0],
        results["distances"][0],
        results["metadatas"][0],
    ):
        formatted.append(
            {
                "text": doc,
                "score": round(1 - dist, 2),
                "source": meta.get("source", "unknown"),
            }
        )

    return {"results": formatted}
