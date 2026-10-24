// Combat achievements: every task (data/combat-achievements.js, from the wiki) with who in the group has
// done it, plus everyone's points and reward tier. Completed tasks come from WikiSync (core/players.js).
import TASKS, { TIERS } from "../../data/combat-achievements.js";
import REQ from "../../data/ca-requirements.js";
import * as group from "../core/players.js";
import * as me from "../core/me.js";
import { store } from "../core/store.js";
import { esc, nf } from "../core/format.js";

export const title = "Combat achievements";

const KEY = "combatFilter";
const SHOWN = 150;   // rows before "Show all", so the page stays quick
const pointsOf = Object.fromEntries(TIERS.map(t => [t.tier, t.taskPoints]));
const wiki = n => `https://oldschool.runescape.wiki/w/${encodeURIComponent(n.replace(/ /g, "_"))}`;
const reqOf = t => REQ[t.monster || "None"] || {};

// What a boss needs, in a few words, e.g. "Slayer 85 · Priest in Peril".
const reqText = r => [...Object.entries(r.skills || {}).map(([s, l]) => `${s} ${l}`), ...(r.quests || []), ...(r.diaries || []).map(d => `${d} Diary`)].join(" · ");

/** "done", "open" (everything it needs that the site can check is there) or "locked", with what's missing. */
function status(p, t) {
  if (p.wikiCA.has(t.id)) return { kind: "done" };
  const r = reqOf(t);
  const miss = [
    ...Object.entries(r.skills || {}).filter(([s, l]) => group.level(p, s) < l).map(([s, l]) => `${s} ${l} (${group.level(p, s)})`),
    ...(r.quests || []).filter(q => group.questDone(p, q) !== true),
    ...(r.diaries || []).filter(d => group.diaryDone(p, d) !== true).map(d => `${d} Diary`)
  ];
  return miss.length ? { kind: "locked", miss } : { kind: "open" };
}

