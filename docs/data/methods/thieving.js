// Thieving training methods used by the Thieving routes (data/skill-guides.js).
// Levels, XP and coins checked on the wiki, 3 Oct 2026 (NPC and stall pages, Pay-to-play Thieving training).
// Most Thieving pays out coins directly (field `coins`, per successful action): nothing to buy or sell
// on the GE, which makes it a good bronzeman skill. Actions per hour are successful pickpockets or
// steals, worked back from the wiki's XP-per-hour figures, so they're estimates.

const GUIDE = "https://oldschool.runescape.wiki/w/Pay-to-play_Thieving_training";
const STUN = "Failed pickpockets stun you and hit you, so bring food. A dodgy necklace (25% chance to avoid the stun) and gloves of silence help.";

const pickpocket = (id, name, level, xp, coins, perHour, extra = {}) => ({
  id: `thieve-${id}`,
  name,
  tags: extra.tags || ["training"],
  guide: extra.guide || GUIDE,
  reqs: { skills: { Thieving: level }, ...(extra.quests ? { quests: extra.quests } : {}), ...(extra.items ? { items: extra.items } : {}) },
  action: extra.action || "pickpocket",
  actionLabel: extra.actionLabel || "Successful pickpockets per hour",
  actionsPerHour: perHour,
  presets: extra.presets || [["Steady", perHour], ["Relaxed", Math.round(perHour * 0.75 / 50) * 50]],
  inputs: [],
  outputs: [],
  coins,
  ...(extra.coinsLabel ? { coinsLabel: extra.coinsLabel } : {}),
  xp: { Thieving: xp },
  note: extra.note || ""
});

const BLACKJACK = "Blackjacking: knock the NPC out with a blackjack, then pickpocket it twice before it wakes up. Click-intensive but very fast. Unlocked during The Feud (you need to get far enough to have a blackjack and be allowed to use it in Pollnivneach). Bring a lot of food or Saradomin brews; a full inventory of food keeps you going for a long time.";

export default [
  pickpocket("men", "Pickpocketing men and women", 1, 8, 3, 900, {
    note: `Any man or woman, e.g. in Lumbridge or Draynor. Only for the first few levels: about 50 successful pickpockets get you to level 5. ${STUN}`
  }),
  pickpocket("bakery-stall", "Stealing from bakery stalls", 5, 16, 0, 1200, {
    action: "steal", actionLabel: "Steals per hour",
    note: "The eastern bakery stall in the East Ardougne market. Stand right under the baker so the guards don't see you. Drop the cakes and bread (or eat them) to keep going; banking them makes it slower. No coins, just XP."
  }),
  pickpocket("fruit-stall", "Stealing from fruit stalls", 25, 28.5, 0, 1500, {
    action: "steal", actionLabel: "Steals per hour",
    note: "Hosidius: the two unguarded stalls in the house east of the market, next to the beach. Steal from one, then the other, and drop everything. Stamina potions or strange fruit (from the stall) keep your run energy up. No coins, just XP."
  }),
  pickpocket("bearded-bandits", "Blackjacking bearded Pollnivnian bandits", 45, 65, 40, 1500, {
    tags: ["money", "training"],
    guide: "https://oldschool.runescape.wiki/w/Blackjacking",
    quests: ["The Feud (started)"], items: ["Blackjack", "Food"],
    presets: [["Steady", 1500], ["Relaxed", 1000]],
    note: `The bearded bandits (combat 41) in northern Pollnivneach, between the general store and the rug merchant. Around 100K XP per hour. ${BLACKJACK}`
  }),
  pickpocket("bandits", "Blackjacking Pollnivnian bandits", 55, 84.3, 50, 1650, {
    tags: ["money", "training"],
    guide: "https://oldschool.runescape.wiki/w/Blackjacking",
    quests: ["The Feud (started)"], items: ["Blackjack", "Food"],
    presets: [["Steady", 1650], ["Relaxed", 1100]],
    note: `The bandits without beards (combat 56) in northern Pollnivneach. Around 140K XP per hour at level 60. ${BLACKJACK}`
  }),
  pickpocket("menaphite-thugs", "Blackjacking Menaphite thugs", 65, 137.5, 60, 1800, {
    tags: ["money", "training"],
    guide: "https://oldschool.runescape.wiki/w/Blackjacking",
    quests: ["The Feud (started)"], items: ["Blackjack", "Food"],
    presets: [["Steady", 1800], ["Full focus", 1900], ["Relaxed", 1200]],
    note: `Menaphite thugs in the south-east of Pollnivneach. 230K to 265K XP per hour: the fastest pickpocketing up to 99. ${BLACKJACK}`
  }),
  pickpocket("ardougne-knights", "Pickpocketing Ardougne knights", 55, 84.3, 50, 1600, {
    tags: ["money", "training"],
    guide: "https://oldschool.runescape.wiki/w/Money_making_guide/Pickpocketing_Knights_of_Ardougne",
    items: ["Food", "Dodgy necklaces (optional)"],
    presets: [["Thieving 55", 1400], ["Thieving 70", 1800], ["Thieving 85", 2200], ["Thieving 95+", 2600]],
    coinsLabel: "from coin pouches",
    note: `Knights of Ardougne in the East Ardougne market. Each success gives a coin pouch with 50 coins; open them before you have 28. Success goes from about 61% at 55 to 94% at 99; the Medium Ardougne Diary adds 10%. Simple and steady, and one of the best ways to earn money as you level. Set the actions per hour to your level with the buttons. ${STUN}`
  }),
  pickpocket("artefacts", "Stealing artefacts", 49, 2950, 750, 50, {
    tags: ["money", "training"],
    guide: "https://oldschool.runescape.wiki/w/Stealing_artefacts",
    action: "artefact", actionLabel: "Artefacts per hour",
    items: ["Lockpick", "Stamina potions"],
    presets: [["Steady", 50], ["With teleports", 55], ["Relaxed", 40]],
    coinsLabel: "500–1,000 each",
    note: "Captain Khaled in Port Piscarilius sends you to a house: sneak past the guards, pick the drawer and walk the artefact back (teleporting loses it). Each artefact gives 750 XP plus 40 × your Thieving level, so it gets better as you level: the XP here is for level 55. Around 150K to 185K XP per hour, with lots of running, so bring stamina potions."
  })
];
