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
        key: "balanced", name: "Best of both", auto: true,
        intro: "Worked out live from GE prices: for every level range it picks the method with the lowest total cost, counting both the gold you spend and the time it takes, valued at what you say your time is worth below. Raise the value to train faster, lower it to save money.",
        before: [KNIGHTS_SWORD],
        from: 29, to: 99,
        candidates: [
          "smith-iron-warhammers", "smith-iron-platebodies", "smith-steel-platebodies", "smith-mithril-platebodies", "smith-adamant-platebodies",
          "smith-bronze-dart-tips", "smith-iron-dart-tips", "smith-steel-dart-tips", "smith-mithril-dart-tips",
          "bf-gold-bars", "bf-steel-bars", "bf-mithril-bars", "bf-adamantite-bars", "bf-runite-bars"
        ]
      }
    ]
  },
  crafting: {
    intro: "A jewellery route: make jewellery from gold bars and cut gems at a furnace (Edgeville has a furnace next to a bank), so it often pays for itself or earns a bit. Below level 7, make gold rings (level 5). The fastest Crafting XP comes from glassblowing, battlestaves and dragonhide, which aren't on the site yet. Check \"Traded / hr\" on each method before you make hundreds: some pieces sell slowly.",
    route: [
      { from: 7, to: 23, method: "craft-gold-bracelets" },
      { from: 23, to: 31, method: "craft-sapphire-bracelets", note: "Emerald bracelets (30) are an option for the last level." },
      { from: 31, to: 42, method: "craft-emerald-amulets" },
      { from: 42, to: 50, method: "craft-ruby-bracelets" },
      { from: 50, to: 56, method: "craft-ruby-amulets" },
      { from: 56, to: 58, method: "craft-diamond-necklaces" },
      { from: 58, to: 70, method: "craft-diamond-bracelets" },
      { from: 70, to: 72, method: "craft-diamond-amulets" },
      { from: 72, to: 74, method: "craft-dragon-necklaces" },
      { from: 74, to: 80, method: "craft-dragonstone-bracelets" },
      { from: 80, to: 99, method: "craft-dragonstone-amulets", note: "150 XP each: by far the best jewellery XP." }
    ]
  },
  fletching: {
    intro: "Fletching has two styles. Arrows and darts are made in sets with nothing to bank, so they're fast and you can do them anywhere, but you have to keep clicking and the higher tiers cost money. Cutting bows from logs is slow and relaxed, often cheap or even profitable. Darts need The Tourist Trap. Pick a route below: the numbers update with live GE prices.",
    routes: [
      {
        key: "fastest", name: "Fastest",
        intro: "Darts from level 10: each click makes 10 darts, so the faster you click, the faster you level. Rune darts give well over 500K XP per hour, but adamant and rune dart tips are expensive. Iron and steel arrows (15 and 30) are a good bridge if The Tourist Trap isn't done yet.",
        route: [
          { from: 1, to: 10, method: "fletch-bronze-arrows", note: "Headless arrows are cheaper if bronze arrowtips cost too much." },
          { from: 10, to: 22, method: "fletch-bronze-darts" },
          { from: 22, to: 37, method: "fletch-iron-darts" },
          { from: 37, to: 52, method: "fletch-steel-darts" },
          { from: 52, to: 67, method: "fletch-mithril-darts" },
          { from: 67, to: 81, method: "fletch-adamant-darts" },
          { from: 81, to: 99, method: "fletch-rune-darts" }
        ]
      },
      {
        key: "cheapest", name: "Cheapest", prefer: "cheap",
        intro: "Cut unstrung bows from logs and sell them: about 1,700 per hour, and the bow is usually worth about as much as the logs. Longbows give more XP than shortbows from the same log. Slow but relaxed. Stringing the bows gives the same XP again; look at the stringing methods below if bows (u) don't sell.",
        route: [
          { from: 1, to: 5, method: "fletch-arrow-shafts" },
          { from: 5, to: 10, method: "fletch-shortbows" },
          { from: 10, to: 20, method: "fletch-longbows" },
          { from: 20, to: 25, method: "fletch-oak-shortbows" },
          { from: 25, to: 35, method: "fletch-oak-longbows" },
          { from: 35, to: 40, method: "fletch-willow-shortbows" },
          { from: 40, to: 50, method: "fletch-willow-longbows" },
          { from: 50, to: 55, method: "fletch-maple-shortbows" },
          { from: 55, to: 70, method: "fletch-maple-longbows" },
          { from: 70, to: 85, method: "fletch-yew-longbows" },
          { from: 85, to: 99, method: "fletch-magic-longbows" }
        ]
      },
      {
        key: "balanced", name: "Best of both", auto: true,
        intro: "Worked out live from GE prices: for every level range it picks the method with the lowest total cost, counting both the gold you spend and the time it takes, valued at what you say your time is worth below. Raise the value to train faster, lower it to save money.",
        from: 1, to: 99,
        candidates: [
          "fletch-headless-arrows", "fletch-bronze-arrows", "fletch-iron-arrows", "fletch-steel-arrows", "fletch-mithril-arrows", "fletch-adamant-arrows", "fletch-rune-arrows",
          "fletch-bronze-darts", "fletch-iron-darts", "fletch-steel-darts", "fletch-mithril-darts", "fletch-adamant-darts", "fletch-rune-darts",
          "fletch-arrow-shafts", "fletch-shortbows", "fletch-longbows", "fletch-oak-shortbows", "fletch-oak-longbows", "fletch-willow-shortbows", "fletch-willow-longbows",
          "fletch-maple-shortbows", "fletch-maple-longbows", "fletch-yew-shortbows", "fletch-yew-longbows", "fletch-magic-shortbows", "fletch-magic-longbows",
          "fletch-string-oak-longbows", "fletch-string-willow-longbows", "fletch-string-maple-longbows", "fletch-string-yew-longbows", "fletch-string-magic-longbows"
        ]
      }
    ]
  },
  cooking: {
    intro: "Cooking is mostly cooking fish on a range next to a bank. Cooked fish usually sells for about what the raw fish costs, so it's cheap. Jugs of wine (from 35) are much faster. The numbers below don't count burnt food: expect to burn a fair share of each new fish until you're 10 to 20 levels above it.",
    routes: [
      {
        key: "fastest", name: "Fastest",
        intro: "Fish up to 35, then jugs of wine all the way: around 450K XP per hour, and no range needed. Grapes aren't unlocked yet; see the tip on how to get the first one. 1-tick karambwans are faster still, but hard and they need Tai Bwo Wannai Trio.",
        route: [
          { from: 1, to: 5, method: "cook-sardines" },
          { from: 5, to: 15, method: "cook-herring" },
          { from: 15, to: 25, method: "cook-trout" },
          { from: 25, to: 30, method: "cook-salmon" },
          { from: 30, to: 35, method: "cook-tuna" },
          { from: 35, to: 99, method: "cook-jugs-of-wine" }
        ]
      },
      {
        key: "cheapest", name: "Cheapest", prefer: "cheap",
        intro: "Cook fish and sell them. Often this costs almost nothing or earns a bit, at 50K to 280K XP per hour. Burnt fish aren't counted, so the real cost is higher at the start of every fish.",
        route: [
          { from: 1, to: 5, method: "cook-shrimps" },
          { from: 5, to: 15, method: "cook-herring" },
          { from: 15, to: 25, method: "cook-trout" },
          { from: 25, to: 30, method: "cook-salmon" },
          { from: 30, to: 40, method: "cook-tuna" },
          { from: 40, to: 45, method: "cook-lobsters" },
          { from: 45, to: 80, method: "cook-swordfish", note: "Monkfish (62) once raw monkfish is unlocked." },
          { from: 80, to: 99, method: "cook-sharks" }
        ]
      },
      {
        key: "balanced", name: "Best of both", auto: true,
        intro: "Worked out live from GE prices: for every level range it picks the method with the lowest total cost, counting both the gold you spend and the time it takes, valued at what you say your time is worth below. Raise the value to train faster, lower it to save money.",
        from: 1, to: 99,
        candidates: [
          "cook-shrimps", "cook-sardines", "cook-herring", "cook-trout", "cook-pike", "cook-salmon", "cook-tuna", "cook-lobsters", "cook-bass",
          "cook-swordfish", "cook-monkfish", "cook-karambwans", "cook-sharks", "cook-anglerfish", "cook-jugs-of-wine"
        ]
      }
    ]
  },
  thieving: {
    intro: "Thieving costs nothing and mostly pays out coins straight into your inventory, so there's nothing to buy or sell on the GE: a good bronzeman skill. Quests skip the slow start: Biohazard, Hazeel Cult, Fight Arena, Tribal Totem, The Giant Dwarf, Death to the Dorgeshuun, The Golem, Creature of Fenkenstrain and more together give about 48,700 Thieving XP (level 1 to about 38). Bring food for every pickpocketing method.",
    routes: [
      {
        key: "fastest", name: "Fastest",
        intro: "Stalls until 45, then blackjacking in Pollnivneach all the way: Menaphite thugs give 230K to 265K XP per hour from level 65. You need to be far enough in The Feud, and it's click-intensive: you knock out, pickpocket twice, and repeat.",
        route: [
          { from: 1, to: 5, method: "thieve-men" },
          { from: 5, to: 25, method: "thieve-bakery-stall" },
          { from: 25, to: 45, method: "thieve-fruit-stall" },
          { from: 45, to: 55, method: "thieve-bearded-bandits" },
          { from: 55, to: 65, method: "thieve-bandits" },
          { from: 65, to: 99, method: "thieve-menaphite-thugs" }
        ]
      },
      {
        key: "relaxed", name: "Relaxed",
        intro: "Less clicking: stalls, then master farmers (seeds for Farming), then Ardougne knights from 55 to 99. Slower than blackjacking, but simple, and the knights earn a lot of coins. The Medium Ardougne Diary (+10% success) makes the knights noticeably better.",
        route: [
          { from: 1, to: 5, method: "thieve-men" },
          { from: 5, to: 25, method: "thieve-bakery-stall" },
          { from: 25, to: 38, method: "thieve-fruit-stall" },
          { from: 38, to: 55, method: "master-farmers", note: "Plant or sell the seeds; ranarr and snapdragon seeds are worth the most." },
          { from: 55, to: 99, method: "thieve-ardougne-knights" }
        ]
      },
      {
        key: "balanced", name: "Best of both", auto: true,
        intro: "Worked out live: for every level range it picks the method with the lowest total cost, counting the coins you earn and the time it takes, valued at what you say your time is worth below. With a high value it picks the fastest XP, with a low value the most coins.",
        from: 1, to: 99,
        candidates: [
          "thieve-men", "thieve-bakery-stall", "thieve-fruit-stall", "master-farmers", "thieve-artefacts",
          "thieve-bearded-bandits", "thieve-bandits", "thieve-menaphite-thugs", "thieve-ardougne-knights"
        ]
      }
    ]
  }
};
