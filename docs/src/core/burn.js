// Burnt food for Cooking methods. A method with `burn` gets its success chance from the player's level
// and where they cook (fire or range, with or without cooking gauntlets). The chosen setting is stored
// in the visitor's browser.
//
// m.burn = { fire, range, gauntletsFire, gauntletsRange, at99 }: the level where you stop burning on
// each source (null = you never stop), and for "never" the success chance at level 99.
// Between the requirement level and the stop-burn level the chance rises in a straight line (that's
// how the game works); the chance AT the requirement level isn't published per fish, so we use
// START below, an estimate.
import { store } from "./store.js";
import { xpForLevel } from "./osrs.js";

const START = 0.5;   // estimated success chance at the level requirement

export const source = () => ({ where: "range", gauntlets: false, ...store.get("cookSource", {}) });
export function setSource(v) { store.set("cookSource", { ...source(), ...v }); }
export const label = s => `${s.where === "fire" ? "a fire" : "a range"}${s.gauntlets ? " with cooking gauntlets" : ""}`;

/** Level where this method stops burning with the current setting; null = never. */
function stopLevel(m, s) {
  const b = m.burn;
  const g = s.gauntlets ? (s.where === "fire" ? b.gauntletsFire : b.gauntletsRange) : undefined;
  return g !== undefined ? g : (s.where === "fire" ? b.fire : b.range);
}

/** Chance (0–1) that one attempt at this level gives cooked food. */
export function success(m, level, s = source()) {
  if (!m.burn) return 1;
  const req = m.reqs?.skills?.Cooking || 1;
  const L = Math.max(req, Math.min(99, level));
  const stop = stopLevel(m, s);
  if (stop != null) return stop <= req ? 1 : Math.min(1, START + (1 - START) * (L - req) / (stop - req));
  const end = m.burn.at99?.[s.where] ?? 0.9;
  return 99 <= req ? end : START + (end - START) * (L - req) / (99 - req);
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
