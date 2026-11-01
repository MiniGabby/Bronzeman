// Boat upgrades (#/boats), part of the Sailing guide. Per account: your boats, which parts and facilities
// each one has, which ones you plan to build (with a shopping list), and what the rest up to your Sailing
// level costs in materials (GE prices, unlocked or not).
// Parts and recipes come from data/boat-upgrades.js (generated from the wiki's Sailing level up table).
// What's ticked is kept in this browser per account (core/store.js). "Save to GitHub" opens a pre-filled issue
// (.github/ISSUE_TEMPLATE/boat-save.yml); a GitHub Action copies it to data/boats.json, which every browser reads.
// Whichever is newer, this browser's copy or the saved one, is shown.
import PARTS from "../../data/boat-upgrades.js";
import PLAYERS from "../../data/players.js";
import SITE from "../../data/site.js";
import * as group from "../core/players.js";
import * as prices from "../core/prices.js";
import * as unlocks from "../core/unlocks.js";
import * as me from "../core/me.js";
import { store } from "../core/store.js";
import { tipFor } from "../core/unlockTips.js";
import { esc, gp, nf, short, ago } from "../core/format.js";

export const title = "Boat upgrades";

const BOATS = { Raft: 1, Skiff: 15, Sloop: 50 };   // boat type → Sailing level to sail it
const wiki = page => `https://oldschool.runescape.wiki/w/${encodeURIComponent(page.replace(/ /g, "_"))}`;
const MAX_URL = 7500;   // GitHub refuses much longer "new issue" links; longer saves go via the clipboard

// Parts of one kind replace each other (an oak hull replaces the wooden one), so a better one makes the
// lower ones unnecessary. Everything else is its own kind.
const KINDS = [[/hull$/, "Hull"], [/helm$/, "Helm"], [/keel$/, "Keel"], [/mast and/, "Mast and sails"],
  [/cargo hold$/, "Cargo hold"], [/salvaging hook$/, "Salvaging hook"], [/cannon$/, "Cannon"],
  [/trawling net$/, "Trawling net"], [/teleport focus$/, "Teleport focus"], [/catcher$/, "Wind catcher"],
  [/chum station$/, "Chum station"]];
const kindOf = part => KINDS.find(([re]) => re.test(part.name.toLowerCase()))?.[1] || part.name;
// A raft only takes the parts with a raft recipe; facilities ("Any") go on a skiff or sloop.
const recipeFor = (part, type) => part.recipes[type] || (type !== "Raft" ? part.recipes.Any : null) || null;
const partByName = new Map(PARTS.map(p => [p.name, p]));
// Parts every new boat already has (level 1 on the level up table).
const STARTER = PARTS.filter(p => p.sailing === 1).map(p => p.name);

let uid = 0;
const newId = () => Date.now().toString(36) + (uid++).toString(36);
const newBoat = (type, name) => ({ id: newId(), name: name || type, type, done: STARTER.filter(n => recipeFor(partByName.get(n), type)), planned: [] });

// data/boats.json, saved through GitHub. Loaded once per visit.
let saved = null, savedLoading = null;
const loadSaved = () => savedLoading ||= fetch("data/boats.json", { cache: "no-cache" })
  .then(r => (r.ok ? r.json() : { accounts: {} })).catch(() => ({ accounts: {} }))
  .then(d => (saved = d.accounts || {}));

