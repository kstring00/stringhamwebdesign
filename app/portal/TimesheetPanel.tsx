"use client";

import { useMemo } from "react";

import styles from "./portal.module.css";

export type TimeEntry = {
  id: string;
  project_id: string;
  date: string;
  phase: string;
  description: string;
  hours: number;
};

export type TimeCheckin = {
  id: string;
  project_id: string;
  hours_mark: number;
  sent_at: string;
};

type Props = {
  projectId: string;
  entries: TimeEntry[];
  checkins: TimeCheckin[];
};

const CHECKIN_INTERVAL = 10;

function monthKey(date: string) {
  return date.slice(0, 7);
}

function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  );
}

function dayLabel(date: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    new Date(`${date}T12:00:00`),
  );
}

export default function TimesheetPanel({ projectId, entries, checkins }: Props) {
  const scoped = useMemo(
    () =>
      entries
        .filter((entry) => entry.project_id === projectId)
        .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    [entries, projectId],
  );

  const total = scoped.reduce((sum, entry) => sum + Number(entry.hours), 0);

  // Oldest first, so the running total reflects the order the work happened
  // in — that is what decides which entry crosses a 10-hour mark.
  const runningByEntry = useMemo(() => {
    const map = new Map<string, number>();
    let running = 0;
    for (const entry of [...scoped].reverse()) {
      running += Number(entry.hours);
      map.set(entry.id, running);
    }
    return map;
  }, [scoped]);

  const months = useMemo(() => {
    const grouped = new Map<string, TimeEntry[]>();
    for (const entry of scoped) {
      const key = monthKey(entry.date);
      grouped.set(key, [...(grouped.get(key) ?? []), entry]);
    }
    return [...grouped.entries()].map(([key, rows]) => ({
      key,
      rows,
      hours: rows.reduce((sum, row) => sum + Number(row.hours), 0),
    }));
  }, [scoped]);

  const sentMarks = useMemo(
    () =>
      new Set(
        checkins
          .filter((checkin) => checkin.project_id === projectId)
          .map((checkin) => Number(checkin.hours_mark)),
      ),
    [checkins, projectId],
  );

  const nextMark = (Math.floor(total / CHECKIN_INTERVAL) + 1) * CHECKIN_INTERVAL;
  const towardNext = total % CHECKIN_INTERVAL;
  const percent = Math.round((towardNext / CHECKIN_INTERVAL) * 100);

  return (
    <section className={styles.timesheetPanel} aria-labelledby="timesheet-title">
      <div className={styles.panelHeading}>
        <div>
          <p className={styles.eyebrow}>Hours</p>
          <h2 id="timesheet-title">Timesheet</h2>
        </div>
        <span>{total.toFixed(1)} total</span>
      </div>

      {/* The ten-hour rule, from the client's side: how close the next cap is. */}
      <div className={styles.checkinMeter}>
        <div className={styles.checkinCopy}>
          <strong>
            {towardNext.toFixed(1)} of {CHECKIN_INTERVAL} hours since the last
            check-in
          </strong>
          <small>
            Kyle stops every {CHECKIN_INTERVAL} hours and checks in before going
            further — the next one lands at {nextMark} hours total. No work past
            that without your say-so.
          </small>
        </div>
        <div
          className={styles.checkinBar}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={CHECKIN_INTERVAL}
          aria-valuenow={Number(towardNext.toFixed(1))}
          aria-valuetext={`${towardNext.toFixed(1)} of ${CHECKIN_INTERVAL} hours toward the next check-in`}
        >
          <i style={{ width: `${percent}%` }} />
        </div>
      </div>

      {months.length ? (
        <div className={styles.timesheetMonths}>
          {months.map((month) => (
            <div className={styles.timesheetMonth} key={month.key}>
              <div className={styles.timesheetMonthHead}>
                <h3>{monthLabel(month.key)}</h3>
                <strong>{month.hours.toFixed(1)} hrs</strong>
              </div>

              <ul className={styles.timesheetRows}>
                {month.rows.map((entry) => {
                  const running = runningByEntry.get(entry.id) ?? 0;
                  // A mark is "crossed here" when the running total reaches it
                  // on this entry and did not already include it beforehand.
                  const crossed =
                    Math.floor(running / CHECKIN_INTERVAL) >
                    Math.floor((running - Number(entry.hours)) / CHECKIN_INTERVAL)
                      ? Math.floor(running / CHECKIN_INTERVAL) * CHECKIN_INTERVAL
                      : null;

                  return (
                    <li key={entry.id}>
                      <div className={styles.timesheetRow}>
                        <time dateTime={entry.date}>{dayLabel(entry.date)}</time>
                        <div>
                          <strong>{entry.phase}</strong>
                          <small>{entry.description}</small>
                        </div>
                        <b>{Number(entry.hours).toFixed(1)}</b>
                      </div>

                      {crossed ? (
                        <p className={styles.checkinMark}>
                          <span aria-hidden="true">—</span>
                          {crossed}-hour check-in
                          {sentMarks.has(crossed) ? " sent" : " reached"}
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.activityEmpty}>
          No hours logged on this project yet. Every hour Kyle bills shows up here
          with what it went on.
        </p>
      )}
    </section>
  );
}
