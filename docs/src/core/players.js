// Group members' stats from Wise Old Man (https://wiseoldman.net), which tracks the OSRS hiscores.
//
// Wise Old Man allows 20 requests per minute. To stay well under that, everything fetched is
// remembered in the browser (localStorage) and reused for CACHE_MS: a page refresh shows the
// remembered stats instantly and only asks Wise Old Man again once they are older than that.
import PLAYERS from "../../data/players.js";
import QUESTS, { INFERRED } from "../../data/quests.js";
import { skillByName } from "./osrs.js";
import { store } from "./store.js";

const WOM = "https://api.wiseoldman.net/v2/players/";
const CACHE_KEY = "wom";
const CACHE_MS = 15 * 60_000;

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

/** Loads levels; uses the browser cache unless it's older than 15 minutes (or force is set). */
export async function load({ force = false } = {}) {
  const todo = state.players.filter(p => force || !fresh(cache.players[p.id]?.fetchedAt));
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
  saveCache();
  state.updating = false;
  state.loaded = true;
  emit();
  return failed;
}

const skillData = (p, skillName) => p.skills?.[skillByName(skillName)?.key];
export const level = (p, skillName) => Math.max(1, skillData(p, skillName)?.level ?? 1);
export const xp = (p, skillName) => Math.max(0, skillData(p, skillName)?.experience ?? 0);

// Quest list per player, keyed case-insensitively by RuneScape name.
const questsByPlayer = Object.fromEntries(Object.entries(QUESTS).map(([n, q]) => [idOf(n), q]));

/** Has the player done this quest? true / false, or null when nobody has filled it in (data/quests.js). */
export function questDone(p, quest) {
  const v = questsByPlayer[p.id]?.[quest];
  if (v === true || v === false) return v;
  const inf = INFERRED[quest];
  if (inf && p.skills && level(p, inf.skill) >= inf.level) return true;
  return null;
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
