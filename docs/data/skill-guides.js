// Training routes shown at the top of a skill's training page.
// Each step names the recommended method for a level range; the page adds live XP/hr,
// GP/XP, time and cost, checks unlocks, and suggests the best unlocked alternative.
// A skill has either one `route`, or several `routes` (shown as tabs), each { key, name, intro, route }.
// A step is { from, to, method } or a quest step { from, to, quest, url, note }.
const KNIGHTS_SWORD = {
  from: 1, to: 29, quest: "The Knight's Sword", url: "https://oldschool.runescape.wiki/w/The_Knight%27s_Sword",
  note: "12,725 Smithing XP: level 1 to 29 in one go. Needs Mining 10, 2 iron bars, a redberry pie, and one blurite ore that you mine in the Asgarnian Ice Dungeon."
};

export default {
  herblore: {
    intro: "Herblore starts with the Druidic Ritual quest (250 XP, level 3). Quests are the cheapest way through the first levels: Jungle Potion (775 XP), Recruitment Drive (1,000 XP) and The Dig Site (2,000 XP) together take you to about level 19. After that, making potions is the main method. Costs below are for 2,500 potions per hour.",
    route: [
      { from: 3,  to: 12, method: "herb-attack" },
      { from: 12, to: 22, method: "herb-strength" },
      { from: 22, to: 38, method: "herb-restore", note: "Energy potions (level 26) are a close alternative." },
      { from: 38, to: 45, method: "herb-prayer" },
      { from: 45, to: 55, method: "herb-super-attack" },
      { from: 55, to: 66, method: "herb-super-strength" },
      { from: 66, to: 72, method: "herb-super-defence" },
      { from: 72, to: 77, method: "herb-ranging" },
      { from: 77, to: 81, method: "herb-stamina" },
      { from: 81, to: 99, method: "herb-saradomin-brew" }
    ]
  },
  smithing: {
    intro: "Every route starts with The Knight's Sword quest, which skips the slowest levels for free. Pick a route below: the numbers update with live GE prices. Anything you can't sell from the anvil routes can be high alched.",
    routes: [
      {
        key: "fastest", name: "Fastest",
        intro: "Blast Furnace gold bars with goldsmith gauntlets: around 300K XP per hour from level 40, the fastest normal method, but it costs millions. The gauntlets are the reward from Family Crest, which needs Magic 59, Crafting 40, Smithing 40 and Mining 40. Until someone has those, use the Best of both route.",
        route: [
          KNIGHTS_SWORD,
          { from: 29, to: 33, method: "smith-iron-warhammers" },
          { from: 33, to: 40, method: "smith-iron-platebodies", note: "Finish Family Crest before 40 so the gauntlets are ready." },
          { from: 40, to: 99, method: "bf-gold-bars", note: "Below Smithing 60 the foreman charges another 15K per hour." }
        ]
      },
      {
        key: "cheapest", name: "Cheapest", prefer: "cheap",
        intro: "Make bars at the Blast Furnace and sell them: this earns money instead of costing it, at about 90 to 105K XP per hour. You need a coal bag (100 golden nuggets from the Motherlode Mine) and ice gloves or a bucket of water. Slower than the other routes, and you have to keep buying ore and selling bars.",
        route: [
          KNIGHTS_SWORD,
          { from: 29, to: 30, method: "smith-iron-warhammers", note: "Just a few minutes, until you can make steel." },
          { from: 30, to: 50, method: "bf-steel-bars", note: "Below Smithing 60 the foreman charges another 15K per hour." },
          { from: 50, to: 70, method: "bf-mithril-bars" },
          { from: 70, to: 85, method: "bf-adamantite-bars" },
          { from: 85, to: 99, method: "bf-runite-bars" }
        ]
      },
      {
        key: "balanced", name: "Best of both",
        intro: "Platebodies at the anvil next to Varrock west bank: 100 to 230K XP per hour, simple to do, and much cheaper than gold. A platebody uses 5 bars, so a full inventory is 5 platebodies. The cost per XP drops as you go up, and adamant platebodies come close to breaking even.",
        route: [
          KNIGHTS_SWORD,
          { from: 29, to: 33, method: "smith-iron-warhammers" },
          { from: 33, to: 48, method: "smith-iron-platebodies" },
          { from: 48, to: 68, method: "smith-steel-platebodies" },
          { from: 68, to: 88, method: "smith-mithril-platebodies" },
          { from: 88, to: 99, method: "smith-adamant-platebodies" }
        ]
      }
    ]
  }
};
