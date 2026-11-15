// "How the suggestions turned out" on the Merching page. Data: data/merch-predictions.json, written by
// .github/scripts/build-merch.mjs: once a day the flips the tab would suggest (default settings), and
// afterwards whether the buy and sell prices were really reached in those hours.
import { esc, gp, short, signed, cls, nf, geTax } from "../core/format.js";
import { hourLabel, reliability } from "../core/history.js";

const DAYS = 30;          // the summary counts the flips suggested in the last 30 days
const RECENT = 50;        // rows in the list of single flips

let data = null, loading = null;
function load() {
  return loading ||= fetch("data/merch-predictions.json", { cache: "no-cache" })
    .then(r => (r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))))
    .then(j => (data = j), () => (data = { predictions: [] }));
}

// Profit per item as it really went: offer didn't fill = nothing; bought and the sell price came = as
// promised; bought but the sell price never came = sold at the going price in the sell hour.
function real(p) {
  const c = p.checked;
  if (!c.bought) return 0;
  if (c.sold) return p.each;
  return c.sellReal - geTax(c.sellReal) - p.buy;
}

function summary(list) {
  const bought = list.filter(p => p.checked.bought);
  const promised = list.reduce((a, p) => a + p.each * p.qty, 0);
  const made = list.reduce((a, p) => a + real(p) * p.qty, 0);
  return {
    n: list.length, bought: bought.length, sold: bought.filter(p => p.checked.sold).length,
    both: bought.filter(p => p.checked.sold).length, promised, made,
    share: promised > 0 ? made / promised : null
  };
}
const pct = (a, b) => (b ? Math.round((a / b) * 100) + "%" : "–");
const day = t => new Date(t * 1000).toLocaleDateString(undefined, { day: "numeric", month: "short" });
const at = t => hourLabel(new Date(t * 1000).getHours());
const mark = (ok, title) => `<span class="pill ${ok ? "good" : "bad"}" title="${esc(title)}">${ok ? "✓" : "✗"}</span>`;

export function render(host, rerender) {
  if (!data) { load().then(rerender); host.innerHTML = ""; return; }
  const all = data.predictions || [];
  if (!all.length) { host.innerHTML = ""; return; }
  const since = Date.now() / 1000 - DAYS * 86400;
  const checked = all.filter(p => p.checked && !p.checked.noData);
  const recent = checked.filter(p => p.made >= since);
  const waiting = all.filter(p => !p.checked).length;
  const noData = all.filter(p => p.checked?.noData && p.made >= since).length;
  const head = `<div class="sechead"><h2 class="pagetitle small">How the suggestions turned out</h2></div>
    <p class="muted">Every day the site saves the flips this tab suggests (with 1M cash, at least 100 traded per hour, the top 25), and checks afterwards whether the buy and sell prices really came in those hours.</p>`;
  if (!recent.length) {
    host.innerHTML = `<section class="section">${head}<p class="muted">Nothing checked yet: ${nf.format(waiting)} suggestion${waiting === 1 ? " is" : "s are"} waiting for their sell time to pass. Check back tomorrow.</p></section>`;
    return;
  }
  const s = summary(recent);
  const groups = ["Reliable", "Usually", "Weak"].map(label => {
    const list = recent.filter(p => reliability(Math.min(p.buyHit, p.sellHit)).label === label);
    return { label, pill: reliability(label === "Reliable" ? 1 : label === "Usually" ? 0.6 : 0).pill, list, s: summary(list) };
  }).filter(g => g.list.length);

  const rows = [...checked].sort((a, b) => b.sellAt - a.sellAt || b.each * b.qty - a.each * a.qty).slice(0, RECENT).map(p => {
    const c = p.checked, r = real(p);
    return `<tr>
      <td>${esc(p.name)}<div class="sub2">${day(p.made)}</div></td>
      <td class="r num">${gp(p.buy)} ${mark(c.bought, c.bought ? "Traded at or below this price in that hour or the next" : "Never this cheap in that hour or the next")}<div class="sub2">${at(p.buyAt)} · was ${gp(c.buyReal)}</div></td>
      <td class="r num">${gp(p.sell)} ${mark(c.sold, c.sold ? "Traded at or above this price in that hour or the next" : "Never this high in that hour or the next")}<div class="sub2">${at(p.sellAt)} · was ${gp(c.sellReal)}</div></td>
      <td class="r num">${signed(p.each, gp)}</td>
      <td class="r num ${cls(r)}">${c.bought ? signed(r, gp) : `<span class="muted">not bought</span>`}</td>
    </tr>`;
  }).join("");

  host.innerHTML = `<section class="section">${head}
    <div class="stats">
      <div class="stat"><span class="label">Buy offer filled</span><span class="big num">${pct(s.bought, s.n)}</span><span class="muted">${nf.format(s.bought)} of ${nf.format(s.n)} suggestions in the last ${DAYS} days</span></div>
      <div class="stat"><span class="label">Then sold at the target</span><span class="big num">${pct(s.sold, s.bought)}</span><span class="muted">of the ones that were bought</span></div>
      <div class="stat"><span class="label">Profit made vs promised</span><span class="big num ${cls(s.made)}">${s.share == null ? "–" : Math.round(s.share * 100) + "%"}</span><span class="muted">${signed(s.made)} of ${signed(s.promised)} per account, once per suggestion</span></div>
    </div>
    <div class="board"><table>
      <thead><tr><th>Pattern</th><th class="r">Suggestions</th><th class="r">Bought</th><th class="r">Sold at target</th><th class="r">Profit made vs promised</th></tr></thead>
      <tbody>${groups.map(g => `<tr>
        <td><span class="pill ${g.pill}">${g.label}</span></td>
        <td class="r num">${nf.format(g.s.n)}</td>
        <td class="r num">${pct(g.s.bought, g.s.n)}</td>
        <td class="r num">${pct(g.s.sold, g.s.bought)}</td>
        <td class="r num ${cls(g.s.made)}">${g.s.share == null ? "–" : Math.round(g.s.share * 100) + "%"}<div class="sub2">${signed(g.s.made)} of ${signed(g.s.promised)}</div></td>
      </tr>`).join("")}</tbody>
    </table></div>
    <details data-tbl="predlog"><summary>Every checked suggestion (newest first)</summary>
      <div class="board"><table>
        <thead><tr><th>Item</th><th class="r">Buy at</th><th class="r">Sell at</th><th class="r">Promised / item</th><th class="r">Made / item</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
    </details>
    <p class="fine">${waiting ? `${nf.format(waiting)} newer suggestion${waiting === 1 ? " is" : "s are"} still waiting for the sell time to pass. ` : ""}${noData ? `${nf.format(noData)} couldn't be checked (no trades in those hours). ` : ""}A buy counts as filled when the item traded at or below "Buy at" in the buy hour or the hour after; the same for selling. That only says the price came, not that your whole amount would have filled. "Was" is the actual average price in that hour. "Made" counts nothing when the buy didn't fill, and the actual price in the sell hour when the target wasn't reached. "Pattern" is the weaker side's reliability, as in the list above.</p>
  </section>`;
}
