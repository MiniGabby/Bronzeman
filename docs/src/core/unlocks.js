// Items the group has unlocked (bronzeman: you can only buy an item on the GE after
// someone in the group obtained it). Data: data/unlocks.json, built from the group
// bronzeman plugin's exports by workspace/tools/build-unlocks.py.
const state = { data: null, ids: null, error: null };
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
    state.error = null;
  } catch (e) {
    state.error = e.message || String(e);
  }
  emit();
}

/** true / false once loaded, null while unknown. */
export const has = id => (state.ids ? state.ids.has(Number(id)) : null);

/** Input items of a method that nobody in the group has unlocked yet (null while loading). */
export function lockedInputs(method) {
  if (!state.ids) return null;
  return (method.inputs || []).filter(x => !state.ids.has(Number(x.id)));
}
