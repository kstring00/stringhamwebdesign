/**
 * Checks for the reply-window rules. No test runner is configured in this
 * project, so run it directly:
 *
 *   npx tsx app/lib/businessDays.check.ts
 *
 * Exits non-zero on the first failing expectation.
 */
import { federalHolidays, replyWindowFor, isBusinessDay } from "./businessDays";

let fails = 0;
const eq = (label: string, got: unknown, want: unknown) => {
  const ok = got === want;
  if (!ok) fails += 1;
  console.log(`${ok ? "ok  " : "FAIL"} ${label}: got ${got}${ok ? "" : `, want ${want}`}`);
};

// --- Holiday table, 2026 ---
const h26 = federalHolidays(2026);
[
  ["2026-01-01", "New Year's Day (Thu)"],
  ["2026-01-19", "MLK, 3rd Mon Jan"],
  ["2026-02-16", "Washington, 3rd Mon Feb"],
  ["2026-05-25", "Memorial, last Mon May"],
  ["2026-06-19", "Juneteenth (Fri)"],
  ["2026-07-03", "Independence: Jul 4 is Sat -> observed Fri"],
  ["2026-09-07", "Labor, 1st Mon Sep"],
  ["2026-10-12", "Columbus, 2nd Mon Oct"],
  ["2026-11-11", "Veterans (Wed)"],
  ["2026-11-26", "Thanksgiving, 4th Thu Nov"],
  ["2026-12-25", "Christmas (Fri)"],
].forEach(([d, label]) => eq(label, h26.has(d), true));

// Jan 1 2027 is a Friday, so it is NOT pulled back into 2026.
eq("2026 set excludes 2026-12-31", h26.has("2026-12-31"), false);

// --- Observance edge cases ---
eq("2021-07-05 observed (Jul 4 Sun)", federalHolidays(2021).has("2021-07-05"), true);
eq("2021-12-31 observed (Jan 1 2022 Sat)", federalHolidays(2021).has("2021-12-31"), true);
eq("2022-12-26 observed (Dec 25 Sun)", federalHolidays(2022).has("2022-12-26"), true);
eq("2027-01-01 is a Friday, not moved", federalHolidays(2027).has("2027-01-01"), true);

// --- Business days ---
eq("Sat 2026-09-05 not business", isBusinessDay({ year: 2026, month: 9, day: 5 }), false);
eq("Labor Day 2026-09-07 not business", isBusinessDay({ year: 2026, month: 9, day: 7 }), false);
eq("Tue 2026-09-08 is business", isBusinessDay({ year: 2026, month: 9, day: 8 }), true);

// --- Reply window (Eastern) ---
const w = (iso: string) => replyWindowFor(new Date(iso));

// Fri 2026-09-04, 10:00 ET -> received Fri, next business day skips the
// weekend AND Labor Day -> Tue 8 Sep.
eq("Fri 10am ET", w("2026-09-04T14:00:00Z").replyByLabel, "Tuesday, September 8");

// Fri 2026-09-04, 21:00 ET (after cutoff) -> received Tue 8th -> reply Wed 9th.
eq("Fri 9pm ET", w("2026-09-05T01:00:00Z").replyByLabel, "Wednesday, September 9");

// Sat 2026-09-05 midday -> received Tue 8th -> reply Wed 9th.
eq("Saturday", w("2026-09-05T16:00:00Z").replyByLabel, "Wednesday, September 9");

// Mon 2026-09-07 is Labor Day -> received Tue 8th -> reply Wed 9th.
eq("Labor Day", w("2026-09-07T15:00:00Z").replyByLabel, "Wednesday, September 9");

// Mon 2026-09-14 09:00 ET -> reply Tue 15th.
eq("ordinary Monday", w("2026-09-14T13:00:00Z").replyByLabel, "Tuesday, September 15");

// Thanksgiving week: Wed 2026-11-25 10am -> Thu is Thanksgiving -> reply Fri 27.
eq("day before Thanksgiving", w("2026-11-25T15:00:00Z").replyByLabel, "Friday, November 27");

// Christmas 2026 is Fri 25 Dec. Thu 24th 10am -> reply Mon 28.
eq("Christmas Eve", w("2026-12-24T15:00:00Z").replyByLabel, "Monday, December 28");

// Timezone honesty: 2026-09-08T02:00:00Z is still Mon 7 Sep 10pm ET (Labor Day).
eq("UTC date != ET date", w("2026-09-08T02:00:00Z").replyByLabel, "Wednesday, September 9");

// Cutoff boundary: 16:59 ET counts as same day, 17:00 does not.
eq("16:59 ET Mon 14th", w("2026-09-14T20:59:00Z").replyByLabel, "Tuesday, September 15");
eq("17:00 ET Mon 14th", w("2026-09-14T21:00:00Z").replyByLabel, "Wednesday, September 16");

// Year boundary: Thu 2026-12-31 10am. Jan 1 2027 is Fri (holiday) -> Mon 4 Jan.
eq("New Year rollover", w("2026-12-31T15:00:00Z").replyByLabel, "Monday, January 4");

console.log(fails ? `\n${fails} FAILURE(S)` : "\nall checks passed");
process.exit(fails ? 1 : 0);
