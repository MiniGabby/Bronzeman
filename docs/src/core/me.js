// "Who are you?": the player picked in the header. Pages use it as their default player
// (Player tab, Money makers, skill training) and highlight it (Group page).
// Kept in this browser only, so every group member picks their own name once on their own device.
import { store } from "./store.js";

let me = store.get("me", "");
const listeners = new Set();

export const get = () => me;
export const onChange = fn => (listeners.add(fn), () => listeners.delete(fn));
export function set(name) {
  me = name || "";
  store.set("me", me);
  listeners.forEach(fn => fn());
}

/**
 * Highlight "my" column in every table under root whose header has my name.
 * Works for any table with one column per player.
 */
export function markColumns(root) {
  if (!me) return;
  for (const table of root.querySelectorAll("table")) {
    const head = table.tHead?.rows[0];
    if (!head) continue;
    const idx = [...head.cells].findIndex(c => c.textContent.trim().toLowerCase() === me.toLowerCase());
    if (idx < 1) continue;
    for (const row of table.rows) row.cells[idx]?.classList.add("me");
  }
}
