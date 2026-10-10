// Farming training methods used by the Farming routes (data/skill-guides.js).
// Levels, XP, payments and growth times from the wiki's Pay-to-play Farming training page, 8 Oct 2026.
// Farming is done in runs: you plant, do something else while it grows, and come back. So most methods
// here are counted per DAY (per: "day", actionsPerDay), not per hour: a run takes 5 to 10 minutes of play.
//   - Tree runs: every tree patch you can use gets the best sapling for your level, and the farmer is paid
//     to look after it (so it can't die) and 200 coins to remove the old tree. XP per tree = planting +
//     checking its health (+ picking the fruit for fruit trees).
//   - Herb runs: one seed and one bucket of supercompost per patch. The 6.5 herbs per patch is an estimate
//     (the wiki counts on 8.8 with ultracompost and magic secateurs).
//   - Tithe Farm and bagged plants are the only methods you can keep doing: those are per hour of play.

const GUIDE = "https://oldschool.runescape.wiki/w/Pay-to-play_Farming_training";
const RUNS = "https://oldschool.runescape.wiki/w/Farming_runs";

// kind: which patches it grows in. pay: what the farmer wants to look after it. fruit: what you pick (6 per tree).
const TREES = {
  oak:         { kind: "tree",  name: "oak",         sapling: "Oak sapling",         pay: ["Tomatoes(5)", 1],        xp: 481.3 },
  willow:      { kind: "tree",  name: "willow",      sapling: "Willow sapling",      pay: ["Apples(5)", 1],          xp: 1481.5 },
  maple:       { kind: "tree",  name: "maple",       sapling: "Maple sapling",       pay: ["Oranges(5)", 1],         xp: 3448.4 },
  yew:         { kind: "tree",  name: "yew",         sapling: "Yew sapling",         pay: ["Cactus spine", 10],      xp: 7150.9 },
  magic:       { kind: "tree",  name: "magic",       sapling: "Magic sapling",       pay: ["Coconut", 25],           xp: 13913.8 },
  apple:       { kind: "fruit", name: "apple",       sapling: "Apple sapling",       pay: ["Sweetcorn", 9],          xp: 1272.5,  fruit: "Cooking apple" },
  banana:      { kind: "fruit", name: "banana",      sapling: "Banana sapling",      pay: ["Apples(5)", 4],          xp: 1841.5,  fruit: "Banana" },
  orange:      { kind: "fruit", name: "orange",      sapling: "Orange sapling",      pay: ["Strawberries(5)", 3],    xp: 2586.7,  fruit: "Orange" },
  curry:       { kind: "fruit", name: "curry",       sapling: "Curry sapling",       pay: ["Bananas(5)", 5],         xp: 3036.9,  fruit: "Curry leaf" },
  pineapple:   { kind: "fruit", name: "pineapple",   sapling: "Pineapple sapling",   pay: ["Watermelon", 10],        xp: 4791.7,  fruit: "Pineapple" },
  papaya:      { kind: "fruit", name: "papaya",      sapling: "Papaya sapling",      pay: ["Pineapple", 10],         xp: 6380.4,  fruit: "Papaya fruit" },
  palm:        { kind: "fruit", name: "palm",        sapling: "Palm sapling",        pay: ["Papaya fruit", 15],      xp: 10509.6, fruit: "Coconut" },
  dragonfruit: { kind: "fruit", name: "dragonfruit", sapling: "Dragonfruit sapling", pay: ["Coconut", 15],           xp: 17825,   fruit: "Dragonfruit" },
  calquat:     { kind: "other", name: "calquat",     sapling: "Calquat sapling",     pay: ["Poison ivy berries", 8], xp: 12516.5, fruit: "Calquat fruit" },
  celastrus:   { kind: "other", name: "celastrus",   sapling: "Celastrus sapling",   pay: ["Potato cactus", 8],      xp: 14404.5 },
  teak:        { kind: "hard",  name: "teak",        sapling: "Teak sapling",        pay: ["Limpwurt root", 15],     xp: 7325 },
  mahogany:    { kind: "hard",  name: "mahogany",    sapling: "Mahogany sapling",    pay: ["Yanillian hops", 25],    xp: 15783 }
};

const WHERE = {
  tree: "Tree patches: Lumbridge, Varrock, Falador Park, Taverley and the Tree Gnome Stronghold (no requirements), and from Farming 65 a sixth in the west wing of the Farming Guild.",
  fruit: "Fruit tree patches: Tree Gnome Stronghold, Tree Gnome Village, Catherby and Brimhaven (no requirements), and from Farming 85 a fifth in the north wing of the Farming Guild. More in Lletya and Varlamore.",
  other: "The calquat patch is north of Tai Bwo Wannai on Karamja; the celastrus patch is in the Farming Guild (85)."
};

