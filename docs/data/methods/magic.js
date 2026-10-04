// Magic training methods used by the Magic routes (data/skill-guides.js).
// Levels, XP and rates from the wiki's Pay-to-play Magic training page and spell pages, 4 Oct 2026.
// Runes: every method assumes you wield the elemental staff that saves the most runes
// (named in the requirements), so those runes aren't counted.

const GUIDE = "https://oldschool.runescape.wiki/w/Pay-to-play_Magic_training";
const spell = (id, name, level, staff, inputs, outputs, xp, perHour, note, extra = {}) => ({
  id: `magic-${id}`,
  name,
  tags: extra.tags || ["training"],
  guide: extra.guide || GUIDE,
  reqs: { skills: { Magic: level }, items: [staff], ...(extra.quests ? { quests: extra.quests } : {}) },
  action: "cast",
  actionLabel: "Casts per hour",
  actionsPerHour: perHour,
  presets: extra.presets || [["Steady", perHour], ["Relaxed", Math.round(perHour * 0.75 / 50) * 50]],
  inputs,
  outputs,
  xp: { Magic: xp },
  note
});

const TELE = "Cast the teleport, then cast it again as soon as you land: nothing else to do, no banking. A cheap and fast way to train Magic, and you can stand at the bank between casts if you like.";
const tele = (id, place, level, runes, xp, extra = {}) => spell(`tele-${id}`, `Casting ${place} Teleport`, level, "Staff of air",
  [{ name: "Law rune", qty: runes.law }, ...(runes.other ? [{ name: runes.other, qty: runes.n }] : [])], [], xp, 1440, `${extra.note ? extra.note + " " : ""}${TELE}`, extra);

const ENCHANT = "Cast the enchant spell on each piece at a bank (27 per inventory). Enchanted jewellery sells well on the GE, but check \"Traded / hr\" before you make hundreds.";
const enchant = (id, label, level, staff, extraRunes, item, result, xp) => spell(`enchant-${id}`, `Enchanting ${label}`, level, staff,
  [{ name: item, qty: 1 }, { name: "Cosmic rune", qty: 1 }, ...extraRunes], [{ name: result, qty: 1 }], xp, 1600, ENCHANT, { tags: ["money", "training"] });

const ORB = (el, where) => `Take unpowered orbs, cosmic runes and ${el === "fire" ? "fire runes" : `a staff of ${el}`} to the Obelisk of ${el[0].toUpperCase() + el.slice(1)} (${where}) and cast Charge ${el[0].toUpperCase() + el.slice(1)} Orb on it; each cast charges one orb. Slower per hour because of the trip, but the charged orbs sell well and are what battlestaves are made with.`;
const orb = (el, level, xp, where, extra = {}) => spell(`charge-${el}-orbs`, `Charging ${el} orbs`, level, extra.staff || `Staff of ${el}`,
  [{ name: "Unpowered orb", qty: 1 }, { name: "Cosmic rune", qty: 3 }, ...(extra.runes || [])], [{ name: `${el[0].toUpperCase() + el.slice(1)} orb`, qty: 1 }], xp, extra.perHour || 520, ORB(el, where), { tags: ["money", "training"] });

export default [
  tele("varrock", "Varrock", 25, { law: 1, other: "Fire rune", n: 1 }, 35),
  tele("lumbridge", "Lumbridge", 31, { law: 1, other: "Earth rune", n: 1 }, 41),
  tele("falador", "Falador", 37, { law: 1, other: "Water rune", n: 1 }, 48),
  tele("camelot", "Camelot", 45, { law: 1 }, 55.5, { note: "Only a law rune per cast with a staff of air: the classic Magic training spell." }),
  tele("ardougne", "Ardougne", 51, { law: 2, other: "Water rune", n: 2 }, 61, { quests: ["Plague City"] }),
  tele("watchtower", "Watchtower", 58, { law: 2, other: "Earth rune", n: 2 }, 68, { quests: ["Watchtower"] }),

  enchant("emerald-rings", "emerald rings", 27, "Staff of air", [], "Emerald ring", "Ring of dueling(8)", 37),
  enchant("ruby-rings", "ruby rings", 49, "Staff of fire", [], "Ruby ring", "Ring of forging", 59),
  enchant("ruby-amulets", "ruby amulets", 49, "Staff of fire", [], "Ruby amulet", "Amulet of strength", 59),
  enchant("diamond-rings", "diamond rings", 57, "Staff of earth", [], "Diamond ring", "Ring of life", 67),
  enchant("diamond-amulets", "diamond amulets", 57, "Staff of earth", [], "Diamond amulet", "Amulet of power", 67),
  enchant("dragonstone-rings", "dragonstone rings", 68, "Staff of water", [{ name: "Earth rune", qty: 15 }], "Dragonstone ring", "Ring of wealth", 78),

  spell("high-alchemy", "High Level Alchemy", 55, "Staff of fire", [{ name: "Nature rune", qty: 1 }], [], 65, 1200,
    "Only the nature rune is counted here. What you earn or lose depends on the item: pick items on the Alchemy tab, where the site works out which unlocked items are worth alching. Very relaxed, and you can do it while walking or waiting.",
    { guide: "https://oldschool.runescape.wiki/w/High_Level_Alchemy", presets: [["Standing still", 1200], ["Relaxed", 900]] }),

  orb("water", 56, 66, "Taverley Dungeon", { perHour: 505 }),
  orb("earth", 60, 70, "Edgeville Dungeon, in the Wilderness part"),
  orb("fire", 63, 73, "on Entrana; you can't take weapons or armour there, staves included, so you need 30 fire runes per orb", {
    staff: "No staff (Entrana)", runes: [{ name: "Fire rune", qty: 30 }] }),
  orb("air", 66, 76, "in the Wilderness north of Edgeville, level 7")
];
