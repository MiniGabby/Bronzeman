// Requests page: ask for a new guide, and see what's been requested.
// A request becomes a GitHub issue (template .github/ISSUE_TEMPLATE/guide-request.yml).
// A GitHub Action copies all requests into data/requests.json, which this page lists.
import SITE from "../../data/site.js";
import PLAYERS from "../../data/players.js";
import METHODS from "../../data/methods/index.js";
import { SKILLS } from "../core/osrs.js";
import { store } from "../core/store.js";
import { esc, ago } from "../core/format.js";

export const title = "Requests";

const issuesUrl = `https://github.com/${SITE.repo}/issues`;
const safeLink = url => /^https:\/\//i.test(url || "") ? url : null;

export function mount(root) {
  const draft = Object.assign({ method: "", link: "", type: "Money maker", skills: "", requestedBy: "", notes: "" }, store.get("requestDraft", {}));

  root.innerHTML = `
    <p class="lead">Want a money maker or training method on the site? Fill this in and continue on GitHub to post it. Requests appear in the list below within a few minutes.</p>

    <form class="reqform" data-f="form">
      <div class="field wide"><label for="r-method">Method</label>
        <input id="r-method" required maxlength="120" placeholder="Cleaning grimy ranarr weed"></div>
      <div class="field wide"><label for="r-link">Wiki link <span class="opt">optional</span></label>
        <input id="r-link" type="url" maxlength="300" placeholder="https://oldschool.runescape.wiki/w/Money_making_guide/..."></div>
      <div class="field"><label for="r-type">Type</label>
        <select id="r-type"><option>Money maker</option><option>Skill training</option><option>Both</option></select></div>
      <div class="field"><label for="r-skills">Skills <span class="opt">optional</span></label>
        <input id="r-skills" list="r-skill-list" maxlength="80" placeholder="Herblore">
        <datalist id="r-skill-list">${SKILLS.map(s => `<option value="${esc(s.name)}">`).join("")}</datalist></div>
      <div class="field"><label for="r-by">Requested by</label>
        <select id="r-by"><option value="">Choose your name</option>${PLAYERS.map(n => `<option>${esc(n)}</option>`).join("")}</select></div>
      <div class="field wide"><label for="r-notes">Notes <span class="opt">optional</span></label>
        <textarea id="r-notes" rows="3" maxlength="1000" placeholder="The level you'd do it at, or why you want it"></textarea></div>
      <div class="formfoot">
        <button type="submit" class="btn primary">Continue on GitHub</button>
        <span class="fine">Opens GitHub with your request filled in. Press <b>Create</b> there to post it. You need a free GitHub account.</span>
      </div>
      <p class="note warn" data-f="dupe" hidden></p>
    </form>

    <section class="section">
      <div class="sechead">
        <h2 class="pagetitle small">Requested guides</h2>
        <a class="fine" href="${issuesUrl}?q=label%3Aguide-request" target="_blank" rel="noopener">All requests on GitHub</a>
      </div>
      <div data-f="list"><p class="muted">Loading requests…</p></div>
    </section>`;

  const $ = s => root.querySelector(s);
  const f = {
    method: $("#r-method"), link: $("#r-link"), type: $("#r-type"),
    skills: $("#r-skills"), requestedBy: $("#r-by"), notes: $("#r-notes")
  };
  for (const [k, el] of Object.entries(f)) {
    el.value = draft[k] || el.value;
    el.addEventListener("input", () => {
      draft[k] = el.value;
      store.set("requestDraft", draft);
      if (k === "method") checkDupe();
    });
  }

  // Warn when the method is already on the site.
  function checkDupe() {
    const q = f.method.value.trim().toLowerCase();
    const hit = q.length > 3 && METHODS.find(m => m.name.toLowerCase().includes(q) || q.includes(m.name.toLowerCase()));
    const box = $('[data-f="dupe"]');
    box.hidden = !hit;
    if (hit) box.textContent = `"${hit.name}" is already on the site.`;
  }
  checkDupe();

  $('[data-f="form"]').addEventListener("submit", e => {
    e.preventDefault();
    const v = Object.fromEntries(Object.entries(f).map(([k, el]) => [k, el.value.trim()]));
    if (!v.method) { f.method.focus(); return; }
    // Issue forms fill fields from query parameters named after the field ids in the template.
    const params = new URLSearchParams({
      template: "guide-request.yml",
      title: `[Guide] ${v.method}`,
      method: v.method,
      link: v.link,
      type: v.type,
      skills: v.skills,
      requested_by: v.requestedBy,
      notes: v.notes
    });
    window.open(`${issuesUrl}/new?${params}`, "_blank", "noopener");
    store.set("requestDraft", {});
  });

  loadList();

  async function loadList() {
    const host = $('[data-f="list"]');
    let data;
    try {
      const r = await fetch("data/requests.json", { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      data = await r.json();
    } catch (e) {
      host.innerHTML = `<p class="muted">Couldn't load the request list (${esc(e.message)}). You can still see requests on <a href="${issuesUrl}?q=label%3Aguide-request" target="_blank" rel="noopener">GitHub</a>.</p>`;
      return;
    }
    const reqs = data.requests || [];
    if (!reqs.length) {
      host.innerHTML = `<p class="muted">No requests yet. Be the first.</p>`;
      return;
    }
    const groups = [
      ["open", "Open"],
      ["added", "Added to the site"],
      ["declined", "Not planned"]
    ];
    const card = r => {
      const link = safeLink(r.link);
      return `<li class="req">
        <div class="reqhead">
          <a href="${esc(r.url)}" target="_blank" rel="noopener" class="reqtitle">${esc(r.method || r.title)}</a>
          <span class="pill ${r.state === "open" ? "warn" : r.state === "added" ? "good" : "bad"}">${r.state === "open" ? "Open" : r.state === "added" ? "Added" : "Not planned"}</span>
        </div>
        <div class="reqmeta">
          ${[r.type, r.skills, r.requestedBy ? `by ${r.requestedBy}` : r.author ? `by ${r.author}` : "", ago(r.createdAt)].filter(Boolean).map(esc).join(" · ")}
          ${link ? ` · <a href="${esc(link)}" target="_blank" rel="noopener">wiki</a>` : ""}
        </div>
        ${r.notes ? `<p class="reqnotes">${esc(r.notes)}</p>` : ""}
      </li>`;
    };
    host.innerHTML = groups.map(([state, label]) => {
      const list = reqs.filter(r => r.state === state);
      if (!list.length) return "";
      return `<h3 class="reqgroup">${label} <span class="muted">(${list.length})</span></h3><ul class="reqlist">${list.map(card).join("")}</ul>`;
    }).join("") + (data.updatedAt ? `<p class="fine">List updated ${esc(ago(data.updatedAt))}.</p>` : "");
  }
}
