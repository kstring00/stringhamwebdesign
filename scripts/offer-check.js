// Unit tests for the offer: Website Care's three levels (app/data/offer.ts)
// and the places that must agree with them. The card, the FAQ, the Handoff
// page and the quote route read the numbers from offer.ts; the Service
// Terms are a written document, so this is what fails when the two drift.
// Compiles offer.ts and ownership.ts with the project's TypeScript into a
// temp folder, then runs node's own test runner. No server, no packages:
//   node scripts/offer-check.js
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = path.join(__dirname, "..");
const out = fs.mkdtempSync(path.join(os.tmpdir(), "offer-check-"));
const files = ["app/data/offer.ts", "app/data/ownership.ts", "app/checkup/data.ts", "app/data/nav.ts", "app/data/template.ts"].map((f) => path.join(root, f));
fs.writeFileSync(path.join(out, "tsconfig.json"), JSON.stringify({
  extends: path.join(root, "tsconfig.json"),
  compilerOptions: { outDir: out, rootDir: path.join(root, "app"), module: "nodenext", moduleResolution: "nodenext", noEmit: false, incremental: false, declaration: false, strict: false, skipLibCheck: true, plugins: [] },
  files,
  include: [],
}));
execFileSync(process.execPath, [path.join(root, "node_modules", "typescript", "bin", "tsc"), "-p", path.join(out, "tsconfig.json")], { cwd: root, stdio: "inherit" });
const offer = require(path.join(out, "data", "offer.js"));
const { ownership } = require(path.join(out, "data", "ownership.js"));
const checkup = require(path.join(out, "checkup", "data.js"));
const nav = require(path.join(out, "data", "nav.js"));
const { template } = require(path.join(out, "data", "template.js"));

const terms = fs.readFileSync(path.join(root, "content", "service-terms.md"), "utf8");
const careSection = terms.slice(terms.indexOf("## 3. Website Care"), terms.indexOf("## 4."));
const flat = (v) => JSON.stringify(v);

test("Website Care has three levels, each dearer and with more edit time than the last", () => {
  const L = offer.CARE_LEVELS;
  assert.deepEqual(L.map((l) => l.key), ["basic", "standard", "full"]);
  assert.deepEqual(L.map((l) => l.name), ["Basic", "Standard", "Full"]);
  assert.deepEqual(L.map((l) => l.price), [25, 50, 85]);
  assert.deepEqual(L.map((l) => l.editMinutes), [15, 45, 90]);
  assert.equal(offer.CARE_DEFAULT, "standard", "the slider starts on Standard");
  assert.equal(offer.CARE_FROM, "from $25 a month");
});

test("a level is looked up by its key and nothing else", () => {
  assert.equal(offer.careLevel("full").price, 85);
  assert.equal(offer.careLevel("Full"), undefined, "keys are lower case; the route lower-cases what it is sent");
  assert.equal(offer.careLevel("premium"), undefined);
  assert.equal(offer.careLevel(""), undefined);
});

test("the card: each level's own lines, and what it stands on", () => {
  const [basic, standard, full] = offer.careCard;
  assert.equal(basic.below, "");
  assert.deepEqual(basic.lines, ["My time keeping your site fast, secure and online", "A heads-up before your domain renews", "Edits: up to 15 minutes a month"]);
  assert.equal(standard.below, "Everything in Basic");
  assert.deepEqual(standard.lines, ["Edits: up to 45 minutes a month", "Google: listing kept right, new reviews flagged to you"]);
  assert.equal(full.below, "Everything in Standard");
  assert.deepEqual(full.lines, ["Edits: up to 90 minutes a month", "Report: one page each month of calls and requests"]);
});

test("the rules that hold at every level are on the card", () => {
  const rules = offer.careRules.join(" ");
  for (const needle of ["Optional and month to month", "not your domain, hosting or tool bills", "New pages and new sections are quoted separately", "doesn't carry over", "effective the next billing month", "never reply to reviews"]) {
    assert.ok(rules.includes(needle), `card rules say: ${needle}`);
  }
});

