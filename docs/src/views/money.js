// Money makers page: ranking of every method tagged "money", then a card per method.
import METHODS from "../../data/methods/index.js";
import * as prices from "../core/prices.js";
import * as calc from "../core/calc.js";
import * as group from "../core/players.js";
import * as unlocks from "../core/unlocks.js";
import { esc, gp, short, cls } from "../core/format.js";
import { createMethodCard } from "../components/methodCard.js";

export const title = "Money makers";

export function mount(root) {
  const methods = METHODS.filter(m => (m.tags || ["money"]).includes("money"));
  root.innerHTML = `
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

  // Bronzeman: inputs you have to buy must be unlocked by someone in the group first.
  function unlockCell(m, c) {
    if (!(m.inputs || []).length) return `<span class="muted">No inputs</span>`;
    const locked = unlocks.lockedInputs(m);
    if (locked == null) return "…";
    if (!locked.length) return `<span class="pill good">All unlocked</span>`;
    const names = locked.map(x => c.ins.find(r => r.id === x.id)?.it.name || `Item ${x.id}`);
    return `<span class="pill bad" title="Not unlocked: ${esc(names.join(", "))}">Missing ${esc(names.join(", "))}</span>`;
  }

  function render() {
    if (!prices.ready()) return;
    const rows = methods.map(m => ({ m, c: calc.compute(m) }))
      .sort((a, b) => (b.c.profitHr ?? -Infinity) - (a.c.profitHr ?? -Infinity));

    board.innerHTML = rows.map(({ m, c }, i) => {
      const pace = calc.limitPace(c);
      const able = group.loaded() ? group.all().filter(p => group.missing(p, m)?.length === 0) : null;
      return `<tr>
        <td><span class="rank">${i + 1}</span><a href="#/money" data-jump="${m.id}">${esc(m.name)}</a></td>
        <td class="r num ${cls(c.profitHr)}" title="${gp(c.profitHr)} gp">${short(c.profitHr)}</td>
        <td class="r num ${cls(c.profit)}">${gp(c.profit)}</td>
        <td class="r num">${short(c.xpTotalHr)}</td>
        <td class="r num">${gp(c.perHour)}</td>
        <td><span class="pill ${pace.pill}">${pace.text}</span></td>
        <td>${unlockCell(m, c)}</td>
        <td>${able == null ? "…" : able.length ? esc(able.map(p => p.name).join(", ")) : `<span class="muted">Nobody yet</span>`}</td>
      </tr>`;
    }).join("");

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

  const offs = [prices.onChange(render), calc.onChange(render), group.onChange(render), unlocks.onChange(render)];
  render();
  return () => offs.forEach(off => off());
}
