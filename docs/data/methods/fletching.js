// Fletching training methods used by the Fletching routes (data/skill-guides.js).
// Levels and XP checked on the wiki's Fletching page, 3 Oct 2026. Items by exact GE name.
// Rates: cutting a bow takes 3 ticks (about 1,700 per hour with banking), stringing about 2,400 per hour.
// Arrows and darts are made in sets (15 arrows, 10 darts) and are click-intensive: the rates
// below are steady clicking; the presets show what a relaxed pace or full focus gives.

const GUIDE = "https://oldschool.runescape.wiki/w/Pay-to-play_Fletching_training";
const BANK = "Any bank works; the Grand Exchange is the easiest because you can buy and sell right there.";

const cut = (id, name, level, log, bow, xp, shafts) => ({
  id: `fletch-${id}`,
  name: `Fletching ${name}`,
  tags: ["training"],
  guide: GUIDE,
  reqs: { skills: { Fletching: level }, items: ["Knife"] },
  action: shafts ? "log" : "bow",
  actionLabel: shafts ? "Logs per hour" : "Bows per hour",
  actionsPerHour: 1700,
  presets: [["Steady", 1700], ["Relaxed", 1300]],
  inputs: [{ name: log, qty: 1 }],
  outputs: [{ name: bow, qty: shafts || 1 }],
  xp: { Fletching: xp },
  note: shafts
    ? `Use a knife on the logs: ${shafts} arrow shafts per log. ${BANK} The shafts are worth more as headless arrows.`
    : `Use a knife on the logs. ${BANK} Unstrung bows sell on the GE, or string them for the same XP again.`
});

const string = (id, name, level, unstrung, bow, xp) => ({
  id: `fletch-${id}`,
  name: `Fletching ${name}`,
  tags: ["training"],
  guide: GUIDE,
  reqs: { skills: { Fletching: level } },
  action: "bow",
  actionLabel: "Bows per hour",
  actionsPerHour: 2400,
  presets: [["Steady", 2400], ["Relaxed", 1800]],
  inputs: [{ name: unstrung, qty: 1 }, { name: "Bow string", qty: 1 }],
  outputs: [{ name: bow, qty: 1 }],
  xp: { Fletching: xp },
  note: `Withdraw 14 unstrung bows and 14 bow strings and use one on the other. Same XP as cutting the bow. ${BANK}`
});

const arrows = (id, name, level, tips, arrow, xpEach, extra = {}) => ({
  id: `fletch-${id}`,
  name: `Fletching ${name}`,
  tags: ["training"],
  guide: GUIDE,
  reqs: { skills: { Fletching: level } },
  action: "set",
  actionLabel: "Sets of 15 per hour",
  actionsPerHour: 3000,
  presets: [["Steady", 3000], ["Relaxed", 2000], ["Full focus", 3600]],
  inputs: extra.inputs || [{ name: "Headless arrow", qty: 15 }, { name: tips, qty: 15 }],
  outputs: [{ name: arrow, qty: 15 }],
  xp: { Fletching: xpEach * 15 },
  note: `${extra.note ? extra.note + " " : ""}No bank trips: everything stacks, so you can do this anywhere, even while waiting at another skill. Click the items once per set of 15 (the make menu does 10 sets in a row).`
});

const darts = (id, name, level, tip, dart, xpEach) => ({
  id: `fletch-${id}`,
  name: `Fletching ${name}`,
  tags: ["training"],
  guide: GUIDE,
  reqs: { skills: { Fletching: level }, quests: ["The Tourist Trap"] },
  action: "set",
  actionLabel: "Sets of 10 per hour",
  actionsPerHour: 3000,
  presets: [["Steady", 3000], ["Relaxed", 2000], ["Full focus", 4500]],
  inputs: [{ name: tip, qty: 10 }, { name: "Feather", qty: 10 }],
  outputs: [{ name: dart, qty: 10 }],
  xp: { Fletching: xpEach * 10 },
  note: "Needs The Tourist Trap. Use the feathers on the dart tips: each click makes 10 darts, and how fast you click is your XP rate. Nothing to bank, so it works anywhere. Fastest Fletching XP in the game, but the higher darts cost a lot."
});

