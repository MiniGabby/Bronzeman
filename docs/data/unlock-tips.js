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

  // Farming supplies
  "Supercompost": "Make it yourself: put 15 pineapples (already unlocked; charter ship shops sell them) in a compost bin next to an allotment, close the lid, and scoop it out with an empty bucket once it has rotted.",
  "Ultracompost": "Use 2 volcanic ash on a bucket of supercompost. Volcanic ash is mined on Fossil Island (Bone Voyage, Mining 22).",
  "Sweetcorn": "Grow a sweetcorn seed in an allotment (Farming 20) and pick it.",
  "Watermelon": "Grow watermelon seeds in an allotment (Farming 47; the seed is already unlocked) and pick one.",

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
  "Runite bar": "Smelt one: runite ore and 8 coal at any furnace, Smithing 85.",

  // Fletching
  "Maple logs": "Chop one maple tree: Woodcutting 45. There are maples north of the Seers' Village bank.",
  "Yew logs": "Chop one yew tree: Woodcutting 60. There are yews behind Edgeville bank and around Varrock Palace.",
  "Magic logs": "Chop one magic tree: Woodcutting 75. There are some south-west of Seers' Village and in the Mage Training Arena area.",
  "Oak longbow (u)": "Cut one yourself: use a knife on oak logs (already unlocked), Fletching 25.",
  "Willow longbow (u)": "Cut one yourself: use a knife on willow logs (already unlocked), Fletching 40.",
  "Maple longbow (u)": "Cut one yourself: a knife on maple logs, Fletching 55. If maple logs aren't unlocked yet, chop one first (Woodcutting 45).",
  "Yew longbow (u)": "Cut one yourself: a knife on yew logs, Fletching 70. If yew logs aren't unlocked yet, chop one first (Woodcutting 60).",
  "Magic longbow (u)": "Cut one yourself: a knife on magic logs, Fletching 85. If magic logs aren't unlocked yet, chop one first (Woodcutting 75).",
  "Mithril dart tip": "Smith one bar into 10 dart tips: Smithing 54 and The Tourist Trap. If mithril bars aren't unlocked, smelt one first (mithril ore + 4 coal, Smithing 50).",
  "Adamant dart tip": "Smith one bar into 10 dart tips: Smithing 74 and The Tourist Trap, with an adamantite bar (see its tip if it's locked).",
  "Rune dart tip": "Smith one bar into 10 dart tips: Smithing 89 and The Tourist Trap, with a runite bar (see its tip if it's locked).",

  // Crafting
  "Battlestaff": "Buy one from Zaff's Superior Staffs in Varrock: he sells battlestaves every day.",
  "Unpowered orb": "Blow one yourself: a glassblowing pipe on molten glass (both unlocked), Crafting 46.",
  "Water orb": "Charge one yourself: blow an unpowered orb (Crafting 46), then cast Charge Water Orb on the Obelisk of Water (Taverley Dungeon) with Magic 56, 30 water runes and 3 cosmic runes.",
  "Earth orb": "Charge one yourself: blow an unpowered orb (Crafting 46), then cast Charge Earth Orb on the Obelisk of Earth (Edgeville Dungeon, in the Wilderness part) with Magic 60, 30 earth runes and 3 cosmic runes.",
  "Fire orb": "Charge one yourself: blow an unpowered orb (Crafting 46), then cast Charge Fire Orb on the Obelisk of Fire (on Entrana: no weapons or armour allowed) with Magic 63, 30 fire runes and 3 cosmic runes.",
  "Air orb": "Charge one yourself: blow an unpowered orb (Crafting 46), then cast Charge Air Orb on the Obelisk of Air (in the Wilderness north of Edgeville) with Magic 66, 30 air runes and 3 cosmic runes.",
  "Green dragon leather": "Kill one green dragon (combat 79) and take the hide to a tanner (Ellis in Al Kharid tans it for 20 coins). Green dragons live in the Wilderness, so go with a friend and bring only what you're willing to lose.",
  "Blue dragon leather": "Kill one blue dragon (combat 111), e.g. in Taverley Dungeon, and take the hide to a tanner (Ellis in Al Kharid).",
  "Red dragon leather": "Kill one red dragon (combat 152) in Brimhaven Dungeon and take the hide to a tanner (Ellis in Al Kharid).",
  "Black dragon leather": "Kill one black dragon (combat 227) in Taverley Dungeon and take the hide to a tanner (Ellis in Al Kharid). A tough fight: an antifire shield is a must.",

  // Construction
  "Mahogany plank": "Turn one mahogany log into a plank at the sawmill in Varrock (1,500 coins) or with a demon butler. Mahogany logs: chop one (Woodcutting 50) in the Hardwood Grove in Tai Bwo Wannai or on Fossil Island, or get them from Wintertodt crates.",

  // Firemaking
  "Teak logs": "Chop one teak tree: Woodcutting 35. Teaks grow in the Hardwood Grove in Tai Bwo Wannai (100 trading sticks to get in) and on Fossil Island. Wintertodt supply crates can also give teak logs.",
  "Mahogany logs": "Chop one mahogany tree: Woodcutting 50, in the same places as teaks (Hardwood Grove in Tai Bwo Wannai, Fossil Island). Wintertodt supply crates can also give mahogany logs.",
  "Arctic pine logs": "Chop one arctic pine on Neitiznot: Woodcutting 54, and you need The Fremennik Trials to get to the island.",
  "Redwood logs": "Chop one redwood in the Woodcutting Guild in Hosidius: Woodcutting 90 (the guild needs 60).",

  // Cooking
  "Grapes": "Pick up the grapes that spawn upstairs in the Cooks' Guild (Cooking 32, wear a chef's hat), or steal from a market stall (Thieving 22). From Farming 36 you can also grow them in the Hosidius vinery.",
  "Raw monkfish": "Catch one in Piscatoris: start the Swan Song quest and have Fishing 62.",
  "Raw karambwan": "Catch one at Karamja (Fishing 65): start Tai Bwo Wannai Trio to get a karambwan vessel, and bait it with raw karambwanji.",
  "Raw anglerfish": "Catch one at Port Piscarilius with sandworms as bait: Fishing 82."
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
  "Runite bar": { Mining: 85, Smithing: 85 },
  "Maple logs": { Woodcutting: 45 }, "Yew logs": { Woodcutting: 60 }, "Magic logs": { Woodcutting: 75 },
  "Oak longbow (u)": { Fletching: 25 }, "Willow longbow (u)": { Fletching: 40 },
  "Maple longbow (u)": { Fletching: 55, Woodcutting: 45 }, "Yew longbow (u)": { Fletching: 70, Woodcutting: 60 },
  "Magic longbow (u)": { Fletching: 85, Woodcutting: 75 },
  "Mithril dart tip": { Smithing: 54 }, "Adamant dart tip": { Mining: 70, Smithing: 74 }, "Rune dart tip": { Mining: 85, Smithing: 89 },
  "Mahogany plank": { Woodcutting: 50 },
  "Battlestaff": {}, "Unpowered orb": { Crafting: 46 },
  "Water orb": { Crafting: 46, Magic: 56 }, "Earth orb": { Crafting: 46, Magic: 60 }, "Fire orb": { Crafting: 46, Magic: 63 }, "Air orb": { Crafting: 46, Magic: 66 },
  "Teak logs": { Woodcutting: 35 }, "Mahogany logs": { Woodcutting: 50 }, "Arctic pine logs": { Woodcutting: 54 }, "Redwood logs": { Woodcutting: 90 },
  "Grapes": { Cooking: 32 },   // Cooks' Guild spawn (or Thieving 22 for a market stall)
  "Raw monkfish": { Fishing: 62 }, "Raw karambwan": { Fishing: 65 }, "Raw anglerfish": { Fishing: 82 }
};
