// Used by .github/workflows/sync-wikisync.yml.
// Reads the group bronzeman plugin's Firebase database and adds new unlocks to docs/data/unlocks.json,
// the same file workspace/tools/build-unlocks.py builds from manual exports.
//
// The database address is the repository secret BRONZEMAN_DB_URL. It is never written to a file or
// printed: anyone who has it can read and change the whole database (the plugin needs it open).
// Without the secret this step does nothing.
//
// Only item id, name, who unlocked it and when are published. Items already in the file are kept,
// even if they disappear from the database, and the earliest unlock time wins. The database is
// writable by anyone, so items and member names that don't look real are skipped.
const fs = require('fs');

const OUT = 'docs/data/unlocks.json';
const MAX_NEW = 300;   // more new items than this in one run means something is wrong with the data

function fail(message) {
  console.log(`::warning::Unlocked items not updated: ${message}`);
  process.exit(1);
}

const secret = (process.env.BRONZEMAN_DB_URL || '').trim();
if (!secret) {
  console.log('No BRONZEMAN_DB_URL secret set, skipping unlocked items.');
  process.exit(0);
}

let base;
try {
  base = new URL(secret.replace(/\.json$/, '').replace(/\/+$/, ''));
} catch {
  fail('the BRONZEMAN_DB_URL secret is not a valid address.');
}
// Hide the database host in the logs too, not only the full secret.
console.log(`::add-mask::${base.host}`);
console.log(`::add-mask::${base.host.split('.')[0]}`);

async function get(path) {
  let r;
  try {
    r = await fetch(`${base.href.replace(/\/$/, '')}/${path}.json`);
  } catch {
    fail(`couldn't reach the database (${path}).`);   // the error itself would contain the host
  }
  if (!r.ok) fail(`the database answered HTTP ${r.status} (${path}).`);
  try {
    return await r.json();
  } catch {
    fail(`the database didn't send JSON (${path}).`);
  }
}

// Same normalisation as build-unlocks.py: up to 7 decimals and a "Z" or offset.
function parseTime(s) {
  if (typeof s !== 'string') return null;
  const t = Date.parse(s.replace(/\.(\d+)/, (_, d) => '.' + d.slice(0, 3)));
  if (Number.isNaN(t)) return null;
  // Nothing before the group started, nothing in the future.
  if (t < Date.parse('2026-01-01T00:00:00Z') || t > Date.now() + 86400000) return null;
  return new Date(t).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

const okItemName = n => typeof n === 'string' && n.length <= 60 && /^[A-Za-z0-9][A-Za-z0-9 '()+\-./,&!:%]*$/.test(n);
const okMemberName = n => typeof n === 'string' && /^[A-Za-z0-9 _-]{1,12}$/.test(n);   // RuneScape names

(async () => {
  const [members, unlocked] = await Promise.all([get('Members'), get('UnlockedItems')]);
  if (!unlocked || typeof unlocked !== 'object') fail('no UnlockedItems in the database.');

  const names = {};
  for (const [key, m] of Object.entries(members || {})) {
    if (m && okMemberName(m.name)) names[String(m.accountHash || key)] = m.name;
  }

  const old = JSON.parse(fs.readFileSync(OUT, 'utf8'));
  const items = new Map(old.items.map(i => [i.id, i]));

  let added = 0, earlier = 0, skipped = 0;
  for (const [key, it] of Object.entries(unlocked)) {
    const id = Number(it && it.id != null ? it.id : key);
    const at = parseTime(it && it.acquiredAt);
    const by = names[String(it && it.acquiredByAccountHash)];
    if (!Number.isInteger(id) || id <= 0 || id > 100000 || !okItemName(it.name) || !at || !by) {
      skipped++;
      continue;
    }
    const known = items.get(id);
    if (!known) {
      items.set(id, { id, name: it.name, at, by });
      added++;
    } else if (!known.at || at < known.at) {
      items.set(id, { ...known, at, by });
      earlier++;
    }
  }
  if (added > MAX_NEW) fail(`${added} new items in one go looks wrong, so nothing was changed.`);
  console.log(`${added} new, ${earlier} with an earlier time, ${skipped} skipped (incomplete or odd-looking).`);
  if (!added && !earlier) return;

  const out = [...items.values()].sort((a, b) =>
    (b.at || '').localeCompare(a.at || '') || b.name.localeCompare(a.name));
  const result = {
    generatedAt: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    newestUnlockAt: (out.find(i => i.at) || {}).at || null,
    exports: old.exports,
    members: [...new Set([...old.members, ...Object.values(names)])].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())),
    items: out,
  };
  fs.writeFileSync(OUT, JSON.stringify(result, null, 1) + '\n');
  console.log(`Wrote ${out.length} unlocked items to ${OUT}.`);
})();
