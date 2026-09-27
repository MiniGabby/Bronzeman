# Handoff: Bronzeman Money Makers

Context for whoever picks this up next (a new Claude chat, or a friend helping out). Read this first, then `docs/README.md` for how the code is organised.

Last updated: 27 Sep 2026.

## What this is

A website for Nick's Old School RuneScape bronzeman group of six. It ranks money makers by profit per hour with live Grand Exchange prices, compares training methods per skill, and shows who in the group meets each method's requirements.

- **Live site:** GitHub Pages, repository `bronzeman` on Nick's GitHub account. The repository is this whole folder; Pages serves `docs/` from the `main` branch, and `.gitignore` keeps `workspace/` off GitHub. Nick publishes with GitHub Desktop.
- **Older version:** a Claude artifact ("Bronzeman Money Makers", https://claude.ai/artifact/PxK2z71xeFSasNdpnnUiaf). Its prices are a stored snapshot, not live. Kept for reference; the GitHub site replaces it.
- **Language:** the site is English only (Nick's explicit wish). Conversations with Nick are in Dutch.

## Folder layout

```
bronzeman/        The git repository
├── .gitignore     Excludes workspace/
├── README.md      Repository front page
├── docs/          The website (GitHub Pages serves this folder)
└── workspace/     Local only, ignored by git
    ├── HANDOFF.md           This file
    ├── research/            Notes on methods to add and group stats
    ├── tools/               Smoke test with fake API data (fixtures/)
    └── archive/             Earlier single-file versions of the site
```

## The group

RuneScape names (also in `docs/data/players.js`): Mini Gabby, Key Kode, lil oldkitty, dreammancer, Lil Fool, Medi Uso.

They play **bronzeman mode**: you can only buy an item on the GE after obtaining it yourself. Gathering methods that unlock items are extra valuable for that reason.

They want methods that **train skills while earning**. They'd rather avoid pure processing, and combat is too hard for their stats for now. See `research/method-candidates.md` for stats and candidates.

## How the site gets its data

- **Prices:** OSRS Wiki real-time prices API (`https://prices.runescape.wiki/api/v1/osrs`), refreshed every 60 s.
  - `/mapping`: names and GE buy limits, fetched once.
  - `/1h`: last hour's average high and low price, plus volume.
  - `/latest`: the latest trade, used as a fallback when an item didn't trade in the last hour.
- **Levels:** Wise Old Man API (`https://api.wiseoldman.net/v2/players/<name>`). Players must press **Update** on wiseoldman.net for their levels to refresh.
- **Stored in the viewer's browser:** price mode, the viewer's own prices, actions per hour, and training goals.

## Decisions and why

- **No build step:** plain ES modules, so there is nothing to install or compile; GitHub Desktop is the only tool needed to publish.
- **One file per method** in `docs/data/methods/`, plus one import line in `index.js`. Methods appear automatically on the money page (tag `money`) and on the training page of every skill they give XP in.
- **Method variants per level band:** when a method changes with level, add separate entries rather than building level logic into the calculator.
- **GE tax:** 2% per item, rounded down, capped at 5M, and 0 below 50 gp.
- **Buy-limit maths:** for each method, the input that runs out first sets how many minutes of work one account gets per 4 hours.

## Known uncertainties

- **Master farmers:** profit is an upper bound. It ignores food, necklaces, and lower herb-seed rates below Farming 85. The wiki's own estimate at Thieving 38 is about 124K/hr against the site's ~245K. The wiki doesn't explain its low-level numbers.
- **Aerial fishing:** 2,000 catches per hour is an estimate; the wiki only gives 2,400 for 99/99. 1.5 lures per catch is correct for about Fishing 43 / Hunter 42.
- **Superheating lead:** there is no wiki money making guide. 1,400 casts per hour is an estimate. Lead trades thinly (about 700 bars per hour).
- **Not verified from a real browser yet:** that both APIs allow cross-site requests (CORS). The price API was working in Nick's browser in the single-file version (untested by Claude). If the Group page shows "No stats", Wise Old Man probably blocks it.

## Tooling limits Claude ran into

- **Artifacts:** Claude artifacts block all outside requests, so the artifact version can't fetch live prices.
- **Claude's cloud workspace and Nick's linked Mac:** both are blocked by the network allowlist from `prices.runescape.wiki`. Only WebFetch works, and it asks Nick for approval each time. So scheduled tasks can't refresh prices unattended.
- **WebFetch results:** they can be cached for 15 minutes or come back truncated. Price checks per item (`/latest?id=`, `/timeseries?id=&timestep=5m`) work better than the full `/1h` dump.
- **Official hiscores:** blocked for WebFetch (robots.txt). Use Wise Old Man instead.

## Ideas not built yet

- Training-only methods for more skills, e.g. cheapest Magic, Crafting and Smithing routes per level band.
- "Unlocked items" tracker for bronzeman: which items each player has obtained, and so can buy.
- Check quest requirements, not just skill levels.
- A per-player view: "what can I do right now", sorted by profit.

## Testing

`workspace/tools/smoke-test.mjs` serves `docs/` locally, fakes both APIs with `tools/fixtures/`, opens every page and reports JavaScript errors. Setup and usage are at the top of the script.