// Adds up the same item across the trees of a run.
const merge = list => Object.entries(list.reduce((o, [name, qty]) => ((o[name] = (o[name] || 0) + qty), o), {})).map(([name, qty]) => ({ name, qty }));

// One farm run a day: parts = [[how many, tree], ...].
const run = (id, level, upTo, parts, extra = {}) => {
  const list = parts.map(([n, key]) => [n, TREES[key]]);
  const count = list.reduce((a, [n]) => a + n, 0);
  const kinds = [...new Set(list.map(([, t]) => t.kind))];
  return {
    id: `farm-${id}`,
    name: `${extra.label || "Tree run"}: ${list.map(([n, t]) => `${n} ${t.name}`).join(" + ")} (Farming ${level}–${upTo})`,
    tags: ["training"],
    guide: RUNS,
    reqs: { skills: { Farming: level }, items: ["Spade", "Teleports to the patches"] },
    per: "day",
    action: "run",
    actionLabel: "Runs per day",
    actionsPerDay: 1,
    presets: [["Every day", 1], ["Every other day", 0.5], ["Twice a week", 0.29]],
    inputs: merge(list.flatMap(([n, t]) => [[t.sapling, n], [t.pay[0], t.pay[1] * n]])),
    outputs: merge(list.filter(([, t]) => t.fruit).map(([n, t]) => [t.fruit, 6 * n])),
    fees: [{ label: `Farmers remove the old trees (200 coins × ${count})`, each: 200 * count }],
    xp: { Farming: Math.round(list.reduce((a, [n, t]) => a + n * t.xp, 0) * 10) / 10 },
    note: `One run a day: at every patch, check the health of the grown tree (that's where the XP is), pay the farmer 200 coins to clear it, plant the new sapling and pay the farmer to look after it, so it can't die. ${list.map(([n, t]) => `${t.name}: ${t.xp.toLocaleString("en-US")} XP each, the farmer wants ${t.pay[1]} ${t.pay[0]}`).join("; ")}. ${kinds.map(k => WHERE[k]).filter(Boolean).join(" ")}${kinds.includes("fruit") ? " Fruit trees take 16 hours to grow, so once a day is all you can do; pick the 6 fruit before you clear the tree (they're counted as sold here)." : " These trees grow in a few hours, so you could do them twice a day."} A run takes 5 to 10 minutes of play: the numbers are per day, not per hour. Use fewer patches and the cost and XP drop by the same share.${extra.note ? ` ${extra.note}` : ""}`
  };
};

const hardwood = (key, level, perDay, grow) => {
  const t = TREES[key];
  return {
    id: `farm-${key}-trees`,
    name: `Hardwood trees: ${t.name} (Fossil Island)`,
    tags: ["training"],
    guide: RUNS,
    reqs: { skills: { Farming: level }, quests: ["Bone Voyage"], items: ["Spade", "Digsite pendant (optional)"] },
    per: "day",
    action: "tree",
    actionLabel: "Trees per day",
    actionsPerDay: perDay,
    presets: [["3 trees, as soon as they're grown", perDay], ["3 trees once a week", 0.43]],
    inputs: [{ name: t.sapling, qty: 1 }, { name: t.pay[0], qty: t.pay[1] }],
    outputs: [],
    fees: [{ label: "Farmer removes the old tree", each: 200 }],
    xp: { Farming: t.xp },
    note: `An extra on top of your tree runs: the three hardwood patches on Fossil Island (after Bone Voyage). ${t.name[0].toUpperCase() + t.name.slice(1)} trees take ${grow} to grow and give ${t.xp.toLocaleString("en-US")} XP each when you check them; the farmer wants ${t.pay[1]} ${t.pay[0]} to look after one. Three trees every few days costs very little time for a lot of XP.`
  };
};

