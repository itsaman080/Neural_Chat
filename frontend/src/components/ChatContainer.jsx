/**
 * ChatContainer.jsx — top-level chat component.
 *
 * Acts as the parent that:
 *  - Owns the app layout (header, message list, input bar)
 *  - Wires useChat hook → MessageList + InputBox
 *  - Passes suggestion callback so EmptyState can pre-fill the input
 *
 * State lives in useChat; this component is intentionally thin.
 */

import { useRef } from "react";
import { useChat } from "../hooks/useChat.js";
import MessageList from "./MessageList.jsx";
import InputBox from "./InputBox.jsx";
import styles from "./ChatContainer.module.css";

// ── Header ────────────────────────────────────────────────────────────────────

function Header({ messageCount }) {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <span className={styles.statusDot} aria-hidden="true" />
        <span className={styles.title}>NeuralChat</span>
      </div>
      <span className={styles.meta}>
        {messageCount > 0
          ? `${messageCount} message${messageCount !== 1 ? "s" : ""}`
          : "insight-aware · groq llm"}
      </span>
    </header>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ metrics, status }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brandRow}>
        <div className={styles.brandIcon}>💬</div>
        <div>
          <div className={styles.brandTitle}>NeuralChat</div>
          <div className={styles.brandSub}>conversation insights</div>
        </div>
      </div>

      <div className={styles.sectionLabel}>Session</div>
      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{metrics.total}</div>
          <div className={styles.statLabel}>Total messages</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{metrics.user}</div>
          <div className={styles.statLabel}>User</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{metrics.ai}</div>
          <div className={styles.statLabel}>AI</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{metrics.insight}</div>
          <div className={styles.statLabel}>Last insight</div>
        </div>
      </div>

      <div className={styles.sectionLabel}>Status</div>
      <div className={styles.statusCard}>
        <span className={styles.statusDotSmall} aria-hidden="true" />
        <span className={styles.statusText}>{status}</span>
      </div>

      <div className={styles.sectionLabel}>Tips</div>
      <ul className={styles.tipsList}>
        <li>Ask a question for query intent.</li>
        <li>Try “I have a complaint...” for negative sentiment.</li>
        <li>Use “Please help me...” for request intent.</li>
      </ul>
    </aside>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ChatContainer() {
  const { messages, isLoading, error, send } = useChat();

  const userCount = messages.filter((m) => m.role === "user").length;
  const aiCount = messages.filter((m) => m.role === "assistant").length;
  const lastInsight = [...messages]
    .reverse()
    .find((m) => m.role === "assistant" && m.insight)?.insight;

  const metrics = {
    total: messages.length,
    user: userCount,
    ai: aiCount,
    insight: lastInsight
      ? `${lastInsight.intent} · ${lastInsight.sentiment}`
      : "—",
  };

  const status = error
    ? "Error"
    : isLoading
      ? "Thinking..."
      : "Ready";

  // inputBoxRef lets us programmatically fill the textarea from suggestion chips
  const inputBoxRef = useRef(null);

  /**
   * handleSuggestion — called by MessageList's EmptyState chips.
   * Sends the suggestion text directly as a message.
   */
  function handleSuggestion(text) {
    send(text);
  }

  return (
    <div className={styles.page}>
      <Sidebar metrics={metrics} status={status} />

      <div className={styles.container}>
        <Header messageCount={messages.length} />

        {/* Message list (scrollable) */}
        <MessageList
          messages={messages}
          isLoading={isLoading}
          error={error}
          onSuggestion={handleSuggestion}
        />

        {/* Input bar (fixed to bottom) */}
        <InputBox
          ref={inputBoxRef}
          onSend={send}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
