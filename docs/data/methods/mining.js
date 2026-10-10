// Mining training methods used by the Mining routes (data/skill-guides.js).
// Levels and rates from the wiki's Pay-to-play Mining training page, 10 Oct 2026. Ores per hour are the
// wiki's XP per hour divided by the XP per ore, so they're estimates. The fast methods drop the ore
// ("power mining"), so only gems, amethyst and the Motherlode Mine (its own file) count what you sell.
// Methods without one XP value per action (crashed stars, Volcanic Mine, calcified rocks) are counted
// per minute of play: 60 minutes an hour, XP per minute = the wiki's XP per hour / 60.

const GUIDE = "https://oldschool.runescape.wiki/w/Pay-to-play_Mining_training";

const rocks = (id, name, level, xpEach, xpHr, note, extra = {}) => {
  const perHour = extra.perHour || Math.round(xpHr / xpEach / 10) * 10;
  return {
    id: `mine-${id}`,
    name,
    tags: extra.tags || ["training"],
    guide: extra.guide || GUIDE,
    reqs: { skills: { Mining: level }, ...(extra.quests ? { quests: extra.quests } : {}), items: extra.items || ["Best pickaxe you can use"] },
    action: extra.action || "ore",
    actionLabel: extra.actionLabel || "Ores per hour",
    actionsPerHour: perHour,
    presets: extra.presets || [["Steady", perHour], ["Relaxed", Math.round(perHour * 0.75 / 10) * 10]],
    inputs: [],
    outputs: extra.outputs || [],
    ...(extra.ledger ? { ledger: extra.ledger } : {}),
    xp: { Mining: xpEach, ...(extra.xp || {}) },
    note
  };
};

const timed = (id, name, level, xpHr, note, extra = {}) => rocks(id, name, level, Math.round(xpHr / 60 * 10) / 10, xpHr, note,
  { action: "minute", actionLabel: "Minutes of mining per hour", perHour: 60, presets: [["All hour", 60], ["With breaks", 45]], ...extra });

// What a gem rock gives, out of 128 (wiki drop table).
const GEMS = [["Uncut opal", 60], ["Uncut jade", 30], ["Uncut red topaz", 15], ["Uncut sapphire", 9], ["Uncut emerald", 5], ["Uncut ruby", 5], ["Uncut diamond", 4]]
  .map(([name, n]) => ({ name, qty: n / 128 }));

