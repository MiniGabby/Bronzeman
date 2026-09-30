// Herblore training: making potions from an unfinished potion + a secondary ingredient.
// Items are given by exact in-game name; the site looks up their ids in the price list.
// Rates: the wiki assumes about 2,500 potions per hour (14 + 14 per inventory).
const potion = (id, name, level, unf, secondary, output, xp, note = "") => ({
  id: `herb-${id}`,
  name: `Making ${name}`,
  tags: ["training"],
  guide: `https://oldschool.runescape.wiki/w/${encodeURIComponent(output.replace(/\(\d\)$/, "").trim().replace(/ /g, "_"))}`,
  reqs: { skills: { Herblore: level }, quests: ["Druidic Ritual"] },
  action: "potion",
  actionLabel: "Potions per hour",
  actionsPerHour: 2500,
  presets: [["Wiki pace", 2500], ["Relaxed", 1800]],
  inputs:  [{ name: unf, qty: 1 }, { name: secondary, qty: 1 }],
  outputs: [{ name: output, qty: 1 }],
  xp: { Herblore: xp },
  note: `${unf} + ${secondary} makes a 3-dose ${output.replace(/\(\d\)$/, "").trim().toLowerCase()}.${note ? " " + note : ""}`
});

export default [
  potion("attack", "attack potions", 3, "Guam potion (unf)", "Eye of newt", "Attack potion(3)", 25),
  potion("antipoison", "antipoisons", 5, "Marrentill potion (unf)", "Unicorn horn dust", "Antipoison(3)", 37.5),
  potion("strength", "strength potions", 12, "Tarromin potion (unf)", "Limpwurt root", "Strength potion(3)", 50),
  potion("restore", "restore potions", 22, "Harralander potion (unf)", "Red spiders' eggs", "Restore potion(3)", 62.5),
  potion("energy", "energy potions", 26, "Harralander potion (unf)", "Chocolate dust", "Energy potion(3)", 67.5),
  potion("defence", "defence potions", 30, "Ranarr potion (unf)", "White berries", "Defence potion(3)", 75),
  potion("prayer", "prayer potions", 38, "Ranarr potion (unf)", "Snape grass", "Prayer potion(3)", 87.5),
  potion("super-attack", "super attacks", 45, "Irit potion (unf)", "Eye of newt", "Super attack(3)", 100),
  potion("superantipoison", "superantipoisons", 48, "Irit potion (unf)", "Unicorn horn dust", "Superantipoison(3)", 106.3),
  potion("fishing", "fishing potions", 50, "Avantoe potion (unf)", "Snape grass", "Fishing potion(3)", 112.5),
  potion("super-energy", "super energies", 52, "Avantoe potion (unf)", "Mort myre fungus", "Super energy(3)", 117.5),
  potion("super-strength", "super strengths", 55, "Kwuarm potion (unf)", "Limpwurt root", "Super strength(3)", 125),
  potion("super-restore", "super restores", 63, "Snapdragon potion (unf)", "Red spiders' eggs", "Super restore(3)", 142.5),
  potion("super-defence", "super defences", 66, "Cadantine potion (unf)", "White berries", "Super defence(3)", 150),
  potion("antifire", "antifire potions", 69, "Lantadyme potion (unf)", "Dragon scale dust", "Antifire potion(3)", 157.5),
  potion("ranging", "ranging potions", 72, "Dwarf weed potion (unf)", "Wine of zamorak", "Ranging potion(3)", 162.5),
  potion("magic", "magic potions", 76, "Lantadyme potion (unf)", "Potato cactus", "Magic potion(3)", 172.5),
  {
    id: "herb-stamina",
    name: "Making stamina potions",
    tags: ["training"],
    guide: "https://oldschool.runescape.wiki/w/Stamina_potion",
    reqs: { skills: { Herblore: 77 }, quests: ["Druidic Ritual"] },
    action: "potion",
    actionLabel: "Potions per hour",
    actionsPerHour: 2750,
    presets: [["Wiki pace", 2750], ["Relaxed", 2000]],
    inputs:  [{ name: "Super energy(4)", qty: 1 }, { name: "Amylase crystal", qty: 4 }],
    outputs: [{ name: "Stamina potion(4)", qty: 1 }],
    xp: { Herblore: 102 },
    note: "A super energy(4) + 4 amylase crystals makes a stamina potion(4). Amylase crystals are stackable, so an inventory holds 27 potions."
  },
  potion("zamorak-brew", "Zamorak brews", 78, "Torstol potion (unf)", "Jangerberries", "Zamorak brew(3)", 175),
  potion("saradomin-brew", "Saradomin brews", 81, "Toadflax potion (unf)", "Crushed nest", "Saradomin brew(3)", 180)
];
