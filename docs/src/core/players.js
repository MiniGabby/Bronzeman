// Group members' stats from Wise Old Man (https://wiseoldman.net), which tracks the OSRS hiscores.
// Stats only update on Wise Old Man when someone presses "Update" on a player's page there.
import PLAYERS from "../../data/players.js";
import { skillByName } from "./osrs.js";

const WOM = "https://api.wiseoldman.net/v2/players/";
const state = {
  players: PLAYERS.map(name => ({ name, skills: null, updatedAt: null, error: null })),
  loaded: false,
  updating: false,
  gains: {},          // period -> { [player name]: skills gains | null }
  gainsLoading: {}
};
const listeners = new Set();
const emit = () => listeners.forEach(fn => fn());

export const onChange = fn => (listeners.add(fn), () => listeners.delete(fn));
export const all = () => state.players;
export const loaded = () => state.loaded;
export const profileUrl = p => "https://wiseoldman.net/players/" + encodeURIComponent(p.name.toLowerCase());

function applyPlayer(p, j) {
  p.name = j.displayName || p.name;
  p.updatedAt = j.updatedAt;
  p.skills = j.latestSnapshot?.data?.skills || null;
  p.error = p.skills ? null : "No stats yet: press Update stats";
}

async function womError(r) {
  let msg = `HTTP ${r.status}`;
  try { msg = (await r.json()).message || msg; } catch {}
  if (r.status === 404) msg = "Not tracked on Wise Old Man yet";
  if (r.status === 429) msg = "Too many requests, try again in a minute";
  return new Error(msg);
}

export async function load() {
  await Promise.all(state.players.map(async p => {
    try {
      const r = await fetch(WOM + encodeURIComponent(p.name));
      if (!r.ok) throw await womError(r);
      applyPlayer(p, await r.json());
    } catch (e) {
      p.error = e.message || String(e);
    }
  }));
  state.loaded = true;
  emit();
}

const skillData = (p, skillName) => p.skills?.[skillByName(skillName)?.key];
export const level = (p, skillName) => Math.max(1, skillData(p, skillName)?.level ?? 1);
export const xp = (p, skillName) => Math.max(0, skillData(p, skillName)?.experience ?? 0);

/** Skill requirements the player doesn't meet yet (quests can't be checked). */
export function missing(p, method) {
  if (!p.skills) return null;
  return Object.entries(method.reqs?.skills || {})
    .filter(([s, lvl]) => level(p, s) < lvl)
    .map(([s, lvl]) => `${s} ${lvl}`);
}

export const updating = () => state.updating;

/**
 * Asks Wise Old Man to fetch everyone's latest hiscores (POST /players/:name).
 * Six requests per click; the free limit is 20 per minute, so this is a button, never automatic.
 * Returns a list of { name, error } for players that failed.
 */
export async function updateAll() {
  if (state.updating) return [];
  state.updating = true;
  emit();
  const failed = [];
  await Promise.all(state.players.map(async p => {
    try {
      const r = await fetch(WOM + encodeURIComponent(p.name), { method: "POST" });
      if (!r.ok) throw await womError(r);
      applyPlayer(p, await r.json());
    } catch (e) {
      failed.push({ name: p.name, error: e.message || String(e) });
    }
  }));
  state.updating = false;
  state.loaded = true;
  state.gains = {};   // gains changed too; reload on demand
  emit();
  return failed;
}

/** XP and levels gained per skill in a period ("day", "week", "month"), per player. */
export const gains = period => state.gains[period] || null;
export const gainsLoading = period => !!state.gainsLoading[period];

export async function loadGains(period) {
  if (state.gains[period] || state.gainsLoading[period]) return;
  state.gainsLoading[period] = true;
  emit();
  const out = {};
  await Promise.all(state.players.map(async p => {
    try {
      const r = await fetch(`${WOM}${encodeURIComponent(p.name)}/gained?period=${period}`);
      if (!r.ok) throw await womError(r);
      out[p.name] = (await r.json()).data?.skills || null;
    } catch {
      out[p.name] = null;
    }
  }));
  state.gains[period] = out;
  state.gainsLoading[period] = false;
  emit();
}

/** XP gained in a skill ("overall" or a skill name) for a player in a loaded period. */
export function gained(period, p, skillName) {
  const g = state.gains[period]?.[p.name];
  if (!g) return null;
  const key = skillName === "overall" ? "overall" : skillByName(skillName)?.key;
  const s = g[key];
  return s ? { xp: s.experience?.gained || 0, levels: s.level?.gained || 0 } : { xp: 0, levels: 0 };
}
