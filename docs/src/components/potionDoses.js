// Potion doses (Herblore training page): for every potion that comes in (1) to (4) doses, the live
// price per dose of each size after GE tax, which size sells best, and what a decant flip earns.
// Decanting is free at Bob Barter in the Grand Exchange, so doses can be moved between sizes at no cost.
// The potion list comes from the price API's item list: every name that exists as (1), (2), (3) and (4).
import * as prices from "../core/prices.js";
import * as unlocks from "../core/unlocks.js";
import { store } from "../core/store.js";
import { esc, gp, signed, cls, nf, geTax } from "../core/format.js";
import * as ui from "../core/ui.js";

const DOSES = [1, 2, 3, 4];
const WINDOW = 4;   // hours: the GE buy limit resets every 4 hours
// Have (1)-(4) in the item list but are not potions Bob Barter decants.
const SKIP = new Set(["olive oil", "sacred oil", "haemostatic dressing"]);

let list = null;
/** [{ name, ids: { 1: id, ... } }] once the item list has loaded. */
function potions() {
  if (list || !prices.ready()) return list || [];
  const by = new Map();
  for (const id of prices.allIds()) {
    const m = /^(.*?)\s*\(([1-4])\)$/.exec(prices.item(id).name);
    if (!m || SKIP.has(m[1].toLowerCase())) continue;
    if (!by.has(m[1])) by.set(m[1], {});
    by.get(m[1])[m[2]] = id;
  }
  list = [...by].filter(([, ids]) => DOSES.every(d => ids[d] != null))
    .map(([name, ids]) => ({ name, ids })).sort((a, b) => a.name.localeCompare(b.name));
  return list;
}

/** Live numbers for one potion: per size the price and price per dose, the best size to sell and to buy as. */
function numbers(p, minVol, share) {
  const sizes = DOSES.map(d => {
    const id = p.ids[d], it = prices.item(id);
    const sell = prices.price(id, "sell").p, buy = prices.price(id, "buy").p;
    const net = sell == null ? null : sell - geTax(Math.floor(sell));
    return { d, id, vol: it.vol, limit: it.limit, sell, buy,
      sellDose: net == null ? null : net / d, buyDose: buy == null ? null : buy / d };
  });
  // A size whose price per dose is less than half or more than double the potion's median is a stray
  // trade (e.g. someone selling a (2) for 2 coins), not a price you can get. It doesn't count.
  const mids = sizes.map(s => s.sell == null || s.buy == null ? null : (s.sell + s.buy) / 2 / s.d).filter(v => v != null).sort((a, b) => a - b);
  const median = mids.length ? (mids[(mids.length - 1) >> 1] + mids[mids.length >> 1]) / 2 : null;
  for (const s of sizes) {
    const lo = Math.min(s.sell ?? Infinity, s.buy ?? Infinity) / s.d, hi = Math.max(s.sell ?? 0, s.buy ?? 0) / s.d;
    s.odd = median != null && (lo < median / 2 || hi > median * 2);
    s.ok = !s.odd && s.vol >= minVol;
  }
  // Only sizes that trade enough count: a good price on a size nobody trades may never fill.
  const best = sizes.filter(s => s.sellDose != null && s.ok).sort((a, b) => b.sellDose - a.sellDose)[0] || null;
  const cheap = sizes.filter(s => s.buyDose != null && s.ok).sort((a, b) => a.buyDose - b.buyDose)[0] || null;
  // Buy as the cheapest size per dose, decant for free at Bob Barter, sell as the best size (after tax).
  const perDose = best && cheap ? best.sellDose - cheap.buyDose : null;
  const perPotion = perDose == null ? null : perDose * cheap.d;   // per potion of the size you buy
  // How many you can really do per buy limit window (4 hours): the buy limit, but no more than your
  // share of what trades of the "buy as" size in 4 hours, and no more doses than your share of the
  // "sell as" size's 4-hour trades can take. Trades per hour are last hour's, both sides together.
  let qty = null, by = null;
  if (perPotion != null) {
    const caps = [
      { by: "limit", n: cheap.limit ?? Infinity },
      { by: "buy", n: Math.floor(cheap.vol * WINDOW * share) },
      { by: "sell", n: best === cheap ? Infinity : Math.floor(best.vol * WINDOW * share * best.d / cheap.d) }
    ].sort((a, b) => a.n - b.n);
    if (isFinite(caps[0].n)) ({ n: qty, by } = caps[0]);
  }
  const per4h = qty == null ? null : perPotion * qty;
  const vol = sizes.reduce((s, x) => s + x.vol, 0);
  return { sizes, best, cheap, perDose, perPotion, qty, by, per4h, vol };
}

