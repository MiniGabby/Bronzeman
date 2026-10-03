// Flip suggestions, shared by the Merching page and the player page.
// Candidates: unlocked items with a usable spread for your cash; plans: buy/sell hour and price from history.js.
import * as prices from "./prices.js";
import * as unlocks from "./unlocks.js";
import * as history from "./history.js";
import { geTax } from "./format.js";

export const CANDIDATES = 40;   // items whose price history gets fetched

/** Unlocked items with a usable spread right now, best first. opts = { cash, minVol }. */
export function candidates(opts) {
  return (unlocks.data()?.items || []).map(u => prices.item(u.id))
    .filter(it => it.limit && it.high > 0 && it.low > 0 && it.vol >= opts.minVol && it.low <= opts.cash && it.high <= it.low * 1.3)
    .map(it => {
      const qty = Math.min(it.limit, Math.floor(opts.cash / it.low));
      const margin = it.high - geTax(it.high) - it.low;
      return { it, score: qty * Math.max(margin, it.low * 0.005) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, CANDIDATES)
    .map(c => c.it);
}

/** Buy/sell plan for one item, or { it, t } while its history loads, or { thin: true } if it's not a real market. */
export function plan(it, opts) {
  const t = history.get(it.id);
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

/** All plans for the current candidates (asks history.js for what it still needs). */
export function plans(opts) {
  const cands = candidates(opts);
  history.want(cands.map(it => it.id));
  return cands.map(it => plan(it, opts));
}