// Herbs: level, XP for planting, XP per herb picked.
const YIELD = 6.5;
const herb = (id, name, level, plantXp, pickXp, seed, grimy) => ({
  id: `farm-herb-${id}`,
  name: `Herb runs: ${name}`,
  tags: ["money", "training"],
  guide: "https://oldschool.runescape.wiki/w/Farming_runs#Herb_run",
  reqs: { skills: { Farming: level }, items: ["Seed dibber", "Spade", "Rake", "Magic secateurs (optional)"] },
  per: "day",
  action: "patch",
  actionLabel: "Herb patches per day",
  actionsPerDay: 10,
  presets: [["5 patches, twice a day", 10], ["5 patches, once a day", 5], ["5 patches, 4 times a day", 20], ["8 patches, twice a day", 16]],
  inputs: [{ name: seed, qty: 1 }, { name: "Supercompost", qty: 1 }],
  outputs: [{ name: grimy, qty: YIELD }],
  xp: { Farming: Math.round((plantXp + 26 + YIELD * pickXp) * 10) / 10 },
  note: `Herbs take 80 minutes to grow, so you can do a run whenever you think of it; twice a day is counted here. Per patch: put supercompost on it, plant one seed, and come back to pick about ${YIELD} herbs (an estimate: 5 to 10 is normal, and now and then a patch dies). ${plantXp} XP for planting, 26 for the supercompost and ${pickXp} per herb. Five patches are easy to reach: Falador (south of the city), Catherby, Ardougne (north), Hosidius, and Morytania west of Port Phasmatys (Priest in Peril). More: the Farming Guild (65), Troll Stronghold (My Arm's Big Adventure) and Varlamore (Children of the Sun). Ultracompost (2 volcanic ash on a bucket of supercompost) and magic secateurs (Fairytale I) each add about half a herb per patch. A run takes about 5 minutes of play: the numbers are per day.`
});

const tithe = (level, band, fruit, xpHr) => ({
  id: `farm-tithe-${level}`,
  name: `Tithe Farm (${fruit}, Farming ${band})`,
  tags: ["training"],
  guide: "https://oldschool.runescape.wiki/w/Tithe_Farm/Strategies",
  reqs: { skills: { Farming: level }, items: ["Seed dibber", "Spade", "6 to 8 watering cans"] },
  action: "sack",
  actionLabel: "Sacks of 100 fruit per hour",
  actionsPerHour: 3,
  presets: [["Steady", 3], ["Learning", 2]],
  inputs: [],
  outputs: [],
  xp: { Farming: Math.round(xpHr / 3) },
  note: `A minigame in Hosidius, and the only way to train Farming for hours on end without waiting. Take ${fruit} seeds from the table (free), plant them, water every plant three times before it wilts, harvest, and put the fruit in the sacks: 100 fruit takes about 19 minutes. About ${Math.round(xpHr / 1000)}K XP per hour with this seed, once you have the rhythm (worked back from the wiki's 90K to 100K per hour with the best seed, so an estimate). It costs nothing, and the points buy the farmer's outfit (2.5% more Farming XP), the seed box and the herb sack. Far slower per minute of play than tree runs, so do it next to them, not instead.`
});

