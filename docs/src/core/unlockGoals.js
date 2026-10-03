// Unlock goals: items nobody in the group has unlocked yet, ranked by how many methods they hold back.
// One unlock opens GE buying for all six of us, so these are the best "first ones" to go and get.
import METHODS from "../../data/methods/index.js";
import GUIDES from "../../data/skill-guides.js";
import { REQS } from "../../data/unlock-tips.js";
import { tipFor } from "./unlockTips.js";
import * as unlocks from "./unlocks.js";
import * as group from "./players.js";

const reqsByName = Object.fromEntries(Object.entries(REQS).map(([k, v]) => [k.toLowerCase(), v]));

/** Skill levels needed to get one, or null when unknown. Unfinished potions use their herb. */
export function reqsFor(name) {
  const key = String(name).toLowerCase();
  if (reqsByName[key]) return reqsByName[key];
  const unf = key.match(/^(.+) potion \(unf\)$/);
  if (unf) return reqsByName[unf[1]] || null;
  return null;
}

/** Route steps (skill, level range) that recommend a method. */
function routeSteps(methodId) {
  const out = [];
  for (const [skill, g] of Object.entries(GUIDES)) {
    for (const r of g.routes || [{ route: g.route }]) for (const st of r.route) if (st.method === methodId) out.push({ skill, from: st.from, to: st.to });
  }
  return out;
}

/**
 * [{ name, id, methods: [method], steps: n, tip, reqs, who: [{ p, gap, need }] }], most useful first.
 * who is sorted closest first; gap 0 = can get it now.
 */
export function goals() {
  if (!unlocks.loaded()) return null;
  const byItem = new Map();
  for (const m of METHODS) {
    for (const x of unlocks.lockedInputs(m) || []) {
      const k = x.name;
      if (!byItem.has(k)) byItem.set(k, { name: k, id: x.id, methods: [], steps: 0 });
      const e = byItem.get(k);
      e.methods.push(m);
      e.steps += routeSteps(m.id).length;
    }
  }
  const list = [...byItem.values()].map(e => {
    const reqs = reqsFor(e.name);
    const who = reqs && group.loaded() ? group.all().filter(p => p.skills).map(p => {
      const need = Object.entries(reqs).filter(([s, l]) => group.level(p, s) < l).map(([s, l]) => ({ s, have: group.level(p, s), l }));
      return { p, gap: Math.max(0, ...need.map(n => n.l - n.have)), need };
    }).sort((a, b) => a.gap - b.gap) : [];
    return { ...e, tip: tipFor(e.name), reqs, who };
  });
  // Most methods first, then route steps, then the easiest to get.
  return list.sort((a, b) => (b.methods.length - a.methods.length) || (b.steps - a.steps) || ((a.who[0]?.gap ?? 99) - (b.who[0]?.gap ?? 99)));
}
