// Price history: when in the day an item is usually cheapest and most expensive.
// Uses the OSRS Wiki timeseries endpoint (hourly averages, about the last 3 weeks).
// Each hourly price is compared with that day's own average (a centred 24-hour window),
// so slow price trends over the 3 weeks don't distort the daily pattern.
// Results are cached in the browser for an hour; requests run two at a time to be polite.
import { store } from "./store.js";

const API = "https://prices.runescape.wiki/api/v1/osrs/timeseries?timestep=1h&id=";
const TTL = 60 * 60_000;
const CACHE_KEY = "ts";
const VERSION = 3;   // bump to throw away cached analyses after changing analyse()

const cache = store.get(CACHE_KEY, {});
const pending = new Map();
const raw = new Map();      // id -> hourly rows (memory only; too big for localStorage)
const queue = [];
let running = 0;
const listeners = new Set();
let emitTimer = null;

export const onChange = fn => (listeners.add(fn), () => listeners.delete(fn));
// Many results arrive in a burst; redraw at most every 300 ms.
const emit = () => { if (!emitTimer) emitTimer = setTimeout(() => { emitTimer = null; listeners.forEach(fn => fn()); }, 300); };

function save() {
  // Drop stale entries so the cache doesn't grow forever.
  for (const [id, v] of Object.entries(cache)) if (Date.now() - v.at > TTL * 6 || v.v !== VERSION) delete cache[id];
  try { store.set(CACHE_KEY, cache); } catch { /* storage full or blocked: keep it in memory */ }
}

/** The timing analysis for an item, or undefined while it loads (call want() first), or null if there's too little data. */
export function get(id) {
  const c = cache[id];
  return c && c.v === VERSION && Date.now() - c.at < TTL ? c.r : undefined;
}

export const loading = id => pending.has(id);

/** The hourly rows behind an item's analysis (for charts). Fetches them if this page hasn't yet. */
export async function series(id) {
  if (raw.has(id)) return raw.get(id);
  const r = await fetch(API + id, { cache: "no-store" });
  if (!r.ok) throw new Error("HTTP " + r.status);
  const rows = (await r.json()).data || [];
  raw.set(id, rows);
  return rows;
}
export const seriesLoaded = id => raw.get(id) || null;

/** Ask for the analysis of these items. Already-cached items are skipped. */
export function want(ids) {
  for (const id of ids) {
    if (get(id) !== undefined || pending.has(id)) continue;
    pending.set(id, true);
    queue.push(id);
  }
  pump();
}

function pump() {
  while (running < 2 && queue.length) {
    const id = queue.shift();
    running++;
    fetch(API + id, { cache: "no-store" })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))))
      .then(j => { raw.set(id, j.data || []); cache[id] = { v: VERSION, at: Date.now(), r: analyse(j.data || []) }; save(); })
      .catch(() => { cache[id] = { v: VERSION, at: Date.now() - TTL + 5 * 60_000, r: null }; })   // retry in 5 min
      .finally(() => { pending.delete(id); running--; emit(); setTimeout(pump, 150); });
  }
}

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

/** Hide trades that are far from the usual price (one-off dumps or overpays), for charts. */
export function usualRange(rows, key) {
  const v = rows.map(r => r[key]).filter(x => x > 0).sort((a, b) => a - b);
  if (!v.length) return null;
  return [v[Math.floor(v.length * 0.02)], v[Math.ceil(v.length * 0.98) - 1]];
}

function analyse(rows) {
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

/** "04:00" for an hour of the day. */
export const hourLabel = h => String(h).padStart(2, "0") + ":00";

/**
 * The cheap part of the day for buying: hours whose typical buy-offer price is in the lowest quarter
 * of the day's range (always includes the cheapest hour). Returns a Set of hours 0–23.
 */
export function buyWindow(t) {
  const min = Math.min(...t.low), max = Math.max(...t.low), cut = min + (max - min) * 0.25;
  return new Set(t.low.map((r, h) => (r <= cut ? h : -1)).filter(h => h >= 0));
}

/** If `date` falls in the item's cheap window: the hour the window ends (e.g. 18 = "until 18:00"), else null. */
export function cheapNow(t, date = new Date()) {
  const win = buyWindow(t);
  let h = date.getHours();
  if (!win.has(h)) return null;
  for (let i = 0; i < 24 && win.has(h); i++) h = (h + 1) % 24;
  return h;
}

/** How reliable a pattern is, from the share of days it held. */
export function reliability(hit) {
  if (hit >= 0.75) return { label: "Reliable", pill: "good" };
  if (hit >= 0.6) return { label: "Usually", pill: "warn" };
  return { label: "Weak", pill: "bad" };
}

/**
 * Tiny 24-bar chart of a daily pattern: bar height = price relative to the day's average,
 * highlighted bar = the hour to act. One series, so no legend; each bar has a tooltip.
 */
export function sparkline(ratios, mark, what) {
  const min = Math.min(...ratios), max = Math.max(...ratios), span = max - min || 1;
  const w = 3, gap = 1, h = 22;
  const bars = ratios.map((r, i) => {
    const bh = 6 + ((r - min) / span) * (h - 6);
    const pct = ((r - 1) * 100).toFixed(1);
    return `<rect x="${i * (w + gap)}" y="${h - bh}" width="${w}" height="${bh}" rx="1" class="${i === mark ? "on" : ""}"><title>${hourLabel(i)}: ${pct > 0 ? "+" : ""}${pct}% vs the day's average ${what}</title></rect>`;
  }).join("");
  return `<svg class="spark" viewBox="0 0 ${24 * (w + gap) - gap} ${h}" width="${24 * (w + gap) - gap}" height="${h}" role="img" aria-label="${esc(what)} by hour of day, ${hourLabel(mark)} highlighted">${bars}</svg>`;
}

const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
