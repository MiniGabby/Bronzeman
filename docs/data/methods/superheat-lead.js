export default {
  id: "superheat-lead",
  name: "Superheating lead bars",
  tags: ["money"],
  guide: "https://oldschool.runescape.wiki/w/Lead_bar",
  reqs: { skills: { Magic: 43, Smithing: 25 }, items: ["Staff of fire"] },
  action: "cast",
  actionLabel: "Casts per hour",
  actionsPerHour: 1400,
  presets: [["Efficient", 1700], ["Steady", 1400], ["Relaxed", 1100]],
  inputs:  [{ id: 31716, qty: 2 }, { id: 561, qty: 1 }],   // Lead ore, Nature rune
  outputs: [{ id: 32889, qty: 1 }],                         // Lead bar
  xp: { Magic: 53, Smithing: 15.5 },
  note: "The wiki has no money making guide for this, so the casts per hour are an estimate: one inventory holds 13 bars' worth of ore, so you bank often. With a staff of fire the 4 fire runes per cast are free. Lead is a newer Sailing item and trades thinly, so check that your offers fill."
};
