"""
main.py — FastAPI application entry point.

Routes:
  GET  /health  → liveness check
  POST /chat    → receive user message, return AI reply + insights
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from models import ChatRequest, ChatResponse, Insight
from llm import generate_reply_and_insight, CHAT_SYSTEM

load_dotenv()

# ── App setup ─────────────────────────────────────────────────────────────────

app = FastAPI(
    title="NeuralChat API",
    description="AI chat backend with intent & sentiment analysis",
    version="1.0.0",
)

# Allow the React dev server (and any production origin) to reach this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health", tags=["meta"])
async def health_check():
    """Liveness probe — used by frontend to confirm backend is up."""
    return {"status": "ok", "model": os.getenv("GROQ_MODEL", "llama3-8b-8192")}


@app.post("/chat", response_model=ChatResponse, tags=["chat"])
async def chat(request: ChatRequest):
    """
    Main chat endpoint.

    Accepts the latest user message plus full conversation history.
    Concurrently fetches an AI reply and extracts intent/sentiment.
    Returns both to the frontend in a single response.
    """
    if not request.message.strip():
        raise HTTPException(status_code=422, detail="Message cannot be empty.")

    # Convert Pydantic history objects → plain dicts for the LLM call
    history_dicts = [
        {"role": msg.role, "content": msg.content}
        for msg in request.history
    ]

    # Prepend the chat system prompt as the very first "system" message
    messages_with_system = [
        {"role": "system", "content": CHAT_SYSTEM},
        *history_dicts,
    ]

    try:
        reply, insight = await generate_reply_and_insight(
            message=request.message,
            history=messages_with_system,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"LLM request failed: {str(exc)}",
        )

    return ChatResponse(reply=reply, insight=insight)
