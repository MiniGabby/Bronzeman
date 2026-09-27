# Bronzeman Money Makers

Website for our Old School RuneScape bronzeman group: money makers and skill-training methods with live Grand Exchange prices, and who in the group can do what.

## Folders

| Folder | What's in it | On GitHub? |
|---|---|---|
| `docs/` | The website. GitHub Pages serves this folder. | Yes |
| `.github/` | Guide request form (issue template) and the Action that syncs requests to `docs/data/requests.json` | Yes |
| `workspace/` | Handoff notes, research, test tools, old versions | No: `.gitignore` keeps it local |

- `docs/README.md` explains how the website code is organised and how to add methods, players and pages.
- `workspace/HANDOFF.md` has the full context for a new Claude chat or a helper. It is on your computer only, and a copy is in the Claude project.

## Publishing

This folder is a git repository. Commit and push with GitHub Desktop, and the `.gitignore` makes sure `workspace/` never leaves your computer.

GitHub Pages settings: **Settings → Pages → Deploy from a branch → `main` / `/docs`**.

Don't drag files in through the GitHub website: that ignores `.gitignore`.
