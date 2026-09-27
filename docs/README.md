# Bronzeman Money Makers

A small website for our Old School RuneScape bronzeman group. It shows money makers and skill-training methods with live Grand Exchange prices, and checks which of us meets the requirements.

- **Money makers:** methods ranked by profit per hour, with an item-by-item breakdown, GE tax, buy-limit warnings and who in the group can do them.
- **Skill training:** pick a skill, enter your level (or pick a player) and a target level, and compare every method that trains it: gp per XP, XP per hour, and time and cost to reach the target.
- **Group:** everyone's levels side by side.

Prices come from the [OSRS Wiki real-time prices API](https://oldschool.runescape.wiki/w/RuneScape:Real-time_Prices) and refresh every minute. Levels come from [Wise Old Man](https://wiseoldman.net).

No build step and no installs: it's plain HTML, CSS and JavaScript modules, hosted on GitHub Pages from this `docs/` folder.

## Folder layout

```
index.html               Page shell: header, tabs, footer
assets/style.css         All styling (colors, light and dark theme)
data/
  players.js             Group members' RuneScape names
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
    players.js           Group stats from Wise Old Man, requirement checks
    osrs.js              Skill list and XP table
    format.js            Number formatting helpers
    store.js             Remembers settings in your browser
  components/
    methodCard.js        The detailed card for one method
  views/
    money.js             Money makers page
    training.js          Skill training pages
    group.js             Group page
```

## Adding a method

1. Copy `data/methods/_template.js` to `data/methods/<method-id>.js` and fill it in. The template explains each field.
2. Add one line to `data/methods/index.js`: an `import` at the top and the name in the list.

The method then appears on the money makers page (if tagged `"money"`) and on the training page of every skill it gives XP in. Group requirement checks work automatically from `reqs.skills`.

Tips:
- **Item IDs:** find them in the wiki item infobox ("Item ID"), or in the URL of the item on prices.runescape.wiki.
- **Training-only methods:** for methods like "Burning maple logs" that you do for XP, not money, use `tags: ["training"]`. They show only on the skill training page, and their cost per XP shows as a negative gp/XP.
- **Different levels:** when a method changes a lot with level (more XP per action, a better fish), add a separate method per level band, e.g. `aerial-fishing-43` and `aerial-fishing-56`, each with its own `reqs.skills` level.
- **Rare drops:** use fractional quantities (`qty: 1/130`) and `ledger: "hour"` to show the item table per hour.

## Adding a group member

Add their RuneScape name to `data/players.js`. They need to exist on Wise Old Man: search the name on wiseoldman.net and press **Update** once.

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
