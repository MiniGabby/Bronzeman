// Training routes shown at the top of a skill's training page.
// Each step names the recommended method for a level range; the page adds live XP/hr,
// GP/XP, time and cost, checks unlocks, and suggests the best unlocked alternative.
// A skill has either one `route`, or several `routes` (shown as tabs), each { key, name, intro, route }.
// A step is { from, to, method } or a quest step { from, to, quest, url, note }.
// A method step with alternative: true (or a label, e.g. alternative: "Alongside") is another way through
// levels the route already covers: it gets its own row in the table and isn't counted in the route's total.
// A tip step { from, to, tip, url, note } is advice without a method, shown the same way.
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
    intro: "Crafting has many methods. Gem cutting is fast and the uncut gems are already unlocked. Glassblowing and leather are cheap. Jewellery from gold bars and gems often pays for itself. The very fastest Crafting, dragonhide bodies and battlestaves, needs things nobody has unlocked yet: the tips say how to get the first one. Check \"Traded / hr\" before you make hundreds of something: some items sell slowly.",
    routes: [
      {
        key: "fastest", name: "Fastest",
        intro: "Gem cutting from 20 (140K to 380K XP per hour), then dragonhide bodies from 63 (300K to 450K XP per hour). Dragon leather isn't unlocked yet: until someone kills a green dragon and tans the hide, the route shows the best alternative. Battlestaves (54 to 66) are almost as fast once battlestaves and orbs are unlocked.",
        route: [
          { from: 1, to: 20, method: "craft-molten-glass", note: "Or beer glasses (1) with the molten glass." },
          { from: 20, to: 27, method: "craft-cut-sapphire" },
          { from: 27, to: 34, method: "craft-cut-emerald" },
          { from: 34, to: 43, method: "craft-cut-ruby" },
          { from: 43, to: 55, method: "craft-cut-diamond" },
          { from: 55, to: 63, method: "craft-cut-dragonstone" },
          { from: 63, to: 71, method: "craft-green-dhide-bodies" },
          { from: 71, to: 77, method: "craft-blue-dhide-bodies" },
          { from: 77, to: 84, method: "craft-red-dhide-bodies" },
          { from: 84, to: 99, method: "craft-black-dhide-bodies" }
        ]
      },
      {
        key: "jewellery", name: "Jewellery", prefer: "cheap",
        intro: "Make jewellery from gold bars and cut gems at a furnace (Edgeville has a furnace next to a bank), so it often pays for itself or earns a bit. Below level 7, make gold rings (level 5). Slower than gem cutting, but the cheapest route.",
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
      {
        key: "balanced", name: "Best of both", auto: true,
        intro: "Worked out live from GE prices: for every level range it picks the method with the lowest total cost, counting both the gold you spend and the time it takes, valued at what you say your time is worth below. Raise the value to train faster, lower it to save money.",
        from: 1, to: 99,
        candidates: [
          "craft-molten-glass", "craft-bow-strings", "craft-leather-gloves", "craft-leather-vambraces", "craft-leather-bodies", "craft-leather-chaps",
          "craft-glass-beer-glasses", "craft-glass-vials", "craft-glass-unpowered-orbs", "craft-glass-lantern-lenses", "craft-glass-light-orbs",
          "craft-cut-sapphire", "craft-cut-emerald", "craft-cut-ruby", "craft-cut-diamond", "craft-cut-dragonstone",
          "craft-gold-necklaces", "craft-gold-bracelets", "craft-sapphire-bracelets", "craft-emerald-bracelets", "craft-emerald-amulets", "craft-ruby-bracelets", "craft-ruby-amulets",
          "craft-diamond-necklaces", "craft-diamond-bracelets", "craft-diamond-amulets", "craft-dragonstone-rings", "craft-dragon-necklaces", "craft-dragonstone-bracelets", "craft-dragonstone-amulets",
          "craft-water-battlestaves", "craft-earth-battlestaves", "craft-fire-battlestaves", "craft-air-battlestaves",
          "craft-green-dhide-bodies", "craft-blue-dhide-bodies", "craft-red-dhide-bodies", "craft-black-dhide-bodies"
        ]
      }
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
  },
  firemaking: {
    intro: "Firemaking is quick: you light logs one after another, or you fight Wintertodt from level 50. Line burning costs the price of the logs; Wintertodt costs nothing and its supply crates (not counted below) are full of things to sell and to unlock. Want it AFK? Throw the same logs on a Forester's campfire instead (about 665 an hour; use the button on the log methods). Quests: Enlightened Journey (4,000 XP), Enakhra's Lament (7,000) and The Giant Dwarf (1,500) help a little.",
    routes: [
      {
        key: "fastest", name: "Fastest",
        intro: "Line burning the best log for your level at the Grand Exchange, about 1,485 logs an hour: up to 300K XP per hour with yews and 450K with magic logs. It costs the logs. Several logs aren't unlocked yet; the tips say how to get the first one.",
        route: [
          { from: 1, to: 15, method: "fm-logs" },
          { from: 15, to: 30, method: "fm-oak-logs" },
          { from: 30, to: 35, method: "fm-willow-logs" },
          { from: 35, to: 42, method: "fm-teak-logs" },
          { from: 42, to: 45, method: "fm-arctic-pine-logs" },
          { from: 45, to: 50, method: "fm-maple-logs" },
          { from: 50, to: 60, method: "fm-mahogany-logs" },
          { from: 60, to: 75, method: "fm-yew-logs" },
          { from: 75, to: 90, method: "fm-magic-logs" },
          { from: 90, to: 99, method: "fm-redwood-logs" }
        ]
      },
      {
        key: "cheapest", name: "Cheapest", prefer: "cheap",
        intro: "Burn cheap logs up to 50, then Wintertodt all the way to 99: about 50 hours of low-effort play that earns money instead of costing it, plus a little Woodcutting XP. Bring food (you take damage from the cold), an axe, a knife, a hammer and a tinderbox.",
        route: [
          { from: 1, to: 15, method: "fm-logs" },
          { from: 15, to: 30, method: "fm-oak-logs" },
          { from: 30, to: 50, method: "fm-willow-logs", note: "Maple logs (45) are also cheap once they're unlocked." },
          { from: 50, to: 70, method: "fm-wintertodt-50" },
          { from: 70, to: 90, method: "fm-wintertodt-70" },
          { from: 90, to: 99, method: "fm-wintertodt-90" }
        ]
      },
      {
        key: "balanced", name: "Best of both", auto: true,
        intro: "Worked out live from GE prices: for every level range it picks the method with the lowest total cost, counting the logs you buy and the time it takes, valued at what you say your time is worth below. Wintertodt counts as free here (its crates aren't counted), so with a low time value it picks Wintertodt from 50.",
        from: 1, to: 99,
        candidates: [
          "fm-logs", "fm-oak-logs", "fm-willow-logs", "fm-teak-logs", "fm-arctic-pine-logs", "fm-maple-logs", "fm-mahogany-logs",
          "fm-yew-logs", "fm-magic-logs", "fm-redwood-logs", "fm-wintertodt-50", "fm-wintertodt-70", "fm-wintertodt-90"
        ]
      }
    ]
  },
  magic: {
    intro: "Magic is trained by casting spells over and over. Teleports are the cheapest fast XP, enchanting jewellery and charging orbs can earn money, and High Level Alchemy is the relaxed option that turns items into coins. Every method assumes you wield the matching elemental staff, so those runes aren't counted. Below level 25, enchant sapphire rings (7) or use combat spells.",
    routes: [
      {
        key: "fastest", name: "Fastest",
        intro: "Teleports up to 49, then enchanting rubies, diamonds and dragonstones: about 125K XP per hour with dragonstone rings from 68. Enchanting costs or earns money depending on prices, so check the numbers below.",
        route: [
          { from: 7, to: 25, method: "sapphire-rings" },
          { from: 25, to: 31, method: "magic-tele-varrock" },
          { from: 31, to: 37, method: "magic-tele-lumbridge" },
          { from: 37, to: 45, method: "magic-tele-falador" },
          { from: 45, to: 49, method: "magic-tele-camelot" },
          { from: 49, to: 57, method: "magic-enchant-ruby-amulets", note: "Ruby rings (into rings of forging) work just as well." },
          { from: 57, to: 68, method: "magic-enchant-diamond-amulets", note: "Diamond rings (into rings of life) work just as well." },
          { from: 68, to: 99, method: "magic-enchant-dragonstone-rings" }
        ]
      },
      {
        key: "cheapest", name: "Cheapest", prefer: "cheap",
        intro: "Teleports are cheap (one law rune per cast) and fast. From 55, High Level Alchemy: slower, but with the right items from the Alchemy tab it pays for itself, and it's the most relaxed way to train. Enchanting is a good alternative whenever the enchanted jewellery sells for more than it costs.",
        route: [
          { from: 7, to: 25, method: "sapphire-rings" },
          { from: 25, to: 31, method: "magic-tele-varrock" },
          { from: 31, to: 37, method: "magic-tele-lumbridge" },
          { from: 37, to: 45, method: "magic-tele-falador" },
          { from: 45, to: 55, method: "magic-tele-camelot" },
          { from: 55, to: 99, method: "magic-high-alchemy", note: "The cost shown is just the nature runes: pick items on the Alchemy tab that alch for more than they cost." }
        ]
      },
      {
        key: "balanced", name: "Best of both", auto: true,
        intro: "Worked out live from GE prices: for every level range it picks the method with the lowest total cost, counting both the gold you spend and the time it takes, valued at what you say your time is worth below. Raise the value to train faster, lower it to save money.",
        from: 7, to: 99,
        candidates: [
          "sapphire-rings", "superheat-lead",
          "magic-tele-varrock", "magic-tele-lumbridge", "magic-tele-falador", "magic-tele-camelot", "magic-tele-ardougne", "magic-tele-watchtower",
          "magic-enchant-emerald-rings", "magic-enchant-ruby-rings", "magic-enchant-ruby-amulets", "magic-enchant-diamond-rings", "magic-enchant-diamond-amulets", "magic-enchant-dragonstone-rings",
          "magic-high-alchemy", "magic-charge-water-orbs", "magic-charge-earth-orbs", "magic-charge-fire-orbs", "magic-charge-air-orbs"
        ]
      }
    ]
  },
  construction: {
    intro: "Construction is building furniture in your own house (buy one from an estate agent for 1,000 coins) with planks, a saw and a hammer. It costs money, but it's the fastest skill to level. From Construction 50 hire a demon butler: he fetches planks from the bank while you keep building, which makes oak larders and mahogany tables several times faster. Mahogany planks aren't unlocked yet; see the tip on how to get the first one.",
    routes: [
      {
        key: "fastest", name: "Fastest",
        intro: "Cheap furniture up to 33, oak larders to 52, then mahogany tables and gnome benches with a demon butler: up to about 1 million XP per hour, but mahogany planks cost a lot.",
        route: [
          { from: 1, to: 4, method: "con-crude-chairs" },
          { from: 4, to: 9, method: "con-wooden-bookcases" },
          { from: 9, to: 22, method: "con-wooden-larders" },
          { from: 22, to: 33, method: "con-oak-dining-tables" },
          { from: 33, to: 52, method: "con-oak-larders", note: "Slower until you have the demon butler at 50." },
          { from: 52, to: 77, method: "con-mahogany-tables" },
          { from: 77, to: 99, method: "con-gnome-benches" }
        ]
      },
      {
        key: "cheapest", name: "Cheapest", prefer: "cheap",
        intro: "Oak planks only: oak larders from 33 and oak dungeon doors from 74. About half the speed of mahogany, but much cheaper per XP, and oak planks are already unlocked.",
        route: [
          { from: 1, to: 4, method: "con-crude-chairs" },
          { from: 4, to: 9, method: "con-wooden-bookcases" },
          { from: 9, to: 22, method: "con-wooden-larders" },
          { from: 22, to: 33, method: "con-oak-dining-tables" },
          { from: 33, to: 74, method: "con-oak-larders", note: "Slower until you have the demon butler at 50." },
          { from: 74, to: 99, method: "con-oak-dungeon-doors" }
        ]
      },
      {
        key: "homes", name: "Mahogany Homes", prefer: "cheap",
        intro: "Contracts for homeowners instead of building in your own house. You use about a third of the planks per XP, you don't need a house or a demon butler, and it works the same at every level: about 33K XP per hour on beginner contracts, 70K on novice, 140K on adept and 180K on expert. Slower than mahogany tables with a butler, but far cheaper. Plain, oak and teak planks are unlocked, so beginner, novice and adept contracts are open; mahogany planks aren't yet.",
        route: [
          { from: 1, to: 20, method: "con-homes-beginner" },
          { from: 20, to: 50, method: "con-homes-novice" },
          { from: 50, to: 70, method: "con-homes-adept" },
          { from: 70, to: 99, method: "con-homes-expert" },
          { from: 70, to: 99, method: "con-homes-adept", alternative: true, note: "Slower than expert contracts, but teak planks cost much less per XP." }
        ]
      },
      {
        key: "balanced", name: "Best of both", auto: true,
        intro: "Worked out live from GE prices: for every level range it picks the method with the lowest total cost, counting both the gold you spend and the time it takes, valued at what you say your time is worth below. Raise the value to train faster, lower it to save money.",
        from: 1, to: 99,
        candidates: ["con-crude-chairs", "con-wooden-bookcases", "con-wooden-larders", "con-oak-dining-tables", "con-oak-larders", "con-mahogany-tables", "con-oak-dungeon-doors", "con-gnome-benches",
          "con-homes-beginner", "con-homes-novice", "con-homes-adept", "con-homes-expert"]
      }
    ]
  },
  runecrafting: {
    intro: "Runecraft is slow everywhere. Quests that give Runecraft XP skip the first levels (Temple of the Eye, Enter the Abyss and more). Three good ways to train: lava runes (fastest, costs money), the Ourania altar (earns money, no talismans needed) and Guardians of the Rift (a free group minigame from 27 that also gives the essence pouches and the Raiments of the Eye outfit).",
    routes: [
      {
        key: "fastest", name: "Fastest",
        intro: "Ourania until 23, then lava runes all the way: 43K XP per hour at first and up to 100K with the colossal pouch and Magic Imbue. It costs about 2 gp per XP, and you need a binding necklace, a fire tiara and an earth talisman (or Magic Imbue at Magic 82).",
        route: [
          { from: 1, to: 23, method: "rc-ourania-1" },
          { from: 23, to: 99, method: "rc-lava-runes" }
        ]
      },
      {
        key: "money", name: "Earn money", prefer: "cheap",
        intro: "The Ourania (ZMI) altar the whole way: every essence becomes a random rune, and the runes are worth more than the essence, about 350K to 400K gp per hour at mid levels. XP per essence goes up as you level. Lunar Diplomacy (Ourania Teleport) makes it a lot faster.",
        route: [
          { from: 1, to: 50, method: "rc-ourania-1" },
          { from: 50, to: 75, method: "rc-ourania-50" },
          { from: 75, to: 90, method: "rc-ourania-75" },
          { from: 90, to: 99, method: "rc-ourania-90" }
        ]
      },
      {
        key: "gotr", name: "Guardians of the Rift",
        intro: "The free, social route: Guardians of the Rift from 27 (after Temple of the Eye). Slower XP than lava runes, but it costs nothing, the rewards (runes, essence pouches, the Raiments of the Eye outfit for 60% more runes) aren't counted here, and you can play it together.",
        route: [
          { from: 1, to: 27, method: "rc-ourania-1", note: "Or do the Runecraft quests." },
          { from: 27, to: 50, method: "rc-gotr-27" },
          { from: 50, to: 75, method: "rc-gotr-50" },
          { from: 75, to: 85, method: "rc-gotr-75" },
          { from: 85, to: 99, method: "rc-gotr-85" }
        ]
      },
      {
        key: "balanced", name: "Best of both", auto: true,
        intro: "Worked out live from GE prices: for every level range it picks the method with the lowest total cost, counting both the gold you spend and the time it takes, valued at what you say your time is worth below. Raise the value to train faster, lower it to save money.",
        from: 1, to: 99,
        candidates: ["rc-air-runes", "rc-earth-runes", "rc-fire-runes", "rc-body-runes", "rc-lava-runes",
          "rc-ourania-1", "rc-ourania-50", "rc-ourania-75", "rc-ourania-90", "rc-gotr-27", "rc-gotr-50", "rc-gotr-75", "rc-gotr-85"]
      }
    ]
  },
  agility: {
    intro: "Agility costs nothing: you run laps. It's slow, so skip the start with quests: The Tourist Trap (put both XP rewards in Agility: 9,300 XP, level 1 to 26), Recruitment Drive (1,000), The Depths of Despair (1,500) and The Grand Tree (7,900) together give 19,700 XP, level 33. Rooftop courses drop marks of grace: 260 marks buy the full graceful outfit from Grace in the Rogues' Den (it restores run energy faster and weighs nothing), and after that 10 marks buy 100 amylase crystals to sell. The routes count marks as amylase crystals, so the money shown only becomes real once you have graceful. Always run, and bring stamina or energy potions for the courses that aren't rooftops. A summer pie boosts Agility by 5, enough to start most courses early.",
    routes: [
      {
        key: "rooftops", name: "Rooftops",
        intro: "The simple route: the best rooftop course for your level, all the way. Slow (10K XP per hour at first, 50K from 70, 70K at 90), but safe, relaxed, no requirements beyond the level, and marks of grace the whole way. For the graceful outfit, stay at Canifis from 40 until you have your 260 marks: it gives the most marks and doesn't slow down as you level.",
        route: [
          { from: 1, to: 20, method: "agi-draynor" },
          { from: 20, to: 30, method: "agi-al-kharid" },
          { from: 30, to: 40, method: "agi-varrock" },
          { from: 40, to: 50, method: "agi-canifis", note: "Stay here for the graceful outfit; move on at 50 if you only want XP." },
          { from: 50, to: 60, method: "agi-falador" },
          { from: 60, to: 70, method: "agi-seers" },
          { from: 70, to: 80, method: "agi-pollnivneach" },
          { from: 80, to: 90, method: "agi-rellekka" },
          { from: 90, to: 99, method: "agi-ardougne" }
        ]
      },
      {
        key: "fastest", name: "Fastest",
        intro: "The Tourist Trap first, then the Brimhaven floor spikes (30K+ XP per hour, three times the rooftops), the Wilderness course from 52 and the Hallowed Sepulchre from 62 (56K XP per hour, rising to about 100K at 87). The Sepulchre needs Sins of the Father, a long quest line, and takes practice; until someone has it, the route shows the best alternative. No marks of grace on this route, so do some Canifis laps on the side for graceful.",
        route: [
          { from: 1, to: 26, quest: "The Tourist Trap", url: "https://oldschool.runescape.wiki/w/The_Tourist_Trap", note: "Put both XP rewards (4,650 each) in Agility: level 1 to 26 at once. Needs Fletching 10 and Smithing 20. The same quest unlocks darts for Fletching and Smithing." },
          { from: 26, to: 52, method: "agi-brimhaven-spikes", note: "From 40 the arena's tickets are faster still (45K to 50K XP per hour). With summer pies you can start the Wilderness course at 47." },
          { from: 52, to: 62, method: "agi-wilderness", note: "Player killers come by: bring only the fee and summer pies." },
          { from: 62, to: 72, method: "agi-sepulchre-62" },
          { from: 72, to: 77, method: "agi-sepulchre-72" },
          { from: 77, to: 87, method: "agi-sepulchre-77" },
          { from: 87, to: 99, method: "agi-sepulchre-87" }
        ]
      },
      {
        key: "money", name: "Earn money", prefer: "cheap",
        intro: "Agility that pays. The Agility Pyramid from 30 gives 10,000 coins per pyramid top, straight into your pocket: 130K per hour at first, 260K from 75. The Wilderness Agility Course from 52 pays far more (rune armour and blighted supplies from the dispenser, well over a million per hour on a long streak), but it's in the deep Wilderness and you can lose the 150K fee. Not keen on the Wilderness? Stay on the pyramid.",
        route: [
          { from: 1, to: 20, method: "agi-draynor" },
          { from: 20, to: 30, method: "agi-al-kharid" },
          { from: 30, to: 52, method: "agi-pyramid-30", note: "You fall a lot below 50; Canifis (40) is the calmer option and gives marks." },
          { from: 52, to: 99, method: "agi-wilderness", note: "Safe alternative: the Agility Pyramid, 200K to 260K coins per hour from 60." }
        ]
      },
      {
        key: "balanced", name: "Best of both", auto: true,
        intro: "Worked out live: for every level range it picks the course with the lowest total cost, counting what the course earns (marks of grace as amylase crystals, pyramid tops, Wilderness loot at GE prices) and the time it takes, valued at what you say your time is worth below. With a high value it picks the fastest XP, with a low value the best money.",
        from: 1, to: 99,
        candidates: [
          "agi-draynor", "agi-al-kharid", "agi-varrock", "agi-canifis", "agi-falador", "agi-seers", "agi-pollnivneach", "agi-rellekka", "agi-ardougne",
          "agi-brimhaven-spikes", "agi-brimhaven-arena", "agi-pyramid-30", "agi-pyramid-60", "agi-pyramid-75",
          "agi-shayzien-advanced", "agi-ape-atoll", "agi-wilderness", "agi-wyrm-basic", "agi-wyrm-advanced", "agi-werewolf",
          "agi-sepulchre-52", "agi-sepulchre-62", "agi-sepulchre-72", "agi-sepulchre-77", "agi-sepulchre-87", "agi-prifddinas"
        ]
      }
    ]
  },
  farming: {
    intro: "Farming works differently from every other skill: you plant, go and do something else, and come back when it has grown. So the numbers here are per DAY, not per hour: a run takes 5 to 10 minutes of play, once a day. Tree runs give by far the most XP; herb runs earn money. Do both, plus hardwood trees on Fossil Island, and the XP adds up. Quests skip the start: the Goblin generals part of Recipe for Disaster, Fairytale I, Forgettable Tale, The Garden of Death, Garden of Tranquillity, Enlightened Journey and My Arm's Big Adventure together give 32,500 XP (level 38). Bronzeman: almost every sapling is still locked. You only need one of each: plant the seed in a filled plant pot, water it and wait a few minutes. Tree seeds come from bird nests (bird house runs), Wintertodt crates and farming contracts in the Farming Guild (45). The Tithe Farm (34) is the only way to train without waiting, and the Farming Guild adds a tree patch at 65, a fruit tree patch at 85 and the Hespori boss at 65: all three are on the routes below.",
    routes: [
      {
        key: "trees", name: "Tree runs",
        intro: "The fastest route: once a day, plant the best tree in the 5 tree patches (6 from 65, with the Farming Guild) and the best fruit tree in the 4 fruit tree patches (5 from 85), and pay the farmers to look after them. About 15K XP per day at 33, 50K at 60 and 170K from 85. Yew and magic saplings are expensive; if that hurts, plant the fruit trees only (next tab).",
        route: [
          { from: 1, to: 15, method: "farm-bagged-plants", note: "Or the quests: Fairytale I alone gives 3,500 XP (level 17)." },
          { from: 15, to: 27, method: "farm-run-15" },
          { from: 27, to: 30, method: "farm-run-27" },
          { from: 30, to: 33, method: "farm-run-30" },
          { from: 33, to: 39, method: "farm-run-33" },
          { from: 39, to: 42, method: "farm-run-39" },
          { from: 42, to: 45, method: "farm-run-42" },
          { from: 45, to: 51, method: "farm-run-45" },
          { from: 51, to: 57, method: "farm-run-51" },
          { from: 57, to: 60, method: "farm-run-57" },
          { from: 60, to: 65, method: "farm-run-60" },
          { from: 65, to: 68, method: "farm-run-65", note: "From 65 the tree patch in the Farming Guild is counted too." },
          { from: 68, to: 72, method: "farm-run-68" },
          { from: 72, to: 75, method: "farm-run-72" },
          { from: 75, to: 81, method: "farm-run-75" },
          { from: 81, to: 85, method: "farm-run-81" },
          { from: 85, to: 99, method: "farm-run-85", note: "From 85 the fruit tree and celastrus patches in the Farming Guild are counted too." },
          { from: 34, to: 54, method: "farm-tithe-34", alternative: "Between runs" },
          { from: 54, to: 74, method: "farm-tithe-54", alternative: "Between runs" },
          { from: 74, to: 99, method: "farm-tithe-74", alternative: "Between runs" },
          { from: 45, to: 99, tip: "Farming contracts (Farming Guild)", url: "https://oldschool.runescape.wiki/w/Farming_contract", note: "Guildmaster Jane in the Farming Guild asks you to grow one crop in the guild's patches and pays with a seed pack: the best source of tree, fruit tree and herb seeds, and of hespori seeds. Easy contracts from 45, medium from 65, hard from 85. The XP is whatever the crop gives; take one every time you pass through." },
          { from: 65, to: 99, method: "farm-hespori", alternative: "Alongside" }
        ]
      },
      {
        key: "fruit", name: "Fruit trees only", prefer: "cheap",
        intro: "The cheap route: only the 4 fruit tree patches (and the calquat tree from 72). Fruit tree saplings cost a fraction of yew and magic saplings, and you still get about half the XP of a full tree run for a shorter run. Oak trees first, until you can plant apple trees at 27.",
        route: [
          { from: 1, to: 15, method: "farm-bagged-plants", note: "Or the quests: Fairytale I alone gives 3,500 XP (level 17)." },
          { from: 15, to: 27, method: "farm-run-15" },
          { from: 27, to: 33, method: "farm-fruit-27" },
          { from: 33, to: 39, method: "farm-fruit-33" },
          { from: 39, to: 42, method: "farm-fruit-39" },
          { from: 42, to: 51, method: "farm-fruit-42" },
          { from: 51, to: 57, method: "farm-fruit-51" },
          { from: 57, to: 68, method: "farm-fruit-57" },
          { from: 68, to: 72, method: "farm-fruit-68" },
          { from: 72, to: 81, method: "farm-fruit-72" },
          { from: 81, to: 85, method: "farm-fruit-81" },
          { from: 85, to: 99, method: "farm-fruit-85", note: "From 85 the fruit tree patch in the Farming Guild is counted too." },
          { from: 34, to: 54, method: "farm-tithe-34", alternative: "Between runs" },
          { from: 54, to: 74, method: "farm-tithe-54", alternative: "Between runs" },
          { from: 74, to: 99, method: "farm-tithe-74", alternative: "Between runs" },
          { from: 45, to: 99, tip: "Farming contracts (Farming Guild)", url: "https://oldschool.runescape.wiki/w/Farming_contract", note: "Guildmaster Jane in the Farming Guild asks you to grow one crop in the guild's patches and pays with a seed pack: the best source of tree, fruit tree and herb seeds, and of hespori seeds. Easy contracts from 45, medium from 65, hard from 85. The XP is whatever the crop gives; take one every time you pass through." },
          { from: 65, to: 99, method: "farm-hespori", alternative: "Alongside" }
        ]
      },
      {
        key: "herbs", name: "Herb runs (money)", prefer: "cheap",
        intro: "Herb runs are one of the best money makers for the time they take: 5 patches, 5 minutes, twice a day. On their own they're slow XP, so do them next to your tree runs. Which herb pays best changes with prices: sort the table below by \"Most profit per hour\" and plant the best one you have the level and the seed for. The route below is the usual pick per level.",
        route: [
          { from: 9, to: 14, method: "farm-herb-guam" },
          { from: 14, to: 19, method: "farm-herb-marrentill" },
          { from: 19, to: 26, method: "farm-herb-tarromin" },
          { from: 26, to: 32, method: "farm-herb-harralander" },
          { from: 32, to: 38, method: "farm-herb-ranarr" },
          { from: 38, to: 62, method: "farm-herb-toadflax", note: "Ranarr, irit, avantoe and kwuarm are close: check the table." },
          { from: 62, to: 85, method: "farm-herb-snapdragon", note: "Only when the seed is cheap enough; otherwise toadflax, kwuarm or cadantine." },
          { from: 85, to: 99, method: "farm-herb-torstol" },
          { from: 45, to: 99, tip: "Farming contracts (Farming Guild)", url: "https://oldschool.runescape.wiki/w/Farming_contract", note: "Guildmaster Jane pays for each contract with a seed pack, which often holds herb seeds. Easy contracts from 45, medium from 65, hard from 85. The guild also has an extra herb patch from 65." }
        ]
      },
      {
        key: "tithe", name: "Tithe Farm (no waiting)",
        intro: "For when you want to train Farming right now instead of waiting for trees: the Tithe Farm minigame in Hosidius, from 34. It costs nothing, and the points buy the farmer's outfit (2.5% more Farming XP), the seed box and the herb sack. Per day it's far slower than tree runs, so the best use is in between your runs. The time shown here is hours of play, not days.",
        route: [
          { from: 1, to: 15, method: "farm-bagged-plants", note: "Or the quests: Fairytale I alone gives 3,500 XP (level 17)." },
          { from: 15, to: 34, method: "farm-bagged-plants", note: "Expensive this far. Cheaper: do tree runs or the Farming quests until 34." },
          { from: 34, to: 54, method: "farm-tithe-34" },
          { from: 54, to: 74, method: "farm-tithe-54" },
          { from: 74, to: 99, method: "farm-tithe-74" }
        ]
      }
    ]
  },
  hunter: {
    intro: "Hunter costs almost nothing: you need a few cheap tools (noose wand, butterfly net, bird snares, box traps, ropes and small fishing nets) and what you catch is mostly dropped. Start with the Natural History Quiz in the Varrock Museum basement: 1,000 XP, level 9, in ten minutes. Bird house runs on Fossil Island (Bone Voyage) are the low-effort way and are counted per day; everything else is per hour of play. Box traps need the start of Eagles' Peak. Chinchompas are where Hunter starts to pay: red ones from 63, black ones (Wilderness) from 73. Hunter tools aren't unlocked yet: the hunter shops in Yanille and Nardah sell them all for a few coins.",
    routes: [
      {
        key: "fastest", name: "Fastest",
        intro: "The fastest XP per hour of play: tracking and butterflies at the start, falconry from 43, razor-backed kebbits from 49 to 72 (100K to 130K XP per hour, no quest needed) and Hunters' Rumours in the Hunter Guild from 72 (160K XP per hour, rising to 250K at 99). Red crabs need the Pandemonium quest, and jerboas and the guild need Varlamore (Children of the Sun); the route shows what to do instead if you don't have them. Black chinchompas are as fast as rumours only with tick manipulation, but they pay: see Earn money.",
        route: [
          { from: 1, to: 9, quest: "Natural History Quiz", url: "https://oldschool.runescape.wiki/w/Natural_History_Quiz", note: "Talk to Orlando Smith in the basement of the Varrock Museum: 1,000 Hunter XP (and 1,000 Slayer XP)." },
          { from: 9, to: 15, method: "hunt-feldip-weasels" },
          { from: 15, to: 21, method: "hunt-ruby-harvests" },
          { from: 21, to: 39, method: "hunt-red-crabs", note: "Without Pandemonium: sapphire glacialis (25) or swamp lizards (29)." },
          { from: 39, to: 43, method: "hunt-embertailed-jerboas" },
          { from: 43, to: 49, method: "hunt-falconry-spotted" },
          { from: 49, to: 72, method: "hunt-razor-backed-kebbits" },
          { from: 72, to: 91, method: "hunt-rumours-72", note: "Or black chinchompas (73) in the Wilderness: similar XP with tick manipulation, and well over a million coins per hour." },
          { from: 91, to: 99, method: "hunt-rumours-91" }
        ]
      },
      {
        key: "birdhouses", name: "Bird houses",
        intro: "The lazy route: bird house runs only, a minute or two every time you think of it. Slow in days, but it takes almost no play time and the bird nests give tree seeds for Farming. You need Bone Voyage and the Crafting level for each house (about the same as the Hunter level). The time shown is for 6 runs a day; do bird houses next to another route and the XP adds up.",
        route: [
          { from: 1, to: 9, quest: "Natural History Quiz", url: "https://oldschool.runescape.wiki/w/Natural_History_Quiz", note: "Talk to Orlando Smith in the basement of the Varrock Museum: 1,000 Hunter XP (and 1,000 Slayer XP)." },
          { from: 9, to: 14, method: "hunt-bird-houses-regular" },
          { from: 14, to: 24, method: "hunt-bird-houses-oak" },
          { from: 24, to: 34, method: "hunt-bird-houses-willow" },
          { from: 34, to: 44, method: "hunt-bird-houses-teak" },
          { from: 44, to: 49, method: "hunt-bird-houses-maple" },
          { from: 49, to: 59, method: "hunt-bird-houses-mahogany" },
          { from: 59, to: 74, method: "hunt-bird-houses-yew" },
          { from: 74, to: 89, method: "hunt-bird-houses-magic" },
          { from: 89, to: 99, method: "hunt-bird-houses-redwood" }
        ]
      },
      {
        key: "money", name: "Earn money", prefer: "cheap",
        intro: "Hunter that pays. Up to 35 there's nothing worth selling, so get there quickly. Aerial fishing (Hunter 35, Fishing 43) earns through Molch pearls, red chinchompas from 63 sell one for one, and black chinchompas from 73 are the best money in the skill, at the price of hunting in the Wilderness.",
        route: [
          { from: 1, to: 9, quest: "Natural History Quiz", url: "https://oldschool.runescape.wiki/w/Natural_History_Quiz", note: "Talk to Orlando Smith in the basement of the Varrock Museum: 1,000 Hunter XP (and 1,000 Slayer XP)." },
          { from: 9, to: 15, method: "hunt-feldip-weasels" },
          { from: 15, to: 25, method: "hunt-ruby-harvests" },
          { from: 25, to: 35, method: "hunt-sapphire-glacialis", note: "Swamp lizards (29) are a calmer alternative." },
          { from: 35, to: 63, method: "aerial-fishing", note: "Needs Fishing 43. Razor-backed kebbits (49) are three times as fast if you only want the levels." },
          { from: 63, to: 73, method: "hunt-red-chinchompas" },
          { from: 73, to: 80, method: "hunt-black-chinchompas-73", note: "Not keen on the Wilderness? Stay on red chinchompas." },
          { from: 80, to: 90, method: "hunt-black-chinchompas-80" },
          { from: 90, to: 99, method: "hunt-black-chinchompas-90" }
        ]
      },
      {
        key: "balanced", name: "Best of both", auto: true,
        intro: "Worked out live: for every level range it picks the method with the lowest total cost, counting what it earns or costs (chinchompas sold, drift nets and bananas bought) and the time it takes, valued at what you say your time is worth below. Bird house runs aren't in here, because they don't take play time.",
        from: 7, to: 99,
        candidates: [
          "hunt-feldip-weasels", "hunt-ruby-harvests", "hunt-red-crabs", "hunt-sapphire-glacialis", "hunt-swamp-lizards", "hunt-embertailed-jerboas",
          "hunt-falconry-spotted", "hunt-falconry-dark", "hunt-orange-salamanders", "hunt-razor-backed-kebbits", "hunt-red-salamanders", "hunt-red-chinchompas",
          "hunt-black-salamanders", "hunt-moonlight-moths", "aerial-fishing", "hunt-drift-nets-44", "hunt-drift-nets-55", "hunt-drift-nets-70",
          "hunt-maniacal-monkeys-60", "hunt-maniacal-monkeys-75", "hunt-maniacal-monkeys-90", "hunt-rumours-72", "hunt-rumours-91",
          "hunt-black-chinchompas-73", "hunt-black-chinchompas-80", "hunt-black-chinchompas-90"
        ]
      }
    ]
  },
  mining: {
    intro: "Mining costs nothing but time. Quests skip the start: Doric's Quest, The Dig Site, Plague City, The Giant Dwarf, The Lost Tribe and Another Slice of H.A.M. give 27,525 XP together, level 1 to 37. After that you choose between fast (drop everything you mine) and useful (the Motherlode Mine, gems, amethyst: slower, but you keep what you mine, and it feeds Smithing). The numbers here are without tick manipulation, except 3-tick granite, which is listed for anyone who wants to learn it. Always use the best pickaxe you can; a celestial ring from crashed stars gives an invisible +4.",
    routes: [
      {
        key: "fastest", name: "Fastest",
        intro: "Copper and tin for a few minutes, then iron all the way to 70: three rocks in a triangle, drop the ore, 45K to 55K XP per hour, and 70K to 80K in the Mining Guild from 60. From 70 the Volcanic Mine on Fossil Island, which is also something to do as a group. This is the wiki's route for players who don't use tick manipulation.",
        route: [
          { from: 1, to: 15, method: "mine-copper-tin", note: "Or the quests: Doric's Quest alone gives 1,300 XP (level 10)." },
          { from: 15, to: 70, method: "mine-iron", note: "Move to the Mining Guild at 60." },
          { from: 70, to: 99, method: "mine-volcanic-mine", note: "Without Bone Voyage: stay on iron in the Mining Guild." }
        ]
      },
      {
        key: "relaxed", name: "Relaxed (money)", prefer: "cheap",
        intro: "The low-effort route that pays: the Motherlode Mine from 30 (coal at first, then gold, mithril, adamantite and runite as you level, plus golden nuggets for the prospector outfit and the coal bag), and amethyst from 92. Slower than power mining, but you barely have to click and everything you mine is yours.",
        route: [
          { from: 1, to: 15, method: "mine-copper-tin" },
          { from: 15, to: 30, method: "mine-iron" },
          { from: 30, to: 92, method: "motherlode-mine", note: "Use the buttons on the card for your level: the default is for 35 to 38. Gem rocks (40) pay better if you have the medium Karamja Diary." },
          { from: 92, to: 99, method: "mine-amethyst" }
        ]
      },
      {
        key: "balanced", name: "Best of both", auto: true,
        intro: "Worked out live: for every level range it picks the method with the lowest total cost, counting what it earns or costs and the time it takes, valued at what you say your time is worth below. With a high value it picks the fastest XP, with a low value the best money.",
        from: 1, to: 99,
        candidates: ["mine-copper-tin", "mine-iron", "motherlode-mine", "mine-gem-rocks", "mine-calcified-rocks", "mine-crashed-stars", "mine-volcanic-mine", "mine-amethyst"]   // no 3-tick granite: tick manipulation
      }
    ]
  },
  fishing: {
    intro: "Fishing is slow but cheap: a rod, a net or a harpoon and some bait. The start can be skipped with one quest: Sea Slug gives 7,175 XP, level 1 to 24 (it needs Firemaking 30). The numbers here are all without tick manipulation. Fly and barbarian fishing drop the fish for speed; if you want the fish for Cooking, bank them and count on fewer per hour. With Hunter 44 and Fishing 47, drift net fishing trains both skills at once and is faster than anything here.",
    routes: [
      {
        key: "fastest", name: "Fastest",
        intro: "Sea Slug, a few levels of fly fishing, and from 35 the Tempoross: a boss you fish against with other players, 30K XP per hour at 35 and over 60K from 70, for free, with a reward pool on top. This is the fastest Fishing without tick manipulation unless you also train Hunter with drift nets.",
        route: [
          { from: 1, to: 24, quest: "Sea Slug", url: "https://oldschool.runescape.wiki/w/Sea_Slug", note: "7,175 Fishing XP: level 1 to 24 in one go. Needs Firemaking 30. Without it: net shrimps at Draynor until 20, then fly fish." },
          { from: 24, to: 30, method: "fish-fly-20" },
          { from: 30, to: 35, method: "fish-fly-30" },
          { from: 35, to: 50, method: "fish-tempoross-35" },
          { from: 50, to: 70, method: "fish-tempoross-50" },
          { from: 70, to: 99, method: "fish-tempoross-70" }
        ]
      },
      {
        key: "relaxed", name: "Relaxed",
        intro: "Click a spot, wait, drop: fly fishing until 48 and barbarian fishing after that, which also trickles Agility and Strength XP. Slower than the Tempoross, but you can do it while watching something else.",
        route: [
          { from: 1, to: 24, quest: "Sea Slug", url: "https://oldschool.runescape.wiki/w/Sea_Slug", note: "7,175 Fishing XP: level 1 to 24 in one go. Needs Firemaking 30. Without it: net shrimps at Draynor until 20, then fly fish." },
          { from: 24, to: 30, method: "fish-fly-20" },
          { from: 30, to: 40, method: "fish-fly-30" },
          { from: 40, to: 48, method: "fish-fly-40" },
          { from: 48, to: 58, method: "fish-barbarian-48" },
          { from: 58, to: 70, method: "fish-barbarian-58" },
          { from: 70, to: 99, method: "fish-barbarian-70" }
        ]
      },
      {
        key: "money", name: "Earn money", prefer: "cheap",
        intro: "Fishing only starts to pay at 62: monkfish (Swan Song), karambwans from 65 (Tai Bwo Wannai Trio) and minnows from 82, which you trade for raw sharks. Get to 62 the fast way first. Aerial fishing (Fishing 43, Hunter 35) also earns money on the way.",
        route: [
          { from: 1, to: 24, quest: "Sea Slug", url: "https://oldschool.runescape.wiki/w/Sea_Slug", note: "7,175 Fishing XP: level 1 to 24 in one go. Needs Firemaking 30." },
          { from: 24, to: 30, method: "fish-fly-20" },
          { from: 30, to: 35, method: "fish-fly-30" },
          { from: 35, to: 50, method: "fish-tempoross-35" },
          { from: 50, to: 62, method: "fish-tempoross-50" },
          { from: 62, to: 82, method: "fish-monkfish", note: "Karambwans (65) pay about the same: check the table." },
          { from: 82, to: 99, method: "fish-minnows", note: "You need the full angler's outfit to get on the platform." }
        ]
      },
      {
        key: "balanced", name: "Best of both", auto: true,
        intro: "Worked out live: for every level range it picks the method with the lowest total cost, counting what it earns or costs and the time it takes, valued at what you say your time is worth below. With a high value it picks the fastest XP, with a low value the best money.",
        from: 20, to: 99,
        candidates: ["fish-fly-20", "fish-fly-30", "fish-fly-40", "fish-tempoross-35", "fish-tempoross-50", "fish-tempoross-70", "fish-barbarian-48", "fish-barbarian-58", "fish-barbarian-70",
          "aerial-fishing", "hunt-drift-nets-44", "hunt-drift-nets-55", "hunt-drift-nets-70", "fish-monkfish", "fish-karambwans", "fish-minnows", "fish-anglerfish"]
      }
    ]
  },
  woodcutting: {
    intro: "Woodcutting costs nothing, and the logs are what the group needs for Firemaking, Fletching and bird houses: several kinds aren't unlocked yet, and cutting the first one unlocks it for everyone. You can chop fast and drop the logs, or chop slower trees next to a bank and keep them. Quests can skip the first levels: Monk's Friend, Enlightened Journey, Icthlarin's Little Helper and one part of Recipe for Disaster give 9,000 XP (level 26). The numbers here are without tick manipulation. From 60 the Woodcutting Guild gives an invisible +7.",
    routes: [
      {
        key: "fastest", name: "Fastest",
        intro: "Regular trees and oaks to 35, then teak trees (drop the logs) to 65, then the sulliuscep mushrooms on Fossil Island: over 80K XP per hour from 65. Sulliusceps need Bone Voyage; without it, stay on teaks.",
        route: [
          { from: 1, to: 15, method: "wc-regular" },
          { from: 15, to: 35, method: "wc-oak" },
          { from: 35, to: 50, method: "wc-teak-35" },
          { from: 50, to: 61, method: "wc-teak-50" },
          { from: 61, to: 65, method: "wc-teak-61" },
          { from: 65, to: 80, method: "wc-sulliuscep-65" },
          { from: 80, to: 90, method: "wc-sulliuscep-80" },
          { from: 90, to: 99, method: "wc-sulliuscep-90" }
        ]
      },
      {
        key: "logs", name: "Keep the logs", prefer: "cheap",
        intro: "The classic route next to a bank: willows, maples, yews, magic trees and redwoods, keeping every log to sell or to use. Slower, relaxed, and it unlocks yew, magic and redwood logs for the group. Only the level-99 rates come from the wiki; the starting pace per tree is my estimate.",
        route: [
          { from: 1, to: 15, method: "wc-regular" },
          { from: 15, to: 30, method: "wc-oak" },
          { from: 30, to: 45, method: "wc-willow" },
          { from: 45, to: 60, method: "wc-maple" },
          { from: 60, to: 75, method: "wc-yew" },
          { from: 75, to: 90, method: "wc-magic", note: "Very slow XP. Yews stay better per hour; magic logs are worth more each." },
          { from: 90, to: 99, method: "wc-redwood" }
        ]
      },
      {
        key: "balanced", name: "Best of both", auto: true,
        intro: "Worked out live: for every level range it picks the method with the lowest total cost, counting what it earns or costs and the time it takes, valued at what you say your time is worth below. With a high value it picks the fastest XP, with a low value the best money.",
        from: 1, to: 99,
        candidates: ["wc-regular", "wc-oak", "wc-teak-35", "wc-teak-50", "wc-teak-61", "wc-blisterwood", "wc-sulliuscep-65", "wc-sulliuscep-80", "wc-sulliuscep-90",
          "wc-willow", "wc-maple", "wc-yew", "wc-magic", "wc-redwood"]
      }
    ]
  },
  prayer: {
    intro: "Prayer is coins in, XP out: you buy bones and offer them. Where you offer them matters most. Burying gives the plain XP; a gilded altar gives three and a half times as much; the Chaos Temple altar in the Wilderness gives the same and also saves half your bones. Quests give the first levels for free: The Restless Ghost, Priest in Peril, Recruitment Drive and Holy Grail are 14,531 XP together (level 30). Level 43 unlocks all three protection prayers. Bronzeman: bones, big bones, babydragon bones and dragon bones are unlocked; for the others someone has to get one as a drop first.",
    routes: [
      {
        key: "fastest", name: "Fastest",
        intro: "Dragon bones on a gilded altar: about 640K XP per hour, the fastest thing on the whole site. You don't need your own altar: world 330 at the Rimmington house portal always has open houses. Superior dragon bones are faster still from Prayer 70, but nobody has unlocked them.",
        route: [
          { from: 1, to: 70, method: "pray-altar-dragon-bones" },
          { from: 70, to: 99, method: "pray-altar-superior-dragon-bones" }
        ]
      },
      {
        key: "cheapest", name: "Cheapest", prefer: "cheap",
        intro: "The same dragon bones at the Chaos Temple altar in level 38 Wilderness: half of them aren't used up, so every level costs half as much. Player killers come by often, so you only ever carry one inventory of bones, and losing some now and then is part of the price. Not keen on the Wilderness? Big bones on a gilded altar are the budget choice.",
        route: [
          { from: 1, to: 99, method: "pray-chaos-dragon-bones", note: "Safe and still cheap: big bones on a gilded altar." }
        ]
      },
      {
        key: "balanced", name: "Best of both", auto: true,
        intro: "Worked out live from GE prices: it picks the bone and the altar with the lowest total cost, counting the bones you buy and the time it takes, valued at what you say your time is worth below. With a low value it picks cheap bones at the Chaos Temple, with a high value expensive bones on a gilded altar. Bones nobody has unlocked are only picked when nothing else fits.",
        from: 1, to: 99,
        candidates: ["pray-bury-bones", "pray-bury-big-bones",
          "pray-altar-big-bones", "pray-altar-babydragon-bones", "pray-altar-wyrm-bones", "pray-altar-dragon-bones", "pray-altar-wyvern-bones", "pray-altar-drake-bones", "pray-altar-lava-dragon-bones", "pray-altar-hydra-bones", "pray-altar-dagannoth-bones", "pray-altar-superior-dragon-bones",
          "pray-chaos-big-bones", "pray-chaos-babydragon-bones", "pray-chaos-wyrm-bones", "pray-chaos-dragon-bones", "pray-chaos-wyvern-bones", "pray-chaos-drake-bones", "pray-chaos-lava-dragon-bones", "pray-chaos-hydra-bones", "pray-chaos-dagannoth-bones", "pray-chaos-superior-dragon-bones"]
      }
    ]
  }
};
