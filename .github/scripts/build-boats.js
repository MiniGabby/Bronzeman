// Used by .github/workflows/sync-boats.yml.
// Reads every issue labelled "boat-save" (opened by the Boat upgrades page, template boat-save.yml),
// keeps the newest save per account and writes docs/data/boats.json. Then closes the open ones with a comment.
// Only names in docs/data/players.js are accepted, and the data is checked field by field.
const fs = require('fs');

const FILE = 'docs/data/boats.json';
const TYPES = ['Raft', 'Skiff', 'Sloop'];

function players() {
  const src = fs.readFileSync('docs/data/players.js', 'utf8');
  return [...src.matchAll(/^\s*"([^"]+)"/gm)].map(m => m[1]);
}

// The "Saved boats" field of the issue form, as JSON (inside a ```json block).
function parse(body) {
  const part = (body || '').split(/^### /m).find(p => p.startsWith('Saved boats'));
  if (!part) throw new Error('No "Saved boats" field.');
  const text = part.slice(part.indexOf('\n') + 1).replace(/```(json)?/g, '').trim();
  return JSON.parse(text);
}

const str = (v, max) => { if (typeof v !== 'string' || !v.trim() || v.length > max) throw new Error('Bad text field.'); return v.trim(); };
const names = v => { if (!Array.isArray(v) || v.length > 120) throw new Error('Bad part list.'); return [...new Set(v.map(n => str(n, 80)))]; };

function clean(d, allowed) {
  const account = allowed.find(n => n.toLowerCase() === String(d.account || '').toLowerCase());
  if (!account) throw new Error(`"${d.account}" isn't in docs/data/players.js.`);
  if (!Array.isArray(d.boats) || d.boats.length > 10) throw new Error('Bad boat list.');
  const target = d.target == null ? null : Number(d.target);
  if (target !== null && !(Number.isInteger(target) && target >= 1 && target <= 99)) throw new Error('Bad level.');
  if (isNaN(Date.parse(d.savedAt))) throw new Error('Bad date.');
  return {
    account,
    savedAt: new Date(d.savedAt).toISOString(),
    target,
    best: !!d.best,
    boats: d.boats.map(b => {
      if (!TYPES.includes(b.type)) throw new Error('Bad boat type.');
      return { id: str(b.id, 30), name: str(b.name, 40), type: b.type, done: names(b.done), planned: names(b.planned || []) };
    })
  };
}

module.exports = async ({ github, context }) => {
  const { owner, repo } = context.repo;
  // The template's label is only added when it exists in the repository: create it and add it if needed.
  const issue = context.payload.issue;
  if (issue && /^\[Boats\]/.test(issue.title) && !issue.labels.some(l => l.name === 'boat-save')) {
    try { await github.rest.issues.createLabel({ owner, repo, name: 'boat-save', color: 'aaaaaa', description: 'Boat upgrades saved from the site' }); } catch {}
    await github.rest.issues.addLabels({ owner, repo, issue_number: issue.number, labels: ['boat-save'] });
  }
  const issues = (await github.paginate(github.rest.issues.listForRepo, { owner, repo, labels: 'boat-save', state: 'all', per_page: 100 }))
    .filter(i => !i.pull_request)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  const allowed = players();
  const accounts = {}, results = [];
  for (const i of issues) {
    try {
      const d = clean(parse(i.body), allowed);
      const k = d.account.toLowerCase();
      if (!accounts[k] || accounts[k].savedAt <= d.savedAt) accounts[k] = { ...d, by: i.user?.login || '', issue: i.number };
      results.push({ i, ok: true, d });
    } catch (e) {
      results.push({ i, ok: false, error: e.message });
    }
  }

  const previous = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : null;
  if (!previous || JSON.stringify(previous.accounts) !== JSON.stringify(accounts)) {
    fs.writeFileSync(FILE, JSON.stringify({ updatedAt: new Date().toISOString(), accounts }, null, 1) + '\n');
  }

  // Close what's handled, so the issue list stays clean.
  for (const r of results.filter(r => r.i.state === 'open')) {
    const body = r.ok
      ? `Saved the boats of **${r.d.account}** (${r.d.boats.length} boat${r.d.boats.length === 1 ? '' : 's'}). The site shows them within a minute or two.`
      : `Couldn't save this: ${r.error} Open the Boat upgrades page and press "Save to GitHub" again.`;
    await github.rest.issues.createComment({ owner, repo, issue_number: r.i.number, body });
    await github.rest.issues.update({ owner, repo, issue_number: r.i.number, state: 'closed', state_reason: r.ok ? 'completed' : 'not_planned' });
  }
};
