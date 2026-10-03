// Detail panel for one item on the Merching page: buy and sell prices over the last weeks,
// a typical day hour by hour, and the numbers behind the suggestion.
// Charts are plain SVG: two series (buy offer = blue, sell offer = orange; validated for colour
// blindness on both themes), a legend plus direct labels, and a crosshair tooltip on hover.
import * as history from "../core/history.js";
import { esc, gp, signed, nf } from "../core/format.js";

const W = 760, H = 230, PAD = { l: 64, r: 92, t: 14, b: 30 };
const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function niceTicks(min, max, n = 4) {
  const span = max - min || 1, step0 = span / n, mag = 10 ** Math.floor(Math.log10(step0));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= step0) || step0;
  const out = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) out.push(v);
  return out;
}

/**
 * A two-line chart. points: [{ x, label, buy, sell, extra }]; x in 0..1 positions.
 * marks: [{ i, series: "buy"|"sell", text }] dots with a label on specific points.
 */
function lineChart(id, points, { yRange, xTicks, marks = [], note }) {
  const [y0, y1] = yRange, ys = niceTicks(y0, y1);
  const lo = Math.min(y0, ys[0] ?? y0), hi = Math.max(y1, ys.at(-1) ?? y1);
  const X = x => PAD.l + x * (W - PAD.l - PAD.r);
  const Y = v => PAD.t + (1 - (v - lo) / (hi - lo || 1)) * (H - PAD.t - PAD.b);
  const clamp = v => Math.max(lo, Math.min(hi, v));
  const path = key => {
    let d = "", pen = false;
    for (const p of points) {
      if (!(p[key] > 0)) { pen = false; continue; }
      d += `${pen ? "L" : "M"}${X(p.x).toFixed(1)},${Y(clamp(p[key])).toFixed(1)}`;
      pen = true;
    }
    return d;
  };
  const lastOf = key => [...points].reverse().find(p => p[key] > 0);
  const lb = lastOf("buy"), ls = lastOf("sell");
  // Direct labels at the right end; nudge apart if they would overlap.
  let yb = lb ? Y(clamp(lb.buy)) : 0, ysl = ls ? Y(clamp(ls.sell)) : 0;
  if (lb && ls && Math.abs(yb - ysl) < 14) { const mid = (yb + ysl) / 2; ysl = mid - 7; yb = mid + 7; }
  return `<div class="chartbox" data-chart="${id}">
    <svg viewBox="0 0 ${W} ${H}" class="pchart" role="img" aria-label="${esc(note)}">
      ${ys.map(v => `<line class="grid" x1="${PAD.l}" x2="${W - PAD.r}" y1="${Y(v)}" y2="${Y(v)}"/><text class="ax" x="${PAD.l - 8}" y="${Y(v) + 4}" text-anchor="end">${gp(v)}</text>`).join("")}
      ${xTicks.map(t => `<line class="grid v" x1="${X(t.x)}" x2="${X(t.x)}" y1="${PAD.t}" y2="${H - PAD.b}"/><text class="ax" x="${X(t.x)}" y="${H - PAD.b + 18}" text-anchor="middle">${esc(t.label)}</text>`).join("")}
      <path class="ln sell" d="${path("sell")}"/>
      <path class="ln buy" d="${path("buy")}"/>
      ${marks.map(m => { const p = points[m.i], v = p[m.series]; return v > 0 ? `<circle class="mk ${m.series}" cx="${X(p.x)}" cy="${Y(clamp(v))}" r="5"/><text class="mklabel" x="${X(p.x)}" y="${Y(clamp(v)) + (m.series === "buy" ? 20 : -11)}" text-anchor="middle">${esc(m.text)}</text>` : ""; }).join("")}
      ${ls ? `<text class="dl sell" x="${W - PAD.r + 8}" y="${ysl + 4}">Sell offer</text>` : ""}
      ${lb ? `<text class="dl buy" x="${W - PAD.r + 8}" y="${yb + 4}">Buy offer</text>` : ""}
      <line class="xhair" x1="0" x2="0" y1="${PAD.t}" y2="${H - PAD.b}" visibility="hidden"/>
      <rect class="hit" x="${PAD.l}" y="${PAD.t}" width="${W - PAD.l - PAD.r}" height="${H - PAD.t - PAD.b}"/>
    </svg>
    <div class="ptip" hidden></div>
  </div>`;
}

