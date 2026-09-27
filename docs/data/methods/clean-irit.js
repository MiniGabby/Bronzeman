export default {
  id: "clean-irit",
  name: "Cleaning grimy irit leaves",
  tags: ["money"],
  guide: "https://oldschool.runescape.wiki/w/Money_making_guide/Cleaning_grimy_irit_leaves",
  reqs: { skills: { Herblore: 40 }, quests: ["Druidic Ritual"] },
  action: "herb",
  actionLabel: "Herbs per hour",
  actionsPerHour: 5000,
  presets: [["Wiki pace", 5000], ["Fast", 7000], ["Relaxed", 3500]],
  inputs:  [{ id: 209, qty: 1 }],   // Grimy irit leaf
  outputs: [{ id: 259, qty: 1 }],   // Irit leaf
  xp: { Herblore: 8.8 },
  note: "An inventory of 28 herbs takes 10 to 20 seconds to clean. The buy limit is 13,000 grimy irit per 4 hours, so you can clean faster than you can buy. Use mouse keys to spare your wrist."
};
