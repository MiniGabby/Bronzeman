// Group members' stats from Wise Old Man (https://wiseoldman.net), which tracks the OSRS hiscores.
//
// Wise Old Man allows 20 requests per minute, so the site asks it as little as possible:
//   1. A GitHub Action (.github/scripts/build-wom.js) refreshes everyone on Wise Old Man every 3 hours
//      and saves their levels, XP and XP gains to data/wom.json. The site reads that file first.
//   2. Only when that file is missing or more than SYNC_STALE_MS old does the site ask Wise Old Man
//      itself, and then everything fetched is remembered in the browser for CACHE_MS.
//   3. The "Update stats" button always asks Wise Old Man directly; until the next sync the site then
//      keeps using what that update returned.
import PLAYERS from "../../data/players.js";
import QUESTS, { INFERRED, ALL_QUESTS } from "../../data/quests.js";
import SKILL_LOCKS from "../../data/skill-locks.js";
import { skillByName, xpForLevel } from "./osrs.js";
import { store } from "./store.js";

const WOM = "https://api.wiseoldman.net/v2/players/";
const CACHE_KEY = "wom";
const CACHE_MS = 15 * 60_000;
const SYNC_STALE_MS = 8 * 3600_000;   // the Action runs every 3 hours; older than this means it's stuck

const idOf = name => name.toLowerCase();
const state = {
  players: PLAYERS.map(name => ({ id: idOf(name), name, skills: null, updatedAt: null, error: null })),
  loaded: false,
  updating: false,
  gains: {},          // period -> { [player id]: skills gains | null }
  gainsLoading: {}
};
const listeners = new Set();
const emit = () => listeners.forEach(fn => fn());

export const onChange = fn => (listeners.add(fn), () => listeners.delete(fn));
export const all = () => state.players;
export const loaded = () => state.loaded;
export const updating = () => state.updating;
export const profileUrl = p => "https://wiseoldman.net/players/" + encodeURIComponent(p.id);

// ---- browser cache ----
const cache = store.get(CACHE_KEY, null) || { players: {}, gains: {} };
const saveCache = () => store.set(CACHE_KEY, cache);
const fresh = fetchedAt => fetchedAt && Date.now() - fetchedAt < CACHE_MS;

/** Keep only level and XP per skill, so the cache stays small. */
const slim = skills => skills && Object.fromEntries(
  Object.entries(skills).map(([k, v]) => [k, { level: v.level, experience: v.experience }]));

function applyPlayer(p, j) {
  p.name = j.displayName || p.name;
  p.updatedAt = j.updatedAt;
  p.skills = slim(j.latestSnapshot?.data?.skills) || null;
  p.error = p.skills ? null : "No stats yet: press Update stats";
  cache.players[p.id] = { name: p.name, updatedAt: p.updatedAt, skills: p.skills, fetchedAt: Date.now() };
}

async function womError(r) {
  let msg = `HTTP ${r.status}`;
  try { msg = (await r.json()).message || msg; } catch {}
  if (r.status === 404) msg = "Not tracked on Wise Old Man yet";
  if (r.status === 429) msg = "Too many requests to Wise Old Man, try again in a minute";
  return new Error(msg);
}

// Show remembered stats immediately.
for (const p of state.players) {
  const c = cache.players[p.id];
  if (c?.skills) Object.assign(p, { name: c.name || p.name, updatedAt: c.updatedAt, skills: c.skills });
}
if (state.players.some(p => p.skills)) state.loaded = true;

