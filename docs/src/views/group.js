// Group page: update everyone's stats, XP gained per day/week/month, and levels side by side.
// All data comes from Wise Old Man (https://wiseoldman.net).
import * as group from "../core/players.js";
import { SKILLS, skillByName, xpForLevel } from "../core/osrs.js";
import GOALS from "../../data/goals.js";
import QUESTS, { TRACKED } from "../../data/quests.js";
import METHODS from "../../data/methods/index.js";
import { store } from "../core/store.js";
import { esc, ago, nf, short, gp } from "../core/format.js";

export const title = "Group";

const PERIODS = { day: "Today", week: "This week", month: "This month" };
// One update per hour is plenty: hiscores only change when people play, and Wise Old Man
// asks not to update more often than every 1–6 hours.
const COOLDOWN_MS = 60 * 60_000;

/**
 * One goal with a progress bar. Progress runs from the player's XP at the start of this week
 * (current XP minus this week's gains from Wise Old Man) to the XP for the target level.
 */
export function goalCard(g, weekGain) {
  const p = group.all().find(x => x.name.toLowerCase() === g.player.toLowerCase());
  const skill = skillByName(g.skill);
  if (!p || !skill) return `<div class="goal-card"><b>${esc(g.player)}: ${esc(g.skill)} ${g.level}</b><div class="muted">Unknown player or skill</div></div>`;
  if (!p.skills) return `<div class="goal-card"><b>${esc(p.name)}: ${esc(skill.name)} ${g.level}</b><div class="muted">No stats yet</div></div>`;
  const cur = group.xp(p, skill.name), lvl = group.level(p, skill.name), target = xpForLevel(g.level);
  const start = Math.max(0, cur - (weekGain?.xp || 0));
  const done = cur >= target;
  const pct = done ? 100 : Math.max(0, Math.min(100, ((cur - start) / Math.max(1, target - start)) * 100));
  const end = new Date(g.by + "T23:59:59");
  const daysLeft = Math.ceil((end - Date.now()) / 86_400_000);
  const left = Math.max(0, target - cur);
  const status = done ? `<span class="pill good">Done</span>`
    : daysLeft < 0 ? `<span class="pill bad">Missed</span>`
    : `<span class="muted">${gp(left)} XP to go · ${daysLeft === 0 ? "last day" : `${daysLeft} day${daysLeft > 1 ? "s" : ""} left`} · ${gp(left / Math.max(1, daysLeft || 1))} XP/day</span>`;
  return `<div class="goal-card">
    <div class="goal-head"><b>${esc(p.name)}</b>: ${esc(skill.name)} ${lvl} → ${g.level} <span class="muted">by ${esc(new Date(g.by + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }))}</span></div>
    <div class="bar" role="progressbar" aria-valuenow="${Math.round(pct)}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(p.name)} ${esc(skill.name)} goal"><span style="width:${pct.toFixed(1)}%"></span></div>
    <div class="goal-foot"><span class="num">${Math.round(pct)}%</span> ${status}</div>
  </div>`;
}

