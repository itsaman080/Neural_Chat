/**
 * MessageList.jsx — renders the scrollable list of all messages.
 *
 * Responsibilities:
 *  - Map messages array to <MessageItem> components
 *  - Show typing indicator when isLoading
 *  - Auto-scroll to bottom on new messages
 *  - Show empty state when no messages yet
 */

import { useEffect, useRef } from "react";
import MessageItem from "./MessageItem.jsx";
import styles from "./MessageList.module.css";

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className={styles.typingGroup}>
      <span className={styles.typingLabel}>NeuralChat</span>
      <div className={styles.typingBubble}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onSuggestion }) {
  const chips = [
    "I have a complaint about my order",
    "Can you explain how black holes work?",
    "I absolutely love this app!",
    "Help me write a professional bio",
  ];

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>💬</div>
      <p className={styles.emptyTitle}>Start a conversation</p>
      <p className={styles.emptySub}>
        Every message is analyzed for intent and sentiment in real time.
      </p>
      <div className={styles.chips}>
        {chips.map((c) => (
          <button
            key={c}
            className={styles.chip}
            onClick={() => onSuggestion(c)}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Error banner ──────────────────────────────────────────────────────────────

function ErrorBanner({ message }) {
  return (
    <div className={styles.aiGroup}>
      <span className={styles.label}>NeuralChat</span>
      <div className={styles.errorBubble}>{message}</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MessageList({ messages, isLoading, error, onSuggestion }) {
  const bottomRef = useRef(null);

  // Auto-scroll whenever messages or loading state changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const isEmpty = messages.length === 0 && !isLoading;

  return (
    <div className={styles.list}>
      {isEmpty ? (
        <EmptyState onSuggestion={onSuggestion} />
      ) : (
        messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))
      )}

      {error && <ErrorBanner message={error} />}
      {isLoading && <TypingIndicator />}

      {/* Invisible anchor for auto-scroll */}
      <div ref={bottomRef} />
    </div>
  );
}
