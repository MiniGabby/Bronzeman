// Used by .github/workflows/sync-wikisync.yml.
// Asks Wise Old Man to refresh every player from the hiscores, then saves their levels, XP and what
// they gained today, this week and this month to docs/data/wom.json. The website reads that file
// instead of asking Wise Old Man from every visitor's browser, which ran into its request limit
// (20 per minute). The "Update stats" button on the site still talks to Wise Old Man directly.
//
// It also keeps docs/data/xp-history.json: one snapshot of everyone's XP per skill per day (the last
// sync of that day, Dutch time), forever. The site works out what each player gained per day from it.
//   { skills: ["overall", "attack", ...], days: { "2026-10-12": { "mini gabby": [xp, xp, ...] } } }
// Run once with --backfill to fill in the days before this existed from Wise Old Man's own snapshots.
const fs = require('fs');

const API = 'https://api.wiseoldman.net/v2/players/';
const OUT = 'docs/data/wom.json';
const HISTORY = 'docs/data/xp-history.json';
// The calendar day in the Netherlands, as YYYY-MM-DD.
const dayOf = date => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam' }).format(new Date(date));
const PERIODS = ['day', 'week', 'month'];
const UA = { 'User-Agent': 'Bronzeman group site (github.com/MiniGabby/Bronzeman)' };
const PAUSE_MS = 3500;   // about 17 requests a minute: under Wise Old Man's limit of 20

const sleep = ms => new Promise(r => setTimeout(r, ms));
const quoted = file => [...fs.readFileSync(file, 'utf8').matchAll(/^\s*"([^"]+)",?\s*$/gm)].map(m => m[1]);

// Group members (docs/data/players.js) plus the account on the Arcanekitten tab (docs/data/catchup.js).
const members = quoted('docs/data/players.js');
const extra = (fs.readFileSync('docs/data/catchup.js', 'utf8').match(/account:\s*"([^"]+)"/) || [])[1];
const names = [...members, ...(extra ? [extra] : [])];

async function call(path, method = 'GET') {
  await sleep(PAUSE_MS);
  const r = await fetch(API + path, { method, headers: UA });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.message || `HTTP ${r.status}`);
  return j;
}

// Keep only what the site uses, so the file stays small.
const slimSkills = skills => skills && Object.fromEntries(Object.entries(skills).map(([k, v]) => [k, { level: v.level, experience: v.experience }]));
const slimGains = skills => skills && Object.fromEntries(Object.entries(skills)
  .map(([k, v]) => [k, { xp: v.experience?.gained || 0, levels: v.level?.gained || 0 }]).filter(([, v]) => v.xp > 0 || v.levels > 0));

async function fetchPlayer(name) {
  const id = encodeURIComponent(name.toLowerCase());
  let j;
  try { j = await call(id, 'POST'); }          // refresh from the hiscores
  catch (e) { console.log(`${name}: update failed (${e.message}), reading what Wise Old Man has`); j = await call(id); }
  const out = { name: j.displayName || name, updatedAt: j.updatedAt, skills: slimSkills(j.latestSnapshot?.data?.skills), gains: {} };
  for (const period of PERIODS) {
    try { out.gains[period] = slimGains((await call(`${id}/gained?period=${period}`)).data?.skills) || {}; }
    catch (e) { console.log(`${name}: ${period} gains failed (${e.message})`); }
  }
  return out;
}

// ---- daily XP history ----
function readHistory() {
  try { const h = JSON.parse(fs.readFileSync(HISTORY, 'utf8')); if (h.skills && h.days) return h; } catch {}
  return { skills: [], days: {} };
}
// Puts one player's XP per skill into a day, adding skills the file hasn't seen yet to the end of the list.
function record(history, day, id, skills) {
  if (!skills) return;
  for (const k of Object.keys(skills)) if (!history.skills.includes(k)) history.skills.push(k);
  (history.days[day] ||= {})[id] = history.skills.map(k => skills[k]?.experience ?? -1).map(x => Math.max(0, x));
}
function writeHistory(history) {
  const days = Object.fromEntries(Object.keys(history.days).sort().map(d => [d, history.days[d]]));
  // One day per line, so the file stays readable and changes show up as one changed line.
  fs.writeFileSync(HISTORY, `{"skills":${JSON.stringify(history.skills)},"days":{\n${
    Object.entries(days).map(([d, v]) => `${JSON.stringify(d)}:${JSON.stringify(v)}`).join(',\n')}\n}}\n`);
}

// One-off: every snapshot Wise Old Man has kept, the last one of each day.
async function backfill() {
  const history = readHistory();
  for (const name of names) {
    const id = name.toLowerCase();
    try {
      const snaps = await call(`${encodeURIComponent(id)}/snapshots?period=year&limit=50`);
      let all = snaps, offset = 50;
      while (snaps.length && all.length === offset) { all = all.concat(await call(`${encodeURIComponent(id)}/snapshots?period=year&limit=50&offset=${offset}`)); offset += 50; }
      const lastOfDay = {};
      for (const s of all) { const d = dayOf(s.createdAt); if (!lastOfDay[d] || s.createdAt > lastOfDay[d].createdAt) lastOfDay[d] = s; }
      for (const [d, s] of Object.entries(lastOfDay)) record(history, d, id, s.data?.skills);
      console.log(`${name}: ${all.length} snapshots, ${Object.keys(lastOfDay).length} days`);
    } catch (e) { console.log(`${name}: ${e.message}`); }
  }
  writeHistory(history);
}

(async () => {
  if (process.argv.includes('--backfill')) return backfill();
  let old = {};
  try { old = JSON.parse(fs.readFileSync(OUT, 'utf8')).players || {}; } catch {}
  const players = {};
  for (const name of names) {
    try { players[name.toLowerCase()] = await fetchPlayer(name); console.log(`${name}: ok`); }
    catch (e) {
      // On an error, keep the last good data instead of wiping it.
      console.log(`${name}: ${e.message}`);
      if (old[name.toLowerCase()]) players[name.toLowerCase()] = old[name.toLowerCase()];
    }
  }
  if (!Object.keys(players).length) { console.log('Nothing fetched; keeping the old file.'); return; }
  fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), players }) + '\n');

  // Today's snapshot (overwrites an earlier one from today, so the day ends with its last sync).
  const history = readHistory();
  for (const [id, p] of Object.entries(players)) if (p.updatedAt) record(history, dayOf(p.updatedAt), id, p.skills);
  writeHistory(history);
})();
