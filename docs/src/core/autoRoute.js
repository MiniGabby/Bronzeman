// "Best of both" routes (auto: true in data/skill-guides.js): per level range, the method with the
// lowest total cost = gold spent + time × what your time is worth (stored as "timeValue").
// Candidates come from the route's list; methods with locked inputs are only used when nothing
// unlocked fits. Methods needing a quest the player hasn't done stay in (the route marks them and
// shows an alternative that can be done now, see doableAlt).
import METHODS from "../../data/methods/index.js";
import * as calc from "./calc.js";
import * as unlocks from "./unlocks.js";
import * as group from "./players.js";
import { store } from "./store.js";

export const timeValue = () => Number(store.get("timeValue", 1_000_000)) || 0;
export const setTimeValue = v => store.set("timeValue", Math.max(0, Number(v) || 0));

/** Concrete steps [{ from, to, method }] (plus the route's fixed `before` steps) for an auto route. */
export function autoSteps(active, skillName, player = null) {
  const V = timeValue();
  const stat = (m, opts) => {
    const c = calc.compute(m, opts);
    const xpHr = c.xpHr[skillName] || 0;
    return { m, xpHr, req: m.reqs?.skills?.[skillName] || 1, gpXp: c.profitHr == null || !xpHr ? null : c.profitHr / xpHr };
  };
  const cands = active.candidates.map(id => METHODS.find(m => m.id === id)).filter(Boolean).map(m => stat(m))
    .filter(r => r.xpHr > 0 && r.gpXp != null);
  const { from, to } = active;
  const cuts = [...new Set([from, to, ...cands.map(r => r.req)])].filter(l => l >= from && l <= to).sort((a, b) => a - b);
  const score = r => -r.gpXp + V / r.xpHr;   // gp per XP, including the value of your time
  const out = [...(active.before || [])].map(s => ({ ...s }));
  for (let i = 0; i < cuts.length - 1; i++) {
    const lvl = cuts[i];
    // Methods with burnt food (Cooking) are worked out over this level range.
    const ok = cands.filter(r => r.req <= lvl).map(r => (r.m.burn ? stat(r.m, { from: lvl, to: cuts[i + 1] }) : r))
      .filter(r => r.xpHr > 0 && r.gpXp != null);
    const open = ok.filter(r => !unlocks.lockedInputs(r.m)?.length);
    const best = (open.length ? open : ok).sort((a, b) => score(a) - score(b))[0];
    if (!best) continue;
    const prev = out[out.length - 1];
    if (prev && prev.method === best.m.id && prev.to === lvl) prev.to = cuts[i + 1];
    else out.push({ from: lvl, to: cuts[i + 1], method: best.m.id });
  }
  return out.length > (active.before || []).length ? out : [...out, { from, to, method: active.candidates[0] }];
}

/** The steps of any route: fixed ones as they are, auto ones worked out live. */
export const stepsOf = (active, skillName, player) => (active.auto ? autoSteps(active, skillName, player) : active.route);

/** Quests a method needs that the player is known NOT to have done. */
export const missingQuests = (m, player) => (player ? (m.reqs?.quests || []).filter(q => group.questDone(player, q) === false) : []);

/**
 * Best method the player can do right now at this level (level ok, inputs unlocked, no missing quest),
 * chosen the way the route chooses: "auto" by gold + time cost, "cheap" by the fastest that doesn't
 * cost money, otherwise the fastest. rows = [{ m, xpHr, gpXp, req }].
 */
export function doableAlt(rows, level, player, mode) {
  const ok = rows.filter(r => r.m.routeAlt !== false && r.req <= level && r.gpXp != null && r.xpHr > 0
    && unlocks.lockedInputs(r.m)?.length === 0 && !missingQuests(r.m, player).length);
  const fastest = list => [...list].sort((a, b) => (b.xpHr - a.xpHr) || (b.gpXp - a.gpXp))[0];
  if (mode === "auto") { const V = timeValue(); return [...ok].sort((a, b) => (-a.gpXp + V / a.xpHr) - (-b.gpXp + V / b.xpHr))[0]; }
  if (mode === "cheap") return fastest(ok.filter(r => r.gpXp >= 0)) || fastest(ok);
  return fastest(ok);
}
