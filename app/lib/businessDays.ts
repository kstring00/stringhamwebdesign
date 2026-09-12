/**
 * Reply-by dates for the quote confirmation.
 *
 * The confirmation page promises a real date ("I'll reply by Tuesday,
 * September 8"), so this has to run on the server: a client clock that is
 * wrong, or simply in another timezone, would render a different promise than
 * the one the email makes.
 *
 * All arithmetic happens on civil dates (plain year/month/day) held in UTC
 * Date objects. Nothing is ever converted back to a local timestamp, so there
 * is no DST edge to get wrong — 1 March in Houston is 1 March whatever the
 * offset happens to be that week.
 */

/**
 * The business runs on Central time — League City, TX. One constant, one place
 * to change it.
 *
 * This decides a date the site promises a client in writing, so it is not a
 * display preference. Changing it moves the boundary in real terms: the same
 * submission instant can land on a different business day, which is why
 * `businessDays.check.ts` pins the cutoff to explicit UTC instants rather than
 * to a wall-clock hour.
 */
export const BUSINESS_TIME_ZONE = "America/Chicago";

/**
 * Submissions at or after this hour (Central) are treated as arriving the
 * next business day. Evening and weekend submissions therefore get an honest
 * date rather than one that assumes work happens at 11pm.
 *
 * Confirmed 2026-09-12. Like the timezone above, this is a promise and not a
 * preference: moving it moves which business day a real submission lands on.
 */
export const BUSINESS_DAY_END_HOUR = 17;

export type CivilDate = { year: number; month: number; day: number };

/** Reads the wall-clock date and hour at a given instant in a timezone. */
export function zonedParts(instant: Date, timeZone = BUSINESS_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(instant);

  const read = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");

  // Midnight formats as hour 24 in some ICU versions; normalise it to 0.
  const hour = read("hour") % 24;

  return { year: read("year"), month: read("month"), day: read("day"), hour };
}

function toUTC(date: CivilDate) {
  return new Date(Date.UTC(date.year, date.month - 1, date.day));
}

function fromUTC(value: Date): CivilDate {
  return {
    year: value.getUTCFullYear(),
    month: value.getUTCMonth() + 1,
    day: value.getUTCDate(),
  };
}

export function addDays(date: CivilDate, days: number): CivilDate {
  const shifted = toUTC(date);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return fromUTC(shifted);
}

export function isoDate(date: CivilDate) {
  const mm = String(date.month).padStart(2, "0");
  const dd = String(date.day).padStart(2, "0");
  return `${date.year}-${mm}-${dd}`;
}

/** 0 = Sunday. */
function weekday(date: CivilDate) {
  return toUTC(date).getUTCDay();
}

function isWeekend(date: CivilDate) {
  const day = weekday(date);
  return day === 0 || day === 6;
}

/** The nth given weekday of a month, e.g. the 3rd Monday in January. */
function nthWeekdayOfMonth(
  year: number,
  month: number,
  targetWeekday: number,
  n: number,
): CivilDate {
  const first: CivilDate = { year, month, day: 1 };
  const offset = (targetWeekday - weekday(first) + 7) % 7;
  return { year, month, day: 1 + offset + (n - 1) * 7 };
}

/** The last given weekday of a month, e.g. the last Monday in May. */
function lastWeekdayOfMonth(
  year: number,
  month: number,
  targetWeekday: number,
): CivilDate {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const last: CivilDate = { year, month, day: lastDay };
  const back = (weekday(last) - targetWeekday + 7) % 7;
  return { year, month, day: lastDay - back };
}

/**
 * Federal offices observe a fixed-date holiday on the nearest weekday: a
 * Saturday holiday moves back to Friday, a Sunday holiday forward to Monday.
 * Holidays already pinned to a Monday or Thursday never move.
 */
function observed(date: CivilDate): CivilDate {
  const day = weekday(date);
  if (day === 6) return addDays(date, -1);
  if (day === 0) return addDays(date, 1);
  return date;
}

/** The eleven US federal holidays, as observed, for a calendar year. */
export function federalHolidays(year: number): Set<string> {
  const dates: CivilDate[] = [
    observed({ year, month: 1, day: 1 }), // New Year's Day
    nthWeekdayOfMonth(year, 1, 1, 3), // Martin Luther King, Jr. Day
    nthWeekdayOfMonth(year, 2, 1, 3), // Washington's Birthday
    lastWeekdayOfMonth(year, 5, 1), // Memorial Day
    observed({ year, month: 6, day: 19 }), // Juneteenth
    observed({ year, month: 7, day: 4 }), // Independence Day
    nthWeekdayOfMonth(year, 9, 1, 1), // Labor Day
    nthWeekdayOfMonth(year, 10, 1, 2), // Columbus Day
    observed({ year, month: 11, day: 11 }), // Veterans Day
    nthWeekdayOfMonth(year, 11, 4, 4), // Thanksgiving
    observed({ year, month: 12, day: 25 }), // Christmas Day
  ];

  // A 1 January holiday can be observed on 31 December of the prior year, so
  // include next year's New Year observance when it lands in this one.
  const nextNewYear = observed({ year: year + 1, month: 1, day: 1 });
  if (nextNewYear.year === year) dates.push(nextNewYear);

  return new Set(dates.map(isoDate));
}

export function isBusinessDay(date: CivilDate) {
  if (isWeekend(date)) return false;
  return !federalHolidays(date.year).has(isoDate(date));
}

export function nextBusinessDay(date: CivilDate): CivilDate {
  let cursor = addDays(date, 1);
  // A long weekend plus a holiday cannot span more than a handful of days.
  for (let guard = 0; guard < 14; guard += 1) {
    if (isBusinessDay(cursor)) return cursor;
    cursor = addDays(cursor, 1);
  }
  return cursor;
}

export function formatLongDate(date: CivilDate) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(toUTC(date));
}

export type ReplyWindow = {
  /** The business day the brief is treated as having landed on. */
  receivedOn: CivilDate;
  /** The day the reply is promised by. */
  replyBy: CivilDate;
  /** "Tuesday, September 8" */
  replyByLabel: string;
  /** "2026-09-08", for <time dateTime> and for the email. */
  replyByIso: string;
};

/**
 * One business day, honestly counted.
 *
 * A brief that arrives in the evening, at a weekend or on a federal holiday
 * has not landed on a working day yet, so the clock starts on the next one and
 * the reply is promised for the business day after that.
 */
export function replyWindowFor(submittedAt: Date): ReplyWindow {
  const { year, month, day, hour } = zonedParts(submittedAt);
  const submittedOn: CivilDate = { year, month, day };

  const landedDuringBusiness =
    isBusinessDay(submittedOn) && hour < BUSINESS_DAY_END_HOUR;

  const receivedOn = landedDuringBusiness
    ? submittedOn
    : nextBusinessDay(submittedOn);

  const replyBy = nextBusinessDay(receivedOn);

  return {
    receivedOn,
    replyBy,
    replyByLabel: formatLongDate(replyBy),
    replyByIso: isoDate(replyBy),
  };
}
