// Hunter training methods used by the Hunter routes (data/skill-guides.js).
// Levels, XP per catch and rates from the wiki's Hunter training page and creature pages, 9 Oct 2026.
// Catches per hour are the wiki's XP per hour divided by the XP per catch, so they're estimates.
// Bird house runs are counted per DAY (per: "day", like farm runs); everything else per hour of play.
// What you catch is mostly dropped, so only chinchompas are counted as sold. Bird nests, drift net
// fish, salamanders, kebbit furs and Hunters' Rumours loot aren't counted.

const GUIDE = "https://oldschool.runescape.wiki/w/Hunter_training";
const BOX = "Box traps need part of Eagles' Peak (until you've spoken to Nickolaus). You can set 2 traps at first, 3 from level 40, 4 from 60 and 5 from 80; one more in the Wilderness.";

// A run is 4 bird houses on Fossil Island. XP per run from the wiki's bird house table.
const birdHouse = (id, name, log, hunter, crafting, hunterXp, craftXp) => ({
  id: `hunt-bird-houses-${id}`,
  name: `Bird house runs (${name} bird houses)`,
  tags: ["training"],
  guide: "https://oldschool.runescape.wiki/w/Bird_house_trapping",
  reqs: { skills: { Hunter: hunter, Crafting: crafting }, quests: ["Bone Voyage"], items: ["4 clockworks (you get them back)", "Hammer", "Chisel", "Digsite pendant (optional)"] },
  per: "day",
  action: "run",
  actionLabel: "Runs per day",
  actionsPerDay: 6,
  presets: [["6 runs a day", 6], ["3 runs a day", 3], ["12 runs a day", 12], ["Every 50 minutes, all day", 28]],
  inputs: [{ name: log, qty: 4 }, { name: "Potato seed", qty: 40 }],
  outputs: [],
  xp: { Hunter: hunterXp, Crafting: craftXp },
  note: `Almost no effort: a run takes a minute or two. Build 4 bird houses (a clockwork and one ${log.toLowerCase()} each, with a hammer and chisel), place them on the four spots on Fossil Island, fill each with 10 cheap seeds, and collect them 50 minutes or more later: ${hunterXp.toLocaleString("en-US")} Hunter XP per run. You get the clockworks back, so you only need four (make them from steel bars at a clockmaker's bench in your house, Crafting 8). The numbers are per day: 6 runs is one every couple of hours while you play. Bird nests aren't counted: they hold tree seeds, which the group needs to unlock saplings for Farming. Crafting XP counts only if you build the houses yourself.`
});

const active = (id, name, level, xpEach, xpHr, note, extra = {}) => {
  const perHour = extra.perHour || Math.round(xpHr / xpEach / 5) * 5;
  return {
    id: `hunt-${id}`,
    name,
    tags: extra.tags || ["training"],
    guide: extra.guide || GUIDE,
    reqs: { skills: { Hunter: level, ...(extra.skills || {}) }, ...(extra.quests ? { quests: extra.quests } : {}), items: extra.items || [] },
    action: extra.action || "catch",
    actionLabel: extra.actionLabel || "Catches per hour",
    actionsPerHour: perHour,
    presets: extra.presets || [["Steady", perHour], ["Relaxed", Math.round(perHour * 0.75 / 5) * 5]],
    inputs: extra.inputs || [],
    outputs: extra.outputs || [],
    xp: { Hunter: xpEach, ...(extra.xp || {}) },
    note
  };
};

const driftNet = (level, fishing, band, hunterXp, fishingXp) => active(`drift-nets-${level}`, `Drift net fishing (Hunter ${band})`, level, hunterXp, hunterXp * 1150,
  `Underwater on Fossil Island (Bone Voyage): set two drift nets on the anchors and chase the fish shoals into them. Trains Hunter and Fishing together: ${hunterXp} Hunter and ${fishingXp} Fishing XP per shoal at these levels (it keeps rising until both are 70). A net is full after 10 shoals, so you use about 115 nets an hour, which is the cost shown. Ceto charges 200 numulites a day to get in. A fishbowl helmet, diving apparatus and flippers make you much faster. The fish you can bank aren't counted.`,
  { skills: { Fishing: fishing }, quests: ["Bone Voyage"], items: ["Fishbowl helmet and diving apparatus", "Flippers (optional)", "Numulite"],
    guide: "https://oldschool.runescape.wiki/w/Drift_net_fishing", action: "shoal", actionLabel: "Fish shoals per hour",
    presets: [["Wiki pace", 1150], ["Steady", 1000], ["Relaxed", 800]],
    inputs: [{ name: "Drift net", qty: 0.1 }], xp: { Fishing: fishingXp } });

