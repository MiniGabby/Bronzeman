// Prayer training methods used by the Prayer routes (data/skill-guides.js).
// XP per bone and rates from the wiki's Pay-to-play Prayer training page, 10 Oct 2026.
// Prayer is coins in, XP out: the only question is which bone and where.
//   - Burying: the plain XP per bone. The 1,500 an hour is an estimate.
//   - Gilded altar (two burners lit): 3.5x the XP, 2,550 bones an hour when you use each bone by hand.
//   - Chaos Temple (level 38 Wilderness): 3.5x the XP and half the bones aren't used up, so every bone
//     you buy counts double; 2,000 offers an hour (the wiki's rate when you go there with one inventory
//     at a time and don't mind dying).

const GUIDE = "https://oldschool.runescape.wiki/w/Pay-to-play_Prayer_training";

// [id, name on the site, item name, XP when buried, Prayer level needed]
const BONES = [
  ["bones", "bones", "Bones", 4.5, 1],
  ["big-bones", "big bones", "Big bones", 15, 1],
  ["babydragon-bones", "babydragon bones", "Babydragon bones", 30, 1],
  ["wyrm-bones", "wyrm bones", "Wyrm bones", 50, 1],
  ["dragon-bones", "dragon bones", "Dragon bones", 72, 1],
  ["wyvern-bones", "wyvern bones", "Wyvern bones", 72, 1],
  ["drake-bones", "drake bones", "Drake bones", 80, 1],
  ["lava-dragon-bones", "lava dragon bones", "Lava dragon bones", 85, 1],
  ["hydra-bones", "hydra bones", "Hydra bones", 110, 1],
  ["dagannoth-bones", "dagannoth bones", "Dagannoth bones", 125, 1],
  ["superior-dragon-bones", "superior dragon bones", "Superior dragon bones", 150, 70]
];

const base = (id, name, level, item, qty, xp, perHour, presets, label, note, extra = {}) => ({
  id: `pray-${id}`,
  name,
  tags: ["training"],
  guide: extra.guide || GUIDE,
  reqs: { skills: { Prayer: level }, items: extra.items || [] },
  action: "bone",
  actionLabel: label,
  actionsPerHour: perHour,
  presets,
  inputs: [{ name: item, qty }, ...(extra.inputs || [])],
  outputs: [],
  ...(extra.fees ? { fees: extra.fees } : {}),
  xp: { Prayer: Math.round(xp * 10) / 10 },
  note
});

const bury = ([id, name, item, xp, level]) => base(`bury-${id}`, `Burying ${name}`, level, item, 1, xp, 1500,
  [["Steady", 1500], ["Relaxed", 1000]], "Bones buried per hour",
  `Bury them straight from your inventory next to a bank: ${xp} XP each. No requirements and no risk, but an altar gives three and a half times as much XP from the same bone, so only do this with cheap bones or for the very first levels. The bones per hour is an estimate.`);

const gilded = ([id, name, item, xp, level]) => base(`altar-${id}`, `Gilded altar: ${name}`, level, item, 1, xp * 3.5, 2550,
  [["By hand", 2550], ["Left to itself", 1070], ["Relaxed", 1800]], "Bones offered per hour",
  `Use the bones on a gilded altar in a house with both incense burners lit: ${Math.round(xp * 35) / 10} XP per bone instead of ${xp}. The fastest Prayer XP there is. You don't need your own altar (Construction 75): on world 330 players open their house at the Rimmington portal. Bring the bones noted and let Phials in the Rimmington general store un-note them for 5 coins each, which is counted here. Using each bone on the altar by hand gives 2,550 an hour; if you let your character go through the inventory it's about 1,070.`,
  { fees: [{ label: "Phials un-notes the bones (5 coins each)", each: 5 }], items: ["A gilded altar with both burners lit (world 330, Rimmington)"] });

const chaos = ([id, name, item, xp, level]) => base(`chaos-${id}`, `Chaos Temple altar: ${name}`, level, item, 0.5, xp * 3.5, 2000,
  [["One inventory at a time", 2000], ["Noted bones (risky)", 3400], ["Relaxed", 1500]], "Bones offered per hour",
  `The altar in the Chaos Temple in LEVEL 38 WILDERNESS, a spot player killers visit a lot. The same ${Math.round(xp * 35) / 10} XP per bone as a gilded altar, and half the time the bone isn't used up, so you need only half as many: the cheapest Prayer XP in the game. Bring nothing but an inventory of bones; when they're gone, die to get back to a bank fast (that's the 2,000 an hour). Bringing noted bones and paying the Elder Chaos druid 50 coins each to un-note them is faster, but you can lose the lot.`,
  { items: ["Only bones: you can die here"], guide: "https://oldschool.runescape.wiki/w/Chaos_Temple_(hut)" });

export default [
  ...BONES.slice(0, 2).map(bury),
  ...BONES.slice(1).map(gilded),
  ...BONES.slice(1).map(chaos)
];
