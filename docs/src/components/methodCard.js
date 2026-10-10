// The detailed card for one method: item table, actions-per-hour input, totals, notes.
// Used on the Money makers page and the Skill training page.
import { esc, gp, short, signed, cls, qty, nf, plural } from "../core/format.js";
import * as prices from "../core/prices.js";
import * as calc from "../core/calc.js";
import * as burn from "../core/burn.js";
import * as group from "../core/players.js";
import * as unlocks from "../core/unlocks.js";
import { tipFor } from "../core/unlockTips.js";
import * as ui from "../core/ui.js";
import DIARY_PERKS from "../../data/diary-perks.js";

export function reqList(m) {
  const r = m.reqs || {};
  return [
    ...Object.entries(r.skills || {}).map(([s, l]) => `${s} ${l}`),
    ...(r.quests || []), ...(r.items || []), ...(r.other || [])
  ];
}

export function groupChips(m) {
  if (!group.loaded()) return "";
  return group.all().map(p => {
    const miss = group.missing(p, m);
    if (miss == null) return `<span class="chip" title="${esc(p.error || "No stats")}">${esc(p.name)} ?</span>`;
    if (miss.length) return `<span class="chip no" title="Needs ${esc(miss.join(", "))}">${esc(p.name)}</span>`;
    const unk = group.unknownQuests(p, m);
    return unk.length
      ? `<span class="chip maybe" title="Levels OK. Not known yet if ${esc(p.name)} has done ${esc(unk.join(", "))} (see Quests on the Group page)">${esc(p.name)} ?</span>`
      : `<span class="chip yes" title="Meets the requirements">${esc(p.name)}</span>`;
  }).join("");
}

