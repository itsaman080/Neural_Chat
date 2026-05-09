/**
 * useChat.js — Custom hook that owns all chat state and logic.
 *
 * Responsibilities:
 *  - Maintain message list (with insights attached to each AI message)
 *  - Maintain conversation history for the LLM
 *  - Call the backend API and handle loading / error states
 *
 * Components just call { messages, isLoading, error, send } — nothing else.
 */

import { useState, useCallback } from "react";
import { sendMessage as apiSend } from "../api.js";

/**
 * Shape of a single entry in `messages`:
 * {
 *   id:        string,   — unique key for React
 *   role:      "user" | "assistant",
 *   content:   string,
 *   insight:   { intent, sentiment } | null   — only on assistant messages
 *   timestamp: Date,
 * }
 */

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export function useChat() {
  const [messages, setMessages]   = useState([]);   // displayed messages
  const [history, setHistory]     = useState([]);   // bare { role, content } for API
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState(null);

  /**
   * send — triggered when the user submits a message.
   *
   * Flow:
   *  1. Append user message to display list immediately (optimistic)
   *  2. Call backend; show loading state
   *  3. Append AI reply + insight to display list
   *  4. Update bare history used for subsequent API calls
   */
  const send = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setError(null);
    setIsLoading(true);

    // Optimistic: show user message right away
    const userMsg = {
      id:        makeId(),
      role:      "user",
      content:   trimmed,
      insight:   null,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // History that will be sent to the backend (excludes the current message)
    const currentHistory = [...history];

    try {
      const { reply, insight } = await apiSend(trimmed, currentHistory);

      const assistantMsg = {
        id:        makeId(),
        role:      "assistant",
        content:   reply,
        insight,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Update history with both turns for next request
      setHistory((prev) => [
        ...prev,
        { role: "user",      content: trimmed },
        { role: "assistant", content: reply   },
      ]);
    } catch (err) {
      const status = err?.response?.status;
      const serverDetail = err?.response?.data?.detail;

      let msg = "Something went wrong. Please try again.";

      if (!err?.response) {
        msg = "Backend is offline. Start the API server and try again.";
      } else if (status >= 500) {
        msg = "Backend error. Please check the server and try again.";
      } else if (status === 422) {
        msg = serverDetail || "Message cannot be empty.";
      } else if (serverDetail) {
        msg = serverDetail;
      }

      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [history, isLoading]);

  return { messages, isLoading, error, send };
}