test("the Service Terms define the same three levels", () => {
  assert.match(careSection, /^## 3\. Website Care \(from \$25\/month\)/, "the heading says from $25");
  for (const l of offer.CARE_LEVELS) {
    assert.ok(careSection.includes(`**${l.name}, $${l.price} a month:**`), `terms name ${l.name} at $${l.price}`);
    assert.ok(new RegExp(`up to ${l.editMinutes} minutes of content edits a month`).test(careSection), `terms give ${l.name} ${l.editMinutes} minutes`);
  }
  assert.ok(!/30 minutes/.test(careSection), "the old single plan's 30 minutes is gone");
  assert.ok(!/\(\$25\/month\)/.test(terms), "no heading still prices Website Care at a flat $25");
});

test("the Service Terms carry the same rules as the card", () => {
  for (const [what, re] of [
    ["optional", /Website Care is optional/],
    ["pays for time, not bills", /pays for our time[\s\S]*does not cover your domain, your hosting or any tool/],
    ["new pages and sections quoted separately", /New pages and new sections are quoted separately/],
    ["no carry-over", /Unused edit time does not carry over/],
    ["change or cancel, next billing month", /change level or cancel anytime by email\. The change takes effect from your next billing month/],
    ["never reply to reviews", /never reply to reviews on a practice's behalf/],
  ]) assert.match(careSection, re, `terms: ${what}`);
});

test("the listing upkeep and the report sit at the levels the card gives them", () => {
  assert.match(careSection, /\*\*Standard[^\n]*Google listing[^\n]*flagging new Google reviews/);
  assert.match(careSection, /\*\*Full[^\n]*one-page report each month/);
  assert.ok(!/\*\*Basic[^\n]*(Google listing|report)/.test(careSection), "Basic has neither");
});

test("nothing in the offer or on the Handoff page still describes one $25 plan", () => {
  const all = flat([offer.plans, offer.faq, offer.listingSteps, offer.listingQuestions, offer.pricing, ownership]);
  assert.ok(!/30 minutes/.test(all), "no 30 minutes anywhere");
  assert.ok(!/for \$25 a month/.test(all), 'no "for $25 a month"');
  assert.ok(ownership.care.includes(offer.CARE_FROM), "the Handoff page's closing line says from $25 a month");
  for (const l of offer.CARE_LEVELS) assert.ok(ownership.careNote.includes(`${l.name} ($${l.price})`), `the Handoff page names ${l.name}`);
});

test("what is the practice's from day one is not listed as waiting on payment", () => {
  assert.deepEqual(ownership.yoursOncePaid, ["The design of your site", "The code I wrote for it"]);
  assert.ok(ownership.yoursFromDayOne.some((y) => /domain/i.test(y)) && ownership.yoursFromDayOne.some((y) => /accounts/i.test(y)) && ownership.yoursFromDayOne.some((y) => /words and photos/i.test(y)));
  assert.match(terms, /words and photos you supply are yours from the first day\. Once the website is paid in full, you also own its design and the code/);
});

test("a practice's contact form: the same advice on the Handoff page and in the checkup", () => {
  const form = checkup.QUESTIONS.find((q) => q.z === "form");
  assert.ok(form.fix.includes("name, phone or email, and a best time to reach them, with a line asking visitors not to share health details"));
  assert.ok(!/message box|short message/.test(form.fix + form.help), "no open message box is recommended");
  assert.equal(form.w, 6, "wording only: the question's weight is unchanged");
  assert.equal(checkup.TOTAL, 84, "and so is the total");
  assert.ok(ownership.tools.includes("asks only for a name and how to reach the person, and tells visitors not to include health details."));
  assert.ok(ownership.tools.includes("Messages go to your inbox through an email service in your practice’s name. The site keeps no list of its own."));
});

test("the owner's manual doesn't promise a skill step 8 calls hard", () => {
  const manual = ownership.handoff[0].body;
  assert.ok(!/how to add a page/.test(manual));
  assert.ok(/what to do when you want a new page/.test(manual));
  const bigger = ownership.steps.find((s) => s.title === "Making a bigger change");
  assert.equal(bigger.ease, "Hard");
  assert.ok(bigger.body.includes("the edit time in your Website Care level"));
});

test("the nav: six items in order, each a route that exists, with Blog and FAQ in the footer", () => {
  assert.deepEqual(nav.navLinks.map((l) => l.label), ["Home", "Work", "Pricing", "Handoff", "Checkup", "About"]);
  assert.deepEqual(nav.navLinks.map((l) => l.href), ["/", "/work", "/#pricing", "/owner-handoff", "/checkup", "/#about"]);
  for (const l of nav.navLinks) {
    const route = l.href.split("#")[0];
    const file = route === "/" ? "app/page.tsx" : `app${route}/page.tsx`;
    assert.ok(fs.existsSync(path.join(root, file)), `${l.label} points at ${route}, which has no page`);
  }
  // Pricing and About are sections of the home page, not pages of their own.
  assert.deepEqual(nav.navLinks.filter((l) => l.section).map((l) => l.section), ["pricing", "about"]);
  const footer = nav.footerLinks.map((l) => l.label);
  assert.ok(footer.includes("Blog") && footer.includes("FAQ"), "Blog and FAQ moved to the footer");
  assert.ok(!nav.navLinks.some((l) => /blog|faq/i.test(l.label)));
  assert.equal(nav.cta.nav, "Get a free demo");
  assert.equal(nav.cta.href, "/#quote");
});

test("\"Why not a template?\": three points, fair to the platforms, no numbers it can't stand behind", () => {
  assert.equal(template.title, "Why not a template?");
  assert.deepEqual(template.points.map((p) => p.label), ["What they do well", "Where they stop", "What a custom build adds"]);
  const all = flat(template);
  // What they do well comes first, and names both.
  assert.match(template.points[0].body, /Squarespace and WordPress/);
  assert.match(template.points[0].title + template.points[0].body, /cheap/i);
  assert.match(template.points[0].title + template.points[0].body, /fast to start|in a weekend/i);
  // No speed or search-ranking claims, no percentages, no reviews.
  assert.doesNotMatch(all, /\d+\s*%|faster|slower|speed|seconds|rank|SEO|Google|PageSpeed|conversion/i);
  assert.doesNotMatch(all, /testimonial|clients say|rated|stars/i);
  // Nothing absolute said about either platform.
  assert.doesNotMatch(all, /can(?:'|’)?t|cannot|never|always|impossible|bad|worse|ugly|generic/i);
  // The custom route's own limit is stated, and it matches the offer.
  assert.match(template.footnote, /costs more/);
  assert.match(template.footnote, /about three weeks/);
  assert.ok(offer.steps.some((st) => /about 3 weeks/.test(st.title)), "the three-week figure is the offer's own");
});
