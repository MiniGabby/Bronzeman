// Turns a method definition into profit, XP and buy-limit numbers.
import * as prices from "./prices.js";
import { store } from "./store.js";
import { geTax } from "./format.js";

const rates = store.get("aph", {});
const listeners = new Set();
export const onChange = fn => (listeners.add(fn), () => listeners.delete(fn));

/** Actions per hour for a method: the viewer's own value, or the method's default. */
export const getRate = m => Number(rates[m.id] ?? m.actionsPerHour) || 0;
export function setRate(m, value) {
  rates[m.id] = Number(value) || 0;
  store.set("aph", rates);
  listeners.forEach(fn => fn());
}

export function compute(m) {
  const perHour = getRate(m);
  const ins = (m.inputs || []).map(x => {
    const it = prices.item(x.id), { p, own } = prices.price(x.id, "buy");
    return { ...x, it, price: p, own, total: p == null ? null : p * x.qty };
  });
  const outs = (m.outputs || []).map(x => {
    const it = prices.item(x.id), { p, own } = prices.price(x.id, "sell");
    const tax = p == null ? null : geTax(Math.floor(p));
    return { ...x, it, price: p, own, tax, total: p == null ? null : (p - tax) * x.qty };
  });
  const missing = [...ins, ...outs].some(r => r.total == null);
  const cost = ins.reduce((a, r) => a + (r.total || 0), 0);
  const revenue = outs.reduce((a, r) => a + (r.total || 0), 0);
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

  const xpHr = Object.fromEntries(Object.entries(m.xp || {}).map(([s, v]) => [s, v * perHour]));
  return {
    perHour, ins, outs, cost, revenue, taxEach, profit,
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
