// Number and text formatting shared by every page.
export const nf = new Intl.NumberFormat("en-US");

export const gp = n => (n == null || !isFinite(n) ? "–" : nf.format(Math.round(n)));

export function short(n) {
  if (n == null || !isFinite(n)) return "–";
  const a = Math.abs(n), s = n < 0 ? "-" : "";
  if (a >= 1e9) return s + (a / 1e9).toFixed(2) + "B";
  if (a >= 1e6) return s + (a / 1e6).toFixed(2) + "M";
  if (a >= 1e4) return s + (a / 1e3).toFixed(1) + "K";
  return s + nf.format(Math.round(a));
}

export const signed = (n, f = short) => (n == null || !isFinite(n) ? "–" : (n > 0 ? "+" : "") + f(n));

export const qty = q => nf.format(q >= 10 ? Math.round(q) : Math.round(q * 100) / 100);

export function duration(h) {
  if (h == null || !isFinite(h)) return "–";
  if (h < 1) return Math.max(1, Math.round(h * 60)) + " min";
  return (h < 10 ? h.toFixed(1) : nf.format(Math.round(h))) + " h";
}

export function ago(date) {
  if (!date) return "never";
  const s = (Date.now() - new Date(date).getTime()) / 1000;
  if (s < 90) return "just now";
  if (s < 5400) return Math.round(s / 60) + " min ago";
  if (s < 172800) return Math.round(s / 3600) + " h ago";
  return Math.round(s / 86400) + " days ago";
}

export const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export const cls = n => (n > 0 ? "pos" : n < 0 ? "neg" : "");

// Grand Exchange tax: 2% per item, rounded down, max 5M; items under 50 gp are exempt.
export const geTax = price => (price < 50 ? 0 : Math.min(Math.floor(price * 0.02), 5_000_000));

/** The plural of a method's action word: "catch" → "catches", "fish" stays "fish". */
export const plural = (word, n) => n === 1 || /(fish|essence|pay-dirt|granite|amethyst)$/.test(word) ? word : /(ch|sh|s|x)$/.test(word) ? word + "es" : word + "s";
