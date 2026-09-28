export default {
  id: "smith-bronze-dart-tips",
  name: "Smithing Bronze dart tips",
  tags: ["money", "training"],
  guide: "https://oldschool.runescape.wiki/w/Money_making_guide/Smithing_bronze_dart_tips",
  reqs: { skills: { Smithing: 4 }, quests: ["The Tourist Trap"], items: ["Hammer"] },
  action: "bar",
  actionLabel: "Bars per hour",
  actionsPerHour: 950,
  presets: [["Wiki pace", 950], ["Prifddinas", 1000], ["Relaxed", 700]],
  inputs:  [{ id: 2349, qty: 1 }],    // Bronze bar
  outputs: [{ id: 819, qty: 10 }],   // Bronze dart tip (10 per bar)
  xp: { Smithing: 12.5 },
  note: "Smith dart tips at an anvil next to a bank: Varrock west bank is the best spot without requirements. Each bar makes 10 dart tips."
};
