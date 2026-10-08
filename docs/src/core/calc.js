// Turns a method definition into profit, XP and buy-limit numbers.
import * as prices from "./prices.js";
import { store } from "./store.js";
import { geTax } from "./format.js";
import * as burn from "./burn.js";

const rates = store.get("aph", {});
const listeners = new Set();
export const onChange = fn => (listeners.add(fn), () => listeners.delete(fn));

/**
 * Actions per hour for a method: the viewer's own value, or the method's default.
 * Methods with per: "day" (farm runs) count per day instead: their default is actionsPerDay.
 */
export const getRate = m => Number(rates[m.id] ?? (m.per === "day" ? m.actionsPerDay : m.actionsPerHour)) || 0;
/** 24 for methods counted per day, 1 for the rest: multiply per-hour numbers by it to show them. */
export const periodHours = m => (m.per === "day" ? 24 : 1);
export function setRate(m, value) {
  rates[m.id] = Number(value) || 0;
  store.set("aph", rates);
  listeners.forEach(fn => fn());
}

/**
 * opts (optional): { level } or { from, to } for methods whose result depends on level (burnt food).
 * Without them, burning is worked out at the method's level requirement (the worst case).
 */
export function compute(m, opts = {}) {
  const perHour = getRate(m) / periodHours(m);
  // Share of attempts that succeed (Cooking: food that doesn't burn). Burnt food gives no XP and can't be sold.
  const req = Object.values(m.reqs?.skills || {})[0] || 1;
  const success = !m.burn ? 1 : opts.from != null ? burn.averageSuccess(m, opts.from, opts.to)
    : burn.success(m, opts.level ?? req);
  // Items can be given by id or by exact name ({ name: "Guam potion (unf)" }).
  const lookup = x => {
    const id = prices.resolve(x);
    const it = id == null ? { id: null, name: x.name || "Unknown item", limit: null, vol: 0 } : prices.item(id);
    return { id, it };
  };
  const ins = (m.inputs || []).map(x => {
    const { id, it } = lookup(x), { p, own } = id == null ? { p: null, own: false } : prices.price(id, "buy");
    return { ...x, id, it, price: p, own, total: p == null ? null : p * x.qty };
  });
  const outs = (m.outputs || []).map(x0 => {
    const x = success < 1 ? { ...x0, qty: x0.qty * success } : x0;
    const { id, it } = lookup(x), { p, own } = id == null ? { p: null, own: false } : prices.price(id, "sell");
    const tax = p == null ? null : geTax(Math.floor(p));
    return { ...x, it, price: p, own, tax, total: p == null ? null : (p - tax) * x.qty };
  });
  // Fixed costs per hour (e.g. the Blast Furnace coffer), spread over each action.
  // A fee can also be given per action (each), e.g. paying a farmer to remove a tree.
  const fees = (m.fees || []).map(f => (f.each != null ? { ...f, perHour: f.each * perHour }
    : { ...f, each: perHour > 0 ? f.perHour / perHour : 0 }));
  const missing = [...ins, ...outs].some(r => r.total == null);
  const cost = ins.reduce((a, r) => a + (r.total || 0), 0) + fees.reduce((a, f) => a + f.each, 0);
  // Coins you get straight away per action (e.g. pickpocketing), not traded so no GE tax.
  const coins = Number(m.coins) || 0;
  const revenue = outs.reduce((a, r) => a + (r.total || 0), 0) + coins;
  const taxEach = outs.reduce((a, r) => a + (r.tax || 0) * r.qty, 0);
  const profit = missing ? null : revenue - cost;

  // Which input's GE buy limit (per 4 hours) runs out first.
  let limitActions = Infinity, limitItem = null;
  for (const r of ins) {
    if (r.it.limit) {
      const a = r.it.limit / r.qty;
      if (a < limitActions) { limitActions = a; limitItem = r; }
    }
  }

  const xpHr = Object.fromEntries(Object.entries(m.xp || {}).map(([s, v]) => [s, v * perHour * success]));
  return {
    perHour, success: m.burn ? success : null, ins, outs, fees, coins, cost, revenue, taxEach, profit,
    profitHr: profit == null ? null : profit * perHour,
    limitActions, limitItem, xpHr,
    xpTotalHr: Object.values(xpHr).reduce((a, b) => a + b, 0)
  };
}

/** How long one account can keep going before the GE buy limit stops it. */
export function limitPace(c) {
  if (!c.limitItem || !isFinite(c.limitActions)) return { text: "No buy limit", pill: "good", minutes: Infinity };
  const minutes = c.perHour > 0 ? (c.limitActions / c.perHour) * 60 : Infinity;
  return {
    minutes,
    pill: minutes >= 240 ? "good" : minutes >= 120 ? "warn" : "bad",
    text: minutes >= 240 ? "Keeps up with your pace" : `${Math.round(minutes)} min of work per 4 h`
  };
}
