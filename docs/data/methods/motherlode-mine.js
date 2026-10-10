export default {
  id: "motherlode-mine",
  name: "Motherlode Mine",
  tags: ["money", "training"],
  guide: "https://oldschool.runescape.wiki/w/Motherlode_Mine",
  reqs: { skills: { Mining: 30 } },
  action: "pay-dirt",
  actionLabel: "Pay-dirt per hour",
  actionsPerHour: 380,
  // Wiki XP rates: about 13K/hr at Mining 30, 26K at 40, 33K at 50 (60 XP per pay-dirt).
  presets: [["Mining 30", 217], ["Mining 35–38", 380], ["Mining 40", 433], ["Mining 50", 550], ["Mining 90, all upgrades", 1030]],
  inputs: [],
  // Below Mining 40, cleaned pay-dirt is about 97% coal; the other ~3% are golden nuggets (not tradeable).
  outputs: [{ id: 453, qty: 0.969 }],   // Coal
  xp: { Mining: 60 },
  note: "Low effort: ore veins last a long time, and you only click now and then. The income here is coal only. From Mining 40 some pay-dirt becomes gold ore, and later mithril, adamantite and runite, so it earns more as you level. About 1 in 32 pay-dirt is a golden nugget, which buys the prospector outfit for bonus Mining XP. Ores you mine yourself unlock buying them on the GE."
};
