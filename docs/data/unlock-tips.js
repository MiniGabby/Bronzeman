// How to unlock items that aren't unlocked yet, keyed by exact item name (case doesn't matter).
// You only need ONE of an item: once anyone in the group has obtained it, everyone can buy more on the GE.
// So a tip only has to explain how to get the first one.
// Shown on method cards and in skill routes when an input is still locked.
// Unfinished potions ("... potion (unf)") get an automatic tip; see src/core/unlockTips.js.
const DRUIDS = "Kill chaos druids (combat 13) in Taverley Dungeon or Edgeville Dungeon until one drops this herb; they drop grimy herbs from guam up to dwarf weed. One drop unlocks the grimy herb, and cleaning it unlocks the clean herb.";
const SEEDS = level => `Chaos druids don't drop this one. One seed is enough: pickpocket master farmers (Thieving 38) until you get one, grow it (Farming ${level}), and the first herb you pick unlocks it.`;

export default {
  // Herbs
  "Marrentill": DRUIDS, "Grimy marrentill": DRUIDS,
  "Avantoe": DRUIDS, "Grimy avantoe": DRUIDS,
  "Kwuarm": DRUIDS, "Grimy kwuarm": DRUIDS,
  "Cadantine": DRUIDS, "Grimy cadantine": DRUIDS,
  "Lantadyme": DRUIDS, "Grimy lantadyme": DRUIDS,
  "Dwarf weed": DRUIDS, "Grimy dwarf weed": DRUIDS,
  "Toadflax": SEEDS(38), "Grimy toadflax": SEEDS(38),
  "Snapdragon": SEEDS(62), "Grimy snapdragon": SEEDS(62),
  "Torstol": SEEDS(85), "Grimy torstol": SEEDS(85),

  // Secondaries
  "Unicorn horn dust": "Kill a unicorn (combat 15, always drops a unicorn horn): there's one west of Lumbridge and two south of Edgeville. Grind the horn with a pestle and mortar; that unlocks both.",
  "Unicorn horn": "Kill a unicorn (combat 15, always drops one): there's one west of Lumbridge and two south of Edgeville.",
  "Dragon scale dust": "Grind a blue dragon scale with a pestle and mortar. Both are already unlocked, so this takes seconds.",
  "Crushed nest": "Grind an empty bird nest with a pestle and mortar (search a nest first to empty it). Bird nests are already unlocked.",
  "Wine of zamorak": "Cast Telekinetic Grab (Magic 33, 1 air + 1 law rune) on the wine in the Chaos Temple north of Falador, near Goblin Village. It spawns every 30 seconds.",
  "White berries": "Kill cave crawlers (combat 23, needs Slayer 10) until one drops white berries. One is enough. They also spawn on Lava Dragon Isle in the deep Wilderness and in Isafdar.",
  "Mort myre fungus": "Finish the Nature Spirit quest, then cast Bloom once with the blessed silver sickle next to a rotting log in Mort Myre Swamp and pick one fungus.",
  "Potato cactus": "Pick one up in the Kalphite Lair: 3 spawn in the south-west room on the first level (with the Kalphite Soldiers). No requirements, but bring antipoison.",
  "Jangerberries": "Pick them on the island north of Gu'Tanoth (Agility 10 and a rope; same route as the jangerberries money maker), or grow them from Farming 48.",
  "Amylase crystal": "Buy one amylase pack (100 crystals) from Grace in the Rogues' Den for 10 marks of grace. Marks of grace drop on rooftop agility courses, so this is a one-time 10 marks.",
  "Super energy(4)": "Make one super energy yourself (Avantoe potion (unf) + Mort myre fungus, Herblore 52) and combine doses into a 4-dose, or drink a dose off a 4-dose you get another way.",

  // Smithing: bars and ores
  "Mithril bar": "Smelt one yourself: mithril ore (already unlocked) and 4 coal at any furnace, Smithing 50. Or 2 coal at the Blast Furnace.",
  "Adamantite ore": "Mine one: Mining 70. The Motherlode Mine pay-dirt also gives adamantite ore from Mining 70.",
  "Adamantite bar": "Smelt one: adamantite ore and 6 coal at any furnace, Smithing 70. If the ore isn't unlocked yet, mine one first (Mining 70).",
  "Runite ore": "Mine one: Mining 85. The Motherlode Mine pay-dirt also gives runite ore from Mining 85.",
  "Runite bar": "Smelt one: runite ore and 8 coal at any furnace, Smithing 85."
};

// Skill levels needed to get ONE of an item yourself, used for "who can get it" in Unlock goals.
// {} = anyone can do it. Items not listed here: requirements unknown, the site doesn't guess.
// Unfinished potions use their herb's entry (see src/core/unlockGoals.js).
const DRUID_HERB = {};
const SEED = farming => ({ Thieving: 38, Farming: farming });
export const REQS = {
  "Marrentill": DRUID_HERB, "Avantoe": DRUID_HERB, "Kwuarm": DRUID_HERB, "Cadantine": DRUID_HERB,
  "Lantadyme": DRUID_HERB, "Dwarf weed": DRUID_HERB,
  "Toadflax": SEED(38), "Snapdragon": SEED(62), "Torstol": SEED(85),
  "Unicorn horn dust": {}, "Unicorn horn": {}, "Dragon scale dust": {}, "Crushed nest": {}, "Potato cactus": {},
  "Wine of zamorak": { Magic: 33 },
  "White berries": { Slayer: 10 },
  "Jangerberries": { Agility: 10 },
  "Amylase crystal": { Agility: 10 },
  "Super energy(4)": { Herblore: 52 },
  "Mithril bar": { Smithing: 50 },
  "Adamantite ore": { Mining: 70 },
  "Adamantite bar": { Mining: 70, Smithing: 70 },
  "Runite ore": { Mining: 85 },
  "Runite bar": { Mining: 85, Smithing: 85 }
};
