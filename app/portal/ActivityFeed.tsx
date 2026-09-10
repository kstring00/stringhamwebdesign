"use client";

import { useMemo } from "react";

import styles from "./portal.module.css";

/**
 * Derived, not stored.
 *
 * Everything worth showing already has a timestamp on an existing table, so
 * this merges those rather than adding an activity table that could drift out
 * of step with the records it describes.
 */

type Sources = {
  projectId: string;
  messages: { id: string; project_id: string; created_at: string; sender: { name: string; role: string } }[];
  files: { id: string; project_id: string; filename: string; created_at: string; uploaded_by: string }[];
  timeEntries: { id: string; project_id: string; date: string; phase: string; hours: number }[];
  onboardingItems: {
    id: string;
    project_id: string;
    name: string;
    status: string;
    submitted_at: string | null;
    accepted_at: string | null;
    updated_at: string;
  }[];
  currentUserId: string;
  limit?: number;
};

type Entry = { id: string; at: number; label: string; detail: string; kind: string };

function whenText(at: number) {
  const diff = Date.now() - at;
  const day = 86_400_000;

  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < day) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;

  return new Date(at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** A date-only column is midday-anchored so a timezone cannot shift the day. */
function timeOf(value: string) {
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00`)
    : new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

export default function ActivityFeed({
  projectId,
  messages,
  files,
  timeEntries,
  onboardingItems,
  currentUserId,
  limit = 8,
}: Sources) {
  const entries = useMemo(() => {
    const out: Entry[] = [];
    const mine = (id: string) => id === currentUserId;

    for (const message of messages.filter((m) => m.project_id === projectId)) {
      out.push({
        id: `m-${message.id}`,
        at: timeOf(message.created_at),
        kind: "message",
        label: message.sender.role === "admin" ? "Kyle sent a message" : "You sent a message",
        detail: "",
      });
    }

    for (const file of files.filter((f) => f.project_id === projectId)) {
      out.push({
        id: `f-${file.id}`,
        at: timeOf(file.created_at),
        kind: "file",
        label: mine(file.uploaded_by) ? "You uploaded a file" : "Kyle shared a file",
        detail: file.filename,
      });
    }

    for (const entry of timeEntries.filter((t) => t.project_id === projectId)) {
      out.push({
        id: `t-${entry.id}`,
        at: timeOf(entry.date),
        kind: "time",
        label: `${entry.hours.toFixed(1)} hours logged`,
        detail: entry.phase,
      });
    }

    for (const item of onboardingItems.filter((i) => i.project_id === projectId)) {
      if (item.accepted_at) {
        out.push({
          id: `o-a-${item.id}`,
          at: timeOf(item.accepted_at),
          kind: "accepted",
          label: `${item.name} accepted`,
          detail: "",
        });
      } else if (item.submitted_at) {
        out.push({
          id: `o-s-${item.id}`,
          at: timeOf(item.submitted_at),
          kind: "submitted",
          label: `You sent ${item.name}`,
          detail: "",
        });
      } else if (item.status === "needs_changes") {
        out.push({
          id: `o-c-${item.id}`,
          at: timeOf(item.updated_at),
          kind: "changes",
          label: `${item.name} needs a change`,
          detail: "",
        });
      }
    }

    return out
      .filter((entry) => entry.at > 0)
      .sort((a, b) => b.at - a.at)
      .slice(0, limit);
  }, [projectId, messages, files, timeEntries, onboardingItems, currentUserId, limit]);

  return (
    <section className={styles.activityPanel} aria-labelledby="activity-title">
      <div className={styles.panelHeading}>
        <div>
          <p className={styles.eyebrow}>Recent</p>
          <h2 id="activity-title">Activity</h2>
        </div>
      </div>

      {entries.length ? (
        <ol className={styles.activityList}>
          {entries.map((entry) => (
            <li key={entry.id} data-kind={entry.kind}>
              <span className={styles.activityDot} aria-hidden="true" />
              <div>
                <strong>{entry.label}</strong>
                {entry.detail ? <small>{entry.detail}</small> : null}
              </div>
              <time dateTime={new Date(entry.at).toISOString()}>{whenText(entry.at)}</time>
            </li>
          ))}
        </ol>
      ) : (
        <p className={styles.activityEmpty}>
          Nothing has happened on this project yet. It will show up here as it does.
        </p>
      )}
    </section>
  );
}
