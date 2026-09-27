// Per-browser settings (price mode, own prices, actions per hour, training goals).
// localStorage can be unavailable (private mode), so every call is wrapped.
const PREFIX = "bmm:";

export const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(PREFIX + key);
      return v == null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch {}
  }
};
