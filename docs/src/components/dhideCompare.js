// Dragonhide comparison (Crafting training page): for every d'hide body, chaps and vambraces, what it costs
// with bought dragon leather or with bought hides you tan yourself, what it brings in sold on the GE or
// High Alched, and how long each way takes. Data and paces: data/dragonhide.js.
import D from "../../data/dragonhide.js";
import * as prices from "../core/prices.js";
import * as unlocks from "../core/unlocks.js";
import { store } from "../core/store.js";
import { esc, gp, short, signed, cls, duration, nf, geTax } from "../core/format.js";
import * as ui from "../core/ui.js";
import { timeValue, setTimeValue } from "../core/autoRoute.js";

const ITEMS = D.colours.flatMap(c => D.pieces.map(p => ({
  key: `${c.key}-${p.key}`, colour: c, piece: p, level: c[p.key][0], xp: c[p.key][1],
  name: `${c.name} d'hide ${p.name}`, leather: `${c.name} dragon leather`, hide: `${c.name} dragonhide`
}))).sort((a, b) => a.level - b.level);

const WAYS = [
  { key: "leather-sell", tan: false, alch: false, label: "Buy leather, sell" },
  { key: "leather-alch", tan: false, alch: true, label: "Buy leather, alch" },
  { key: "hide-sell", tan: true, alch: false, label: "Buy hides + tan, sell" },
  { key: "hide-alch", tan: true, alch: true, label: "Buy hides + tan, alch" }
];

const buy = name => { const id = prices.idOf(name); return id == null ? null : prices.price(id, "buy").p; };
const lockPill = names => {
  const locked = names.filter(n => unlocks.hasName(n) === false);
  return locked.length ? ` <span class="pill bad">Missing ${esc(locked.join(", "))}</span>` : "";
};

/** Every number for one item: per item costs and revenue, and per item hours for each step. */
function numbers(it) {
  const outId = prices.idOf(it.name), out = outId == null ? null : prices.item(outId);
  const sell = outId == null ? null : prices.price(outId, "sell").p;
  const leather = buy(it.leather), hide = buy(it.hide), thread = (buy("Thread") || 0) * D.thread;
  const nature = buy("Nature rune");
  const n = it.piece.leather;
  const cost = { leather: leather == null ? null : n * leather + thread, hide: hide == null ? null : n * (hide + D.tan.fee) + thread };
  const get = { sell: sell == null ? null : sell - geTax(Math.floor(sell)), alch: out?.highalch == null || nature == null ? null : out.highalch - nature };
  const hours = { craft: 1 / it.piece.perHour, tan: n / D.tan.perHour, alch: 1 / D.alch.perHour };
  const ways = WAYS.map(w => {
    const c = cost[w.tan ? "hide" : "leather"], g = get[w.alch ? "alch" : "sell"];
    const h = hours.craft + (w.tan ? hours.tan : 0) + (w.alch ? hours.alch : 0);
    const profit = c == null || g == null ? null : g - c;
    return { ...w, cost: c, get: g, h, profit, profitHr: profit == null ? null : profit / h };
  });
  // "Best" = most profit per item after counting the time at what the viewer says their time is worth
  // (the same value as the "Best of both" routes), so the extra time for tanning and alching counts.
  const V = timeValue();
  const best = ways.filter(w => w.profit != null).sort((a, b) => (b.profit - b.h * V) - (a.profit - a.h * V))[0] || null;
  return { out, sell, leather, hide, nature, cost, get, hours, ways, best, vol: out?.vol || 0 };
}

