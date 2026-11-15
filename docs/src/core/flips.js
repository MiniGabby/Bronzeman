// Flip suggestions, shared by the Merching page and the player page.
// Candidates: unlocked items with a usable spread for your cash; plans: buy/sell hour and price from history.js.
// The math itself is in pattern.js (shared with the GitHub Action that tracks how the predictions turn out).
import * as prices from "./prices.js";
import * as unlocks from "./unlocks.js";
import * as history from "./history.js";
import * as pattern from "./pattern.js";

export const CANDIDATES = 40;   // items whose price history gets fetched

/** Unlocked items with a usable spread right now, best first. opts = { cash, minVol }. */
export const candidates = opts => pattern.candidates((unlocks.data()?.items || []).map(u => prices.item(u.id)), opts, CANDIDATES);

/** Buy/sell plan for one item, or { it, t } while its history loads, or { thin: true } if it's not a real market. */
export const plan = (it, opts) => pattern.plan(it, history.get(it.id), opts);

/** All plans for the current candidates (asks history.js for what it still needs). */
export function plans(opts) {
  const cands = candidates(opts);
  history.want(cands.map(it => it.id));
  return cands.map(it => plan(it, opts));
}
