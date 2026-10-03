// Merching page: which unlocked items to buy at what time and price, and when to sell them.
// Combines the normal buy/sell spread with each item's daily price pattern (core/history.js).
import * as prices from "../core/prices.js";
import * as unlocks from "../core/unlocks.js";
import * as history from "../core/history.js";
import { store } from "../core/store.js";
import { esc, gp, short, signed, cls, nf, geTax } from "../core/format.js";
import { detailHTML, bindCharts } from "../components/priceDetail.js";
import { CANDIDATES, plans as flipPlans } from "../core/flips.js";

export const title = "Merching";

const SHOWN = 25;

export function mount(root) {
  const opts = Object.assign({ cash: 1_000_000, minVol: 100, minRel: "all", when: "any" }, store.get("merch", {}));
  // Minimum share of days a pattern held: Reliable ≥ 75%, Usually ≥ 60% (see history.reliability).
  const REL_MIN = { all: 0, usually: 0.6, reliable: 0.75 };
  const save = () => store.set("merch", opts);

  root.innerHTML = `
    <p class="lead">Merching (flipping) means buying items with low buy offers and selling them with high sell offers. Many items also follow a daily rhythm: cheaper at some hours, more expensive at others. This page combines both, using the last 3 weeks of hourly prices, and only lists items the group has unlocked, because in bronzeman you can only buy those. Times are in your time zone.</p>
    <div class="toolbar">
      <div class="field"><label for="m-cash">Cash per account</label>
        <input id="m-cash" type="number" min="10000" step="100000" inputmode="numeric"></div>
      <div class="field"><label for="m-vol">Min. traded per hour</label>
        <input id="m-vol" type="number" min="0" step="50" inputmode="numeric"></div>
      <div class="field"><label for="m-when">When</label>
        <select id="m-when">
          <option value="any">Any time</option>
          <option value="now">Cheap to buy right now</option>
        </select></div>
      <div class="field"><label for="m-rel">Pattern</label>
        <select id="m-rel">
          <option value="all">All (incl. weak)</option>
          <option value="usually">Usually or reliable</option>
          <option value="reliable">Reliable only</option>
        </select></div>
      <div class="presets">
        <button type="button" data-cash="250000">250K</button>
        <button type="button" data-cash="1000000">1M</button>
        <button type="button" data-cash="5000000">5M</button>
        <button type="button" data-cash="20000000">20M</button>
      </div>
      <div class="goal" data-f="status"></div>
    </div>
    <div data-f="mine"></div>
    <div data-f="list"></div>
    <section class="section guide">
      <h2 class="pagetitle small">How to merch with this list</h2>
      <ol>
        <li><b>Check the margin first.</b> Buy 1 of the item at a high price (it buys instantly) and sell it at a low price (it sells instantly). What you actually paid and got is the real margin right now. If it's much smaller than the list says, skip the item.</li>
        <li><b>"Buy now"</b> means the item is in the cheapest part of its day right now (the cheapest quarter of its daily price range); set <i>When</i> to "Cheap to buy right now" to see only those.</li>
        <li><b>Buy around the "Buy" time</b> with a buy offer at the "Buy at" price. Offers at a low price only fill when someone sells into them, so give it up to an hour or two. Don't raise the price to chase it.</li>
        <li><b>Sell around the "Sell" time</b> with a sell offer at the "Sell at" price. "+1 day" means the sell time comes after the next midnight.</li>
        <li><b>Track what you bought.</b> Open an item and fill in "Bought some?": it shows up under My flips with your profit, and turns green (and can send a notification) when your sell price is reached.</li>
        <li><b>Mind the buy limit.</b> It counts per account and resets 4 hours after your first purchase. Every group member has their own limit, so the same item can be flipped on each account.</li>
        <li><b>Tax is already counted:</b> 2% of the sell price for items of 50 gp and up, at most 5M per item.</li>
        <li><b>Spread your cash</b> over a few items instead of one. The patterns are averages: a game update (usually on Wednesdays), news or a big player can break them. "Reliable" means the pattern held on at least 3 out of 4 days, "Usually" on at least 6 out of 10; anything less is "Weak". "17/21 days" means it held on 17 of the 21 days that had enough trades at that hour. A flip counts as only as reliable as its weaker side (buy or sell), and the Pattern filter uses that.</li>
        <li><b>Watch "Traded / hr".</b> If you want to buy more than trades in an hour, expect slow fills or a moving price.</li>
      </ol>
      <p class="fine">How the numbers work: for each item, every hourly price is compared with that day's average, and the typical value per hour of the day gives the pattern. "Buy at" is the last 24 hours' average buy-offer price times the cheapest hour's factor; "Sell at" is the average sell-offer price times the most expensive hour's factor. Candidates are the unlocked items with the best current spread for your cash; only the ${CANDIDATES} best are checked against their history. Hours with very few trades are ignored, and items whose buy and sell prices are usually more than 30% apart are skipped: that gap comes from a handful of odd trades, not a market you can flip in bulk.</p>
    </section>`;

  const $ = s => root.querySelector(s);
  const cashIn = $("#m-cash"), volIn = $("#m-vol");
  const relSel = $("#m-rel");
  cashIn.value = opts.cash; volIn.value = opts.minVol; relSel.value = opts.minRel in REL_MIN ? opts.minRel : "all";
  relSel.addEventListener("change", () => { opts.minRel = relSel.value; save(); render(); });
  const whenSel = $("#m-when");
  whenSel.value = opts.when === "now" ? "now" : "any";
  whenSel.addEventListener("change", () => { opts.when = whenSel.value; save(); render(); });
  // The cheap window moves with the clock: redraw at the start of every hour.
  let hourTimer = null;
  const scheduleHour = () => { const n = new Date(); hourTimer = setTimeout(() => { render(); scheduleHour(); }, (60 - n.getMinutes()) * 60_000 - n.getSeconds() * 1000 + 1000); };
  scheduleHour();
  cashIn.addEventListener("input", () => { opts.cash = Math.max(0, Number(cashIn.value) || 0); save(); render(); });
  volIn.addEventListener("input", () => { opts.minVol = Math.max(0, Number(volIn.value) || 0); save(); render(); });
  root.querySelectorAll("[data-cash]").forEach(b => b.addEventListener("click", () => {
    cashIn.value = b.dataset.cash; opts.cash = Number(b.dataset.cash); save(); render();
  }));

  // Price on top (what to type in the GE), time and reliability underneath.
  function cell(hour, price, ratios, rel, hit, what, extra = "", hitDays, days) {
    const r = history.reliability(hit);
    return `<div class="timingrow">${history.sparkline(ratios, hour, what)}
      <div><span class="tprice num">${gp(price)} <small>gp</small></span>
      <div class="sub2">around <b class="num">${history.hourLabel(hour)}</b>${extra}<br><span class="pill ${r.pill}" title="${rel} on ${hitDays} of ${days} days">${r.label}</span> <span class="num">${hitDays}/${days} days</span></div></div></div>`;
  }

  function render() {
    if (prices.ready()) renderMine();
    if (!prices.ready() || !unlocks.loaded()) {
      $('[data-f="list"]').innerHTML = `<p class="muted">Loading prices and unlocked items…</p>`;
      return;
    }
    const plans = flipPlans(opts);
    const done = plans.filter(p => p.t !== undefined).length;
    const minHit = REL_MIN[opts.minRel] ?? 0;
    const profitable = plans.filter(p => !p.thin && p.each > 0);
    const thin = plans.filter(p => p.thin).length;
    const now = new Date();
    for (const p of profitable) p.until = history.cheapNow(p.t, now);   // hour the cheap window ends, or null
    const reliableEnough = profitable.filter(p => Math.min(p.t.buyHit, p.t.sellHit) >= minHit);
    const good = reliableEnough.filter(p => opts.when !== "now" || p.until != null)
      .sort((a, b) => b.total - a.total).slice(0, SHOWN);
    const weakHidden = profitable.length - reliableEnough.length;
    const notNow = opts.when === "now" ? reliableEnough.length - reliableEnough.filter(p => p.until != null).length : 0;
    $('[data-f="status"]').innerHTML = done < plans.length
      ? `Checking price history: ${done} of ${plans.length} items…`
      : `${good.length} profitable flips out of ${plans.length} items checked${weakHidden ? ` · ${weakHidden} hidden by the pattern filter` : ""}${notNow ? ` · ${notNow} not cheap right now (${history.hourLabel(now.getHours())})` : ""}${thin ? ` · ${thin} skipped: too few trades` : ""}`;

    if (!good.length) {
      $('[data-f="list"]').innerHTML = `<p class="muted">${done < plans.length ? "Loading…" : opts.when === "now" ? `No item is in its cheap part of the day right now (${history.hourLabel(new Date().getHours())}). Try again later, or set When to "Any time".` : "No profitable flips with these settings. Try more cash, a lower minimum volume or a looser pattern filter."}</p>`;
      return;
    }
    const totalTop = good.slice(0, 4).reduce((a, p) => a + p.total, 0);
    $('[data-f="list"]').innerHTML = `
      <div class="stats">
        <div class="stat"><span class="label">Best flip per buy limit</span><span class="big num pos">${signed(good[0].total)}</span><span class="muted">${esc(good[0].it.name)}: ${nf.format(good[0].qty)} × ${gp(good[0].each)} gp</span></div>
        <div class="stat"><span class="label">Top 4 together</span><span class="big num pos">${signed(totalTop)}</span><span class="muted">per account per 4 hours, if every offer fills (needs ${short(good.slice(0, 4).reduce((a, p) => a + p.qty * p.buy, 0))} cash)</span></div>
      </div>
      <div class="board"><table>
        <thead><tr><th>Item</th><th>Buy offer</th><th>Sell offer</th><th class="r">Profit / item</th><th class="r">Per buy limit</th><th class="r">Traded / hr</th></tr></thead>
        <tbody>${good.map(p => `<tr>
          <td><button type="button" class="itembtn" data-detail="${p.it.id}" aria-expanded="${open.has(p.it.id)}">${esc(p.it.name)} <span class="caret">${open.has(p.it.id) ? "▾" : "▸"}</span></button></td>
          <td class="timing wrapcell">${cell(p.t.buyHour, p.buy, p.t.low, "Below the day's average", p.t.buyHit, "buy offer price", "", p.t.buyHitDays, p.t.buyDays)}${p.until != null ? `<div class="sub2"><span class="pill good" title="The usual buy-offer price is in the cheapest quarter of the day right now">Buy now</span> until ${history.hourLabel(p.until)}</div>` : ""}</td>
          <td class="timing wrapcell">${cell(p.t.sellHour, p.sell, p.t.high, "Above the day's average", p.t.sellHit, "sell offer price", p.nextDay ? ` <span class="sub2">+1 day</span>` : "", p.t.sellHitDays, p.t.sellDays)}</td>
          <td class="r num ${cls(p.each)}">${signed(p.each, gp)}<div class="sub2" title="Spread in the last hour, without waiting for a better time">now ${signed(p.nowMargin, gp)}</div></td>
          <td class="r num ${cls(p.total)}">${signed(p.total)}<div class="sub2">${nf.format(p.qty)} of ${nf.format(p.it.limit)}</div></td>
          <td class="r num">${gp(p.it.vol)}${p.qty > p.it.vol ? `<div><span class="pill warn" title="You'd buy more than trades in an hour">Slow</span></div>` : ""}</td>
        </tr>${open.has(p.it.id) ? `<tr class="detailrow"><td colspan="6">${detail(p)}</td></tr>` : ""}`).join("")}</tbody>
      </table></div>
      <p class="fine">Profit per item is after tax. "Now" under it is the spread in the last hour (sell-offer price minus tax minus buy-offer price), without waiting for a better hour. "Per buy limit" is the profit on the amount your cash and the buy limit allow per 4 hours (shown under it, out of the limit). Click an item for its prices over the last weeks and through a typical day.</p>`;
    bindCharts(root);
    root.querySelectorAll("details[data-tbl]").forEach(d => {
      if (tablesOpen.has(d.dataset.tbl)) d.open = true;
      d.addEventListener("toggle", () => { d.open ? tablesOpen.add(d.dataset.tbl) : tablesOpen.delete(d.dataset.tbl); });
    });
  }

  // Item details (click a name): open items, and their hourly rows once loaded.
  const open = new Set(), tablesOpen = new Set();
  function detail(p) {
    const rows = history.seriesLoaded(p.it.id);
    if (!rows) {
      history.series(p.it.id).then(render, () => {});
      return `<p class="muted">Loading price history…</p>`;
    }
    return (rows.length ? detailHTML(p.it, p.t, p, rows) : `<p class="muted">No price history for this item.</p>`) + trackForm(p);
  }

  // ---- My flips: items you bought, with a target sell price. Kept in this browser only. ----
  const flips = store.get("flips", []);
  const saveFlips = () => store.set("flips", flips);
  const notifyOn = () => typeof Notification !== "undefined" && Notification.permission === "granted";

  function trackForm(p) {
    const has = flips.some(f => f.id === p.it.id);
    return `<form class="trackform" data-track="${p.it.id}">
      <b>${has ? "You're tracking this item (see My flips above)." : "Bought some? Track it and the site tells you when your sell price is reached."}</b>
      <div class="field"><label>Amount</label><input name="qty" type="number" min="1" value="${p.qty}" inputmode="numeric"></div>
      <div class="field"><label>Paid each</label><input name="paid" type="number" min="1" value="${p.buy}" inputmode="numeric"></div>
      <div class="field"><label>Sell at</label><input name="target" type="number" min="1" value="${p.sell}" inputmode="numeric"></div>
      <button type="submit" class="btn primary">${has ? "Update" : "Track"}</button>
    </form>`;
  }

  // What a sell offer fills at right now: the instant-buy price (what buyers pay).
  const sellNow = id => prices.item(id).high;

  function renderMine() {
    const host = $('[data-f="mine"]');
    if (!flips.length) { host.innerHTML = ""; return; }
    let alerted = false;
    const rows = flips.map(f => {
      const now = sellNow(f.id);
      const reached = now != null && now >= f.target;
      if (reached && !f.notified) {
        f.notified = true; alerted = true;
        if (notifyOn()) new Notification(`${f.name}: sell price reached`, { body: `Selling at about ${gp(now)} gp now (your target ${gp(f.target)}).` });
      }
      if (!reached && f.notified && now != null && now < f.target) f.notified = false;   // fell back: alert again next time
      const profit = (price) => (price - geTax(price) - f.paid) * f.qty;
      return `<tr class="${reached ? "here" : ""}">
        <td>${esc(f.name)}</td>
        <td class="r num">${nf.format(f.qty)} × ${gp(f.paid)}</td>
        <td class="r num">${gp(f.target)}<div class="sub2">${signed(profit(f.target))} after tax</div></td>
        <td class="r num">${gp(now)}<div class="sub2">${now == null ? "" : `${signed(profit(now))} if sold now`}</div></td>
        <td>${now == null ? "–" : reached ? `<span class="pill good">Sell now</span>` : `<span class="muted">${(((f.target - now) / now) * 100).toFixed(1)}% to go</span>`}</td>
        <td class="r"><button type="button" class="linkbtn" data-untrack="${f.id}">Remove</button></td>
      </tr>`;
    }).join("");
    if (alerted) saveFlips();
    host.innerHTML = `<section class="section mine">
      <div class="sechead"><h2 class="pagetitle small">My flips</h2>
        ${typeof Notification === "undefined" ? "" : notifyOn() ? `<span class="muted">Notifications on</span>` : `<button type="button" class="btn" data-notify>Notify me when a target is reached</button>`}</div>
      <div class="board"><table>
        <thead><tr><th>Item</th><th class="r">Bought</th><th class="r">Sell at</th><th class="r">Sell offer now</th><th>Status</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
      <p class="fine">Saved in this browser only. "Sell offer now" is the latest instant-buy price: roughly what a sell offer fills at. Notifications only work while the Merching tab is open.</p>
    </section>`;
  }

  root.addEventListener("submit", e => {
    const f = e.target.closest("[data-track]");
    if (!f) return;
    e.preventDefault();
    const id = Number(f.dataset.track), v = k => Math.max(1, Math.round(Number(f.elements[k].value) || 0));
    const entry = { id, name: prices.item(id).name, qty: v("qty"), paid: v("paid"), target: v("target"), at: Date.now(), notified: false };
    const i = flips.findIndex(x => x.id === id);
    i >= 0 ? (flips[i] = entry) : flips.unshift(entry);
    saveFlips(); render();
  });
  root.addEventListener("click", e => {
    const u = e.target.closest("[data-untrack]");
    if (u) { const i = flips.findIndex(x => x.id === Number(u.dataset.untrack)); if (i >= 0) flips.splice(i, 1); saveFlips(); render(); return; }
    if (e.target.closest("[data-notify]")) Notification.requestPermission().then(render);
  });
  $('[data-f="list"]').addEventListener("click", e => {
    const b = e.target.closest("[data-detail]");
    if (!b) return;
    const id = Number(b.dataset.detail);
    open.has(id) ? open.delete(id) : open.add(id);
    render();
  });
  // Keep the panels steady while the mouse is over a chart: skip background redraws then.
  let hovering = false;
  $('[data-f="list"]').addEventListener("pointerover", e => { hovering = !!e.target.closest(".pdetail"); });
  $('[data-f="list"]').addEventListener("pointerleave", () => { hovering = false; });
  const redraw = () => { if (!hovering) render(); };

  const offs = [prices.onChange(redraw), unlocks.onChange(redraw), history.onChange(redraw)];
  render();
  return () => { offs.forEach(off => off()); clearTimeout(hourTimer); };
}