export function mount(root) {
  const f = Object.assign({ tier: "", status: "", q: "", who: me.get() || "" }, store.get(KEY, {}));
  let all = false;
  root.innerHTML = `
    <p class="lead">Every Combat Achievement task and who in the group has done it. Tasks give 1 to 6 points depending on their tier, and points unlock the rewards at Ghommal by the Warriors' Guild. Progress comes from the WikiSync plugin, so it updates by itself every few hours.</p>
    <section class="section" data-f="summary"></section>
    <form class="toolbar" data-f="filters">
      <div class="field"><label for="ca-who">Player</label><select id="ca-who"></select></div>
      <div class="field"><label for="ca-tier">Tier</label><select id="ca-tier"><option value="">All tiers</option>${TIERS.map(t => `<option>${t.tier}</option>`).join("")}</select></div>
      <div class="field"><label for="ca-status">Show</label><select id="ca-status"></select></div>
      <div class="field grow"><label for="ca-q">Search</label><input id="ca-q" type="search" placeholder="Task, boss or type, e.g. Giant Mole" autocomplete="off"></div>
    </form>
    <div data-f="list"></div>`;
  const $ = s => root.querySelector(s);
  $("#ca-tier").value = f.tier; $("#ca-q").value = f.q;
  // The "Show" choices depend on whether you look at one player or at everyone.
  const SHOW_ALL = [["", "All tasks"], ["none", "Nobody has done"], ["some", "Someone has done"], ["notall", "Not everyone has done"]];
  const SHOW_ONE = [["", "All tasks"], ["open", "Possible now"], ["locked", "Not possible yet"], ["done", "Done"]];
  function fillSelects() {
    const ps = players();
    if (f.who && !ps.some(p => p.name === f.who)) f.who = ps.length && ps.some(p => p.name.toLowerCase() === (f.who || "").toLowerCase()) ? ps.find(p => p.name.toLowerCase() === f.who.toLowerCase()).name : "";
    $("#ca-who").innerHTML = `<option value="">Everyone</option>` + ps.map(p => `<option>${esc(p.name)}</option>`).join("");
    $("#ca-who").value = f.who;
    const opts = f.who ? SHOW_ONE : SHOW_ALL;
    if (!opts.some(([v]) => v === f.status)) f.status = "";
    $("#ca-status").innerHTML = opts.map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
    $("#ca-status").value = f.status;
  }
  $("#ca-who").addEventListener("change", e => { f.who = e.target.value; all = false; save(); fillSelects(); renderList(); });
  const save = () => store.set(KEY, f);
  $('[data-f="filters"]').addEventListener("submit", e => e.preventDefault());
  $("#ca-tier").addEventListener("change", e => { f.tier = e.target.value; all = false; save(); renderList(); });
  $("#ca-status").addEventListener("change", e => { f.status = e.target.value; all = false; save(); renderList(); });
  $("#ca-q").addEventListener("input", e => { f.q = e.target.value; all = false; save(); renderList(); });
  root.addEventListener("click", e => {
    if (e.target.closest("[data-showall]")) { all = true; renderList(); return; }
    const w = e.target.closest("[data-who]");
    if (w) { f.who = w.dataset.who; f.status = "open"; all = false; save(); fillSelects(); renderList(); $('[data-f="filters"]').scrollIntoView({ behavior: "smooth", block: "start" }); }
  });

  const players = () => group.all().filter(p => p.wikiCA);

  // Points, tasks and reward tier per player.
  function renderSummary() {
    const host = $('[data-f="summary"]');
    const ps = players();
    if (!ps.length) {
      host.innerHTML = `<p class="muted">${group.all().some(p => p.wikiStatus !== undefined) ? "No combat achievement data yet. It arrives with the next WikiSync check (every 3 hours) for players who use the plugin." : "Loading…"}</p>`;
      return;
    }
    const cards = ps.map(p => {
      const done = TASKS.filter(t => p.wikiCA.has(t.id));
      const pts = done.reduce((a, t) => a + (pointsOf[t.tier] || 0), 0);
      const open = TASKS.filter(t => status(p, t).kind === "open");
      const openPts = open.reduce((a, t) => a + (pointsOf[t.tier] || 0), 0);
      const reached = [...TIERS].reverse().find(t => pts >= t.rewardAt);
      const next = TIERS.find(t => pts < t.rewardAt);
      const from = reached ? reached.rewardAt : 0, pct = next ? Math.min(100, ((pts - from) / (next.rewardAt - from)) * 100) : 100;
      return `<div class="cacard">
        <div class="cahead"><b>${esc(p.name)}</b><span class="pill ${reached ? "good" : ""}">${reached ? `${reached.tier} rewards` : "No reward tier yet"}</span></div>
        <div class="cabig"><b class="num">${nf.format(pts)}</b> points <span class="muted">· ${done.length} task${done.length === 1 ? "" : "s"}</span></div>
        <div class="bar" role="progressbar" aria-valuenow="${Math.round(pct)}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(p.name)} to the next reward tier"><span style="width:${pct.toFixed(1)}%"></span></div>
        <div class="sub2">${next ? `${nf.format(next.rewardAt - pts)} points to ${next.tier} rewards (${nf.format(next.rewardAt)})` : "Every reward tier unlocked"}</div>
        <button type="button" class="linkbtn caopen" data-who="${esc(p.name)}">${open.length} tasks possible now (${nf.format(openPts)} points) →</button>
      </div>`;
    }).join("");
    host.innerHTML = `<div class="sechead"><h2 class="pagetitle small">Points</h2></div><div class="cacards">${cards}</div>
      <p class="fine">Reward tiers: ${TIERS.map(t => `${t.tier} ${nf.format(t.rewardAt)}`).join(" · ")} points. Points per task: ${TIERS.map(t => `${t.tier.toLowerCase()} ${t.taskPoints}`).join(", ")}.</p>`;
  }

  function renderList() {
    const host = $('[data-f="list"]');
    const ps = players();
    const q = f.q.trim().toLowerCase();
    const one = f.who ? ps.find(p => p.name === f.who) : null;
    const rows = TASKS.filter(t => {
      if (f.tier && t.tier !== f.tier) return false;
      if (q && !`${t.name} ${t.task} ${t.monster} ${t.type}`.toLowerCase().includes(q)) return false;
      if (one) return !f.status || status(one, t).kind === f.status;
      const n = ps.filter(p => p.wikiCA.has(t.id)).length;
      if (f.status === "none" && n) return false;
      if (f.status === "some" && !n) return false;
      if (f.status === "notall" && n === ps.length) return false;
      return true;
    });
    const shown = all ? rows : rows.slice(0, SHOWN);
    host.innerHTML = `<p class="fine">${nf.format(rows.length)} of ${nf.format(TASKS.length)} tasks${rows.length > shown.length ? `, showing the first ${shown.length}` : ""}. <span class="pos">✓</span> done · <span class="caopenmark">○</span> possible now · 🔒 not possible yet (hover for what's missing). "Possible" means the player has every level, quest and diary the boss needs; how strong you are in combat isn't checked.</p>
      <div class="board"><table class="catable">
        <thead><tr><th>Tier</th><th>Task</th><th>Boss</th><th>Type</th>${ps.map(p => `<th class="r">${esc(p.name)}</th>`).join("")}</tr></thead>
        <tbody>${shown.map(t => `<tr>
          <td><span class="pill catier ca-${t.tier.toLowerCase()}">${esc(t.tier)}</span></td>
          <td class="wrapcell"><a href="${wiki(t.name)}" target="_blank" rel="noopener"><b>${esc(t.name)}</b></a><div class="sub2">${esc(t.task)}</div></td>
          <td class="wrapcell">${t.monster ? `<a href="${wiki(t.monster)}" target="_blank" rel="noopener">${esc(t.monster)}</a>` : `<span class="muted">–</span>`}
            ${reqText(reqOf(t)) ? `<div class="sub2">Needs ${esc(reqText(reqOf(t)))}</div>` : ""}${reqOf(t).other ? `<div class="sub2 muted">Also: ${esc(reqOf(t).other)}</div>` : ""}</td>
          <td class="muted">${esc(t.type)}</td>
          ${ps.map(p => { const s = status(p, t);
            return `<td class="r">${s.kind === "done" ? `<span class="pos" title="Done">✓</span>`
              : s.kind === "open" ? `<span class="caopenmark" title="Possible now: ${esc(p.name)} has everything this boss needs (combat strength not checked)">○</span>`
              : `<span class="calock" title="Not possible yet: needs ${esc(s.miss.join(", "))}">🔒</span>`}</td>`; }).join("")}
        </tr>`).join("")}</tbody>
      </table></div>
      ${rows.length > shown.length ? `<button type="button" class="linkbtn" data-showall>Show all ${nf.format(rows.length)} tasks</button>` : ""}`;
    me.markColumns(root);
  }

  function render() { fillSelects(); renderSummary(); renderList(); }
  const offs = [group.onChange(render), me.onChange(render)];
  render();
  return () => offs.forEach(off => off());
}
