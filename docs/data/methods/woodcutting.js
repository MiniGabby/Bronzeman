// Woodcutting training methods used by the Woodcutting routes (data/skill-guides.js).
// Levels, XP per log and rates from the wiki's Pay-to-play Woodcutting training page, 10 Oct 2026,
// all WITHOUT tick manipulation. Two kinds of method:
//   - "Power chopping" (teak, sulliuscep, blisterwood): you drop the logs, rates straight from the wiki.
//   - Banking logs to sell or use (willow, maple, yew, magic, redwood): the wiki only gives the rate at
//     level 99, so the default here is about 60% of that for when you've just reached the tree. An estimate.

const GUIDE = "https://oldschool.runescape.wiki/w/Pay-to-play_Woodcutting_training";

const tree = (id, name, level, xpEach, xpHr, note, extra = {}) => {
  const perHour = extra.perHour || Math.round(xpHr / xpEach / 5) * 5;
  return {
    id: `wc-${id}`,
    name,
    tags: extra.tags || ["training"],
    guide: extra.guide || GUIDE,
    reqs: { skills: { Woodcutting: level }, ...(extra.quests ? { quests: extra.quests } : {}), items: extra.items || ["Best axe you can use"] },
    action: "log",
    actionLabel: "Logs per hour",
    actionsPerHour: perHour,
    presets: extra.presets || [["Steady", perHour], ["Relaxed", Math.round(perHour * 0.75 / 5) * 5]],
    inputs: [],
    outputs: extra.outputs || [],
    xp: { Woodcutting: xpEach },
    note
  };
};

// Logs you bank: the wiki's level-99 rate, and 60% of it as the starting pace.
const banked = (id, name, level, log, xpEach, xp99, where) => {
  const top = Math.round(xp99 / xpEach / 5) * 5, start = Math.round(top * 0.6 / 5) * 5;
  return tree(id, `Cutting ${name} (banked)`, level, xpEach, xp99 * 0.6,
    `${where} ${xpEach} XP per log, and you bank the logs: to sell, to burn, to fletch or for bird houses. The wiki gives about ${Math.round(xp99 / 1000)}K XP per hour at level 99; the ${start} logs an hour here is my estimate for when you've just reached the tree, so check it in game. Forestry events (join in when one appears) add XP and bark for the forestry shop.`,
    { tags: ["money", "training"], outputs: [{ name: log, qty: 1 }], perHour: start,
      presets: [[`Woodcutting ${level} (estimate)`, start], ["Woodcutting 99 (wiki)", top], ["Relaxed", Math.round(start * 0.75 / 5) * 5]] });
};

const teak = (level, band, xpHr) => tree(`teak-${level}`, `Power chopping teak (Woodcutting ${band})`, level, 85, xpHr,
  `Chop teak trees and drop the logs: 85 XP each, about ${Math.round(xpHr / 1000)}K XP per hour at these levels. The fastest normal Woodcutting from 35 to 65. Teak trees: in the woods south of Castle Wars (no requirements), on the Isle of Souls, in the Hardwood Grove at Tai Bwo Wannai (100 trading sticks to get in), on Ape Atoll, and your own planted teaks on Fossil Island. A felling axe with forester's rations gives 10% more XP. Bronzeman: teak logs are already unlocked.`);

const sulliuscep = (level, band, xpHr) => tree(`sulliuscep-${level}`, `Sulliusceps (Woodcutting ${band})`, level, 127, xpHr,
  `Giant mushrooms in the Tar Swamp on Fossil Island (Bone Voyage). Only one of the six can be chopped at a time: chop it down, walk to the next, and so on around the swamp. 127 XP per chop, about ${Math.round(xpHr / 1000)}K XP per hour at these levels: the fastest Woodcutting without tick manipulation from 65. Tar monsters and spine mushrooms attack you and can poison you, so bring some food and an antipoison. You also get numulite, fossils and now and then a sulliuscep cap (not counted).`,
  { quests: ["Bone Voyage"], items: ["Best axe you can use", "Food", "Antipoison"], guide: "https://oldschool.runescape.wiki/w/Sulliuscep/Strategies" });

export default [
  tree("regular", "Cutting regular trees", 1, 25, 12500,
    "Any normal tree. 25 XP per log: 97 logs take you to level 15, so this is over in a few minutes. Quests can skip it: Monk's Friend, Enlightened Journey, Icthlarin's Little Helper and the Skrach Uglogwee part of Recipe for Disaster give 9,000 XP together (level 26)."),
  tree("oak", "Cutting oak trees", 15, 37.5, 25000,
    "Oak trees, for example west of the Varrock west bank or around Draynor. 37.5 XP per log; drop them or bank them (oak logs are already unlocked). Faster than willows until 35 even though willows open at 30. The logs per hour is an estimate: the wiki only gives 40K XP per hour at level 99.",
    { presets: [["Woodcutting 15 (estimate)", 665], ["Woodcutting 99 (wiki)", 1065], ["Relaxed", 500]], perHour: 665 }),

  teak(35, "35–49", 38000),
  teak(50, "50–60", 46000),
  teak(61, "61–99", 65000),

  tree("blisterwood", "Blisterwood tree", 62, 76, 69000,
    "The blisterwood tree in Darkmeyer (far enough into Sins of the Father). It never falls, so you click it once and only have to click again when you stop, which makes a sound. Up to about 69K XP per hour for almost no effort. The logs can't be sold.",
    { quests: ["Sins of the Father (started)"], guide: "https://oldschool.runescape.wiki/w/Blisterwood_tree" }),

  sulliuscep(65, "65–79", 82700),
  sulliuscep(80, "80–89", 91600),
  sulliuscep(90, "90–99", 97400),

  banked("willow", "willow trees", 30, "Willow logs", 67.5, 74000, "Willows stand next to water: south of the Draynor bank is the classic spot, right next to a bank."),
  banked("maple", "maple trees", 45, "Maple logs", 100, 50000, "Maple trees north of the Seers' Village bank."),
  banked("yew", "yew trees", 60, "Yew logs", 175, 47000, "Yews at the Seers' Village church, south of Falador, or in the Woodcutting Guild (Woodcutting 60, which also gives an invisible +7). Yew logs aren't unlocked yet: cutting the first one unlocks them for everyone."),
  banked("magic", "magic trees", 75, "Magic logs", 250, 27500, "Magic trees south of the Hosidius bank, in the Woodcutting Guild, or at the Myths' Guild. Slow, but very little clicking. Magic logs aren't unlocked yet: cutting the first one unlocks them for everyone."),
  banked("redwood", "redwood trees", 90, "Redwood logs", 380, 70000, "Redwood trees in the Woodcutting Guild, with a bank chest close by. Very little attention needed. Redwood logs aren't unlocked yet: cutting the first one unlocks them.")
];
