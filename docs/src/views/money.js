// Money makers page: ranking of every method tagged "money", then a card per method.
import METHODS from "../../data/methods/index.js";
import * as prices from "../core/prices.js";
import * as calc from "../core/calc.js";
import * as group from "../core/players.js";
import * as unlocks from "../core/unlocks.js";
import { esc, gp, short, cls } from "../core/format.js";
import { store } from "../core/store.js";
import * as me from "../core/me.js";
import { createMethodCard } from "../components/methodCard.js";

export const title = "Money makers";

export function mount(root) {
  const methods = METHODS.filter(m => (m.tags || ["money"]).includes("money"));
  const filter = Object.assign({ player: "", within: 5 }, store.get("moneyFilter", {}));
  if (me.get()) filter.player = me.get();   // "You" in the header wins when the page opens
  const save = () => store.set("moneyFilter", filter);
  root.innerHTML = `
    <form class="toolbar" data-f="filter">
      <div class="field"><label for="f-player">Show methods for</label>
        <select id="f-player"><option value="">Anyone in the group</option></select></div>
      <div class="field"><label for="f-within">Skill levels</label>
        <select id="f-within">
          <option value="0">Can do it now</option>
          <option value="3">Within 3 levels</option>
          <option value="5">Within 5 levels</option>
          <option value="10">Within 10 levels</option>
          <option value="99">Show everything</option>
        </select></div>
      <div class="goal" data-f="hidden"></div>
    </form>
    <section class="board" aria-label="Methods ranked by profit per hour">
      <table>
        <thead><tr>
          <th>Method</th><th class="r">Profit / hr</th><th class="r">Profit / action</th><th class="r">XP / hr</th>
          <th class="r">Actions / hr</th><th>Buy limit</th><th>Inputs unlocked</th><th>Group can do it</th>
        </tr></thead>
        <tbody data-f="board"><tr><td colspan="8" class="muted">Loading prices…</td></tr></tbody>
      </table>
    </section>
    <section class="methods" data-f="cards"></section>`;
  const board = root.querySelector('[data-f="board"]');
  const host = root.querySelector('[data-f="cards"]');
  const cards = new Map();

  const filterNear = m => (group.loaded() ? closest(m) : null);
  // "3 levels to go" for the chosen player or the closest group member, when they can't do it yet.
  function nearNote(m, near) {
    if (!near || near.gap === 0) return "";
    const need = Object.entries(m.reqs?.skills || {}).filter(([s, lvl]) => group.level(near.p, s) < lvl)
      .map(([s, lvl]) => `${s} ${group.level(near.p, s)}/${lvl}`).join(", ");
    return `<div class="sub2">${filter.player ? "" : esc(near.p.name) + ": "}${near.gap} level${near.gap > 1 ? "s" : ""} to go (${esc(need)})</div>`;
  }

  // Bronzeman: inputs you have to buy must be unlocked by someone in the group first.
  function unlockCell(m, c) {
    if (!(m.inputs || []).length) return `<span class="muted">No inputs</span>`;
    const locked = unlocks.lockedInputs(m);
    if (locked == null) return "…";
    if (!locked.length) return `<span class="pill good">All unlocked</span>`;
    const names = locked.map(x => x.name);
    return `<span class="pill bad" title="Not unlocked: ${esc(names.join(", "))}">Missing ${esc(names.join(", "))}</span>`;
  }

  const playerSel = root.querySelector("#f-player"), withinSel = root.querySelector("#f-within");
  withinSel.value = String(filter.within);
  playerSel.addEventListener("change", () => { filter.player = playerSel.value; save(); render(); });
  withinSel.addEventListener("change", () => { filter.within = Number(withinSel.value); save(); render(); });
  root.querySelector('[data-f="filter"]').addEventListener("submit", e => e.preventDefault());
  root.querySelector('[data-f="hidden"]').addEventListener("click", e => {
    if (!e.target.closest("[data-showall]")) return;
    filter.within = 99; withinSel.value = "99"; save(); render();
  });

  // How many levels a player still needs for a method: the biggest gap over its skill requirements.
  const gapFor = (p, m) => p.skills
    ? Math.max(0, ...Object.entries(m.reqs?.skills || {}).map(([s, lvl]) => lvl - group.level(p, s)))
    : null;

  // Who to check: the chosen player, or everyone with stats. Returns the closest one and their gap.
  function closest(m) {
    const ps = group.all().filter(p => p.skills && (!filter.player || p.name === filter.player));
    let best = null;
    for (const p of ps) { const g = gapFor(p, m); if (best == null || g < best.gap) best = { p, gap: g }; }
    return best;
  }

  function fillPlayers() {
    const names = group.all().filter(p => p.skills).map(p => p.name);
    playerSel.innerHTML = `<option value="">Anyone in the group</option>${names.map(n => `<option value="${esc(n)}">${esc(n)}</option>`).join("")}`;
    // Match case-insensitively: Wise Old Man may capitalise names differently from data/players.js.
    filter.player = names.find(n => n.toLowerCase() === (filter.player || "").toLowerCase()) || "";
    playerSel.value = filter.player;
  }

  function render() {
    if (group.loaded()) fillPlayers();
    if (!prices.ready()) return;
    const filtering = group.loaded() && filter.within < 99;
    const all = methods.map(m => ({ m, c: calc.compute(m), near: group.loaded() ? closest(m) : null }));
    const rows = all.filter(r => !filtering || (r.near && r.near.gap <= filter.within))
      .sort((a, b) => (b.c.profitHr ?? -Infinity) - (a.c.profitHr ?? -Infinity));
    const hidden = all.length - rows.length;
    const who = filter.player || "anyone in the group";
    root.querySelector('[data-f="hidden"]').innerHTML = hidden
      ? `${hidden} method${hidden > 1 ? "s" : ""} hidden: ${filter.within ? `more than ${filter.within} levels away for ${esc(who)}` : `${esc(who)} can't do ${hidden > 1 ? "them" : "it"} yet`}. <button type="button" class="linkbtn" data-showall>Show all</button>`
      : "";

    board.innerHTML = rows.map(({ m, c }, i) => {
      const pace = calc.limitPace(c);
      const able = group.loaded() ? group.all().filter(p => group.missing(p, m)?.length === 0) : null;
      return `<tr>
        <td class="wrapcell"><span class="rank">${i + 1}</span><a href="#/money" data-jump="${m.id}">${esc(m.name)}</a></td>
        <td class="r num ${cls(c.profitHr)}" title="${gp(c.profitHr)} gp per hour">${m.per === "day" ? `${short(c.profitHr * 24)} <span class="muted">/day</span>` : short(c.profitHr)}</td>
        <td class="r num ${cls(c.profit)}">${gp(c.profit)}</td>
        <td class="r num">${m.per === "day" ? `${short(c.xpTotalHr * 24)} <span class="muted">/day</span>` : short(c.xpTotalHr)}</td>
        <td class="r num">${m.per === "day" ? `${calc.getRate(m)} <span class="muted">/day</span>` : gp(c.perHour)}</td>
        <td class="wrapcell"><span class="pill ${pace.pill}">${pace.text}</span></td>
        <td class="wrapcell">${unlockCell(m, c)}</td>
        <td class="wrapcell">${able == null ? "…" : able.length ? able.map(p => { const unk = group.unknownQuests(p, m); return unk.length ? `<span title="Not known yet if ${esc(p.name)} has done ${esc(unk.join(", "))}">${esc(p.name)}?</span>` : esc(p.name); }).join(", ") : `<span class="muted">Nobody yet</span>`}${nearNote(m, filterNear(m))}</td>
      </tr>`;
    }).join("") || `<tr><td colspan="8" class="muted">No methods within ${filter.within} levels for ${esc(who)}. Pick a bigger range above.</td></tr>`;

    // Cards follow the same filter: remove cards of hidden methods.
    const shownIds = new Set(rows.map(r => r.m.id));
    for (const [id, card] of cards) if (!shownIds.has(id)) card.el.remove();

    for (const { m, c } of rows) {
      if (!cards.has(m.id)) cards.set(m.id, createMethodCard(m));
      const card = cards.get(m.id);
      host.appendChild(card.el);   // keeps cards in ranking order
      card.update(c);
    }
  }

  board.addEventListener("click", e => {
    const a = e.target.closest("[data-jump]");
    if (!a) return;
    e.preventDefault();
    document.getElementById(a.dataset.jump)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  const offs = [prices.onChange(render), calc.onChange(render), group.onChange(render), unlocks.onChange(render),
    me.onChange(() => { filter.player = me.get(); save(); render(); })];
  render();
  return () => offs.forEach(off => off());
}
