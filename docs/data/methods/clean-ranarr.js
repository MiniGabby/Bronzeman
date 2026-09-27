export default {
  id: "clean-ranarr",
  name: "Cleaning grimy ranarr weed",
  tags: ["money"],
  guide: "https://oldschool.runescape.wiki/w/Money_making_guide/Cleaning_grimy_ranarr_weed",
  reqs: { skills: { Herblore: 25 }, quests: ["Druidic Ritual"] },
  action: "herb",
  actionLabel: "Herbs per hour",
  actionsPerHour: 5000,
  presets: [["Wiki pace", 5000], ["Fast", 7000], ["Relaxed", 3500]],
  inputs:  [{ id: 207, qty: 1 }],   // Grimy ranarr weed
  outputs: [{ id: 257, qty: 1 }],   // Ranarr weed
  xp: { Herblore: 7.5 },
  note: "Needs a lot of cash: about 28M of grimy ranarr per 5,000 herbs, for a small margin per herb. The buy limit is around 11,000 to 12,000 per 4 hours, so you can clean faster than you can buy. Test a small batch first."
};
