// What every player gained per day, from data/xp-history.json: one snapshot of everyone's XP per skill
// per day (the last sync of that day, Dutch time), written by the GitHub Action and kept forever.
//   { skills: ["overall", "attack", ...], days: { "2026-10-12": { "mini gabby": [xp, xp, ...] } } }
import { SKILLS, levelForXp } from "./osrs.js";

let data = null, loading = null;
const listeners = new Set();
export const onChange = fn => (listeners.add(fn), () => listeners.delete(fn));
export const loaded = () => !!data;

/** Loads the file once per page load. */
export function load() {
  loading ||= fetch("data/xp-history.json", { cache: "no-cache" })
    .then(r => (r.ok ? r.json() : null)).catch(() => null)
    .then(j => { data = j && j.days ? j : { skills: [], days: {} }; listeners.forEach(fn => fn()); return data; });
  return loading;
}

/**
 * A player's days with a snapshot, newest first:
 * [{ date, since, total, levels, skills: [{ skill, xp, from, to }] }]
 * Gains are counted from the player's previous snapshot (`since`), which is normally the day before;
 * the first snapshot has nothing to compare with and is left out. Days without any gain are kept,
 * so a day you didn't play shows as such.
 */
export function days(playerId) {
  if (!data) return null;
  const id = String(playerId).toLowerCase();
  const idx = Object.fromEntries(data.skills.map((k, i) => [k, i]));
  const dates = Object.keys(data.days).filter(d => data.days[d][id]).sort();
  const out = [];
  for (let n = 1; n < dates.length; n++) {
    const now = data.days[dates[n]][id], before = data.days[dates[n - 1]][id];
    const skills = SKILLS.map(s => {
      const i = idx[s.key], a = before[i] || 0, b = now[i] || 0;
      return { skill: s, xp: Math.max(0, b - a), from: levelForXp(a), to: levelForXp(b) };
    }).filter(r => r.xp > 0).sort((x, y) => y.xp - x.xp);
    out.push({ date: dates[n], since: dates[n - 1], total: skills.reduce((t, r) => t + r.xp, 0),
      levels: skills.reduce((t, r) => t + (r.to - r.from), 0), skills });
  }
  return out.reverse();
}
