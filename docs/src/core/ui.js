// Simple view: a switch in the header for larger text, plain labels and less on screen.
// Every page stays available; views ask simple() or t() while they render, and the app
// re-opens the current page when the switch changes.
import { store } from "./store.js";

const listeners = new Set();
export const onChange = fn => (listeners.add(fn), () => listeners.delete(fn));

export const simple = () => !!store.get("simple", false);

/** The normal label, or the plain one in Simple view: t("GP / XP", "Coins per XP"). */
export const t = (normal, plain) => (simple() ? plain : normal);

/** Marks the page so the stylesheet can enlarge it and hide the cells with class "simple-hide". */
export function apply() {
  document.documentElement.toggleAttribute("data-simple", simple());
}

export function setSimple(on) {
  store.set("simple", !!on);
  apply();
  listeners.forEach(fn => fn());
}

/** The first `n` sentences of a text, for shorter introductions in Simple view. */
export const firstSentences = (text, n = 2) => String(text || "").split(/(?<=[.!?])\s+(?=[A-Z0-9"])/).slice(0, n).join(" ");
