export default {
  id: "smith-steel-dart-tips",
  name: "Smithing Steel dart tips",
  tags: ["money", "training"],
  guide: "https://oldschool.runescape.wiki/w/Money_making_guide/Smithing_steel_dart_tips",
  reqs: { skills: { Smithing: 34 }, quests: ["The Tourist Trap"], items: ["Hammer"] },
  action: "bar",
  actionLabel: "Bars per hour",
  actionsPerHour: 950,
  presets: [["Wiki pace", 950], ["Prifddinas", 1000], ["Relaxed", 700]],
  inputs:  [{ id: 2353, qty: 1 }],    // Steel bar
  outputs: [{ id: 821, qty: 10 }],   // Steel dart tip (10 per bar)
  xp: { Smithing: 37.5 },
  note: "Smith dart tips at an anvil next to a bank: Varrock west bank is the best spot without requirements. Each bar makes 10 dart tips."
};
