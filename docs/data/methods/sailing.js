// Sailing training methods used by the Sailing routes (data/skill-guides.js).
// From the wiki, 26 Oct 2026: Sailing training, Barracuda Trials (the three trial pages), Courier tasks,
// Salvaging hook, Skiff and Sloop. The wiki marks parts of its training guide as out of date, so these are
// guide numbers, not exact ones.
// Sailing has nothing to buy or sell per hour here. Boats, boat parts and salvaging hooks are built once from
// planks, nails and bars (bronzeman: they have to be unlocked first); courier loot bags and salvage aren't counted.
// - Barracuda Trials: XP per run and the wiki's target time per rank plus 10 seconds to restart.
// - Everything else only has an hourly rate on the wiki (or none, at low levels: then it's our estimate),
//   so it's counted in minutes: "60 minutes per hour" gives the full rate, fewer for breaks.

const GUIDE = "https://oldschool.runescape.wiki/w/Sailing_training";
const TRIM = "Always trim the sails when a gust appears: extra XP and speed.";
const EXTRACTOR = "From 73 Sailing and 67 Construction a crystal extractor on the boat adds about 10K to 15K XP per hour on top.";

// A method that only has an hourly rate: one action = one minute.
const minutes = (id, name, level, xpHr, guide, note, reqs = {}) => ({
  id: `sail-${id}`,
  name,
  tags: ["training"],
  guide,
  reqs: { skills: { Sailing: level, ...(reqs.skills || {}) }, quests: reqs.quests || [], items: reqs.items || [] },
  action: "minute",
  actionLabel: "Minutes per hour",
  actionsPerHour: 60,
  presets: [["Full hour", 60], ["With breaks", 45]],
  inputs: [],
  outputs: [],
  xp: { Sailing: Math.round(xpHr / 60 * 10) / 10 },
  note
});

// Barracuda Trials: [trial, page, level, items, ranks: [rank, xp per run, target seconds]].
const RANK_NOTE = {
  Swordfish: "the easiest rank: every player starts here.",
  Shark: "unlocked by beating the Swordfish time once.",
  Marlin: "unlocked by beating the Shark time once; the hardest time to make, usually with an upgraded boat."
};
const trial = (key, name, page, level, items, extra, [rank, xp, secs]) => {
  const runs = Math.round(3600 / (secs + 10) * 10) / 10;
  return {
    id: `sail-${key}-${rank.toLowerCase()}`,
    name: `${name} (${rank} rank)`,
    tags: ["training"],
    guide: `https://oldschool.runescape.wiki/w/${page}`,
    reqs: { skills: { Sailing: level }, items },
    action: "run",
    actionLabel: "Runs per hour",
    actionsPerHour: runs,
    presets: [["Target time", runs], ["Relaxed", Math.round(runs * 8) / 10]],
    inputs: [],
    outputs: [],
    xp: { Sailing: xp },
    note: `A Barracuda Trial: an obstacle course at sea against the clock, collecting lost supplies on the way. ${rank} rank: ${RANK_NOTE[rank]} ${xp.toLocaleString("en-US")} XP per run, about ${Math.round(xp * runs / 1000)}K XP per hour at the target time of ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")} (plus 10 seconds to start again). Beating a rank's time the first time gives bonus XP on top. ${extra}`
  };
};

const TEMPOR = ["Skiff (Sailing 15, 15,000 coins)"];
const JUBBLY = ["Skiff", "Mithril helm (for the rapids)", "Inoculation station (for the fetid waters)"];
const GWENITH = ["Skiff", "Adamant keel", "Wind catcher or gale catcher"];
const temporNote = "South of the Pandemonium, talk to Rum-dashed Ralph. A teak hull and teak or mahogany mast make the runs much faster. The Shark rank unlocks the keg of whirlpool surprise (+3 Sailing boost).";
const jubblyNote = "No crewmates allowed in this trial: they have to leave the boat first.";
const gwenithNote = `No crewmates allowed. The sails must stay trimmed with crystal motes the whole run, hence the wind catcher. ${EXTRACTOR} A rosewood hull (93 Sailing, 84 Construction) makes it about 15% faster.`;

