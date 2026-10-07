// Agility training methods used by the Agility routes (data/skill-guides.js).
// Levels, XP per lap and rates from the wiki, 7 Oct 2026 (Pay-to-play Agility training, Rooftop Agility
// Courses, Mark of Grace and the course pages). Laps per hour are the wiki's XP per hour divided by the
// XP per lap, so they include the odd failed obstacle; the "Perfect laps" button is the wiki's maximum.
// Agility has nothing to buy. What you earn besides XP:
//   - marks of grace (rooftops, Werewolf course): counted as amylase crystals, 10 per mark, sold on the GE;
//   - coins (Agility Pyramid: 10,000 per pyramid top);
//   - loot (Wilderness course dispenser), per item at live prices.
// Hallowed Sepulchre coffins, Prifddinas crystal shards and Brimhaven vouchers aren't counted.

const GUIDE = "https://oldschool.runescape.wiki/w/Pay-to-play_Agility_training";
const MARKS = "Marks of grace are counted here as amylase crystals (10 crystals per mark from Grace in the Rogues' Den, sold on the GE). Until you have the graceful outfit (260 marks) you'll want to keep the marks, so then the profit shown isn't real money yet.";
const NERF = "20 levels above the course's requirement you only get a fifth of the marks.";

// One amylase crystal per 1/10 mark of grace; marksHr is the wiki's estimate at `laps` laps per hour.
const amylase = (marksHr, laps) => [{ name: "Amylase crystal", qty: marksHr * 10 / laps }];

const rooftop = (id, name, level, xpLap, laps, maxLaps, marksHr, where, extra = {}) => ({
  id: `agi-${id}`,
  name: `${name} Rooftop Course`,
  tags: ["training"],
  guide: `https://oldschool.runescape.wiki/w/${name.replace(/ /g, "_").replace(/'/g, "%27")}_Rooftop_Course`,
  reqs: { skills: { Agility: level }, ...(extra.quests ? { quests: extra.quests } : {}), items: extra.items || ["Graceful outfit (optional)"] },
  action: "lap",
  actionLabel: "Laps per hour",
  actionsPerHour: laps,
  presets: [["Steady", laps], ["Perfect laps", maxLaps], ...(extra.presets || []), ["Relaxed", Math.round(laps * 0.8)]],
  inputs: [],
  outputs: amylase(marksHr, laps),
  ledger: "hour",
  xp: { Agility: xpLap },
  note: `${where} ${xpLap} XP per lap and about ${marksHr} marks of grace per hour. ${MARKS}${extra.nerf === false ? "" : ` ${NERF}`}${extra.note ? ` ${extra.note}` : ""}`
});

const pyramid = (level, band, tops, xpHr, fails) => ({
  id: `agi-pyramid-${level}`,
  name: `Agility Pyramid (Agility ${band})`,
  tags: ["money", "training"],
  guide: "https://oldschool.runescape.wiki/w/Agility_Pyramid",
  reqs: { skills: { Agility: level }, items: ["Waterskins", "Food"] },
  action: "pyramid top",
  actionLabel: "Pyramid tops per hour",
  actionsPerHour: tops,
  presets: [["Steady", tops], ["Relaxed", Math.round(tops * 0.8)]],
  inputs: [],
  outputs: [],
  coins: 10000,
  coinsLabel: "Simon Templeton, per pyramid top",
  xp: { Agility: Math.round(xpHr / tops) },
  note: `A pyramid in the desert between Sophanem and Nardah (fly the magic carpet to Nardah or Sophanem, or walk from the Shantay Pass). Climb to the top, TAKE THE PYRAMID TOP before you go through the doorway, and sell the tops to Simon Templeton at the foot of the pyramid for 10,000 coins each: coins, so nothing to sell on the GE. ${fails} About ${Math.round(xpHr / 1000)}K XP per hour at these levels. The desert heat drains you: bring waterskins (fill them in Nardah) and food. The XP per top here includes the obstacles on the way up.`
});

const sepulchre = (floor, level, band, xpRun, xpHr) => ({
  id: `agi-sepulchre-${level}`,
  name: `Hallowed Sepulchre (floor${floor > 1 ? `s 1–${floor}` : " 1"}, Agility ${band})`,
  tags: ["training"],
  guide: "https://oldschool.runescape.wiki/w/Hallowed_Sepulchre/Strategies",
  reqs: { skills: { Agility: level }, quests: ["Sins of the Father"], items: ["Stamina potions", "Food (while learning)"] },
  action: "run",
  actionLabel: "Runs per hour",
  actionsPerHour: Math.round(xpHr / xpRun * 10) / 10,
  presets: [["Practised", Math.round(xpHr / xpRun * 10) / 10], ["Learning", Math.round(xpHr / xpRun * 7) / 10]],
  inputs: [],
  outputs: [],
  xp: { Agility: xpRun },
  note: `Under Darkmeyer, after Sins of the Father. Run floor${floor > 1 ? `s 1 to ${floor}` : " 1"} against the clock while you dodge the traps: ${xpRun.toLocaleString("en-US")} XP per run, about ${Math.round(xpHr / 1000)}K XP per hour once you know the floors (the wiki's rate for a practised player; count on a lot less while you learn, use the Learning button). The fastest Agility XP in the game from 62. Hallowed marks and coffin loot aren't counted here.`
});

