export default {
  id: "aerial-fishing",
  name: "Aerial fishing",
  tags: ["money"],
  guide: "https://oldschool.runescape.wiki/w/Money_making_guide/Aerial_fishing",
  reqs: { skills: { Fishing: 43, Hunter: 35 } },
  action: "catch",
  actionLabel: "Catches per hour",
  actionsPerHour: 2000,
  presets: [["Wiki pace", 2400], ["Steady", 2000], ["Relaxed", 1500]],
  inputs:  [{ id: 11334, qty: 0.286 }],   // Fish offcuts (bait)
  outputs: [{ id: 30900, qty: 1.5 }],     // Shark lure
  xp: { Fishing: 11.5, Hunter: 16.5 },
  note: "Profit comes from trading Molch pearls for shark lures (100 per pearl). Around Fishing 43 and Hunter 42 about 1 in 66 catches gives a pearl, which is 1.5 lures per catch. At 99/99 it is 1 in 50. XP is for bluegill, the fish you catch at these levels. Fish offcuts come from filleting your own catches with a knife."
};