const trials = [
  ...[["Swordfish", 634, 108], ["Shark", 1103, 171], ["Marlin", 1907, 270]]
    .map(r => trial("tempor", "The Tempor Tantrum", "The_Tempor_Tantrum", 30, TEMPOR, temporNote, r)),
  ...[["Swordfish", 2392, 123], ["Shark", 4270, 180], ["Marlin", 8176, 321]]
    .map(r => trial("jubbly", "The Jubbly Jive", "The_Jubbly_Jive", 55, JUBBLY, jubblyNote, r)),
  ...[["Swordfish", 4100, 120], ["Shark", 9315, 222], ["Marlin", 19410, 369]]
    .map(r => trial("gwenith", "The Gwenith Glide", "The_Gwenith_Glide", 72, GWENITH, gwenithNote, r))
];

// Courier tasks and sea charting before the trials. The wiki gives no hourly rates below 22, so 4K and 7K are our estimates.
const COURIER = "https://oldschool.runescape.wiki/w/Courier_tasks";
const early = [
  minutes("early-4", "Courier tasks and sea charting (Sailing 4–12)", 4, 4000, COURIER,
    `Take courier tasks from the notice boards at Port Sarim and the Pandemonium (Musa Point from 10) and do the sea charting tasks you pass on the way (generic and spyglass ones at this level; the captain's log from Pandemonium tracks them). One task at a time at first, two from level 7. Tasks that start somewhere else and end where you are give the most XP. Our estimate: about 4K XP per hour; the charting XP is a one-off, so it varies. ${TRIM}`,
    { quests: ["Pandemonium"] }),
  minutes("early-12", "Courier tasks and sea charting (Sailing 12–22)", 12, 7000, COURIER,
    `After Prying Times you get the crowbar for the crate charting tasks. At 15 the Land's End and Port Piscarilius boards open (250 to 500 XP per task) and you can buy a skiff from a shipwright for 15,000 coins: faster and more room. Salvaging also starts at 15 (other tab). Our estimate: about 7K XP per hour. ${TRIM}`,
    { quests: ["Pandemonium", "Prying Times"] }),
  minutes("early-22", "Courier tasks and sea charting (Sailing 22–45)", 22, 10000, "https://oldschool.runescape.wiki/w/Sea_charting",
    `After Current Affairs you get the current duck for the current charting tasks; the spyglass and current duck together make charting worth about 10K XP per hour at 22 (wiki), most of it from finishing whole sea areas. Three tasks at once from 28. Charting plus the quests alone take you to 45; all charting and quests together give 107,755 XP (level 50). ${TRIM}`,
    { quests: ["Pandemonium", "Prying Times", "Current Affairs"] })
];

// Courier routes from the wiki (rates from before courier XP went up 10%, not retested).
const ROUTE_NOTE = "Rates from the wiki, measured before courier XP went up by 10% and depending a lot on which tasks the notice boards offer. Hire the crewmates with the best deckhandiness.";
const couriers = [
  minutes("courier-summer-shore", "Courier route: the Summer Shore", 45, 20000, `${GUIDE}#Summer_Shore_route`,
    `Start at the Summer Shore and take tasks from Musa Point, Port Sarim or the Pandemonium to the Summer Shore; take a charter ship there, recover the boat (20,000 coins, the loot bags pay some of it back), pick up the cargo and sail it home. About 9 trips per hour of 2,000 to 2,500 XP each: about 20K XP per hour. Bring a skiff with oak sails. ${ROUTE_NOTE}`,
    { quests: ["Troubled Tortugans"] }),
  minutes("courier-rellekka-62", "Courier route: Rellekka", 62, 66000, `${GUIDE}#Rellekka_route`,
    `Start at Rellekka and take tasks from Aldarin, the Sunset Coast or Port Roberts to Rellekka; get to Aldarin (house portal or charter ship), summon the boat (empty its cargo holds first!) and sail north along the coast, picking up tasks on the way. About 66K XP per hour. ${ROUTE_NOTE}`,
    { items: ["House in Aldarin or a quetzal whistle", "Enchanted lyre or Fremennik sea boots"] }),
  minutes("courier-rellekka-65", "Courier route: Rellekka and Etceteria", 65, 99000, `${GUIDE}#Rellekka_route`,
    `The Rellekka route with the Etceteria port added (from 65): up to about 99K XP per hour when the boards offer good tasks. ${ROUTE_NOTE}`,
    { items: ["House in Aldarin or a quetzal whistle", "Enchanted lyre or Fremennik sea boots"] }),
  minutes("courier-prifddinas", "Courier route: Prifddinas", 70, 74000, `${GUIDE}#Prifddinas_route`,
    `Start at the Prifddinas port and take tasks from Aldarin, Port Tyras or Deepfin Point to Prifddinas; charter to Port Tyras, teleport to Deepfin Point and Aldarin, summon the boat and sail back delivering. 71K to 77K XP per hour. ${ROUTE_NOTE}`,
    { quests: ["Song of the Elves"], items: ["Ring of Charos", "Sailor's amulet", "Aldarin teleport"] }),
  minutes("courier-lunar-isle", "Courier route: Lunar Isle", 76, 145000, `${GUIDE}#Lunar_Isle_route`,
    `Start at Lunar Isle and take as many round trips to Lunar Isle as the board offers (Red Rock 13,143 XP with The Red Reef, Aldarin 12,671, Deepfin Point 9,092, Civitas illa Fortis 7,381), fill up at Prifddinas, then sail the cargo back. Five tasks at once from 84. 130K to 160K XP per hour. ${EXTRACTOR} ${ROUTE_NOTE}`,
    { items: ["Crystal extractor", "Ring of Charos", "Sailor's amulet", "Aldarin and Lunar Isle teleports"] })
];

