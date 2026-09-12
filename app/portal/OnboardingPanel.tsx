"use client";

import { useMemo, useRef, useState } from "react";

import styles from "./portal.module.css";

export type OnboardingItem = {
  id: string;
  project_id: string;
  name: string;
  item_type: "file" | "text" | "link" | "confirm";
  status: "pending" | "submitted" | "accepted" | "needs_changes" | "not_applicable";
  note: string | null;
  value: string | null;
  file_id: string | null;
  position: number;
  submitted_at: string | null;
  accepted_at: string | null;
  updated_at: string;
};

type Props = {
  items: OnboardingItem[];
  projectId: string;
  onChanged: () => void | Promise<void>;
  onError: (message: string) => void;
};

const STATUS_TEXT: Record<OnboardingItem["status"], string> = {
  pending: "Waiting on you",
  needs_changes: "Needs a change",
  submitted: "With Kyle for review",
  accepted: "Done",
  not_applicable: "Not needed",
};

const PROMPT: Record<OnboardingItem["item_type"], string> = {
  file: "Upload the file",
  text: "Type your answer",
  link: "Paste the link",
  confirm: "Confirm when this is sorted",
};

/** Items a client still has to act on, versus ones that are settled. */
function isOpen(item: OnboardingItem) {
  return item.status === "pending" || item.status === "needs_changes";
}

