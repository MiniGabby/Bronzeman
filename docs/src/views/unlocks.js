// Unlocked items page: everything the group has unlocked, with who, when and the GE price.
import * as unlocks from "../core/unlocks.js";
import * as prices from "../core/prices.js";
import * as group from "../core/players.js";
import { goals as unlockGoals } from "../core/unlockGoals.js";
import { store } from "../core/store.js";
import { esc, gp, ago, nf } from "../core/format.js";

export const title = "Unlocked";

const when = iso => iso
  ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
  : "unknown";

export function mount(root) {
  const view = Object.assign({ q: "", by: "", sort: "newest" }, store.get("unlockView", {}));
  const save = () => store.set("unlockView", view);

  root.innerHTML = `
    <div data-f="summary"></div>
    <section class="section">
      <h2 class="pagetitle small">Unlock goals</h2>
      <p class="fine">Items nobody has unlocked yet that methods or routes on this site need, the most useful first. You only need one: after that everyone can buy them on the GE.</p>
      <div data-f="goals"></div>
    </section>
    <h2 class="pagetitle small">Unlocked items</h2>
    <form class="toolbar" data-f="form">
      <div class="field grow"><label for="u-q">Search</label>
        <input id="u-q" type="search" placeholder="Item name" autocomplete="off"></div>
      <div class="field"><label for="u-by">Unlocked by</label>
        <select id="u-by"><option value="">Everyone</option></select></div>
      <div class="field"><label for="u-sort">Sort by</label>
        <select id="u-sort">
          <option value="newest">Newest first</option>
          <option value="name">Name A–Z</option>
          <option value="price">GE price, high to low</option>
        </select></div>
      <div class="goal" data-f="count"></div>
    </form>
    <section class="board"><table>
      <thead><tr><th>Item</th><th>Unlocked by</th><th>When</th><th class="r">GE price</th></tr></thead>
      <tbody data-f="rows"><tr><td colspan="4" class="muted">Loading unlocked items…</td></tr></tbody>
    </table></section>`;

  const $ = s => root.querySelector(s);
  const q = $("#u-q"), by = $("#u-by"), sort = $("#u-sort");
  q.value = view.q;
  sort.value = view.sort;
  $('[data-f="form"]').addEventListener("submit", e => e.preventDefault());
  q.addEventListener("input", () => { view.q = q.value; save(); renderRows(); });
  by.addEventListener("change", () => { view.by = by.value; save(); renderRows(); });
  sort.addEventListener("change", () => { view.sort = sort.value; save(); renderRows(); });

  const midPrice = id => {
    const it = prices.item(id);
    if (it.high == null && it.low == null) return null;
    return ((it.high ?? it.low) + (it.low ?? it.high)) / 2;
  };

  function renderSummary() {
    const d = unlocks.data();
    const host = $('[data-f="summary"]');
    if (!d) {
      host.innerHTML = unlocks.error()
        ? `<p class="banner">Couldn't load the unlocked items (${esc(unlocks.error())}).</p>` : "";
      return;
    }
    const items = d.items || [];
    const newest = items[0];
    const counts = {};
    for (const i of items) counts[i.by] = (counts[i.by] || 0) + 1;
    host.innerHTML = `
      <div class="stats">
        <div class="stat"><span class="label">Items unlocked</span><span class="big num">${nf.format(items.length)}</span></div>
        <div class="stat"><span class="label">Newest unlock</span>
          <span class="val">${newest ? `${esc(newest.name)} <span class="muted">by ${esc(newest.by)}, ${esc(ago(newest.at))}</span>` : "–"}</span></div>
        <div class="stat"><span class="label">List last updated</span>
          <span class="val">${esc(when(d.generatedAt))} <span class="muted">(${esc(ago(d.generatedAt))})</span></span></div>
      </div>
      <div class="chips">${Object.entries(counts).sort((a, b) => b[1] - a[1])
        .map(([n, c]) => `<span class="chip">${esc(n)} · ${c}</span>`).join("")}</div>`;
    const opts = Object.keys(counts).sort((a, b) => a.localeCompare(b));
    by.innerHTML = `<option value="">Everyone</option>${opts.map(n => `<option>${esc(n)}</option>`).join("")}`;
    by.value = opts.includes(view.by) ? view.by : "";
  }

  function renderRows() {
    const d = unlocks.data();
    if (!d) return;
    const needle = view.q.trim().toLowerCase();
    let rows = (d.items || []).filter(i =>
      (!needle || i.name.toLowerCase().includes(needle)) && (!view.by || i.by === view.by));
    if (view.sort === "name") rows = [...rows].sort((a, b) => a.name.localeCompare(b.name));
    if (view.sort === "price") rows = [...rows].sort((a, b) => (midPrice(b.id) ?? -1) - (midPrice(a.id) ?? -1));
    const dayAgo = Date.now() - 86_400_000;
    $('[data-f="count"]').textContent = `${nf.format(rows.length)} of ${nf.format(d.items.length)} items`;
    $('[data-f="rows"]').innerHTML = rows.length ? rows.map(i => {
      const p = prices.ready() ? midPrice(i.id) : undefined;
      return `<tr>
        <td><a href="https://prices.runescape.wiki/osrs/item/${i.id}" target="_blank" rel="noopener">${esc(i.name)}</a>${i.at && new Date(i.at).getTime() > dayAgo ? ` <span class="pill good">New</span>` : ""}</td>
        <td>${esc(i.by)}</td>
        <td title="${esc(when(i.at))}">${esc(ago(i.at))}</td>
        <td class="r num">${p === undefined ? "…" : p == null ? "–" : gp(p)}</td>
      </tr>`;
    }).join("") : `<tr><td colspan="4" class="muted">No unlocked items match.</td></tr>`;
  }

  function renderGoals() {
    const host = $('[data-f="goals"]');
    const list = unlockGoals();
    if (!list) { host.innerHTML = `<p class="muted">Loading…</p>`; return; }
    if (!list.length) { host.innerHTML = `<p class="muted">Everything the site's methods need is unlocked.</p>`; return; }
    host.innerHTML = `<div class="board"><table>
      <thead><tr><th>Item</th><th>Holds back</th><th>How to get one</th><th>Who can get it</th></tr></thead>
      <tbody>${list.map(g => `<tr>
        <td>${g.id != null ? `<a href="https://prices.runescape.wiki/osrs/item/${g.id}" target="_blank" rel="noopener">${esc(g.name)}</a>` : esc(g.name)}</td>
        <td class="wrapcell"><b class="num">${g.methods.length}</b> method${g.methods.length > 1 ? "s" : ""}${g.steps ? ` · ${g.steps} route step${g.steps > 1 ? "s" : ""}` : ""}<div class="sub2">${esc(g.methods.map(m => m.name).join(", "))}</div></td>
        <td class="how">${g.tip ? esc(g.tip) : `<span class="muted">No tip yet</span>`}</td>
        <td class="wrapcell">${whoCell(g)}</td>
      </tr>`).join("")}</tbody>
    </table></div>`;
  }

  // Who meets the skill levels to get one now, or who's closest.
  function whoCell(g) {
    if (!g.reqs) return `<span class="muted">Requirements not on the site yet</span>`;
    if (!Object.keys(g.reqs).length) return `<span class="pill good">Anyone</span>`;
    if (!g.who.length) return `<span class="muted">Loading stats…</span>`;
    const now = g.who.filter(w => w.gap === 0);
    if (now.length) return `<span class="pill good">Can do it now</span> ${esc(now.map(w => w.p.name).join(", "))}`;
    const c = g.who[0];
    return `Closest: <b>${esc(c.p.name)}</b><div class="sub2">${esc(c.need.map(n => `${n.s} ${n.have}/${n.l}`).join(", "))}</div>`;
  }

  function render() { renderSummary(); renderGoals(); renderRows(); }
  const offs = [unlocks.onChange(render), prices.onChange(() => { renderGoals(); renderRows(); }), group.onChange(renderGoals)];
  render();
  return () => offs.forEach(off => off());
}