export function mount(root) {
  let period = store.get("gainsPeriod", "week");
  let message = "";

  root.innerHTML = `
    <p class="lead">Stats come from <a href="https://wiseoldman.net" target="_blank" rel="noopener">Wise Old Man</a>, which reads the OSRS hiscores. Press <b>Update stats</b> after a session to pull in everyone's latest levels. It can be pressed once an hour.</p>
    <div class="toolbar">
      <button type="button" class="btn primary" data-f="update">Update stats</button>
      <span class="updmsg" data-f="last"></span>
      <span class="updmsg" data-f="msg" role="status"></span>
    </div>

    <section class="section">
      <h2 class="pagetitle small">Goals</h2>
      <div data-f="goals"></div>
    </section>

    <section class="section">
      <h2 class="pagetitle small">Levels</h2>
      <div data-f="levels"></div>
    </section>

    <section class="section">
      <div class="sechead">
        <h2 class="pagetitle small">XP gained</h2>
        <div class="seg" role="group" aria-label="Period" data-f="period">
          ${Object.entries(PERIODS).map(([k, l]) => `<button type="button" data-p="${k}">${l}</button>`).join("")}
        </div>
      </div>
      <div data-f="gains"></div>
    </section>

    <section class="section">
      <h2 class="pagetitle small">Quests</h2>
      <p class="fine">Quests that methods or routes on this site need. They load automatically from the wiki for players who use the <a href="https://oldschool.runescape.wiki/w/RuneScape:WikiSync" target="_blank" rel="noopener">WikiSync</a> plugin in RuneLite (turn it on and log in once; the site checks for new data every 3 hours). For everyone else they're filled in by hand: tell Claude in the Bronzeman project, e.g. "Mini Gabby finished The Tourist Trap". ? means unknown.</p>
      <div data-f="quests"></div>
    </section>`;

  const $ = s => root.querySelector(s);
  const btn = $('[data-f="update"]');

  // When the group's stats were last updated: the oldest update among players with stats,
  // so it's shared by everyone who opens the site (not just this browser).
  function lastUpdate() {
    const times = group.all().filter(p => p.skills && p.updatedAt).map(p => new Date(p.updatedAt).getTime());
    return times.length ? Math.min(...times) : null;
  }

  function cooldownLeft() {
    const last = lastUpdate();
    return last ? Math.max(0, last + COOLDOWN_MS - Date.now()) : 0;
  }

  function renderButton() {
    const left = cooldownLeft();
    btn.disabled = group.updating() || left > 0;
    btn.textContent = group.updating() ? "Updating…" : "Update stats";
    const last = lastUpdate();
    $('[data-f="last"]').textContent = !group.loaded() ? "" : last
      ? `Last updated ${ago(last)}` + (left > 0 ? ` · next update in ${Math.ceil(left / 60_000)} min` : "")
      : "Not updated yet";
    $('[data-f="msg"]').innerHTML = message;
  }

  btn.addEventListener("click", async () => {
    message = "";
    const failed = await group.updateAll();
    const ok = group.all().length - failed.length;
    message = failed.length
      ? `Updated ${ok} of ${group.all().length}. <span class="neg">${failed.map(f => `${esc(f.name)}: ${esc(f.error)}`).join("; ")}</span>`
      : `Updated all ${ok} players.`;
    group.loadGains(period);
    render();
  });

  $('[data-f="period"]').addEventListener("click", e => {
    const b = e.target.closest("[data-p]");
    if (!b) return;
    period = b.dataset.p;
    store.set("gainsPeriod", period);
    group.loadGains(period);
    render();
  });

  function renderGains() {
    const host = $('[data-f="gains"]');
    root.querySelectorAll('[data-f="period"] button').forEach(b => b.setAttribute("aria-pressed", String(b.dataset.p === period)));
    const ps = group.all();
    if (!group.gains(period)) {
      host.innerHTML = `<p class="muted">${group.gainsLoading(period) ? "Loading XP gains…" : ""}</p>`;
      return;
    }
    const overall = ps.map(p => group.gained(period, p, "overall"));
    const rows = SKILLS
      .map(s => ({ s, vals: ps.map(p => group.gained(period, p, s.name)) }))
      .filter(r => r.vals.some(v => v && v.xp > 0))
      .sort((a, b) => b.vals.reduce((t, v) => t + (v?.xp || 0), 0) - a.vals.reduce((t, v) => t + (v?.xp || 0), 0));
    if (!overall.some(v => v && v.xp > 0)) {
      host.innerHTML = `<p class="muted">Nobody gained XP ${PERIODS[period].toLowerCase()} yet, or stats haven't been updated since. Press Update stats after playing.</p>`;
      return;
    }
    const cell = (v, max) => v == null
      ? `<td class="r muted">–</td>`
      : `<td class="r num${v.xp > 0 && v.xp === max ? " top" : ""}">${v.xp ? short(v.xp) : `<span class="muted">0</span>`}${v.levels ? `<div class="sub2">+${v.levels} lvl</div>` : ""}</td>`;
    const row = (label, vals, link) => {
      const max = Math.max(...vals.map(v => v?.xp || 0));
      return `<tr><td>${link ? `<a href="${link}">${esc(label)}</a>` : `<b>${esc(label)}</b>`}</td>${vals.map(v => cell(v, max)).join("")}</tr>`;
    };
    host.innerHTML = `<div class="board"><table>
      <thead><tr><th>Skill</th>${ps.map(p => `<th class="r">${esc(p.name)}</th>`).join("")}</tr></thead>
      <tbody>
        ${row("Total XP", overall)}
        ${rows.map(r => row(r.s.name, r.vals, `#/training/${r.s.key}`)).join("")}
      </tbody>
    </table></div>
    <p class="fine">Only skills where someone gained XP are listed, busiest first. Gains count from each player's first Wise Old Man update in the period.</p>`;
  }

  function renderLevels() {
    const host = $('[data-f="levels"]');
    if (!group.loaded()) { host.innerHTML = `<p class="muted">Loading stats from Wise Old Man…</p>`; return; }
    const ps = group.all();
    const total = p => p.skills ? SKILLS.reduce((a, s) => a + group.level(p, s.name), 0) : null;
    const row = (label, vals, link) => {
      const max = Math.max(...vals.filter(v => v != null));
      return `<tr><td>${link ? `<a href="${link}">${esc(label)}</a>` : `<b>${esc(label)}</b>`}</td>${vals.map(v =>
        `<td class="r num${v != null && v === max && max > 1 ? " top" : ""}">${v == null ? "–" : nf.format(v)}</td>`).join("")}</tr>`;
    };
    host.innerHTML = `<div class="board"><table>
      <thead><tr><th>Skill</th>${ps.map(p => `<th class="r"><a href="#/player/${encodeURIComponent(p.name)}" title="What ${esc(p.name)} can do now">${esc(p.name)}</a></th>`).join("")}</tr></thead>
      <tbody>
        ${row("Total level", ps.map(total))}
        ${SKILLS.map(s => row(s.name, ps.map(p => p.skills ? group.level(p, s.name) : null), `#/training/${s.key}`)).join("")}
        <tr><td class="muted">Last updated</td>${ps.map(p => `<td class="r muted" title="${esc(p.error || "")}">${p.skills ? ago(p.updatedAt) : "No stats"}</td>`).join("")}</tr>
      </tbody>
    </table></div>
    <p class="fine">The highest level in each skill is highlighted. Click a skill to see its training methods.</p>`;
  }

  function renderGoals() {
    const host = $('[data-f="goals"]');
    if (!GOALS.length) {
      host.innerHTML = `<p class="muted">No goals yet. Set one by telling Claude in the Bronzeman project, for example "Mini Gabby: Herblore 45 by Sunday". Goals show here and on each player's page.</p>`;
      return;
    }
    if (!group.loaded()) { host.innerHTML = `<p class="muted">Loading stats…</p>`; return; }
    host.innerHTML = `<div class="goals">${GOALS.map(g => goalCard(g, group.gained("week", group.all().find(p => p.name.toLowerCase() === g.player.toLowerCase()) || {}, g.skill))).join("")}</div>`;
  }

  const syncLabel = p => {
    const s = group.questSource(p);
    if (s === "ok") return `<span class="pill good" title="From WikiSync: ${esc(p.wikiAt ? new Date(p.wikiAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "")}">WikiSync ${esc(p.wikiAt ? ago(p.wikiAt) : "")}</span>`;
    if (s === "none") return `<span class="sub2" title="No WikiSync data: turn on the WikiSync plugin in RuneLite and log in. The site checks every 3 hours.">By hand</span>`;
    if (s === "error") return `<span class="sub2" title="Couldn't load the WikiSync data">By hand</span>`;
    return `<span class="sub2">…</span>`;
  };

  function renderQuests() {
    const host = $('[data-f="quests"]');
    const needed = new Set(METHODS.flatMap(m => m.reqs?.quests || []));
    const list = [...new Set([...TRACKED, ...needed])];
    const ps = group.all();
    const uses = q => METHODS.filter(m => (m.reqs?.quests || []).includes(q)).length;
    host.innerHTML = `<div class="board"><table>
      <thead><tr><th>Quest</th><th class="r">Methods</th>${ps.map(p => `<th class="r">${esc(p.name)}</th>`).join("")}</tr>
        <tr class="subhead"><td class="muted">Source</td><td></td>${ps.map(p => `<td class="r">${syncLabel(p)}</td>`).join("")}</tr></thead>
      <tbody>${list.map(q => `<tr><td><a href="https://oldschool.runescape.wiki/w/${encodeURIComponent(q.replace(/ \(started\)$/, "").replace(/ /g, "_"))}" target="_blank" rel="noopener">${esc(q)}</a></td>
        <td class="r num">${uses(q) || "–"}</td>
        ${ps.map(p => { const d = group.questDone(p, q); return `<td class="r">${d === true ? `<span class="pos" title="Done">✓</span>` : d === false ? `<span class="neg" title="Not done">✗</span>` : `<span class="muted" title="Unknown">?</span>`}</td>`; }).join("")}</tr>`).join("")}</tbody>
    </table></div>`;
  }

  function render() {
    renderGoals();
    renderQuests();
    renderButton();
    renderGains();
    renderLevels();
  }

  const off = group.onChange(render);
  const tick = setInterval(renderButton, 30_000);
  group.loadGains(period);
  if (GOALS.length && period !== "week") group.loadGains("week");   // goals measure progress from the start of the week
  render();
  return () => { off(); clearInterval(tick); };
}