export default function OnboardingPanel({ items, projectId, onChanged, onError }: Props) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState("");
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const scoped = useMemo(
    () =>
      items
        .filter((item) => item.project_id === projectId)
        .sort((a, b) => a.position - b.position),
    [items, projectId],
  );

  const counted = scoped.filter((item) => item.status !== "not_applicable");
  const done = counted.filter((item) => item.status === "accepted").length;
  const percent = counted.length ? Math.round((done / counted.length) * 100) : 0;
  const yours = scoped.filter(isOpen);
  const withKyle = scoped.filter((item) => !isOpen(item));

  async function patch(itemId: string, payload: Record<string, unknown>) {
    setBusyId(itemId);
    try {
      const response = await fetch("/api/portal/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, ...payload }),
      });
      const result = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      if (!response.ok) {
        onError(result?.error || "That could not be saved.");
        return;
      }
      setDrafts((current) => {
        const next = { ...current };
        delete next[itemId];
        return next;
      });
      await onChanged();
    } catch {
      onError("That could not be saved. Check your connection and try again.");
    } finally {
      setBusyId("");
    }
  }

  async function submitFile(item: OnboardingItem, file: File) {
    setBusyId(item.id);
    try {
      // Upload through the existing files route first, then attach the id.
      // The database checks the file belongs to this project.
      const form = new FormData();
      form.append("projectId", projectId);
      form.append("kind", "asset");
      form.append("file", file);

      const upload = await fetch("/api/portal/files", { method: "POST", body: form });
      const uploaded = (await upload.json().catch(() => null)) as
        | { file?: { id: string }; error?: string }
        | null;

      if (!upload.ok || !uploaded?.file?.id) {
        onError(uploaded?.error || "That file could not be uploaded.");
        setBusyId("");
        return;
      }

      await patch(item.id, { fileId: uploaded.file.id, value: file.name, submit: true });
    } catch {
      onError("That file could not be uploaded.");
      setBusyId("");
    }
  }

  if (!scoped.length) {
    return (
      <section className={styles.onboardingPanel} aria-labelledby="onboarding-title">
        <div className={styles.panelHeading}>
          <div>
            <p className={styles.eyebrow}>Onboarding</p>
            <h2 id="onboarding-title">Nothing to gather yet</h2>
          </div>
        </div>
        <p className={styles.onboardingEmpty}>
          When your project starts I&apos;ll add the handful of things I need from
          you here — logo files, copy, access. Nothing to do right now.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.onboardingPanel} aria-labelledby="onboarding-title">
      <div className={styles.panelHeading}>
        <div>
          <p className={styles.eyebrow}>Onboarding</p>
          <h2 id="onboarding-title">What I need from you</h2>
        </div>
        <span>
          {done} / {counted.length}
        </span>
      </div>

      <div className={styles.onboardingProgress}>
        <div
          className={styles.onboardingBar}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-valuetext={`${done} of ${counted.length} complete`}
        >
          <i style={{ width: `${percent}%` }} />
        </div>
        <strong>{percent}%</strong>
      </div>

      {yours.length ? (
        <>
          <h3 className={styles.onboardingGroup}>
            Yours to do
            <span>{yours.length}</span>
          </h3>

          <ul className={styles.onboardingList}>
            {yours.map((item) => {
              const draft = drafts[item.id] ?? item.value ?? "";
              const busy = busyId === item.id;
              const inputId = `onboarding-${item.id}`;

              return (
                <li className={styles.onboardingItem} key={item.id}>
                  <div className={styles.onboardingItemHead}>
                    <strong>{item.name}</strong>
                    <span
                      className={`${styles.onboardingStatus} ${
                        item.status === "needs_changes" ? styles.onboardingStatusChange : ""
                      }`}
                    >
                      {STATUS_TEXT[item.status]}
                    </span>
                  </div>

                  {item.status === "needs_changes" && item.note ? (
                    <p className={styles.onboardingNote}>
                      <span>Kyle asked:</span> {item.note}
                    </p>
                  ) : null}

                  {item.item_type === "confirm" ? (
                    <div className={styles.onboardingActions}>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => patch(item.id, { value: "Confirmed", submit: true })}
                      >
                        {busy ? "Saving…" : "Confirm this is done"}
                      </button>
                    </div>
                  ) : item.item_type === "file" ? (
                    <div className={styles.onboardingActions}>
                      <input
                        className={styles.srOnlyInput}
                        id={inputId}
                        ref={(node) => {
                          fileInputs.current[item.id] = node;
                        }}
                        type="file"
                        disabled={busy}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) submitFile(item, file);
                          event.target.value = "";
                        }}
                      />
                      <label className={styles.onboardingUpload} htmlFor={inputId}>
                        {busy ? "Uploading…" : "Choose a file"}
                      </label>
                      {item.value ? <small>Last sent: {item.value}</small> : null}
                    </div>
                  ) : (
                    <div className={styles.onboardingField}>
                      <label htmlFor={inputId}>{PROMPT[item.item_type]}</label>
                      {item.item_type === "link" ? (
                        <input
                          id={inputId}
                          type="url"
                          value={draft}
                          placeholder="https://"
                          disabled={busy}
                          onChange={(event) =>
                            setDrafts((c) => ({ ...c, [item.id]: event.target.value }))
                          }
                        />
                      ) : (
                        <textarea
                          id={inputId}
                          rows={3}
                          value={draft}
                          disabled={busy}
                          onChange={(event) =>
                            setDrafts((c) => ({ ...c, [item.id]: event.target.value }))
                          }
                        />
                      )}
                      <div className={styles.onboardingActions}>
                        <button
                          type="button"
                          disabled={busy || !draft.trim()}
                          onClick={() => patch(item.id, { value: draft, submit: true })}
                        >
                          {busy ? "Saving…" : "Send to Kyle"}
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p className={styles.onboardingClear}>
          Nothing waiting on you right now.
        </p>
      )}

      {withKyle.length ? (
        <>
          <h3 className={styles.onboardingGroup}>
            With Kyle
            <span>{withKyle.length}</span>
          </h3>

          <ul className={`${styles.onboardingList} ${styles.onboardingListQuiet}`}>
            {withKyle.map((item) => (
              <li className={styles.onboardingItem} key={item.id}>
                <div className={styles.onboardingItemHead}>
                  <strong>{item.name}</strong>
                  <span
                    className={`${styles.onboardingStatus} ${
                      item.status === "accepted" ? styles.onboardingStatusDone : ""
                    }`}
                  >
                    {STATUS_TEXT[item.status]}
                  </span>
                </div>
                {item.status === "submitted" && item.value ? (
                  <p className={styles.onboardingSent}>You sent: {item.value}</p>
                ) : null}
                {/* Submitted work can still be pulled back and revised. */}
                {item.status === "submitted" ? (
                  <div className={styles.onboardingActions}>
                    <button
                      className={styles.onboardingUndo}
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => patch(item.id, { submit: false })}
                    >
                      {busyId === item.id ? "Working…" : "Change my answer"}
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