/**
 * One line per day over the hours of the day: sell offers red, buy offers blue.
 * The most recent day is solid; older days fade out, so you can see whether the daily pattern repeats.
 * rows = hourly series; days are calendar days in the viewer's time zone.
 */
function daysChart(id, rows, yRange, maxDays = 30) {
  const byDay = new Map();
  for (const r of rows) {
    const d = new Date(r.timestamp * 1000);
    const key = d.toDateString();
    if (!byDay.has(key)) byDay.set(key, { date: d, hours: [] });
    byDay.get(key).hours[d.getHours()] = r;
  }
  const days = [...byDay.values()].slice(-maxDays);
  const [y0, y1] = yRange, ys = niceTicks(y0, y1);
  const lo = Math.min(y0, ys[0] ?? y0), hi = Math.max(y1, ys.at(-1) ?? y1);
  const X = h => PAD.l + (h / 23) * (W - PAD.l - PAD.r);
  const Y = v => PAD.t + (1 - (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo || 1)) * (H - PAD.t - PAD.b);
  const path = (day, key) => {
    let d = "", pen = false;
    for (let h = 0; h < 24; h++) {
      const v = day.hours[h]?.[key];
      if (!(v > 0)) { pen = false; continue; }
      d += `${pen ? "L" : "M"}${X(h).toFixed(1)},${Y(v).toFixed(1)}`;
      pen = true;
    }
    return d;
  };
  const n = days.length;
  const opacity = i => (n < 2 ? 1 : 0.08 + 0.92 * (i / (n - 1)));   // oldest faint, newest solid
  // Oldest first, so the newest lines are drawn on top.
  const lines = days.map((day, i) => {
    const o = opacity(i).toFixed(2), w = i === n - 1 ? 2.5 : 1.5;
    return `<path class="ln sell" d="${path(day, "avgHighPrice")}" style="opacity:${o};stroke-width:${w}"/>`
         + `<path class="ln buy" d="${path(day, "avgLowPrice")}" style="opacity:${o};stroke-width:${w}"/>`;
  }).join("");
  const last = days[n - 1];
  const lastVal = key => { for (let h = 23; h >= 0; h--) { const v = last?.hours[h]?.[key]; if (v > 0) return { h, v }; } return null; };
  const ls = lastVal("avgHighPrice"), lb = lastVal("avgLowPrice");
  let ysl = ls ? Y(ls.v) : 0, yb = lb ? Y(lb.v) : 0;
  if (ls && lb && Math.abs(yb - ysl) < 14) { const mid = (yb + ysl) / 2; ysl = mid - 7; yb = mid + 7; }

  // Tooltip per hour: the most recent day's prices, and the lowest–highest over all days shown.
  const fmtDay = d => d.date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  const pts = Array.from({ length: 24 }, (_, h) => {
    const vals = key => days.map(d => d.hours[h]?.[key]).filter(v => v > 0);
    const s = vals("avgHighPrice"), b = vals("avgLowPrice");
    const recent = key => { for (let i = n - 1; i >= 0; i--) { const v = days[i].hours[h]?.[key]; if (v > 0) return { v, day: days[i] }; } return null; };
    return { x: h / 23, h, s, b, rs: recent("avgHighPrice"), rb: recent("avgLowPrice") };
  });
  const range = a => (a.length ? `${gp(Math.min(...a))}–${gp(Math.max(...a))}` : "–");
  store.set(id, { pts, tip: q => `<b>${history.hourLabel(q.h)}</b>
    <div><span class="sw sell"></span><b class="num">${q.rs ? gp(q.rs.v) : "–"}</b> sell offer${q.rs ? ` on ${esc(fmtDay(q.rs.day))}` : ""} · range ${range(q.s)}</div>
    <div><span class="sw buy"></span><b class="num">${q.rb ? gp(q.rb.v) : "–"}</b> buy offer${q.rb ? ` on ${esc(fmtDay(q.rb.day))}` : ""} · range ${range(q.b)}</div>
    <div class="sub2">Range = lowest–highest of the last ${n} days at this hour</div>` });

  return `<div class="chartbox" data-chart="${id}">
    <svg viewBox="0 0 ${W} ${H}" class="pchart" role="img" aria-label="Buy and sell offer prices per hour for each of the last ${n} days">
      ${ys.map(v => `<line class="grid" x1="${PAD.l}" x2="${W - PAD.r}" y1="${Y(v)}" y2="${Y(v)}"/><text class="ax" x="${PAD.l - 8}" y="${Y(v) + 4}" text-anchor="end">${gp(v)}</text>`).join("")}
      ${[0, 3, 6, 9, 12, 15, 18, 21].map(h => `<line class="grid v" x1="${X(h)}" x2="${X(h)}" y1="${PAD.t}" y2="${H - PAD.b}"/><text class="ax" x="${X(h)}" y="${H - PAD.b + 18}" text-anchor="middle">${history.hourLabel(h)}</text>`).join("")}
      ${lines}
      ${ls ? `<text class="dl sell" x="${W - PAD.r + 8}" y="${ysl + 4}">Sell offer</text>` : ""}
      ${lb ? `<text class="dl buy" x="${W - PAD.r + 8}" y="${yb + 4}">Buy offer</text>` : ""}
      <line class="xhair" x1="0" x2="0" y1="${PAD.t}" y2="${H - PAD.b}" visibility="hidden"/>
      <rect class="hit" x="${PAD.l}" y="${PAD.t}" width="${W - PAD.l - PAD.r}" height="${H - PAD.t - PAD.b}"/>
    </svg>
    <div class="ptip" hidden></div>
  </div>
  <div class="dayscale" aria-hidden="true"><span>${n ? esc(fmtDay(days[0])) : ""}</span><span class="fade"></span><span>${n ? esc(fmtDay(last)) + (last.date.toDateString() === new Date().toDateString() ? " (today)" : "") : ""}</span></div>`;
}