// ---- data/wom.json, written by the GitHub Action ----
let synced = null, syncedLoading = null;
// One fetch per page load, shared by everything that asks for it at the same time.
function loadSynced() {
  syncedLoading ||= (async () => {
    try {
      const r = await fetch("data/wom.json", { cache: "no-cache" });
      if (r.ok) synced = await r.json();
    } catch { /* no file yet: fall back to asking Wise Old Man */ }
    return synced;
  })();
  return syncedLoading;
}
const syncedFresh = () => !!synced?.generatedAt && Date.now() - new Date(synced.generatedAt).getTime() < SYNC_STALE_MS;
/** The saved stats of any account in data/wom.json (also the one on the Arcanekitten tab), or null. */
export async function syncedPlayer(name) {
  await loadSynced();
  return synced?.players?.[idOf(name)] || null;
}
/** When data/wom.json was written, or null. */
export const syncedAt = () => synced?.generatedAt || null;
// True when this browser pressed Update stats after the last sync: then its own data is newer.
const updatedSinceSync = () => !!cache.manualAt && (!synced?.generatedAt || cache.manualAt > new Date(synced.generatedAt).getTime());

/** Loads levels: from data/wom.json when it's there and recent, otherwise from Wise Old Man (cached 15 minutes). */
export async function load({ force = false } = {}) {
  await loadSynced();
  if (synced?.players) {
    for (const p of state.players) {
      const s = synced.players[p.id];
      // Take the synced stats unless this browser already holds a newer update.
      if (s?.skills && (!p.updatedAt || new Date(s.updatedAt) >= new Date(p.updatedAt))) {
        Object.assign(p, { name: s.name || p.name, updatedAt: s.updatedAt, skills: s.skills, error: null });
        cache.players[p.id] = { name: p.name, updatedAt: p.updatedAt, skills: p.skills, fetchedAt: Date.now() };
      }
    }
  }
  const todo = state.players.filter(p => force || (!fresh(cache.players[p.id]?.fetchedAt) && !(syncedFresh() && p.skills)));
  if (todo.length) {
    await Promise.all(todo.map(async p => {
      try {
        const r = await fetch(WOM + encodeURIComponent(p.id));
        if (!r.ok) throw await womError(r);
        applyPlayer(p, await r.json());
      } catch (e) {
        // Keep showing remembered stats if we have them.
        p.error = p.skills ? null : (e.message || String(e));
      }
    }));
    saveCache();
  }
  state.loaded = true;
  emit();
}

/**
 * Asks Wise Old Man to fetch everyone's latest hiscores (POST /players/:name).
 * Six requests per click; the Group page allows this once an hour.
 * Returns a list of { name, error } for players that failed.
 */
export async function updateAll() {
  if (state.updating) return [];
  state.updating = true;
  emit();
  const failed = [];
  await Promise.all(state.players.map(async p => {
    try {
      const r = await fetch(WOM + encodeURIComponent(p.id), { method: "POST" });
      if (!r.ok) throw await womError(r);
      applyPlayer(p, await r.json());
    } catch (e) {
      failed.push({ name: p.name, error: e.message || String(e) });
    }
  }));
  // XP gains changed too: forget them so they're fetched fresh.
  state.gains = {};
  cache.gains = {};
  cache.manualAt = Date.now();
  saveCache();
  state.updating = false;
  state.loaded = true;
  emit();
  return failed;
}

const skillData = (p, skillName) => p.skills?.[skillByName(skillName)?.key];
const womLevel = (p, skillName) => skillData(p, skillName)?.level ?? 1;
// WikiSync (see below) also knows levels, and is updated while you play, so it can be ahead of
// Wise Old Man until someone presses Update stats. It has no XP: a level that's ahead counts as
// the XP that level starts at.
const wikiLevel = (p, skillName) => p.wikiLevels?.[skillByName(skillName)?.name] ?? 0;
/** The level on the account, also when the player may not use it yet (see data/skill-locks.js). */
export const realLevel = (p, skillName) => Math.max(1, womLevel(p, skillName), wikiLevel(p, skillName));
/**
 * The lock on this skill for this player while it's still on, as { skill, until, best, bestBy }
 * (best = the highest level among the others, by whom), or null.
 */
