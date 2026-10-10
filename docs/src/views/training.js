// Skill training page. Without a skill: a grid of all skills. With a skill (#/training/magic):
// every method that gives XP in that skill, compared on gp per XP, XP per hour and cost to a target level.
import METHODS from "../../data/methods/index.js";
import * as prices from "../core/prices.js";
import * as calc from "../core/calc.js";
import * as group from "../core/players.js";
import * as unlocks from "../core/unlocks.js";
import { SKILLS, skillByKey, xpForLevel, levelForXp } from "../core/osrs.js";
import { store } from "../core/store.js";
import * as me from "../core/me.js";
import { esc, gp, short, signed, cls, duration, nf } from "../core/format.js";
import { createMethodCard } from "../components/methodCard.js";
import GUIDES from "../../data/skill-guides.js";
import { tipFor } from "../core/unlockTips.js";
import { stepsOf, timeValue, setTimeValue, missingQuests, doableAlt } from "../core/autoRoute.js";
import * as burn from "../core/burn.js";
import * as history from "../core/history.js";
import * as ui from "../core/ui.js";

export const title = "Skill training";

const methodsFor = skillName => METHODS.filter(m => (m.xp?.[skillName] || 0) > 0);

export function mount(root, [skillKey]) {
  const skill = skillByKey(skillKey);
  return skill ? mountSkill(root, skill) : mountGrid(root);
}

// The skills tab, laid out like in game: 3 columns in the in-game order, total level at the bottom.
// Shows the levels of one player ("You" in the header by default) or the group's best per skill.
// Skill icons are loaded from the OSRS Wiki.
const ICON = name => `https://oldschool.runescape.wiki/images/${encodeURIComponent(name)}_icon.png`;

function mountGrid(root) {
  function render() {
    const who = me.get() || "";   // the "You" menu at the top; none picked = group best
    const ps = group.all().filter(p => p.skills);
    const p = who && ps.find(x => x.name.toLowerCase() === who.toLowerCase());
    const bestOf = s => (ps.length ? Math.max(...ps.map(x => group.level(x, s.name))) : null);
    const levelOf = s => (p ? group.level(p, s.name) : bestOf(s));
    const total = SKILLS.reduce((t, s) => t + (levelOf(s) || 0), 0);
    const bestTotal = SKILLS.reduce((t, s) => t + (bestOf(s) || 0), 0);
    root.innerHTML = `
      <p class="lead">Pick a skill to compare every method that trains it: what it costs or earns per XP, how fast it is, and what it takes to reach your next goal.</p>
      <p class="fine">${p ? `${esc(p.name)}'s level / the group's highest. Bar = progress to the next level.` : "The group's highest level per skill. Pick your name in the \"You\" menu at the top to see your own levels and progress."} "Route" = this skill has a training route.</p>
      <div class="rsgrid" role="list">${SKILLS.map(s => {
        const n = methodsFor(s.name).length, lvl = levelOf(s), best = bestOf(s);
        const top = best && ps.filter(x => group.level(x, s.name) === best).map(x => x.name).join(", ");
        let pct = null, tip = `${s.name}${lvl ? ` ${lvl}` : ""}${p && best ? ` / group best ${best} (${top})` : best ? ` (${top})` : ""} · ${n ? `${n} method${n > 1 ? "s" : ""}` : "no methods yet"}`;
        if (p && lvl) {
          const xp = group.xp(p, s.name), a = xpForLevel(lvl), b = xpForLevel(lvl + 1);
          pct = lvl >= 99 ? 100 : Math.max(0, Math.min(100, ((xp - a) / (b - a)) * 100));
          tip += lvl >= 99 ? " · maxed" : ` · ${nf.format(xp)} XP, ${nf.format(b - xp)} to ${lvl + 1}`;
        }
        return `<a role="listitem" class="rstile${n ? "" : " empty"}" href="#/training/${s.key}" title="${esc(tip)}" aria-label="${esc(tip)}">
          <img src="${ICON(s.name)}" alt="" width="25" height="25" loading="lazy" onerror="this.closest('.rstile').classList.add('noicon'); this.remove()">
          <span class="rsname">${esc(s.name)}${GUIDES[s.key] ? ` <span class="rsroute">Route</span>` : ""}</span>
          <span class="rslvl">${lvl ?? "–"}${p && best ? `<span class="rsbest${lvl >= best ? " top" : ""}">/${best}</span>` : ""}</span>
          ${pct != null ? `<span class="rsbar"><span style="width:${pct.toFixed(1)}%"></span></span>` : ""}
        </a>`;
      }).join("")}
        <div class="rstotal">Total level: ${group.loaded() ? nf.format(total) : "…"}${p ? `<span class="rsbest">/${nf.format(bestTotal)}</span> <span>(${esc(p.name)} / group best per skill)</span>` : " <span>(group best per skill)</span>"}</div>
      </div>`;
  }
  const offs = [group.onChange(render), me.onChange(render)];
  render();
  return () => offs.forEach(off => off());
}