export default [
  rocks("copper-tin", "Mining copper and tin", 1, 17.5, 8000,
    "The first levels: mine copper or tin and drop it, for example in the Lumbridge Swamp mine or south-east of Varrock. 17.5 XP per ore; level 15 takes about 140 ores. The ores per hour is an estimate. Quests skip this completely: Doric's Quest, The Dig Site, Plague City, The Giant Dwarf, The Lost Tribe and Another Slice of H.A.M. give 27,525 Mining XP together (level 37). Bronzeman: keep one of each ore you haven't unlocked yet."),
  rocks("iron", "Power mining iron", 15, 35, 50000,
    "The fastest normal Mining XP until 70. Find three iron rocks in a triangle so you can mine all three without walking (Al Kharid mine, Legends' Guild mine, Piscatoris, Lovakengj, Mount Karuulm and more), and drop the ore while the rocks come back. 45K to 55K XP per hour. From Mining 60 the members' part of the Mining Guild is better: rocks come back twice as fast there, for 70K to 80K XP per hour (button above). Lots of clicking.",
    { presets: [["Steady", 1430], ["Mining Guild (Mining 60)", 2140], ["Relaxed", 1000]] }),
  rocks("gem-rocks", "Gem rocks in Shilo Village", 40, 65, 46000,
    "The underground mine in Shilo Village (Shilo Village quest and the medium Karamja Diary; the mine above ground has too few rocks to be worth it). Every rock gives a random uncut gem, mostly opal and jade, and they sell: the first Mining that earns money while you train quickly. Wear a charged amulet of glory (you mine gems faster) and bank at the deposit box next to the rocks. About 40K XP per hour at 40, 46K at 50, 58K at 70 and 75K at 99 without tick manipulation.",
    { tags: ["money", "training"], quests: ["Shilo Village"], items: ["Charged amulet of glory", "Gem bag (optional)"], outputs: GEMS, ledger: "hour", action: "gem",
      actionLabel: "Gems per hour", presets: [["Mining 40", 615], ["Mining 50", 710], ["Mining 70", 890], ["Mining 99", 1150]], perHour: 710,
      guide: "https://oldschool.runescape.wiki/w/Gem_rocks" }),
  timed("calcified-rocks", "Calcified rocks (Cam Torum)", 41, 25000,
    "In the Cam Torum mine in Varlamore (start Perilous Moons). Low effort: the rocks last a long time. You get blessed bone shards, which you offer at the libation bowl in the Teomat for Prayer XP: about 2,200 shards an hour, worth 11K to 13K Prayer XP later (not counted here). About 23K Mining XP per hour at 50 and up to 49K at 99.",
    { quests: ["Children of the Sun", "Perilous Moons (started)"] }),
  rocks("granite", "3-tick granite", 45, 60, 87000,
    "The fastest Mining XP in the game, but only with tick manipulation: you use swamp tar on a herb to start a 3-tick cycle and move between four granite rocks, clicking every tick. 87K XP per hour at 45, 103K at 65 and 114K at 85. Very hard to keep up and not worth doing without the trick; iron is the better choice if you don't want to learn it. At the quarry south of the Bandit Camp in the desert (bring waterskins) or at Cape Conch.",
    { items: ["Swamp tar and a clean herb", "Waterskins (desert quarry)"], action: "granite", actionLabel: "Granite per hour",
      presets: [["Mining 45", 1450], ["Mining 65", 1715], ["Mining 85", 1900]], perHour: 1450 }),
  timed("crashed-stars", "Crashed stars", 10, 26000,
    "The AFK option: about one click every few minutes. A star lands somewhere in the world every couple of hours; star-finder websites and the RuneLite star plugins tell you where. Mine it down with everyone else for stardust, which buys the celestial ring (an invisible +4 Mining). Higher stars need a higher level: every star is open to you from Mining 60, lower stars from level 10. About 24K to 31K XP per hour, including finding the star.",
    { guide: "https://oldschool.runescape.wiki/w/Shooting_Stars" }),
  timed("volcanic-mine", "Volcanic Mine", 50, 65000,
    "A group minigame under the volcano on Fossil Island (Bone Voyage; 150 kudos and 30 numulite per game to get in). The fastest Mining XP without tick manipulation from 70: the wiki gives 84K XP per hour at 99 with a dragon pickaxe in a steady team of 3 to 5; the 65K here for level 70 is my estimate. You have to learn the roles and it's better together, so a good one to do as a group. Bring food. Reward points buy ores and the prospector outfit.",
    { quests: ["Bone Voyage"], items: ["Food", "Numulite"], guide: "https://oldschool.runescape.wiki/w/Volcanic_Mine",
      presets: [["Mining 70 (estimate)", 60], ["With breaks", 45]] }),
  rocks("amethyst", "Mining amethyst", 92, 240, 22000,
    "In the Mining Guild from 92. Very low effort: the crystals last a long time. 240 XP each, 20K to 25K XP per hour, and 80 to 100 amethyst an hour to sell, so slow XP but good money for almost no clicking.",
    { tags: ["money", "training"], action: "amethyst", actionLabel: "Amethyst per hour", presets: [["Steady", 90], ["Focused", 100], ["Relaxed", 80]], perHour: 90,
      outputs: [{ name: "Amethyst", qty: 1 }], guide: "https://oldschool.runescape.wiki/w/Amethyst" })
];