const SORTS = {
  limit: { label: "Profit per 4 hours", fn: (a, b) => (b.n.per4h ?? -1e12) - (a.n.per4h ?? -1e12) },
  dose: { label: "Margin per dose", fn: (a, b) => (b.n.perDose ?? -1e12) - (a.n.perDose ?? -1e12) },
  vol: { label: "Traded last hour", fn: (a, b) => b.n.vol - a.n.vol },
  name: { label: "Name", fn: (a, b) => a.p.name.localeCompare(b.p.name) }
};

export function createPotionDoses() {
  const el = document.createElement("section");
  el.className = "section potions";
  const state = Object.assign({ q: "", sort: "limit", minVol: 10, share: 25 }, store.get("potionDoses", {}));
  if (!SORTS[state.sort]) state.sort = "limit";
  const save = () => store.set("potionDoses", state);
  let built = false;

  function shell() {
    el.innerHTML = `
      <div class="sechead"><h2 class="pagetitle small">Potions: which dose to buy and sell</h2></div>
      <p class="lead">Every potion has a different price per dose as (1), (2), (3) or (4). Bob Barter in the Grand Exchange decants potions for free, so you can buy the size that's cheapest per dose and sell the size that pays the most per dose. This table shows each size's live price and price per dose, the best size to sell and to buy as, and the profit per 4 hours (one GE buy limit), counting how many of each size really trade.</p>
      <div class="toolbar">
        <div class="field grow"><label for="pd-q">Find a potion</label>
          <input id="pd-q" type="search" placeholder="e.g. prayer, super restore" value="${esc(state.q)}"></div>
        <div class="field"><label for="pd-sort">Sort by</label>
          <select id="pd-sort">${Object.entries(SORTS).map(([k, s]) => `<option value="${k}"${k === state.sort ? " selected" : ""}>${esc(s.label)}</option>`).join("")}</select></div>
        <div class="field"><label for="pd-min">Min. traded per size</label>
          <input id="pd-min" type="number" min="0" step="5" inputmode="numeric" value="${state.minVol}"></div>
        <div class="field"><label for="pd-share">Your share of trades (%)</label>
          <input id="pd-share" type="number" min="1" max="100" step="5" inputmode="numeric" value="${state.share}"></div>
      </div>
      <div class="board"><table>
        <thead><tr><th>Potion</th>${DOSES.map(d => `<th class="r">(${d})${d > 1 ? ` <span class="sub2">${ui.t("/ dose", "per dose")}</span>` : ""}</th>`).join("")}<th>${ui.t("Sell as", "Best to sell as")}</th><th>${ui.t("Buy as", "Best to buy as")}</th><th class="r">${ui.t("Profit / 4 hr", "Profit per 4 hours")}</th></tr></thead>
        <tbody data-f="pd-rows"></tbody>
      </table></div>
      <p class="fine" data-f="pd-note"></p>`;
    built = true;
  }

  function rows() {
    const q = state.q.trim().toLowerCase();
    const minVol = Math.max(0, Number(state.minVol) || 0);
    const share = Math.min(100, Math.max(1, Number(state.share) || 25)) / 100;
    const all = potions().map(p => ({ p, n: numbers(p, minVol, share) }));
    const shown = all.filter(r => (!q || r.p.name.toLowerCase().includes(q)) && r.n.best && r.n.cheap)
      .sort(SORTS[state.sort].fn);
    el.querySelector('[data-f="pd-rows"]').innerHTML = shown.length ? shown.map(({ p, n }) => {
      const cells = n.sizes.map(s => {
        const mark = s === n.best ? " pos" : s === n.cheap ? " buyas" : "";
        return `<td class="r num${s.ok ? mark : " muted"}">${gp(s.sell)}${
          s.d > 1 ? `<div class="sub2">${gp(s.sellDose)} / dose</div>` : ""}${
          `<div class="sub2">${nf.format(s.vol)} trades / hr</div>`}${s.odd ? `<div class="sub2">odd price</div>` : ""}</td>`;
      }).join("");
      const locked = unlocks.has(n.cheap.id) === false;
      return `<tr>
        <td>${esc(p.name)}<div class="sub2">${nf.format(n.vol)} trades / hr, all sizes</div></td>
        ${cells}
        <td><b>(${n.best.d})</b><div class="sub2">${gp(n.best.sellDose)} / dose</div></td>
        <td><b>(${n.cheap.d})</b>${locked ? ` <span class="pill bad">Locked</span>` : ""}<div class="sub2">${gp(n.cheap.buyDose)} / dose</div></td>
        <td class="r num ${cls(n.per4h ?? n.perDose)}">${n.per4h == null ? "–" : signed(n.per4h)}<div class="sub2">${signed(n.perPotion, gp)} × ${n.qty == null ? "?" : nf.format(n.qty)} (${n.cheap.d})</div><div class="sub2">${
          n.by === "limit" ? `buy limit ${nf.format(n.cheap.limit)}` : n.by === "buy" ? `held back by (${n.cheap.d}) trades` : `held back by (${n.best.d}) trades`}${
          n.cheap.limit && n.by !== "limit" ? ` (limit ${nf.format(n.cheap.limit)})` : ""}</div></td>
      </tr>`;
    }).join("") : `<tr><td colspan="8">No potions match.</td></tr>`;
    el.querySelector('[data-f="pd-note"]').innerHTML = `${nf.format(shown.length)} of ${nf.format(all.length)} potions${all.length - shown.length && !q ? ` (the others have no size traded ${minVol}+ times last hour)` : ""}. Size prices are what a potion sells for at your price mode; "/ dose" is that after the 2% GE tax (none under 50 coins), split over its doses. Green is the best size to sell as, orange the cheapest size per dose to buy. Profit per 4 hours: buy the "buy as" size, decant at Bob Barter and sell as the "sell as" size, after tax. The buy limit resets every 4 hours, so that's the window. You buy at most one buy limit, and no more than ${Math.round(share * 100)}% (your share) of what trades of the "buy as" size in 4 hours, and you sell no more doses than ${Math.round(share * 100)}% of the "sell as" size's 4-hour trades. Whichever is lowest is shown under the profit. Trades per hour are last hour's, buys and sells together. When both are the same size it's a plain flip without decanting. Only sizes traded at least ${minVol} times last hour count (greyed out otherwise): a good price on a size nobody trades may not fill. A size whose price per dose is under half or over double the other sizes' is a stray trade and marked "odd price". Bronzeman: you can only buy items the group has unlocked.`;
  }

  function render() {
    if (!prices.ready()) { el.innerHTML = ""; built = false; return; }
    if (!built) shell();
    rows();
  }

  el.addEventListener("input", e => {
    if (e.target.id === "pd-q") { state.q = e.target.value; save(); rows(); }
  });
  el.addEventListener("change", e => {
    if (e.target.id === "pd-sort") { state.sort = e.target.value; save(); rows(); }
    if (e.target.id === "pd-share") { state.share = Math.min(100, Math.max(1, Math.round(Number(e.target.value) || 25))); save(); rows(); }
    if (e.target.id === "pd-min") { state.minVol = Math.max(0, Math.round(Number(e.target.value) || 0)); save(); rows(); }
  });

  return { el, update() { render(); } };
}