/** onTimeValue: called after the viewer changes what their time is worth, so the page can redraw its routes. */
export function createDhideCompare({ onTimeValue } = {}) {
  const el = document.createElement("section");
  el.className = "section dhide";
  const state = Object.assign({ pick: "green-body", count: 1000 }, store.get("dhide", {}));
  const save = () => store.set("dhide", state);
  let last = { need: 0, lvl: 1 };

  function render() {
    const { need, lvl } = last;
    if (!prices.ready()) { el.innerHTML = ""; return; }
    const rows = ITEMS.map(it => ({ it, n: numbers(it) }));
    const sel = rows.find(r => r.it.key === state.pick) || rows[0];
    const toTarget = need > 0 ? Math.ceil(need / sel.it.xp) : 0;
    const count = Math.max(1, Number(state.count) || 1);

    const overview = rows.map(({ it, n }) => {
      const tanSave = n.cost.leather == null || n.cost.hide == null ? null : n.cost.leather - n.cost.hide;
      const alchMore = n.get.sell == null || n.get.alch == null ? null : n.get.alch - n.get.sell;
      return `<tr class="${[it.key === sel.it.key ? "here" : "", lvl < it.level ? "locked" : ""].join(" ").trim()}" data-pick="${it.key}">
        <td><a href="#" data-pick="${it.key}">${esc(it.name)}</a>${lvl < it.level ? ` <span class="pill warn">Needs ${it.level}</span>` : ""}<div class="sub2">${it.piece.leather} leather · ${it.xp} XP${
          ui.simple() ? "" : ` · ${nf.format(n.vol)} traded last hour`}</div></td>
        <td class="r num ${tanSave != null && tanSave < 0 ? "pos" : ""}">${gp(n.cost.leather)}</td>
        <td class="r num ${tanSave != null && tanSave > 0 ? "pos" : ""}">${gp(n.cost.hide)}<div class="sub2">${tanSave == null ? "" : tanSave > 0 ? `saves ${gp(tanSave)}` : `${gp(-tanSave)} dearer`}</div></td>
        <td class="r num ${alchMore != null && alchMore < 0 ? "pos" : ""}">${gp(n.get.sell)}</td>
        <td class="r num ${alchMore != null && alchMore > 0 ? "pos" : ""}">${gp(n.get.alch)}<div class="sub2">${alchMore == null ? "" : alchMore > 0 ? `${gp(alchMore)} more` : `${gp(-alchMore)} less`}</div></td>
        <td class="wrapcell">${n.best ? `<b>${esc(n.best.label)}</b>` : "–"}</td>
        <td class="r num ${cls(n.best?.profit)}">${n.best ? signed(n.best.profit, gp) : "–"}</td>
        <td class="r num ${cls(n.best?.profitHr)}">${n.best ? signed(n.best.profitHr) : "–"}</td>
      </tr>`;
    }).join("");

    const n = sel.n, it = sel.it;
    const detail = n.ways.map(w => {
      const totalH = w.h * count;
      const steps = [`craft ${duration(n.hours.craft * count)}`, w.tan ? `tan ${duration(n.hours.tan * count)}` : "", w.alch ? `alch ${duration(n.hours.alch * count)}` : ""].filter(Boolean).join("<br>");
      return `<tr class="${w === n.best ? "here" : ""}">
        <td>${esc(w.label)}${w === n.best ? ` <span class="pill good">Best</span>` : ""}${lockPill([w.tan ? it.hide : it.leather, ...(w.alch ? ["Nature rune"] : [])])}</td>
        <td class="r num">${gp(w.cost)}</td>
        <td class="r num">${gp(w.get)}</td>
        <td class="r num ${cls(w.profit)}">${signed(w.profit, gp)}</td>
        <td class="r num">${nf.format(Math.round(1 / w.h))}<div class="sub2">${short(it.xp / w.h)} Crafting XP</div></td>
        <td class="r num ${cls(w.profitHr)}">${signed(w.profitHr)}</td>
        <td class="r num ${cls(w.profit)}">${w.profit == null ? "–" : signed(w.profit * count)}</td>
        <td class="r num">${duration(totalH)}${ui.simple() ? "" : `<div class="sub2">${steps}</div>`}</td>
      </tr>`;
    }).join("");

    // Is the extra step worth the time? Coins it earns per hour spent on that step alone.
    const tanSave = n.cost.leather == null || n.cost.hide == null ? null : n.cost.leather - n.cost.hide;
    const tanHr = tanSave == null ? null : tanSave / n.hours.tan;
    const alchMore = n.get.sell == null || n.get.alch == null ? null : n.get.alch - n.get.sell;
    const alchHr = alchMore == null ? null : alchMore / n.hours.alch;
    const nl = it.piece.leather * count;

    el.innerHTML = `
      <div class="sechead"><h2 class="pagetitle small">Dragonhide: leather or hides, sell or alch</h2></div>
      <p class="lead">Buy dragon leather, or buy the hides and tan them yourself at ${esc(D.tan.where)}. Then sell what you make on the GE, or High Alch it (Magic ${D.alch.level}, ${D.alch.xp} Magic XP per cast). Tanning and alching are cheaper or pay more, but take extra time: "Best" counts that time, valued at what you say your time is worth.</p>
      <div class="board"><table>
        <thead><tr><th>Item</th><th class="r">${ui.t("Leather / item", "Cost with leather")}</th><th class="r">${ui.t("Hides + tan / item", "Cost with hides")}</th><th class="r">${ui.t("Sell / item", "Sold on the GE")}</th><th class="r">${ui.t("Alch / item", "Alched")}</th><th>${ui.t("Best way", "Best way")}</th><th class="r">${ui.t("Profit / item", "Profit per item")}</th><th class="r">${ui.t("Profit / hr", "Profit per hour")}</th></tr></thead>
        <tbody data-f="dh-rows">${overview}</tbody>
      </table></div>
      <p class="fine">Per item, at live prices. Cost includes ${D.thread} thread per item; hides + tan includes ${D.tan.fee} coins per hide. Sell is after GE tax, alch is the alch value minus a nature rune (fire runes free with a staff of fire). Click an item to compare the four ways below. "Traded last hour" shows how fast the item sells: d'hide items sell slowly, alching has no such limit.</p>

      <h3 class="reqgroup">${esc(it.name)}: all four ways</h3>
      <div class="toolbar">
        <div class="field"><label for="dh-count">How many to make</label>
          <input id="dh-count" type="number" min="1" step="100" inputmode="numeric" value="${count}"></div>
        <div class="presets">${[100, 1000, 5000].map(v => `<button type="button" data-count="${v}">${nf.format(v)}</button>`).join("")}${
          toTarget ? `<button type="button" data-count="${toTarget}">To your target (${nf.format(toTarget)})</button>` : ""}</div>
        <div class="field"><label for="dh-tv">Your time is worth (gp per hour)</label>
          <input id="dh-tv" type="number" min="0" step="100000" inputmode="numeric" value="${timeValue()}"></div>
        <div class="presets">${[0, 250_000, 500_000, 1_000_000, 2_000_000].map(v => `<button type="button" data-tv="${v}">${v ? short(v) : "Only cost"}</button>`).join("")}</div>
      </div>
      <p class="fine">"Best" is the way with the most profit per item once the time is counted at ${short(timeValue())} gp per hour (the same value as the Best of both route). At "Only cost" it's simply the cheapest way, however long it takes.</p>
      <div class="board"><table>
        <thead><tr><th>Way</th><th class="r">${ui.t("Cost / item", "Costs per item")}</th><th class="r">${ui.t("Gets / item", "Brings in per item")}</th><th class="r">${ui.t("Profit / item", "Profit per item")}</th><th class="r">${ui.t("Items / hr", "Items per hour")}</th><th class="r">${ui.t("Profit / hr", "Profit per hour")}</th><th class="r">Profit for ${nf.format(count)}</th><th class="r">Time for ${nf.format(count)}</th></tr></thead>
        <tbody>${detail}</tbody>
      </table></div>
      <ul class="fine dhnotes">
        <li><b>Tanning</b> ${nl === 1 ? "1 hide" : `${nf.format(nl)} hides`}: ${tanSave == null ? "price missing" : `${tanSave >= 0 ? "saves" : "costs"} <b class="num">${gp(Math.abs(tanSave * count))}</b> and takes <b>${duration(n.hours.tan * count)}</b> extra. That's <b class="num ${cls(tanHr)}">${signed(tanHr)}</b> per hour spent tanning.`} Leather ${gp(n.leather)}, hide ${gp(n.hide)} + ${D.tan.fee}.</li>
        <li><b>Alching</b> ${nf.format(count)}: ${alchMore == null ? "price missing" : `${alchMore >= 0 ? "earns" : "loses"} <b class="num">${gp(Math.abs(alchMore * count))}</b> ${alchMore >= 0 ? "more" : ""} than selling and takes <b>${duration(n.hours.alch * count)}</b> extra. That's <b class="num ${cls(alchHr)}">${signed(alchHr)}</b> per hour spent alching, plus ${short(D.alch.xp * count)} Magic XP.`} Alch value ${gp(n.out?.highalch)}, nature rune ${gp(n.nature)}, GE sell ${gp(n.sell)}.</li>
        <li><b>Crafting</b> ${nf.format(count)} takes ${duration(n.hours.craft * count)} and gives ${short(it.xp * count)} Crafting XP.</li>
      </ul>
      <p class="fine">Paces are estimates: crafting ${nf.format(it.piece.perHour)} ${esc(it.piece.plural)} per hour, tanning ${nf.format(D.tan.perHour)} hides per hour, alching ${nf.format(D.alch.perHour)} casts per hour. "Per hour spent" is only that step: compare it with your best money maker to see if the step is worth your time.</p>`;
  }

  el.addEventListener("click", e => {
    const p = e.target.closest("[data-pick]");
    if (p) { e.preventDefault(); state.pick = p.dataset.pick; save(); render(); return; }
    const c = e.target.closest("[data-count]");
    if (c) { state.count = Number(c.dataset.count); save(); render(); return; }
    const tv = e.target.closest("[data-tv]");
    if (tv) { setTimeValue(tv.dataset.tv); onTimeValue ? onTimeValue() : render(); }
  });
  el.addEventListener("change", e => {
    if (e.target.id === "dh-tv") { setTimeValue(e.target.value); onTimeValue ? onTimeValue() : render(); return; }
    if (e.target.id !== "dh-count") return;
    state.count = Math.max(1, Math.round(Number(e.target.value) || 1)); save(); render();
  });

  return { el, update(opts) { last = opts; render(); } };
}
