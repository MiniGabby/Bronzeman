// Items the group has unlocked (bronzeman: you can only buy an item on the GE after
// someone in the group obtained it). Data: data/unlocks.json, built from the group
// bronzeman plugin's exports by workspace/tools/build-unlocks.py.
import * as prices from "./prices.js";

const state = { data: null, ids: null, names: null, error: null };
const listeners = new Set();
const emit = () => listeners.forEach(fn => fn());

export const onChange = fn => (listeners.add(fn), () => listeners.delete(fn));
export const loaded = () => !!state.data;
export const data = () => state.data;
export const error = () => state.error;

export async function load() {
  try {
    const r = await fetch("data/unlocks.json", { cache: "no-cache" });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    state.data = await r.json();
    state.ids = new Set((state.data.items || []).map(i => i.id));
    state.names = new Set((state.data.items || []).map(i => i.name.toLowerCase()));
    state.error = null;
  } catch (e) {
    state.error = e.message || String(e);
  }
  emit();
}

/** true / false once loaded, null while unknown. */
export const has = id => (state.ids ? state.ids.has(Number(id)) : null);

/** Same, by exact item name. */
export const hasName = name => (state.names ? state.names.has(String(name).toLowerCase()) : null);

/** Is a method input/output entry ({ id } or { name }) unlocked? */
export function hasEntry(x) {
  if (!state.ids) return null;
  const id = prices.resolve(x);
  if (id != null) return state.ids.has(Number(id));
  return x.name ? state.names.has(x.name.toLowerCase()) : null;
}

/** Input items of a method that nobody in the group has unlocked yet, as { id, name } (null while loading). */
export function lockedInputs(method) {
  if (!state.ids) return null;
  return (method.inputs || [])
    .filter(x => hasEntry(x) === false)
    .map(x => {
      const id = prices.resolve(x);
      return { id, name: x.name || (id != null ? prices.item(id).name : `Item ${x.id}`) };
    });
}
