// Firemaking training methods used by the Firemaking routes (data/skill-guides.js).
// Levels, XP per log and rates from the wiki's Pay-to-play Firemaking training page, 3 Oct 2026.
// Line burning: 1,485 logs per hour at the Grand Exchange. Wintertodt: XP per hour from the same
// page, split into rounds of about 5 minutes (12 per hour); the supply crates aren't counted.

const GUIDE = "https://oldschool.runescape.wiki/w/Pay-to-play_Firemaking_training";

const burn = (id, name, level, log, xp) => ({
  id: `fm-${id}`,
  name: `Burning ${name}`,
  tags: ["training"],
  guide: GUIDE,
  reqs: { skills: { Firemaking: level }, items: ["Tinderbox"] },
  action: "log",
  actionLabel: "Logs per hour",
  actionsPerHour: 1485,
  presets: [["Line burning", 1485], ["Relaxed", 1200], ["Forester's campfire (AFK)", 665]],
  inputs: [{ name: log, qty: 1 }],
  outputs: [],
  xp: { Firemaking: xp },
  note: "Line burning: stand at the east side of the Grand Exchange, take 27 logs and a tinderbox, and light them one after another while you walk west; bank and repeat on the next row. For an AFK alternative, throw the same logs on a Forester's campfire (button above): the same XP per log, but only about 665 logs an hour."
});

const todt = (id, band, level, xpHr, wcHr) => ({
  id: `fm-wintertodt-${id}`,
  name: `Wintertodt (Firemaking ${band})`,
  tags: ["training"],
  guide: "https://oldschool.runescape.wiki/w/Wintertodt",
  reqs: { skills: { Firemaking: level }, items: ["Axe", "Tinderbox", "Knife", "Hammer", "Food"] },
  action: "round",
  actionLabel: "Rounds per hour",
  actionsPerHour: 12,
  presets: [["Steady", 12], ["Relaxed", 10]],
  inputs: [],
  outputs: [],
  xp: { Firemaking: Math.round(xpHr / 12), Woodcutting: Math.round(wcHr / 12) },
  note: `A boss you fight with the other players in the Wintertodt camp, north of Kourend. Chop bruma roots, fletch them into kindling and feed the braziers. Every round with at least 500 points gives a supply crate with logs, ores, gems, herbs, seeds, fish and coins. The crates are NOT counted here, so the real profit is better than shown, and they're great for unlocks. Very low effort. About ${Math.round(xpHr / 1000)}K Firemaking XP per hour at this level; it goes up as you level, which is why there are three versions.`
});

export default [
  burn("logs", "logs", 1, "Logs", 40),
  burn("oak-logs", "oak logs", 15, "Oak logs", 60),
  burn("willow-logs", "willow logs", 30, "Willow logs", 90),
  burn("teak-logs", "teak logs", 35, "Teak logs", 105),
  burn("arctic-pine-logs", "arctic pine logs", 42, "Arctic pine logs", 125),
  burn("maple-logs", "maple logs", 45, "Maple logs", 135),
  burn("mahogany-logs", "mahogany logs", 50, "Mahogany logs", 157.5),
  burn("yew-logs", "yew logs", 60, "Yew logs", 202.5),
  burn("magic-logs", "magic logs", 75, "Magic logs", 303.8),
  burn("redwood-logs", "redwood logs", 90, "Redwood logs", 350),

  todt("50", "50–69", 50, 161000, 10000),
  todt("70", "70–89", 70, 226000, 15000),
  todt("90", "90–99", 90, 290000, 19000)
];
