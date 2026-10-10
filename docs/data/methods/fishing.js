// Fishing training methods used by the Fishing routes (data/skill-guides.js).
// Levels and rates from the wiki's Pay-to-play Fishing training page, 10 Oct 2026, all WITHOUT tick
// manipulation (the wiki's "AFK" columns). Fish per hour are the wiki's XP per hour divided by the XP
// per fish, so they're estimates. Fly and barbarian fishing drop the fish, so nothing is sold there;
// monkfish, karambwans, minnows and anglerfish are banked and counted as sold.
// Drift net fishing (methods/hunter.js) and aerial fishing also train Fishing and show on the same page.

const GUIDE = "https://oldschool.runescape.wiki/w/Pay-to-play_Fishing_training";

const fish = (id, name, level, xpEach, xpHr, note, extra = {}) => {
  const perHour = extra.perHour || Math.round(xpHr / xpEach / 5) * 5;
  return {
    id: `fish-${id}`,
    name,
    tags: extra.tags || ["training"],
    guide: extra.guide || GUIDE,
    reqs: { skills: { Fishing: level, ...(extra.skills || {}) }, ...(extra.quests ? { quests: extra.quests } : {}), items: extra.items || [] },
    action: extra.action || "fish",
    actionLabel: extra.actionLabel || "Fish per hour",
    actionsPerHour: perHour,
    presets: extra.presets || [["Steady", perHour], ["Relaxed", Math.round(perHour * 0.75 / 5) * 5]],
    inputs: extra.inputs || [],
    outputs: extra.outputs || [],
    ...(extra.ledger ? { ledger: extra.ledger } : {}),
    xp: { Fishing: xpEach, ...(extra.xp || {}) },
    note
  };
};

const FLY = "Fly fishing rod and feathers. Good spots: Barbarian Village (a fire next to the river if you want to cook), north of the Chaos Druid Tower near East Ardougne, and Shilo Village if you bank the fish.";
const fly = (level, band, xpEach, xpHr, what) => fish(`fly-${level}`, `Fly fishing (Fishing ${band})`, level, xpEach, xpHr,
  `${what} About ${Math.round(xpHr / 1000)}K XP per hour at these levels if you drop the fish, with very little clicking. One feather per fish. ${FLY} Bronzeman: raw trout and salmon are already unlocked, so bank them if you want to cook them.`,
  { items: ["Fly fishing rod"], inputs: [{ name: "Feather", qty: 1 }] });

const tempoross = (level, band, xpHr, est) => fish(`tempoross-${level}`, `Tempoross (Fishing ${band})`, level, Math.round(xpHr / 60 * 10) / 10, xpHr,
  `A boss you fight with other players at the Ruins of Unkah, south of Al Kharid (ferry from the Al Kharid docks). Harpoon harpoonfish and load them into the cannons, put out fires and tie yourself to the mast when the wave comes. About ${Math.round(xpHr / 1000)}K XP per hour at these levels if you load the fish raw${est ? " (my estimate, between the wiki's 30K at 35 and 62K at 70)" : ""}; cooking them first gives more reward points but less XP. Faster than fly fishing from 35 and it costs nothing. The reward pool (fish, the fish barrel, the tackle box, the spirit angler's outfit) isn't counted. Counted per minute of play.`,
  { action: "minute", actionLabel: "Minutes of play per hour", perHour: 60, presets: [["All hour", 60], ["With breaks", 45]],
    items: ["Harpoon", "Hammer, rope and buckets (free on the boat)"], guide: "https://oldschool.runescape.wiki/w/Tempoross" });

const barbarian = (level, band, xpEach, xpHr, side, what) => fish(`barbarian-${level}`, `Barbarian fishing (Fishing ${band})`, level, xpEach, xpHr,
  `${what} At the pond next to Otto's Grotto (games necklace to Barbarian Assault, then south-west), with a barbarian rod and feathers as bait; drop the fish. About ${Math.round(xpHr / 1000)}K Fishing XP per hour at these levels, plus a little Agility and Strength XP with every fish, which adds up over a long grind. Start Barbarian Training with Otto first.`,
  { quests: ["Barbarian Training (started)"], items: ["Barbarian rod"], inputs: [{ name: "Feather", qty: 1 }], xp: { Agility: side, Strength: side } });

