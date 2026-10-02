// Merching page: which unlocked items to buy at what time and price, and when to sell them.
// Combines the normal buy/sell spread with each item's daily price pattern (core/history.js).
import * as prices from "../core/prices.js";
import * as unlocks from "../core/unlocks.js";
import * as history from "../core/history.js";
import { store } from "../core/store.js";
import { esc, gp, short, signed, cls, nf, geTax } from "../core/format.js";

export const title = "Merching";

const CANDIDATES = 40;   // items whose price history we fetch
const SHOWN = 25;

export function mount(root) {
  const opts = Object.assign({ cash: 1_000_000, minVol: 100, minRel: "all" }, store.get("merch", {}));
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
    <div data-f="list"></div>
    <section class="section guide">
      <h2 class="pagetitle small">How to merch with this list</h2>
      <ol>
        <li><b>Check the margin first.</b> Buy 1 of the item at a high price (it buys instantly) and sell it at a low price (it sells instantly). What you actually paid and got is the real margin right now. If it's much smaller than the list says, skip the item.</li>
        <li><b>Buy around the "Buy" time</b> with a buy offer at the "Buy at" price. Offers at a low price only fill when someone sells into them, so give it up to an hour or two. Don't raise the price to chase it.</li>
        <li><b>Sell around the "Sell" time</b> with a sell offer at the "Sell at" price. "+1 day" means the sell time comes after the next midnight.</li>
        <li><b>Mind the buy limit.</b> It counts per account and resets 4 hours after your first purchase. Every group member has their own limit, so the same item can be flipped on each account.</li>
        <li><b>Tax is already counted:</b> 2% of the sell price for items of 50 gp and up, at most 5M per item.</li>
        <li><b>Spread your cash</b> over a few items instead of one. The patterns are averages: a game update (usually on Wednesdays), news or a big player can break them. "Reliable" means the pattern held on at least 3 out of 4 days, "Usually" on at least 6 out of 10; anything less is "Weak". A flip counts as only as reliable as its weaker side (buy or sell), and the Pattern filter uses that.</li>
        <li><b>Watch "Traded / hr".</b> If you want to buy more than trades in an hour, expect slow fills or a moving price.</li>
      </ol>
      <p class="fine">How the numbers work: for each item, every hourly price is compared with that day's average, and the typical value per hour of the day gives the pattern. "Buy at" is the last 24 hours' average buy-offer price times the cheapest hour's factor; "Sell at" is the average sell-offer price times the most expensive hour's factor. Candidates are the unlocked items with the best current spread for your cash; only the ${CANDIDATES} best are checked against their history.</p>
    </section>`;

  const $ = s => root.querySelector(s);
  const cashIn = $("#m-cash"), volIn = $("#m-vol");
  const relSel = $("#m-rel");
  cashIn.value = opts.cash; volIn.value = opts.minVol; relSel.value = opts.minRel in REL_MIN ? opts.minRel : "all";
  relSel.addEventListener("change", () => { opts.minRel = relSel.value; save(); render(); });
  cashIn.addEventListener("input", () => { opts.cash = Math.max(0, Number(cashIn.value) || 0); save(); render(); });
  volIn.addEventListener("input", () => { opts.minVol = Math.max(0, Number(volIn.value) || 0); save(); render(); });
  root.querySelectorAll("[data-cash]").forEach(b => b.addEventListener("click", () => {
    cashIn.value = b.dataset.cash; opts.cash = Number(b.dataset.cash); save(); render();
  }));

  // Unlocked items with a usable spread right now, best first.
  function candidates() {
    return (unlocks.data().items || []).map(u => prices.item(u.id))
      .filter(it => it.limit && it.high > 0 && it.low > 0 && it.vol >= opts.minVol && it.low <= opts.cash)
      .map(it => {
        const qty = Math.min(it.limit, Math.floor(opts.cash / it.low));
        const margin = it.high - geTax(it.high) - it.low;
        return { it, score: qty * Math.max(margin, it.low * 0.005) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, CANDIDATES)
      .map(c => c.it);
  }

  function plan(it) {
    const t = history.get(it.id);
    if (!t || !t.lowAvg || !t.highAvg) return { it, t };
    const buy = Math.floor(t.lowAvg * t.low[t.buyHour]);
    const sell = Math.ceil(t.highAvg * t.high[t.sellHour]);
    const each = sell - geTax(sell) - buy;
    const qty = Math.min(it.limit, Math.floor(opts.cash / buy));
    return { it, t, buy, sell, each, qty, total: each * qty, nextDay: t.sellHour <= t.buyHour, nowMargin: it.high - geTax(it.high) - it.low };
  }

  // Price on top (what to type in the GE), time and reliability underneath.
  function cell(hour, price, ratios, rel, hit, what, extra = "") {
    const r = history.reliability(hit);
    return `<div class="timingrow">${history.sparkline(ratios, hour, what)}
      <div><span class="tprice num">${gp(price)} <small>gp</small></span>
      <div class="sub2">around <b class="num">${history.hourLabel(hour)}</b>${extra}<br><span class="pill ${r.pill}" title="${rel} on ${Math.round(hit * 100)}% of days">${r.label}</span></div></div></div>`;
  }

  function render() {
    if (!prices.ready() || !unlocks.loaded()) {
      $('[data-f="list"]').innerHTML = `<p class="muted">Loading prices and unlocked items…</p>`;
      return;
    }
    const cands = candidates();
    history.want(cands.map(it => it.id));
    const plans = cands.map(plan);
    const done = plans.filter(p => p.t !== undefined).length;
    const minHit = REL_MIN[opts.minRel] ?? 0;
    const profitable = plans.filter(p => p.each > 0);
    const good = profitable.filter(p => Math.min(p.t.buyHit, p.t.sellHit) >= minHit)
      .sort((a, b) => b.total - a.total).slice(0, SHOWN);
    const weakHidden = profitable.length - profitable.filter(p => Math.min(p.t.buyHit, p.t.sellHit) >= minHit).length;
    $('[data-f="status"]').innerHTML = done < plans.length
      ? `Checking price history: ${done} of ${plans.length} items…`
      : `${good.length} profitable flips out of ${plans.length} items checked${weakHidden ? ` · ${weakHidden} hidden by the pattern filter` : ""}`;

    if (!good.length) {
      $('[data-f="list"]').innerHTML = `<p class="muted">${done < plans.length ? "Loading…" : "No profitable flips with these settings. Try more cash, a lower minimum volume or a looser pattern filter."}</p>`;
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
          <td><a href="https://prices.runescape.wiki/osrs/item/${p.it.id}" target="_blank" rel="noopener">${esc(p.it.name)}</a></td>
          <td class="timing wrapcell">${cell(p.t.buyHour, p.buy, p.t.low, "Below the day's average", p.t.buyHit, "buy offer price")}</td>
          <td class="timing wrapcell">${cell(p.t.sellHour, p.sell, p.t.high, "Above the day's average", p.t.sellHit, "sell offer price", p.nextDay ? ` <span class="sub2">+1 day</span>` : "")}</td>
          <td class="r num ${cls(p.each)}">${signed(p.each, gp)}<div class="sub2" title="Spread in the last hour, without waiting for a better time">now ${signed(p.nowMargin, gp)}</div></td>
          <td class="r num ${cls(p.total)}">${signed(p.total)}<div class="sub2">${nf.format(p.qty)} of ${nf.format(p.it.limit)}</div></td>
          <td class="r num">${gp(p.it.vol)}${p.qty > p.it.vol ? `<div><span class="pill warn" title="You'd buy more than trades in an hour">Slow</span></div>` : ""}</td>
        </tr>`).join("")}</tbody>
      </table></div>
      <p class="fine">Profit per item is after tax. "Now" under it is the spread in the last hour (sell-offer price minus tax minus buy-offer price), without waiting for a better hour. "Per buy limit" is the profit on the amount your cash and the buy limit allow per 4 hours (shown under it, out of the limit).</p>`;
  }

  const offs = [prices.onChange(render), unlocks.onChange(render), history.onChange(render)];
  render();
  return () => offs.forEach(off => off());
}
