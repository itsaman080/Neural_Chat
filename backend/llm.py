"""
llm.py — All interactions with the Groq LLM API.

Two responsibilities:
  1. generate_reply()   — conversational response to the user
  2. extract_insight()  — structured JSON: intent + sentiment
"""

import json
import os
import asyncio

from groq import AsyncGroq
from dotenv import load_dotenv

from models import Insight

load_dotenv()

# ── Groq client (async) ───────────────────────────────────────────────────────
_api_key = os.getenv("GROQ_API_KEY")
_client = AsyncGroq(api_key=_api_key) if _api_key else None
MODEL = os.getenv("GROQ_MODEL", "llama3-8b-8192")

# ── System prompts ────────────────────────────────────────────────────────────

CHAT_SYSTEM = """You are NeuralChat, a friendly and helpful AI assistant.
Be conversational, concise, and warm. Respond in 2–4 sentences unless the user
asks for something that clearly needs a longer answer.
Never mention that you are an AI language model unless directly asked."""

INSIGHT_SYSTEM = """You are a text-classification API. 
Given a user message you MUST respond with a single JSON object and absolutely 
nothing else — no explanation, no markdown, no code fences.

The JSON must have exactly two keys:
  "intent"    — one of: query | complaint | request | greeting | other
  "sentiment" — one of: positive | neutral | negative

Rules:
- intent=query      → user is asking a question or seeking information
- intent=complaint  → user is expressing dissatisfaction or reporting a problem
- intent=request    → user is asking to perform a task or provide something
- intent=greeting   → user is greeting, saying hello/goodbye, or being social
- intent=other      → anything that doesn't clearly fit above

Example output:
{"intent": "complaint", "sentiment": "negative"}"""

# ── Fallback defaults ─────────────────────────────────────────────────────────

_FALLBACK_INSIGHT = Insight(intent="other", sentiment="neutral")


# ── Simple rule-based fallback ───────────────────────────────────────────────

def _fallback_reply(message: str) -> str:
    text = message.strip()
    if not text:
        return "(LLM not detected — using fallback responses) I didn’t catch that—could you rephrase?"
    lowered = text.lower()
    if any(word in lowered for word in ["hi", "hello", "hey", "good morning", "good evening"]):
        return "(LLM not detected — using fallback responses) Hi! How can I help you today?"
    if any(word in lowered for word in ["thank", "thanks"]):
        return "(LLM not detected — using fallback responses) You’re welcome! Anything else you need?"
    if "?" in lowered:
        return "(LLM not detected — using fallback responses) I can help with that. Can you share a bit more detail?"
    if any(word in lowered for word in ["issue", "problem", "error", "bug", "complaint"]):
        return "(LLM not detected — using fallback responses) I’m sorry you’re running into that. What’s the exact issue?"
    return "(LLM not detected — using fallback responses) Got it. Tell me a bit more so I can assist."


def _fallback_insight(message: str) -> Insight:
    text = message.strip().lower()
    if not text:
        return _FALLBACK_INSIGHT

    # Intent heuristics
    if any(word in text for word in ["hi", "hello", "hey", "goodbye", "bye"]):
        intent = "greeting"
    elif "?" in text or any(word in text for word in ["how", "what", "why", "when", "where", "can you explain"]):
        intent = "query"
    elif any(word in text for word in ["please", "could you", "can you", "help me", "i need", "i want"]):
        intent = "request"
    elif any(word in text for word in ["complaint", "issue", "problem", "bad", "broken", "refund", "angry"]):
        intent = "complaint"
    else:
        intent = "other"

    # Sentiment heuristics
    if any(word in text for word in ["love", "great", "awesome", "thanks", "amazing", "good"]):
        sentiment = "positive"
    elif any(word in text for word in ["hate", "terrible", "awful", "bad", "worst", "angry", "upset"]):
        sentiment = "negative"
    else:
        sentiment = "neutral"

    return Insight(intent=intent, sentiment=sentiment)


# ── Public API ────────────────────────────────────────────────────────────────

async def generate_reply(message: str, history: list[dict]) -> str:
    """
    Send the full conversation history + new message to Groq
    and return the assistant's reply text.
    """
    messages = [*history, {"role": "user", "content": message}]

    if _client is None:
        return _fallback_reply(message)

    try:
        completion = await _client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.75,
            max_tokens=400,
        )
        return completion.choices[0].message.content.strip()
    except Exception:
        return _fallback_reply(message)


async def extract_insight(message: str) -> Insight:
    """
    Ask the LLM to classify intent and sentiment for the user message.
    Returns an Insight object; falls back gracefully on any failure.
    """
    if _client is None:
        return _fallback_insight(message)

    try:
        completion = await _client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": INSIGHT_SYSTEM},
                {"role": "user",   "content": message},
            ],
            temperature=0.0,   # deterministic for classification
            max_tokens=60,
        )
        raw = completion.choices[0].message.content.strip()

        # Strip accidental markdown fences if the model adds them
        raw = raw.replace("```json", "").replace("```", "").strip()

        data = json.loads(raw)
        return Insight(**data)

    except Exception:
        # Never let insight extraction crash the whole request
        return _fallback_insight(message)


async def generate_reply_and_insight(
    message: str, history: list[dict]
) -> tuple[str, Insight]:
    """
    Run chat reply and insight extraction concurrently to minimise latency.
    """
    reply, insight = await asyncio.gather(
        generate_reply(message, history),
        extract_insight(message),
    )
    return reply, insight