export function mount(root) {
  let account = "";
  let state = null;   // { boats, current, target, all, updatedAt, pushedAt } for the account

  root.innerHTML = `
    <nav class="crumb"><a href="#/training">All skills</a> / <a href="#/training/sailing">Sailing</a> / Boat upgrades</nav>
    <h2 class="pagetitle">Boat upgrades</h2>
    <p class="lead">Tick what you've built on each boat, and what you plan to build next. The shopping list adds up the materials for every planned upgrade; below it is everything that's left up to your Sailing level, with live GE prices and what the group hasn't unlocked yet.</p>
    <form class="toolbar" data-f="form" onsubmit="return false">
      <div class="field"><label for="b-player">Account</label><select id="b-player"></select></div>
      <div class="field"><label for="b-boat">Boat</label><select id="b-boat"></select></div>
      <div class="field"><label for="b-target">Up to Sailing level</label><input id="b-target" type="number" min="1" max="99" inputmode="numeric"></div>
      <label class="check"><input type="checkbox" id="b-all"> Count every upgrade</label>
    </form>
    <div class="boatbar" data-f="boatbar"></div>
    <div class="boatsync" data-f="sync"></div>
    <section class="section" data-f="plan"></section>
    <section class="section" data-f="needs"></section>
    <section class="section" data-f="parts"></section>
    <p class="fine">Recipes from the wiki's <a href="https://oldschool.runescape.wiki/w/Sailing/Level_up_table" target="_blank" rel="noopener">Sailing level up table</a> and each part's page. A sloop needs Sailing 50 for every part. Facilities (cargo hold, hooks, cannon and so on) only fit on a skiff or sloop, and how many fit depends on the boat; this page counts one of each. Hull and keel parts are made at a shipyard workbench from planks and bars.</p>`;

  const $ = s => root.querySelector(s);
  const playerSel = $("#b-player"), boatSel = $("#b-boat"), tgt = $("#b-target"), every = $("#b-all");

  const player = () => group.all().find(p => p.name.toLowerCase() === account.toLowerCase());
  const lvl = skill => { const p = player(); return p?.skills ? group.level(p, skill) : null; };
  const key = () => "boats:" + account.toLowerCase();
  const save = () => { state.updatedAt = new Date().toISOString(); store.set(key(), state); };
  const boat = () => state.boats.find(b => b.id === state.current) || state.boats[0] || null;
  const target = () => state.target ?? lvl("Sailing") ?? 1;
  const savedFor = () => saved?.[account.toLowerCase()] || null;

  // This browser's copy, or the one saved on GitHub when that's newer (or there's nothing here).
  function load(name) {
    account = name;
    const local = store.get(key(), null), remote = savedFor();
    if (remote && (!local || (local.updatedAt || "") < remote.savedAt)) {
      state = {
        boats: remote.boats.map(b => ({ id: b.id || newId(), name: b.name, type: b.type, done: [...b.done], planned: [...(b.planned || [])] })),
        target: remote.target ?? null, all: !!remote.all, updatedAt: remote.savedAt, pushedAt: remote.savedAt
      };
      state.current = state.boats.find(b => b.id === local?.current)?.id || state.boats[0]?.id || null;
      store.set(key(), state);
    } else if (local) {
      state = local;
      state.boats.forEach(b => (b.planned ||= []));
    } else {
      const b = newBoat((lvl("Sailing") || 1) >= 15 ? "Skiff" : "Raft");
      state = { boats: [b], current: b.id, target: null, all: false };
    }
  }

  function fillPlayers() {
    const names = PLAYERS.map(n => group.all().find(p => p.name.toLowerCase() === n.toLowerCase())?.name || n);
    playerSel.innerHTML = names.map(n => `<option value="${esc(n)}">${esc(n)}</option>`).join("");
    playerSel.value = names.find(n => n.toLowerCase() === account.toLowerCase()) || names[0];
  }

  // Every part of a boat, with what to do about it up to the level.
  function rows(b) {
    const lv = target(), con = lvl("Construction"), p = player();
    const list = PARTS.map(part => ({ part, recipe: recipeFor(part, b.type), kind: kindOf(part) }))
      .filter(r => r.recipe)
      .map(r => ({ ...r, need: Math.max(r.part.sailing, r.recipe.sailing || 0), con: r.recipe.construction ?? r.part.construction }));
    const done = new Set(b.done), planned = new Set(b.planned);
    // Best part of each kind already built, and the best one within reach that you can get the materials for.
    const bestDone = new Map(), bestReach = new Map();
    for (const r of list) {
      if (done.has(r.part.name)) bestDone.set(r.kind, Math.max(bestDone.get(r.kind) || 0, r.need));
      if (r.need <= lv && usable(r.recipe)) bestReach.set(r.kind, Math.max(bestReach.get(r.kind) || 0, r.need));
    }
    return list.map(r => {
      let status;
      if (done.has(r.part.name)) status = "done";
      else if (r.need > lv) status = "later";
      else if ((bestDone.get(r.kind) || 0) > r.need) status = "skip";            // a better one is built
      else if (state.all) status = "todo";
      else if ((bestReach.get(r.kind) || 0) > r.need) status = "skip";          // a better one you can make
      else status = usable(r.recipe) ? "todo" : "locked";                        // better, but materials still locked
      const quest = r.part.quest && p && group.questDone(p, r.part.quest) === false ? r.part.quest : null;
      return { ...r, status, planned: planned.has(r.part.name), conShort: con != null && r.con > con ? r.con : null, quest };
    });
  }

  const itemName = name => unlocks.hasName(name) === false
    ? `<span class="neg" title="Nobody in the group has unlocked this yet">${esc(name)}</span>` : esc(name);
  const mats = recipe => recipe.materials.map(([n, q]) => `${nf.format(q)} ${itemName(n)}`).join(", ");
  // Can the group get every material? Unlocked, or easy to unlock (a tip in data/unlock-tips.js). Unknown while loading = yes.
  const usable = recipe => recipe.materials.every(([n]) => unlocks.hasName(n) !== false || tipFor(n));

  // Materials of a list of recipes added up, as a table with GE prices. Returns { html, cost, locked }.
  function materialTable(recipes) {
    const total = new Map();
    for (const r of recipes) for (const [n, q] of r.materials) total.set(n, (total.get(n) || 0) + q);
    const items = [...total].map(([name, qty]) => {
      const id = prices.idOf(name), each = id != null ? prices.price(id, "buy").p : null;
      return { name, qty, each, cost: each != null ? each * qty : null, unlocked: unlocks.hasName(name) };
    }).sort((a, b) => (b.cost ?? -1) - (a.cost ?? -1));
    const html = `<div class="board"><table><thead><tr><th>Item</th><th class="r">Amount</th><th class="r">GE price</th><th class="r">Total</th><th>Unlocked</th></tr></thead><tbody>
      ${items.map(i => `<tr${i.unlocked === false ? ` class="locked"` : ""}><td><a href="${wiki(i.name)}" target="_blank" rel="noopener">${esc(i.name)}</a>${i.unlocked === false && tipFor(i.name) ? `<div class="sub2">${esc(tipFor(i.name))}</div>` : ""}</td>
        <td class="r num">${nf.format(i.qty)}</td><td class="r num">${i.each == null ? "–" : gp(i.each)}</td><td class="r num">${i.cost == null ? "–" : gp(i.cost)}</td>
        <td>${i.unlocked == null ? `<span class="muted">…</span>` : i.unlocked ? `<span class="pill good">Yes</span>` : `<span class="pill bad">No</span>`}</td></tr>`).join("")}
    </tbody></table></div>`;
    const summary = `about <b>${short(items.reduce((t, i) => t + (i.cost || 0), 0))}</b> gp at GE prices${items.some(i => i.cost == null) ? ", not counting items without a GE price" : ""}.`
      + (items.some(i => i.unlocked === false) ? ` <span class="neg">${items.filter(i => i.unlocked === false).length} item(s) not unlocked yet.</span>` : "");
    return { html, summary };
  }

  // Shopping list: every planned upgrade on every boat of this account.
  function renderPlan() {
    const planned = state.boats.flatMap(b => b.planned.map(n => partByName.get(n))
      .filter(p => p && recipeFor(p, b.type)).map(p => ({ b, part: p, recipe: recipeFor(p, b.type) })));
    const many = state.boats.length > 1;
    const t = materialTable(planned.map(x => x.recipe));
    $('[data-f="plan"]').innerHTML = `
      <div class="sechead"><h2 class="pagetitle small">Shopping list</h2></div>
      ${planned.length ? `<p class="fine">Materials for the ${planned.length} planned upgrade${planned.length === 1 ? "" : "s"}${many ? " on all your boats" : ""}: ${t.summary} Built parts drop off the list by themselves.</p>
        <div class="chips">${planned.map(x => `<span class="chip">${many ? `${esc(x.b.name)}: ` : ""}${esc(x.part.name)}</span>`).join("")}</div>
        ${t.html}` : `<p class="muted">Nothing planned yet. Tick "Plan" next to an upgrade below to put its materials on this list.</p>`}`;
  }

  function renderNeeds(list) {
    const todo = list.filter(r => r.status === "todo"), locked = list.filter(r => r.status === "locked");
    const t = materialTable(todo.map(r => r.recipe));
    $('[data-f="needs"]').innerHTML = `
      <div class="sechead"><h2 class="pagetitle small">Everything up to Sailing ${target()}</h2></div>
      ${todo.length ? `<p class="fine">For the ${todo.length} upgrade${todo.length === 1 ? "" : "s"} still to build on this ${esc(boat().type.toLowerCase())}${state.all ? "" : ", only the best of each kind you can get the materials for"}: ${t.summary}</p>
      ${t.html}` : `<p class="muted">Nothing left to build on this boat up to Sailing ${target()}.</p>`}
      ${locked.length ? `<p class="fine"><span class="neg">Not counted, materials still locked:</span> ${locked.map(r => esc(r.part.name)).join(", ")}. Once the group unlocks them (or there's an easy way to), they take the place of the lower ones.</p>` : ""}`;
  }

  function renderParts(list) {
    const shown = list.filter(r => r.status !== "later" || r.planned);
    const next = list.filter(r => r.status === "later" && !r.planned).sort((a, b) => a.need - b.need).slice(0, 6);
    const label = { done: `<span class="pill good">Built</span>`, todo: `<span class="pill warn">To build</span>`, skip: `<span class="muted">Not needed</span>`, locked: `<span class="pill bad" title="Some materials aren't unlocked and have no easy way to unlock them">Locked items</span>`, later: `<span class="muted">Later</span>` };
    const row = r => `<tr class="${r.status === "skip" || r.status === "later" ? "locked" : ""}">
      <td><input type="checkbox" data-part="${esc(r.part.name)}" aria-label="${esc(r.part.name)} built"${r.status === "done" ? " checked" : ""}${r.status === "later" ? " disabled" : ""}></td>
      <td><input type="checkbox" data-plan="${esc(r.part.name)}" aria-label="Plan ${esc(r.part.name)}"${r.planned ? " checked" : ""}${r.status === "done" ? " disabled" : ""}></td>
      <td><a href="${wiki(r.part.page)}" target="_blank" rel="noopener">${esc(r.part.name)}</a>
        ${r.status === "skip" && r.kind !== r.part.name ? `<div class="sub2">You have or can make a better ${esc(r.kind.toLowerCase())}: no need to build this one first.</div>` : ""}</td>
      <td class="r num">${r.need}</td>
      <td class="r num${r.conShort ? " neg" : ""}" ${r.conShort ? `title="Your Construction level is too low"` : ""}>${r.con ?? "–"}</td>
      <td>${label[r.status]}${r.planned ? ` <span class="pill">Planned</span>` : ""}${r.quest ? ` <span class="pill bad" title="Quest not done yet">${esc(r.quest)}</span>` : ""}</td>
      <td class="wrapcell">${mats(r.recipe)}</td></tr>`;
    $('[data-f="parts"]').innerHTML = `
      <div class="sechead"><h2 class="pagetitle small">Upgrades on this ${esc(boat().type.toLowerCase())}</h2></div>
      <p class="fine">Tick "Built" once a part is on the boat, and "Plan" for what you want to build next. You don't have to build the lower ones first: a part is "not needed" when a better one of the same kind is built${state.all ? "" : ", or within reach with materials the group has (or can easily get)"}. A red Construction level is above yours: you can still have a shipwright build it for a fee.</p>
      <div class="board"><table><thead><tr><th>Built</th><th>Plan</th><th>Part</th><th class="r">Sailing</th><th class="r">Construction</th><th>Status</th><th>Materials (${esc(boat().type)})</th></tr></thead><tbody>
        ${shown.map(row).join("")}
        ${next.length ? `<tr><td colspan="7" class="muted"><b>Coming up</b></td></tr>${next.map(row).join("")}` : ""}
      </tbody></table></div>`;
  }

  function renderBoatbar() {
    const b = boat();
    boatSel.innerHTML = state.boats.map(x => `<option value="${esc(x.id)}">${esc(x.name)}${x.name === x.type ? "" : ` (${esc(x.type)})`}</option>`).join("");
    boatSel.value = b?.id || "";
    const sail = lvl("Sailing") || 1;
    $('[data-f="boatbar"]').innerHTML = `<div class="chips">
      ${b ? `<label class="check">Type <select data-a="type">${Object.entries(BOATS).map(([t, l]) => `<option${t === b.type ? " selected" : ""}${l > sail && t !== b.type ? " disabled" : ""}>${t}</option>`).join("")}</select></label>
      <button type="button" class="btn small" data-a="rename">Rename</button>
      <button type="button" class="btn small" data-a="remove">Remove boat</button>` : ""}
      <button type="button" class="btn small" data-a="add">Add a boat</button></div>`;
  }

  // Is this browser's copy on GitHub? Saved = the saved copy is at least as new as the last change here.
  function renderSync() {
    const remote = savedFor(), at = state.updatedAt || "";
    let msg;
    if (saved == null) msg = `<span class="muted">Checking what's saved on GitHub…</span>`;
    else if (remote && remote.savedAt >= at) msg = `<span class="pill good">Saved on GitHub</span> <span class="muted">${esc(ago(new Date(remote.savedAt)))}${remote.by ? ` by ${esc(remote.by)}` : ""}</span>`;
    else if (state.pushedAt && state.pushedAt >= at) msg = `<span class="pill warn">Waiting for GitHub</span> <span class="muted">Post the issue that opened; the site picks it up a minute or two later.</span>`;
    else msg = `<span class="pill warn">Only in this browser</span> <span class="muted">${remote ? "Changed since the last save." : "Not saved on GitHub yet."} Clearing the browser's data would lose it.</span>`;
    $('[data-f="sync"]').innerHTML = `<div class="chips">${msg}
      <button type="button" class="btn small primary" data-a="push">Save to GitHub</button></div>
      <p class="fine">Saving opens a pre-filled GitHub issue (you need a free GitHub account): press "Create" there and the boats of ${esc(account)} are saved on the site, for every device and everyone in the group. Without an account it stays in this browser only.</p>`;
  }

  function render() {
    if (!state) return;
    fillPlayers();
    tgt.value = target();
    tgt.placeholder = lvl("Sailing") ?? "";
    every.checked = !!state.all;
    renderBoatbar();
    renderSync();
    renderPlan();
    const b = boat();
    if (!b) { $('[data-f="needs"]').innerHTML = `<p class="muted">No boats yet. Add one above.</p>`; $('[data-f="parts"]').innerHTML = ""; return; }
    const list = rows(b);
    renderNeeds(list);
    renderParts(list);
  }

  // Opens the issue form with this account's boats as JSON (read by .github/scripts/build-boats.js).
  async function push() {
    if (!state.updatedAt) save();
    const data = JSON.stringify({
      account, savedAt: state.updatedAt, target: state.target ?? null, all: !!state.all,
      boats: state.boats.map(({ id, name, type, done, planned }) => ({ id, name, type, done, planned }))
    });
    const params = new URLSearchParams({ template: "boat-save.yml", title: `[Boats] ${account}`, account, data });
    let url = `https://github.com/${SITE.repo}/issues/new?${params}`;
    if (url.length > MAX_URL) {
      // Too long for a link: copy it, and the form opens with an empty box to paste it in.
      params.delete("data");
      url = `https://github.com/${SITE.repo}/issues/new?${params}`;
      try { await navigator.clipboard.writeText(data); } catch {}
      alert("Your boats are too much for a link, so they're copied to your clipboard. Paste them in the \"Saved boats\" box on GitHub.");
    }
    state.pushedAt = state.updatedAt;
    store.set(key(), state);
    window.open(url, "_blank", "noopener");
    render();
  }

  playerSel.addEventListener("change", () => { load(playerSel.value); render(); });
  boatSel.addEventListener("change", () => { state.current = boatSel.value; store.set(key(), state); render(); });
  tgt.addEventListener("change", () => {
    const v = Math.max(1, Math.min(99, parseInt(tgt.value, 10) || 0));
    state.target = !tgt.value || v === lvl("Sailing") ? null : v;   // empty or your own level: follow the account
    save(); render();
  });
  every.addEventListener("change", () => { state.all = every.checked; save(); render(); });
  const toggle = (list, name, on) => (on ? [...new Set([...list, name])] : list.filter(n => n !== name));
  root.addEventListener("change", e => {
    const b = boat();
    if (!b) return;
    if (e.target.dataset.part) {
      b.done = toggle(b.done, e.target.dataset.part, e.target.checked);
      if (e.target.checked) b.planned = toggle(b.planned, e.target.dataset.part, false);   // built: off the shopping list
    } else if (e.target.dataset.plan) {
      b.planned = toggle(b.planned, e.target.dataset.plan, e.target.checked);
    } else if (e.target.matches('select[data-a="type"]')) {
      b.type = e.target.value;
    } else return;
    save(); render();
  });
  root.addEventListener("click", e => {
    const a = e.target.closest("button[data-a]")?.dataset.a, b = boat();
    if (a === "push") return push();
    if (a === "add") {
      const sail = lvl("Sailing") || 1;
      const type = sail >= 50 ? "Sloop" : sail >= 15 ? "Skiff" : "Raft";
      const name = prompt("Name of the new boat", `${type} ${state.boats.length + 1}`);
      if (name == null) return;
      const nb = newBoat(type, name.trim() || type);
      state.boats.push(nb); state.current = nb.id;
    } else if (a === "rename" && b) {
      const name = prompt("New name for this boat", b.name);
      if (!name?.trim()) return;
      b.name = name.trim().slice(0, 40);
    } else if (a === "remove" && b) {
      if (!confirm(`Remove ${b.name} and everything ticked on it?`)) return;
      state.boats = state.boats.filter(x => x !== b); state.current = state.boats[0]?.id || null;
    } else return;
    save(); render();
  });

  // Default account: "You" in the header, else the first player. Waits for the saved boats, and for the
  // levels when this account has nothing yet, so a new first boat gets the right type.
  const pick = () => PLAYERS.find(n => n.toLowerCase() === (me.get() || "").toLowerCase()) || PLAYERS[0];
  function start() {
    if (!state && saved && (group.loaded() || store.get("boats:" + pick().toLowerCase(), null) || saved[pick().toLowerCase()])) load(pick());
    render();
  }
  let alive = true;
  loadSaved().then(() => alive && start());
  const offs = [group.onChange(start), prices.onChange(render), unlocks.onChange(render), me.onChange(() => { load(pick()); render(); })];
  start();
  if (!state) $('[data-f="plan"]').innerHTML = `<p class="muted">Loading…</p>`;
  return () => { alive = false; offs.forEach(off => off()); };
}
