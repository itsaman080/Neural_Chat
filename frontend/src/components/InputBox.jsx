/**
 * InputBox.jsx — textarea + send button at the bottom of the chat.
 *
 * Features:
 *  - Auto-resizes textarea as user types (up to 120px)
 *  - Enter sends; Shift+Enter adds newline
 *  - Disabled while a request is in-flight
 */

import { useRef, useCallback } from "react";
import styles from "./InputBox.module.css";

// ── Send icon SVG ─────────────────────────────────────────────────────────────

function SendIcon() {
  return (
    <svg
      width="16" height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function InputBox({ onSend, isLoading }) {
  const textareaRef = useRef(null);

  /** Grow / shrink the textarea to fit its content */
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, []);

  /** Submit the current textarea value */
  const handleSend = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const text = el.value.trim();
    if (!text || isLoading) return;
    onSend(text);
    el.value = "";
    el.style.height = "auto";
    el.focus();
  }, [onSend, isLoading]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className={styles.inputArea}>
      <div className={styles.inputWrap}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          placeholder="Type a message… (Enter to send)"
          rows={1}
          onKeyDown={handleKeyDown}
          onInput={autoResize}
          disabled={isLoading}
        />
      </div>

      <button
        className={styles.sendBtn}
        onClick={handleSend}
        disabled={isLoading}
        title="Send message"
        aria-label="Send message"
      >
        <SendIcon />
      </button>
    </div>
  );
}
