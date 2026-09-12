"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import TransmissionSubmit from "../TransmissionSubmit";
import { PACKAGE_CHOICES, packageNameFor } from "../data/pricing";
import {
  QuoteAnswers,
  QuoteField,
  REQUIRED_FIELDS,
  EMAIL_PATTERN,
} from "../lib/quoteReceipt";
import styles from "./quote.module.css";

type StepDefinition = {
  /** The technical label above the question. */
  label: string;
  /** The question itself, rendered as the step heading. */
  question: string;
  /** One line of help under the question. */
  help?: string;
  fields: {
    name: QuoteField;
    label: string;
    type: "text" | "email" | "url" | "textarea";
    placeholder?: string;
    autoComplete?: string;
    /** Rendered under the field, always present so nothing shifts. */
    hint?: string;
    optional?: boolean;
  }[];
};

const steps: StepDefinition[] = [
  {
    label: "Entry signal",
    question: "First — who am I talking to?",
    fields: [
      {
        name: "name",
        label: "Your name",
        type: "text",
        autoComplete: "name",
        placeholder: "Jordan Ellis",
      },
    ],
  },
  {
    label: "Return channel",
    question: "Where should the reply go?",
    help: "This is the address my reply and your confirmation land in.",
    fields: [
      {
        name: "email",
        label: "Email",
        type: "email",
        autoComplete: "email",
        placeholder: "you@yourpractice.com",
      },
    ],
  },
  {
    label: "The business",
    question: "What's the business, and what does it do?",
    help: "Plain language is fine. I'd rather have how you'd say it out loud.",
    fields: [
      {
        name: "business",
        label: "Business name",
        type: "text",
        autoComplete: "organization",
        placeholder: "Cedar Path Behavioral",
      },
      {
        name: "businessDoes",
        label: "What it does",
        type: "textarea",
        placeholder: "In-home ABA therapy for families across the county.",
      },
    ],
  },
  {
    label: "Current signal",
    question: "What do you have online right now?",
    help: "A link, a social page, or nothing at all. Nothing is a normal answer.",
    fields: [
      {
        name: "current",
        label: "What you have now",
        type: "text",
        placeholder: "cedarpath.com — or: nothing yet",
        optional: true,
      },
    ],
  },
  {
    label: "The job",
    question: "What does the site need to accomplish?",
    help: "Not what it should look like. What it should do for the business.",
    fields: [
      {
        name: "goal",
        label: "What the site needs to accomplish",
        type: "textarea",
        placeholder:
          "Families find us, understand what we offer, and get on the waitlist without calling.",
      },
    ],
  },
  {
    label: "Timing",
    question: "Roughly when do you need this?",
    help: "A rough answer is genuinely fine. It tells me how to sequence the work.",
    fields: [
      {
        name: "timeline",
        label: "Rough timeline",
        type: "text",
        placeholder: "Before the spring intake, so around March",
        optional: true,
      },
    ],
  },
  {
    label: "Preferred channel",
    question: "How do you prefer to talk?",
    help: "Email, phone, video, or whatever you actually answer.",
    fields: [
      {
        name: "contact",
        label: "How you prefer to talk",
        type: "text",
        placeholder: "Email first, then a call",
        optional: true,
      },
    ],
  },
];

const STORAGE_KEY = "ks-quote-draft-v1";

const emptyAnswers: QuoteAnswers = {
  name: "",
  email: "",
  business: "",
  businessDoes: "",
  current: "",
  goal: "",
  timeline: "",
  contact: "",
  package: "",
};

function validateField(field: QuoteField, value: string) {
  const trimmed = value.trim();

  if (!REQUIRED_FIELDS.includes(field)) return "";
  if (!trimmed) return "This one I do need.";

  if (field === "email" && !EMAIL_PATTERN.test(trimmed)) {
    return "That address doesn't look right.";
  }
  if (field === "name" && trimmed.length < 2) {
    return "Please enter at least two characters.";
  }
  if (
    (field === "business" || field === "businessDoes" || field === "goal") &&
    trimmed.length < 3
  ) {
    return "A few more words, so I can actually read it.";
  }

  return "";
}

