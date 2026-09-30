# Bronzeman Money Makers

A small website for our Old School RuneScape bronzeman group. It shows money makers and skill-training methods with live Grand Exchange prices, and checks which of us meets the requirements.

- **Money makers:** methods ranked by profit per hour, with an item-by-item breakdown, GE tax, buy-limit warnings and who in the group can do them.
- **Skill training:** pick a skill, enter your level (or pick a player) and a target level, and compare every method that trains it: gp per XP, XP per hour, and time and cost to reach the target.
- **Group:** an Update stats button that refreshes everyone's levels on Wise Old Man, XP gained today, this week or this month, and everyone's levels side by side.
- **Alchemy:** live High Level Alchemy margins for every unlocked item, a best plan per 4-hour buy-limit window, and items that take one shop purchase to unlock (`data/alch-unlocks.js`, with how to unlock them).
- **Unlocked:** every item the group has unlocked (bronzeman), with who unlocked it, when and the GE price. The Money makers page also flags methods whose inputs nobody has unlocked yet.
- **Requests:** a form to ask for a new guide. It opens a pre-filled GitHub issue; the list of requests on the page comes from `data/requests.json`, which a GitHub Action keeps in sync with the issues.

Prices come from the [OSRS Wiki real-time prices API](https://oldschool.runescape.wiki/w/RuneScape:Real-time_Prices) and refresh every minute. Levels come from [Wise Old Man](https://wiseoldman.net).

No build step and no installs: it's plain HTML, CSS and JavaScript modules, hosted on GitHub Pages from this `docs/` folder.

## Folder layout

```
index.html               Page shell: header, tabs, footer
assets/style.css         All styling (colors, light and dark theme)
data/
  players.js             Group members' RuneScape names
  site.js                Site settings (the GitHub repository name)
  alch-unlocks.js        Easy-to-unlock alch items and how to unlock them
  unlock-tips.js         How to unlock specific items (shown when a method needs a locked item)
  skill-guides.js        Training routes per skill (recommended method per level range)
  requests.json          Guide requests, written by the GitHub Action (don't edit by hand)
  unlocks.json           Unlocked items, built from the plugin exports (don't edit by hand)
  methods/
    index.js             List of all methods (one import line each)
    _template.js         Copy this to add a method; explains every field
    sapphire-rings.js    One file per method
    ...
src/
  main.js                Starts everything and switches pages (#/money, #/training/magic, #/group)
  core/
    prices.js            Fetches live prices, price modes, your own prices
    calc.js              Profit, XP, GE tax and buy-limit maths for a method
    players.js           Group stats from Wise Old Man: levels, updates, XP gains, requirement checks
    unlocks.js           Unlocked items, and which method inputs are still locked
    unlockTips.js        Finds the unlock tip for an item (automatic tip for unfinished potions)
    osrs.js              Skill list and XP table
    format.js            Number formatting helpers
    store.js             Remembers settings in your browser
  components/
    methodCard.js        The detailed card for one method
  views/
    money.js             Money makers page
    training.js          Skill training pages
    group.js             Group page
    requests.js          Guide requests page
    unlocks.js           Unlocked items page
    alchemy.js           High alchemy page
```

## Adding a method

1. Copy `data/methods/_template.js` to `data/methods/<method-id>.js` and fill it in. The template explains each field.
2. Add one line to `data/methods/index.js`: an `import` at the top and the name in the list.

The method then appears on the money makers page (if tagged `"money"`) and on the training page of every skill it gives XP in. Group requirement checks work automatically from `reqs.skills`.

Tips:
- **Items by name:** inputs and outputs can use `{ name: "Guam potion (unf)", qty: 1 }` instead of an id. The name must match the in-game item name exactly; the site looks up the id in the live price list. `data/methods/herblore-potions.js` does this, and also shows how one file can hold several methods.
- **Unlock tips:** when a method needs an item nobody has unlocked, the card shows the tip for it from `data/unlock-tips.js`. Add a line there for any item that's easy to unlock.
- **Training routes:** add a skill to `data/skill-guides.js` with the recommended method per level range. The skill's training page then shows a route with live XP/hr, GP/XP and cost per range, flags locked ingredients, and suggests the fastest unlocked method until they're unlocked.
- **Item IDs:** find them in the wiki item infobox ("Item ID"), or in the URL of the item on prices.runescape.wiki.
- **Training-only methods:** for methods like "Burning maple logs" that you do for XP, not money, use `tags: ["training"]`. They show only on the skill training page, and their cost per XP shows as a negative gp/XP.
- **Different levels:** when a method changes a lot with level (more XP per action, a better fish), add a separate method per level band, e.g. `aerial-fishing-43` and `aerial-fishing-56`, each with its own `reqs.skills` level.
- **Rare drops:** use fractional quantities (`qty: 1/130`) and `ledger: "hour"` to show the item table per hour.

## Updating unlocked items

1. Export the group bronzeman plugin's database to a JSON file.
2. Put it in `workspace/unlock-exports/` (local only, never uploaded), for example as `2026-10-04.json`. Keep the old ones; all exports are merged.
3. From the repository folder, run `python3 workspace/tools/build-unlocks.py`, or ask Claude to run it.
4. Commit `docs/data/unlocks.json` and push. The Unlocked page shows when the list was last updated.

The raw exports contain account hashes, ground item locations and the plugin's database name, which is why only the cleaned `unlocks.json` is published.

## Guide requests

1. The Requests page opens `github.com/<repo>/issues/new` with the form in `.github/ISSUE_TEMPLATE/guide-request.yml`, filled in from the page. Posting needs a free GitHub account.
2. `.github/workflows/sync-requests.yml` runs whenever an issue changes and writes all `guide-request` issues to `docs/data/requests.json` (script: `.github/scripts/build-requests.js`).
3. Close an issue as **completed** when the guide is added (shows as "Added"), or as **not planned** to decline it.

## Adding a group member

Add their RuneScape name to `data/players.js`. Press **Update stats** on the Group page once and Wise Old Man starts tracking them.

## Adding a page

1. Create `src/views/<name>.js` that exports `title` and `mount(root, params)`. `mount` fills `root` and may return a cleanup function.
2. Import it in `src/main.js` and add it to `ROUTES`.
3. Add `<a href="#/<name>">` to the tabs in `index.html`.

## Updating the site

This folder is `docs/` inside the project repository. Edit files, then commit and push with GitHub Desktop. GitHub Pages (set to `main` / `/docs`) updates within a minute or two.

## Running it on your own computer

The pages use JavaScript modules, which browsers don't load from a double-clicked file. Start a small web server in this folder instead:

```
python3 -m http.server 8000
```

Then open http://localhost:8000.
