// Construction training methods used by the Construction routes (data/skill-guides.js).
// Levels, planks and XP from the wiki's Construction training page, 5 Oct 2026.
// Builds per hour are worked back from the wiki's XP per hour; the fast ones need a demon butler
// (Construction 50) to fetch planks, so below 50 they're slower. The butler's wage isn't counted.

const GUIDE = "https://oldschool.runescape.wiki/w/Construction_training";
const NOTE_HOUSE = "Build in your own house (buy one from an estate agent for 1,000 coins) in building mode, with a saw and a hammer.";
const BUTLER = "A demon butler (Construction 50, hire him at the estate agent) fetches planks from the bank while you keep building: that's what makes this fast. Build, remove, build again.";

const build = (id, name, level, plank, planks, nails, xp, perHour, note, extra = {}) => ({
  id: `con-${id}`,
  name: `Building ${name}`,
  tags: ["training"],
  guide: extra.guide || GUIDE,
  reqs: { skills: { Construction: level }, items: ["Saw", "Hammer", ...(extra.items || [])] },
  action: "build",
  actionLabel: "Builds per hour",
  actionsPerHour: perHour,
  presets: extra.presets || [["Steady", perHour], ["Relaxed", Math.round(perHour * 0.7 / 10) * 10]],
  inputs: [{ name: plank, qty: planks }, ...(nails ? [{ name: "Steel nails", qty: nails }] : [])],
  outputs: [],
  xp: { Construction: xp },
  note: `${note} ${NOTE_HOUSE}`
});

export default [
  build("crude-chairs", "crude wooden chairs", 1, "Plank", 2, 2, 58, 500,
    "Only for the first few levels: plain planks and steel nails."),
  build("wooden-bookcases", "wooden bookcases", 4, "Plank", 4, 4, 115, 450,
    "Bookcases in the parlour. Plain planks and steel nails."),
  build("wooden-larders", "wooden larders", 9, "Plank", 8, 0, 228, 300,
    "Larders in the kitchen: 8 planks each, no nails."),
  build("oak-dining-tables", "oak dining tables", 22, "Oak plank", 4, 0, 240, 350,
    "Dining tables in the dining room. Oak planks: buy them, or take oak logs to the sawmill in Varrock (250 coins each)."),
  build("oak-larders", "oak larders", 33, "Oak plank", 8, 0, 480, 1000,
    `The classic cheap Construction method. ${BUTLER}`,
    { presets: [["With demon butler", 1000], ["Without butler", 400]] }),
  build("mahogany-tables", "mahogany tables", 52, "Mahogany plank", 6, 0, 840, 1070,
    `Very fast but expensive. ${BUTLER}`,
    { presets: [["With demon butler", 1070], ["Relaxed", 750]] }),
  build("oak-dungeon-doors", "oak dungeon doors", 74, "Oak plank", 10, 0, 600, 920,
    `Cheaper than mahogany, about 550K XP per hour. Needs a dungeon in your house. ${BUTLER}`,
    { presets: [["With demon butler", 920], ["Relaxed", 650]] }),
  build("gnome-benches", "gnome benches", 77, "Mahogany plank", 6, 0, 840, 1300,
    `The fastest Construction XP: two bench spots next to each other in the dining room, remove one while you build the other. ${BUTLER}`,
    { presets: [["With demon butler", 1300], ["Relaxed", 900]] })
];
