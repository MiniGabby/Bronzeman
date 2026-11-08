// Potion doses (Herblore training page): for every potion that comes in (1) to (4) doses, the live
// price per dose of each size after GE tax, which size sells best, and what a decant flip earns.
// Decanting is free at Bob Barter in the Grand Exchange, so doses can be moved between sizes at no cost.
// The potion list comes from the price API's item list: every name that exists as (1), (2), (3) and (4).
import * as prices from "../core/prices.js";
import * as unlocks from "../core/unlocks.js";
import { store } from "../core/store.js";
import { esc, gp, short, signed, cls, nf, geTax } from "../core/format.js";
import * as ui from "../core/ui.js";

const DOSES = [1, 2, 3, 4];
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
function numbers(p, minVol) {
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
  const perLimit = perPotion == null || !cheap.limit ? null : perPotion * cheap.limit;
  const vol = sizes.reduce((s, x) => s + x.vol, 0);
  return { sizes, best, cheap, perDose, perPotion, perLimit, vol };
}

const SORTS = {
  limit: { label: "Profit per GE limit", fn: (a, b) => (b.n.perLimit ?? -1e12) - (a.n.perLimit ?? -1e12) },
  dose: { label: "Margin per dose", fn: (a, b) => (b.n.perDose ?? -1e12) - (a.n.perDose ?? -1e12) },
  vol: { label: "Traded last hour", fn: (a, b) => b.n.vol - a.n.vol },
  name: { label: "Name", fn: (a, b) => a.p.name.localeCompare(b.p.name) }
};

export function createPotionDoses() {
  const el = document.createElement("section");
  el.className = "section potions";
  const state = Object.assign({ q: "", sort: "limit", minVol: 10 }, store.get("potionDoses", {}));
  if (!SORTS[state.sort]) state.sort = "limit";
  const save = () => store.set("potionDoses", state);
  let built = false;

  function shell() {
    el.innerHTML = `
      <div class="sechead"><h2 class="pagetitle small">Potions: which dose to buy and sell</h2></div>
      <p class="lead">Every potion has a different price per dose as (1), (2), (3) or (4). Bob Barter in the Grand Exchange decants potions for free, so you can buy the size that's cheapest per dose and sell the size that pays the most per dose. This table shows each size's live price and price per dose, the best size to sell and to buy as, and the margin for one GE buy limit.</p>
      <div class="toolbar">
        <div class="field grow"><label for="pd-q">Find a potion</label>
          <input id="pd-q" type="search" placeholder="e.g. prayer, super restore" value="${esc(state.q)}"></div>
        <div class="field"><label for="pd-sort">Sort by</label>
          <select id="pd-sort">${Object.entries(SORTS).map(([k, s]) => `<option value="${k}"${k === state.sort ? " selected" : ""}>${esc(s.label)}</option>`).join("")}</select></div>
        <div class="field"><label for="pd-min">Min. traded per size</label>
          <input id="pd-min" type="number" min="0" step="5" inputmode="numeric" value="${state.minVol}"></div>
      </div>
      <div class="board"><table>
        <thead><tr><th>Potion</th>${DOSES.map(d => `<th class="r">(${d})${d > 1 ? ` <span class="sub2">${ui.t("/ dose", "per dose")}</span>` : ""}</th>`).join("")}<th>${ui.t("Sell as", "Best to sell as")}</th><th>${ui.t("Buy as", "Best to buy as")}</th><th class="r">${ui.t("Margin / GE limit", "Profit per buy limit")}</th></tr></thead>
        <tbody data-f="pd-rows"></tbody>
      </table></div>
      <p class="fine" data-f="pd-note"></p>`;
    built = true;
  }

  function rows() {
    const q = state.q.trim().toLowerCase();
    const minVol = Math.max(0, Number(state.minVol) || 0);
    const all = potions().map(p => ({ p, n: numbers(p, minVol) }));
    const shown = all.filter(r => (!q || r.p.name.toLowerCase().includes(q)) && r.n.best && r.n.cheap)
      .sort(SORTS[state.sort].fn);
    el.querySelector('[data-f="pd-rows"]').innerHTML = shown.length ? shown.map(({ p, n }) => {
      const cells = n.sizes.map(s => {
        const mark = s === n.best ? " pos" : s === n.cheap ? " buyas" : "";
        return `<td class="r num${s.ok ? mark : " muted"}">${gp(s.sell)}${
          s.d > 1 ? `<div class="sub2">${gp(s.sellDose)} / dose</div>` : ""}${
          s.odd ? `<div class="sub2">odd price</div>` : ui.simple() ? "" : `<div class="sub2">${s.vol ? `${nf.format(s.vol)} traded` : "not traded"}</div>`}</td>`;
      }).join("");
      const locked = unlocks.has(n.cheap.id) === false;
      return `<tr>
        <td>${esc(p.name)}${ui.simple() ? "" : `<div class="sub2">${short(n.vol)} traded last hour</div>`}</td>
        ${cells}
        <td><b>(${n.best.d})</b><div class="sub2">${gp(n.best.sellDose)} / dose</div></td>
        <td><b>(${n.cheap.d})</b>${locked ? ` <span class="pill bad">Locked</span>` : ""}<div class="sub2">${gp(n.cheap.buyDose)} / dose</div></td>
        <td class="r num ${cls(n.perLimit ?? n.perDose)}">${n.perLimit == null ? "–" : signed(n.perLimit)}<div class="sub2">${signed(n.perPotion, gp)} per (${n.cheap.d}) · limit ${n.cheap.limit ? nf.format(n.cheap.limit) : "?"}</div></td>
      </tr>`;
    }).join("") : `<tr><td colspan="8">No potions match.</td></tr>`;
    el.querySelector('[data-f="pd-note"]').innerHTML = `${nf.format(shown.length)} of ${nf.format(all.length)} potions${all.length - shown.length && !q ? ` (the others have no size traded ${minVol}+ times last hour)` : ""}. Size prices are what a potion sells for at your price mode; "/ dose" is that after the 2% GE tax (none under 50 coins), split over its doses. Green is the best size to sell as, orange the cheapest size per dose to buy. Margin: buy one GE buy limit (every 4 hours) of the "buy as" size, decant at Bob Barter and sell as the "sell as" size, after tax. When both are the same size it's a plain flip without decanting. Only sizes traded at least ${minVol} times last hour count (greyed out otherwise): a good price on a size nobody trades may not fill. A size whose price per dose is under half or over double the other sizes' is a stray trade and marked "odd price". Bronzeman: you can only buy items the group has unlocked.`;
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
    if (e.target.id === "pd-min") { state.minVol = Math.max(0, Math.round(Number(e.target.value) || 0)); save(); rows(); }
  });

  return { el, update() { render(); } };
}
