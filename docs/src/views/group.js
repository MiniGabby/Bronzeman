// Group page: every member's skill levels side by side, from Wise Old Man.
import * as group from "../core/players.js";
import { SKILLS } from "../core/osrs.js";
import { esc, ago, nf } from "../core/format.js";

export const title = "Group";

export function mount(root) {
  function render() {
    if (!group.loaded()) { root.innerHTML = `<p class="muted">Loading stats from Wise Old Man…</p>`; return; }
    const ps = group.all();
    const head = ps.map(p => `<th class="r"><a href="${group.profileUrl(p)}" target="_blank" rel="noopener">${esc(p.name)}</a></th>`).join("");
    const total = p => p.skills ? SKILLS.reduce((a, s) => a + group.level(p, s.name), 0) : null;
    const row = (label, vals, link) => {
      const max = Math.max(...vals.filter(v => v != null));
      return `<tr><td>${link ? `<a href="${link}">${esc(label)}</a>` : `<b>${esc(label)}</b>`}</td>${vals.map(v =>
        `<td class="r num${v != null && v === max && max > 1 ? " top" : ""}">${v == null ? "–" : nf.format(v)}</td>`).join("")}</tr>`;
    };
    root.innerHTML = `
      <p class="lead">Levels come from <a href="https://wiseoldman.net" target="_blank" rel="noopener">Wise Old Man</a>. To refresh someone's levels, open their name and press Update there, then reload this page. The highest level in each skill is highlighted.</p>
      <section class="board"><table>
        <thead><tr><th>Skill</th>${head}</tr></thead>
        <tbody>
          ${row("Total level", ps.map(total))}
          ${SKILLS.map(s => row(s.name, ps.map(p => p.skills ? group.level(p, s.name) : null), `#/training/${s.key}`)).join("")}
          <tr><td class="muted">Last updated</td>${ps.map(p => `<td class="r muted" title="${esc(p.error || "")}">${p.skills ? ago(p.updatedAt) : "No stats"}</td>`).join("")}</tr>
        </tbody>
      </table></section>`;
  }
  const off = group.onChange(render);
  render();
  return off;
}
