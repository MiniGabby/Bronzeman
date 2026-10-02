// Updates page: what's new on the site (data/updates.js), newest first, grouped by day.
import UPDATES from "../../data/updates.js";
import { esc } from "../core/format.js";

export const title = "Updates";

const fmtDate = d => new Date(d + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export function mount(root) {
  const days = [];
  for (const u of UPDATES) {
    if (!days.length || days.at(-1).date !== u.date) days.push({ date: u.date, list: [] });
    days.at(-1).list.push(u);
  }
  root.innerHTML = `
    <p class="lead">What's new on the site, newest first. Missing something? Ask for it on the <a href="#/requests">Requests</a> tab.</p>
    <div class="updates">${days.map(d => `
      <section class="upday">
        <h2 class="pagetitle small"><time datetime="${d.date}">${esc(fmtDate(d.date))}</time></h2>
        ${d.list.map(u => `<article class="upitem">
          <h3>${u.link ? `<a href="${esc(u.link)}">${esc(u.title)}</a>` : esc(u.title)}</h3>
          <ul>${u.items.map(i => `<li>${esc(i)}</li>`).join("")}</ul>
        </article>`).join("")}
      </section>`).join("")}
    </div>`;
}
