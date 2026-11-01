// Boat upgrades (#/boats), part of the Sailing guide. Per account: your boats, which parts and facilities
// each one has, and what the rest up to your Sailing level costs in materials (GE prices, unlocked or not).
// Parts and recipes come from data/boat-upgrades.js (generated from the wiki's Sailing level up table).
// What's built is kept in this browser per account, like the other settings (core/store.js).
import PARTS from "../../data/boat-upgrades.js";
import PLAYERS from "../../data/players.js";
import * as group from "../core/players.js";
import * as prices from "../core/prices.js";
import * as unlocks from "../core/unlocks.js";
import * as me from "../core/me.js";
import { store } from "../core/store.js";
import { tipFor } from "../core/unlockTips.js";
import { esc, gp, nf, short } from "../core/format.js";

export const title = "Boat upgrades";

const BOATS = { Raft: 1, Skiff: 15, Sloop: 50 };   // boat type → Sailing level to sail it
const wiki = page => `https://oldschool.runescape.wiki/w/${encodeURIComponent(page.replace(/ /g, "_"))}`;

// Parts of one kind replace each other (an oak hull replaces the wooden one), so a better one makes the
// lower ones unnecessary. Everything else is its own kind.
const KINDS = [[/hull$/, "Hull"], [/helm$/, "Helm"], [/keel$/, "Keel"], [/mast and/, "Mast and sails"],
  [/cargo hold$/, "Cargo hold"], [/salvaging hook$/, "Salvaging hook"], [/cannon$/, "Cannon"],
  [/trawling net$/, "Trawling net"], [/teleport focus$/, "Teleport focus"], [/catcher$/, "Wind catcher"],
  [/chum station$/, "Chum station"]];
const kindOf = part => KINDS.find(([re]) => re.test(part.name.toLowerCase()))?.[1] || part.name;
// A raft only takes the parts with a raft recipe; facilities ("Any") go on a skiff or sloop.
const recipeFor = (part, type) => part.recipes[type] || (type !== "Raft" ? part.recipes.Any : null) || null;
// Parts every new boat already has (level 1 on the level up table).
const STARTER = PARTS.filter(p => p.sailing === 1).map(p => p.name);

const newBoat = (type, name) => ({ id: Date.now().toString(36), name: name || type, type, done: STARTER.filter(n => PARTS.some(p => p.name === n && recipeFor(p, type))) });

