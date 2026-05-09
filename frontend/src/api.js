/**
 * api.js — HTTP client for the NeuralChat FastAPI backend.
 *
 * All backend calls live here so components stay decoupled
 * from transport details.
 */

import axios from "axios";

const http = axios.create({
  baseURL: "/api",          // Vite proxies /api → http://localhost:8000
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

/**
 * sendMessage — POST /chat
 *
 * @param {string}   message  — The user's latest message
 * @param {Array}    history  — Prior turns: [{ role, content }, ...]
 * @returns {Promise<{ reply: string, insight: { intent, sentiment } }>}
 */
export async function sendMessage(message, history = []) {
  const { data } = await http.post("/chat", { message, history });
  return data;
}

/**
 * checkHealth — GET /health
 * Used at startup to confirm the backend is reachable.
 */
export async function checkHealth() {
  const { data } = await http.get("/health");
  return data;
}
