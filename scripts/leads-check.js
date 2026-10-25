// Unit tests for the lead ledger's pure logic: app/lib/leadStats.ts and the
// pure parts of app/lib/referrals.ts. Compiles those two files (and what
// they import) with the project's TypeScript into a temp folder, then runs
// node's own test runner against the output. No server, no packages:
//   node scripts/leads-check.js
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = path.join(__dirname, "..");
const out = fs.mkdtempSync(path.join(os.tmpdir(), "leads-check-"));
// A throwaway tsconfig on top of the project's: emit CommonJS for the two files (and what they import) into the temp folder.
const files = ["app/lib/leadStats.ts", "app/lib/referrals.ts"].map((f) => path.join(root, f));
fs.writeFileSync(path.join(out, "tsconfig.json"), JSON.stringify({
  extends: path.join(root, "tsconfig.json"),
  compilerOptions: { outDir: out, rootDir: path.join(root, "app"), module: "nodenext", moduleResolution: "nodenext", noEmit: false, incremental: false, declaration: false, strict: false, skipLibCheck: true, plugins: [], typeRoots: [path.join(root, "node_modules", "@types")], types: ["node"] },
  files,
  include: [],
}));
execFileSync(process.execPath, [path.join(root, "node_modules", "typescript", "bin", "tsc"), "-p", path.join(out, "tsconfig.json")], { cwd: root, stdio: "inherit" });
const stats = require(path.join(out, "lib", "leadStats.js"));
const refs = require(path.join(out, "lib", "referrals.js"));

const NOW = new Date("2026-10-24T12:00:00Z");
let n = 0;
const lead = (o) => ({ id: `id-${++n}`, partner_code: null, kind: "quote", business: null, contact_name: null, contact: null, website: null, checkup: null, utm_source: null, utm_medium: null, utm_campaign: null, referrer_host: null, landing_page: null, heard: null, detail: null, status: "new", build_price: null, notes: null, signed_at: null, created_at: "2026-10-10T10:00:00Z", updated_at: "2026-10-10T10:00:00Z", ...o });

test("referral money: only a referred lead owes a partner", () => {
  assert.equal(refs.owed(lead({ status: "paid", build_price: 2000 })), 0, "$2,000 direct paid lead → $0");
  assert.equal(refs.owed(lead({ status: "paid", build_price: 2000, partner_code: "maria" })), 400, "$2,000 referred paid lead → $400");
  assert.equal(refs.owed(lead({ status: "partner_paid", build_price: 2000, partner_code: "maria" })), 400);
  assert.equal(refs.owed(lead({ status: "hired", build_price: 2000, partner_code: "maria" })), 0, "not until the client has paid");
  assert.equal(refs.owed(lead({ status: "paid", build_price: null, partner_code: "maria" })), 0, "no build price, nothing to compute");
});

test("month cohorts, the calendar signed count, and a month crossover", () => {
  const leads = [
    lead({ created_at: "2026-09-12T15:00:00Z", status: "hired", signed_at: "2026-10-03T09:00:00Z" }), // asked in Sep, signed in Oct
    lead({ created_at: "2026-09-20T15:00:00Z", status: "lost" }),
    lead({ created_at: "2026-10-02T15:00:00Z", status: "quoted" }),
    lead({ created_at: "2026-10-05T15:00:00Z", kind: "call", status: "consulted" }),
    lead({ created_at: "2026-10-06T15:00:00Z", kind: "partner", status: "new" }), // not a customer
    lead({ created_at: "2026-10-07T15:00:00Z", status: "spam" }),
  ];
  const [oct, sep] = stats.monthRows(leads, [], NOW, 2);
  assert.equal(sep.month, "2026-09");
  assert.deepEqual([sep.inquiries, sep.lost, sep.signed, sep.signedThisMonth], [2, 1, 1, 0], "Sep: 2 asked, 1 lost (still counted), 1 signed from the cohort, 0 signed on the calendar");
  assert.equal(stats.rates(sep).sign, 50, "Sep inquiry → signed is 1 of 2: the lost one stays in the denominator");
  assert.deepEqual([oct.inquiries, oct.consulted, oct.quoted, oct.signed, oct.signedThisMonth, oct.partnerInquiries, oct.spam], [2, 2, 1, 0, 1, 1, 1], "Oct: 2 inquiries (quote + call), both at consult stage or past (stages are cumulative), 1 quoted, 0 signed from the cohort, 1 signed on the calendar (Sep's lead), 1 partner inquiry aside, 1 spam out");
  assert.equal(stats.kindSummary(oct.byKind), "1 quote request, 1 call");
});

