// Used by .github/workflows/sync-requests.yml.
// Reads all issues labelled "guide-request" and writes docs/data/requests.json.
const fs = require('fs');

// Issue forms produce a body like "### Method\n\nCleaning ranarr\n\n### Wiki link\n\n...".
const FIELDS = {
  'Method': 'method',
  'Wiki link': 'link',
  'Type': 'type',
  'Skills': 'skills',
  'Requested by': 'requestedBy',
  'Notes': 'notes'
};

function parseBody(body) {
  const out = {};
  const parts = (body || '').split(/^### /m).slice(1);
  for (const part of parts) {
    const nl = part.indexOf('\n');
    const label = part.slice(0, nl).trim();
    let value = part.slice(nl + 1).trim();
    if (value === '_No response_') value = '';
    if (FIELDS[label]) out[FIELDS[label]] = value.slice(0, 2000);
  }
  return out;
}

module.exports = async ({ github, context }) => {
  const issues = await github.paginate(github.rest.issues.listForRepo, {
    owner: context.repo.owner,
    repo: context.repo.repo,
    labels: 'guide-request',
    state: 'all',
    per_page: 100
  });
  const requests = issues
    .filter(i => !i.pull_request)
    .map(i => {
      const f = parseBody(i.body);
      return {
        number: i.number,
        url: i.html_url,
        title: i.title.replace(/^\[Guide\]\s*/i, ''),
        state: i.state === 'closed' ? (i.state_reason === 'not_planned' ? 'declined' : 'added') : 'open',
        method: f.method || i.title.replace(/^\[Guide\]\s*/i, ''),
        link: f.link || '',
        type: f.type || '',
        skills: f.skills || '',
        requestedBy: f.requestedBy || '',
        notes: f.notes || '',
        author: i.user?.login || '',
        createdAt: i.created_at,
        closedAt: i.closed_at
      };
    })
    .sort((a, b) => b.number - a.number);

  const file = 'docs/data/requests.json';
  const previous = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
  // Only rewrite when the requests changed, so the timestamp doesn't cause empty commits.
  if (previous && JSON.stringify(previous.requests) === JSON.stringify(requests)) return;
  fs.writeFileSync(file, JSON.stringify({ updatedAt: new Date().toISOString(), requests }, null, 2) + '\n');
};
