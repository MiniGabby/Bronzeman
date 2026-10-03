// Used by .github/workflows/sync-wikisync.yml.
// Fetches every player's quest progress from the OSRS Wiki's WikiSync (players who use the WikiSync
// plugin in RuneLite) and writes docs/data/wikisync.json. The website can't fetch this itself:
// the wiki doesn't allow requests from other websites, so GitHub fetches it on a schedule.
const fs = require('fs');

const API = 'https://sync.runescape.wiki/runelite/player/';
const OUT = 'docs/data/wikisync.json';

// Player names from docs/data/players.js (an ES module, so read the strings rather than importing it).
const names = [...fs.readFileSync('docs/data/players.js', 'utf8').matchAll(/^\s*"([^"]+)",?\s*$/gm)].map(m => m[1]);

async function fetchPlayer(name) {
  const url = API + encodeURIComponent(name.replace(/ /g, '_')) + '/STANDARD';
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Bronzeman group site (github.com/MiniGabby/Bronzeman)' } });
    const j = await r.json().catch(() => ({}));
    if (j.quests) return { status: 'ok', timestamp: j.timestamp || null, quests: j.quests };
    if (j.code === 'NO_USER_DATA') return { status: 'none' };
    return { status: 'error', error: j.error || `HTTP ${r.status}` };
  } catch (e) {
    return { status: 'error', error: String(e.message || e) };
  }
}

(async () => {
  let old = {};
  try { old = JSON.parse(fs.readFileSync(OUT, 'utf8')).players || {}; } catch {}
  const players = {};
  for (const name of names) {
    const res = await fetchPlayer(name);
    // On a temporary error, keep the last good data instead of wiping it.
    players[name] = res.status === 'error' && old[name]?.status === 'ok' ? { ...old[name], lastError: res.error } : res;
    console.log(`${name}: ${players[name].status}`);
  }
  // Only write (and so only commit) when something besides the run time changed.
  const body = { players };
  if (JSON.stringify(body) === JSON.stringify({ players: old })) { console.log('No changes.'); return; }
  fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), ...body }) + '\n');
})();
