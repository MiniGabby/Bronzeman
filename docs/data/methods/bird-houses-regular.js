export default {
  id: "bird-houses-regular",
  name: "Bird house runs (regular bird houses)",
  tags: ["training"],
  guide: "https://oldschool.runescape.wiki/w/Bird_house_trapping",
  reqs: { skills: { Hunter: 5, Crafting: 5 }, quests: ["Bone Voyage"] },
  action: "run",
  actionLabel: "Runs per hour",
  // A run is 4 bird houses on Fossil Island; they take about 50 minutes to fill,
  // so at most 1.2 runs per hour of real time. Each run takes only a minute or two of play.
  actionsPerHour: 1.2,
  presets: [["Every 50 min", 1.2], ["Now and then", 0.6]],
  inputs: [
    { id: 1511, qty: 4 },    // Logs
    { id: 8792, qty: 4 },    // Clockwork
    { id: 5318, qty: 40 }    // Potato seed (bait, 10 per house)
  ],
  outputs: [],
  xp: { Hunter: 448, Crafting: 60 },
  note: "Almost no clicking: set 4 houses, do something else, collect about 50 minutes later. Per hour here means real time, not play time. Bird nests are not counted: at low levels they are a bonus, and seed nests help with bronzeman unlocks. Crafting XP counts only if you craft the houses yourself. Better houses need higher Hunter and Crafting: oak at 14/15, willow at 24/25, teak at 34/35."
};
