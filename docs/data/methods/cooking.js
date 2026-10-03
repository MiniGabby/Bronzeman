// Cooking training methods used by the Cooking routes (data/skill-guides.js).
// Levels and XP checked on the wiki's Cooking page, 3 Oct 2026. Items by exact GE name.
// Fish: about 1,350 per hour on a range next to a bank (Rogues' Den or Hosidius kitchen).
// Burnt food is NOT counted: at low levels you burn a lot of each new fish, so the real cost per
// XP is a bit higher until you're about 10 to 20 levels above the fish.

const GUIDE = "https://oldschool.runescape.wiki/w/Pay-to-play_Cooking_training";
const RANGE = "Cook on the fire in the Rogues' Den (Burthorpe), next to the banker, or on the range in the Hosidius kitchen (burns a bit less). Cooking gauntlets (Family Crest) burn fewer lobsters, swordfish, monkfish, sharks and anglerfish.";

const fish = (id, name, level, raw, cooked, xp, extra = {}) => ({
  id: `cook-${id}`,
  name: `Cooking ${name}`,
  tags: ["training"],
  guide: GUIDE,
  reqs: { skills: { Cooking: level }, ...(extra.quests ? { quests: extra.quests } : {}) },
  action: "fish",
  actionLabel: "Fish per hour",
  actionsPerHour: extra.perHour || 1350,
  presets: extra.presets || [["Steady", 1350], ["Relaxed", 1100]],
  inputs: [{ name: raw, qty: 1 }],
  outputs: [{ name: cooked, qty: 1 }],
  xp: { Cooking: xp },
  note: `${extra.note ? extra.note + " " : ""}${RANGE}`
});

export default [
  fish("shrimps", "shrimps", 1, "Raw shrimps", "Shrimps", 30),
  fish("sardines", "sardines", 1, "Raw sardine", "Sardine", 40),
  fish("herring", "herring", 5, "Raw herring", "Herring", 50),
  fish("trout", "trout", 15, "Raw trout", "Trout", 70),
  fish("pike", "pike", 20, "Raw pike", "Pike", 80),
  fish("salmon", "salmon", 25, "Raw salmon", "Salmon", 90),
  fish("tuna", "tuna", 30, "Raw tuna", "Tuna", 100),
  fish("lobsters", "lobsters", 40, "Raw lobster", "Lobster", 120),
  fish("bass", "bass", 43, "Raw bass", "Bass", 130),
  fish("swordfish", "swordfish", 45, "Raw swordfish", "Swordfish", 140),
  fish("monkfish", "monkfish", 62, "Raw monkfish", "Monkfish", 150),
  fish("karambwans", "karambwans", 30, "Raw karambwan", "Cooked karambwan", 190, {
    quests: ["Tai Bwo Wannai Trio"],
    perHour: 1350,
    presets: [["Normal", 1350], ["1-tick (hard)", 4000]],
    note: "You need Tai Bwo Wannai Trio to cook them properly. With 1-tick cooking (cook one, drop to the next in the same tick) you can do about 4,000 an hour, the fastest Cooking XP there is."
  }),
  fish("sharks", "sharks", 80, "Raw shark", "Shark", 210, { note: "You still burn some sharks until 99 without cooking gauntlets." }),
  fish("anglerfish", "anglerfish", 84, "Raw anglerfish", "Anglerfish", 230),

  {
    id: "cook-jugs-of-wine",
    name: "Cooking jugs of wine",
    tags: ["training"],
    guide: GUIDE,
    reqs: { skills: { Cooking: 35 } },
    action: "wine",
    actionLabel: "Wines per hour",
    actionsPerHour: 2400,
    presets: [["Steady", 2400], ["Relaxed", 1800]],
    inputs: [{ name: "Grapes", qty: 1 }, { name: "Jug of water", qty: 1 }],
    outputs: [{ name: "Jug of wine", qty: 1 }],
    xp: { Cooking: 200 },
    note: "Use grapes on jugs of water (14 of each) at any bank, no range needed. The XP comes when the wine has fermented (about 12 seconds), so keep going. Below level 68 some jugs turn into bad wine (no XP); from 68 every jug works. Around 450K XP per hour: by far the fastest way from 35."
  }
];
