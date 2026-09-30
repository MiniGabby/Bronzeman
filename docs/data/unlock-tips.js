// How to unlock items that aren't unlocked yet, keyed by exact item name (case doesn't matter).
// Shown on method cards and in skill routes when an input is still locked.
// Unfinished potions ("... potion (unf)") get an automatic tip; see src/core/unlockTips.js.
const DRUIDS = "Kill chaos druids (combat 13) in Taverley Dungeon or Edgeville Dungeon: they drop grimy herbs from guam up to dwarf weed. Clean one to unlock the herb.";
const SEEDS = level => `Chaos druids don't drop this one. Pickpocket master farmers (Thieving 38) for its seed and grow it (Farming ${level}); picking the herb unlocks it.`;

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
  "White berries": "No quick route. Cave crawlers (combat 23, Slayer 10) drop them sometimes; they also spawn on Lava Dragon Isle in the deep Wilderness and in Isafdar, and grow from Farming 59.",
  "Mort myre fungus": "Finish the Nature Spirit quest, then cast Bloom with the blessed silver sickle next to rotting logs in Mort Myre Swamp.",
  "Potato cactus": "Pick one up in the Kalphite Lair: 3 spawn in the south-west room on the first level (with the Kalphite Soldiers). No requirements, but bring antipoison.",
  "Jangerberries": "Pick them on the island north of Gu'Tanoth (Agility 10 and a rope; same route as the jangerberries money maker), or grow them from Farming 48.",
  "Amylase crystal": "Buy an amylase pack (100 crystals) from Grace in the Rogues' Den for 10 marks of grace. Marks of grace drop on rooftop agility courses.",
  "Super energy(4)": "Make super energies yourself (Avantoe potion (unf) + Mort myre fungus, Herblore 52) and combine doses into a 4-dose."
};
