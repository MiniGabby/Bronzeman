// Group members' stats from Wise Old Man (https://wiseoldman.net), which tracks the OSRS hiscores.
// Stats only update on Wise Old Man when someone presses "Update" on a player's page there.
import PLAYERS from "../../data/players.js";
import { skillByName } from "./osrs.js";

const WOM = "https://api.wiseoldman.net/v2/players/";
const state = { players: PLAYERS.map(name => ({ name, skills: null, updatedAt: null, error: null })), loaded: false };
const listeners = new Set();
const emit = () => listeners.forEach(fn => fn());

export const onChange = fn => (listeners.add(fn), () => listeners.delete(fn));
export const all = () => state.players;
export const loaded = () => state.loaded;
export const profileUrl = p => "https://wiseoldman.net/players/" + encodeURIComponent(p.name.toLowerCase());

export async function load() {
  await Promise.all(state.players.map(async p => {
    try {
      const r = await fetch(WOM + encodeURIComponent(p.name));
      if (!r.ok) throw new Error(r.status === 404 ? "Not tracked on Wise Old Man yet" : `HTTP ${r.status}`);
      const j = await r.json();
      p.name = j.displayName || p.name;
      p.updatedAt = j.updatedAt;
      p.skills = j.latestSnapshot?.data?.skills || null;
      if (!p.skills) p.error = "No stats yet: press Update on Wise Old Man";
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
