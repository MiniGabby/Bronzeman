// Skill training page. Without a skill: a grid of all skills. With a skill (#/training/magic):
// every method that gives XP in that skill, compared on gp per XP, XP per hour and cost to a target level.
import METHODS from "../../data/methods/index.js";
import * as prices from "../core/prices.js";
import * as calc from "../core/calc.js";
import * as group from "../core/players.js";
import * as unlocks from "../core/unlocks.js";
import { SKILLS, skillByKey, xpForLevel, levelForXp } from "../core/osrs.js";
import { store } from "../core/store.js";
import { esc, gp, short, signed, cls, duration, nf } from "../core/format.js";
import { createMethodCard } from "../components/methodCard.js";

export const title = "Skill training";

const methodsFor = skillName => METHODS.filter(m => (m.xp?.[skillName] || 0) > 0);

export function mount(root, [skillKey]) {
  const skill = skillByKey(skillKey);
  return skill ? mountSkill(root, skill) : mountGrid(root);
}

function mountGrid(root) {
  function render() {
    root.innerHTML = `
      <p class="lead">Pick a skill to compare every method that trains it: what it costs or earns per XP, how fast it is, and what it takes to reach your next goal.</p>
      <div class="skillgrid">${SKILLS.map(s => {
        const n = methodsFor(s.name).length;
        const best = group.loaded() ? Math.max(...group.all().map(p => group.level(p, s.name))) : null;
        return `<a class="skill${n ? "" : " empty"}" href="#/training/${s.key}">
          <span class="sname">${esc(s.name)}</span>
          <span class="scount">${n ? `${n} method${n > 1 ? "s" : ""}` : "No methods yet"}${best ? ` · group best ${best}` : ""}</span>
        </a>`;
      }).join("")}</div>`;
  }
  const off = group.onChange(render);
  render();
  return off;
}