test("source evidence: partner > campaign > referrer > self-reported > unknown", () => {
  const r = (o) => stats.sourceRead(lead(o));
  assert.deepEqual([r({ partner_code: "maria", utm_source: "card" }).evidence, r({ partner_code: "maria" }).label], ["partner", "Partner link (maria)"]);
  assert.deepEqual([r({ utm_source: "card", referrer_host: "google.com" }).label, r({ utm_source: "gbp", utm_medium: "profile" }).label], ["Business card", "gbp / profile"]);
  assert.deepEqual([r({ referrer_host: "google.com" }).label, r({ referrer_host: "l.instagram.com" }).label, r({ referrer_host: "chamber.example" }).label], ["Search", "Social", "chamber.example"]);
  assert.deepEqual([r({ heard: "my neighbor told me" }).evidence, r({ heard: "my neighbor told me" }).label], ["self-reported", "Said: a person recommended me"]);
  const u = r({});
  assert.equal(u.evidence, "unknown");
  assert.match(stats.EVIDENCE_NOTE.unknown, /Not proof of a direct visit/);
  assert.equal(r({ kind: "call", heard: "google" }).label, "Said: google / search", "a logged call only has what they said");
});

test("'how they heard' becomes a bucket, never free text", () => {
  assert.equal(stats.heardBucket("Saw you on Google"), "google");
  assert.equal(stats.heardBucket("card"), "card");
  assert.equal(stats.heardBucket("A client of yours, Zelda, recommended you"), "friend");
  assert.equal(stats.heardBucket("billboard"), "other");
  assert.equal(stats.heardBucket(null), null);
});

test("the AI aggregate carries counts only: no names, contacts, notes, codes or hosts", () => {
  const secrets = ["Zelda Quartermain", "zelda@example.org", "281-555-0199", "Quartermain Marina", "zelda-q", "quartermainmarina.com", "secret note", "checkup text", "my friend Zelda"];
  const leads = [
    lead({ partner_code: "zelda-q", contact_name: "Zelda Quartermain", contact: "zelda@example.org", business: "Quartermain Marina", notes: "secret note", checkup: "checkup text", status: "hired", signed_at: "2026-10-12T00:00:00Z", build_price: 2500 }),
    lead({ contact: "281-555-0199", referrer_host: "quartermainmarina.com", heard: "my friend Zelda", landing_page: "/checkup" }),
    lead({ referrer_host: "google.com", status: "lost" }),
    lead({ kind: "partner", contact: "agency@example.org" }),
  ];
  const agg = stats.aiAggregate(leads, [{ month: "2026-10-01", impressions: 1200, clicks: 35, note: "web design league city", updated_at: "" }], NOW);
  const json = JSON.stringify(agg);
  for (const s of secrets) assert.ok(!json.includes(s), `must not contain "${s}"`);
  assert.ok(!json.includes("web design league city"), "the search note is free text; not sent");
  assert.deepEqual(agg.totals, { inquiries: 3, signed: 1, target_per_month: 1 });
  assert.deepEqual(agg.sources.map((s) => [s.source, s.evidence, s.inquiries]), [["Another website", "referrer", 1], ["Partner link", "partner", 1], ["Search", "referrer", 1]]);
  assert.deepEqual(agg.how_they_heard, { "A person recommended me": 1 });
  assert.deepEqual(agg.landing_pages, { "Website Checkup": 1, "Not recorded": 2 }, "landing pages as categories only");
  assert.equal(agg.months[0].search_impressions, 1200);
  assert.equal(agg.months[0].partner_inquiries, 1);
  assert.equal(agg.unknown_source_share, 0);
});

