// What's new on the site, newest first. Shown on the Updates tab.
// Add an entry for every change the group would notice: date (YYYY-MM-DD), a short title,
// what changed in plain words, and optionally a link to the page ("#/merch").
export default [
  {
    date: "2026-10-10", title: "Player page: exactly what each training step takes", link: "#/player",
    items: [
      "Under every skill in \"Training routes\" there's now a line with exactly what it takes to reach the step's goal from your own XP: how many actions, every item to buy and how many, what it costs or earns, and how long it takes. For example: \"To reach 55 (93,211 XP to go): 933 potions · buy 933 Irit potion (unf), 933 Eye of newt · costs 300,426 gp · 22 min\".",
      "For Cooking it counts the fish that will burn at your level. Farm runs and bird houses show days instead of hours."
    ]
  },
  {
    date: "2026-10-10", title: "Player page: every part in its own block", link: "#/player",
    items: [
      "The parts of the Player page (What to do next, Money makers, Training routes, Flips, Goals, Unlocks) each have their own block now, with the title in a bar at the top, so it's clear where one ends and the next begins."
    ]
  },
  {
    date: "2026-10-10", title: "Arcanekitten: the same level is enough", link: "#/arcanekitten",
    items: [
      "A skill on the Arcanekitten tab is now crossed off as soon as someone in the group has the same level as arcanekitten; it doesn't have to be higher. Every skill that's still open needs one level less than the page said before."
    ]
  },
  {
    date: "2026-10-10", title: "Tabs in a new order",
    items: [
      "The tabs at the top are regrouped: Player and Skill training first, then the three money pages together (Money makers, Alchemy, Merching), then the group pages (Group, Unlocked, Arcanekitten), then Updates and Requests.",
      "If you've picked your name in the \"You\" menu, the site now opens on your own Player page instead of Money makers."
    ]
  },
  {
    date: "2026-10-10", title: "Farming: the Farming Guild, Hespori and the Tithe Farm on the routes", link: "#/training/farming",
    items: [
      "The tree runs now count the Farming Guild's patches: a sixth tree from 65 and a fifth fruit tree from 85. That's about 7K more XP per day from 65 and 32K more from 85.",
      "New method: Hespori, the boss you grow in the Farming Guild from 65. 12,600 Farming XP for a short fight every day or so, plus seeds. You need a hespori seed, which you get from harvesting and from farming contracts.",
      "The Tree runs and Fruit trees routes now have extra rows under the main steps for what you do next to your runs: the Tithe Farm between runs (from 34), farming contracts (from 45) and Hespori (from 65). These rows aren't counted in the route's total.",
      "There's also a new route tab, Tithe Farm (no waiting), for training Farming without waiting for anything to grow."
    ]
  },
  {
    date: "2026-10-10", title: "75 new unlocks (756 in total)", link: "#/unlocked",
    items: [
      "Teak plank (Mini Gabby): adept Mahogany Homes contracts are now open, about 140K Construction XP per hour from level 50 at a third of the usual cost per XP.",
      "Supercompost and compost (Key Kode), guam seed and a row of allotment and hops seeds (dreammancer), and a gardening trowel (Mini Gabby): herb runs no longer miss anything, and the trowel is what you need to turn tree seeds into saplings.",
      "Toadflax, grimy toadflax and toadflax potion (unf) (Key Kode) and snapdragon (Mini Gabby) for Herblore; fish offcuts (Mini Gabby) for aerial fishing; lead ore and lead bar (Mini Gabby) for superheating lead.",
      "Also shark, rune axe, jangerberries, a willow blackjack, mithril knife and javelin tips, and the pizza line. Most unlocks this time by Lil Fool (32), then Mini Gabby (15), dreammancer (13), Key Kode (10) and lil oldkitty (5)."
    ]
  },
  {
    date: "2026-10-10", title: "Construction: Mahogany Homes", link: "#/training/construction",
    items: [
      "The Construction guide now has Mahogany Homes: contracts for homeowners in Falador, Varrock, East Ardougne and Hosidius. Four tiers: beginner (level 1, planks), novice (20, oak planks), adept (50, teak planks) and expert (70, mahogany planks).",
      "You use about a third of the planks per XP compared with building in your own house, and you don't need a house or a demon butler. About 33K XP per hour on beginner contracts, 70K on novice, 140K on adept and 180K on expert.",
      "The Mahogany Homes route has two rows for 70 to 99: expert contracts, and adept contracts (teak planks) as an alternative, each with its own XP per hour, cost and time, so you can compare them. The alternative isn't counted in the route's total.",
      "There's a new Mahogany Homes route tab, and Best of both now considers the contracts too. Oak planks are unlocked, so novice contracts are open now; teak planks take one log and 500 coins at the sawmill to unlock."
    ]
  },
  {
    date: "2026-10-10", title: "Player page: what to do next", link: "#/player",
    items: [
      "Every player's page now starts with \"What to do next\": the next quest in the Optimal Ironman order of the Quest Helper plugin for RuneLite, based on the quests you've done according to WikiSync.",
      "If you don't have the levels or the quests for it yet, it says what to train or finish first, and shows the first quest on the list you can do right now. Below that: the skills you'll need for the next 30 steps, and the six quests that follow.",
      "Achievement diaries are part of the order too, with how many tasks you've done. Pick \"Optimal (Ironman)\" as the order in the Quest Helper plugin and it walks you through each quest. Quest points, combat levels and items aren't checked."
    ]
  },
  {
    date: "2026-10-10", title: "New tab: Arcanekitten", link: "#/arcanekitten",
    items: [
      "lil oldkitty usually plays on arcanekitten, an account that already had levels before the group started. Once someone in the group is a higher level than arcanekitten in every skill, arcanekitten joins the group and lil oldkitty leaves.",
      "The new tab shows arcanekitten's level in every skill next to the highest level in the group and who has it. A skill is crossed off as soon as the group is higher; the skills still to do are listed closest first, with how many levels to go."
    ]
  },
  {
    date: "2026-10-10", title: "Fixed: battlestaves need the easy Varrock Diary", link: "#/unlocked",
    items: [
      "The site said anyone can buy a battlestaff from Zaff in Varrock. That was wrong: you need the easy Varrock Diary (or most of the quest What Lies Below). The tip is corrected, and Battlestaff now only shows under \"Unlocks you can get now\" for players who have one of the two."
    ]
  },
  {
    date: "2026-10-10", title: "Player page: see which methods an unlock opens", link: "#/player",
    items: [
      "Under \"Unlocks you can get now\", click \"opens 4 methods\" to see which methods they are. Each one links to its skill page and shows whether you have the levels for it, and whether it still needs another locked item."
    ]
  },
  {
    date: "2026-10-10", title: "Four new guides: Mining, Fishing, Woodcutting and Prayer", link: "#/training",
    items: [
      "Mining: power mining iron to 70 and the Volcanic Mine after that (Fastest), or the Motherlode Mine and amethyst (Relaxed, earns money). Also gem rocks, crashed stars, calcified rocks and 3-tick granite.",
      "Fishing: the Sea Slug quest takes you to 24, then fly fishing and the Tempoross from 35 (Fastest), fly and barbarian fishing (Relaxed), or monkfish, karambwans and minnows from 62 (Earn money).",
      "Woodcutting: teak trees and sulliusceps (Fastest), or willows, maples, yews, magic trees and redwoods next to a bank (Keep the logs). Yew, magic and redwood logs aren't unlocked yet: cutting the first one unlocks them for Firemaking and Fletching.",
      "Prayer: every bone, buried, on a gilded altar and at the Chaos Temple in the Wilderness. Best of both picks the bone and altar for your time value from live prices.",
      "All rates are without tick manipulation. Where the wiki gives no rate for your level (low-level trees, the Tempoross between 50 and 70, the Volcanic Mine below 99, karambwans) the number is my estimate and the card says so."
    ]
  },
  {
    date: "2026-10-10", title: "Cooking: burn rate and coins per level", link: "#/training/cooking",
    items: [
      "Every fish on a Cooking route now has a \"Show per level\" button. It opens a table with one row per level: how much burns at that level, how many fish you need to cook, XP per hour, coins per hour and what that one level costs or earns.",
      "It follows your choice of fire or range and cooking gauntlets, and uses live prices. The row for your own level is marked \"You\"."
    ]
  },
  {
    date: "2026-10-10", title: "Levels and achievement diaries from WikiSync", link: "#/group",
    items: [
      "The site now also reads your levels from the WikiSync plugin, not only your quests. WikiSync follows along while you play, so \"who can do this\" stays up to date even when nobody has pressed Update stats. On the Group page those levels are marked with a *.",
      "New on the Group page: Achievement diaries, with the tasks done per area and tier for everyone who uses the plugin.",
      "Method cards that get better with a diary now say which one and who has it, for example the Kandarin hard diary for the Seers' Village rooftop course and the Ardougne medium diary for pickpocketing knights.",
      "XP and XP gains still come from Wise Old Man: WikiSync only knows levels. The site checks WikiSync every 3 hours, so the first diary data shows up after the next check."
    ]
  },
  {
    date: "2026-10-09", title: "Simple view: larger text and plain words",
    items: [
      "New button at the top of the site: Simple view. It makes everything about 20% larger, writes out the abbreviations (\"Coins per XP\" instead of \"GP / XP\", \"XP per hour\" instead of \"XP / hr\") and adds one plain sentence at the top of every page about what it's for.",
      "It also leaves out what only traders need: GE tax, trade volume and buy limits on the method cards and the Money makers list, and the daily price ranges on the routes. Route introductions are shortened to their first two sentences.",
      "Every page is still there, and the numbers are the same. Click the button again to go back; the site remembers your choice in this browser."
    ]
  },
  {
    date: "2026-10-09", title: "Hunter guide to 99", link: "#/training/hunter",
    items: [
      "34 Hunter methods: bird house runs with every kind of log, tracking weasels and razor-backed kebbits, butterflies, falconry, salamanders, red crabs, jerboas, drift net fishing, maniacal monkeys, moonlight moths, Hunters' Rumours, and red and black chinchompas.",
      "Four routes. Fastest: the Natural History Quiz (level 9 in ten minutes), then tracking, falconry, razor-backed kebbits from 49 to 72 and Hunters' Rumours. Bird houses: a minute or two per run, counted per day like Farming. Earn money: aerial fishing, then red chinchompas from 63 and black ones from 73. Plus Best of both.",
      "Fixed: bird house runs no longer count the clockworks as used up (you get them back), and they now use the wiki's current XP per run.",
      "Catches per hour are worked back from the wiki's XP per hour, and the red chinchompa rate is my own estimate, so check those in game. Red and black chinchompas are also on the Money makers page."
    ]
  },
  {
    date: "2026-10-08", title: "Farming guide to 99", link: "#/training/farming",
    items: [
      "Farming is done in runs, so it's the first skill on the site that counts per day instead of per hour: one tree run a day, a couple of herb runs. Cards and routes show XP, cost and profit per day and the time in days.",
      "Three routes. Tree runs: the best tree and fruit tree for your level in 9 patches, about 15K XP a day at 33 and 170K from 85. Fruit trees only: about half the XP for a fraction of the cost. Herb runs: slow XP but good money, also on the Money makers page.",
      "Also in the table: hardwood trees on Fossil Island, the Tithe Farm (the only Farming without waiting) and bagged plants for the first levels.",
      "Bronzeman: nearly every sapling is still locked. The tips say how to make the first one (seed in a plant pot). The herbs per patch (6.5) and the Tithe Farm rates are estimates."
    ]
  },
  {
    date: "2026-10-07", title: "Daily prices are now behind a switch", link: "#/training/cooking",
    items: [
      "The daily low and high prices made the training routes hard to read, so they're hidden by default. Tick \"Daily prices\" above a route (next to the route tabs) to show them; the site remembers your choice."
    ]
  },
  {
    date: "2026-10-07", title: "Routes show daily low and high prices", link: "#/training/cooking",
    items: [
      "Every step of a training route now shows the usual price range over a day for what you buy and sell, and the hour it's usually best, e.g. \"Raw herring: buy at 271–305 gp over a day, cheapest around 02:00\". A green label shows when an item is cheap right now.",
      "On bigger steps it also shows what the timing is worth, e.g. buying grapes at the daily low instead of the high saves about 74K on the way from 35 to 99.",
      "It works on every skill's routes, not only Cooking. The ranges come from about 3 weeks of hourly prices (the same data as the Merching tab), so treat them as a guide. Hours are in your own time zone."
    ]
  },
  {
    date: "2026-10-07", title: "Agility guide to 99", link: "#/training/agility",
    items: [
      "26 Agility methods: all nine rooftop courses, the Brimhaven Agility Arena, the Agility Pyramid, the Wilderness, Shayzien, Ape Atoll, Werewolf, Colossal Wyrm and Prifddinas courses, and the Hallowed Sepulchre.",
      "Four routes. Rooftops: the simple one, with marks of grace all the way (stay at Canifis from 40 for the graceful outfit, 260 marks). Fastest: The Tourist Trap, Brimhaven floor spikes, the Wilderness course, then the Hallowed Sepulchre from 62. Earn money: the Agility Pyramid from 30 (10,000 coins per top) and the Wilderness course from 52. Plus Best of both.",
      "Marks of grace are counted as amylase crystals (10 per mark), so the money on the rooftops only becomes real once you have graceful. The Agility Pyramid and the Wilderness course are also on the Money makers page. The Wilderness loot and the laps per hour are estimates from the wiki."
    ]
  },
  {
    date: "2026-10-05", title: "60 new unlocks (681 in total)", link: "#/unlocked",
    items: [
      "Grapes (lil oldkitty): jugs of wine, the fastest Cooking from 35, are now open on the Cooking route.",
      "Earth talisman (Lil Fool), fire talisman (Key Kode) and fire tiara (Mini Gabby): together that's everything for lava runes, the fastest Runecraft route from 23.",
      "Also maple and teak logs (Firemaking, Fletching), adamantite ore, bass, grimy lantadyme, green d'hide body, red dragonhide and all the coloured wizard robes. Most unlocks this time by Lil Fool (33) and Mini Gabby (18)."
    ]
  },
  {
    date: "2026-10-05", title: "Construction and Runecraft guides to 99", link: "#/training/construction",
    items: [
      "Construction: furniture from crude chairs to gnome benches. Fastest: oak larders, then mahogany tables and gnome benches with a demon butler (up to about 1M XP per hour). Cheapest: oak planks only (oak larders, then oak dungeon doors). Plus Best of both. Mahogany planks aren't unlocked yet; the tip says how to get the first one.",
      "Runecraft: four routes. Fastest: lava runes from 23. Earn money: the Ourania altar all the way (random runes, about 350K to 400K gp per hour). Guardians of the Rift: the free group minigame from 27. Plus Best of both.",
      "Guardians of the Rift rewards aren't counted, and the Ourania runes are an estimate from the wiki, so check those numbers in game."
    ]
  },
  {
    date: "2026-10-04", title: "Cooking shows when you stop burning", link: "#/training/cooking",
    items: [
      "Every fish on the Cooking page now shows the level where you stop burning it, for the fire or range and cooking gauntlets you picked, e.g. \"On a range: stops burning at 74 (with gauntlets: 64)\" for lobsters. Gauntlet levels fixed on 4 Oct: sharks stop burning at 94 with gauntlets (the lower levels on the wiki are for the Hosidius range). You'll see it on each route step, in the methods table and on the method cards."
    ]
  },
  {
    date: "2026-10-04", title: "Routes count from your own XP", link: "#/training/cooking",
    items: [
      "On the route step you're on (marked \"You\"), the amount to buy, the cost and the time now count only what's left from your current XP, e.g. \"Still to buy (from your 7,528 XP): 8 Raw trout\" instead of the whole 15 to 25 range."
    ]
  },
  {
    date: "2026-10-04", title: "Routes show what to buy", link: "#/training/cooking",
    items: [
      "Every step of a training route now shows how much you need to buy for that level range, e.g. \"Buy: 116 Raw salmon (about 54 will burn)\" for salmon from 25 to 30.",
      "For Cooking the burnt fish are included, based on whether you cook on a fire or a range and whether you wear cooking gauntlets. It works on every skill's routes: bars for Smithing, logs for Firemaking, herbs for Herblore and so on."
    ]
  },
  {
    date: "2026-10-04", title: "Cooking counts burnt fish", link: "#/training/cooking",
    items: [
      "Cooking now counts the fish you burn: burnt fish give no XP and can't be sold, so XP per hour and cost per XP are lower and higher at the start of every fish, and get better as you level.",
      "Pick at the top of the Cooking page whether you cook on a fire or a range, and whether you wear cooking gauntlets (lobsters, swordfish, monkfish, sharks and anglerfish). The routes, the table and the method cards all follow your choice; Best of both now waits longer before switching to a new fish.",
      "Fixed: opening a skill page straight from a link sometimes forgot which player you had picked."
    ]
  },
  {
    date: "2026-10-04", title: "Magic guide to 99", link: "#/training/magic",
    items: [
      "19 new Magic methods: teleports (Varrock to Watchtower), enchanting emerald, ruby, diamond and dragonstone jewellery, High Level Alchemy and charging water, earth, fire and air orbs.",
      "Three routes. Fastest: teleports up to 49, then enchanting rubies, diamonds and dragonstones (about 125K XP per hour from 68). Cheapest: teleports, then High Level Alchemy from 55. Best of both picks per level range from your time value.",
      "Runes saved by a staff aren't counted, so wield the staff named on each method. For High Alchemy only the nature rune is counted: pick your items on the Alchemy tab."
    ]
  },
  {
    date: "2026-10-04", title: "Crafting: gems, glass, dragonhide and battlestaves", link: "#/training/crafting",
    items: [
      "24 new Crafting methods: cutting gems (sapphire to dragonstone), smelting molten glass and glassblowing (beer glasses to light orbs), leather, spinning bow strings, battlestaves and green to black d'hide bodies.",
      "Crafting now has three routes. Fastest: gem cutting from 20 (140K to 380K XP per hour, all uncut gems are unlocked), then d'hide bodies from 63. Jewellery: the old route, the cheapest. Best of both picks per level range from your time value.",
      "Dragon leather, battlestaves and orbs aren't unlocked yet. Each has a tip: battlestaves are sold by Zaff in Varrock, orbs you charge at an obelisk, and dragon leather needs one dragon kill and a tanner."
    ]
  },
  {
    date: "2026-10-03", title: "Firemaking guide to 99", link: "#/training/firemaking",
    items: [
      "Three routes. Fastest: line burning the best log for your level at the Grand Exchange (up to 450K XP per hour with magic logs). Cheapest: cheap logs up to 50, then Wintertodt to 99, about 50 hours that earn money. Best of both picks per level range from your time value.",
      "Logs we haven't unlocked yet (teak, arctic pine, maple, mahogany, yew, magic, redwood) come with a tip on how to get the first one. Wintertodt crates can give teak and mahogany logs too.",
      "Prefer AFK? Each log method has a \"Forester's campfire\" button: the same XP per log at about 665 logs an hour."
    ]
  },
  {
    date: "2026-10-03", title: "15 new unlocks (621 in total)", link: "#/unlocked",
    items: [
      "Mithril bars and mithril dart tips (Mini Gabby): mithril dart tips can now be bought, so smithing mithril dart tips and the mithril darts step of the Fletching route are open to everyone.",
      "Also new: all games necklaces and ring of wealth charges, woad leaf with blue, red, yellow and green dye, raw chicken and bowl of water. Most unlocks this time by Lil Fool (13)."
    ]
  },
  {
    date: "2026-10-03", title: "Thieving guide to 99", link: "#/training/thieving",
    items: [
      "Three routes. Fastest: stalls, then blackjacking bandits and Menaphite thugs in Pollnivneach (up to 265K XP per hour, needs part of The Feud). Relaxed: stalls, master farmers, then Ardougne knights from 55. Best of both picks per level range from your time value.",
      "Thieving costs nothing and pays coins straight into your inventory, so every method shows the coins you get per hour. Stealing artefacts in Port Piscarilius (49) is on the site too.",
      "Tip: Thieving quests (Biohazard, Hazeel Cult, Fight Arena, The Giant Dwarf and more) give about 48,700 XP, enough for level 1 to about 38."
    ]
  },
  {
    date: "2026-10-03", title: "Skill training follows the You menu", link: "#/training",
    items: ["The \"Levels of\" menu on the Skill training page is gone: the skills now show the levels of whoever is picked in the \"You\" menu at the top (or the group's best when nobody is picked)."]
  },
  {
    date: "2026-10-03", title: "Fletching and Cooking guides to 99", link: "#/training/fletching",
    items: [
      "Fletching: three routes. Fastest uses darts from level 10 (needs The Tourist Trap), Cheapest cuts unstrung bows from logs, and Best of both picks per level range from arrows, darts, bows and stringing, using the time value you set.",
      "Cooking: three routes too. Fastest is fish up to 35, then jugs of wine (around 450K XP per hour). Cheapest cooks fish and sells them, ending with swordfish and sharks. Best of both works it out live. Burnt food isn't counted, so expect a bit more cost at the start of every fish.",
      "Locked items come with a tip on how to get the first one: grapes (Cooks' Guild spawn), maple, yew and magic logs, mithril, adamant and rune dart tips, raw monkfish, karambwan and anglerfish."
    ]
  },
  {
    date: "2026-10-03", title: "Skill training looks like the skills tab", link: "#/training",
    items: [
      "The Skill training page now shows the skills like in game: three columns in the same order, each with its icon, level and a bar showing progress to the next level, and the total level at the bottom.",
      "Levels show as 45/60: your level / the highest level in the group (in yellow when you're the highest). Pick your name at the top, or switch to anyone else or to the group's best per skill. Skills with a training route have a small \"Route\" label. Click a skill for its methods and route."
    ]
  },
  {
    date: "2026-10-03", title: "Smithing: a smarter \"Best of both\" route", link: "#/training/smithing",
    items: [
      "The Best of both route was slower and more expensive than Fastest. It's now worked out live from GE prices: for every level range it picks the method with the lowest total cost, counting the gold you spend and the time it takes.",
      "You set what an hour of your time is worth (e.g. what your best money maker earns). Higher = faster route, lower = cheaper route.",
      "With your name picked, steps that need a quest you haven't done (like Family Crest for gold bars) are shown in orange with the quest you need, plus an \"Until then\" method you can do right now. This works on every route and on your Player page."
    ]
  },
  {
    date: "2026-10-03", title: "Merching: every day in one chart", link: "#/merch",
    items: [
      "Click an item on the Merching tab for a new third chart: the buy and sell prices through the day, with one line for every day of the last weeks. The most recent day is solid, older days fade out, so you can see if the cheap and expensive hours really come back every day.",
      "Sell offers are now red in all charts (they were orange); buy offers stay blue."
    ]
  },
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
