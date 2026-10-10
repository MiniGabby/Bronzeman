// Smithing training methods used by the Smithing routes (data/skill-guides.js).
// Items are referenced by exact GE name. XP per bar at the anvil: iron 25, steel 37.5,
// mithril 50, adamant 62.5. Every anvil action takes the same time (5 ticks), so items
// that use more bars give more XP per hour: a platebody (5 bars) beats a warhammer (3 bars).

const ANVIL_GUIDE = "https://oldschool.runescape.wiki/w/Pay-to-play_Smithing_training";
const BF_GUIDE = "https://oldschool.runescape.wiki/w/Blast_Furnace";
const BF_FEES = [{ label: "Blast Furnace coffer", perHour: 72000 }];
const BF_NOTE = "At the Blast Furnace in Keldagrim (start The Giant Dwarf to get in). Put coins in the coffer: 72K per hour. Below Smithing 60 the foreman also charges 2,500 coins per 10 minutes (15K per hour), which isn't counted here. Ice gloves let you take the bars straight away; without them, use a bucket of water on the bar dispenser. Stamina potions make it faster; energy potions work too.";

const anvil = (id, name, level, bar, product, bars, xpPerBar, perHour, note) => ({
  id: `smith-${id}`,
  name: `Smithing ${name}`,
  tags: ["training"],
  guide: ANVIL_GUIDE,
  reqs: { skills: { Smithing: level }, items: ["Hammer"] },
  action: "item",
  actionLabel: "Items per hour",
  actionsPerHour: perHour,
  presets: [["Steady", perHour], ["Relaxed", Math.round(perHour * 0.8 / 10) * 10]],
  inputs: [{ name: bar, qty: bars }],
  outputs: [{ name: product, qty: 1 }],
  xp: { Smithing: bars * xpPerBar },
  note: `Use the anvil next to Varrock west bank (or Prifddinas if you have it). ${note} The GE buys only a few of these per hour; whatever doesn't sell can be high alched (see the Alchemy tab).`
});

// Without a coal bag you carry 28 items per trip instead of 27 in the inventory plus 27 coal in the bag,
// so the same number of trips gives 28/54 of the bars. Gold bars use no coal, so they have no switch.
const COAL_BAG = { key: "coalBag", label: "Coal bag", factor: 28 / 54, item: "Coal bag",
  note: "Without a coal bag: you carry 28 items per trip instead of 54, so you make about half the bars per hour. The coffer costs the same 72K per hour, so it weighs twice as heavily. The coal bag costs 100 golden nuggets at the Motherlode Mine (about 5 to 6 hours of mining there)." };

const blast = (id, name, level, ores, bar, xp, perHour, extra = {}) => ({
  id: `bf-${id}`,
  name: `Blast Furnace ${name}`,
  tags: ["money", "training"],
  guide: BF_GUIDE,
  reqs: { skills: { Smithing: level }, quests: ["The Giant Dwarf (started)"], items: ["Coal bag", "Ice gloves or bucket of water"], ...extra.reqs },
  action: "bar",
  actionLabel: "Bars per hour",
  actionsPerHour: perHour,
  presets: [["Steady", perHour], ["Fast, with staminas", Math.round(perHour * 1.2 / 100) * 100], ["Without stamina", Math.round(perHour * 0.8 / 100) * 100]],
  inputs: ores,
  outputs: [{ name: bar, qty: 1 }],
  fees: BF_FEES,
  ...(ores.some(o => o.name === "Coal") ? { toggle: COAL_BAG } : {}),
  xp: { Smithing: xp },
  note: `${extra.note ? extra.note + " " : ""}${BF_NOTE}`,
  ...(extra.routeAlt === false ? { routeAlt: false } : {})
});

export default [
  anvil("iron-warhammers", "iron warhammers", 24, "Iron bar", "Iron warhammer", 3, 25, 900,
    "Three bars each: a short bridge until iron platebodies at level 33."),
  anvil("iron-platebodies", "iron platebodies", 33, "Iron bar", "Iron platebody", 5, 25, 750,
    "Five bars each, so a full inventory is 5 platebodies and about 15 seconds of smithing."),
  anvil("steel-platebodies", "steel platebodies", 48, "Steel bar", "Steel platebody", 5, 37.5, 750,
    "Five bars each, so a full inventory is 5 platebodies and about 15 seconds of smithing."),
  anvil("mithril-platebodies", "mithril platebodies", 68, "Mithril bar", "Mithril platebody", 5, 50, 750,
    "Five bars each, so a full inventory is 5 platebodies and about 15 seconds of smithing."),
  anvil("adamant-platebodies", "adamant platebodies", 88, "Adamantite bar", "Adamant platebody", 5, 62.5, 750,
    "Five bars each. Adamant platebodies alch for close to what the bars cost, so this is the cheapest stretch of the anvil route."),

  blast("gold-bars", "gold bars (goldsmith gauntlets)", 40, [{ name: "Gold ore", qty: 1 }], "Gold bar", 56.2, 5400, {
    reqs: { quests: ["The Giant Dwarf (started)", "Family Crest"], items: ["Goldsmith gauntlets", "Ice gloves or bucket of water"] },
    note: "The fastest normal way to train Smithing, but it costs money. Goldsmith gauntlets (reward from Family Crest: Crafting 40, Smithing 40, Mining 40, Magic 59) raise the XP from 22.5 to 56.2 per bar; without them this isn't worth it. No coal needed. The gold bars are perfect for jewellery crafting.",
    routeAlt: false
  }),
  blast("steel-bars", "steel bars", 30, [{ name: "Iron ore", qty: 1 }, { name: "Coal", qty: 1 }], "Steel bar", 17.5, 5000, {
    note: "The Blast Furnace halves the coal: 1 coal per iron ore instead of 2."
  }),
  blast("mithril-bars", "mithril bars", 50, [{ name: "Mithril ore", qty: 1 }, { name: "Coal", qty: 2 }], "Mithril bar", 30, 3500, {
    note: "2 coal per mithril ore at the Blast Furnace (4 at a normal furnace)."
  }),
  blast("adamantite-bars", "adamantite bars", 70, [{ name: "Adamantite ore", qty: 1 }, { name: "Coal", qty: 3 }], "Adamantite bar", 37.5, 2700, {
    note: "3 coal per adamantite ore at the Blast Furnace (6 at a normal furnace)."
  }),
  blast("runite-bars", "runite bars", 85, [{ name: "Runite ore", qty: 1 }, { name: "Coal", qty: 4 }], "Runite bar", 50, 2000, {
    note: "4 coal per runite ore at the Blast Furnace (8 at a normal furnace)."
  })
];
