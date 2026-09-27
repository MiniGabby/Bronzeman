export default {
  id: "master-farmers",
  name: "Pickpocketing master farmers",
  tags: ["money"],
  guide: "https://oldschool.runescape.wiki/w/Money_making_guide/Pickpocketing_master_farmers",
  reqs: { skills: { Thieving: 38 } },
  action: "pickpocket",
  actionLabel: "Successful pickpockets per hour",
  actionsPerHour: 650,
  presets: [["Thieving 38-40", 650], ["Thieving 50 + rogue", 805], ["Thieving 60", 977], ["Thieving 70", 1191]],
  ledger: "hour",
  inputs: [],
  // Seed drops per successful pickpocket (wiki, at Farming 85).
  outputs: [
    { id: 5295,  qty: 0.00755 },    // Ranarr seed
    { id: 22879, qty: 0.007693 },   // Snape grass seed
    { id: 5300,  qty: 0.00108 },    // Snapdragon seed
    { id: 5304,  qty: 0.000217 },   // Torstol seed
    { id: 5296,  qty: 0.004513 },   // Toadflax seed
    { id: 5301,  qty: 0.000673 },   // Cadantine seed
    { id: 5299,  qty: 0.00144 },    // Kwuarm seed
    { id: 5298,  qty: 0.002113 },   // Avantoe seed
    { id: 5303,  qty: 0.000287 },   // Dwarf weed seed
    { id: 5302,  qty: 0.00048 },    // Lantadyme seed
    { id: 5311,  qty: 0.02817 },    // Wildblood seed
    { id: 5321,  qty: 0.010583 }    // Watermelon seed
  ],
  xp: { Thieving: 43 },
  note: "Treat this as an upper bound. The wiki's own estimate at Thieving 38 is about 124K gp/hr. This page does not count food, dodgy necklaces or the lower herb seed rates below Farming 85, and leaves out cheap hop and allotment seeds. Seeds you get yourself unlock buying them on the GE."
};
