// Runecraft training methods used by the Runecraft routes (data/skill-guides.js).
// Levels, XP and rates from the wiki's Pay-to-play Runecraft training page, 5 Oct 2026.
// Guardians of the Rift and the Ourania altar change with your level, so they come in level bands.
// Their rewards (Guardians: runes and pearls; Ourania: random runes) can't be priced item by item:
// Guardians' rewards aren't counted, Ourania's runes are counted as coins from the wiki's profit
// estimate (350K to 400K gp per hour around level 50). Both are estimates.

const GUIDE = "https://oldschool.runescape.wiki/w/Pay-to-play_Runecraft_training";

const gotr = (band, level, xpHr) => ({
  id: `rc-gotr-${level}`,
  name: `Guardians of the Rift (Runecraft ${band})`,
  tags: ["training"],
  guide: "https://oldschool.runescape.wiki/w/Guardians_of_the_Rift",
  reqs: { skills: { Runecraft: level }, quests: ["Temple of the Eye"], items: ["Pickaxe", "Essence pouches (optional)"] },
  action: "game",
  actionLabel: "Games per hour",
  actionsPerHour: 6,
  presets: [["Steady", 6], ["Relaxed", 5]],
  inputs: [],
  outputs: [],
  xp: { Runecraft: Math.round(xpHr / 6), Crafting: Math.round(xpHr * 0.093 / 6), Mining: Math.round(xpHr * 0.05 / 6) },
  note: `A group minigame north of the Wizards' Tower (finish Temple of the Eye first). Mine fragments, craft guardian essence, run it to the open altars and charge the guardian. Nothing to buy: essence is free inside. Rewards (runes, abyssal pearls for the outfit and essence pouches) aren't counted here, so it's better than it looks. Slower XP than lava runes, but free and very social. About ${Math.round(xpHr / 1000)}K Runecraft XP per hour at these levels.`
});

const ourania = (band, level, xpEach, perHour, coins) => ({
  id: `rc-ourania-${level}`,
  name: `Ourania altar (Runecraft ${band})`,
  tags: ["money", "training"],
  guide: "https://oldschool.runescape.wiki/w/Ourania_Altar",
  reqs: { skills: { Runecraft: level }, items: ["Essence pouches (optional)"] },
  action: "essence",
  actionLabel: "Essence per hour",
  actionsPerHour: perHour,
  presets: [["Steady", perHour], ["Relaxed", Math.round(perHour * 0.75 / 50) * 50]],
  inputs: [{ name: "Pure essence", qty: 1 }],
  outputs: [],
  coins,
  coinsLabel: "random runes, sold",
  xp: { Runecraft: xpEach },
  note: "The Ourania (ZMI) altar under the Ourania Hunter area, west of Ardougne. Every essence becomes a random rune; the higher your level, the better the runes and the more XP per essence. Bank with Eniola next to the altar (20 of any rune per visit). Lunar Diplomacy gives the Ourania Teleport, which makes it much faster. The coins shown are the wiki's estimate of what the runes sell for; low runes you can also keep."
});

const plain = (rune, level, xp, talisman) => ({
  id: `rc-${rune.toLowerCase().replace(" rune", "")}-runes`,
  name: `Crafting ${rune.toLowerCase()}s`,
  tags: ["training"],
  guide: GUIDE,
  reqs: { skills: { Runecraft: level }, items: [`${talisman} or ${talisman.replace("talisman", "tiara")}`] },
  action: "essence",
  actionLabel: "Essence per hour",
  actionsPerHour: 2000,
  presets: [["Steady", 2000], ["With pouches", 2600], ["Relaxed", 1500]],
  inputs: [{ name: "Pure essence", qty: 1 }],
  outputs: [{ name: rune, qty: 1 }],
  xp: { Runecraft: xp },
  note: `Run pure essence to the ${rune.replace(" rune", "").toLowerCase()} altar with a ${talisman.toLowerCase()} or a tiara and craft. Only for the first levels: Guardians of the Rift (27) and lava runes (23) are better.`
});

export default [
  plain("Air rune", 1, 5, "Air talisman"),
  plain("Earth rune", 9, 6.5, "Earth talisman"),
  plain("Fire rune", 14, 7, "Fire talisman"),
  plain("Body rune", 20, 7.5, "Body talisman"),

  {
    id: "rc-lava-runes",
    name: "Crafting lava runes",
    tags: ["training"],
    guide: "https://oldschool.runescape.wiki/w/Lava_rune",
    reqs: { skills: { Runecraft: 23 }, items: ["Earth talisman (or Magic Imbue, Magic 82)", "Fire tiara", "Binding necklace", "Essence pouches"] },
    action: "essence",
    actionLabel: "Essence per hour",
    actionsPerHour: 4100,
    presets: [["Steady", 4100], ["Bigger pouches", 6000], ["Colossal pouch, Magic Imbue", 9000]],
    inputs: [{ name: "Pure essence", qty: 1 }, { name: "Earth rune", qty: 1 }, { name: "Binding necklace", qty: 1 / 600 }],
    outputs: [{ name: "Lava rune", qty: 1 }],
    xp: { Runecraft: 10.5 },
    note: "The fastest normal Runecraft XP. Teleport to Emir's Arena with a ring of dueling, run to the fire altar, use earth runes (and an earth talisman, or cast Magic Imbue) on the altar. A binding necklace stops half the essence turning into fire runes; it lasts 16 trips. Fill your essence pouches every trip. Costs money: about 1.4 to 2.5 gp per XP."
  },

  gotr("27–49", 27, 25000),
  gotr("50–74", 50, 37000),
  gotr("75–84", 75, 50000),
  gotr("85–99", 85, 65000),

  ourania("1–49", 1, 11.4, 2175, 60),
  ourania("50–74", 50, 13.9, 3125, 110),
  ourania("75–89", 75, 14.8, 3900, 125),
  ourania("90–99", 90, 15.4, 4870, 140)
];
