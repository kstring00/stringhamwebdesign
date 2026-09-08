"use client";

import { FormEvent, useState } from "react";

import styles from "./BottomCapture.module.css";

type FieldErrors = {
  name?: string;
  email?: string;
  phone?: string;
};

const EMAIL = "kyle@stringhamwebdesign.com";

function validateName(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "Please enter your name.";
  if (trimmed.length < 2) return "Please enter at least two characters.";
  return "";
}

function validateEmail(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "Please enter your email.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "Please enter a valid email address.";
  }
  return "";
}

function validatePhone(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 7) return "Please enter a valid phone number.";
  return "";
}

export default function BottomCapture() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [showPhone, setShowPhone] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const setFieldError = (field: keyof FieldErrors, message: string) => {
    setErrors((current) => ({ ...current, [field]: message || undefined }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;

    const nextErrors: FieldErrors = {
      name: validateName(name) || undefined,
      email: validateEmail(email) || undefined,
      phone: validatePhone(phone) || undefined,
    };

    setErrors(nextErrors);
    setFormError("");

    if (nextErrors.name || nextErrors.email || nextErrors.phone) return;

    setStatus("loading");

    try {
      const response = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          website,
          source: "bottom_capture",
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Something went wrong. Please try again.");
      }

      setStatus("success");
    } catch (error) {
      setStatus("idle");
      setFormError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  return (
    <section className={styles.section} id="quick-contact">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Not ready for the full intake?</p>
          <h2>Start with the basics</h2>
          <p className={styles.subcopy}>
            Send your name and email. I’ll reply within one business day with the next step.
          </p>
        </div>

        <div className={styles.formWrap}>
          {status === "success" ? (
            <div className={styles.success} role="status" aria-live="polite">
              <span className={styles.successMark} aria-hidden="true">✓</span>
              <div>
                <h3>Got it.</h3>
                <p>I’ll reply within one business day.</p>
              </div>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label htmlFor="capture-name">Name</label>
                  <input
                    id="capture-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "capture-name-error" : undefined}
                    onChange={(event) => setName(event.target.value)}
                    onBlur={() => setFieldError("name", validateName(name))}
                  />
                  {errors.name ? (
                    <p className={styles.error} id="capture-name-error">
                      {errors.name}
                    </p>
                  ) : null}
                </div>

                <div className={styles.field}>
                  <label htmlFor="capture-email">Email</label>
                  <input
                    id="capture-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "capture-email-error" : undefined}
                    onChange={(event) => setEmail(event.target.value)}
                    onBlur={() => setFieldError("email", validateEmail(email))}
                  />
                  {errors.email ? (
                    <p className={styles.error} id="capture-email-error">
                      {errors.email}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className={styles.honeypot} aria-hidden="true">
                <label htmlFor="capture-website">Website</label>
                <input
                  id="capture-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                />
              </div>

              {showPhone ? (
                <div className={`${styles.field} ${styles.phoneField}`}>
                  <div className={styles.phoneLabelRow}>
                    <label htmlFor="capture-phone">Phone</label>
                    <button
                      className={styles.phoneToggle}
                      type="button"
                      onClick={() => {
                        setShowPhone(false);
                        setPhone("");
                        setFieldError("phone", "");
                      }}
                    >
                      Remove phone
                    </button>
                  </div>
                  <input
                    id="capture-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? "capture-phone-error" : undefined}
                    onChange={(event) => setPhone(event.target.value)}
                    onBlur={() => setFieldError("phone", validatePhone(phone))}
                  />
                  {errors.phone ? (
                    <p className={styles.error} id="capture-phone-error">
                      {errors.phone}
                    </p>
                  ) : null}
                </div>
              ) : (
                <button
                  className={styles.addPhone}
                  type="button"
                  onClick={() => setShowPhone(true)}
                >
                  + Add phone
                </button>
              )}

              {formError ? (
                <p className={styles.formError} role="alert">
                  {formError}
                </p>
              ) : null}

              <button
                className={styles.submit}
                type="submit"
                disabled={status === "loading"}
              >
                <span>{status === "loading" ? "Sending" : "Send your details"}</span>
                <span aria-hidden="true">→</span>
              </button>
            </form>
          )}

          <p className={styles.alternate}>
            Prefer email? <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </p>
        </div>
      </div>
    </section>
  );
}
