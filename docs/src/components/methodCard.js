// The detailed card for one method: item table, actions-per-hour input, totals, notes.
// Used on the Money makers page and the Skill training page.
import { esc, gp, short, signed, cls, qty, nf } from "../core/format.js";
import * as prices from "../core/prices.js";
import * as calc from "../core/calc.js";
import * as group from "../core/players.js";
import * as unlocks from "../core/unlocks.js";

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
    return miss.length
      ? `<span class="chip no" title="Needs ${esc(miss.join(", "))}">${esc(p.name)}</span>`
      : `<span class="chip yes" title="Meets the skill requirements">${esc(p.name)}</span>`;
  }).join("");
}

export function createMethodCard(m) {
  const el = document.createElement("article");
  el.className = "method";
  el.id = m.id;
  const perHourTable = m.ledger === "hour";
  el.innerHTML = `
    <div class="mhead">
      <div>
        <h2><a href="${esc(m.guide || "#")}" target="_blank" rel="noopener">${esc(m.name)}</a></h2>
        <div class="meta">${reqList(m).map(t => `<span class="tag">${esc(t)}</span>`).join("")}</div>
      </div>
      <div class="hero"><span class="big num" data-f="hero"></span><span class="sub">profit per hour</span></div>
    </div>
    <div class="mbody">
      <div class="ledger"><table>
        <thead><tr><th>Item</th><th class="r">${perHourTable ? "Per hour" : "Per " + esc(m.action)}</th><th class="r">Price</th><th class="r">GE tax</th><th class="r">Total</th><th class="r">Traded / hr</th><th class="r">Buy limit</th></tr></thead>
        <tbody data-f="ledger"></tbody>
      </table></div>
      <div class="side">
        <div class="field">
          <label for="aph-${m.id}">${esc(m.actionLabel || "Actions per hour")}</label>
          <input id="aph-${m.id}" type="number" min="0" step="10" inputmode="numeric">
          <div class="presets">${(m.presets || []).map(([l, v]) => `<button type="button" data-v="${v}">${esc(l)} · ${nf.format(v)}</button>`).join("")}</div>
        </div>
        <dl class="kv" data-f="kv"></dl>
        <div class="field"><span class="label">Group</span><div class="chips" data-f="group"></div></div>
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
    hero.textContent = signed(c.profitHr);
    hero.className = "big num " + cls(c.profitHr);
    hero.title = gp(c.profitHr) + " gp";
    if (document.activeElement !== rateInput) rateInput.value = c.perHour;

    const mult = perHourTable ? c.perHour : 1;
    const row = (r, isOut) => {
      const side = isOut ? "sell" : "buy";
      const tot = r.total == null ? null : r.total * mult;
      return `<tr>
        <td><a href="https://prices.runescape.wiki/osrs/item/${r.id}" target="_blank" rel="noopener">${esc(r.it.name)}</a>${!isOut && unlocks.has(r.id) === false ? ` <span class="pill bad" title="Nobody in the group has unlocked this item yet">Locked</span>` : ""}</td>
        <td class="r num">${qty(r.qty * mult)}</td>
        <td class="r"><input class="pin num${r.own ? " own" : ""}" data-id="${r.id}" data-side="${side}" value="${r.price == null ? "" : Math.round(r.price)}" inputmode="numeric" aria-label="Price of ${esc(r.it.name)}">
          <div class="sub2">${r.own ? `<button type="button" class="reset" data-id="${r.id}" data-side="${side}">your price · reset</button>` : side}</div></td>
        <td class="r num">${isOut ? (r.tax ? "-" + gp(r.tax) : "0") : ""}</td>
        <td class="r num ${isOut ? "pos" : "neg"}">${tot == null ? "–" : (isOut ? "+" : "-") + gp(tot)}</td>
        <td class="r num">${r.it.vol ? gp(r.it.vol) : "–"}</td>
        <td class="r num">${r.it.limit ? gp(r.it.limit) : "–"}</td>
      </tr>`;
    };
    const ledger = el.querySelector('[data-f="ledger"]');
    const focused = ledger.contains(document.activeElement)
      ? `${document.activeElement.dataset.id}:${document.activeElement.dataset.side}` : null;
    const totalProfit = c.profit == null ? null : c.profit * mult;
    ledger.innerHTML =
      (c.ins.length ? `<tr class="sect"><td colspan="7">You buy</td></tr>` + c.ins.map(r => row(r, false)).join("") : "") +
      (c.outs.length ? `<tr class="sect"><td colspan="7">You sell</td></tr>` + c.outs.map(r => row(r, true)).join("") : "") +
      `<tr class="total"><td colspan="4">Profit per ${perHourTable ? "hour" : esc(m.action)}</td><td class="r num ${cls(totalProfit)}">${gp(totalProfit)}</td><td colspan="2"></td></tr>`;
    if (focused) {
      const [id, side] = focused.split(":");
      ledger.querySelector(`.pin[data-id="${id}"][data-side="${side}"]`)?.focus();
    }

    el.querySelector('[data-f="kv"]').innerHTML = [
      ["Profit / hr", `<span class="num ${cls(c.profitHr)}">${gp(c.profitHr)}</span>`],
      ["Supplies / hr", `<span class="num">${gp(c.cost * c.perHour)}</span>`],
      ["GE tax / hr", `<span class="num">${gp(c.taxEach * c.perHour)}</span>`],
      ...Object.entries(c.xpHr).map(([s, v]) => [`${s} XP / hr`, `<span class="num">${gp(v)}</span>`])
    ].map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("");

    el.querySelector('[data-f="group"]').innerHTML = groupChips(m) || `<span class="muted">Loading stats…</span>`;

    const notes = [];
    const locked = unlocks.lockedInputs(m);
    if (locked?.length) {
      const names = locked.map(x => c.ins.find(r => r.id === x.id)?.it.name || `Item ${x.id}`);
      notes.push(`<div class="note warn">Not unlocked yet: <b>${esc(names.join(", "))}</b>. In bronzeman you can't buy this on the GE until someone in the group has obtained it.</div>`);
    }
    const pace = calc.limitPace(c);
    if (c.limitItem && isFinite(c.limitActions)) {
      const r = c.limitItem;
      if (pace.minutes < 240) {
        const capped = c.profit == null ? null : Math.min(c.perHour, c.limitActions / 4) * c.profit;
        notes.push(`<div class="note warn"><b>${esc(r.it.name)}</b> buy limit is ${gp(r.it.limit)} per 4 h. At your pace you use ${gp(r.qty * c.perHour)} per hour, so one account hits the limit after about ${Math.round(pace.minutes)} min. Averaged over 4 h that is about <b class="num">${short(capped)}</b> gp/hr per account.</div>`);
      } else {
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