// Shipwreck salvaging: wiki rates with one deckhandiness-4 crewmate and the player salvaging, sorting included,
// sailing to and from port not included. [key, wreck, level, hook, hooks, xp/hr, Construction for the hook]
const HOOK = {
  Bronze: [15, 1, "4 planks, 16 bronze nails, 6 bronze bars and a rope"],
  Iron: [21, 9, "4 oak planks, 16 iron nails, 6 iron bars and a rope"],
  Steel: [27, 18, "4 teak planks, 16 steel nails, 6 steel bars, 3 lead bars and a rope"],
  Mithril: [44, 30, "4 mahogany planks, 16 mithril nails, 6 mithril bars, 3 lead bars and a rope"],
  Adamant: [59, 52, "4 camphor planks, 16 adamantite nails, 6 adamantite bars, 3 lead bars and a rope"],
  Rune: [74, 66, "4 ironwood planks, 16 rune nails, 6 runite bars, 4 lead bars, 4 cupronickel bars and a rope"]
};
const salvage = (key, wreck, level, hook, hooks, xpHr, extra = "") => {
  const [hookLvl, con, mats] = HOOK[hook];
  return minutes(`salvage-${key}`, `Salvaging: ${wreck} (${hook.toLowerCase()} hook${hooks > 1 ? " ×2" : ""})`, Math.max(level, hookLvl),
    xpHr, "https://oldschool.runescape.wiki/w/Shipwreck_salvaging",
    `Sail to a ${wreck.toLowerCase()} (Sailing ${level}) and salvage it with ${hooks > 1 ? "two salvaging hooks" : "a salvaging hook"} on the boat, then sort the salvage. About ${Math.round(xpHr / 1000)}K XP per hour with one good crewmate on a hook (wiki${hooks > 1 ? "; two hooks need the room of a sloop, Sailing 50" : ""}). A ${hook.toLowerCase()} hook needs Construction ${con} and ${mats}. Safe apart from getting there. The salvage itself isn't counted. ${extra}`.trim(),
    { skills: { Construction: con }, items: [`${hook} salvaging hook`] });
};
const salvaging = [
  salvage("small", "Small shipwreck", 15, "Bronze", 1, 2400, "With an iron hook (Sailing 21) it's 3K to 3.2K XP per hour."),
  salvage("fisherman", "Fisherman's shipwreck", 26, "Steel", 1, 5200),
  salvage("barracuda", "Barracuda shipwreck", 35, "Steel", 1, 10200, "At 42 the salvaging station schematic from Chinchompa Island makes salvaging much faster."),
  salvage("barracuda-mithril", "Barracuda shipwreck", 35, "Mithril", 1, 13500),
  salvage("large", "Large shipwreck", 53, "Mithril", 2, 25000),
  salvage("pirate", "Pirate shipwreck", 64, "Adamant", 2, 45500, "Watch out at Buccaneers' Haven: other players lure armoured krakens there."),
  salvage("mercenary", "Mercenary shipwreck", 73, "Adamant", 2, 57500, "With rune hooks (74) it's 65K to 70K."),
  salvage("fremennik", "Fremennik shipwreck", 80, "Rune", 2, 75000),
  salvage("merchant", "Merchant shipwreck", 87, "Rune", 2, 80000, "With dragon hooks it's 80K to 95K.")
];

export default [...early, ...trials, ...couriers, ...salvaging];
