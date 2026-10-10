// Arcanekitten tab: the levels of an account outside the group next to the group's best level per
// skill. A skill is crossed off once someone in the group is at least the same level as that account.
// Who the account is: data/catchup.js. Its stats come from Wise Old Man, remembered for 15 minutes.
import CATCHUP from "../../data/catchup.js";
import * as group from "../core/players.js";
import { SKILLS } from "../core/osrs.js";
import { store } from "../core/store.js";
import * as ui from "../core/ui.js";
import { esc, nf, ago } from "../core/format.js";

export const title = "Arcanekitten";

const WOM = "https://api.wiseoldman.net/v2/players/";
const CACHE_KEY = "catchup";
const CACHE_MS = 15 * 60_000;
const COOLDOWN_MS = 60 * 60_000;   // Update stats: once an hour, like the Group page

export function mount(root) {
  const id = CATCHUP.account.toLowerCase();
  let data = store.get(CACHE_KEY, null);          // { id, name, updatedAt, levels: { attack: 61, ... }, fetchedAt }
  if (data?.id !== id) data = null;
  let error = "", busy = false;

  root.innerHTML = `
    <p class="lead" data-f="lead"></p>
    <div class="toolbar">
      <button type="button" class="btn primary" data-f="update">Update ${esc(CATCHUP.account)}</button>
      <span class="updmsg" data-f="last"></span>
      <span class="updmsg neg" data-f="msg" role="status"></span>
    </div>
    <div data-f="summary"></div>
    <div data-f="table"></div>
    <p class="fine">A skill is crossed off when the highest level in the group is the same as ${esc(CATCHUP.account)}'s or higher. The group's levels come from the Group page (press Update stats there after a session).</p>`;
  const $ = s => root.querySelector(s);

  const apply = j => {
    data = { id, name: j.displayName || CATCHUP.account, updatedAt: j.updatedAt,
      levels: Object.fromEntries(Object.entries(j.latestSnapshot?.data?.skills || {}).map(([k, v]) => [k, v.level])), fetchedAt: Date.now() };
    store.set(CACHE_KEY, data);
  };

  async function load(method) {
    busy = true; error = ""; render();
    try {
      const r = await fetch(WOM + encodeURIComponent(id), method === "POST" ? { method } : undefined);
      if (!r.ok) {
        let msg = `HTTP ${r.status}`;
        try { msg = (await r.json()).message || msg; } catch {}
        if (r.status === 404) msg = `${CATCHUP.account} isn't on Wise Old Man yet: press Update`;
        if (r.status === 429) msg = "Too many requests to Wise Old Man, try again in a minute";
        throw new Error(msg);
      }
      apply(await r.json());
    } catch (e) {
      error = e.message || String(e);
    }
    busy = false; render();
  }

  $('[data-f="update"]').addEventListener("click", () => load("POST"));

  function render() {
    const name = data?.name || CATCHUP.account;
    $('[data-f="lead"]').innerHTML = `<b>${esc(name)}</b> is the account ${esc(CATCHUP.replaces)} usually plays on. It already had levels before the group started, so it can't join yet. Once someone in the group is at least the same level as ${esc(name)} in <b>every</b> skill, ${esc(name)} joins the group and ${esc(CATCHUP.replaces)} leaves.`;
    const btn = $('[data-f="update"]');
    const left = data?.updatedAt ? Math.max(0, new Date(data.updatedAt).getTime() + COOLDOWN_MS - Date.now()) : 0;
    btn.disabled = busy || left > 0;
    btn.textContent = busy ? "Loading…" : `Update ${name}`;
    $('[data-f="last"]').textContent = data?.updatedAt ? `${name}'s stats are from ${ago(data.updatedAt)}` + (left > 0 ? ` · next update in ${Math.ceil(left / 60_000)} min` : "") : "";
    $('[data-f="msg"]').textContent = error;

    const ps = group.all().filter(p => p.skills);
    if (!data?.levels || !Object.keys(data.levels).length) {
      $('[data-f="summary"]').innerHTML = "";
      $('[data-f="table"]').innerHTML = `<p class="muted">${busy ? `Loading ${esc(name)}'s levels from Wise Old Man…` : `No levels for ${esc(name)} yet.`}</p>`;
      return;
    }
    if (!ps.length) {
      $('[data-f="summary"]').innerHTML = "";
      $('[data-f="table"]').innerHTML = `<p class="muted">Loading the group's levels…</p>`;
      return;
    }

    const rows = SKILLS.map(s => {
      const theirs = data.levels[s.key] ?? 1;
      const best = Math.max(...ps.map(p => group.level(p, s.name)));
      const who = ps.filter(p => group.level(p, s.name) === best).map(p => p.name);
      return { s, theirs, best, who, done: best >= theirs, gap: theirs - best };
    });
    const done = rows.filter(r => r.done), todo = rows.filter(r => !r.done).sort((a, b) => a.gap - b.gap || a.s.name.localeCompare(b.s.name));
    const levelsToGo = todo.reduce((a, r) => a + r.gap, 0);
    const pct = (done.length / rows.length) * 100;

    $('[data-f="summary"]').innerHTML = `<div class="catchsum">
      <div class="big num">${done.length} <span class="muted">of ${rows.length}</span></div>
      <div><b>${done.length === rows.length ? `Every skill is crossed off: ${esc(name)} can join.` : `skills crossed off`}</b>
        <div class="sub2">${todo.length ? `${todo.length} to go · ${nf.format(levelsToGo)} level${levelsToGo === 1 ? "" : "s"} in total, if one player does each skill` : ""}</div>
        <div class="bar" role="progressbar" aria-valuenow="${Math.round(pct)}" aria-valuemin="0" aria-valuemax="100" aria-label="Skills crossed off"><span style="width:${pct.toFixed(1)}%"></span></div></div>
    </div>`;

    const row = r => `<tr class="${r.done ? "crossed" : ""}">
      <td>${r.done ? `<span class="pos" aria-hidden="true">✓</span> ` : ""}<a href="#/training/${r.s.key}"><span class="skillname">${esc(r.s.name)}</span></a></td>
      <td class="r num">${r.theirs}</td>
      <td class="r num">${r.best}</td>
      <td class="wrapcell">${esc(r.who.join(", "))}</td>
      <td class="r">${r.done ? `<span class="pill good">Crossed off</span>` : `<span class="pill warn">${r.gap} level${r.gap === 1 ? "" : "s"} to go</span>`}</td>
    </tr>`;
    const totalTheirs = rows.reduce((a, r) => a + r.theirs, 0), totalBest = rows.reduce((a, r) => a + r.best, 0);
    $('[data-f="table"]').innerHTML = `<div class="board"><table class="catchtable">
      <thead><tr><th>Skill</th><th class="r">${esc(name)}</th><th class="r">${ui.t("Group best", "Highest in the group")}</th><th>${ui.t("Who", "Who has it")}</th><th class="r">Status</th></tr></thead>
      <tbody>
        ${todo.length ? `<tr class="sect"><td colspan="5">Still to do, closest first</td></tr>${todo.map(row).join("")}` : ""}
        ${done.length ? `<tr class="sect"><td colspan="5">Crossed off</td></tr>${done.map(row).join("")}` : ""}
        <tr class="total"><td>Total level</td><td class="r num">${nf.format(totalTheirs)}</td><td class="r num">${nf.format(totalBest)}</td><td class="muted">best per skill</td><td></td></tr>
      </tbody>
    </table></div>`;
  }

  const off = group.onChange(render);
  render();
  if (!data || Date.now() - data.fetchedAt > CACHE_MS) load("GET");
  return () => off();
}