function mountSkill(root, skill) {
  const methods = methodsFor(skill.name);
  const key = "train:" + skill.key;
  const goal = Object.assign({ player: "", current: 1, target: 50, sort: "cheap" }, store.get(key, {}));
  const save = () => store.set(key, goal);

  root.innerHTML = `
    <nav class="crumb"><a href="#/training">All skills</a> / ${esc(skill.name)}</nav>
    <h2 class="pagetitle">${esc(skill.name)} training</h2>
    <form class="toolbar" data-f="form">
      <div class="field"><label for="t-player">Player</label>
        <select id="t-player"><option value="">Custom level</option></select></div>
      <div class="field"><label for="t-current">Current level</label>
        <input id="t-current" type="number" min="1" max="98" inputmode="numeric"></div>
      <div class="field"><label for="t-target">Target level</label>
        <input id="t-target" type="number" min="2" max="99" inputmode="numeric"></div>
      <div class="field"><label for="t-sort">Sort by</label>
        <select id="t-sort">
          <option value="cheap">Cheapest per XP</option>
          <option value="fast">Fastest XP</option>
          <option value="profit">Most profit per hour</option>
        </select></div>
      <div class="goal" data-f="goal"></div>
    </form>
    <section class="board"><table>
      <thead><tr><th>Method</th><th class="r">Level</th><th class="r">${esc(skill.name)} XP / hr</th><th class="r">GP / XP</th><th class="r">Profit / hr</th><th class="r">Time to target</th><th class="r">Cost to target</th></tr></thead>
      <tbody data-f="rows"></tbody>
    </table></section>
    <p class="fine">GP / XP counts all profit or cost of a method against ${esc(skill.name)} XP, even when the method also trains other skills. Time and cost assume you stay on one method the whole way.</p>
    <section class="methods" data-f="cards"></section>`;

  const $ = s => root.querySelector(s);
  const playerSel = $("#t-player"), cur = $("#t-current"), tgt = $("#t-target"), sortSel = $("#t-sort");
  const cards = new Map();

  function fillPlayers() {
    const opts = group.all().filter(p => p.skills)
      .map(p => `<option value="${esc(p.name)}">${esc(p.name)} (${group.level(p, skill.name)})</option>`).join("");
    playerSel.innerHTML = `<option value="">Custom level</option>${opts}`;
    playerSel.value = goal.player;
    if (playerSel.value !== goal.player) goal.player = "";
  }

  function currentXp() {
    const p = goal.player && group.all().find(x => x.name === goal.player && x.skills);
    if (p) return group.xp(p, skill.name);
    return xpForLevel(goal.current);
  }

  function render() {
    fillPlayers();
    const xpNow = currentXp();
    const player = goal.player && group.all().find(x => x.name === goal.player && x.skills);
    const lvlNow = player ? group.level(player, skill.name) : levelForXp(xpNow);
    if (document.activeElement !== cur) cur.value = lvlNow;
    cur.disabled = !!goal.player;
    if (document.activeElement !== tgt) tgt.value = goal.target;
    sortSel.value = goal.sort;
    const need = Math.max(0, xpForLevel(goal.target) - xpNow);
    $('[data-f="goal"]').innerHTML = need
      ? `<b class="num">${gp(need)}</b> XP to level ${goal.target}`
      : `Already level ${goal.target} or higher`;

    if (!methods.length) {
      $('[data-f="rows"]').innerHTML = `<tr><td colspan="7" class="muted">No ${esc(skill.name)} methods yet. Add one in data/methods (see the README).</td></tr>`;
      return;
    }
    if (!prices.ready()) {
      $('[data-f="rows"]').innerHTML = `<tr><td colspan="7" class="muted">Loading prices…</td></tr>`;
      return;
    }

    const rows = methods.map(m => {
      const c = calc.compute(m);
      const xpHr = c.xpHr[skill.name] || 0;
      const req = m.reqs?.skills?.[skill.name] || 1;
      const gpXp = c.profitHr == null || !xpHr ? null : c.profitHr / xpHr;
      const hrs = xpHr ? need / xpHr : Infinity;
      return { m, c, xpHr, req, gpXp, hrs, total: c.profitHr == null ? null : hrs * c.profitHr, open: lvlNow >= req };
    });
    const by = {
      cheap: (a, b) => (b.gpXp ?? -Infinity) - (a.gpXp ?? -Infinity),
      fast: (a, b) => b.xpHr - a.xpHr,
      profit: (a, b) => (b.c.profitHr ?? -Infinity) - (a.c.profitHr ?? -Infinity)
    }[goal.sort];
    rows.sort((a, b) => (b.open - a.open) || by(a, b));

    $('[data-f="rows"]').innerHTML = rows.map(r => `<tr class="${r.open ? "" : "locked"}">
      <td><a href="#/training/${skill.key}" data-jump="${r.m.id}">${esc(r.m.name)}</a>${r.open ? "" : ` <span class="pill warn">Needs ${r.req}</span>`}</td>
      <td class="r num">${r.req}</td>
      <td class="r num">${short(r.xpHr)}</td>
      <td class="r num ${cls(r.gpXp)}">${r.gpXp == null ? "–" : (r.gpXp > 0 ? "+" : "") + r.gpXp.toFixed(1)}</td>
      <td class="r num ${cls(r.c.profitHr)}">${signed(r.c.profitHr)}</td>
      <td class="r num">${need ? duration(r.hrs) : "–"}</td>
      <td class="r num ${cls(r.total)}">${need ? signed(r.total) : "–"}</td>
    </tr>`).join("");

    const host = $('[data-f="cards"]');
    for (const r of rows) {
      if (!cards.has(r.m.id)) cards.set(r.m.id, createMethodCard(r.m));
      const card = cards.get(r.m.id);
      host.appendChild(card.el);
      card.update(r.c);
    }
  }

  $('[data-f="form"]').addEventListener("submit", e => e.preventDefault());
  playerSel.addEventListener("change", () => { goal.player = playerSel.value; save(); render(); });
  cur.addEventListener("input", () => { goal.current = Math.min(98, Math.max(1, Number(cur.value) || 1)); save(); render(); });
  tgt.addEventListener("input", () => { goal.target = Math.min(99, Math.max(2, Number(tgt.value) || 2)); save(); render(); });
  sortSel.addEventListener("change", () => { goal.sort = sortSel.value; save(); render(); });
  $('[data-f="rows"]').addEventListener("click", e => {
    const a = e.target.closest("[data-jump]");
    if (!a) return;
    e.preventDefault();
    document.getElementById(a.dataset.jump)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  const offs = [prices.onChange(render), calc.onChange(render), group.onChange(render), unlocks.onChange(render)];
  render();
  return () => offs.forEach(off => off());
}
