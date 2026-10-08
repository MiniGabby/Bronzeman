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
  // Saplings: grow one yourself from the seed.
  const sap = key.match(/^(.+) sapling$/);
  if (sap) {
    const seed = { oak: "an acorn", apple: "an apple tree seed", banana: "a banana tree seed", orange: "an orange tree seed", curry: "a curry tree seed",
      papaya: "a papaya tree seed", palm: "a palm tree seed", calquat: "a calquat tree seed", pineapple: "a pineapple seed" }[sap[1]] || `a ${sap[1]} seed`;
    return `Grow one yourself: use ${seed} on a filled plant pot (with a gardening trowel in your inventory), water it, and a few minutes later the seedling is a sapling. That one sapling unlocks it. Tree seeds come from bird nests (bird house runs), Wintertodt crates and farming contracts in the Farming Guild.`;
  }
  // Baskets of fruit, e.g. "Apples(5)": fill a basket yourself.
  const basket = key.match(/^(.+)\(5\)$/);
  if (basket) return `Fill a basket yourself: use 5 ${basket[1]} on an empty basket (farming shops sell baskets, e.g. Sarah at the farm south of Falador).`;
  // Herb seeds: master farmers drop all of them.
  if (/^(guam|marrentill|tarromin|harralander|ranarr|toadflax|irit|avantoe|kwuarm|snapdragon|cadantine|lantadyme|dwarf weed|torstol) seed$/.test(key))
    return "Pickpocket master farmers (Thieving 38): they drop every herb seed. One seed is enough to unlock it.";
  return null;
}
