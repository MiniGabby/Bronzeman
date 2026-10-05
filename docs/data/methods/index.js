// Every method on the site. To add one: create a file from _template.js and add a line here.
import sapphireRings from "./sapphire-rings.js";
import cleanHarralander from "./clean-harralander.js";
import cleanIrit from "./clean-irit.js";
import cleanRanarr from "./clean-ranarr.js";
import superheatLead from "./superheat-lead.js";
import aerialFishing from "./aerial-fishing.js";
import masterFarmers from "./master-farmers.js";
import motherlodeMine from "./motherlode-mine.js";
import birdHousesRegular from "./bird-houses-regular.js";
import smithBronzeDartTips from "./smith-bronze-dart-tips.js";
import smithIronDartTips from "./smith-iron-dart-tips.js";
import smithSteelDartTips from "./smith-steel-dart-tips.js";
import smithMithrilDartTips from "./smith-mithril-dart-tips.js";
import herblorePotions from "./herblore-potions.js";
import craftingJewellery from "./crafting-jewellery.js";
import smithing from "./smithing.js";
import fletching from "./fletching.js";
import cooking from "./cooking.js";
import thieving from "./thieving.js";
import firemaking from "./firemaking.js";
import craftingOther from "./crafting-other.js";
import magic from "./magic.js";
import construction from "./construction.js";
import runecraft from "./runecraft.js";

export default [
  sapphireRings,
  cleanHarralander,
  cleanIrit,
  cleanRanarr,
  superheatLead,
  aerialFishing,
  masterFarmers,
  motherlodeMine,
  birdHousesRegular,
  smithBronzeDartTips,
  smithIronDartTips,
  smithSteelDartTips,
  smithMithrilDartTips,
  ...herblorePotions,   // one file with all Herblore potions
  ...craftingJewellery, // one file with all jewellery crafting
  ...smithing,          // anvil and Blast Furnace methods for the Smithing routes
  ...fletching,         // arrows, darts and bows for the Fletching routes
  ...cooking,           // fish and wine for the Cooking routes
  ...thieving,          // pickpocketing, stalls and artefacts for the Thieving routes
  ...firemaking,        // log burning and Wintertodt for the Firemaking routes
  ...craftingOther,     // gems, glass, leather, spinning, dragonhide and battlestaves
  ...magic,             // teleports, enchanting, High Alchemy and charging orbs
  ...construction,      // furniture in your house for the Construction routes
  ...runecraft          // runes, Ourania and Guardians of the Rift for the Runecraft routes
];