export function createMethodCard(m) {
  const el = document.createElement("article");
  el.className = "method";
  el.id = m.id;
  const perHourTable = m.ledger === "hour";
  // Farm runs are counted per day: the rate, the totals and the hourly table all show a day.
  const H = calc.periodHours(m), unit = H === 24 ? "day" : "hour", u = H === 24 ? "day" : "hr";
  // Simple view (the page is redrawn when it's switched): plain labels, no tax, trade volume or buy limit columns.
  const S = ui.simple(), per = S ? `per ${unit}` : `/ ${u}`;
  el.innerHTML = `
    <div class="mhead">
      <div>
        <h2><a href="${esc(m.guide || "#")}" target="_blank" rel="noopener">${esc(m.name)}</a></h2>
        <div class="meta">${reqList(m).map(t => `<span class="tag">${esc(t)}</span>`).join("")}</div>
      </div>
      <div class="hero"><span class="big num" data-f="hero"></span><span class="sub">profit per ${unit}</span></div>
    </div>
    <div class="mbody">
      <div class="ledger"><table>
        <thead><tr><th>Item</th><th class="r">${perHourTable ? "Per " + unit : "Per " + esc(m.action)}</th><th class="r">Price</th><th class="r simple-hide">GE tax</th><th class="r">Total</th><th class="r simple-hide">Traded / hr</th><th class="r simple-hide">Buy limit</th></tr></thead>
        <tbody data-f="ledger"></tbody>
      </table><div class="invest" data-f="invest" hidden></div></div>
      <div class="side">
        <div class="field">
          <label for="aph-${m.id}">${esc(m.actionLabel || "Actions per hour")}</label>
          <input id="aph-${m.id}" type="number" min="0" step="${H === 24 ? "any" : 10}" inputmode="${H === 24 ? "decimal" : "numeric"}">
          <div class="presets">${(m.presets || []).map(([l, v]) => `<button type="button" data-v="${v}">${esc(l)} · ${nf.format(v)}</button>`).join("")}</div>
        </div>
        <dl class="kv" data-f="kv"></dl>
        <div class="field"><span class="label">Group</span><div class="chips" data-f="group"></div></div>
        ${DIARY_PERKS[m.id] ? `<div class="field"><span class="label">${DIARY_PERKS[m.id].length > 1 ? "Diaries that help" : "Diary that helps"}</span><div data-f="diaries"></div></div>` : ""}
        <div class="notes" data-f="notes"></div>
      </div>
    </div>`;

  const rateInput = el.querySelector(`#aph-${m.id}`);
  rateInput.value = calc.getRate(m);
  rateInput.addEventListener("input", () => calc.setRate(m, rateInput.value));
  el.querySelectorAll(".presets button").forEach(b => b.addEventListener("click", () => {
    rateInput.value = b.dataset.v;
    calc.setRate(m, b.dataset.v);
  }));
  el.addEventListener("change", e => {
    const t = e.target;
    if (!t.classList.contains("pin")) return;
    const v = Number(String(t.value).replace(/[^\d.]/g, ""));
    prices.setOwn(t.dataset.id, t.dataset.side, v);
  });
  el.addEventListener("click", e => {
    const t = e.target;
    if (t.classList.contains("reset")) prices.setOwn(t.dataset.id, t.dataset.side, 0);
  });

  function update(c) {
    const hero = el.querySelector('[data-f="hero"]');
    const profitP = c.profitHr == null ? null : c.profitHr * H;
    hero.textContent = signed(profitP);
    hero.className = "big num " + cls(profitP);
    hero.title = gp(profitP) + " gp";
    if (document.activeElement !== rateInput) rateInput.value = calc.getRate(m);

    const mult = perHourTable ? c.perHour * H : 1;
    const row = (r, isOut) => {
      const side = isOut ? "sell" : "buy";
      const tot = r.total == null ? null : r.total * mult;
      return `<tr>
        <td><a href="${r.id != null ? `https://prices.runescape.wiki/osrs/item/${r.id}` : `https://oldschool.runescape.wiki/w/${encodeURIComponent(r.it.name.replace(/ /g, "_"))}`}" target="_blank" rel="noopener">${esc(r.it.name)}</a>${!isOut && unlocks.hasEntry(r) === false ? ` <span class="pill bad" title="Nobody in the group has unlocked this item yet">Locked</span>` : ""}</td>
        <td class="r num">${qty(r.qty * mult)}</td>
        <td class="r"><input class="pin num${r.own ? " own" : ""}" data-id="${r.id}" data-side="${side}" value="${r.price == null ? "" : Math.round(r.price)}" inputmode="numeric" aria-label="Price of ${esc(r.it.name)}">
          <div class="sub2">${r.own ? `<button type="button" class="reset" data-id="${r.id}" data-side="${side}">your price · reset</button>` : side}</div></td>
        <td class="r num simple-hide">${isOut ? (r.tax ? "-" + gp(r.tax) : "0") : ""}</td>
        <td class="r num ${isOut ? "pos" : "neg"}">${tot == null ? "–" : (isOut ? "+" : "-") + gp(tot)}</td>
        <td class="r num simple-hide">${r.it.vol ? gp(r.it.vol) : "–"}</td>
        <td class="r num simple-hide">${r.it.limit ? gp(r.it.limit) : "–"}</td>
      </tr>`;
    };
    const ledger = el.querySelector('[data-f="ledger"]');
    const focused = ledger.contains(document.activeElement)
      ? `${document.activeElement.dataset.id}:${document.activeElement.dataset.side}` : null;
    const totalProfit = c.profit == null ? null : c.profit * mult;
    ledger.innerHTML =
      (c.ins.length ? `<tr class="sect"><td colspan="7">You buy</td></tr>` + c.ins.map(r => row(r, false)).join("") : "") +
      (c.fees.length ? `<tr class="sect"><td colspan="7">You pay</td></tr>` + c.fees.map(f => `<tr>
        <td>${esc(f.label)}</td><td class="r num"></td><td class="r num">${gp(f.perHour * H)}<div class="sub2">per ${unit}</div></td><td class="simple-hide"></td>
        <td class="r num neg">-${gp(f.each * mult)}</td><td colspan="2" class="simple-hide"></td></tr>`).join("") : "") +
      (c.outs.length ? `<tr class="sect"><td colspan="7">You sell</td></tr>` + c.outs.map(r => row(r, true)).join("") : "") +
      (c.coins ? `<tr class="sect"><td colspan="7">You get</td></tr><tr>
        <td>Coins${m.coinsLabel ? ` <span class="muted">(${esc(m.coinsLabel)})</span>` : ""}</td><td class="r num">${qty(c.coins * mult)}</td><td></td><td class="r num simple-hide">0</td>
        <td class="r num pos">+${gp(c.coins * mult)}</td><td colspan="2" class="simple-hide"></td></tr>` : "") +
      `<tr class="total"><td colspan="${S ? 3 : 4}">Profit per ${perHourTable ? unit : esc(m.action)}</td><td class="r num ${cls(totalProfit)}">${gp(totalProfit)}</td><td colspan="2" class="simple-hide"></td></tr>`;
    if (focused) {
      const [id, side] = focused.split(":");
      ledger.querySelector(`.pin[data-id="${id}"][data-side="${side}"]`)?.focus();
    }

    // What to have ready for one hour (or one day): every item to buy with its amount, fees, and the coins in total.
    const inv = el.querySelector('[data-f="invest"]');
    const n = c.perHour * H, missing = c.ins.some(r => r.total == null);
    if (n > 0 && c.cost > 0 && !missing) {
      const parts = [
        ...c.ins.map(r => `<li><b class="num">${nf.format(Math.ceil(r.qty * n))}</b> ${esc(r.it.name)} <span class="muted">· ${gp(r.total * n)} gp</span>${
          r.it.limit && r.qty * n > r.it.limit ? ` <span class="pill warn" title="You can buy ${gp(r.it.limit)} per 4 hours">over the buy limit of ${gp(r.it.limit)}</span>` : ""}</li>`),
        ...c.fees.map(f => `<li>${esc(f.label)} <span class="muted">· ${gp(f.each * n)} gp</span></li>`)
      ];
      const back = c.revenue * n;
      inv.hidden = false;
      inv.innerHTML = `<div class="investhead">To do this for one ${unit} (${nf.format(Math.round(n * 100) / 100)} ${esc(plural(m.action, n))}) you need <b class="num">${gp(c.cost * n)} gp</b></div>
        <ul>${parts.join("")}</ul>
        ${back > 0 ? `<div class="sub2">Selling what you make brings back about <span class="num">${gp(back)}</span> gp after tax, so you end the ${unit} with <span class="num ${cls(profitP)}">${signed(profitP, gp)}</span> gp. You can start with less and buy again as your sales come in.</div>` : ""}`;
    } else inv.hidden = true;

    el.querySelector('[data-f="kv"]').innerHTML = [
      [`Profit ${per}`, `<span class="num ${cls(profitP)}">${gp(profitP)}</span>`],
      [c.fees.length ? `Supplies + fees ${per}` : `Supplies ${per}`, `<span class="num">${gp(c.cost * c.perHour * H)}</span>`],
      ...(S ? [] : [[`GE tax ${per}`, `<span class="num">${gp(c.taxEach * c.perHour * H)}</span>`]]),
      ...(c.success != null ? [["Not burnt", `<span class="num">${Math.round(c.success * 100)}%</span> <span class="muted">on ${esc(burn.label(burn.source()))}, ${esc(burn.stopText(m))}</span>`]] : []),
      ...Object.entries(c.xpHr).map(([s, v]) => [`${s} XP ${per}`, `<span class="num">${gp(v * H)}</span>`])
    ].map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("");

    el.querySelector('[data-f="group"]').innerHTML = groupChips(m) || `<span class="muted">Loading stats…</span>`;

    // Diaries that make this method better, and who has finished them (WikiSync; "?" = no data).
    const dHost = el.querySelector('[data-f="diaries"]');
    if (dHost) dHost.innerHTML = DIARY_PERKS[m.id].map(d => `<div class="diaryperk"><b>${esc(d.diary.replace(/ (\w+)$/, " Diary ($1)").replace(/\((\w)/, (x, c) => "(" + c.toLowerCase()))}</b>: ${esc(d.perk)}
      <div class="chips">${group.all().map(p => {
        const v = group.diaryDone(p, d.diary), prog = group.diaryProgress(p, ...d.diary.match(/^(.+) (\w+)$/).slice(1));
        return v == null ? `<span class="chip" title="No WikiSync data for ${esc(p.name)}">${esc(p.name)} ?</span>`
          : `<span class="chip ${v ? "yes" : "no"}" title="${prog[0]} of ${prog[1]} tasks done">${esc(p.name)}${v ? "" : ` ${prog[0]}/${prog[1]}`}</span>`;
      }).join("")}</div></div>`).join("");

    const notes = [];
    const locked = unlocks.lockedInputs(m);
    if (locked?.length) {
      notes.push(`<div class="note warn">Not unlocked yet: <b>${esc(locked.map(x => x.name).join(", "))}</b>. In bronzeman you can't buy ${locked.length > 1 ? "these" : "this"} on the GE until someone in the group has obtained ${locked.length > 1 ? "them" : "it"}.${
        locked.map(x => tipFor(x.name) ? `<span class="tip"><b>${esc(x.name)}:</b> ${esc(tipFor(x.name))}</span>` : "").join("")}</div>`);
    }
    const pace = calc.limitPace(c);
    if (c.limitItem && isFinite(c.limitActions)) {
      const r = c.limitItem;
      if (pace.minutes < 240) {
        const capped = c.profit == null ? null : Math.min(c.perHour, c.limitActions / 4) * c.profit;
        notes.push(`<div class="note warn"><b>${esc(r.it.name)}</b> buy limit is ${gp(r.it.limit)} per 4 h. At your pace you use ${gp(r.qty * c.perHour)} per hour, so one account hits the limit after about ${Math.round(pace.minutes)} min. Averaged over 4 h that is about <b class="num">${short(capped)}</b> gp/hr per account.</div>`);
      } else if (!S) {
        notes.push(`<div class="note">The ${esc(r.it.name)} buy limit (${gp(r.it.limit)} per 4 h) keeps up with this pace.</div>`);
      }
    }
    const thin = [...c.ins, ...c.outs].find(r => r.it.vol && r.qty * c.perHour > r.it.vol);
    if (thin) notes.push(`<div class="note warn">You need ${gp(thin.qty * c.perHour)} <b>${esc(thin.it.name)}</b> per hour, but only ${gp(thin.it.vol)} traded in the last hour. Expect slower fills.</div>`);
    if (m.note) notes.push(`<div class="note">${esc(m.note)}</div>`);
    el.querySelector('[data-f="notes"]').innerHTML = notes.join("");
  }

  return { el, update };
}
