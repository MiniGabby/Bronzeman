// Live Grand Exchange prices from the OSRS Wiki real-time prices API.
// https://oldschool.runescape.wiki/w/RuneScape:Real-time_Prices
import { store } from "./store.js";

const API = "https://prices.runescape.wiki/api/v1/osrs";
const REFRESH_MS = 60_000;

const state = {
  mapping: null,   // id -> { name, limit, highalch }
  byName: null,    // lower-case name -> id
  latest: {},      // id -> { high, low, highTime, lowTime }
  hour: {},        // id -> { avgHighPrice, avgLowPrice, highPriceVolume, lowPriceVolume }
  fetchedAt: null,
  error: null,
  mode: store.get("mode", "instant"),
  own: store.get("own", {})  // "id:buy" / "id:sell" -> price the viewer typed in
};
const listeners = new Set();
const emit = () => listeners.forEach(fn => fn());

export const onChange = fn => (listeners.add(fn), () => listeners.delete(fn));
export const ready = () => !!state.mapping && !!state.fetchedAt;
export const status = () => ({ fetchedAt: state.fetchedAt, error: state.error });

export const MODES = {
  instant: "Instant: you buy at the instant-buy price and sell at the instant-sell price. The safe estimate.",
  offers:  "Offers: you place buy offers at the low price and sell offers at the high price. Best case, but slower to fill.",
  mid:     "Mid: halfway between the high and low price of each item."
};
export const getMode = () => state.mode;
export function setMode(mode) { state.mode = mode; store.set("mode", mode); emit(); }

async function getJSON(path) {
  const r = await fetch(API + path, { cache: "no-store" });
  if (!r.ok) throw new Error(`${path} returned HTTP ${r.status}`);
  return r.json();
}

export async function refresh() {
  try {
    if (!state.mapping) {
      const list = await getJSON("/mapping");
      state.mapping = Object.fromEntries(list.map(it => [it.id, { name: it.name, limit: it.limit ?? null, highalch: it.highalch ?? null, members: !!it.members }]));
      state.byName = Object.fromEntries(list.map(it => [it.name.toLowerCase(), it.id]));
    }
    const [latest, hour] = await Promise.all([getJSON("/latest"), getJSON("/1h")]);
    state.latest = latest.data || {};
    state.hour = hour.data || {};
    state.fetchedAt = new Date();
    state.error = null;
  } catch (e) {
    state.error = e.message || String(e);
  }
  emit();
}

export function start() {
  refresh();
  setInterval(refresh, REFRESH_MS);
}

/** Item id for an exact in-game item name (case-insensitive), or null until the item list has loaded. */
export const idOf = name => (name && state.byName ? state.byName[String(name).toLowerCase()] ?? null : null);

/** Item id for a method's input/output entry: { id } or { name }. */
export const resolve = x => x.id ?? idOf(x.name);

/** Every item id the price API knows. */
export const allIds = () => Object.keys(state.mapping || {}).map(Number);

/** Item info. Prices are last hour's average trade, or the latest trade if it didn't trade that hour. */
export function item(id) {
  const m = state.mapping?.[id] || {}, l = state.latest[id] || {}, h = state.hour[id] || {};
  return {
    id,
    name: m.name || `Item ${id}`,
    limit: m.limit || null,
    highalch: m.highalch ?? null,
    high: h.avgHighPrice ?? l.high ?? null,
    low: h.avgLowPrice ?? l.low ?? null,
    vol: (h.highPriceVolume || 0) + (h.lowPriceVolume || 0)
  };
}

/** Price you pay ("buy") or get ("sell") for an item, respecting the price mode and own prices. */
export function price(id, side) {
  const own = state.own[`${id}:${side}`];
  if (own > 0) return { p: own, own: true };
  const { high, low } = item(id);
  if (high == null && low == null) return { p: null, own: false };
  const hi = high ?? low, lo = low ?? high;
  if (state.mode === "mid") return { p: (hi + lo) / 2, own: false };
  if (state.mode === "instant") return { p: side === "buy" ? hi : lo, own: false };
  return { p: side === "buy" ? lo : hi, own: false };
}

export function setOwn(id, side, value) {
  const k = `${id}:${side}`;
  if (value > 0) state.own[k] = value; else delete state.own[k];
  store.set("own", state.own);
  emit();
}