const store = new Map();   // chart id -> points, for the tooltips

/** HTML for the detail panel. rows = hourly series, t = analysis, p = the merch plan for this item. */
export function detailHTML(it, t, p, rows) {
  const idA = `wk-${it.id}`, idB = `day-${it.id}`;
  // Weeks chart: every hour, x by time.
  const t0 = rows[0].timestamp, t1 = rows.at(-1).timestamp, span = t1 - t0 || 1;
  const wk = rows.map(r => ({
    x: (r.timestamp - t0) / span, ts: r.timestamp,
    buy: r.avgLowPrice, sell: r.avgHighPrice, bv: r.lowPriceVolume || 0, sv: r.highPriceVolume || 0
  }));
  const rb = history.usualRange(rows, "avgLowPrice"), rs = history.usualRange(rows, "avgHighPrice");
  const yRange = [Math.min(rb?.[0] ?? Infinity, rs?.[0] ?? Infinity), Math.max(rb?.[1] ?? 0, rs?.[1] ?? 0)];
  const clipped = rows.some(r => (r.avgLowPrice > 0 && (r.avgLowPrice < yRange[0] || r.avgLowPrice > yRange[1])) || (r.avgHighPrice > 0 && (r.avgHighPrice < yRange[0] || r.avgHighPrice > yRange[1])));
  const ticksA = [];
  for (let d = new Date(t0 * 1000); d.getTime() / 1000 <= t1; d.setDate(d.getDate() + 1)) {
    const m = new Date(d); m.setHours(0, 0, 0, 0);
    const ts = m.getTime() / 1000;
    if (ts >= t0 && m.getDay() === 1) ticksA.push({ x: (ts - t0) / span, label: `${DAY[m.getDay()]} ${m.getDate()}/${m.getMonth() + 1}` });
  }
  store.set(idA, { pts: wk, tip: q => `<b>${DAY[new Date(q.ts * 1000).getDay()]} ${new Date(q.ts * 1000).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</b>
    <div><span class="sw sell"></span><b class="num">${q.sell > 0 ? gp(q.sell) : "–"}</b> sell offer · ${nf.format(q.sv)} traded</div>
    <div><span class="sw buy"></span><b class="num">${q.buy > 0 ? gp(q.buy) : "–"}</b> buy offer · ${nf.format(q.bv)} traded</div>` });

  // Typical day: hour of day, typical price = recent median × that hour's factor.
  const day = Array.from({ length: 24 }, (_, h) => ({
    x: h / 23, h, buy: t.lowAvg * t.low[h], sell: t.highAvg * t.high[h], hs: t.hours?.[h]
  }));
  const dmin = Math.min(...day.map(d => Math.min(d.buy, d.sell))), dmax = Math.max(...day.map(d => Math.max(d.buy, d.sell)));
  const padY = (dmax - dmin) * 0.15 || dmax * 0.01;
  store.set(idB, { pts: day, tip: q => `<b>${history.hourLabel(q.h)}</b>
    <div><span class="sw sell"></span><b class="num">${gp(q.sell)}</b> typical sell offer${q.hs ? ` · above the day's average on ${q.hs.highAbove}/${q.hs.highDays} days` : ""}</div>
    <div><span class="sw buy"></span><b class="num">${gp(q.buy)}</b> typical buy offer${q.hs ? ` · below the day's average on ${q.hs.lowBelow}/${q.hs.lowDays} days` : ""}</div>` });

  const days = t.days;
  const relB = history.reliability(t.buyHit), relS = history.reliability(t.sellHit);
  const summary = p && p.each != null ? `
    <ul class="dsum">
      <li><b>Buy</b> with a buy offer at about <b class="num">${gp(p.buy)} gp</b> around <b>${history.hourLabel(t.buyHour)}</b>. That hour is usually ${Math.abs(t.buyDip * 100).toFixed(1)}% below the day's average; it was cheaper than average on <b>${t.buyHitDays} of ${t.buyDays}</b> days (<span class="pill ${relB.pill}">${relB.label}</span>).</li>
      <li><b>Sell</b> with a sell offer at about <b class="num">${gp(p.sell)} gp</b> around <b>${history.hourLabel(t.sellHour)}</b>${p.nextDay ? " the next day" : ""}. That hour is usually ${(t.sellPeak * 100).toFixed(1)}% above the day's average; it was dearer than average on <b>${t.sellHitDays} of ${t.sellDays}</b> days (<span class="pill ${relS.pill}">${relS.label}</span>).</li>
      <li><b>Profit</b> ${signed(p.each, gp)} gp per item after ${gp(p.sell - p.buy - p.each)} gp tax. With your cash and the buy limit that's ${nf.format(p.qty)} items (limit ${nf.format(it.limit)} per 4 hours): <b class="num">${signed(p.total)}</b> per account.</li>
      <li><b>Volume</b>: usually ${nf.format(Math.round(t.lowVol))} sold into buy offers and ${nf.format(Math.round(t.highVol))} bought from sell offers per hour.</li>
    </ul>` : "";

  return `<div class="pdetail">
    <div class="dhead"><h3>${esc(it.name)}</h3><a href="https://prices.runescape.wiki/osrs/item/${it.id}" target="_blank" rel="noopener">Live prices on the wiki ↗</a></div>
    ${summary}
    <div class="legend"><span><span class="sw sell"></span>Sell offer (instant-buy price)</span><span><span class="sw buy"></span>Buy offer (instant-sell price)</span></div>
    <h4>Last ${days} days, hourly average</h4>
    ${lineChart(idA, wk, { yRange, xTicks: ticksA, note: `Hourly buy and sell offer prices of ${it.name} over the last ${days} days` })}
    ${clipped ? `<p class="fine">A few one-off trades far from the usual price are cut off at the edge of the chart. Hover to see them.</p>` : ""}
    <h4>A typical day (your time)</h4>
    ${lineChart(idB, day, {
      yRange: [dmin - padY, dmax + padY],
      xTicks: [0, 3, 6, 9, 12, 15, 18, 21].map(h => ({ x: h / 23, label: history.hourLabel(h) })),
      marks: [{ i: t.buyHour, series: "buy", text: `Buy ${history.hourLabel(t.buyHour)}` }, { i: t.sellHour, series: "sell", text: `Sell ${history.hourLabel(t.sellHour)}` }],
      note: `Typical buy and sell offer prices of ${it.name} per hour of the day`
    })}
    <p class="fine">Typical price per hour = the median price of the last 24 hours × how that hour usually compares with its day's average over the last ${days} days.</p>
    <h4>Every day of the last ${Math.min(30, new Set(rows.map(r => new Date(r.timestamp * 1000).toDateString())).size)} days (your time)</h4>
    ${daysChart(`days-${it.id}`, rows, yRange)}
    <p class="fine">One red line (sell offers) and one blue line (buy offers) per day: the most recent day is solid, older days fade out. If the dips and peaks line up day after day, the pattern is real. Hover for each hour's prices.</p>
    <details data-tbl="${it.id}"><summary>Hour-by-hour table</summary>
      <div class="board"><table>
        <thead><tr><th>Hour</th><th class="r">Buy offer</th><th class="r">Cheaper than average</th><th class="r">Sell offer</th><th class="r">Dearer than average</th><th class="r">Traded / hr (buy · sell side)</th></tr></thead>
        <tbody>${day.map(d => `<tr class="${d.h === t.buyHour || d.h === t.sellHour ? "here" : ""}">
          <td class="num">${history.hourLabel(d.h)}${d.h === t.buyHour ? ` <span class="pill good">Buy</span>` : ""}${d.h === t.sellHour ? ` <span class="pill good">Sell</span>` : ""}</td>
          <td class="r num">${gp(d.buy)}</td><td class="r num">${d.hs ? `${d.hs.lowBelow}/${d.hs.lowDays} days` : "–"}</td>
          <td class="r num">${gp(d.sell)}</td><td class="r num">${d.hs ? `${d.hs.highAbove}/${d.hs.highDays} days` : "–"}</td>
          <td class="r num">${d.hs ? `${nf.format(Math.round(d.hs.lowVol))} · ${nf.format(Math.round(d.hs.highVol))}` : "–"}</td>
        </tr>`).join("")}</tbody>
      </table></div>
    </details>
  </div>`;
}

/** Crosshair tooltips for every chart inside root. Call after inserting detailHTML. */
export function bindCharts(root) {
  root.querySelectorAll(".chartbox").forEach(box => {
    const data = store.get(box.dataset.chart);
    if (!data || box.dataset.bound) return;
    box.dataset.bound = "1";
    const svg = box.querySelector("svg"), hit = box.querySelector(".hit"), line = box.querySelector(".xhair"), tip = box.querySelector(".ptip");
    const move = e => {
      const r = svg.getBoundingClientRect();
      const vx = ((e.clientX - r.left) / r.width) * W;
      const x = (vx - PAD.l) / (W - PAD.l - PAD.r);
      let best = data.pts[0];
      for (const p of data.pts) if (Math.abs(p.x - x) < Math.abs(best.x - x)) best = p;
      const px = PAD.l + best.x * (W - PAD.l - PAD.r);
      line.setAttribute("x1", px); line.setAttribute("x2", px); line.setAttribute("visibility", "visible");
      tip.innerHTML = data.tip(best);
      tip.hidden = false;
      const left = (px / W) * r.width;
      tip.style.left = Math.min(Math.max(left + 12, 0), r.width - tip.offsetWidth) + "px";
      if (left + 12 + tip.offsetWidth > r.width) tip.style.left = Math.max(0, left - tip.offsetWidth - 12) + "px";
    };
    hit.addEventListener("pointermove", move);
    hit.addEventListener("pointerleave", () => { tip.hidden = true; line.setAttribute("visibility", "hidden"); });
  });
}
