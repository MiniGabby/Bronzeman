// Dragonhide comparison on the Crafting training page: buy dragon leather or buy hides and tan them,
// then sell the item on the GE or High Alch it. Levels and XP from the wiki (Dragonhide armour, Oct 2026).
// Paces are estimates: crafting from the wiki's XP rates, tanning and alching for steady play.
export default {
  colours: [
    { key: "green", name: "Green", body: [63, 186], chaps: [60, 124], vambraces: [57, 62] },
    { key: "blue", name: "Blue", body: [71, 210], chaps: [68, 140], vambraces: [66, 70] },
    { key: "red", name: "Red", body: [77, 234], chaps: [75, 156], vambraces: [73, 78] },
    { key: "black", name: "Black", body: [84, 258], chaps: [82, 172], vambraces: [79, 86] }
  ],
  // leather = dragon leather per item; perHour = items crafted per hour with a needle at a bank.
  pieces: [
    { key: "body", name: "body", plural: "bodies", leather: 3, perHour: 1700 },
    { key: "chaps", name: "chaps", plural: "chaps", leather: 2, perHour: 1750 },
    { key: "vambraces", name: "vambraces", plural: "vambraces", leather: 1, perHour: 1800 }
  ],
  tan: {
    fee: 20,          // coins per dragonhide at Ellis (Al Kharid) or the Crafting Guild tanner
    perHour: 1800,    // hides per hour: 27 per trip between the Al Kharid bank and Ellis
    where: "Ellis in Al Kharid (20 coins per hide, a short walk from the bank)"
  },
  alch: { perHour: 1200, xp: 65, level: 55 },   // High Level Alchemy with a staff of fire
  thread: 0.2   // one spool of thread lasts 5 items
};
