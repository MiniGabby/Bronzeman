// Burnt food for Cooking methods. A method with `burn` gets its success chance from the player's level
// and where they cook (fire or range, with or without cooking gauntlets). The chosen setting is stored
// in the visitor's browser.
//
// m.burn = { fire: [low, high], range: [low, high], gauntlets: [low, high] }: the game's own numbers for
// each fish, from the "cooking chance" chart on the fish's wiki page (gauntlets only where they help).
// The chance at a level is the game's formula:
//   (1 + floor(low × (99 − level) / 98 + high × (level − 1) / 98 + 0.5)) / 256, at most 100%.
import { store } from "./store.js";
import { xpForLevel } from "./osrs.js";

export const source = () => ({ where: "range", gauntlets: false, ...store.get("cookSource", {}) });
export function setSource(v) { store.set("cookSource", { ...source(), ...v }); }
export const label = s => `${s.where === "fire" ? "a fire" : "a range"}${s.gauntlets ? " with cooking gauntlets" : ""}`;

// The [low, high] pair for a setting. Gauntlets replace the fire or range numbers when they're better.
function pair(m, s) {
  const base = m.burn[s.where === "fire" ? "fire" : "range"], g = s.gauntlets ? m.burn.gauntlets : null;
  return g && g[1] >= base[1] ? g : base;
}
const chance = ([low, high], level) => Math.min(1, (1 + Math.floor(low * (99 - level) / 98 + high * (level - 1) / 98 + 0.5)) / 256);

/** Chance (0–1) that one attempt at this level gives cooked food. */
export function success(m, level, s = source()) {
  if (!m.burn) return 1;
  const req = m.reqs?.skills?.Cooking || 1;
  return chance(pair(m, s), Math.max(req, Math.min(99, level)));
}

/** Level where this method stops burning with the current setting; null = never. */
export function stopLevel(m, s = source()) {
  const req = m.reqs?.skills?.Cooking || 1;
  for (let l = req; l <= 99; l++) if (success(m, l, s) >= 1) return l;
  return null;
}

/**
 * Average success over levels from..to, weighted by the attempts each level takes
 * (more attempts where you burn more), so XP per hour and cost per XP come out right.
 */
export function averageSuccess(m, from, to, s = source()) {
  if (!m.burn) return 1;
  let xp = 0, attempts = 0;
  for (let l = from; l < Math.max(from + 1, to); l++) {
    const w = xpForLevel(l + 1) - xpForLevel(l);
    xp += w; attempts += w / success(m, l, s);
  }
  return xp / attempts;
}

/** Short text for the stop-burn level with the current setting, e.g. "stops burning at 49". */
export function stopText(m, s = source()) {
  if (!m.burn) return "";
  const stop = stopLevel(m, s);
  const req = m.reqs?.skills?.Cooking || 1;
  const g = !s.gauntlets && m.burn.gauntlets ? stopLevel(m, { ...s, gauntlets: true }) : null;
  const withG = g != null && (stop == null || g < stop) ? ` (with gauntlets: ${g})` : "";
  if (stop != null) return stop <= req ? "never burns" : `stops burning at ${stop}${withG}`;
  return `never stops burning: ${Math.round(success(m, 99, s) * 100)}% cooked at 99${withG}`;
}
