// Looks up how to unlock an item (data/unlock-tips.js), with an automatic tip for unfinished potions.
import TIPS from "../../data/unlock-tips.js";

const byName = Object.fromEntries(Object.entries(TIPS).map(([k, v]) => [k.toLowerCase(), v]));

export function tipFor(name) {
  if (!name) return null;
  const key = name.toLowerCase();
  if (byName[key]) return byName[key];
  const unf = key.match(/^(.+) potion \(unf\)$/);
  if (unf) {
    const herb = unf[1] === "guam" ? "guam leaf" : unf[1] === "irit" ? "irit leaf" : unf[1] === "ranarr" ? "ranarr weed" : unf[1];
    const herbTip = byName[herb] ? ` Getting the ${herb}: ${byName[herb]}` : "";
    return `Make one yourself: use a clean ${herb} on a vial of water. Making it once unlocks it, and then you can buy the rest on the GE.${herbTip}`;
  }
  return null;
}
