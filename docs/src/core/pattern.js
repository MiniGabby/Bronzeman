// The daily price pattern of one item, from the OSRS Wiki's hourly timeseries rows, and the flip plan
// built on it. Pure functions without browser APIs, so the GitHub Action that records the Merching
// predictions (.github/scripts/build-merch.mjs) uses exactly the same math as the page.
// Hours of the day are in the local time zone (the Action runs with TZ=Europe/Amsterdam).
import { geTax } from "./format.js";

const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
const median = a => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

/**
 * For one side (low = instant-sell price, which buy offers fill at; high = instant-buy price, which sell
 * offers fill at): per hour of the day in the viewer's time zone, the typical price relative to that
 * day's average (1.02 = 2% above), and how often that hour was below / above the day's average.
 */
// Hours with only a handful of trades (someone dumping 1 item for 1 gp) say nothing about the market,
// so a price only counts when that hour traded at least a quarter of the item's usual hourly volume.
function sidePoints(rows, key, volKey) {
  const all = rows.filter(r => r[key] > 0 && r[volKey] > 0);
  if (!all.length) return { pts: [], vol: 0 };
  const vol = median(all.map(r => r[volKey]));
  const pts = all.filter(r => r[volKey] >= Math.max(5, vol * 0.25)).map(r => ({ t: r.timestamp * 1000, p: r[key] }));
  return { pts, vol };
}

/**
 * For one side (low = instant-sell price, which buy offers fill at; high = instant-buy price, which sell
 * offers fill at): per hour of the day in the viewer's time zone, the typical price relative to that
 * day's average (1.02 = 2% above), and on how many days that hour was below / above the day's average.
 */
function pattern(pts) {
  if (pts.length < 24 * 5) return null;
  const byHour = Array.from({ length: 24 }, () => []);
  for (let i = 0; i < pts.length; i++) {
    const win = pts.filter(x => Math.abs(x.t - pts[i].t) <= 12 * 3600_000);
    if (win.length < 12) continue;
    byHour[new Date(pts[i].t).getHours()].push(pts[i].p / mean(win.map(x => x.p)));
  }
  if (byHour.some(h => h.length < 4)) return null;
  return {
    ratio: byHour.map(median),
    days: byHour.map(h => h.length),
    below: byHour.map(h => h.filter(x => x < 1).length),
    above: byHour.map(h => h.filter(x => x > 1).length)
  };
}

function hourVol(rows, h, key) {
  const v = rows.filter(r => new Date(r.timestamp * 1000).getHours() === h).map(r => r[key] || 0);
  return v.length ? median(v) : 0;
}

export function analyse(rows) {
  rows = rows.filter(r => r.timestamp);
  const L = sidePoints(rows, "avgLowPrice", "lowPriceVolume"), H = sidePoints(rows, "avgHighPrice", "highPriceVolume");
  const lo = pattern(L.pts), hi = pattern(H.pts);
  if (!lo || !hi) return null;
  // Current level: median of the last 24 hours (robust against a single odd trade).
  const since = (rows.at(-1).timestamp - 24 * 3600) * 1000;
  const recent = pts => { const v = pts.filter(x => x.t > since).map(x => x.p); return v.length >= 6 ? median(v) : null; };
  const buyHour = lo.ratio.indexOf(Math.min(...lo.ratio));
  const sellHour = hi.ratio.indexOf(Math.max(...hi.ratio));
  const lowMed = median(L.pts.map(x => x.p)), highMed = median(H.pts.map(x => x.p));
  return {
    days: Math.round(rows.length / 24),
    low: lo.ratio, high: hi.ratio,
    buyHour, sellHour,
    buyDip: lo.ratio[buyHour] - 1,          // e.g. -0.03 = 3% below the day's average
    sellPeak: hi.ratio[sellHour] - 1,
    buyDays: lo.days[buyHour], sellDays: hi.days[sellHour],              // days with enough trades at that hour
    buyHitDays: lo.below[buyHour], sellHitDays: hi.above[sellHour],     // days the pattern held
    buyHit: lo.below[buyHour] / lo.days[buyHour],                        // share of those days
    sellHit: hi.above[sellHour] / hi.days[sellHour],
    lowAvg: recent(L.pts),                  // typical buy-offer price, last 24 hours
    highAvg: recent(H.pts),                 // typical sell-offer price, last 24 hours
    lowVol: L.vol, highVol: H.vol,          // usual trades per hour on each side
    // Per hour of the day, for the detail view: days with enough trades, days below/above the average,
    // and the usual trades per hour on each side.
    hours: Array.from({ length: 24 }, (_, h) => ({
      lowDays: lo.days[h], lowBelow: lo.below[h], highDays: hi.days[h], highAbove: hi.above[h],
      lowVol: hourVol(rows, h, "lowPriceVolume"), highVol: hourVol(rows, h, "highPriceVolume")
    })),
    spread: lowMed ? highMed / lowMed : null  // usual sell/buy price ratio over the whole period
  };
}

/**
 * Unlocked items with a usable spread right now, best first.
 * items = [{ id, name, limit, high, low, vol }], opts = { cash, minVol }.
 */
export function candidates(items, opts, max) {
  return items
    .filter(it => it.limit && it.high > 0 && it.low > 0 && it.vol >= opts.minVol && it.low <= opts.cash && it.high <= it.low * 1.3)
    .map(it => {
      const qty = Math.min(it.limit, Math.floor(opts.cash / it.low));
      const margin = it.high - geTax(it.high) - it.low;
      return { it, score: qty * Math.max(margin, it.low * 0.005) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map(c => c.it);
}

/** Buy/sell plan for one item from its analysis t, or { it, t } without one, or { thin: true } if it's not a real market. */
export function plan(it, t, opts) {
  if (!t || !t.lowAvg || !t.highAvg) return { it, t };
  // Not a real market: hardly any trades on one side, or buy and sell prices usually far apart
  // (a few people dumping for 1 gp and a few paying 200 doesn't mean you can do the same in bulk).
  if (t.lowVol < 10 || t.highVol < 10 || !t.spread || t.spread > 1.3) return { it, t, thin: true };
  const buy = Math.floor(t.lowAvg * t.low[t.buyHour]);
  const sell = Math.ceil(t.highAvg * t.high[t.sellHour]);
  const each = sell - geTax(sell) - buy;
  const qty = Math.min(it.limit, Math.floor(opts.cash / buy));
  return { it, t, buy, sell, each, qty, total: each * qty, nextDay: t.sellHour <= t.buyHour, nowMargin: it.high - geTax(it.high) - it.low };
}
