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

// Mahogany Homes: contracts for homeowners in Falador, Varrock, East Ardougne and Hosidius.
// Planks, steel bars and XP per contract are the wiki's averages over every house layout (Mahogany Homes
// page, 10 Oct 2026); contracts per hour are its XP per hour divided by the XP per contract.
const homes = (id, tier, level, plank, planks, bars, xp, xpHr, sackHr, extra) => {
  const perHour = Math.round(xpHr / xp), sack = Math.round(sackHr / xp);
  return {
    id: `con-homes-${id}`,
    name: `Mahogany Homes: ${tier} contracts`,
    tags: ["training"],
    guide: "https://oldschool.runescape.wiki/w/Mahogany_Homes",
    reqs: { skills: { Construction: level }, items: ["Saw", "Hammer", "Teleports to Falador, Varrock, Ardougne and Hosidius"] },
    action: "contract",
    actionLabel: "Contracts per hour",
    actionsPerHour: perHour,
    presets: [["Steady", perHour], ["With a plank sack", sack], ["Relaxed", Math.round(perHour * 0.75)]],
    inputs: [{ name: plank, qty: planks }, { name: "Steel bar", qty: bars }],
    outputs: [],
    xp: { Construction: xp },
    note: `Talk to Amy just south of Falador Park and she sends you to a house in Falador, Varrock, East Ardougne or Hosidius. Fix or rebuild the marked furniture, talk to the owner, and go back for the next contract. You use far fewer planks per XP than in your own house, because every finished contract gives a big bonus, and you don't need a house or a butler. An average ${tier.toLowerCase()} contract takes ${planks} ${plank.toLowerCase()}s and now and then a steel bar, for ${xp.toLocaleString("en-US")} XP: about ${Math.round(xpHr / 1000)}K XP per hour, more with the plank sack (350 carpenter points) and good teleports. The points also buy the carpenter's outfit (2.5% more XP) and Amy's saw. ${extra}`
  };
};

export default [
  homes("beginner", "Beginner", 1, "Plank", 10.06, 0.40, 879.3, 32500, 37500,
    "Plain planks, which are already unlocked: a cheap way through the first 20 levels."),
  homes("novice", "Novice", 20, "Oak plank", 10.09, 0.40, 1894.1, 70000, 80000,
    "Oak planks are already unlocked, so this is the tier the group can do right now. You can stay on novice contracts after 50 if teak planks are still locked or too expensive."),
  homes("adept", "Adept", 50, "Teak plank", 11.63, 0.49, 3260.2, 140000, 177500,
    "Teak planks: nobody has unlocked them yet (see the tip)."),
  homes("expert", "Expert", 70, "Mahogany plank", 12.85, 0.52, 4378.8, 177500, 230000,
    "Mahogany planks: nobody has unlocked them yet (see the tip)."),

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