export default [
  fly(20, "20–29", 50, 13000, "Trout only until 30: 50 XP each."),
  fly(30, "30–39", 58, 25000, "From 30 you also catch salmon (70 XP)."),
  fly(40, "40–99", 60, 30000, "Trout and salmon. The rate keeps creeping up: 34K at 50, 37K at 60, 41K at 70 and 50K at 99."),

  tempoross(35, "35–49", 30000, false),
  tempoross(50, "50–69", 45000, true),
  tempoross(70, "70–99", 62000, false),

  barbarian(48, "48–57", 50, 23000, 5, "Leaping trout (50 XP)."),
  barbarian(58, "58–69", 60, 37000, 6, "Leaping trout and salmon; salmon need Agility and Strength 30."),
  barbarian(70, "70–99", 68, 48000, 7, "Leaping trout, salmon and sturgeon; sturgeon need Agility and Strength 45."),

  fish("monkfish", "Monkfish", 62, 120, 35800,
    "At the Piscatoris Fishing Colony, after Swan Song, with a small fishing net. Very relaxed and a bank is close by: 120 XP each, about 36K XP per hour at 62 and 42K at 99. Every fish is banked and sold, so it earns money all the way.",
    { tags: ["money", "training"], quests: ["Swan Song"], items: ["Small fishing net"], outputs: [{ name: "Raw monkfish", qty: 1 }],
      presets: [["Fishing 62", 300], ["Fishing 80", 320], ["Fishing 99", 350]] }),
  fish("karambwans", "Karambwans", 65, 50, 30000,
    "North of Tai Bwo Wannai on Karamja (fairy ring DKP), after Tai Bwo Wannai Trio, with a karambwan vessel and raw karambwanji as bait (net those yourself at the lake south of Tai Bwo Wannai; they can't be bought). The spot never moves, so you fill an inventory without touching anything. 50 XP each. The 600 an hour here is an estimate for 65; the wiki gives up to 900 an hour (46K XP) at 99 with a fish barrel and fast banking.",
    { tags: ["money", "training"], quests: ["Tai Bwo Wannai Trio"], items: ["Karambwan vessel", "Raw karambwanji"], outputs: [{ name: "Raw karambwan", qty: 1 }],
      presets: [["Fishing 65 (estimate)", 600], ["Fishing 99, fish barrel", 900], ["Relaxed", 450]], perHour: 600 }),
  fish("minnows", "Minnows", 82, 2.67, 40000,
    "On Kylie Minnow's platform in the Fishing Guild: you need Fishing 82 and the full angler's outfit (from the Fishing Trawler) to get on. Net minnows and move when the flying fish shows up, then trade 40 minnows for one noted raw shark. About 40K XP per hour at 82 with 15,000 minnows (375 sharks), rising to 56K and 625 sharks at 99.",
    { tags: ["money", "training"], quests: ["Fishing Contest"], items: ["Angler's outfit", "Small fishing net"], action: "minnow", actionLabel: "Minnows per hour",
      perHour: 15000, presets: [["Fishing 82", 15000], ["Fishing 90", 19500], ["Fishing 99", 25000]], outputs: [{ name: "Raw shark", qty: 1 / 40 }], ledger: "hour",
      guide: "https://oldschool.runescape.wiki/w/Minnow" }),
  fish("anglerfish", "Anglerfish", 82, 120, 15000,
    "In Port Piscarilius with a fishing rod and sandworms as bait. Slow XP (about 15K per hour at 82, 23K at 90), but an anglerfish is worth a lot and the spot is next to a bank.",
    { tags: ["money", "training"], items: ["Fishing rod"], inputs: [{ name: "Sandworms", qty: 1 }], outputs: [{ name: "Raw anglerfish", qty: 1 }],
      presets: [["Fishing 82", 125], ["Fishing 90", 190]] })
];
