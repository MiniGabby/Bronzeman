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
import { goalCard } from "./group.js";
import { tipFor } from "../core/unlockTips.js";
import { stepsOf, missingQuests, doableAlt } from "../core/autoRoute.js";
import { skillByKey } from "../core/osrs.js";
import { store } from "../core/store.js";
import * as me from "../core/me.js";
import { esc, gp, short, signed, cls } from "../core/format.js";

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
      const stepFor = r => stepsOf(r, skill.name, p).find(s => lvl >= s.from && lvl < s.to);
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
      const c = calc.compute(m), xpHr = c.xpHr[skill.name] || 0, gpXp = c.profitHr != null && xpHr ? c.profitHr / xpHr : null;
      const locked = unlocks.lockedInputs(m) || [];
      // Blocked by a lock or a missing quest: name the best method this player can do right now.
      let altLine = "";
      if (locked.length || missingQuests(m, p).length) {
        const rows = METHODS.filter(x => (x.xp?.[skill.name] || 0) > 0).map(x => {
          const cx = calc.compute(x), xh = cx.xpHr[skill.name] || 0;
          return { m: x, xpHr: xh, req: x.reqs?.skills?.[skill.name] || 1, gpXp: cx.profitHr != null && xh ? cx.profitHr / xh : null };
        });
        const alt = doableAlt(rows, lvl, p, r.auto ? "auto" : r.prefer);
        altLine = alt ? `<div class="sub2">Until then: <b>${esc(alt.m.name)}</b> (${short(alt.xpHr)} XP/hr)</div>` : "";
      }
      return `<li${missingQuests(m, p).length ? ` class="questneed"` : ""}>${head}: <b>${esc(m.name)}</b> until ${st.to} <span class="muted">· ${short(xpHr)} XP/hr · <span class="${cls(gpXp)}">${gpXp == null ? "–" : (gpXp > 0 ? "+" : "") + gpXp.toFixed(1)}</span> gp/XP</span>${locked.length ? ` <span class="pill bad">Missing ${esc(locked.map(x => x.name).join(", "))}</span>` : ""}${(m.reqs?.quests || []).filter(q => group.questDone(p, q) !== true).map(q => ` <span class="pill warn">Needs ${esc(q)}${group.questDone(p, q) === null ? "?" : ""}</span>`).join("")}${altLine}</li>`;
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

  function unlockSection(p) {
    const list = (unlockGoals() || []).filter(g => g.reqs && (!Object.keys(g.reqs).length || g.who.some(w => w.p === p && w.gap === 0))).slice(0, 5);
    return section("Unlocks you can get now", list.length
      ? `<ul class="plist">${list.map(g => `<li><b>${esc(g.name)}</b> <span class="muted">· opens ${g.methods.length} method${g.methods.length > 1 ? "s" : ""}</span><div class="sub2">${esc(shortTip(g))}</div></li>`).join("")}</ul>`
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
      <div>${moneySection(p)}${trainingSection(p)}</div>
      <div>${flipsSection()}${goalsSection(p)}${unlockSection(p)}${questSection(p)}</div>
    </div>`;
  }

  if (GOALS.length) group.loadGains("week");
  const offs = [prices.onChange(render), calc.onChange(render), group.onChange(render), unlocks.onChange(render), history.onChange(render),
    me.onChange(() => { if (me.get()) { chosen = me.get(); render(); } })];
  render();
  return () => offs.forEach(off => off());
}
