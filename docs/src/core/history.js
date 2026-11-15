// Price history: when in the day an item is usually cheapest and most expensive.
// Uses the OSRS Wiki timeseries endpoint (hourly averages, about the last 3 weeks).
// Each hourly price is compared with that day's own average (a centred 24-hour window),
// so slow price trends over the 3 weeks don't distort the daily pattern.
// Results are cached in the browser for an hour; requests run two at a time to be polite.
import { store } from "./store.js";
import { analyse } from "./pattern.js";

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

/** Hide trades that are far from the usual price (one-off dumps or overpays), for charts. */
export function usualRange(rows, key) {
  const v = rows.map(r => r[key]).filter(x => x > 0).sort((a, b) => a - b);
  if (!v.length) return null;
  return [v[Math.floor(v.length * 0.02)], v[Math.ceil(v.length * 0.98) - 1]];
}

/**
 * The usual price range over a day for one side ("buy" = what buy offers fill at, "sell" = what sell
 * offers fill at): the last 24 hours' typical price times the cheapest and dearest hour of the daily
 * pattern. Returns [low, high], or null when there were too few trades in the last day.
 */
export function dayRange(t, side) {
  const avg = side === "buy" ? t.lowAvg : t.highAvg, r = side === "buy" ? t.low : t.high;
  return avg ? [avg * Math.min(...r), avg * Math.max(...r)] : null;
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