export default [
  {
    id: "farm-bagged-plants",
    name: "Bagged plants in your house garden",
    tags: ["training"],
    guide: GUIDE,
    reqs: { skills: { Farming: 1 }, items: ["A house with a garden", "Watering cans"] },
    action: "plant",
    actionLabel: "Plants per hour",
    actionsPerHour: 500,
    presets: [["Steady", 500], ["Relaxed", 350]],
    inputs: [],
    outputs: [],
    fees: [{ label: "Bagged plant 1 from the garden supplier (1,000 coins each)", each: 1000 }],
    xp: { Farming: 31 },
    note: "The fastest way through the first levels, and the only one without waiting: buy bagged plants (1,000 coins each) from the garden supplier in Falador Park, plant one in the plant space in your house garden with a full watering can, remove it, and plant the next. 31 XP each: 78 plants (78K coins) take you from level 1 to 15. Hop worlds when the shop runs out. The plants per hour is an estimate. Cheaper but slower: grow potatoes, onions and cabbages in the allotments, or do the Farming quests first."
  },

  run("run-15", 15, 26, [[5, "oak"]]),
  run("run-27", 27, 29, [[5, "oak"], [4, "apple"]]),
  run("run-30", 30, 32, [[5, "willow"], [4, "apple"]]),
  run("run-33", 33, 38, [[5, "willow"], [4, "banana"]]),
  run("run-39", 39, 41, [[5, "willow"], [4, "orange"]]),
  run("run-42", 42, 44, [[5, "willow"], [4, "curry"]]),
  run("run-45", 45, 50, [[5, "maple"], [4, "curry"]]),
  run("run-51", 51, 56, [[5, "maple"], [4, "pineapple"]]),
  run("run-57", 57, 59, [[5, "maple"], [4, "papaya"]]),
  run("run-60", 60, 64, [[5, "yew"], [4, "papaya"]]),
  // From 65 the Farming Guild's tree patch is counted (6 trees), from 85 its fruit tree patch too (5 fruit trees).
  run("run-65", 65, 67, [[6, "yew"], [4, "papaya"]]),
  run("run-68", 68, 71, [[6, "yew"], [4, "palm"]]),
  run("run-72", 72, 74, [[6, "yew"], [4, "palm"], [1, "calquat"]]),
  run("run-75", 75, 80, [[6, "magic"], [4, "palm"], [1, "calquat"]]),
  run("run-81", 81, 84, [[6, "magic"], [4, "dragonfruit"], [1, "calquat"]]),
  run("run-85", 85, 99, [[6, "magic"], [5, "dragonfruit"], [1, "calquat"], [1, "celastrus"]],
    { note: "The celastrus bark you can harvest isn't counted. From 90 a redwood tree in the Farming Guild adds 22,680 XP every 4 to 5 days." }),

  run("fruit-27", 27, 32, [[4, "apple"]], { label: "Fruit tree run" }),
  run("fruit-33", 33, 38, [[4, "banana"]], { label: "Fruit tree run" }),
  run("fruit-39", 39, 41, [[4, "orange"]], { label: "Fruit tree run" }),
  run("fruit-42", 42, 50, [[4, "curry"]], { label: "Fruit tree run" }),
  run("fruit-51", 51, 56, [[4, "pineapple"]], { label: "Fruit tree run" }),
  run("fruit-57", 57, 67, [[4, "papaya"]], { label: "Fruit tree run" }),
  run("fruit-68", 68, 71, [[4, "palm"]], { label: "Fruit tree run" }),
  run("fruit-72", 72, 80, [[4, "palm"], [1, "calquat"]], { label: "Fruit tree run" }),
  run("fruit-81", 81, 84, [[4, "dragonfruit"], [1, "calquat"]], { label: "Fruit tree run" }),
  run("fruit-85", 85, 99, [[5, "dragonfruit"], [1, "calquat"]], { label: "Fruit tree run" }),

  hardwood("teak", 35, 0.96, "a little over 3 days"),
  hardwood("mahogany", 55, 0.84, "about 3.5 days"),

  herb("guam", "guam", 9, 11, 12.5, "Guam seed", "Grimy guam leaf"),
  herb("marrentill", "marrentill", 14, 13.5, 15, "Marrentill seed", "Grimy marrentill"),
  herb("tarromin", "tarromin", 19, 16, 18, "Tarromin seed", "Grimy tarromin"),
  herb("harralander", "harralander", 26, 21.5, 24, "Harralander seed", "Grimy harralander"),
  herb("ranarr", "ranarr", 32, 27, 30.5, "Ranarr seed", "Grimy ranarr weed"),
  herb("toadflax", "toadflax", 38, 34, 38.5, "Toadflax seed", "Grimy toadflax"),
  herb("irit", "irit", 44, 43, 48.5, "Irit seed", "Grimy irit leaf"),
  herb("avantoe", "avantoe", 50, 54.5, 61.5, "Avantoe seed", "Grimy avantoe"),
  herb("kwuarm", "kwuarm", 56, 69, 78, "Kwuarm seed", "Grimy kwuarm"),
  herb("snapdragon", "snapdragon", 62, 87.5, 98.5, "Snapdragon seed", "Grimy snapdragon"),
  herb("cadantine", "cadantine", 67, 106.5, 120, "Cadantine seed", "Grimy cadantine"),
  herb("lantadyme", "lantadyme", 73, 134.5, 151.5, "Lantadyme seed", "Grimy lantadyme"),
  herb("dwarf-weed", "dwarf weed", 79, 170.5, 192, "Dwarf weed seed", "Grimy dwarf weed"),
  herb("torstol", "torstol", 85, 199.5, 224.5, "Torstol seed", "Grimy torstol"),

  {
    id: "farm-hespori",
    name: "Hespori (Farming Guild)",
    tags: ["training"],
    guide: "https://oldschool.runescape.wiki/w/Hespori",
    reqs: { skills: { Farming: 65 }, items: ["Hespori seed", "Spade, rake and seed dibber", "Slash weapon or fire spells"] },
    per: "day",
    action: "kill",
    actionLabel: "Hespori per day",
    actionsPerDay: 0.85,
    presets: [["As soon as it's grown", 0.85], ["Every other day", 0.5], ["Once a week", 0.14]],
    inputs: [],
    outputs: [],
    xp: { Farming: 12600 },
    note: "A boss you grow yourself: plant a hespori seed in the cave in the west wing of the Farming Guild (Farming 65, a boost works), wait 22 to 32 hours, and fight it when you dig it up. It's a short solo fight: it's weak to slash weapons and to fire spells (double damage), and Protect from Missiles helps. Harvesting it afterwards gives 12,600 Farming XP for a couple of minutes of play, plus seeds: among them the anima seeds that make all your patches grow faster, yield more or get diseased less, and a 1 in 35 chance of the bottomless compost bucket. Hespori seeds can't be bought: you get them now and then while harvesting any patch, and from farming contracts. Nothing here costs coins, so do it whenever you have a seed."
  },

  tithe(34, "34–53", "golovanova", 25000),
  tithe(54, "54–73", "bologano", 58000),
  tithe(74, "74–99", "logavano", 95000)
];
