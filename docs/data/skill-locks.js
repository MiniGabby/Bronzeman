// Skills a player may not use yet. arcanekitten already had levels before joining the group, so
// some of them only count once someone else in the group has caught up.
// While a lock is on, the site treats that skill as level 1 for this player (requirements, routes,
// "who can do it"); the Group page still shows the real level, with a lock.
// The lock comes off by itself once another group member has `until` in that skill.
export default [
  { player: "arcanekitten", skill: "Slayer", until: 58 }
];
