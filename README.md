# NeuralChat — AI Chat with Conversation Insights

A full-stack chat app where users chat with an AI assistant and receive **intent** and **sentiment** insights for each message. Powered by **Groq (Llama 3)** with a safe fallback if the API key is missing.

## Tech Stack

| Layer    | Technology               |
|----------|--------------------------|
| Frontend | React 18 + Vite          |
| Backend  | Python 3.11 + FastAPI    |
| LLM      | Groq API — Llama 3 (free)|
| Styling  | Plain CSS (no UI lib)    |

---

## Project Structure

```
neuralchat/
├── backend/
│   ├── main.py            # FastAPI app — routes, CORS
│   ├── llm.py             # Groq API calls (chat + insights)
│   ├── models.py          # Pydantic request/response models
│   ├── requirements.txt
│   └── .env               # ← put your GROQ_API_KEY here
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatContainer.jsx   # Parent — owns all state
│   │   │   ├── MessageList.jsx     # Scrollable message list
│   │   │   ├── MessageItem.jsx     # Single message + insight badge
│   │   │   └── InputBox.jsx        # Textarea + send button
│   │   ├── hooks/
│   │   │   └── useChat.js          # Chat state & API logic
│   │   ├── api.js                  # Axios calls to backend
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## Quick Start

### 1. Get a free Groq API key
Sign up at https://console.groq.com — it’s free.

### 2. Backend setup
```bash
cd backend
cp .env.example .env          # then paste your key inside
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev                   # runs at http://localhost:5173
```

Open http://localhost:5173 and start chatting.

---

## API Endpoints

| Method | Path      | Description                        |
|--------|-----------|------------------------------------|
| POST   | `/chat`   | Send message, get reply + insights |
| GET    | `/health` | Health check                       |

### POST /chat — Request
```json
{
  "message": "I have a complaint about my order",
  "history": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi! How can I help?" }
  ]
}
```

### POST /chat — Response
```json
{
  "reply": "I'm sorry to hear that...",
  "insight": {
    "intent": "complaint",
    "sentiment": "negative"
  }
}
```

---

## Insight Categories

**Intent:** `query` · `complaint` · `request` · `greeting` · `other`

**Sentiment:** `positive` · `neutral` · `negative`

---

## How It Works (Simple Flow)
1. User sends a message from the React UI.
2. Frontend calls the FastAPI `/chat` endpoint with the message and history.
3. Backend returns:
  - AI reply (Groq Llama 3)
  - Insight JSON: `{ "intent": "...", "sentiment": "..." }`
4. UI renders the reply and shows the insight under it.

If the Groq key is missing, the backend falls back to basic rule‑based responses and insights.

---

## Environment Variables
Create backend/.env from backend/.env.example:

- GROQ_API_KEY — required for LLM responses
- GROQ_MODEL — default `llama3-8b-8192` (recommended: `llama-3.1-8b-instant`)
- PORT — backend port (default `8000`)

---

## Useful Commands

Backend:
```bash
uvicorn main:app --reload --port 8000
```

Frontend:
```bash
npm run dev
```

---

## Troubleshooting
- **Backend offline**: Start FastAPI first (`uvicorn main:app ...`).
- **CORS issues**: Ensure backend is on port 8000 and frontend on 5173.
- **No LLM replies**: Check `GROQ_API_KEY` in backend/.env.

---