export function mount(root) {
  let account = "";
  let state = null;   // { boats: [...], current: id, target: level or null, best: bool } for the account

  root.innerHTML = `
    <nav class="crumb"><a href="#/training">All skills</a> / <a href="#/training/sailing">Sailing</a> / Boat upgrades</nav>
    <h2 class="pagetitle">Boat upgrades</h2>
    <p class="lead">Tick what you've built on each boat. The list below then shows what's left up to your Sailing level, and exactly which materials you need for it, with live GE prices and what the group hasn't unlocked yet.</p>
    <form class="toolbar" data-f="form" onsubmit="return false">
      <div class="field"><label for="b-player">Account</label><select id="b-player"></select></div>
      <div class="field"><label for="b-boat">Boat</label><select id="b-boat"></select></div>
      <div class="field"><label for="b-target">Up to Sailing level</label><input id="b-target" type="number" min="1" max="99" inputmode="numeric"></div>
      <label class="check"><input type="checkbox" id="b-best"> Only the best of each kind</label>
    </form>
    <div class="boatbar" data-f="boatbar"></div>
    <section class="section" data-f="needs"></section>
    <section class="section" data-f="parts"></section>
    <p class="fine">Recipes from the wiki's <a href="https://oldschool.runescape.wiki/w/Sailing/Level_up_table" target="_blank" rel="noopener">Sailing level up table</a> and each part's page. A sloop needs Sailing 50 for every part. Facilities (cargo hold, hooks, cannon and so on) only fit on a skiff or sloop, and how many fit depends on the boat; this page counts one of each. Hull and keel parts are made at a shipyard workbench from planks and bars. What you tick is saved in this browser only.</p>`;

  const $ = s => root.querySelector(s);
  const playerSel = $("#b-player"), boatSel = $("#b-boat"), tgt = $("#b-target"), best = $("#b-best");

  const player = () => group.all().find(p => p.name.toLowerCase() === account.toLowerCase());
  const lvl = skill => { const p = player(); return p?.skills ? group.level(p, skill) : null; };
  const save = () => store.set("boats:" + account.toLowerCase(), state);
  const boat = () => state.boats.find(b => b.id === state.current) || state.boats[0] || null;
  const target = () => state.target ?? lvl("Sailing") ?? 1;

  function load(name) {
    account = name;
    state = store.get("boats:" + name.toLowerCase(), null);
    if (!state) {
      const sail = lvl("Sailing") || 1;
      const b = newBoat(sail >= 15 ? "Skiff" : "Raft");
      state = { boats: [b], current: b.id, target: null, best: false };
    }
  }

  function fillPlayers() {
    const names = PLAYERS.map(n => group.all().find(p => p.name.toLowerCase() === n.toLowerCase())?.name || n);
    playerSel.innerHTML = names.map(n => `<option value="${esc(n)}">${esc(n)}</option>`).join("");
    playerSel.value = names.find(n => n.toLowerCase() === account.toLowerCase()) || names[0];
  }

  // Every part of this boat up to the level, with what to do about it.
  function rows(b) {
    const lv = target(), con = lvl("Construction"), p = player();
    const list = PARTS.map(part => ({ part, recipe: recipeFor(part, b.type), kind: kindOf(part) }))
      .filter(r => r.recipe)
      .map(r => ({ ...r, need: Math.max(r.part.sailing, r.recipe.sailing || 0), con: r.recipe.construction ?? r.part.construction }));
    const done = new Set(b.done);
    // Best part of each kind already built, and the best one within reach.
    const bestDone = new Map(), bestReach = new Map();
    for (const r of list) {
      if (done.has(r.part.name)) bestDone.set(r.kind, Math.max(bestDone.get(r.kind) || 0, r.need));
      if (r.need <= lv) bestReach.set(r.kind, Math.max(bestReach.get(r.kind) || 0, r.need));
    }
    return list.map(r => {
      let status;
      if (done.has(r.part.name)) status = "done";
      else if (r.need > lv) status = "later";
      else if ((bestDone.get(r.kind) || 0) > r.need) status = "skip";            // a better one is built
      else if (state.best && bestReach.get(r.kind) > r.need) status = "skip";    // only build the best
      else status = "todo";
      const quest = r.part.quest && p && group.questDone(p, r.part.quest) === false ? r.part.quest : null;
      return { ...r, status, conShort: con != null && r.con > con ? r.con : null, quest };
    });
  }

  const itemName = (name, qty) => {
    const ok = unlocks.hasName(name);
    return ok === false ? `<span class="neg" title="Nobody in the group has unlocked this yet">${esc(name)}</span>` : esc(name);
  };
  const mats = recipe => recipe.materials.map(([n, q]) => `${nf.format(q)} ${itemName(n)}`).join(", ");

  function renderNeeds(list) {
    const todo = list.filter(r => r.status === "todo");
    const total = new Map();
    for (const r of todo) for (const [n, q] of r.recipe.materials) total.set(n, (total.get(n) || 0) + q);
    const items = [...total].map(([name, qty]) => {
      const id = prices.idOf(name), each = id != null ? prices.price(id, "buy").p : null;
      return { name, qty, each, cost: each != null ? each * qty : null, unlocked: unlocks.hasName(name) };
    }).sort((a, b) => (b.cost ?? -1) - (a.cost ?? -1));
    const cost = items.reduce((t, i) => t + (i.cost || 0), 0);
    const locked = items.filter(i => i.unlocked === false);
    $('[data-f="needs"]').innerHTML = `
      <div class="sechead"><h2 class="pagetitle small">Materials needed</h2></div>
      ${todo.length ? `<p class="fine">For the ${todo.length} upgrade${todo.length === 1 ? "" : "s"} still to build on this ${esc(boat().type.toLowerCase())} up to Sailing ${target()}${state.best ? " (only the best of each kind)" : ""}: about <b>${short(cost)}</b> gp at GE prices${items.some(i => i.cost == null) ? ", not counting items without a GE price" : ""}.${locked.length ? ` <span class="neg">${locked.length} item${locked.length === 1 ? " isn't" : "s aren't"} unlocked yet.</span>` : ""}</p>
      <div class="board"><table><thead><tr><th>Item</th><th class="r">Amount</th><th class="r">GE price</th><th class="r">Total</th><th>Unlocked</th></tr></thead><tbody>
        ${items.map(i => `<tr${i.unlocked === false ? ` class="locked"` : ""}><td><a href="${wiki(i.name)}" target="_blank" rel="noopener">${esc(i.name)}</a>${i.unlocked === false && tipFor(i.name) ? `<div class="sub2">${esc(tipFor(i.name))}</div>` : ""}</td>
          <td class="r num">${nf.format(i.qty)}</td><td class="r num">${i.each == null ? "–" : gp(i.each)}</td><td class="r num">${i.cost == null ? "–" : gp(i.cost)}</td>
          <td>${i.unlocked == null ? `<span class="muted">…</span>` : i.unlocked ? `<span class="pill good">Yes</span>` : `<span class="pill bad">No</span>`}</td></tr>`).join("")}
      </tbody></table></div>` : `<p class="muted">Nothing left to build on this boat up to Sailing ${target()}.</p>`}`;
  }

  function renderParts(list) {
    const shown = list.filter(r => r.status !== "later");
    const next = list.filter(r => r.status === "later").sort((a, b) => a.need - b.need).slice(0, 6);
    const label = { done: `<span class="pill good">Built</span>`, todo: `<span class="pill warn">To build</span>`, skip: `<span class="muted">Not needed</span>`, later: "" };
    const row = r => `<tr class="${r.status === "skip" || r.status === "later" ? "locked" : ""}">
      <td><label class="check"><input type="checkbox" data-part="${esc(r.part.name)}"${r.status === "done" ? " checked" : ""}${r.status === "later" ? " disabled" : ""}>
        <a href="${wiki(r.part.page)}" target="_blank" rel="noopener">${esc(r.part.name)}</a></label>
        ${r.status === "skip" ? `<div class="sub2">${r.kind === r.part.name ? "" : `You have or will build a better ${esc(r.kind.toLowerCase())}.`}</div>` : ""}</td>
      <td class="r num">${r.need}</td>
      <td class="r num${r.conShort ? " neg" : ""}" ${r.conShort ? `title="Your Construction level is too low"` : ""}>${r.con ?? "–"}</td>
      <td>${label[r.status]}${r.quest ? ` <span class="pill bad" title="Quest not done yet">${esc(r.quest)}</span>` : ""}</td>
      <td class="wrapcell">${mats(r.recipe)}</td></tr>`;
    $('[data-f="parts"]').innerHTML = `
      <div class="sechead"><h2 class="pagetitle small">Upgrades on this ${esc(boat().type.toLowerCase())}</h2></div>
      <p class="fine">Tick a part once it's on the boat. A part is "not needed" when a better one of the same kind is built${state.best ? " or within reach" : ""}. A red Construction level is above yours: you can still have a shipwright build it for a fee.</p>
      <div class="board"><table><thead><tr><th>Part</th><th class="r">Sailing</th><th class="r">Construction</th><th>Status</th><th>Materials (${esc(boat().type)})</th></tr></thead><tbody>
        ${shown.map(row).join("")}
        ${next.length ? `<tr><td colspan="5" class="muted"><b>Coming up</b></td></tr>${next.map(row).join("")}` : ""}
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

  function render() {
    if (!state) return;
    fillPlayers();
    tgt.value = target();
    tgt.placeholder = lvl("Sailing") ?? "";
    best.checked = !!state.best;
    renderBoatbar();
    const b = boat();
    if (!b) { $('[data-f="needs"]').innerHTML = `<p class="muted">No boats yet. Add one above.</p>`; $('[data-f="parts"]').innerHTML = ""; return; }
    const list = rows(b);
    renderNeeds(list);
    renderParts(list);
    me.markColumns(root);
  }

  playerSel.addEventListener("change", () => { load(playerSel.value); render(); });
  boatSel.addEventListener("change", () => { state.current = boatSel.value; save(); render(); });
  tgt.addEventListener("change", () => {
    const v = Math.max(1, Math.min(99, parseInt(tgt.value, 10) || 0));
    state.target = !tgt.value || v === lvl("Sailing") ? null : v;   // empty or your own level: follow the account
    save(); render();
  });
  best.addEventListener("change", () => { state.best = best.checked; save(); render(); });
  root.addEventListener("change", e => {
    const cb = e.target.closest("input[data-part]"), b = boat();
    if (cb && b) {
      b.done = cb.checked ? [...new Set([...b.done, cb.dataset.part])] : b.done.filter(n => n !== cb.dataset.part);
      save(); render();
    }
    if (e.target.matches('select[data-a="type"]') && b) { b.type = e.target.value; save(); render(); }
  });
  root.addEventListener("click", e => {
    const a = e.target.closest("button[data-a]")?.dataset.a, b = boat();
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
      b.name = name.trim();
    } else if (a === "remove" && b) {
      if (!confirm(`Remove ${b.name} and everything ticked on it?`)) return;
      state.boats = state.boats.filter(x => x !== b); state.current = state.boats[0]?.id || null;
    } else return;
    save(); render();
  });

  // Default account: "You" in the header, else the first player. Levels may still be loading:
  // a new account's first boat waits for them so it gets the right type.
  const pick = () => PLAYERS.find(n => n.toLowerCase() === (me.get() || "").toLowerCase()) || PLAYERS[0];
  function start() {
    if (!state && (group.loaded() || store.get("boats:" + pick().toLowerCase(), null))) load(pick());
    render();
  }
  const offs = [group.onChange(start), prices.onChange(render), unlocks.onChange(render), me.onChange(() => { load(pick()); render(); })];
  start();
  if (!state) $('[data-f="needs"]').innerHTML = `<p class="muted">Loading levels…</p>`;
  return () => offs.forEach(off => off());
}
