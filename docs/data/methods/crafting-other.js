// Crafting methods other than jewellery: gem cutting, glass, leather, spinning, dragonhide and
// battlestaves. Levels, XP and rates from the wiki's Pay-to-play Crafting training page, 4 Oct 2026.
// Rates worked back from the wiki's XP per hour; leather and molten glass are estimates.

const GUIDE = "https://oldschool.runescape.wiki/w/Pay-to-play_Crafting_training";

const make = (id, name, level, inputs, output, xp, perHour, note, extra = {}) => ({
  id: `craft-${id}`,
  name: extra.fullName || `Crafting ${name}`,
  tags: extra.tags || ["training"],
  guide: extra.guide || GUIDE,
  reqs: { skills: { Crafting: level }, ...(extra.items ? { items: extra.items } : {}) },
  action: extra.action || "item",
  actionLabel: extra.actionLabel || "Items per hour",
  actionsPerHour: perHour,
  presets: [["Steady", perHour], ["Relaxed", Math.round(perHour * 0.75 / 50) * 50]],
  inputs,
  outputs: [{ name: output, qty: 1 }],
  xp: { Crafting: xp },
  note
});

const GEMS = "Use a chisel on the uncut gems at any bank: 27 per inventory and very fast. Cut gems are what you need for jewellery, so this pairs well with the jewellery route.";
const PLURAL = { ruby: "rubies" };
const gem = (id, level, gem, xp) => make(`cut-${id}`, "", level, [{ name: `Uncut ${gem}`, qty: 1 }], gem[0].toUpperCase() + gem.slice(1), xp, 2780, GEMS,
  { items: ["Chisel"], action: "gem", actionLabel: "Gems per hour", fullName: `Cutting ${PLURAL[id] || id + "s"}` });

const GLASS = "Use a glassblowing pipe on molten glass at any bank and pick the item. 27 per inventory. Make the molten glass yourself if it's cheaper (see Crafting molten glass).";
const glass = (id, name, level, output, xp) => make(`glass-${id}`, "", level, [{ name: "Molten glass", qty: 1 }], output, xp, 1750, GLASS,
  { items: ["Glassblowing pipe"], fullName: `Glassblowing ${name}` });

const LEATHER = "Use a needle on leather at any bank (thread in your inventory; one spool lasts 5 items). Slow; only for the first levels.";
const leather = (id, name, level, output, xp) => make(`leather-${id}`, `leather ${name}`, level, [{ name: "Leather", qty: 1 }, { name: "Thread", qty: 0.2 }], output, xp, 1500, LEATHER,
  { items: ["Needle"] });

const HIDE = "Use a needle on 3 dragon leather (thread in your inventory). The fastest normal Crafting method. In bronzeman somebody first has to get the leather: kill one dragon of that colour and tan the hide (see the tip).";
const body = (colour, level, xp) => make(`${colour}-dhide-bodies`, `${colour} d'hide bodies`, level,
  [{ name: `${colour[0].toUpperCase() + colour.slice(1)} dragon leather`, qty: 3 }, { name: "Thread", qty: 0.2 }], `${colour[0].toUpperCase() + colour.slice(1)} d'hide body`, xp, 1700, HIDE,
  { items: ["Needle"], tags: ["training"] });

const STAFF = "Attach an orb to a battlestaff at any bank (14 of each). Fast and usually close to break-even. Zaff in Varrock sells battlestaves if you have the easy Varrock Diary or have nearly finished What Lies Below; orbs you charge yourself at an obelisk (see the tips).";
const staff = (el, level, xp) => make(`${el}-battlestaves`, `${el} battlestaves`, level,
  [{ name: "Battlestaff", qty: 1 }, { name: `${el[0].toUpperCase() + el.slice(1)} orb`, qty: 1 }], `${el[0].toUpperCase() + el.slice(1)} battlestaff`, xp, 2450, STAFF,
  { action: "staff", actionLabel: "Battlestaves per hour" });

export default [
  make("molten-glass", "", 1, [{ name: "Bucket of sand", qty: 1 }, { name: "Soda ash", qty: 1 }], "Molten glass", 20, 1800,
    "Use a bucket of sand and soda ash on a furnace (14 of each; Edgeville has one next to the bank). Cheap XP for the first levels, and you can blow the glass afterwards.",
    { fullName: "Smelting molten glass" }),
  make("bow-strings", "", 10, [{ name: "Flax", qty: 1 }], "Bow string", 15, 1344,
    "Spin flax on a spinning wheel (Seers' Village has one close to the bank, or Lumbridge Castle). Slow, but the bow strings usually sell for more than the flax.",
    { tags: ["money", "training"], fullName: "Spinning bow strings" }),

  leather("gloves", "gloves", 1, "Leather gloves", 13.8),
  leather("vambraces", "vambraces", 11, "Leather vambraces", 22),
  leather("bodies", "bodies", 14, "Leather body", 25),
  leather("chaps", "chaps", 18, "Leather chaps", 27),

  glass("beer-glasses", "beer glasses", 1, "Beer glass", 17.5),
  glass("vials", "vials", 33, "Vial", 35),
  glass("unpowered-orbs", "unpowered orbs", 46, "Unpowered orb", 52.5),
  glass("lantern-lenses", "lantern lenses", 49, "Lantern lens", 55),
  glass("light-orbs", "light orbs", 87, "Empty light orb", 70),

  gem("sapphire", 20, "sapphire", 50),
  gem("emerald", 27, "emerald", 67.5),
  gem("ruby", 34, "ruby", 85),
  gem("diamond", 43, "diamond", 107.5),
  gem("dragonstone", 55, "dragonstone", 137.5),

  staff("water", 54, 100),
  staff("earth", 58, 112.5),
  staff("fire", 62, 125),
  staff("air", 66, 137.5),

  body("green", 63, 186),
  body("blue", 71, 210),
  body("red", 77, 234),
  body("black", 84, 258)
];
