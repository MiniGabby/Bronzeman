export default {
  id: "sapphire-rings",
  name: "Enchanting sapphire rings",
  tags: ["money"],
  guide: "https://oldschool.runescape.wiki/w/Money_making_guide/Enchanting_sapphire_rings",
  reqs: { skills: { Magic: 7 }, items: ["Staff of water"] },
  action: "cast",
  actionLabel: "Casts per hour",
  actionsPerHour: 1900,
  presets: [["Focused", 1900], ["AFK, fast banking", 800], ["AFK", 700]],
  inputs:  [{ id: 1637, qty: 1 }, { id: 564, qty: 1 }],   // Sapphire ring, Cosmic rune
  outputs: [{ id: 2550, qty: 1 }],                         // Ring of recoil
  xp: { Magic: 17.5 },
  note: "Lvl-1 Enchant. The jewellery market swings a lot, so test a small batch first."
};
