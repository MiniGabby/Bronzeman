// TEMPLATE: copy this file to add a method. It is not loaded by the site.
// 1. Copy it to data/methods/<your-method-id>.js and fill it in.
// 2. Add one import line for it in data/methods/index.js.
// That's all: the method then shows up on every page where it belongs.
export default {
  // Unique id, lowercase with dashes. Also the file name.
  id: "your-method-id",

  // Name shown on the site.
  name: "Doing a thing",

  // Where the method appears:
  //   "money"    → Money makers page
  //   "training" → only on the Skill training page
  // Every method that gives XP in a skill always shows on that skill's training page.
  tags: ["money"],

  // Link to the wiki guide or item page.
  guide: "https://oldschool.runescape.wiki/w/Money_making_guide",

  // Requirements. Skill names as in-game ("Magic", "Runecraft", ...).
  // Skill levels are checked against each group member's stats; quests and items are only shown.
  reqs: {
    skills: { Magic: 1 },
    quests: [],
    items: []
  },

  // One "action" = one cast, catch, pickpocket, herb... Quantities and XP below are per action.
  action: "cast",
  actionLabel: "Casts per hour",
  actionsPerHour: 1000,

  // Quick-pick buttons for actions per hour: [label, value].
  presets: [["Focused", 1200], ["AFK", 800]],

  // Items you use up (bought on the GE) and items you get (sold on the GE), per action.
  // id = item ID from the wiki (Item ID in the infobox, or the number in prices.runescape.wiki/osrs/item/<id>).
  // qty can be a fraction, e.g. a seed that drops once every 130 pickpockets is qty: 1/130.
  inputs:  [{ id: 561, qty: 1 }],
  outputs: [{ id: 1, qty: 1 }],

  // XP per action per skill.
  xp: { Magic: 10 },

  // Optional: "hour" shows the item table per hour instead of per action (handy for rare drops).
  // ledger: "hour",

  // Optional note shown on the card.
  note: ""
};
