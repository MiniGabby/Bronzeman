// "Best of both" routes (auto: true in data/skill-guides.js): per level range, the method with the
// lowest total cost = gold spent + time × what your time is worth (stored as "timeValue").
// Candidates come from the route's list; methods with locked inputs are only used when nothing
// unlocked fits, and methods needing a quest the player hasn't done are skipped.
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
  const questOk = m => !player || !(m.reqs?.quests || []).some(q => group.questDone(player, q) === false);
  const cands = active.candidates.map(id => METHODS.find(m => m.id === id)).filter(Boolean).map(m => {
    const c = calc.compute(m);
    const xpHr = c.xpHr[skillName] || 0;
    return { m, xpHr, req: m.reqs?.skills?.[skillName] || 1, gpXp: c.profitHr == null || !xpHr ? null : c.profitHr / xpHr };
  }).filter(r => r.xpHr > 0 && r.gpXp != null && questOk(r.m));
  const { from, to } = active;
  const cuts = [...new Set([from, to, ...cands.map(r => r.req)])].filter(l => l >= from && l <= to).sort((a, b) => a - b);
  const score = r => -r.gpXp + V / r.xpHr;   // gp per XP, including the value of your time
  const out = [...(active.before || [])].map(s => ({ ...s }));
  for (let i = 0; i < cuts.length - 1; i++) {
    const lvl = cuts[i];
    const ok = cands.filter(r => r.req <= lvl);
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
