"use client";

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import styles from "./AIIntakeSection.module.css";

const intakeItems = [
  {
    title: "Goals & friction",
    text: "What success looks like and what you want the site to make easier.",
    icon: "target",
  },
  {
    title: "Brand & inspiration",
    text: "Color direction, logo, and photos you own the rights to.",
    icon: "palette",
  },
  {
    title: "Domain and hosting",
    text: "Where your site lives now.",
    icon: "domain",
  },
] as const;

const steps = [
  { key: "business", label: "Business" },
  { key: "goals", label: "Goals" },
  { key: "pages", label: "Pages" },
  { key: "assets", label: "Assets" },
  { key: "launch", label: "Launch" },
] as const;

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  was_redacted?: boolean;
};

type ProgressState = {
  completionPercent: number;
  currentStep: string | null;
  status: "started" | "in_progress" | "completed" | "contacted" | "archived";
};

type MessagePayload = {
  userMessage?: ChatMessage;
  assistantMessage?: ChatMessage | null;
  progress?: ProgressState | null;
  error?: string;
  code?: string;
};

const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi. I’ll keep this simple and ask one thing at a time. Tell me a little about your business and what you want the website to help you accomplish.",
  created_at: "",
};

function IntakeIcon({ type }: { type: (typeof intakeItems)[number]["icon"] }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (type === "target") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="7.5" />
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 4.5V7M19.5 12H17M12 19.5V17M4.5 12H7" />
      </svg>
    );
  }

  if (type === "palette") {
    return (
      <svg {...common}>
        <path d="M12 4.5a7.5 7.5 0 1 0 0 15h1.2c1.2 0 1.8-.8 1.3-1.8-.4-.8.1-1.7 1-1.7h1.3A3.7 3.7 0 0 0 20.5 12 7.8 7.8 0 0 0 12 4.5Z" />
        <circle cx="8.4" cy="10" r=".8" />
        <circle cx="11.4" cy="7.9" r=".8" />
        <circle cx="15" cy="9.1" r=".8" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16M12 4c2.1 2.2 3.2 4.9 3.2 8S14.1 17.8 12 20c-2.1-2.2-3.2-4.9-3.2-8S9.9 6.2 12 4Z" />
    </svg>
  );
}

