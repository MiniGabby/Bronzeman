// Player page (#/player/<name>): "what should I do now?" for one group member.
// Pulls together what the other pages know: money makers they can do, routes, flips to buy now,
// goals, unlocks they can get, and quests nobody has filled in yet.
import METHODS from "../../data/methods/index.js";
import GUIDES from "../../data/skill-guides.js";
import GOALS from "../../data/goals.js";
import * as prices from "../core/prices.js";
import * as calc from "../core/calc.js";
import * as group from "../core/players.js";
import * as unlocks from "../core/unlocks.js";
import * as history from "../core/history.js";
import { plans as flipPlans } from "../core/flips.js";
import { goals as unlockGoals } from "../core/unlockGoals.js";
import { plan as questPlan } from "../core/questPlan.js";
import { goalCard } from "./group.js";
import { tipFor } from "../core/unlockTips.js";
import { stepsOf, missingQuests, doableAlt } from "../core/autoRoute.js";
import { skillByKey, skillByName, xpForLevel } from "../core/osrs.js";
import { store } from "../core/store.js";
import * as me from "../core/me.js";
import { esc, gp, short, signed, cls, nf, duration, plural } from "../core/format.js";

export const title = "Player";

const NEAR = 5;   // "almost there" = within this many levels

export function mount(root, [nameParam]) {
  // A name in the link wins, then "You" in the header, then the last player viewed here.
  let chosen = nameParam ? decodeURIComponent(nameParam) : me.get() || store.get("playerPage", "");

  root.innerHTML = `
    <form class="toolbar" data-f="pick">
      <div class="field"><label for="pl-name">Player</label><select id="pl-name"></select></div>
      <div class="goal" data-f="sub"></div>
    </form>
    <div data-f="body"></div>`;
  const $ = s => root.querySelector(s);
  const sel = $("#pl-name");
  const openUnlocks = new Set();   // unlocks whose list of methods is open
  root.addEventListener("click", e => {
    const b = e.target.closest("[data-opens]");
    if (!b) return;
    openUnlocks.has(b.dataset.opens) ? openUnlocks.delete(b.dataset.opens) : openUnlocks.add(b.dataset.opens);
    render();
  });
  $('[data-f="pick"]').addEventListener("submit", e => e.preventDefault());
  sel.addEventListener("change", () => { location.hash = "#/player/" + encodeURIComponent(sel.value); });

  const player = () => group.all().find(p => p.name.toLowerCase() === chosen.toLowerCase()) || group.all()[0];

  function section(title, body, link) {
    return `<section class="section psec"><div class="sechead"><h2 class="pagetitle small">${title}</h2>${link ? `<a href="${link.href}">${esc(link.text)} →</a>` : ""}</div>${body}</section>`;
  }

  function moneySection(p) {
    const rows = METHODS.filter(m => (m.tags || ["money"]).includes("money")).map(m => {
      const c = calc.compute(m);
      const miss = group.missing(p, m) || [];
      const locked = unlocks.lockedInputs(m) || [];
      const gap = Math.max(0, ...Object.entries(m.reqs?.skills || {}).map(([s, l]) => l - group.level(p, s)));
      return { m, c, miss, locked, gap, unk: group.unknownQuests(p, m) };
    }).filter(r => r.c.profitHr > 0 && !r.locked.length);
    const now = rows.filter(r => !r.miss.length).sort((a, b) => b.c.profitHr - a.c.profitHr).slice(0, 5);
    const near = rows.filter(r => r.miss.length && r.gap <= NEAR && !r.miss.some(x => !/ \d+$/.test(x)))
      .sort((a, b) => b.c.profitHr - a.c.profitHr).slice(0, 3);
    const line = r => `<li><b>${esc(r.m.name)}</b> <span class="num pos">${short(r.c.profitHr)}/hr</span> <span class="muted">· ${short(r.c.xpTotalHr)} XP/hr</span>${r.unk.length ? ` <span class="pill warn" title="Not known yet if you've done this quest">Needs ${esc(r.unk.join(", "))}?</span>` : ""}</li>`;
    return section("Money makers you can do now", now.length ? `<ul class="plist">${now.map(line).join("")}</ul>` : `<p class="muted">None with everything unlocked yet.</p>`, { href: "#/money", text: "All money makers" })
      + (near.length ? `<h3 class="reqgroup">Almost there</h3><ul class="plist">${near.map(r => `<li><b>${esc(r.m.name)}</b> <span class="num pos">${short(r.c.profitHr)}/hr</span> <span class="muted">· needs ${esc(r.miss.join(", "))} (${r.gap} level${r.gap > 1 ? "s" : ""} to go)</span></li>`).join("")}</ul>` : "");
  }

  function trainingSection(p) {
    const items = Object.entries(GUIDES).map(([key, g]) => {
      const skill = skillByKey(key);
      const lvl = group.level(p, skill.name);
      const routes = g.routes || [{ key: "main", route: g.route }];
      // The route picked on the training page; otherwise the first route whose current step this
      // player can do (no quest that's missing or unknown, everything unlocked).
      const stepFor = r => stepsOf(r, skill.name, p).find(s => !s.alternative && !s.tip && lvl >= s.from && lvl < s.to);
      const doable = r => { const st = stepFor(r), m = st && METHODS.find(x => x.id === st.method);
        return !m || (!(m.reqs?.quests || []).some(q => group.questDone(p, q) !== true) && !(unlocks.lockedInputs(m) || []).length); };
      const picked = store.get("route:" + key, null);
      const r = routes.find(x => x.key === picked) || routes.find(doable) || routes[0];
      const st = stepFor(r);
      const head = `<b><a href="#/training/${key}">${esc(skill.name)}</a></b> ${lvl}${routes.length > 1 ? ` <span class="muted">(${esc(r.name)} route)</span>` : ""}`;
      if (!st) return `<li>${head}: <span class="muted">${lvl >= 99 ? "maxed" : "below the route's first step"}</span></li>`;
      if (st.quest) return `<li>${head}: do the quest <b>${esc(st.quest)}</b> <span class="muted">(levels ${st.from}–${st.to})</span></li>`;
      const m = METHODS.find(x => x.id === st.method);
      if (!m) return `<li>${head}: ${esc(st.method)}</li>`;
      const c = calc.compute(m, { level: lvl }), xpHr = c.xpHr[skill.name] || 0, gpXp = c.profitHr != null && xpHr ? c.profitHr / xpHr : null;
      const locked = unlocks.lockedInputs(m) || [];
      // Exactly what it takes to reach the step's goal from this player's XP: actions, every item to buy,
      // the coins and the time. Burnt food is worked out over the levels still to go.
      const need = (() => {
        const per = m.xp?.[skill.name], xpLeft = Math.max(0, xpForLevel(st.to) - group.xp(p, skill.name));
        if (!per || !xpLeft) return "";
        const cg = m.burn ? calc.compute(m, { from: lvl, to: st.to }) : c, ok = cg.success ?? 1;
        const tries = Math.ceil(xpLeft / (per * ok)), hrs = (cg.xpHr[skill.name] || 0) ? xpLeft / cg.xpHr[skill.name] : null;
        const buy = (cg.ins || []).map(i => `<b class="num">${nf.format(Math.ceil(i.qty * tries))}</b> ${esc(i.it.name)}`);
        const burnt = ok < 1 ? ` <span class="muted">(about ${nf.format(Math.round(tries * (1 - ok)))} will burn)</span>` : "";
        const total = cg.profit == null ? null : cg.profit * tries;
        const time = hrs == null ? "" : m.per === "day" ? `${hrs < 36 ? Math.max(1, Math.round(hrs)) + " h" : (hrs / 24).toFixed(hrs < 240 ? 1 : 0) + " days"}` : duration(hrs);
        return `<div class="sub2 needs">To reach ${st.to} (${nf.format(xpLeft)} XP to go): <b class="num">${nf.format(tries)}</b> ${esc(plural(m.action || "action", tries))}${
          buy.length ? ` · buy ${buy.join(", ")}${burnt}` : ""}${
          total == null || Math.round(total) === 0 ? "" : ` · ${total < 0 ? "costs" : "earns"} <b class="num ${cls(total)}">${gp(Math.abs(total))}</b> gp`}${time ? ` · ${time}` : ""}</div>`;
      })();
      // Blocked by a lock or a missing quest: name the best method this player can do right now.
      let altLine = "";
      if (locked.length || missingQuests(m, p).length) {
        const rows = METHODS.filter(x => (x.xp?.[skill.name] || 0) > 0).map(x => {
          const cx = calc.compute(x, { level: lvl }), xh = cx.xpHr[skill.name] || 0;
          return { m: x, xpHr: xh, req: x.reqs?.skills?.[skill.name] || 1, gpXp: cx.profitHr != null && xh ? cx.profitHr / xh : null };
        });
        const alt = doableAlt(rows, lvl, p, r.auto ? "auto" : r.prefer);
        altLine = alt ? `<div class="sub2">Until then: <b>${esc(alt.m.name)}</b> (${short(alt.xpHr)} XP/hr)</div>` : "";
      }
      return `<li${missingQuests(m, p).length ? ` class="questneed"` : ""}>${head}: <b>${esc(m.name)}</b> until ${st.to} <span class="muted">· ${short(xpHr)} XP/hr · <span class="${cls(gpXp)}">${gpXp == null ? "–" : (gpXp > 0 ? "+" : "") + gpXp.toFixed(1)}</span> gp/XP</span>${locked.length ? ` <span class="pill bad">Missing ${esc(locked.map(x => x.name).join(", "))}</span>` : ""}${(m.reqs?.quests || []).filter(q => group.questDone(p, q) !== true).map(q => ` <span class="pill warn">Needs ${esc(q)}${group.questDone(p, q) === null ? "?" : ""}</span>`).join("")}${need}${altLine}</li>`;
    });
    return section("Training routes", `<ul class="plist">${items.join("")}</ul>`, { href: "#/training", text: "All skills" });
  }

  function flipsSection() {
    const opts = Object.assign({ cash: 1_000_000, minVol: 100 }, store.get("merch", {}));
    const all = flipPlans(opts);
    const done = all.filter(x => x.t !== undefined).length;
    const now = new Date();
    const buyNow = all.filter(x => !x.thin && x.each > 0 && history.cheapNow(x.t, now) != null && Math.min(x.t.buyHit, x.t.sellHit) >= 0.6)
      .sort((a, b) => b.total - a.total).slice(0, 5);
    const body = done < all.length && !buyNow.length ? `<p class="muted">Checking price history (${done} of ${all.length})…</p>`
      : buyNow.length ? `<ul class="plist">${buyNow.map(x => `<li><b>${esc(x.it.name)}</b>: buy at <b class="num">${gp(x.buy)} gp</b> until ${history.hourLabel(history.cheapNow(x.t, now))}, sell at <b class="num">${gp(x.sell)} gp</b> around ${history.hourLabel(x.t.sellHour)}${x.nextDay ? " (+1 day)" : ""} <span class="muted">· <span class="pos">${signed(x.total)}</span> per buy limit</span></li>`).join("")}</ul>`
      : `<p class="muted">No reliable flip is in its cheap part of the day right now (${history.hourLabel(now.getHours())}).</p>`;
    return section("Flips to buy right now", body + `<p class="fine">Usually or reliable patterns only, with ${short(opts.cash)} cash (change it on the Merching tab).</p>`, { href: "#/merch", text: "Merching" });
  }

  function goalsSection(p) {
    const mine = GOALS.filter(g => g.player.toLowerCase() === p.name.toLowerCase());
    if (!mine.length) return section("Goals", `<p class="muted">No goals for ${esc(p.name)}. Set one by telling Claude, for example "${esc(p.name)}: Herblore 45 by Sunday".</p>`, { href: "#/group", text: "Group" });
    return section("Goals", `<div class="goals">${mine.map(g => goalCard(g, group.gained("week", p, g.skill))).join("")}</div>`, { href: "#/group", text: "Group" });
  }

  // First sentence of a tip; for unfinished potions, how to get the herb instead.
  const first = t => (t || "").split(/(?<=\.)\s/)[0];
  function shortTip(g) {
    const unf = g.name.match(/^(.+) potion \(unf\)$/i);
    const herbTip = unf && (tipFor(unf[1]) || tipFor(unf[1] + " leaf") || tipFor(unf[1] + " weed"));
    return herbTip ? `Make one from a clean ${unf[1].toLowerCase()}. ${first(herbTip)}` : first(g.tip);
  }

  // The methods an unlock opens: where to find each one, and whether this player has the levels for it.
  function opensList(p, g) {
    return `<ul class="opens">${g.methods.map(m => {
      const skills = Object.keys(m.xp || {}), key = skillByName(skills[0])?.key;
      const href = key ? `#/training/${key}` : "#/money";
      const miss = group.missing(p, m);
      const others = unlocks.lockedInputs(m).filter(x => x.name !== g.name).map(x => x.name);
      const reqs = Object.entries(m.reqs?.skills || {}).map(([s, l]) => `${s} ${l}`).join(", ");
      return `<li><a href="${href}">${esc(m.name)}</a> ${miss?.length ? "" : `<span class="muted">${esc(reqs)}</span>`}
        ${miss == null ? "" : miss.length ? `<span class="pill warn">Needs ${esc(miss.join(", "))}</span>` : `<span class="pill good">You can do it</span>`}
        ${others.length ? `<span class="pill bad" title="Still locked after this unlock">Also needs ${esc(others.join(", "))}</span>` : ""}</li>`;
    }).join("")}</ul>`;
  }

  // What to do next: the Quest Helper plugin's Optimal Ironman order, against this player's quests and levels.
  function todoSection(p) {
    const title = "What to do next";
    const pl = questPlan(p);
    if (!pl) return section(title, `<p class="muted">The site doesn't know which quests ${esc(p.name)} has done. Turn on the WikiSync plugin in RuneLite and log in; the site picks it up within 3 hours.</p>`);
    if (!pl.steps.length) return section(title, `<p class="pos">Every quest and diary on the list is done.</p>`);
    const wiki = n => `https://oldschool.runescape.wiki/w/${encodeURIComponent(n.replace(/^Recipe for Disaster - .*/, "Recipe for Disaster").replace(/ /g, "_"))}`;
    const kind = it => it.type === "diary" ? "Achievement diary" : it.type === "miniquest" ? "Miniquest" : "Quest";
    const skillLink = s => `<a href="#/training/${skillByName(s.skill)?.key}">${esc(s.skill)} ${s.need}</a> <span class="muted">(you're ${s.have}${s.boostable ? ", a boost works" : ""})</span>`;
    const progress = st => {
      if (st.item.type !== "diary") return st.state === 1 ? ` <span class="pill warn">Started</span>` : "";
      const m = st.item.diary.match(/^(.+) (\w+)$/), v = group.diaryProgress(p, m[1], m[2]);
      return v ? ` <span class="pill${v[0] ? " warn" : ""}">${v[0]}/${v[1]} tasks</span>` : "";
    };
    const first = (st, lead) => `<div class="todo ${st.ready ? "ready" : "blocked"}">
      <div class="sub2">${lead} · ${kind(st.item)}</div>
      <div class="todoname"><a href="${wiki(st.item.name)}" target="_blank" rel="noopener">${esc(st.item.name)}</a>${progress(st)}</div>
      ${st.ready ? `<div class="sub2">You have everything it needs${st.item.qp ? ` (check that you have ${st.item.qp} quest points)` : ""}.</div>` : `
        ${st.skills.length ? `<div>Train first: ${st.skills.map(skillLink).join(", ")}</div>` : ""}
        ${st.quests.length ? `<div>Finish first: ${st.quests.map(q => `<a href="${wiki(q.replace(/ \(started\)$/, ""))}" target="_blank" rel="noopener">${esc(q)}</a>`).join(", ")}</div>` : ""}`}
    </div>`;
    const next = pl.steps[0], doable = pl.steps.find(s => s.ready);
    const after = pl.steps.filter(s => s !== next && s !== doable).slice(0, 6);
    const pct = pl.total ? (pl.done / pl.total) * 100 : 0;
    return section(title, `
      <div class="todobar"><div class="bar" role="progressbar" aria-valuenow="${Math.round(pct)}" aria-valuemin="0" aria-valuemax="100" aria-label="Steps done"><span style="width:${pct.toFixed(1)}%"></span></div>
        <span class="sub2"><b class="num">${pl.done}</b> of ${pl.total} quests and diaries done</span></div>
      ${first(next, "Next on the list")}
      ${!next.ready && doable ? first(doable, "You can do this one right now") : ""}
      ${pl.train.length ? `<h3 class="reqgroup">Skills to train for the next 30 steps</h3><ul class="plist">${pl.train.map(s =>
        `<li>${skillLink(s)} <span class="muted">· ${s.need - s.have} level${s.need - s.have === 1 ? "" : "s"} · first needed for ${esc(s.for)}</span></li>`).join("")}</ul>` : ""}
      ${after.length ? `<h3 class="reqgroup">After that</h3><ol class="plist todolist">${after.map(st => `<li><a href="${wiki(st.item.name)}" target="_blank" rel="noopener">${esc(st.item.name)}</a>${progress(st)}
        ${st.ready ? "" : `<span class="muted">· needs ${esc([...st.skills.map(s => `${s.skill} ${s.need}`), ...st.quests].join(", "))}</span>`}</li>`).join("")}</ol>` : ""}
      <p class="fine">The order is the "Optimal Ironman" list of the <a href="https://github.com/Zoinkwiz/quest-helper" target="_blank" rel="noopener">Quest Helper</a> RuneLite plugin: pick the same order in the plugin and it walks you through each quest. Requirements are from the wiki; quest points, combat and items aren't checked.${pl.untracked ? ` ${pl.untracked} small steps the site can't see (balloon routes, the Stronghold of Security) are left out.` : ""}</p>`);
  }

  function unlockSection(p) {
    const list = (unlockGoals() || []).filter(g => g.reqs && ((!Object.keys(g.reqs).length && !g.gate) || g.who.some(w => w.p === p && w.gap === 0))).slice(0, 5);
    return section("Unlocks you can get now", list.length
      ? `<ul class="plist">${list.map(g => {
        const open = openUnlocks.has(g.name);
        return `<li><b>${esc(g.name)}</b> <span class="muted">·</span> <button type="button" class="linkbtn" data-opens="${esc(g.name)}" aria-expanded="${open}">opens ${g.methods.length} method${g.methods.length > 1 ? "s" : ""} ${open ? "▾" : "▸"}</button>
          <div class="sub2">${esc(shortTip(g))}</div>${open ? opensList(p, g) : ""}</li>`;
      }).join("")}</ul>`
      : `<p class="muted">None right now.</p>`, { href: "#/unlocked", text: "Unlock goals" });
  }

  function questSection(p) {
    const unknown = [...new Set(METHODS.flatMap(m => m.reqs?.quests || []))].filter(q => group.questDone(p, q) === null);
    if (!unknown.length) return "";
    return section("Quests to fill in", `<p class="fine">Methods need these, but it's not known yet if ${esc(p.name)} has done them: ${esc(unknown.join(", "))}. Turn on the WikiSync plugin in RuneLite to fill them in automatically, or tell Claude which ones are done.</p>`, { href: "#/group", text: "Quests" });
  }

  function render() {
    const names = group.all().map(p => p.name);
    sel.innerHTML = names.map(n => `<option>${esc(n)}</option>`).join("");
    const p = player();
    if (!p) return;
    sel.value = p.name;
    store.set("playerPage", p.name);
    if (!group.loaded()) { $('[data-f="body"]').innerHTML = `<p class="muted">Loading stats…</p>`; return; }
    if (!p.skills) { $('[data-f="body"]').innerHTML = `<p class="muted">No stats for ${esc(p.name)} on Wise Old Man yet.</p>`; return; }
    $('[data-f="sub"]').innerHTML = `<a href="${group.profileUrl(p)}" target="_blank" rel="noopener">Wise Old Man profile</a> · stats ${esc(new Date(p.updatedAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }))}`;
    if (!prices.ready() || !unlocks.loaded()) { $('[data-f="body"]').innerHTML = `<p class="muted">Loading prices and unlocks…</p>`; return; }
    $('[data-f="body"]').innerHTML = `<div class="pgrid">
      <div>${todoSection(p)}${moneySection(p)}${trainingSection(p)}</div>
      <div>${flipsSection()}${goalsSection(p)}${unlockSection(p)}${questSection(p)}</div>
    </div>`;
  }

  if (GOALS.length) group.loadGains("week");
  const offs = [prices.onChange(render), calc.onChange(render), group.onChange(render), unlocks.onChange(render), history.onChange(render),
    me.onChange(() => { if (me.get()) { chosen = me.get(); render(); } })];
  render();
  return () => offs.forEach(off => off());
}
