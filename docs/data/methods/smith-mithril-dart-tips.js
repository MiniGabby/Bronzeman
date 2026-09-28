export default {
  id: "smith-mithril-dart-tips",
  name: "Smithing Mithril dart tips",
  tags: ["money", "training"],
  guide: "https://oldschool.runescape.wiki/w/Money_making_guide/Smithing_mithril_dart_tips",
  reqs: { skills: { Smithing: 54 }, quests: ["The Tourist Trap"], items: ["Hammer"] },
  action: "bar",
  actionLabel: "Bars per hour",
  actionsPerHour: 950,
  presets: [["Wiki pace", 950], ["Prifddinas", 1000], ["Relaxed", 700]],
  inputs:  [{ id: 2359, qty: 1 }],    // Mithril bar
  outputs: [{ id: 822, qty: 10 }],   // Mithril dart tip (10 per bar)
  xp: { Smithing: 50 },
  note: "Smith dart tips at an anvil next to a bank: Varrock west bank is the best spot without requirements. Each bar makes 10 dart tips. The wiki marks this guide as obsolete: the margin per bar is small, so check prices before buying bars in bulk."
};