const monkeys = (level, band, xpHr) => active(`maniacal-monkeys-${level}`, `Maniacal monkeys (Hunter ${band})`, level, 1000, xpHr,
  `The AFK option: in Glough's Laboratory in Kruk's Dungeon on Ape Atoll (Monkey Madness II, with a Kruk monkey greegree). Sit on a stunted demonic gorilla, set a deadfall trap on a boulder with a banana as bait, and reset it every 25 to 30 seconds: 1,000 XP per monkey. About ${Math.round(xpHr / 1000)}K XP per hour at these levels, including some idle time. Bring baskets of bananas: an inventory lasts about 50 minutes.`,
  { quests: ["Monkey Madness II"], items: ["Kruk monkey greegree", "Baskets of bananas"], inputs: [{ name: "Banana", qty: 1 }] });

const blackChins = (level, band, xpHr) => {
  const wiki = Math.round(xpHr / 315 / 5) * 5, steady = Math.round(wiki * 0.75 / 5) * 5;
  return active(`black-chinchompas-${level}`, `Black chinchompas (Hunter ${band})`, level, 315, xpHr * 0.75,
    `WILDERNESS (level 32 to 36), and a well-known spot for player killers: bring only what you can lose, and bank the chinchompas often. The fastest Hunter XP from 73 and the best money in the skill: every catch is a black chinchompa to sell. Set your box traps (one extra in the Wilderness) in the Wilderness Hunter area and keep resetting them. The wiki's ${Math.round(xpHr / 1000)}K XP per hour at these levels is with tick manipulation and a lot of practice; "Steady" here is three quarters of that. ${BOX}`,
    { tags: ["money", "training"], quests: ["Eagles' Peak (started)"], items: ["Box traps", "Teleport out (glory or royal seed pod)", "Food"],
      guide: "https://oldschool.runescape.wiki/w/Black_chinchompa_(Hunter)",
      presets: [["Steady", steady], ["Tick manipulation (wiki)", wiki], ["Relaxed", Math.round(steady * 0.75 / 5) * 5]],
      outputs: [{ name: "Black chinchompa", qty: 1 }] });
};

