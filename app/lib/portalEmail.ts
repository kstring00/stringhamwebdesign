/**
 * Portal notifications.
 *
 * The portal is the record; email is the nudge that tells someone to go and
 * look at it. So these are deliberately short, carry no project detail beyond
 * a subject line, and always link back rather than reproducing the content.
 * A message body in an inbox is a copy that can drift from the thread and a
 * disclosure risk if the address is wrong.
 *
 * Nothing here throws into a request path. A notification that fails must not
 * fail the action that triggered it — the message was still sent, the file was
 * still uploaded. Callers schedule these with `after()`.
 */

import { portalUrl } from "./portalUrl";

/**
 * Resend's API, or a local capture endpoint when verifying who gets notified.
 *
 * The override is ignored in production: an env-settable mail endpoint on a
 * live server would be a way to redirect client mail. In dev it lets the
 * notification tests assert recipients without sending anything.
 */
function mailEndpoint() {
  if (process.env.NODE_ENV !== "production" && process.env.PORTAL_MAIL_ENDPOINT) {
    return process.env.PORTAL_MAIL_ENDPOINT;
  }
  return "https://api.resend.com/emails";
}

/**
 * Until the domain is verified in Resend, mail falls back to the shared
 * onboarding sender, which lands in spam. See docs/PORTAL_TESTING.md.
 */
function fromAddress() {
  return (
    process.env.PORTAL_FROM_EMAIL ||
    process.env.CAPTURE_FROM_EMAIL ||
    "Kyle Stringham <onboarding@resend.dev>"
  );
}

function adminAddress() {
  return process.env.CAPTURE_TO_EMAIL || "stringham00@gmail.com";
}

type Notification = {
  to: string;
  subject: string;
  lines: string[];
  /** Appended as the closing call to action. */
  cta?: string;
};

async function send({ to, subject, lines, cta }: Notification) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, reason: "no-api-key" as const };
  if (!to) return { sent: false, reason: "no-recipient" as const };

  const text = [
    ...lines,
    "",
    cta ?? "Open the portal:",
    portalUrl(),
    "",
    "— Kyle",
  ].join("\n");

  try {
    const response = await fetch(mailEndpoint(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: fromAddress(), to: [to], subject, text }),
    });

    if (!response.ok) {
      console.error("Portal notification failed", response.status, subject);
      return { sent: false, reason: "send-failed" as const };
    }

    return { sent: true, reason: null };
  } catch (error) {
    console.error("Portal notification threw", subject, error);
    return { sent: false, reason: "threw" as const };
  }
}

/** A new message in a project thread, to whoever did not write it. */
export function notifyNewMessage(input: {
  to: string;
  fromName: string;
  projectName: string;
  toRole: "admin" | "client";
}) {
  const subject =
    input.toRole === "admin"
      ? `${input.fromName} replied — ${input.projectName}`
      : `New message from Kyle — ${input.projectName}`;

  return send({
    to: input.to,
    subject,
    // No message body: the thread is the record, and an inbox copy of it can
    // drift or reach the wrong person.
    lines: [
      `${input.fromName} left a message on ${input.projectName}.`,
      "",
      "It's in the project thread.",
    ],
    cta: "Read it here:",
  });
}

/** A file landed on a project. */
export function notifyNewFile(input: {
  to: string;
  fromName: string;
  filename: string;
  projectName: string;
  toRole: "admin" | "client";
}) {
  const subject =
    input.toRole === "admin"
      ? `${input.fromName} uploaded a file — ${input.projectName}`
      : `Kyle shared a file — ${input.projectName}`;

  return send({
    to: input.to,
    subject,
    lines: [
      `${input.fromName} added ${input.filename} to ${input.projectName}.`,
    ],
    cta: "Download it here:",
  });
}

/**
 * The ten-hour check-in.
 *
 * This is the one notification that is a promise rather than an FYI: the
 * client is told work has stopped and needs their word to continue. That is
 * the whole point of the cap, so it says so plainly.
 */
export function notifyTimeCheckin(input: {
  to: string;
  projectName: string;
  hoursMark: number;
  totalHours: number;
}) {
  return send({
    to: input.to,
    subject: `${input.hoursMark}-hour check-in — ${input.projectName}`,
    lines: [
      `We're at the ${input.hoursMark}-hour mark on ${input.projectName}.`,
      "",
      `Logged so far: ${input.totalHours.toFixed(1)} hours. Every entry is in`,
      "the portal timesheet with what it went on and what wasn't billed.",
      "",
      "I stop here until you've seen the number. Nothing more gets billed",
      "until you say continue.",
    ],
    cta: "See the timesheet:",
  });
}

export { adminAddress };
