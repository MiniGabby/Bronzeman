// What's new on the site, newest first. Shown on the Updates tab.
// Add an entry for every change the group would notice: date (YYYY-MM-DD), a short title,
// what changed in plain words, and optionally a link to the page ("#/merch").
export default [
  {
    date: "2026-10-03", title: "Pick your name at the top", link: "#/player",
    items: [
      "New \"You\" menu at the top of every page, next to Instant / Offers / Mid. Pick your own name once and the site shows your options by default: the Player tab opens on your page, Money makers and skill training use your levels, and your column is highlighted on the Group page.",
      "It's saved in your own browser, so everyone picks their own name on their own device. You can still look at someone else's page with the menus on each page."
    ]
  },
  {
    date: "2026-10-03", title: "Quests load automatically with WikiSync", link: "#/group",
    items: [
      "The Group page now lists every quest and miniquest, A to Z, in two tables: free-to-play (24) and members (189). Each shows done, started or not started per player, and how many each of us has done.",
      "If you use the WikiSync plugin in RuneLite, your quests now load on the site automatically (Group page, player pages and the \"who can do it\" checks). Mini Gabby's already work.",
      "Not set up yet? In RuneLite, open the Plugin Hub, install or turn on WikiSync, and log in once. The site checks for new WikiSync data every 3 hours; until then your quests are filled in by hand."
    ]
  },
  {
    date: "2026-10-03", title: "Player pages, unlock goals, quests, goals and more", link: "#/player",
    items: [
      "New Player tab: pick your name and see what to do now: money makers you can do (and almost can), your next step on each training route, flips that are cheap to buy right now, your goals and unlocks you can get. Click a name on the Group page to get there too.",
      "Unlock goals on the Unlocked tab: the items we still need, ranked by how many methods they open up, with how to get one and who can get it now (or who's closest).",
      "Quests on the Group page: which quests each of us has done. Methods that need a quest now show who has done it; ? means nobody filled it in yet. Tell Nick (or Claude) which quests you've done.",
      "Goals on the Group page: e.g. \"Herblore 45 by Sunday\" with a progress bar from Wise Old Man.",
      "Merching: track what you bought under My flips. It shows your profit and turns green (and can send a notification) when your sell price is reached.",
      "Crafting route to 99 with jewellery, now with sapphire, diamond and dragonstone pieces. Emerald bracelets give 65 XP (was 60 on the site)."
    ]
  },
  {
    date: "2026-10-02", title: "46 new unlocks (606 in total)", link: "#/unlocked",
    items: [
      "Unlocked since 30 Sep include crushed nest (for Herblore), molten glass, dragonstone, diamond jewellery, and sapphire, emerald and ruby bracelets and amulets.",
      "Also new: iron and bronze dart tips, ring of wealth, necklace of passage, Ham clothing and a few tree seeds. Most unlocks this time by Lil Fool (18) and Mini Gabby (10)."
    ]
  },
  {
    date: "2026-10-02", title: "Merching: buy now, item details and safer suggestions", link: "#/merch",
    items: [
      "New When filter: \"Cheap to buy right now\" shows only items that are in the cheapest part of their day. Those rows also get a \"Buy now until …\" label.",
      "Click an item name for its details: buy and sell prices over the last weeks, a typical day hour by hour, and the numbers behind the suggestion.",
      "Pattern filter (all, usually, reliable), and each pattern shows on how many days it held, e.g. \"17/21 days\".",
      "Prices now stand out from the times, and items with only a handful of odd trades (like waterskins at 2 gp / 203 gp) are skipped."
    ]
  },
  {
    date: "2026-10-02", title: "Money makers only shows what you can (almost) do", link: "#/money",
    items: [
      "By default you only see methods someone in the group can do now or is within 5 levels of. Pick a player to see just their options, or show everything.",
      "Methods you're close to show how far you still are, e.g. \"4 levels to go (Smithing 46/50)\"."
    ]
  },
  {
    date: "2026-10-02", title: "New: Merching tab and best time to buy for alching", link: "#/merch",
    items: [
      "Merching: flips for items the group has unlocked, with what to buy at what time and price, and when to sell for what price, based on 3 weeks of hourly prices.",
      "Alchemy: a \"Best time to buy\" column with the cheapest hour of the day for each item."
    ]
  },
  {
    date: "2026-10-02", title: "Smithing guide to 99", link: "#/training/smithing",
    items: [
      "Three routes: Fastest (Blast Furnace gold), Cheapest (Blast Furnace bars, earns money) and Best of both (platebodies). All start with The Knight's Sword.",
      "Blast Furnace methods count the coffer cost, and locked bars and ores come with tips on how to unlock them."
    ]
  },
  {
    date: "2026-09-30", title: "Jewellery crafting", link: "#/training/crafting",
    items: ["Gold necklaces and bracelets up to diamond necklaces, as money makers and Crafting training."]
  },
  {
    date: "2026-09-30", title: "Herblore guide to 99", link: "#/training/herblore",
    items: [
      "A route with the best potion per level range, live cost per level and the fastest unlocked alternative.",
      "Tips on how to unlock the ingredients we don't have yet. You only need one of each."
    ]
  },
  {
    date: "2026-09-30", title: "Unlocked items updated", link: "#/unlocked",
    items: ["New plugin export added to the Unlocked tab."]
  },
  {
    date: "2026-09-28", title: "Dart tips and new unlocks", link: "#/money",
    items: ["Smithing bronze, iron, steel and mithril dart tips.", "Unlocked items updated."]
  },
  {
    date: "2026-09-27", title: "Alchemy, Unlocked tab and more methods", link: "#/alchemy",
    items: [
      "Alchemy tab: which unlocked items are worth high alching, a plan with at most 4 items and profit per hour.",
      "Unlocked tab: every item the group has unlocked, who and when.",
      "Motherlode Mine and bird house runs, cleaning grimy irit and ranarr.",
      "Requests tab: ask for a new guide.",
      "Group tab: levels above XP gained, update button once per hour."
    ]
  },
  {
    date: "2026-09-27", title: "The site goes live", link: "#/money",
    items: ["Money makers with live GE prices, skill training per skill and group stats from Wise Old Man."]
  }
];