export default [
  birdHouse("regular", "regular", "Logs", 5, 5, 448, 60),
  birdHouse("oak", "oak", "Oak logs", 14, 15, 672, 80),
  birdHouse("willow", "willow", "Willow logs", 24, 25, 896, 100),
  birdHouse("teak", "teak", "Teak logs", 34, 35, 1120, 120),
  birdHouse("maple", "maple", "Maple logs", 44, 45, 1476, 140),
  birdHouse("mahogany", "mahogany", "Mahogany logs", 49, 50, 1920, 160),
  birdHouse("yew", "yew", "Yew logs", 59, 60, 2448, 180),
  birdHouse("magic", "magic", "Magic logs", 74, 75, 3876, 200),
  birdHouse("redwood", "redwood", "Redwood logs", 89, 90, 4800, 220),

  active("feldip-weasels", "Tracking Feldip weasels", 7, 48, 13000,
    "In the Feldip Hunter area (Feldip Hills teleport scroll, or fairy ring AKS). Wield a noose wand, inspect a burrow, follow the tracks and attack the bush at the end: 48 XP per weasel, about 13K XP per hour. A ring of pursuit shows the whole trail at once. Only for a few levels.",
    { items: ["Noose wand", "Ring of pursuit (optional)"] }),
  active("ruby-harvests", "Ruby harvests and copper longtails", 15, 24, 20000,
    "In the Piscatoris Hunter area (fairy ring AKQ). Catch ruby harvest butterflies with a butterfly net and butterfly jars (24 XP, release them again) while two bird snares catch copper longtails (61.2 XP each). Together up to 20K XP per hour; the catches here are counted as butterflies.",
    { items: ["Butterfly net", "Butterfly jars", "2 bird snares"] }),
  active("red-crabs", "Trapping red crabs", 21, 64, 31000,
    "On The Pandemonium (far enough into the Pandemonium quest, Construction 10). Build two crab traps next to each other once (2 planks, 4 nails, 2 buckets, a hammer and a saw), bait them with fish offcuts and empty them: 64 XP per crab, about 31K XP per hour with two traps. There's a bank close by.",
    { skills: { Construction: 10 }, quests: ["Pandemonium"], items: ["Fish offcuts", "2 planks, 4 nails, 2 buckets (once)"] }),
  active("sapphire-glacialis", "Sapphire glacialis butterflies", 25, 34, 28500,
    "Butterflies in the Rellekka Hunter area (fairy ring DKS), in the Farming Guild and on Mons Gratia. Catch them with a butterfly net and jars and release them: 34 XP each, about 28K XP per hour. No quest needed. From 35 you can catch them barehanded, and snowy knights are in the same spots.",
    { items: ["Butterfly net", "Butterfly jars"] }),
  active("swamp-lizards", "Swamp lizards", 29, 152, 24000,
    "North-west of Slepe in Morytania (Priest in Peril). Set net traps on the young trees with a rope and a small fishing net each (both already unlocked) and drop the lizards: 152 XP each. Two traps give 20K to 28K XP per hour; with three traps from level 40 it's 40K to 45K (button above). Calmer than box traps.",
    { quests: ["Priest in Peril"], items: ["3 ropes", "3 small fishing nets"], presets: [["2 traps", 160], ["3 traps (Hunter 40)", 280]] }),
  active("embertailed-jerboas", "Embertailed jerboas", 39, 137, 50000,
    `At Locus Oasis in Varlamore (Children of the Sun; fairy ring AJP is right next to it). Box traps, 137 XP per jerboa: about 50K XP per hour with 3 traps from level 40. ${BOX}`,
    { quests: ["Children of the Sun", "Eagles' Peak (started)"], items: ["Box traps"] }),
  active("falconry-spotted", "Falconry: spotted kebbits", 43, 104, 65000,
    "In the Piscatoris falconry area (fairy ring AKQ, then east). Rent a gyr falcon for 500 coins with your weapon, shield and glove slots empty, send it at the spotted kebbits in the south-east corner, collect it and drop the fur: 104 XP each, 60K to 70K XP per hour. No quest needed. Bring a stamina or energy potion.",
    { items: ["500 coins", "Empty weapon, shield and glove slots"], guide: "https://oldschool.runescape.wiki/w/Falconry" }),
  active("falconry-dark", "Falconry: dark kebbits", 57, 132, 77000,
    "The same falconry area: from 57 your falcon can catch dark kebbits, 132 XP each, 75K to 80K XP per hour. Their spawns are along the edges of the area; the two closest together are on the west side.",
    { items: ["500 coins", "Empty weapon, shield and glove slots"], guide: "https://oldschool.runescape.wiki/w/Falconry" }),
  active("orange-salamanders", "Orange salamanders", 47, 224, 45000,
    "In the Uzer Hunter area in the desert (through the Shantay Pass and south-east over the bridge, or fairy ring DLQ). Net traps on the young trees, 224 XP each: 40K to 50K XP per hour with 3 traps. Slower than falconry but far less clicking. The desert heat drains you: bring waterskins and desert clothing.",
    { items: ["4 ropes", "4 small fishing nets", "Waterskins"] }),
  active("razor-backed-kebbits", "Tracking razor-backed kebbits", 49, 348.5, 100000,
    "In the Piscatoris Hunter area (fairy ring AKQ, just before the falconry). Wield a noose wand, inspect a burrow, follow the tracks and attack the bush: 348.5 XP per kebbit. The fastest Hunter XP from 49 to 73: about 100K XP per hour, and up to 130K with rings of pursuit (they show the whole trail) and stamina potions (button above). No quest needed. Use the eastern burrow every time.",
    { items: ["Noose wand", "Rings of pursuit and stamina potions (optional)"], presets: [["Steady", 285], ["Rings of pursuit and staminas", 375], ["Relaxed", 215]] }),
  active("red-salamanders", "Red salamanders", 59, 272, 82000,
    "South of the entrance to the Ourania Cave, west of Ardougne. Net traps on the young trees, 272 XP each. With 4 traps from level 60: 80K to 85K XP per hour, rising to about 100K at 67. Below 60, with 3 traps, only 55K to 60K (button above). Bring one rope and net more than you have traps, so you can reset before picking up.",
    { items: ["5 ropes", "5 small fishing nets"], presets: [["4 traps (Hunter 60)", 300], ["3 traps", 210], ["Hunter 67", 375]] }),
  active("red-chinchompas", "Red chinchompas", 63, 265, 60000,
    `Carnivorous chinchompas in the Feldip Hunter area (fairy ring AKS), in box traps: 265 XP each, and every one sells on the GE, so this is the first Hunter method that really earns money. The catches per hour here are an estimate: about 225 with 4 traps, more from level 80 with 5 traps and a higher success rate (button above). The better spots are the red chinchompa hunting ground (hard Western Provinces Diary) and Prifddinas. ${BOX}`,
    { tags: ["money", "training"], quests: ["Eagles' Peak (started)"], items: ["Box traps"], guide: "https://oldschool.runescape.wiki/w/Red_chinchompa_(Hunter)",
      presets: [["4 traps", 225], ["5 traps (Hunter 80)", 340], ["Relaxed", 170]], outputs: [{ name: "Red chinchompa", qty: 1 }] }),
  active("black-salamanders", "Black salamanders", 67, 319.2, 105000,
    "In the Bone Yard Hunter area in the WILDERNESS (burning amulet to the Chaos Temple and run north-east). Net traps, 319.2 XP each, and one trap more than usual because it's the Wilderness: 5 traps at 60. 90K to 115K XP per hour at 67, up to 140K at 79. Player killers rarely come here, but bring only ropes, nets and a teleport.",
    { items: ["6 ropes", "6 small fishing nets"] }),
  active("moonlight-moths", "Moonlight moths", 75, 84, 100000,
    "In the Earthbound Cavern in the ruins of Neypotzli in Varlamore (Children of the Sun), or in the Hunter Guild basement. Three moths spawn close together: catch them with a butterfly net (nets come from the supply crates there), 84 XP each. A lot of clicking, but upwards of 100K XP per hour, and more as you level.",
    { quests: ["Children of the Sun"], items: ["Butterfly net", "Butterfly jars"] }),

  driftNet(44, 47, "44–54", 52.3, 46.2),
  driftNet(55, 55, "55–69", 71.5, 56.3),
  driftNet(70, 70, "70–99", 101.5, 77),

  monkeys(60, "60–74", 55000),
  monkeys(75, "75–89", 78000),
  monkeys(90, "90–99", 100000),

  active("rumours-72", "Hunters' Rumours: expert (Hunter 72–90)", 72, 13300, 160000,
    "In the Hunter Guild in Varlamore (Children of the Sun). A guild hunter sends you after a creature; hunt it until it drops a rare part and hand that in for a big chunk of XP. About 160K XP per hour at 72, counted here as 12 rumours an hour (the XP per rumour includes the catches). No Wilderness and no tick manipulation, so the relaxed way to fast XP. The hunters' loot sacks aren't counted. Novice and adept rumours (46 and 57) are much slower.",
    { quests: ["Children of the Sun"], items: ["Traps for the creature you're sent after"], guide: "https://oldschool.runescape.wiki/w/Hunters%27_Rumours",
      action: "rumour", actionLabel: "Rumours per hour", perHour: 12, presets: [["Steady", 12], ["Relaxed", 9]] }),
  active("rumours-91", "Hunters' Rumours: master (Hunter 91–99)", 91, 16250, 195000,
    "Master rumours in the Hunter Guild from 91: about 195K XP per hour, rising to 250K at 99. Counted as 12 rumours an hour; the XP per rumour includes the catches. The hunters' loot sacks aren't counted.",
    { quests: ["Children of the Sun"], items: ["Traps for the creature you're sent after"], guide: "https://oldschool.runescape.wiki/w/Hunters%27_Rumours",
      action: "rumour", actionLabel: "Rumours per hour", perHour: 12, presets: [["Steady", 12], ["Hunter 99", 15], ["Relaxed", 9]] }),

  blackChins(73, "73–79", 145000),
  blackChins(80, "80–89", 167000),
  blackChins(90, "90–99", 197000)
];
