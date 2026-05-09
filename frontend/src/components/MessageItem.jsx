/**
 * MessageItem.jsx — renders one message (user or assistant).
 *
 * For assistant messages it also renders the InsightBadge
 * showing intent and sentiment extracted by the backend.
 */

import styles from "./MessageItem.module.css";

// ── Intent & sentiment → CSS class mapping ────────────────────────────────────

const INTENT_CLASS = {
  query:     "intentQuery",
  complaint: "intentComplaint",
  request:   "intentRequest",
  greeting:  "intentGreeting",
  other:     "intentOther",
};

const SENTIMENT_CLASS = {
  positive: "sentimentPositive",
  neutral:  "sentimentNeutral",
  negative: "sentimentNegative",
};

// ── Sub-component: insight badges ─────────────────────────────────────────────

function InsightBadge({ insight }) {
  if (!insight) return null;

  const intentCls     = styles[INTENT_CLASS[insight.intent]     ?? "intentOther"];
  const sentimentCls  = styles[SENTIMENT_CLASS[insight.sentiment] ?? "sentimentNeutral"];

  return (
    <div className={styles.insightCard}>
      <span className={styles.insightLabel}>insights</span>
      <span className={`${styles.badge} ${intentCls}`}>
        intent: {insight.intent}
      </span>
      <span className={`${styles.badge} ${sentimentCls}`}>
        sentiment: {insight.sentiment}
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MessageItem({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`${styles.group} ${isUser ? styles.userGroup : styles.aiGroup}`}>
      <span className={styles.label}>
        {isUser ? "You" : "NeuralChat"}
      </span>

      <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.aiBubble}`}>
        {message.content}
      </div>

      {/* Insight card appears below the AI bubble */}
      {!isUser && <InsightBadge insight={message.insight} />}
    </div>
  );
}
