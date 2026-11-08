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

/** Live numbers for one potion: per size the sell and buy price per dose, the best size to sell and to buy. */
function numbers(p, minVol) {
  const sizes = DOSES.map(d => {
    const id = p.ids[d], it = prices.item(id);
    const sell = prices.price(id, "sell").p, buy = prices.price(id, "buy").p;
    const net = sell == null ? null : sell - geTax(Math.floor(sell));
    return { d, id, name: it.name, vol: it.vol, limit: it.limit,
      sellDose: net == null ? null : net / d, buyDose: buy == null ? null : buy / d };
  });
  // Only sizes that trade enough count as best: a high price on a size nobody trades may never fill.
  const priced = sizes.filter(s => s.sellDose != null && s.vol >= minVol);
  const best = priced.sort((a, b) => b.sellDose - a.sellDose)[0] || null;
  const cheap = sizes.filter(s => s.buyDose != null && s.vol >= minVol).sort((a, b) => a.buyDose - b.buyDose)[0] || null;
  const four = sizes[3];
  // What selling the best size earns on top of selling as (4), per 4 doses.
  const gain = best && four.sellDose != null ? (best.sellDose - four.sellDose) * 4 : null;
  // Decant flip: buy the cheapest size per dose, decant, sell the best size. Per 4 doses.
  const flip = best && cheap && cheap.d !== best.d ? (best.sellDose - cheap.buyDose) * 4 : null;
  const vol = sizes.reduce((s, x) => s + x.vol, 0);
  return { sizes, best, cheap, four, gain, flip, vol };
}

const SORTS = {
  name: { label: "Name", fn: (a, b) => a.p.name.localeCompare(b.p.name) },
  value: { label: "Value per 4 doses", fn: (a, b) => (b.n.best?.sellDose ?? -1) - (a.n.best?.sellDose ?? -1) },
  gain: { label: "Gain vs selling (4)", fn: (a, b) => (b.n.gain ?? -1e9) - (a.n.gain ?? -1e9) },
  flip: { label: "Decant flip profit", fn: (a, b) => (b.n.flip ?? -1e9) - (a.n.flip ?? -1e9) },
  vol: { label: "Traded last hour", fn: (a, b) => b.n.vol - a.n.vol }
};

export function createPotionDoses() {
  const el = document.createElement("section");
  el.className = "section potions";
  const state = Object.assign({ q: "", sort: "gain", minVol: 10 }, store.get("potionDoses", {}));
  const save = () => store.set("potionDoses", state);
  let built = false;

  function shell() {
    el.innerHTML = `
      <div class="sechead"><h2 class="pagetitle small">Potions: which dose to sell</h2></div>
      <p class="lead">Every potion sells for a different price per dose as (1), (2), (3) or (4). Bob Barter in the Grand Exchange decants potions for free, so you can turn your doses into whichever size pays the most before you sell. This table shows the live price per dose of each size after GE tax, and the best one.</p>
      <div class="toolbar">
        <div class="field grow"><label for="pd-q">Find a potion</label>
          <input id="pd-q" type="search" placeholder="e.g. prayer, super restore" value="${esc(state.q)}"></div>
        <div class="field"><label for="pd-sort">Sort by</label>
          <select id="pd-sort">${Object.entries(SORTS).map(([k, s]) => `<option value="${k}"${k === state.sort ? " selected" : ""}>${esc(s.label)}</option>`).join("")}</select></div>
        <div class="field"><label for="pd-min">Min. traded per size</label>
          <input id="pd-min" type="number" min="0" step="5" inputmode="numeric" value="${state.minVol}"></div>
      </div>
      <div class="board"><table>
        <thead><tr><th>Potion</th>${DOSES.map(d => `<th class="r${d === 1 || d === 3 ? " simple-hide" : ""}">(${d}) ${ui.t("/ dose", "per dose")}</th>`).join("")}<th>${ui.t("Sell as", "Best to sell as")}</th><th class="r">${ui.t("4 doses", "4 doses bring in")}</th><th class="r">${ui.t("Gain vs (4)", "More than selling (4)")}</th><th class="r simple-hide">Decant flip / 4 doses</th></tr></thead>
        <tbody data-f="pd-rows"></tbody>
      </table></div>
      <p class="fine" data-f="pd-note"></p>`;
    built = true;
  }

  function rows() {
    const q = state.q.trim().toLowerCase();
    const minVol = Math.max(0, Number(state.minVol) || 0);
    const all = potions().map(p => ({ p, n: numbers(p, minVol) }));
    const shown = all.filter(r => (!q || r.p.name.toLowerCase().includes(q)) && r.n.best)
      .sort(SORTS[state.sort]?.fn || SORTS.gain.fn);
    el.querySelector('[data-f="pd-rows"]').innerHTML = shown.length ? shown.map(({ p, n }) => {
      const cells = n.sizes.map(s => `<td class="r num${s.vol < minVol ? " muted" : ""}${s.d === 1 || s.d === 3 ? " simple-hide" : ""}${s === n.best ? " pos" : ""}">${s === n.best ? "<b>" : ""}${gp(s.sellDose)}${s === n.best ? "</b>" : ""}${
        ui.simple() ? "" : `<div class="sub2">${s.vol ? `${nf.format(s.vol)} traded` : "not traded"}</div>`}</td>`).join("");
      const flipLocked = n.cheap && unlocks.has(n.cheap.id) === false;
      const flip = n.flip == null ? "–" : `${signed(n.flip, gp)}<div class="sub2">buy (${n.cheap.d}), sell (${n.best.d})${flipLocked ? ` <span class="pill bad">(${n.cheap.d}) locked</span>` : ""}</div>`;
      return `<tr>
        <td>${esc(p.name)}${ui.simple() ? "" : `<div class="sub2">${short(n.vol)} traded last hour</div>`}</td>
        ${cells}
        <td><b>(${n.best.d})</b>${n.best.d === 4 ? "" : ` <span class="pill good">decant</span>`}</td>
        <td class="r num">${gp(n.best.sellDose * 4)}</td>
        <td class="r num ${cls(n.gain)}">${n.gain ? signed(n.gain, gp) : "–"}</td>
        <td class="r num simple-hide ${cls(n.flip)}">${flip}</td>
      </tr>`;
    }).join("") : `<tr><td colspan="9">No potions match.</td></tr>`;
    el.querySelector('[data-f="pd-note"]').innerHTML = `${nf.format(shown.length)} of ${nf.format(all.length)} potions${all.length - shown.length && !q ? ` (the others have no size traded ${minVol}+ times last hour)` : ""}. Prices per dose are what you get after the 2% GE tax (none under 50 coins), at your price mode. "4 doses" is what one (4) worth of doses brings in when sold as the best size; "Gain vs (4)" is how much more that is than selling them as (4). Decant flip: buy the size with the cheapest price per dose, decant at Bob Barter and sell as the best size, per 4 doses after tax. Only sizes traded at least ${minVol} times last hour count as best or cheapest (greyed out otherwise): a high price on a size nobody trades may not fill. Set it to 0 to count every size. Bronzeman: you can only buy items the group has unlocked.`;
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