function formatTime(value: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function AIIntakeSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [progress, setProgress] = useState<ProgressState>({
    completionPercent: 0,
    currentStep: "business",
    status: "started",
  });
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [chatError, setChatError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const isComplete = progress.status === "completed";
  const activeStepIndex = useMemo(() => {
    if (progress.currentStep === "complete" || isComplete) return steps.length;
    const index = steps.findIndex((step) => step.key === progress.currentStep);
    return index >= 0 ? index : 0;
  }, [isComplete, progress.currentStep]);

  useEffect(() => {
    let cancelled = false;

    async function loadConversation() {
      try {
        const response = await fetch("/api/intake/message", {
          method: "GET",
          cache: "no-store",
        });
        const payload = (await response.json()) as {
          messages?: ChatMessage[];
          progress?: ProgressState | null;
        };

        if (cancelled) return;
        if (Array.isArray(payload.messages)) setMessages(payload.messages);
        if (payload.progress) setProgress(payload.progress);
      } catch {
        if (!cancelled) {
          setChatError("I could not restore an earlier conversation. You can still start a new one below.");
        }
      } finally {
        if (!cancelled) setIsLoadingHistory(false);
      }
    }

    void loadConversation();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    body.scrollTo({ top: body.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  async function ensureSession() {
    const response = await fetch("/api/intake/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error || "The intake could not be started right now.");
    }
  }

  async function sendMessage() {
    const message = draft.trim();
    if (!message || isSending || isComplete) return;

    setChatError(null);
    setIsSending(true);
    setDraft("");

    const optimisticId = `pending-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: optimisticId,
      role: "user",
      content: message,
      created_at: new Date().toISOString(),
    };
    setMessages((current) => [...current, optimisticMessage]);

    try {
      await ensureSession();

      const response = await fetch("/api/intake/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const payload = (await response.json().catch(() => ({}))) as MessagePayload;

      setMessages((current) => {
        const withoutOptimistic = current.filter((item) => item.id !== optimisticId);
        const next = [...withoutOptimistic];

        if (payload.userMessage) next.push(payload.userMessage);
        else next.push(optimisticMessage);

        if (payload.assistantMessage) next.push(payload.assistantMessage);
        return next;
      });

      if (payload.progress) setProgress(payload.progress);

      if (!response.ok || payload.error) {
        setChatError(payload.error || "That answer was saved, but the conversation could not continue. Please try again.");
      }
    } catch (error) {
      setChatError(
        error instanceof Error
          ? error.message
          : "The conversation could not continue right now. Please try again.",
      );
    } finally {
      setIsSending(false);
      window.setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  function focusChat() {
    window.setTimeout(() => inputRef.current?.focus(), 250);
  }

  const visibleMessages = [welcomeMessage, ...messages];
  const statusLabel = isComplete ? "Complete" : isSending ? "Thinking" : "Ready";

  return (
    <section className={styles.section} id="contact">
      <div className={styles.inner}>
        <div className={styles.copyCol}>
          <div className={styles.kickerRow}>
            <span className={styles.kickerRule} aria-hidden="true" />
            <span>Project intake</span>
          </div>

          <h2>Start with a conversation</h2>

          <p className={styles.lead}>
            You do not need to figure out every detail before you start. The AI
            consultant asks one question at a time, follows your answers, and
            organizes what I need into a clear project brief.
          </p>

          <div className={styles.progressWrap} aria-label={`Project intake ${progress.completionPercent}% complete`}>
            <div className={styles.progressLine} aria-hidden="true" />
            <div
              className={styles.progressFill}
              aria-hidden="true"
              style={{ transform: `scaleX(${progress.completionPercent / 100})` }}
            />
            <div className={styles.steps}>
              {steps.map((step, index) => {
                const completed = isComplete || index < activeStepIndex;
                const active = !isComplete && index === activeStepIndex;

                return (
                  <div className={styles.step} key={step.key}>
                    <span
                      className={`${styles.dot} ${active ? styles.dotActive : ""} ${completed ? styles.dotComplete : ""}`}
                      aria-hidden="true"
                    />
                    <span className={styles.stepNumber}>{index + 1}</span>
                    <span className={styles.stepLabel}>{step.label}</span>
                  </div>
                );
              })}
            </div>
            <span className={styles.progressPercent}>{progress.completionPercent}% complete</span>
          </div>

          <p className={styles.collectLabel}>A few things we will cover</p>

          <div className={styles.infoGrid}>
            {intakeItems.map((item) => (
              <div className={styles.infoItem} key={item.title}>
                <div className={styles.infoIcon}>
                  <IntakeIcon type={item.icon} />
                </div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <p className={styles.securityNote}>
            Never send passwords or verification codes here. If we work
            together, account access is shared securely after kickoff.
          </p>

          <a className={styles.cta} href="#ai-intake-chat" onClick={focusChat}>
            <span>{messages.length > 0 ? "Continue the Conversation" : "Start the Conversation"}</span>
            <span className={styles.ctaArrow} aria-hidden="true">→</span>
          </a>
          <p className={styles.ctaNote}>Plan on about 10 minutes</p>
          <p className={styles.emailFallback}>
            Prefer email? <a href="mailto:kyle@stringhamwebdesign.com">kyle@stringhamwebdesign.com</a>
          </p>
        </div>

        <div
          className={styles.visualCol}
          style={{ gridTemplateColumns: "minmax(0, 28rem)", justifyContent: "end" }}
        >
          <div className={styles.chatCard} id="ai-intake-chat">
            <div className={styles.chatHeader}>
              <div className={styles.chatIdentity}>
                <span className={styles.aiBadge}>AI</span>
                <div>
                  <h3>AI Consultant</h3>
                  <p>Ask · Collect · Organize</p>
                </div>
              </div>
              <span className={`${styles.online} ${isComplete ? styles.onlineComplete : ""}`}>
                <span aria-hidden="true" /> {statusLabel}
              </span>
            </div>

            <div
              className={styles.chatBody}
              ref={bodyRef}
              role="log"
              aria-live="polite"
              aria-busy={isSending || isLoadingHistory}
            >
              {isLoadingHistory ? (
                <div className={styles.loadingHistory}>Loading your conversation…</div>
              ) : (
                visibleMessages.map((message) => (
                  <div
                    className={`${styles.messageRow} ${message.role === "user" ? styles.messageRowUser : ""}`}
                    key={message.id}
                  >
                    {message.role === "assistant" && <span className={styles.messageAvatar}>AI</span>}
                    <div className={styles.messageGroup}>
                      <div className={message.role === "assistant" ? styles.messageAi : styles.messageUser}>
                        {message.content}
                      </div>
                      {message.created_at && (
                        <span className={`${styles.time} ${message.role === "user" ? styles.timeUser : ""}`}>
                          {formatTime(message.created_at)}
                        </span>
                      )}
                    </div>
                    {message.role === "user" && <span className={styles.youBadge}>You</span>}
                  </div>
                ))
              )}

              {isSending && (
                <div className={styles.typingRow} aria-label="AI consultant is thinking">
                  <span className={styles.messageAvatar}>AI</span>
                  <span className={styles.typingBubble}>
                    <i />
                    <i />
                    <i />
                  </span>
                </div>
              )}

              {chatError && (
                <div className={styles.chatError} role="status">
                  {chatError}
                </div>
              )}
            </div>

            <form className={styles.chatInputBar} onSubmit={handleSubmit}>
              <textarea
                ref={inputRef}
                className={styles.chatInput}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isComplete ? "Intake complete" : "Type your message…"}
                rows={1}
                maxLength={4000}
                disabled={isSending || isComplete}
                aria-label="Message the AI project intake consultant"
              />
              <button
                className={styles.sendButton}
                type="submit"
                disabled={isSending || isComplete || !draft.trim()}
                aria-label="Send message"
              >
                {isSending ? <span className={styles.sendSpinner} aria-hidden="true" /> : "↑"}
              </button>
            </form>
            <p className={styles.chatSecurity}>
              Passwords and verification codes are never requested in this chat.
            </p>
          </div>

          <p className={styles.handNote} aria-hidden="true">
            From conversation<br />to a beautiful<br />website.
          </p>
        </div>
      </div>
    </section>
  );
}