// Wilderness course loot per lap with a 61+ lap streak (wiki money making guide), scaled down because
// the first 60 laps of every trip pay 1x, 2x and 3x instead of 4x: about 0.8 over a two-hour trip.
const STREAK = 0.8;
const fish = 17 * (8 / 31) + 5 / 16;
const WILDY_LOOT = [
  ["Rune kiteshield", 3 / 10], ["Rune chainbody", 3 / 10], ["Rune med helm", 1 / 10],
  ["Adamant platebody", 1 / 10], ["Adamant platelegs", 1 / 20], ["Adamant full helm", 1 / 20],
  ["Mithril plateskirt", 1 / 20], ["Mithril platelegs", 1 / 20],
  ["Blighted super restore(4)", 6 * (7 / 31) + 1 / 16],
  ["Blighted anglerfish", fish], ["Blighted manta ray", fish], ["Blighted karambwan", fish]
].map(([name, qty]) => ({ name, qty: qty * STREAK }));

export default [
  rooftop("draynor", "Draynor Village", 1, 120, 79, 83, 11.7,
    "Starts at the rough wall of the house east of the Draynor bank."),
  rooftop("al-kharid", "Al Kharid", 20, 216, 53, 56, 10.9,
    "Starts at the rough wall just south of the Al Kharid gate, north of the palace."),
  rooftop("varrock", "Varrock", 30, 270, 46, 55, 9.6,
    "Starts at the rough wall next to the general store, just south-west of Varrock square."),
  rooftop("canifis", "Canifis", 40, 240, 65, 82, 14,
    "Starts at the tall tree just north of the Canifis bank (you need to be able to get into Morytania: Priest in Peril).",
    { quests: ["Priest in Peril"], nerf: false, note: "The best course for marks of grace until 90: a mark spawns twice as often here, and the rate does NOT drop when you're 20 levels above it. Slow XP though, so move on to Falador at 50 unless you're here for the graceful outfit." }),
  rooftop("falador", "Falador", 50, 586, 54, 62, 10.5,
    "Starts at the rough wall south of the eastern Falador bank."),
  rooftop("seers", "Seers' Village", 60, 570, 74, 82, 12.4,
    "Starts at the wall of the Seers' Village bank.",
    { presets: [["Camelot teleport (hard diary)", 100]], note: "With the hard Kandarin Diary you can set Camelot Teleport to land next to the bank and teleport after every lap: about 58K XP per hour instead of 42K (button above). Each Kandarin Diary tier also adds a few marks." }),
  rooftop("pollnivneach", "Pollnivneach", 70, 890, 55, 59, 13.5,
    "Starts at the basket in the south of Pollnivneach (magic carpet from the Shantay Pass).",
    { note: "The hard Desert Diary raises it to 1,016 XP per lap and gives more marks." }),
  rooftop("rellekka", "Rellekka", 80, 780, 66, 70, 14,
    "Starts at the rough wall in the south of Rellekka (you need The Fremennik Trials to get around town freely).",
    { note: "The hard Fremennik Diary raises it to 920 XP per lap and gives more marks." }),
  rooftop("ardougne", "Ardougne", 90, 889, 76, 79, 17.3,
    "Starts at the wooden beams in the East Ardougne market, by the gem stall.",
    { nerf: false, note: "Marks always land on the same tile and stack, so you can leave them until you stop. The elite Ardougne Diary gives about 21 marks per hour." }),

  {
    id: "agi-brimhaven-spikes",
    name: "Brimhaven Agility Arena: floor spikes",
    tags: ["training"],
    guide: "https://oldschool.runescape.wiki/w/Brimhaven_Agility_Arena",
    reqs: { skills: { Agility: 20 }, items: ["200 coins entry fee", "Food"] },
    action: "jump",
    actionLabel: "Jumps per hour",
    actionsPerHour: 1300,
    presets: [["Steady", 1300], ["Full focus", 1500], ["Relaxed", 1000]],
    inputs: [],
    outputs: [],
    xp: { Agility: 24 },
    note: "Under Brimhaven on Karamja; pay Cap'n Izzy No-Beard 200 coins to go down (not counted here). Jump back and forth over the floor spikes just south-west of the entrance: 24 XP per jump, 30K to 36K XP per hour, much faster than the rooftops below 47, and you barely have to look. You fail now and then, so bring some food. Tag a ticket dispenser when the yellow arrow is close by for a bit extra. No marks of grace here."
  },
  {
    id: "agi-brimhaven-arena",
    name: "Brimhaven Agility Arena: tickets",
    tags: ["training"],
    guide: "https://oldschool.runescape.wiki/w/Brimhaven_Agility_Arena",
    reqs: { skills: { Agility: 40 }, items: ["200 coins entry fee", "Food"] },
    action: "ticket",
    actionLabel: "Tickets per hour",
    actionsPerHour: 55,
    presets: [["Steady", 55], ["Every pillar", 60], ["Relaxed", 45]],
    inputs: [],
    outputs: [],
    xp: { Agility: 855 },
    note: "The same arena, played as it's meant to be from level 40 (when you can pass every obstacle): every minute a yellow arrow marks a pillar, tag it for a ticket, and jump the floor spikes while you wait for the next one. Trade the tickets to Pirate Jackie the Fruit for 345 XP each. About 45K to 50K XP per hour; the XP per ticket here includes the obstacles and spikes in between. Karamja gloves 2 or better add 10%. You also get Brimhaven vouchers (amylase packs, graceful recolour), which aren't counted."
  },

  pyramid(30, "30–59", 13, 25000, "At these levels you fall a lot (6 to 12 failed obstacles per climb at 50), so it's slow going at first."),
  pyramid(60, "60–74", 20, 33000, "From 60 you only fail 1 to 4 obstacles per climb."),
  pyramid(75, "75–99", 26, 42100, "From 75 you can't fail any obstacle any more: 26 tops and 260K coins per hour if you keep going."),

  {
    id: "agi-shayzien-advanced",
    name: "Shayzien Advanced Agility Course",
    tags: ["training"],
    guide: "https://oldschool.runescape.wiki/w/Shayzien_Agility_Course",
    reqs: { skills: { Agility: 45 }, items: ["Crossbow", "Mith grapple"] },
    action: "lap",
    actionLabel: "Laps per hour",
    actionsPerHour: 55,
    presets: [["Steady", 55], ["Perfect laps", 59], ["Relaxed", 45]],
    inputs: [],
    outputs: [],
    xp: { Agility: 507.5 },
    note: "In Shayzien in Great Kourend. 507.5 XP per lap, up to 30K XP per hour: faster than Canifis and no quest or Wilderness needed, but no marks of grace. You need a crossbow and a mith grapple for the grapple obstacle. You stop failing around level 64."
  },
  {
    id: "agi-ape-atoll",
    name: "Ape Atoll Agility Course",
    tags: ["training"],
    guide: "https://oldschool.runescape.wiki/w/Ape_Atoll_Agility_Course",
    reqs: { skills: { Agility: 48 }, quests: ["Monkey Madness I"], items: ["Ninja monkey greegree", "Stamina or energy potions"] },
    action: "lap",
    actionLabel: "Laps per hour",
    actionsPerHour: 74,
    presets: [["Agility 48", 57], ["Steady", 74], ["Agility 75+", 95]],
    inputs: [],
    outputs: [],
    xp: { Agility: 580 },
    note: "On Ape Atoll, holding a ninja monkey greegree (far enough into Monkey Madness I to make one). 580 XP per lap: 30K to 35K XP per hour at 48, 40K to 45K later, and 55K from 75 when you stop failing. A safe alternative to the Wilderness course. No marks of grace, and the level can't be boosted."
  },
  {
    id: "agi-wilderness",
    name: "Wilderness Agility Course",
    tags: ["money", "training"],
    guide: "https://oldschool.runescape.wiki/w/Wilderness_Agility_Course",
    reqs: { skills: { Agility: 52 }, items: ["150,000 coins (in your inventory)", "Looting bag", "Summer pies (below 52)"] },
    action: "lap",
    actionLabel: "Laps per hour",
    actionsPerHour: 70,
    presets: [["Steady", 70], ["High level", 80], ["Relaxed", 60]],
    inputs: [],
    outputs: WILDY_LOOT,
    fees: [{ label: "Dispenser fee (once per trip)", perHour: 150000 }],
    ledger: "hour",
    xp: { Agility: 791.4 },
    note: "DEEP WILDERNESS (level 50+): other players can kill you here, so bring nothing you mind losing. The fastest Agility XP from 47 to 62 and by far the best money in the skill. Pay 150,000 coins into the dispenser at the start (from your inventory, with an open looting bag): after every lap it gives noted rune and adamant armour and blighted food and potions, and a ticket. The loot gets better with your lap streak (2x after 15 laps, 3x after 30, 4x after 60) and the fee is lost when you die or leave, so stay for long trips; logging out inside only costs 10 laps of streak. The loot here is the wiki's 61+ streak loot at 80%, and the fee is counted once per hour. XP is 571.4 per lap plus 220 per ticket when you hand in 51 or more at once (230 from 101). You can enter from 47 with a summer pie (+5), but the pipe needs 49. Get there with an Ice Plateau teleport or the Wilderness obelisks."
  },
  {
    id: "agi-wyrm-basic",
    name: "Colossal Wyrm Agility Course (basic)",
    tags: ["training"],
    guide: "https://oldschool.runescape.wiki/w/Colossal_Wyrm_Agility_Course",
    reqs: { skills: { Agility: 50 }, quests: ["Children of the Sun"] },
    action: "lap",
    actionLabel: "Laps per hour",
    actionsPerHour: 46,
    presets: [["Steady", 46], ["Perfect laps", 49], ["Relaxed", 40]],
    inputs: [],
    outputs: [{ name: "Amylase crystal", qty: 2.5 }],
    ledger: "hour",
    xp: { Agility: 633 },
    note: "Around the Colossal Wyrm Remains in the Avium Savannah, Varlamore (Children of the Sun). Very relaxed: few clicks, long animations, and you can't fail. Up to 31K XP per hour. You scoop up termites on the way: 100 termites buy an amylase pack (100 crystals) from Worm Tongue, counted here as about 2.5 crystals per lap, which is a guess. Sell the pack to Grace instead for 8 marks of grace if you still need graceful. Blessed bone shards (Prayer) aren't counted."
  },
  {
    id: "agi-wyrm-advanced",
    name: "Colossal Wyrm Agility Course (advanced)",
    tags: ["training"],
    guide: "https://oldschool.runescape.wiki/w/Colossal_Wyrm_Agility_Course",
    reqs: { skills: { Agility: 62 }, quests: ["Children of the Sun"] },
    action: "lap",
    actionLabel: "Laps per hour",
    actionsPerHour: 39,
    presets: [["Steady", 39], ["Perfect laps", 41], ["Relaxed", 34]],
    inputs: [],
    outputs: [{ name: "Amylase crystal", qty: 3.9 }],
    ledger: "hour",
    xp: { Agility: 1049 },
    note: "The upper route of the Colossal Wyrm course in Varlamore (Children of the Sun), from 62. About 6 clicks per lap with two 20-second stretches where you do nothing, and you can't fail: the most AFK Agility there is, at up to 42K XP per hour. About 3.9 termites per lap (wiki estimate), counted as amylase crystals (100 termites = a pack of 100). Sold to Grace instead, the packs are worth about 12 marks of grace per hour: the best marks until Ardougne at 90."
  },
  {
    id: "agi-werewolf",
    name: "Werewolf Agility Course",
    tags: ["training"],
    guide: "https://oldschool.runescape.wiki/w/Werewolf_Agility_Course",
    reqs: { skills: { Agility: 60 }, quests: ["Creature of Fenkenstrain"], items: ["Ring of charos"] },
    action: "lap",
    actionLabel: "Laps per hour",
    actionsPerHour: 82,
    presets: [["Steady", 82], ["Agility 80+", 94], ["Relaxed", 70]],
    inputs: [],
    outputs: amylase(12.5, 82),
    ledger: "hour",
    xp: { Agility: 730 },
    note: `Under the trapdoor east of Canifis; wear the ring of charos from Creature of Fenkenstrain to get in. 730 XP per lap if you hand in the stick every lap: about 60K XP per hour, 68K from level 80 (with Strength 80 you can't fail the death slide). Faster than Seers' Village and Pollnivneach, and still 10 to 15 marks of grace per hour, but you have to pay attention. ${MARKS}`
  },

  sepulchre(1, 52, "52–61", 575, 45000),
  sepulchre(2, 62, "62–71", 1500, 56300),
  sepulchre(3, 72, "72–76", 3100, 68900),
  sepulchre(4, 77, "77–86", 5975, 79700),
  sepulchre(5, 87, "87–99", 11700, 98500),

  {
    id: "agi-prifddinas",
    name: "Prifddinas Agility Course",
    tags: ["training"],
    guide: "https://oldschool.runescape.wiki/w/Prifddinas_Agility_Course",
    reqs: { skills: { Agility: 75 }, quests: ["Song of the Elves"] },
    action: "lap",
    actionLabel: "Laps per hour",
    actionsPerHour: 43,
    presets: [["Agility 75", 40], ["Steady", 43], ["Agility 90+", 49]],
    inputs: [],
    outputs: [],
    xp: { Agility: 1340 },
    note: "In Prifddinas, after Song of the Elves. Works like a rooftop course: about 1,340 XP per lap with the portal shortcuts, 54K to 60K XP per hour at 75 and 65K from 90 (you can't fail from 91). The portals also give crystal shards (up to 48 per hour), which aren't counted here."
  }
];
