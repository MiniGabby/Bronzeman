// "What to do" on the Player page: the next quests in the Quest Helper plugin's Optimal Ironman order
// (data/quest-order.js), checked against a player's quests, diaries and levels from WikiSync.
import ORDER from "../../data/quest-order.js";
import * as group from "./players.js";

/** 2 = done, 1 = started, 0 = not started, null = the site can't tell. */
function stateOf(p, item) {
  if (item.type === "diary") {
    const v = group.diaryDone(p, item.diary);
    if (v == null) return null;
    if (v) return 2;
    const m = item.diary.match(/^(.+) (\w+)$/), prog = group.diaryProgress(p, m[1], m[2]);
    return prog && prog[0] > 0 ? 1 : 0;
  }
  if (item.type === "other") return null;
  return group.questState(p, item.name);
}

/** What still stands between the player and a step: skill levels and quests. */
function blockers(p, item) {
  const skills = Object.entries(item.skills || {}).filter(([s, l]) => group.level(p, s) < l)
    .map(([s, l]) => ({ skill: s, need: l, have: group.level(p, s), boostable: (item.boostable || []).includes(s) }));
  const quests = (item.quests || []).filter(q => group.questDone(p, q) === false);
  return { skills, quests };
}

/**
 * { total, done, steps: [{ item, state, skills, quests, ready }], untracked, train: [{ skill, need, have, for, boostable }] }
 * steps = everything not done yet, in order. untracked = steps the site can't check (skipped).
 * train = per skill, the highest level the next `ahead` steps need and the first step that needs it.
 * Returns null when the player has no WikiSync data.
 */
export function plan(p, ahead = 30) {
  if (!p.wikiQuests) return null;
  const all = ORDER.map(item => ({ item, state: stateOf(p, item) }));
  const untracked = all.filter(x => x.state == null).length;
  const steps = all.filter(x => x.state != null && x.state !== 2).map(x => {
    const b = blockers(p, x.item);
    return { ...x, ...b, ready: !b.skills.length && !b.quests.length };
  });
  const train = new Map();
  for (const st of steps.slice(0, ahead)) for (const s of st.skills) {
    const cur = train.get(s.skill);
    if (!cur) train.set(s.skill, { ...s, for: st.item.name });
    else if (s.need > cur.need) train.set(s.skill, { ...cur, need: s.need });
  }
  return { total: all.length - untracked, done: all.filter(x => x.state === 2).length, steps, untracked, train: [...train.values()] };
}