test("the AI aggregate never carries campaign text or paths from a link, even when they hold personal information", () => {
  const nasty = ["john-smith-281-555-0100", "jane.doeexample.com", "ssn-123-45-6789", "/john-smith-divorce-case", "/clients/acme-dental", "call Zelda at 281-555-0199"];
  const leads = [
    lead({ utm_source: "john-smith-281-555-0100", utm_medium: "jane.doeexample.com", utm_campaign: "ssn-123-45-6789", landing_page: "/john-smith-divorce-case", heard: "call Zelda at 281-555-0199" }),
    lead({ utm_source: "CARD", landing_page: "/clients/acme-dental", status: "quoted" }),
    lead({ utm_source: "gbp", utm_medium: "profile", landing_page: "/blog/how-to-buy-your-own-domain" }),
    lead({ landing_page: "/checkup" }),
    lead({ landing_page: null }),
  ];
  const agg = stats.aiAggregate(leads, [], NOW);
  const json = JSON.stringify(agg);
  for (const s of nasty) assert.ok(!json.includes(s), `must not contain "${s}"`);
  assert.deepEqual(agg.sources.map((s) => [s.source, s.inquiries]), [["Unknown", 2], ["Business card", 1], ["Google Business Profile link", 1], ["Other tagged link", 1]], "campaigns only as the known list, else 'Other tagged link'");
  assert.deepEqual(agg.landing_pages, { "Other page": 2, "Blog": 1, "Website Checkup": 1, "Not recorded": 1 }, "landing pages only as page categories");
  // The admin keeps the detail: the raw (sanitized) tag and the path stay on the lead row and in the dashboard label.
  assert.equal(stats.sourceRead(leads[0]).label, "john-smith-281-555-0100 / jane.doeexample.com");
  assert.equal(stats.sourceRead(leads[0]).group, "Other tagged link");
  assert.equal(stats.sourceRead(leads[2]).label, "gbp / profile");
  assert.equal(stats.pageCategory("/partners/join"), "Partners");
  assert.equal(stats.pageCategory("/anything-else"), "Other page");
  // Every string in the aggregate is one the code wrote, never one a visitor could type.
  const strings = new Set();
  JSON.stringify(agg, (k, v) => { if (typeof v === "string") strings.add(v); if (typeof k === "string") strings.add(k); return v; });
  const allowed = new Set([...Object.values(stats.KNOWN_CAMPAIGNS), stats.OTHER_CAMPAIGN, "Partner link", "Search", "Social", "Another website", "Unknown", "Home", "Website Checkup", "Google check", "Work", "Partners", "Blog", "Terms or privacy", "Family Resource Hub", "Other page", "Not recorded", ...Object.values(refs.HEARD_LABEL), ...Object.values(refs.KIND_LABEL), ...Object.values(refs.HEARD_LABEL).map((l) => `Said: ${l.toLowerCase()}`), "partner", "campaign", "referrer", "self-reported", "unknown", agg.as_of, ...agg.definitions, ...agg.months.map((m) => m.month)]);
  const keys = new Set(["as_of", "definitions", "months", "month", "inquiries", "consulted", "quoted", "signed_from_this_cohort", "lost", "spam", "partner_inquiries", "signed_this_calendar_month", "search_impressions", "search_clicks", "sources", "source", "evidence", "signed", "how_they_heard", "kinds", "landing_pages", "unknown_source_share", "totals", "target_per_month", ""]);
  const stray = [...strings].filter((s) => !allowed.has(s) && !keys.has(s) && !/^\d+$/.test(s));
  assert.deepEqual(stray, [], "no string in the aggregate comes from outside the code");
});

test("dedupe key: same person, same form, same day", () => {
  const d = new Date("2026-10-24T03:00:00Z");
  assert.equal(refs.dedupeKey("quote", "(281) 555-0100", d), refs.dedupeKey("quote", "281-555-0100", d), "phone formatting doesn't matter");
  assert.equal(refs.dedupeKey("quote", "Kyle@Example.com", d), refs.dedupeKey("quote", "kyle@example.com ", d), "email case doesn't matter");
  assert.notEqual(refs.dedupeKey("quote", "281-555-0100", d), refs.dedupeKey("checkup", "281-555-0100", d), "a different form is a different ask");
  assert.notEqual(refs.dedupeKey("quote", "281-555-0100", d), refs.dedupeKey("quote", "281-555-0100", new Date("2026-10-25T03:00:00Z")), "a new day is a new lead");
  assert.equal(refs.dedupeKey("quote", "", d), null, "no contact, no key");
});

test("source fields are sanitized: host only, path only, plain utm values", () => {
  assert.equal(refs.referrerHost("https://www.Google.com/search?q=web+design"), "google.com");
  assert.equal(refs.referrerHost("not a url"), null);
  assert.equal(refs.landingPath("/checkup?ref=maria#quiz"), "/checkup");
  assert.equal(refs.landingPath("https://evil.example/x"), null);
  assert.equal(refs.landingPath("//evil.example"), null);
  assert.equal(refs.utmValue('card<script>alert(1)</script>'), "cardscriptalert1script");
  assert.equal(refs.utmValue(""), null);
});

test.after(() => fs.rmSync(out, { recursive: true, force: true }));