export default [
  cut("arrow-shafts", "arrow shafts", 1, "Logs", "Arrow shaft", 5, 15),
  arrows("headless-arrows", "headless arrows", 1, null, "Headless arrow", 1, {
    inputs: [{ name: "Arrow shaft", qty: 15 }, { name: "Feather", qty: 15 }],
    note: "Feathers on arrow shafts. Cheap XP for the first levels."
  }),
  arrows("bronze-arrows", "bronze arrows", 1, "Bronze arrowtips", "Bronze arrow", 1.3),
  arrows("iron-arrows", "iron arrows", 15, "Iron arrowtips", "Iron arrow", 2.5),
  arrows("steel-arrows", "steel arrows", 30, "Steel arrowtips", "Steel arrow", 5),
  arrows("mithril-arrows", "mithril arrows", 45, "Mithril arrowtips", "Mithril arrow", 7.5),
  arrows("adamant-arrows", "adamant arrows", 60, "Adamant arrowtips", "Adamant arrow", 10),
  arrows("rune-arrows", "rune arrows", 75, "Rune arrowtips", "Rune arrow", 12.5),

  darts("bronze-darts", "bronze darts", 10, "Bronze dart tip", "Bronze dart", 1.8),
  darts("iron-darts", "iron darts", 22, "Iron dart tip", "Iron dart", 3.8),
  darts("steel-darts", "steel darts", 37, "Steel dart tip", "Steel dart", 7.5),
  darts("mithril-darts", "mithril darts", 52, "Mithril dart tip", "Mithril dart", 11.2),
  darts("adamant-darts", "adamant darts", 67, "Adamant dart tip", "Adamant dart", 15),
  darts("rune-darts", "rune darts", 81, "Rune dart tip", "Rune dart", 18.8),

  cut("shortbows", "shortbows (u)", 5, "Logs", "Shortbow (u)", 5),
  cut("longbows", "longbows (u)", 10, "Logs", "Longbow (u)", 10),
  cut("oak-shortbows", "oak shortbows (u)", 20, "Oak logs", "Oak shortbow (u)", 16.5),
  cut("oak-longbows", "oak longbows (u)", 25, "Oak logs", "Oak longbow (u)", 25),
  cut("willow-shortbows", "willow shortbows (u)", 35, "Willow logs", "Willow shortbow (u)", 33.3),
  cut("willow-longbows", "willow longbows (u)", 40, "Willow logs", "Willow longbow (u)", 41.5),
  cut("maple-shortbows", "maple shortbows (u)", 50, "Maple logs", "Maple shortbow (u)", 50),
  cut("maple-longbows", "maple longbows (u)", 55, "Maple logs", "Maple longbow (u)", 58.3),
  cut("yew-shortbows", "yew shortbows (u)", 65, "Yew logs", "Yew shortbow (u)", 67.5),
  cut("yew-longbows", "yew longbows (u)", 70, "Yew logs", "Yew longbow (u)", 75),
  cut("magic-shortbows", "magic shortbows (u)", 80, "Magic logs", "Magic shortbow (u)", 83.3),
  cut("magic-longbows", "magic longbows (u)", 85, "Magic logs", "Magic longbow (u)", 91.5),

  string("string-oak-longbows", "stringing oak longbows", 25, "Oak longbow (u)", "Oak longbow", 25),
  string("string-willow-longbows", "stringing willow longbows", 40, "Willow longbow (u)", "Willow longbow", 41.5),
  string("string-maple-longbows", "stringing maple longbows", 55, "Maple longbow (u)", "Maple longbow", 58.3),
  string("string-yew-longbows", "stringing yew longbows", 70, "Yew longbow (u)", "Yew longbow", 75),
  string("string-magic-longbows", "stringing magic longbows", 85, "Magic longbow (u)", "Magic longbow", 91.5)
];
