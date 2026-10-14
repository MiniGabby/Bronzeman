// Quests together: which quests the group can do as a group without leaving the Optimal Ironman order
// (data/quest-order.js), and how far everyone is from the big quests the group wants to do together
// (data/big-quests.js). Quest progress and levels come from WikiSync (see core/players.js).
import ORDER from "../../data/quest-order.js";
import BIG from "../../data/big-quests.js";
import * as group from "../core/players.js";
import { plan, stateOf, blockers, allPrereqs } from "../core/questPlan.js";
import { skillByName } from "../core/osrs.js";
import * as me from "../core/me.js";
import { esc, nf } from "../core/format.js";

export const title = "Quests together";

const WINDOW = 15;   // how far ahead in each player's own order a quest may be to count as "up next"
const wiki = n => `https://oldschool.runescape.wiki/w/${encodeURIComponent(n.replace(/^Recipe for Disaster - .*/, "Recipe for Disaster").replace(/ /g, "_"))}`;
const short = n => n.replace(/^Recipe for Disaster - /, "RFD: ").replace(/ - The Fallen Empire$/, "");

export function mount(root) {
  root.innerHTML = `
    <p class="lead">Which quests you can do together without leaving the Optimal Ironman order, and how close everyone is to the big quests you want to do as a group. Quests and levels come from the WikiSync plugin, so this updates by itself every few hours.</p>
    <div data-f="body"></div>`;
  const body = root.querySelector('[data-f="body"]');

  function render() {
    const all = group.all();
    if (!all.some(p => p.wikiStatus !== undefined)) { body.innerHTML = `<p class="muted">Loading quests…</p>`; return; }
    const ps = all.filter(p => p.wikiQuests && p.skills);
    const missing = all.filter(p => !p.wikiQuests).map(p => p.name);
    body.innerHTML = upNext(ps) + bigQuests(ps)
      + (missing.length ? `<p class="fine">Not included (no WikiSync data): ${esc(missing.join(", "))}. Turn on the WikiSync plugin in RuneLite and log in.</p>` : "");
    me.markColumns(root);
  }

  // Quests that are near the top of two or more players' own order and that they can all do right now.
  function upNext(ps) {
    const byQuest = new Map();
    for (const p of ps) {
      const steps = plan(p, 0)?.steps.filter(s => s.item.type !== "diary").slice(0, WINDOW) || [];
      steps.forEach((s, i) => {
        if (!byQuest.has(s.item.name)) byQuest.set(s.item.name, { item: s.item, ready: [], later: [] });
        (s.ready ? byQuest.get(s.item.name).ready : byQuest.get(s.item.name).later).push({ p, pos: i + 1, s });
      });
    }
    const list = [...byQuest.values()].filter(q => q.ready.length >= 2)
      .sort((a, b) => b.ready.length - a.ready.length || avg(a.ready) - avg(b.ready)).slice(0, 12);
    const chips = q => q.ready.map(r => `<span class="chip yes" title="Number ${r.pos} in ${esc(r.p.name)}'s own order">${esc(r.p.name)} <span class="muted">#${r.pos}</span></span>`).join("")
      + q.later.map(r => `<span class="chip maybe" title="Needs ${esc([...r.s.skills.map(x => `${x.skill} ${x.need}`), ...r.s.quests].join(", "))} first">${esc(r.p.name)} ?</span>`).join("");
    return `<section class="section">
      <div class="sechead"><h2 class="pagetitle small">Up next, together</h2></div>
      <p class="fine">Quests that are among the next ${WINDOW} in two or more players' own order, and that they can do right now. The number is where it is in each player's list: the lower, the sooner you'd get to it anyway. An orange name has it coming up too, but still needs something first.</p>
      ${list.length ? `<div class="board"><table class="togethertable"><thead><tr><th>Quest</th><th class="r">Ready</th><th>Who</th></tr></thead><tbody>
        ${list.map(q => `<tr><td><a href="${wiki(q.item.name)}" target="_blank" rel="noopener"><b>${esc(q.item.name)}</b></a>${q.item.type === "miniquest" ? ` <span class="pill">Mini</span>` : ""}</td>
          <td class="r num">${q.ready.length}</td><td><div class="chips">${chips(q)}</div></td></tr>`).join("")}
      </tbody></table></div>` : `<p class="muted">No quest is up next for two or more of you right now.</p>`}
    </section>`;
  }

  // One card per big quest: who has done it, who can do it now, and what everyone else still needs.
  function bigQuests(ps) {
    const cards = BIG.map(b => {
      const idx = ORDER.findIndex(x => x.name === b.name), item = ORDER[idx];
      if (!item) return "";
      const chain = [...allPrereqs(b.name)];
      const rows = ps.map(p => {
        const st = stateOf(p, item);
        if (st === 2) return { p, kind: "done" };
        const bl = blockers(p, item);
        const questsLeft = chain.filter(q => group.questDone(p, q) !== true);
        const before = ORDER.slice(0, idx).filter(x => { const v = stateOf(p, x); return v != null && v !== 2; }).length;
        const ready = !bl.skills.length && !questsLeft.length;
        return { p, kind: ready ? "ready" : "blocked", bl, questsLeft, before, started: st === 1 };
      });
      const done = rows.filter(r => r.kind === "done"), ready = rows.filter(r => r.kind === "ready"), blocked = rows.filter(r => r.kind === "blocked");
      const status = done.length === rows.length ? ["good", "Done by everyone"]
        : ready.length >= 2 ? ["good", `${ready.length} can do it together now`]
        : ready.length === 1 ? ["warn", `${esc(ready[0].p.name)} can do it now`]
        : ["", "Not yet"];
      const need = r => [...r.bl.skills.map(x => `<a href="#/training/${skillByName(x.skill)?.key}">${esc(x.skill)} ${x.need}</a> <span class="muted">(${x.have})</span>`),
        ...(r.questsLeft.length ? [`${r.questsLeft.length} quest${r.questsLeft.length === 1 ? "" : "s"} first`] : [])].join(", ");
      const closest = [...blocked].sort((a, b) => (a.bl.skills.reduce((t, x) => t + x.need - x.have, 0) + a.questsLeft.length * 3)
        - (b.bl.skills.reduce((t, x) => t + x.need - x.have, 0) + b.questsLeft.length * 3))[0];
      return `<article class="bigquest${done.length === rows.length ? " alldone" : ready.length >= 2 ? " readynow" : ""}">
        <div class="bqhead"><span class="bqstep" title="Step ${idx + 1} of ${ORDER.length} in the Optimal Ironman order">#${idx + 1}</span>
          <h3><a href="${wiki(b.name)}" target="_blank" rel="noopener">${esc(short(b.name))}</a></h3></div>
        <p class="bqwhy">${esc(b.why)}</p>
        <div class="bqstatus"><span class="pill ${status[0]}">${status[1]}</span>${item.qp ? ` <span class="muted">· needs ${item.qp} quest points</span>` : ""}</div>
        <ul class="bqwho">${rows.map(r => r.kind === "done" ? `<li class="isdone"><span class="bqname">${esc(r.p.name)}</span> <span class="pos">✓ done</span></li>`
          : r.kind === "ready" ? `<li class="isready"><span class="bqname">${esc(r.p.name)}</span> <span class="pill good">Ready${r.started ? ", started" : ""}</span>${r.before ? ` <span class="muted">· ${r.before} step${r.before === 1 ? "" : "s"} before it in the order</span>` : ""}</li>`
          : `<li><span class="bqname">${esc(r.p.name)}</span> <span class="bqneed">${need(r)}</span></li>`).join("")}</ul>
        ${closest && ready.length < 2 && done.length < rows.length ? `<div class="sub2">Closest of the rest: <b>${esc(closest.p.name)}</b></div>` : ""}
      </article>`;
    }).join("");
    return `<section class="section">
      <div class="sechead"><h2 class="pagetitle small">The big quests</h2></div>
      <p class="fine">The quests you want to do as a group, in the order they come in the Optimal Ironman list (the number on each card). Green means ready: every level and every quest it needs, all the way down the chain. Quest points, combat and items aren't checked.</p>
      <div class="bigquests">${cards}</div>
    </section>`;
  }

  const avg = rs => rs.reduce((t, r) => t + r.pos, 0) / rs.length;
  const offs = [group.onChange(render), me.onChange(render)];
  render();
  return () => offs.forEach(off => off());
}