function mountSkill(root, skill) {
  const methods = methodsFor(skill.name);
  const key = "train:" + skill.key;
  const goal = Object.assign({ player: "", current: 1, target: 50, sort: "cheap" }, store.get(key, {}));
  if (me.get()) goal.player = me.get();
  const save = () => store.set(key, goal);

  root.innerHTML = `
    <nav class="crumb"><a href="#/training">All skills</a> / ${esc(skill.name)}</nav>
    <h2 class="pagetitle">${esc(skill.name)} training</h2>
    <form class="toolbar" data-f="form">
      <div class="field"><label for="t-player">Player</label>
        <select id="t-player"><option value="">Custom level</option></select></div>
      <div class="field"><label for="t-current">Current level</label>
        <input id="t-current" type="number" min="1" max="98" inputmode="numeric"></div>
      <div class="field"><label for="t-target">Target level</label>
        <input id="t-target" type="number" min="2" max="99" inputmode="numeric"></div>
      <div class="field"><label for="t-sort">Sort by</label>
        <select id="t-sort">
          <option value="cheap">Cheapest per XP</option>
          <option value="fast">Fastest XP</option>
          <option value="profit">Most profit per hour</option>
        </select></div>
      ${methods.some(m => m.burn) ? `<div class="field"><label for="t-cookon">Cooking on</label>
        <select id="t-cookon"><option value="range">A range</option><option value="fire">A fire</option></select></div>
      <label class="check"><input type="checkbox" id="t-gauntlets"> Cooking gauntlets</label>` : ""}
      <div class="goal" data-f="goal"></div>
    </form>
    ${methods.some(m => m.burn) ? `<p class="fine">Burnt food is counted: the success chance rises from about 50% at a fish's level requirement to 100% at its stop-burn level (from the wiki). Route steps use the average over their levels, the table and cards use your current level. Gauntlets only help with lobsters, swordfish, monkfish, sharks and anglerfish.</p>` : ""}
    <section class="section" data-f="route" hidden></section>
    <h2 class="pagetitle small">All ${esc(skill.name)} methods</h2>
    <section class="board"><table>
      <thead><tr><th>Method</th><th class="r">Level</th><th class="r">${esc(skill.name)} ${ui.t("XP / hr", "XP per hour")}</th><th class="r">${ui.t("GP / XP", "Coins per XP")}</th><th class="r">${ui.t("Profit / hr", "Profit per hour")}</th><th class="r">${ui.t("Time to target", "Time to your goal")}</th><th class="r">${ui.t("Cost to target", "Cost to your goal")}</th><th>${ui.t("Inputs unlocked", "Items unlocked")}</th></tr></thead>
      <tbody data-f="rows"></tbody>
    </table></section>
    <p class="fine">GP / XP counts all profit or cost of a method against ${esc(skill.name)} XP, even when the method also trains other skills. Time and cost assume you stay on one method the whole way.</p>
    <section class="methods" data-f="cards"></section>`;

  const $ = s => root.querySelector(s);
  const playerSel = $("#t-player"), cur = $("#t-current"), tgt = $("#t-target"), sortSel = $("#t-sort");
  const cards = new Map();
  const openLevels = new Set();   // route steps whose "per level" table is open

  function fillPlayers() {
    const opts = group.all().filter(p => p.skills)
      .map(p => `<option value="${esc(p.name)}">${esc(p.name)} (${group.level(p, skill.name)})</option>`).join("");
    playerSel.innerHTML = `<option value="">Custom level</option>${opts}`;
    // Match case-insensitively: Wise Old Man may capitalise names differently from data/players.js.
    // Only drop an unknown name once the levels have loaded; before that the list is still empty.
    const found = group.all().find(p => p.skills && p.name.toLowerCase() === (goal.player || "").toLowerCase())?.name;
    if (found || group.loaded()) goal.player = found || "";
    playerSel.value = found || "";
  }

  function currentXp() {
    const p = goal.player && group.all().find(x => x.name === goal.player && x.skills);
    if (p) return group.xp(p, skill.name);
    return xpForLevel(goal.current);
  }

  const guide = GUIDES[skill.key];
  const fmtGpXp = v => v == null ? "–" : (v > 0 ? "+" : "") + v.toFixed(1);
  // Farm runs (per: "day" methods) happen once or twice a day, so their numbers are shown per day
  // and their time in days of real time; everything else is per hour of play.
  const isDaily = m => m?.per === "day";
  const perTag = m => (isDaily(m) ? ` <span class="muted">/day</span>` : "");
  const rateOf = (m, v, f = short) => f(v == null ? v : v * calc.periodHours(m)) + perTag(m);
  const days = h => (h == null || !isFinite(h) ? "–" : h < 36 ? `${Math.max(1, Math.round(h))} h` : `${h < 240 ? (h / 24).toFixed(1) : nf.format(Math.round(h / 24))} days`);
  const timeOf = (m, h) => (isDaily(m) ? days(h) : duration(h));

  function lockCell(m) {
    if (!(m.inputs || []).length) return `<span class="muted">No inputs</span>`;
    const locked = unlocks.lockedInputs(m);
    if (locked == null) return "…";
    return locked.length
      ? `<span class="pill bad">Missing ${esc(locked.map(x => x.name).join(", "))}</span>`
      : `<span class="pill good">All unlocked</span>`;
  }

  // The route: recommended method per level range, with live numbers and unlock status.
  // A skill can have several routes (fastest, cheapest...), shown as tabs.
  const routes = guide ? (guide.routes || [{ key: "main", route: guide.route }]) : [];
  const routeKey = () => {
    const k = store.get("route:" + skill.key, routes[0]?.key);
    return routes.some(r => r.key === k) ? k : routes[0]?.key;
  };

  const quester = () => (goal.player && group.all().find(x => x.name === goal.player && x.skills)) || null;

  // Per level of a route step, for methods that burn food: how much burns at that level, and what the
  // level costs or earns. Each row is worked out at that exact level (the step itself uses the average).
  function levelRows(m, st, lvlNow) {
    const per = m.xp?.[skill.name] || 0;
    let sumGp = 0, sumTries = 0, complete = true;
    const body = Array.from({ length: st.to - st.from }, (_, i) => st.from + i).map(lvl => {
      const c = calc.compute(m, { level: lvl }), ok = c.success ?? 1, xpHr = c.xpHr[skill.name] || 0;
      const need = xpForLevel(lvl + 1) - xpForLevel(lvl);
      const tries = per && ok ? need / (per * ok) : 0;
      const gpLevel = c.profitHr == null || !xpHr ? null : (need / xpHr) * c.profitHr;
      if (gpLevel == null) complete = false; else sumGp += gpLevel;
      sumTries += tries;
      return `<tr class="${lvl === lvlNow ? "here" : ""}"><td class="num">${lvl} → ${lvl + 1}${lvl === lvlNow ? ` <span class="pill good">You</span>` : ""}</td>
        <td class="r num ${ok >= 1 ? "pos" : ""}">${ok >= 1 ? "None" : `${Math.round((1 - ok) * 100)}%`}</td>
        <td class="r num">${nf.format(Math.ceil(tries))}<div class="sub2">${ok >= 1 ? "" : `${nf.format(Math.round(tries * (1 - ok)))} burn`}</div></td>
        <td class="r num">${short(xpHr)}</td>
        <td class="r num ${cls(c.profitHr)}">${signed(c.profitHr)}</td>
        <td class="r num ${cls(gpLevel)}">${gpLevel == null ? "–" : signed(gpLevel)}</td></tr>`;
    }).join("");
    return `<tr class="leveldetail"><td colspan="6"><div class="levelbox"><table>
      <thead><tr><th>Level</th><th class="r">${ui.t("Burn rate", "How much burns")}</th><th class="r">${ui.t("To cook", "How many to cook")}</th><th class="r">${ui.t("XP / hr", "XP per hour")}</th><th class="r">${ui.t("GP / hr", "Coins per hour")}</th><th class="r">${ui.t("GP for this level", "Coins for this level")}</th></tr></thead>
      <tbody>${body}
        <tr class="total"><td>${st.from} → ${st.to}</td><td></td><td class="r num">${nf.format(Math.ceil(sumTries))}</td><td></td><td></td><td class="r num ${cls(sumGp)}">${complete ? signed(sumGp) : "–"}</td></tr>
      </tbody></table></div>
      <p class="fine">On ${esc(burn.label(burn.source()))}, at live prices. Minus means it costs coins, plus means it earns them. Burnt food gives no XP and can't be sold.</p></td></tr>`;
  }

  function renderRoute(rows, lvlNow, xpNow) {
    const host = $('[data-f="route"]');
    if (!guide) { host.hidden = true; return; }
    host.hidden = false;
    const active = routes.find(r => r.key === routeKey());
    const byId = Object.fromEntries(rows.map(r => [r.m.id, r]));
    const steps0 = stepsOf(active, skill.name, quester());
    const needTips = new Map();
    const histIds = new Set();   // items whose daily price range the steps show
    const showDaily = !ui.simple() && !!store.get("routeDaily", false);   // the "Daily prices" switch above the route
    let totalRec = 0, totalRecH = 0, totalBest = 0, totalBestH = 0, recComplete = true, anyDaily = false;

    const steps = steps0.map(st => {
      // An alternative step (alternative: true) is another way through the same levels as the step above it:
      // it gets its own row, but doesn't count towards the route's total and never carries the "You" mark.
      const here = !st.alternative && lvlNow >= st.from && lvlNow < st.to;
      const lv = `<td class="num">${st.from}–${st.to}${here ? ` <span class="pill good">You</span>` : ""}${st.alternative ? `<div><span class="pill">Alternative</span></div>` : ""}</td>`;
      if (st.quest) {
        return `<tr class="${here ? "here" : ""}">${lv}
          <td class="wrapcell"><a href="${esc(st.url || "#")}" target="_blank" rel="noopener">Quest: ${esc(st.quest)}</a>${st.note ? `<div class="sub2">${esc(st.note)}</div>` : ""}</td>
          <td class="r muted">Quest</td><td class="r muted">–</td><td class="r muted">Free</td><td class="wrapcell"><span class="muted">–</span></td></tr>`;
      }
      let rec = byId[st.method];
      // On the step you're on, only count what's left: from your current XP (and level, for burning).
      const startLvl = here ? lvlNow : st.from;
      // Burnt food depends on level: work the step out over its own level range.
      if (rec?.m.burn) {
        const c = calc.compute(rec.m, { from: startLvl, to: st.to }), xpHr = c.xpHr[skill.name] || 0;
        rec = { ...rec, c, xpHr, gpXp: c.profitHr == null || !xpHr ? null : c.profitHr / xpHr };
      }
      const xp = Math.max(0, xpForLevel(st.to) - (here ? Math.max(xpNow, xpForLevel(st.from)) : xpForLevel(st.from)));
      const locked = rec ? unlocks.lockedInputs(rec.m) : null;
      locked?.forEach(x => { if (tipFor(x.name)) needTips.set(x.name, tipFor(x.name)); });
      // Quests the chosen player still needs for this method (known not done) or that we don't know about.
      const p = quester();
      const needQ = rec ? missingQuests(rec.m, p) : [];
      const unkQ = rec && p ? (rec.m.reqs?.quests || []).filter(q => group.questDone(p, q) === null) : [];
      const blocked = (locked?.length || 0) + needQ.length > 0;
      // Best method that works right now for this range (level ok, everything unlocked, no missing quest),
      // picked the same way as the route: by gold + time on auto routes, cheapest on prefer: "cheap", else fastest.
      const alt = doableAlt(rows, st.from, p, active.auto ? "auto" : active.prefer);
      const cost = r => r && r.xpHr ? { h: xp / r.xpHr, gp: (xp / r.xpHr) * (r.c.profitHr ?? 0) } : null;
      const cr = cost(rec), ca = cost(blocked ? alt : rec);
      const lvKey = `${active.key}:${st.from}`;
      // What to buy for this level range: actions needed (failed ones included, e.g. burnt fish) × inputs per action.
      const buy = (r => {
        const per = r?.m.xp?.[skill.name], ok = r?.c.success ?? 1;
        if (!r || !per || !(r.c.ins || []).length) return "";
        const tries = xp / (per * ok);
        const list = r.c.ins.map(i => `${nf.format(Math.ceil(i.qty * tries))} ${esc(i.it.name)}`).join(", ");
        const burnt = ok < 1 ? ` <span class="muted">(about ${nf.format(Math.round(tries * (1 - ok)))} will burn)</span>` : "";
        const stops = r.m.burn ? `<div class="sub2 stopburn">On ${esc(burn.label(burn.source()))}: ${esc(burn.stopText(r.m))} · <button type="button" class="linkbtn" data-levels="${lvKey}" aria-expanded="${openLevels.has(lvKey)}">${openLevels.has(lvKey) ? "Hide levels ▾" : "Show per level ▸"}</button></div>` : "";
        return `<div class="sub2 buy">${here ? `Still to buy (from your ${nf.format(Math.max(xpNow, xpForLevel(st.from)))} XP)` : "Buy"}: ${list}${burnt}</div>${stops}`;
      })(rec);
      // Usual price range over a day for what this step buys and sells, and the best hour for each.
      const daily = (r => {
        const per = r?.m.xp?.[skill.name];
        if (!showDaily || !r || !per) return "";
        const tries = xp / (per * (r.c.success ?? 1));
        const outs = (r.c.outs || []).length <= 2 ? r.c.outs || [] : [];   // long loot lists would swamp the step
        const line = (x, side) => {
          if (x.id == null && x.it?.id == null) return "";
          const id = x.id ?? x.it.id;
          histIds.add(id);
          const t = history.get(id);
          if (t === undefined) return history.loading(id) ? `<div class="sub2 daily muted">${esc(x.it.name)}: daily prices loading…</div>` : "";
          const range = t && history.dayRange(t, side);
          if (!range) return "";
          const [lo, hi] = range, buying = side === "buy";
          const rel = history.reliability(buying ? t.buyHit : t.sellHit);
          const hits = buying ? `Below the day's average on ${t.buyHitDays} of ${t.buyDays} days` : `Above the day's average on ${t.sellHitDays} of ${t.sellDays} days`;
          const until = buying ? history.cheapNow(t) : null;
          const diff = (hi - lo) * x.qty * tries;
          return `<div class="sub2 daily"><b>${esc(x.it.name)}</b>: ${buying ? "buy" : "sell"} at <span class="num">${gp(lo)}${Math.round(lo) === Math.round(hi) ? "" : `–${gp(hi)}`}</span> gp over a day, ${
            buying ? "cheapest" : "best"} around <b class="num">${history.hourLabel(buying ? t.buyHour : t.sellHour)}</b> <span class="pill ${rel.pill}" title="${hits}">${rel.label}</span>${
            until != null ? ` <span class="pill good">Cheap now, until ${history.hourLabel(until)}</span>` : ""}${
            diff >= 1000 ? ` <span class="muted">· ${buying ? "buying at the low instead of the high saves" : "selling at the high instead of the low earns"} about ${short(diff)} ${here ? "on what's left" : "on this step"}</span>` : ""}</div>`;
        };
        return (r.c.ins || []).map(x => line(x, "buy")).join("") + outs.map(x => line(x, "sell")).join("");
      })(rec);
      if (st.alternative) { /* shown, not added up */ }
      else if (cr) { totalRec += cr.gp; totalRecH += cr.h; } else recComplete = false;
      if (isDaily(rec?.m)) anyDaily = true;
      if (ca && !st.alternative) { totalBest += ca.gp; totalBestH += ca.h; }
      const status = [
        locked == null ? "…" : locked.length ? `<span class="pill bad">Missing ${esc(locked.map(x => x.name).join(", "))}</span>` : "",
        ...needQ.map(q => `<span class="pill warn" title="${esc(p.name)} hasn't done this quest yet">Needs quest: ${esc(q)}</span>`),
        ...unkQ.map(q => `<span class="sub2" title="Not known if ${esc(p.name)} has done it">Needs ${esc(q)} (done?)</span>`)
      ].filter(Boolean);
      return `<tr class="${[here ? "here" : "", needQ.length ? "questneed" : "", st.alternative ? "altrow" : ""].join(" ").trim()}">${lv}
        <td class="wrapcell"><a href="#/training/${skill.key}" data-jump="${rec?.m.id || ""}">${esc(rec ? rec.m.name : st.method)}</a>${buy}${daily}${st.note ? `<div class="sub2">${esc(st.note)}</div>` : ""}</td>
        <td class="r num">${rec ? rateOf(rec.m, rec.xpHr) : "–"}</td>
        <td class="r num ${cls(rec?.gpXp)}">${fmtGpXp(rec?.gpXp)}</td>
        <td class="r num ${cls(cr?.gp)}">${cr ? signed(cr.gp) : "–"}<div class="sub2">${cr ? timeOf(rec.m, cr.h) : ""}</div></td>
        <td class="wrapcell">${status.length ? status.join(" ") : `<span class="pill good">All unlocked</span>`}${blocked
          ? (alt ? `<div class="sub2">Until then: <b>${esc(alt.m.name)}</b> (${rateOf(alt.m, alt.xpHr)} XP${isDaily(alt.m) ? "" : "/hr"}, ${fmtGpXp(alt.gpXp)} gp/XP)</div>` : `<div class="sub2">Nothing else on the site fits this level yet.</div>`) : ""}</td>
      </tr>${rec?.m.burn && openLevels.has(lvKey) ? levelRows(rec.m, st, lvlNow) : ""}`;
    }).join("");

    // Price history for the items on screen, at most 40 requests (cached for an hour).
    history.want([...histIds].slice(0, 40));

    const first = steps0[0].from, last = Math.max(...steps0.map(st => st.to));
    const tabs = routes.length > 1 ? `<div class="seg routetabs" role="group" aria-label="Route">${routes.map(r =>
      `<button type="button" data-route="${esc(r.key)}" aria-pressed="${r.key === active.key}">${esc(r.name)}</button>`).join("")}</div>` : "";
    host.innerHTML = `
      <div class="sechead"><h2 class="pagetitle small">Training route${routes.length > 1 ? "s" : ""}</h2>
        <div class="routeopts"><label class="check simple-hide" title="Show the usual price range over a day, and the best hour to buy or sell, under every step"><input type="checkbox" id="t-daily"${showDaily ? " checked" : ""}> Daily prices</label>${tabs}</div></div>
      ${guide.intro ? `<p class="lead">${esc(ui.simple() ? ui.firstSentences(guide.intro) : guide.intro)}</p>` : ""}
      ${active.intro ? `<p class="lead">${esc(ui.simple() ? ui.firstSentences(active.intro) : active.intro)}</p>` : ""}
      ${active.auto ? `<div class="toolbar timevalue">
        <div class="field"><label for="t-timevalue">Your time is worth (gp per hour)</label>
          <input id="t-timevalue" type="number" min="0" step="100000" inputmode="numeric" value="${timeValue()}"></div>
        <div class="presets">${[0, 250_000, 500_000, 1_000_000, 2_000_000, 5_000_000].map(v => `<button type="button" data-tv="${v}">${v ? short(v) : "Only cost"}</button>`).join("")}</div>
        <p class="fine">Higher = faster route, lower = cheaper route. A good value is what your best money maker earns per hour: an hour spent training is an hour you're not making money.${quester() ? ` Methods that need a quest ${esc(quester().name)} hasn't done are shown in orange, with an alternative you can do now.` : " Pick a player above to see which methods need a quest they haven't done."}</p>
      </div>` : ""}
      <div class="board"><table>
        <thead><tr><th>Levels</th><th>${ui.t("Recommended", "What to do")}</th><th class="r">${ui.t("XP / hr", "XP per hour")}</th><th class="r">${ui.t("GP / XP", "Coins per XP")}</th><th class="r">${ui.t("Cost for these levels", "Cost and time for these levels")}</th><th>${ui.t("Unlocks &amp; quests", "What you still need")}</th></tr></thead>
        <tbody data-f="route-rows">${steps}
          <tr class="total"><td>${first}–${last}</td><td>Whole route${recComplete ? "" : " (some prices missing)"}</td><td></td><td></td>
            <td class="r num ${cls(totalRec)}">${signed(totalRec)}<div class="sub2">${anyDaily ? days(totalRecH) : duration(totalRecH)}</div></td>
            <td class="wrapcell"><span class="sub2">With the alternative wherever the recommended method is locked or needs a quest: <b class="num">${signed(totalBest)}</b>${anyDaily ? "" : ` over ${duration(totalBestH)}`}</span></td></tr>
        </tbody>
      </table></div>
      ${showDaily && histIds.size ? `<p class="fine">Daily prices: the usual range a buy or sell offer fills at over a day, and the hour (your time) it's usually best, from about 3 weeks of hourly prices. Hourly averages hide short spikes, so treat them as a guide.</p>` : ""}
      ${needTips.size ? `<div class="unlocktips"><h3 class="reqgroup">How to unlock what the route needs</h3><p class="fine">You only need one of each: once anyone in the group has obtained an item, everyone can buy more on the GE.</p><ul>${
        [...needTips].map(([n, t]) => `<li><b>${esc(n)}</b>: ${esc(t)}</li>`).join("")}</ul></div>` : ""}`;
  }

  function render() {
    fillPlayers();
    const xpNow = currentXp();
    const player = goal.player && group.all().find(x => x.name === goal.player && x.skills);
    const lvlNow = player ? group.level(player, skill.name) : levelForXp(xpNow);
    if (document.activeElement !== cur) cur.value = lvlNow;
    cur.disabled = !!goal.player;
    if (document.activeElement !== tgt) tgt.value = goal.target;
    sortSel.value = goal.sort;
    const need = Math.max(0, xpForLevel(goal.target) - xpNow);
    $('[data-f="goal"]').innerHTML = need
      ? `<b class="num">${gp(need)}</b> XP to level ${goal.target}`
      : `Already level ${goal.target} or higher`;

    if (!methods.length) {
      $('[data-f="rows"]').innerHTML = `<tr><td colspan="8" class="muted">No ${esc(skill.name)} methods yet. Add one in data/methods (see the README).</td></tr>`;
      return;
    }
    if (!prices.ready()) {
      $('[data-f="rows"]').innerHTML = `<tr><td colspan="8" class="muted">Loading prices…</td></tr>`;
      return;
    }

    const rows = methods.map(m => {
      const c = calc.compute(m, { level: lvlNow });
      const xpHr = c.xpHr[skill.name] || 0;
      const req = m.reqs?.skills?.[skill.name] || 1;
      const gpXp = c.profitHr == null || !xpHr ? null : c.profitHr / xpHr;
      const hrs = xpHr ? need / xpHr : Infinity;
      return { m, c, xpHr, req, gpXp, hrs, total: c.profitHr == null ? null : hrs * c.profitHr, open: lvlNow >= req };
    });
    const by = {
      cheap: (a, b) => (b.gpXp ?? -Infinity) - (a.gpXp ?? -Infinity),
      fast: (a, b) => b.xpHr - a.xpHr,
      profit: (a, b) => (b.c.profitHr ?? -Infinity) - (a.c.profitHr ?? -Infinity)
    }[goal.sort];
    rows.sort((a, b) => (b.open - a.open) || by(a, b));

    $('[data-f="rows"]').innerHTML = rows.map(r => `<tr class="${r.open ? "" : "locked"}">
      <td><a href="#/training/${skill.key}" data-jump="${r.m.id}">${esc(r.m.name)}</a>${r.open ? "" : ` <span class="pill warn">Needs ${r.req}</span>`}${r.m.burn ? `<div class="sub2">${esc(burn.stopText(r.m))}</div>` : ""}</td>
      <td class="r num">${r.req}</td>
      <td class="r num">${rateOf(r.m, r.xpHr)}</td>
      <td class="r num ${cls(r.gpXp)}">${r.gpXp == null ? "–" : (r.gpXp > 0 ? "+" : "") + r.gpXp.toFixed(1)}</td>
      <td class="r num ${cls(r.c.profitHr)}">${rateOf(r.m, r.c.profitHr, signed)}</td>
      <td class="r num">${need ? timeOf(r.m, r.hrs) : "–"}</td>
      <td class="r num ${cls(r.total)}">${need ? signed(r.total) : "–"}</td>
      <td class="wrapcell">${lockCell(r.m)}</td>
    </tr>`).join("");

    renderRoute(rows, lvlNow, xpNow);

    const host = $('[data-f="cards"]');
    for (const r of rows) {
      if (!cards.has(r.m.id)) cards.set(r.m.id, createMethodCard(r.m));
      const card = cards.get(r.m.id);
      host.appendChild(card.el);
      card.update(r.c);
    }
  }

  $('[data-f="form"]').addEventListener("submit", e => e.preventDefault());
  playerSel.addEventListener("change", () => { goal.player = playerSel.value; save(); render(); });
  cur.addEventListener("input", () => { goal.current = Math.min(98, Math.max(1, Number(cur.value) || 1)); save(); render(); });
  tgt.addEventListener("input", () => { goal.target = Math.min(99, Math.max(2, Number(tgt.value) || 2)); save(); render(); });
  sortSel.addEventListener("change", () => { goal.sort = sortSel.value; save(); render(); });
  const cookOn = $("#t-cookon"), gaunt = $("#t-gauntlets");
  if (cookOn) {
    cookOn.value = burn.source().where; gaunt.checked = burn.source().gauntlets;
    cookOn.addEventListener("change", () => { burn.setSource({ where: cookOn.value }); render(); });
    gaunt.addEventListener("change", () => { burn.setSource({ gauntlets: gaunt.checked }); render(); });
  }
  $('[data-f="route"]').addEventListener("change", e => {
    if (e.target.id === "t-daily") { store.set("routeDaily", e.target.checked); render(); return; }
    if (e.target.id !== "t-timevalue") return;
    setTimeValue(e.target.value); render();
  });
  $('[data-f="route"]').addEventListener("click", e => {
    const tv = e.target.closest("[data-tv]");
    if (tv) { setTimeValue(tv.dataset.tv); render(); return; }
    const tab = e.target.closest("[data-route]");
    if (tab) { store.set("route:" + skill.key, tab.dataset.route); render(); return; }
    const lv = e.target.closest("[data-levels]");
    if (lv) { openLevels.has(lv.dataset.levels) ? openLevels.delete(lv.dataset.levels) : openLevels.add(lv.dataset.levels); render(); return; }
    const a = e.target.closest("[data-jump]");
    if (!a || !a.dataset.jump) return;
    e.preventDefault();
    document.getElementById(a.dataset.jump)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  $('[data-f="rows"]').addEventListener("click", e => {
    const a = e.target.closest("[data-jump]");
    if (!a) return;
    e.preventDefault();
    document.getElementById(a.dataset.jump)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  const offs = [prices.onChange(render), calc.onChange(render), group.onChange(render), unlocks.onChange(render), history.onChange(render),
    me.onChange(() => { goal.player = me.get(); save(); render(); })];
  render();
  return () => offs.forEach(off => off());
}