export function skillLock(p, skillName) {
  const name = skillByName(skillName)?.name;
  const lock = SKILL_LOCKS.find(l => idOf(l.player) === p.id && skillByName(l.skill)?.name === name);
  if (!lock) return null;
  const others = state.players.filter(x => x !== p && x.skills);
  const best = Math.max(1, ...others.map(x => realLevel(x, name)));
  if (best >= lock.until) return null;
  return { skill: name, until: lock.until, best, bestBy: others.filter(x => realLevel(x, name) === best).map(x => x.name) };
}
export const skillLocks = p => SKILL_LOCKS.filter(l => idOf(l.player) === p.id).map(l => skillLock(p, l.skill)).filter(Boolean);
/** The level that counts: a locked skill counts as 1. */
export const level = (p, skillName) => (skillLock(p, skillName) ? 1 : realLevel(p, skillName));
export const xp = (p, skillName) => Math.max(0, skillData(p, skillName)?.experience ?? 0,
  wikiLevel(p, skillName) > womLevel(p, skillName) ? xpForLevel(wikiLevel(p, skillName)) : 0);
/** True when this level comes from WikiSync because Wise Old Man is behind. */
export const levelFromWiki = (p, skillName) => wikiLevel(p, skillName) > womLevel(p, skillName);

// Quest list per player, keyed case-insensitively by RuneScape name.
const questsByPlayer = Object.fromEntries(Object.entries(QUESTS).map(([n, q]) => [idOf(n), q]));

// ---- Quests from the wiki's WikiSync (players with the WikiSync plugin in RuneLite) ----
// The wiki doesn't let other websites read WikiSync from the browser, so a GitHub Action
// (.github/workflows/sync-wikisync.yml) fetches it every 3 hours into data/wikisync.json:
// { generatedAt, players: { "<RuneScape name>": { status: "ok"|"none"|"error", timestamp, quests: { "Quest": 0|1|2 },
//   levels: { "Cooking": 77 }, diaries: { "Ardougne": { "Easy": [tasks done, tasks in total] } },
//   combatAchievements: [ids of completed Combat Achievement tasks] } } }
// 0 = not started, 1 = started, 2 = done; "none" = no WikiSync data (plugin not used).
let syncGeneratedAt = null;
export const questsSyncedAt = () => syncGeneratedAt;

/** Loads data/wikisync.json and attaches each player's quests. */
export async function loadQuests() {
  try {
    const r = await fetch("data/wikisync.json", { cache: "no-cache" });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const j = await r.json();
    syncGeneratedAt = j.generatedAt || null;
    const byId = Object.fromEntries(Object.entries(j.players || {}).map(([n, v]) => [idOf(n), v]));
    for (const p of state.players) {
      const v = byId[p.id];
      const ok = v?.status === "ok";
      Object.assign(p, { wikiQuests: ok ? v.quests : null, wikiLevels: ok ? v.levels || null : null, wikiDiaries: ok ? v.diaries || null : null,
        wikiCA: ok && Array.isArray(v.combatAchievements) ? new Set(v.combatAchievements) : null,
        wikiAt: v?.timestamp || null, wikiStatus: v ? v.status : "none" });
    }
  } catch {
    for (const p of state.players) p.wikiStatus = "error";
  }
  emit();
}

/** "ok" (synced), "none" (no WikiSync data), "error", or undefined (not loaded yet). */
export const questSource = p => p.wikiStatus;

/**
 * Has the player done this quest? true / false, or null when unknown.
 * WikiSync first; otherwise the hand-kept list (data/quests.js) and what levels prove (INFERRED).
 * "X (started)" only needs the quest to be started.
 */
export function questDone(p, quest) {
  const started = quest.match(/^(.+) \(started\)$/);
  const v = questState(p, started ? started[1] : quest);
  return v == null ? null : started ? v >= 1 : v === 2;
}

/**
 * Progress on a quest: 2 = done, 1 = started, 0 = not started, null = unknown.
 * WikiSync first, then the hand-kept list (true = done, false = not done) and what levels prove.
 */
export function questState(p, quest) {
  const w = p.wikiQuests?.[quest];
  if (w != null) return w;
  const v = questsByPlayer[p.id]?.[quest];
  if (v === true) return 2;
  if (v === false) return 0;
  const inf = INFERRED[quest];
  if (inf && p.skills && realLevel(p, inf.skill) >= inf.level) return 2;
  return null;
}

