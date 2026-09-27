export default {
  id: "clean-harralander",
  name: "Cleaning grimy harralander",
  tags: ["money"],
  guide: "https://oldschool.runescape.wiki/w/Money_making_guide/Cleaning_grimy_harralander",
  reqs: { skills: { Herblore: 20 }, quests: ["Druidic Ritual"] },
  action: "herb",
  actionLabel: "Herbs per hour",
  actionsPerHour: 5000,
  presets: [["Wiki pace", 5000], ["Fast", 7000], ["Relaxed", 3500]],
  inputs:  [{ id: 205, qty: 1 }],   // Grimy harralander
  outputs: [{ id: 255, qty: 1 }],   // Harralander
  xp: { Herblore: 6.3 },
  note: "An inventory of 28 herbs takes 10 to 20 seconds to clean. Use mouse keys to spare your wrist."
};
