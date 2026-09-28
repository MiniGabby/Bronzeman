export default {
  id: "smith-iron-dart-tips",
  name: "Smithing Iron dart tips",
  tags: ["money", "training"],
  guide: "https://oldschool.runescape.wiki/w/Money_making_guide/Smithing_iron_dart_tips",
  reqs: { skills: { Smithing: 19 }, quests: ["The Tourist Trap"], items: ["Hammer"] },
  action: "bar",
  actionLabel: "Bars per hour",
  actionsPerHour: 950,
  presets: [["Wiki pace", 950], ["Prifddinas", 1000], ["Relaxed", 700]],
  inputs:  [{ id: 2351, qty: 1 }],    // Iron bar
  outputs: [{ id: 820, qty: 10 }],   // Iron dart tip (10 per bar)
  xp: { Smithing: 25 },
  note: "Smith dart tips at an anvil next to a bank: Varrock west bank is the best spot without requirements. Each bar makes 10 dart tips."
};
