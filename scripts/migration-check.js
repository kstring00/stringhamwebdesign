// Runs supabase/migrations/20261024000000_leads.sql against a real Postgres
// (PGlite, in-process) four ways, as the rollout needs:
//   1. a clean database: tables created, a lead without a partner saves;
//   2. an existing database from the two older migrations, with a partner and
//      referred leads at every old status and with build prices: after the
//      migration every row, status and price is unchanged, the new columns,
//      kinds and statuses work, and the dedupe index refuses a repeat;
//   3. run a second time: no error, nothing changes;
//   4. the old code's insert shape (partner code, old kind, none of the new
//      columns) still works afterwards, so the old build keeps running and
//      a rollback needs no SQL.
// Install once: npm install --no-save @electric-sql/pglite
//   node scripts/migration-check.js
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { PGlite } = require("@electric-sql/pglite");

const dir = path.join(__dirname, "..", "supabase", "migrations");
const sql = (f) => fs.readFileSync(path.join(dir, f), "utf8");
const OLD = ["20261014000000_referrals.sql", "20261015000000_referral_leads_utm_source.sql"];
const NEW = "20261024000000_leads.sql";
let checks = 0;
const ok = (label) => { checks++; console.log(`ok   ${label}`); };

async function fresh() {
  const db = new PGlite();
  return db;
}
const count = async (db, t) => Number((await db.query(`select count(*)::int as n from ${t}`)).rows[0].n);
const nullable = async (db, col) => (await db.query(`select is_nullable from information_schema.columns where table_name='referral_leads' and column_name=$1`, [col])).rows[0]?.is_nullable === "YES";
const rejects = async (db, q, params, re) => { try { await db.query(q, params); } catch (e) { assert.match(String(e.message), re); return; } assert.fail(`expected to be rejected: ${q}`); };

(async () => {
  // 1. Clean database.
  {
    const db = await fresh();
    await db.exec(sql(NEW));
    for (const t of ["partners", "referral_leads", "search_months"]) assert.equal(await count(db, t), 0);
    await db.query("insert into referral_leads (kind, business, contact, utm_source, referrer_host, landing_page, heard, detail, dedupe_key) values ('google_check','Test Co','2815550100','card','google.com','/google-check','a friend','Kemah','k1')");
    assert.equal(await count(db, "referral_leads"), 1);
    await db.query("insert into search_months (month, impressions, clicks) values ('2026-10-01', 1200, 35)");
    await rejects(db, "insert into search_months (month, impressions, clicks) values ('2026-10-15', 1, 1)", [], /check/);
    ok("clean database: tables created, a lead without a partner saves, search_months takes first-of-month only");
    await db.close();
  }

  // 2. Existing database with referred leads, then the migration.
  {
    const db = await fresh();
    for (const f of OLD) await db.exec(sql(f));
    await db.query("insert into partners (code, name, email, terms_version, agreed_terms_at) values ('maria','Maria Lopez','maria@example.com','2026-10-14', now())");
    const before = [
      ["quote", "new", null], ["checkup", "quoted", 1800], ["quote", "hired", 2000], ["quote", "paid", 2000], ["checkup", "partner_paid", 1500],
    ];
    for (const [kind, status, price] of before) await db.query("insert into referral_leads (partner_code, kind, business, contact, status, build_price, utm_source) values ('maria', $1, 'Biz', 'x@example.com', $2, $3, 'card')", [kind, status, price]);
    assert.equal(await nullable(db, "partner_code"), false, "before: partner_code is required");
    await rejects(db, "insert into referral_leads (kind) values ('google_check')", [], /not-null|null value|check/);
    const snapshot = (await db.query("select id, partner_code, kind, status, build_price, utm_source, created_at from referral_leads order by created_at, id")).rows;

    await db.exec(sql(NEW));

    const after = (await db.query("select id, partner_code, kind, status, build_price, utm_source, created_at from referral_leads order by created_at, id")).rows;
    assert.deepEqual(after, snapshot, "every referred lead, status, build price and source is unchanged");
    assert.equal(await nullable(db, "partner_code"), true, "after: partner_code is optional");
    for (const col of ["utm_medium", "utm_campaign", "referrer_host", "landing_page", "heard", "detail", "signed_at", "dedupe_key"]) assert.ok((await db.query("select 1 from information_schema.columns where table_name='referral_leads' and column_name=$1", [col])).rows.length, `column ${col}`);
    ok("existing database: 5 referred leads at every old status survive, partner_code now optional, new columns present");

    // New kinds and statuses work; old ones still do; removed ones are refused.
    await db.query("insert into referral_leads (kind, business, contact, dedupe_key) values ('google_check','Test Co','2815550100','k1')");
    await db.query("insert into referral_leads (kind, business, contact, detail) values ('partner','Agency','a@example.com','Marketing agency · Both')");
    await db.query("insert into referral_leads (kind, heard) values ('call','google')");
    for (const st of ["consulted", "lost", "spam"]) await db.query("update referral_leads set status=$1 where kind='call'", [st]);
    await rejects(db, "insert into referral_leads (kind) values ('bogus')", [], /check/);
    await rejects(db, "update referral_leads set status='not_fit' where kind='call'", [], /check/);
    await rejects(db, "update referral_leads set status='bogus' where kind='call'", [], /check/);
    ok("new kinds (google_check, partner, call) and statuses (consulted, lost, spam) accepted; unknown ones refused");

    // The dedupe index refuses a repeat, allows many nulls.
    await rejects(db, "insert into referral_leads (kind, contact, dedupe_key) values ('google_check','2815550100','k1')", [], /duplicate key|unique/);
    await db.query("insert into referral_leads (kind) values ('text')");
    await db.query("insert into referral_leads (kind) values ('text')");
    ok("dedupe: a repeated key is refused (unique index), leads without a key are unlimited");

    // signed_at and the FK still behave.
    await db.query("update referral_leads set signed_at = now() where status = 'hired'");
    await rejects(db, "insert into referral_leads (partner_code, kind) values ('nobody','quote')", [], /foreign key|violates/);
    ok("signed_at stores; a partner code must still be a real partner");

    // 3. Run again.
    await db.exec(sql(NEW));
    const again = (await db.query("select id, partner_code, kind, status, build_price, utm_source, created_at from referral_leads where partner_code='maria' order by created_at, id")).rows;
    assert.deepEqual(again, snapshot);
    ok("run a second time: no error, referred rows still identical");

    // 4. The old code's insert shape, after the migration.
    await db.query("insert into referral_leads (partner_code, kind, business, contact_name, contact, website, checkup, utm_source) values ('maria','quote','Old Build Co','Old Name','old@example.com','old.example','Website Checkup: 50/100','card')");
    const old = (await db.query("select status, dedupe_key, signed_at from referral_leads where business='Old Build Co'")).rows[0];
    assert.deepEqual(old, { status: "new", dedupe_key: null, signed_at: null });
    for (const st of ["quoted", "hired", "paid", "partner_paid"]) await db.query("update referral_leads set status=$1 where business='Old Build Co'", [st]);
    ok("rollback safety: the previous code's insert and its statuses still work on the widened table");
    await db.close();
  }

  console.log(`\nall ${checks} migration checks passed`);
})().catch((e) => { console.error("FAIL", e.message); process.exit(1); });
