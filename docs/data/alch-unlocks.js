// Alch items that aren't unlocked yet but are easy to unlock: buy one from a shop,
// and the item is unlocked for the whole group. Shown on the Alchemy page only while
// nobody has unlocked them. Add more here; "how" is shown to the player.
const NURMOF = "Buy one from Nurmof's Pickaxe Shop in the Dwarven Mine (north-west part, through the alley with the anvil). No requirements, about 32,000 gp.";
const SCAVVO = price => `Buy one from Scavvo's Rune Store in the Champions' Guild, south of Varrock. Needs 32 quest points to enter. About ${price} gp.`;

export default [
  { id: 1275, how: NURMOF },                // Rune pickaxe
  { id: 1079, how: SCAVVO("64,000") },      // Rune platelegs
  { id: 1093, how: SCAVVO("64,000") },      // Rune plateskirt
  { id: 1113, how: SCAVVO("50,000") },      // Rune chainbody
  { id: 1303, how: SCAVVO("32,000") },      // Rune longsword
  { id: 1289, how: SCAVVO("20,800") },      // Rune sword
  { id: 1432, how: SCAVVO("14,400") }       // Rune mace
];