export default function QuoteForm({
  initialPackage = "",
}: {
  /** A tier id validated on the server from ?package=, or "" for no choice. */
  initialPackage?: string;
}) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<QuoteAnswers>({
    ...emptyAnswers,
    package: initialPackage,
  });

  const [errors, setErrors] = useState<Partial<Record<QuoteField, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState("");
  const [replyLabel, setReplyLabel] = useState("");
  const [restored, setRestored] = useState(false);

  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const shouldFocusField = useRef(false);

  const total = steps.length;
  const step = steps[stepIndex];
  const isLast = stepIndex === total - 1;

  // --- resume ---------------------------------------------------------------
  // Restore before the first paint the user can interact with, so a refresh
  // mid-form never costs them their answers.
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as {
          answers?: Partial<QuoteAnswers>;
          stepIndex?: number;
        };
        if (parsed.answers) {
          // A tier just clicked on /pricing beats whatever the draft held.
          setAnswers({
            ...emptyAnswers,
            ...parsed.answers,
            ...(initialPackage ? { package: initialPackage } : {}),
          });
        }
        if (
          typeof parsed.stepIndex === "number" &&
          parsed.stepIndex >= 0 &&
          parsed.stepIndex < total
        ) {
          setStepIndex(parsed.stepIndex);
        }
      }
    } catch {
      // A blocked or full sessionStorage must not stop the form working.
    }
    setRestored(true);
  }, [total, initialPackage]);

  useEffect(() => {
    if (!restored) return;
    try {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ answers, stepIndex }),
      );
    } catch {
      // Ignore: persistence is a convenience, not a requirement.
    }
  }, [answers, stepIndex, restored]);

  // Move focus to the new step's heading so the change is announced and
  // keyboard users are not dropped back at the top of the document.
  useEffect(() => {
    if (!restored) return;
    if (shouldFocusField.current) {
      shouldFocusField.current = false;
      firstFieldRef.current?.focus();
      return;
    }
    headingRef.current?.focus();
  }, [stepIndex, restored]);

  /** The tier name to show in the note, or null when no tier is chosen. */
  const chosenPackage = packageNameFor(answers.package);

  const choosePackage = (value: string) => {
    setAnswers((current) => ({ ...current, package: value }));
  };

  /** "change" — drop the selection, and drop ?package= with it so a refresh
      does not put it straight back. */
  const clearPackage = () => {
    setAnswers((current) => ({ ...current, package: "" }));
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has("package")) {
        url.searchParams.delete("package");
        window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
      }
    } catch {
      // The selection is cleared either way; the URL is a nicety.
    }
  };

  const update = (field: QuoteField, value: string) => {
    setAnswers((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const validateStep = () => {
    const stepErrors: Partial<Record<QuoteField, string>> = {};
    for (const field of step.fields) {
      const message = validateField(field.name, answers[field.name]);
      if (message) stepErrors[field.name] = message;
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const goNext = () => {
    if (!validateStep()) {
      shouldFocusField.current = true;
      firstFieldRef.current?.focus();
      return;
    }
    if (!isLast) setStepIndex((current) => current + 1);
  };

  const goBack = () => {
    setFormError("");
    if (stepIndex > 0) setStepIndex((current) => current - 1);
  };

  const submit = async () => {
    if (!validateStep()) {
      setFormError("This one still needs an answer.");
      firstFieldRef.current?.focus();
      throw new Error("incomplete");
    }

    // A later step can be reached with an earlier one emptied by the browser's
    // restore, so re-check everything before transmitting.
    const allErrors: Partial<Record<QuoteField, string>> = {};
    for (const field of REQUIRED_FIELDS) {
      const message = validateField(field, answers[field]);
      if (message) allErrors[field] = message;
    }

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      const firstBad = steps.findIndex((entry) =>
        entry.fields.some((field) => allErrors[field.name]),
      );
      if (firstBad >= 0) setStepIndex(firstBad);
      setFormError("A couple of answers need another look.");
      throw new Error("incomplete");
    }

    setFormError("");
    setSubmitting(true);

    const response = await fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...answers, website: "" }),
    });

    const result = (await response.json()) as {
      ok?: boolean;
      error?: string;
      replyByLabel?: string;
    };

    if (!response.ok || !result.ok) {
      setSubmitting(false);
      setFormError(result.error || "That didn't go through. Nothing was lost.");
      // Throwing puts the button into its own error state.
      throw new Error(result.error || "failed");
    }

    setReplyLabel(result.replyByLabel || "");
    setSubmitting(false);
    setSent(true);

    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to clean up if storage was unavailable all along.
    }

    // Let the SENT state resolve before leaving the page.
    window.setTimeout(() => router.push("/quote/received"), 1100);
  };

  const progressLabel = `Question ${stepIndex + 1} of ${total}`;

  return (
    <div className={styles.formShell}>
      {/* ---------- progress meter ---------- */}
      <div className={styles.meterRow}>
        <p className={styles.meterLabel}>
          <span>Brief</span>
          <b>
            {String(stepIndex + 1).padStart(2, "0")} /{" "}
            {String(total).padStart(2, "0")}
          </b>
        </p>

        <div
          className={styles.meter}
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={stepIndex + 1}
          aria-valuetext={progressLabel}
        >
          {steps.map((entry, index) => (
            <span
              className={`${styles.segment} ${
                index < stepIndex ? styles.segmentDone : ""
              } ${index === stepIndex ? styles.segmentLive : ""}`}
              key={entry.label}
            />
          ))}
        </div>
      </div>

      {/* ---------- package ----------
          Rendered above the questions rather than as one of them: the seven
          questions are the brief, this is context that may already be
          answered by the link that got here. Server-rendered from ?package=,
          so the note is in the first paint and shifts nothing. */}
      <div className={styles.packageRow}>
        <p className={styles.packageLabel}>Package</p>

        <p className={chosenPackage ? styles.packageNote : styles.packageHelp}>
          {chosenPackage ? (
            <>
              <span>
                Starting from the {chosenPackage} package — we&apos;ll confirm
                scope on the call.
              </span>{" "}
              <button
                className={styles.packageChange}
                onClick={clearPackage}
                type="button"
              >
                change
              </button>
            </>
          ) : (
            "Pick the closest fit, or leave it — we'll confirm scope on the call."
          )}
        </p>

        <fieldset className={styles.packageChoices}>
          <legend className={styles.srOnly}>
            Which package are you starting from?
          </legend>
          {PACKAGE_CHOICES.map((choice) => (
            <label className={styles.packageChoice} key={choice.id}>
              <input
                checked={answers.package === choice.id}
                name="package"
                onChange={() => choosePackage(choice.id)}
                type="radio"
                value={choice.id}
              />
              <span>{choice.name}</span>
            </label>
          ))}
        </fieldset>
      </div>

      {/* Step changes are announced here rather than by moving focus alone. */}
      <p aria-live="polite" className={styles.srOnly}>
        {progressLabel}: {step.question}
      </p>

      <form
        className={styles.form}
        noValidate
        onSubmit={(event) => event.preventDefault()}
      >
        <fieldset className={styles.fieldset}>
          <legend className={styles.srOnly}>{step.question}</legend>

          <p className={styles.stepLabel}>{step.label}</p>

          <h2
            className={styles.question}
            ref={headingRef}
            tabIndex={-1}
          >
            {step.question}
          </h2>

          {step.help ? <p className={styles.help}>{step.help}</p> : null}

          <div className={styles.fields}>
            {step.fields.map((field, index) => {
              const error = errors[field.name];
              const errorId = `${field.name}-error`;
              const hintId = `${field.name}-hint`;

              return (
                <div className={styles.field} key={field.name}>
                  <label className={styles.fieldLabel} htmlFor={field.name}>
                    {field.label}
                    {field.optional ? (
                      <span className={styles.optional}> — optional</span>
                    ) : null}
                  </label>

                  {field.type === "textarea" ? (
                    <textarea
                      aria-describedby={error ? errorId : hintId}
                      aria-invalid={error ? true : undefined}
                      className={`${styles.input} ${styles.textarea} ${
                        error ? styles.inputError : ""
                      }`}
                      id={field.name}
                      name={field.name}
                      onChange={(event) => update(field.name, event.target.value)}
                      placeholder={field.placeholder}
                      ref={
                        index === 0
                          ? (node) => {
                              firstFieldRef.current = node;
                            }
                          : undefined
                      }
                      rows={4}
                      value={answers[field.name]}
                    />
                  ) : (
                    <input
                      aria-describedby={error ? errorId : hintId}
                      aria-invalid={error ? true : undefined}
                      autoComplete={field.autoComplete}
                      className={`${styles.input} ${error ? styles.inputError : ""}`}
                      id={field.name}
                      name={field.name}
                      onChange={(event) => update(field.name, event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !isLast) {
                          event.preventDefault();
                          goNext();
                        }
                      }}
                      placeholder={field.placeholder}
                      ref={
                        index === 0
                          ? (node) => {
                              firstFieldRef.current = node;
                            }
                          : undefined
                      }
                      type={field.type}
                      value={answers[field.name]}
                    />
                  )}

                  <p className={styles.fieldFoot} id={error ? errorId : hintId}>
                    {error ? (
                      <span className={styles.error} role="alert">
                        {error}
                      </span>
                    ) : (
                      <span className={styles.hint}>{field.hint || " "}</span>
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        </fieldset>

        <div className={styles.controls}>
          <button
            className={styles.back}
            disabled={stepIndex === 0 || submitting || sent}
            onClick={goBack}
            type="button"
          >
            <span aria-hidden="true">←</span> Back
          </button>

          {isLast ? (
            <TransmissionSubmit
              errorMessage={formError || "Transmission interrupted."}
              idleLabel="SEND THE BRIEF"
              onTransmit={submit}
              sentLabel={
                replyLabel ? `I’ll reply by ${replyLabel}.` : undefined
              }
            />
          ) : (
            <button className={styles.next} onClick={goNext} type="button">
              Next <span aria-hidden="true">→</span>
            </button>
          )}
        </div>

        {formError ? (
          <p className={styles.formError} role="alert">
            {formError}
          </p>
        ) : null}
      </form>

      <p className={styles.resumeNote}>
        Your answers are kept in this browser tab as you go, so a refresh
        won&apos;t lose them.
      </p>
    </div>
  );
}
