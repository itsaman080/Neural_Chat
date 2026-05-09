"""
models.py — Pydantic schemas for request and response validation.
"""

from pydantic import BaseModel
from typing import Literal, Optional


class HistoryMessage(BaseModel):
    """A single turn in the conversation history."""
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    """Payload sent by the frontend on each user message."""
    message: str
    history: list[HistoryMessage] = []


class Insight(BaseModel):
    """Extracted intent and sentiment for the user's message."""
    intent: Literal["query", "complaint", "request", "greeting", "other"]
    sentiment: Literal["positive", "neutral", "negative"]


class ChatResponse(BaseModel):
    """Full response returned to the frontend."""
    reply: str
    insight: Insight
