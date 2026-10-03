// Which quests each player has done, for players WITHOUT the WikiSync plugin (WikiSync data loads
// automatically on the site and wins over this list). This list is kept by hand:
// tell Claude in the Bronzeman project (e.g. "Mini Gabby finished The Tourist Trap") or edit it here.
// true = done, false = not done, left out = unknown. Names must match the quest names in method files.
// Some quests are worked out automatically from levels (see INFERRED below), so they don't need a line here.
export default {
  "Mini Gabby": {},
  "Key Kode": {},
  "lil oldkitty": {},
  "dreammancer": {},
  "Lil Fool": {},
  "Medi Uso": {}
};

// Quests shown on the Group page even when no method needs them yet (they unlock routes or items).
export const TRACKED = [
  "Druidic Ritual", "The Knight's Sword", "The Tourist Trap", "The Giant Dwarf (started)",
  "Family Crest", "Bone Voyage", "Nature Spirit", "Sleeping Giants"
];

// Quests you must have done to have a level: Druidic Ritual unlocks Herblore (its reward takes you to level 3).
export const INFERRED = {
  "Druidic Ritual": { skill: "Herblore", level: 3 }
};