/** Every quest name: the built-in list plus any new quest that shows up in WikiSync data. */
export function allQuests() {
  const set = new Set(ALL_QUESTS);
  for (const p of state.players) for (const q of Object.keys(p.wikiQuests || {})) if (/\w/.test(q)) set.add(q);
  return [...set].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));
}

// ---- Achievement diaries (WikiSync only) ----
export const DIARY_TIERS = ["Easy", "Medium", "Hard", "Elite"];
/** Every diary area that shows up in the WikiSync data, A to Z. */
export const diaryAreas = () => [...new Set(state.players.flatMap(p => Object.keys(p.wikiDiaries || {})))].sort();
/** [tasks done, tasks in total] for a diary tier, or null when unknown (no WikiSync data). */
export const diaryProgress = (p, area, tier) => p.wikiDiaries?.[area]?.[tier] || null;
/** Has the player finished this diary tier, e.g. "Kandarin Hard"? true / false, or null when unknown. */
export function diaryDone(p, diary) {
  const m = String(diary).match(/^(.+) (Easy|Medium|Hard|Elite)$/);
  const v = m && diaryProgress(p, m[1], m[2]);
  return v ? v[1] > 0 && v[0] >= v[1] : null;
}

/** Requirements the player doesn't meet yet: skill levels, plus quests known not to be done. */
export function missing(p, method) {
  if (!p.skills) return null;
  return [
    ...Object.entries(method.reqs?.skills || {}).filter(([s, lvl]) => level(p, s) < lvl).map(([s, lvl]) => `${s} ${lvl}`),
    ...(method.reqs?.quests || []).filter(q => questDone(p, q) === false)
  ];
}

/** Quests a method needs that we don't know about for this player yet. */
export const unknownQuests = (p, method) => (method.reqs?.quests || []).filter(q => questDone(p, q) === null);

// ---- XP gained per period ("day", "week", "month") ----
export const gains = period => state.gains[period] || null;
export const gainsLoading = period => !!state.gainsLoading[period];

// Remembered gains show immediately.
for (const [period, c] of Object.entries(cache.gains || {})) if (c?.data) state.gains[period] = c.data;

export async function loadGains(period) {
  if (state.gainsLoading[period]) return;
  // The synced file has everyone's gains: use it, unless this browser updated the stats after the sync.
  await loadSynced();
  if (syncedFresh() && !updatedSinceSync() && state.players.some(p => synced.players?.[p.id]?.gains?.[period])) {
    state.gains[period] = Object.fromEntries(state.players.map(p => [p.id, synced.players[p.id]?.gains?.[period] ?? null]));
    emit();
    return;
  }
  if (state.gains[period] && fresh(cache.gains[period]?.fetchedAt)) return;
  state.gainsLoading[period] = true;
  emit();
  const previous = state.gains[period] || {};
  const out = {};
  await Promise.all(state.players.map(async p => {
    try {
      const r = await fetch(`${WOM}${encodeURIComponent(p.id)}/gained?period=${period}`);
      if (!r.ok) throw await womError(r);
      const skills = (await r.json()).data?.skills || null;
      out[p.id] = skills && Object.fromEntries(Object.entries(skills).map(([k, v]) =>
        [k, { xp: v.experience?.gained || 0, levels: v.level?.gained || 0 }]));
    } catch {
      out[p.id] = previous[p.id] ?? null;   // keep what we had
    }
  }));
  state.gains[period] = out;
  cache.gains[period] = { fetchedAt: Date.now(), data: out };
  saveCache();
  state.gainsLoading[period] = false;
  emit();
}

/** XP gained in a skill ("overall" or a skill name) for a player in a loaded period. */
export function gained(period, p, skillName) {
  const g = state.gains[period]?.[p.id];
  if (!g) return null;
  const key = skillName === "overall" ? "overall" : skillByName(skillName)?.key;
  return g[key] || { xp: 0, levels: 0 };
}
