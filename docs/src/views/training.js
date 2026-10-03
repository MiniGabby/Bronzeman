// Skill training page. Without a skill: a grid of all skills. With a skill (#/training/magic):
// every method that gives XP in that skill, compared on gp per XP, XP per hour and cost to a target level.
import METHODS from "../../data/methods/index.js";
import * as prices from "../core/prices.js";
import * as calc from "../core/calc.js";
import * as group from "../core/players.js";
import * as unlocks from "../core/unlocks.js";
import { SKILLS, skillByKey, xpForLevel, levelForXp } from "../core/osrs.js";
import { store } from "../core/store.js";
import * as me from "../core/me.js";
import { esc, gp, short, signed, cls, duration, nf } from "../core/format.js";
import { createMethodCard } from "../components/methodCard.js";
import GUIDES from "../../data/skill-guides.js";
import { tipFor } from "../core/unlockTips.js";
import { stepsOf, timeValue, setTimeValue } from "../core/autoRoute.js";

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
  if (me.get()) goal.player = me.get();
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
    <section class="section" data-f="route" hidden></section>
    <h2 class="pagetitle small">All ${esc(skill.name)} methods</h2>
    <section class="board"><table>
      <thead><tr><th>Method</th><th class="r">Level</th><th class="r">${esc(skill.name)} XP / hr</th><th class="r">GP / XP</th><th class="r">Profit / hr</th><th class="r">Time to target</th><th class="r">Cost to target</th><th>Inputs unlocked</th></tr></thead>
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
    // Match case-insensitively: Wise Old Man may capitalise names differently from data/players.js.
    goal.player = group.all().find(p => p.skills && p.name.toLowerCase() === (goal.player || "").toLowerCase())?.name || "";
    playerSel.value = goal.player;
  }

  function currentXp() {
    const p = goal.player && group.all().find(x => x.name === goal.player && x.skills);
    if (p) return group.xp(p, skill.name);
    return xpForLevel(goal.current);
  }

  const guide = GUIDES[skill.key];
  const fmtGpXp = v => v == null ? "–" : (v > 0 ? "+" : "") + v.toFixed(1);

  function lockCell(m) {
    if (!(m.inputs || []).length) return `<span class="muted">No inputs</span>`;
    const locked = unlocks.lockedInputs(m);
    if (locked == null) return "…";
    return locked.length
      ? `<span class="pill bad">Missing ${esc(locked.map(x => x.name).join(", "))}</span>`
      : `<span class="pill good">All unlocked</span>`;
  }

  // The route: recommended method per level range, with live numbers and unlock status.
  // A skill can have several routes (fastest, cheapest...), shown as tabs.
  const routes = guide ? (guide.routes || [{ key: "main", route: guide.route }]) : [];
  const routeKey = () => {
    const k = store.get("route:" + skill.key, routes[0]?.key);
    return routes.some(r => r.key === k) ? k : routes[0]?.key;
  };

  const quester = () => (goal.player && group.all().find(x => x.name === goal.player && x.skills)) || null;

  function renderRoute(rows, lvlNow) {
    const host = $('[data-f="route"]');
    if (!guide) { host.hidden = true; return; }
    host.hidden = false;
    const active = routes.find(r => r.key === routeKey());
    const byId = Object.fromEntries(rows.map(r => [r.m.id, r]));
    const steps0 = stepsOf(active, skill.name, quester());
    const usable = (r, level) => r.m.routeAlt !== false && r.req <= level && unlocks.lockedInputs(r.m)?.length === 0 && r.gpXp != null;
    const needTips = new Map();
    let totalRec = 0, totalRecH = 0, totalBest = 0, totalBestH = 0, recComplete = true;

    const steps = steps0.map(st => {
      const here = lvlNow >= st.from && lvlNow < st.to;
      const lv = `<td class="num">${st.from}–${st.to}${here ? ` <span class="pill good">You</span>` : ""}</td>`;
      if (st.quest) {
        return `<tr class="${here ? "here" : ""}">${lv}
          <td class="wrapcell"><a href="${esc(st.url || "#")}" target="_blank" rel="noopener">Quest: ${esc(st.quest)}</a>${st.note ? `<div class="sub2">${esc(st.note)}</div>` : ""}</td>
          <td class="r muted">Quest</td><td class="r muted">–</td><td class="r muted">Free</td><td class="wrapcell"><span class="muted">–</span></td></tr>`;
      }
      const rec = byId[st.method];
      const xp = Math.max(0, xpForLevel(st.to) - xpForLevel(st.from));
      const locked = rec ? unlocks.lockedInputs(rec.m) : null;
      locked?.forEach(x => { if (tipFor(x.name)) needTips.set(x.name, tipFor(x.name)); });
      // Best method that works right now for this range (level ok, everything unlocked): the fastest.
      // On a route with prefer: "cheap", the fastest one that doesn't cost money (if there is one).
      const fastest = list => list.sort((a, b) => (b.xpHr - a.xpHr) || (b.gpXp - a.gpXp))[0];
      const open = rows.filter(r => usable(r, st.from));
      const alt = (active.prefer === "cheap" && fastest(open.filter(r => r.gpXp >= 0))) || fastest(open);
      const cost = r => r && r.xpHr ? { h: xp / r.xpHr, gp: (xp / r.xpHr) * (r.c.profitHr ?? 0) } : null;
      const cr = cost(rec), ca = cost(locked?.length ? alt : rec);
      if (cr) { totalRec += cr.gp; totalRecH += cr.h; } else recComplete = false;
      if (ca) { totalBest += ca.gp; totalBestH += ca.h; }
      return `<tr class="${here ? "here" : ""}">${lv}
        <td class="wrapcell"><a href="#/training/${skill.key}" data-jump="${rec?.m.id || ""}">${esc(rec ? rec.m.name : st.method)}</a>${st.note ? `<div class="sub2">${esc(st.note)}</div>` : ""}</td>
        <td class="r num">${rec ? short(rec.xpHr) : "–"}</td>
        <td class="r num ${cls(rec?.gpXp)}">${fmtGpXp(rec?.gpXp)}</td>
        <td class="r num ${cls(cr?.gp)}">${cr ? signed(cr.gp) : "–"}<div class="sub2">${cr ? duration(cr.h) : ""}</div></td>
        <td class="wrapcell">${locked == null ? "…" : !locked.length ? `<span class="pill good">All unlocked</span>` :
          `<span class="pill bad">Missing ${esc(locked.map(x => x.name).join(", "))}</span>${alt ? `<div class="sub2">Until then: <b>${esc(alt.m.name)}</b> (${short(alt.xpHr)} XP/hr, ${fmtGpXp(alt.gpXp)} gp/XP)</div>` : ""}`}</td>
      </tr>`;
    }).join("");

    const first = steps0[0].from, last = steps0[steps0.length - 1].to;
    const tabs = routes.length > 1 ? `<div class="seg routetabs" role="group" aria-label="Route">${routes.map(r =>
      `<button type="button" data-route="${esc(r.key)}" aria-pressed="${r.key === active.key}">${esc(r.name)}</button>`).join("")}</div>` : "";
    host.innerHTML = `
      <div class="sechead"><h2 class="pagetitle small">Training route${routes.length > 1 ? "s" : ""}</h2>${tabs}</div>
      ${guide.intro ? `<p class="lead">${esc(guide.intro)}</p>` : ""}
      ${active.intro ? `<p class="lead">${esc(active.intro)}</p>` : ""}
      ${active.auto ? `<div class="toolbar timevalue">
        <div class="field"><label for="t-timevalue">Your time is worth (gp per hour)</label>
          <input id="t-timevalue" type="number" min="0" step="100000" inputmode="numeric" value="${timeValue()}"></div>
        <div class="presets">${[0, 250_000, 500_000, 1_000_000, 2_000_000, 5_000_000].map(v => `<button type="button" data-tv="${v}">${v ? short(v) : "Only cost"}</button>`).join("")}</div>
        <p class="fine">Higher = faster route, lower = cheaper route. A good value is what your best money maker earns per hour: an hour spent training is an hour you're not making money.${quester() ? ` Methods that need a quest ${esc(quester().name)} hasn't done are skipped.` : " Pick a player above to skip methods that need a quest they haven't done."}</p>
      </div>` : ""}
      <div class="board"><table>
        <thead><tr><th>Levels</th><th>Recommended</th><th class="r">XP / hr</th><th class="r">GP / XP</th><th class="r">Cost for these levels</th><th>Unlocks</th></tr></thead>
        <tbody data-f="route-rows">${steps}
          <tr class="total"><td>${first}–${last}</td><td>Whole route${recComplete ? "" : " (some prices missing)"}</td><td></td><td></td>
            <td class="r num ${cls(totalRec)}">${signed(totalRec)}<div class="sub2">${duration(totalRecH)}</div></td>
            <td class="wrapcell"><span class="sub2">With the ${active.prefer === "cheap" ? "cheapest" : "fastest"} unlocked method where the recommended one is locked: <b class="num">${signed(totalBest)}</b> over ${duration(totalBestH)}</span></td></tr>
        </tbody>
      </table></div>
      ${needTips.size ? `<div class="unlocktips"><h3 class="reqgroup">How to unlock what the route needs</h3><p class="fine">You only need one of each: once anyone in the group has obtained an item, everyone can buy more on the GE.</p><ul>${
        [...needTips].map(([n, t]) => `<li><b>${esc(n)}</b>: ${esc(t)}</li>`).join("")}</ul></div>` : ""}`;
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
      $('[data-f="rows"]').innerHTML = `<tr><td colspan="8" class="muted">No ${esc(skill.name)} methods yet. Add one in data/methods (see the README).</td></tr>`;
      return;
    }
    if (!prices.ready()) {
      $('[data-f="rows"]').innerHTML = `<tr><td colspan="8" class="muted">Loading prices…</td></tr>`;
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
      <td class="wrapcell">${lockCell(r.m)}</td>
    </tr>`).join("");

    renderRoute(rows, lvlNow);

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
  $('[data-f="route"]').addEventListener("change", e => {
    if (e.target.id !== "t-timevalue") return;
    setTimeValue(e.target.value); render();
  });
  $('[data-f="route"]').addEventListener("click", e => {
    const tv = e.target.closest("[data-tv]");
    if (tv) { setTimeValue(tv.dataset.tv); render(); return; }
    const tab = e.target.closest("[data-route]");
    if (tab) { store.set("route:" + skill.key, tab.dataset.route); render(); return; }
    const a = e.target.closest("[data-jump]");
    if (!a || !a.dataset.jump) return;
    e.preventDefault();
    document.getElementById(a.dataset.jump)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  $('[data-f="rows"]').addEventListener("click", e => {
    const a = e.target.closest("[data-jump]");
    if (!a) return;
    e.preventDefault();
    document.getElementById(a.dataset.jump)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  const offs = [prices.onChange(render), calc.onChange(render), group.onChange(render), unlocks.onChange(render),
    me.onChange(() => { goal.player = me.get(); save(); render(); })];
  render();
  return () => offs.forEach(off => off());
}
