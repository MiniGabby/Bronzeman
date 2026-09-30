// Crafting jewellery at a furnace: a gold bar (and a cut gem) with the right mould.
// Rates and XP from the wiki money making guides (30 Sep 2026): about 1,400 gold pieces
// or 1,200 gem pieces per hour at the Edgeville furnace, the closest to a bank without requirements.
const piece = (id, name, level, gem, output, mould, xp, perHour) => ({
  id: `craft-${id}`,
  name: `Crafting ${name}`,
  tags: ["money", "training"],
  guide: `https://oldschool.runescape.wiki/w/Money_making_guide/Crafting_${gem ? gem.toLowerCase() + "_jewellery" : name.startsWith("gold bracelets") ? "gold_bracelets" : "gold_jewellery"}`,
  reqs: { skills: { Crafting: level }, items: [mould] },
  action: "piece",
  actionLabel: "Pieces per hour",
  actionsPerHour: perHour,
  presets: [["Wiki pace", perHour], ["Relaxed", Math.round(perHour * 0.75 / 50) * 50]],
  inputs: gem ? [{ name: "Gold bar", qty: 1 }, { name: gem, qty: 1 }] : [{ name: "Gold bar", qty: 1 }],
  outputs: [{ name: output, qty: 1 }],
  xp: { Crafting: xp },
  note: `Use the Edgeville furnace: it's the closest to a bank without requirements. Run only on the way back to the bank to save energy. Check "Traded / hr" before making a lot: not every piece sells ${perHour.toLocaleString("en-US")} an hour.`
});

export default [
  piece("gold-necklaces", "gold necklaces", 6, null, "Gold necklace", "Necklace mould", 20, 1400),
  piece("gold-bracelets", "gold bracelets", 7, null, "Gold bracelet", "Bracelet mould", 25, 1400),
  piece("emerald-bracelets", "emerald bracelets", 30, "Emerald", "Emerald bracelet", "Bracelet mould", 60, 1200),
  piece("emerald-amulets", "emerald amulets (u)", 31, "Emerald", "Emerald amulet (u)", "Amulet mould", 70, 1200),
  piece("ruby-bracelets", "ruby bracelets", 42, "Ruby", "Ruby bracelet", "Bracelet mould", 80, 1200),
  piece("ruby-amulets", "ruby amulets (u)", 50, "Ruby", "Ruby amulet (u)", "Amulet mould", 85, 1200),
  piece("diamond-necklaces", "diamond necklaces", 56, "Diamond", "Diamond necklace", "Necklace mould", 90, 1200)
];
