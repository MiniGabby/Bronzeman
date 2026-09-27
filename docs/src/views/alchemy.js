// Alchemy page: is High Level Alchemy worth it with the items the group has unlocked?
// Live margins for every unlocked item, easy-to-unlock extras, and a best 4-hour plan
// that respects each item's GE buy limit.
import EASY from "../../data/alch-unlocks.js";
import * as prices from "../core/prices.js";
import * as unlocks from "../core/unlocks.js";
import * as group from "../core/players.js";
import { store } from "../core/store.js";
import { esc, gp, short, signed, cls, nf } from "../core/format.js";

export const title = "Alchemy";

const NATURE_RUNE = 561;
const STAFF_OF_FIRE = 1387;
const MAGIC_LEVEL = 55;
const XP_PER_CAST = 65;
const LIMIT_WINDOW_H = 4;   // GE buy limits reset every 4 hours

export function mount(root) {
  const opts = Object.assign({ casts: 1000, maxItems: 4, showAll: false }, store.get("alch", {}));
  const save = () => store.set("alch", opts);

  root.innerHTML = `
    <p class="lead">High Level Alchemy turns an item into coins (60% of its shop value). It makes money when an item costs less on the GE than it alchs for, minus a nature rune. Each cast gives ${XP_PER_CAST} Magic XP, so it is also a cheap way to train Magic. In bronzeman you can only buy items the group has unlocked.</p>
    <div class="toolbar">
      <div class="field"><label for="a-casts">Casts per hour</label>
        <input id="a-casts" type="number" min="100" max="1200" step="50" inputmode="numeric"></div>
      <div class="field"><label for="a-items">Max different items</label>
        <input id="a-items" type="number" min="1" max="20" step="1" inputmode="numeric"></div>
      <div class="presets">
        <button type="button" data-v="1200">Max · 1,200</button>
        <button type="button" data-v="1000">Steady · 1,000</button>
        <button type="button" data-v="600">While doing other things · 600</button>
      </div>
      <div class="goal" data-f="req"></div>
    </div>
    <div data-f="plan"></div>
    <section class="section">
      <div class="sechead">
        <h2 class="pagetitle small">Unlocked items to alch</h2>
        <label class="check"><input type="checkbox" id="a-all"> Show unprofitable items too</label>
      </div>
      <div data-f="unlocked"></div>
    </section>
    <section class="section">
      <h2 class="pagetitle small">Easy to unlock</h2>
      <p class="fine">Items that aren't unlocked yet but only take one shop purchase. After that anyone in the group can buy them on the GE.</p>
      <div data-f="easy"></div>
    </section>
    <p class="fine">Profit per cast = high alch value − GE buy price − nature rune. With a staff of fire the 5 fire runes are free. Buy limits are per account and reset 4 hours after your first purchase, so each group member can buy their own set.</p>`;

  const $ = s => root.querySelector(s);
  const castsInput = $("#a-casts"), itemsInput = $("#a-items"), allBox = $("#a-all");
  castsInput.value = opts.casts;
  itemsInput.value = opts.maxItems;
  itemsInput.addEventListener("input", () => { opts.maxItems = Math.max(1, Math.min(20, Math.round(Number(itemsInput.value) || 1))); save(); render(); });
  allBox.checked = opts.showAll;
  castsInput.addEventListener("input", () => { opts.casts = Math.max(0, Math.min(1200, Number(castsInput.value) || 0)); save(); render(); });
  root.querySelectorAll(".presets button").forEach(b => b.addEventListener("click", () => {
    castsInput.value = b.dataset.v; opts.casts = Number(b.dataset.v); save(); render();
  }));
  allBox.addEventListener("change", () => { opts.showAll = allBox.checked; save(); render(); });

  let inPlan = new Set();

  function row(id, nature) {
    const it = prices.item(id);
    if (!it.highalch) return null;
    const { p: buy } = prices.price(id, "buy");
    if (buy == null) return null;
    const profit = it.highalch - buy - nature;
    return { id, it, buy, profit, limit: it.limit || null };
  }

  /**
   * Plan: pick at most opts.maxItems different items, the ones that earn the most per
   * 4-hour buy-limit window (buy limit × profit per cast), and buy up to each limit.
   */
  function plan(rows) {
    const budget = opts.casts * LIMIT_WINDOW_H;   // casts you could do in 4 hours
    const best = rows.filter(r => r.profit > 0)
      .map(r => ({ ...r, n: Math.min(budget, r.limit || budget) }))
      .sort((a, b) => b.n * b.profit - a.n * a.profit)
      .slice(0, opts.maxItems);
    let left = budget, profit = 0, used = 0;
    const picks = [];
    for (const r of best) {
      if (left <= 0) break;
      const n = Math.min(left, r.n);
      picks.push({ ...r, n });
      left -= n; used += n; profit += n * r.profit;
    }
    return { picks, used, profit, perCast: used ? profit / used : 0 };
  }

  function table(rows, withHow) {
    if (!rows.length) return `<p class="muted">${withHow ? "Nothing here right now." : "No unlocked item is profitable to alch right now."}</p>`;
    return `<div class="board"><table>
      <thead><tr><th>Item</th>${withHow ? "<th>How to unlock</th>" : ""}<th class="r">GE price</th><th class="r">High alch</th><th class="r">Profit / cast</th><th class="r">Buy limit</th><th class="r">Profit per limit</th><th class="r">Traded / hr</th></tr></thead>
      <tbody>${rows.map(r => `<tr>
        <td><a href="https://prices.runescape.wiki/osrs/item/${r.id}" target="_blank" rel="noopener">${esc(r.it.name)}</a>${inPlan.has(r.id) ? ` <span class="pill good">In plan</span>` : ""}</td>
        ${withHow ? `<td class="how">${esc(r.how)}</td>` : ""}
        <td class="r num">${gp(r.buy)}</td>
        <td class="r num">${gp(r.it.highalch)}</td>
        <td class="r num ${cls(r.profit)}">${signed(r.profit, gp)}</td>
        <td class="r num">${r.limit ? gp(r.limit) : "–"}</td>
        <td class="r num ${cls(r.profit)}">${r.limit ? signed(r.limit * r.profit) : "–"}</td>
        <td class="r num">${r.it.vol ? gp(r.it.vol) : "–"}</td>
      </tr>`).join("")}</tbody>
    </table></div>`;
  }

  function planBox(label, p) {
    if (!p.picks.length) return `<div class="stat"><span class="label">${label}</span><span class="val muted">No profitable items</span></div>`;
    const perHour = p.perCast * opts.casts;
    const minutes = opts.casts ? (p.used / opts.casts) * 60 : 0;
    const full = p.used >= opts.casts * LIMIT_WINDOW_H - 1;
    return `<div class="stat">
      <span class="label">${label}</span>
      <span class="big num ${cls(perHour)}">${signed(perHour)} <small>gp/hr</small></span>
      <span class="muted">${short(opts.casts * XP_PER_CAST)} Magic XP/hr · ${esc(p.picks.map(x => x.it.name).join(", "))}</span>
      <span class="muted">${full ? "Enough to keep alching all the time." : `Buy limits give ${nf.format(p.used)} items per 4 hours: about ${Math.round(minutes)} min of alching (${signed(p.profit)} in total), then wait for the limits to reset.`}</span>
    </div>`;
  }

  function render() {
    const ready = prices.ready() && unlocks.loaded();
    const staff = unlocks.has(STAFF_OF_FIRE), nat = unlocks.has(NATURE_RUNE);
    const able = group.loaded() ? group.all().filter(p => p.skills && group.level(p, "Magic") >= MAGIC_LEVEL).map(p => p.name) : [];
    const close = group.loaded() ? group.all().filter(p => p.skills && group.level(p, "Magic") < MAGIC_LEVEL && group.level(p, "Magic") >= MAGIC_LEVEL - 5).map(p => `${p.name} (${group.level(p, "Magic")})`) : [];
    $('[data-f="req"]').innerHTML = [
      `Magic ${MAGIC_LEVEL}: ${able.length ? esc(able.join(", ")) : `<span class="neg">nobody yet</span>${close.length ? ` · close: ${esc(close.join(", "))}` : ""}`}`,
      `Nature rune ${nat ? "✓ unlocked" : nat === false ? '<span class="neg">not unlocked</span>' : "…"}`,
      `Staff of fire ${staff ? "✓ unlocked" : staff === false ? '<span class="neg">not unlocked</span>' : "…"}`
    ].join("<br>");

    if (!ready) {
      $('[data-f="plan"]').innerHTML = "";
      $('[data-f="unlocked"]').innerHTML = `<p class="muted">Loading prices and unlocked items…</p>`;
      $('[data-f="easy"]').innerHTML = "";
      return;
    }
    const nature = prices.price(NATURE_RUNE, "buy").p || 0;
    const unlockedRows = (unlocks.data().items || []).map(i => row(i.id, nature)).filter(Boolean);
    const easyRows = EASY.filter(e => unlocks.has(e.id) === false)
      .map(e => { const r = row(e.id, nature); return r && { ...r, how: e.how }; }).filter(Boolean)
      .sort((a, b) => b.profit - a.profit);

    const now = plan(unlockedRows);
    inPlan = new Set(now.picks.map(x => x.id));
    const withEasy = plan([...unlockedRows, ...easyRows]);
    $('[data-f="plan"]').innerHTML = `<div class="stats">
      ${planBox(`Best ${opts.maxItems} unlocked item${opts.maxItems > 1 ? "s" : ""}`, now)}
      ${planBox("If you also unlock the easy items", withEasy)}
      <div class="stat"><span class="label">Nature rune</span><span class="big num">${gp(nature)} <small>gp</small></span><span class="muted">cost per cast, on top of the item</span></div>
    </div>`;

    const shown = unlockedRows.filter(r => opts.showAll || r.profit > 0).sort((a, b) => b.profit - a.profit);
    $('[data-f="unlocked"]').innerHTML = table(opts.showAll ? shown.slice(0, 200) : shown, false);
    $('[data-f="easy"]').innerHTML = table(easyRows, true);
  }

  const offs = [prices.onChange(render), unlocks.onChange(render), group.onChange(render)];
  render();
  return () => offs.forEach(off => off());
}
