// Game constants: the skill list (in in-game skills-tab order) and the XP curve.
export const SKILLS = [
  "Attack", "Hitpoints", "Mining", "Strength", "Agility", "Smithing",
  "Defence", "Herblore", "Fishing", "Ranged", "Thieving", "Cooking",
  "Prayer", "Crafting", "Firemaking", "Magic", "Fletching", "Woodcutting",
  "Runecraft", "Slayer", "Farming", "Construction", "Hunter", "Sailing"
].map(name => ({ name, key: name === "Runecraft" ? "runecrafting" : name.toLowerCase() }));

export const skillByKey = key => SKILLS.find(s => s.key === key);
export const skillByName = name => SKILLS.find(s => s.name.toLowerCase() === String(name).toLowerCase());

const XP_TABLE = [0, 0];
for (let lvl = 1, pts = 0; lvl < 99; lvl++) {
  pts += Math.floor(lvl + 300 * 2 ** (lvl / 7));
  XP_TABLE[lvl + 1] = Math.floor(pts / 4);
}

/** Total XP needed to reach a level (1–99). */
export const xpForLevel = level => XP_TABLE[Math.max(1, Math.min(99, Math.floor(level)))];

/** Level for a given amount of XP. */
export function levelForXp(xp) {
  let lvl = 1;
  while (lvl < 99 && XP_TABLE[lvl + 1] <= xp) lvl++;
  return lvl;
}
