// Used by .github/workflows/sync-merch.yml.
// Keeps docs/data/merch-predictions.json: how the Merching tab's flip suggestions turned out.
//
// Once a day it saves the flips the Merching tab would suggest right then (its default settings:
// 1M cash, at least 100 traded per hour, top 25), with the same math (docs/src/core/pattern.js).
// Every run it also checks the saved flips whose sell time has passed against the real hourly prices:
//   bought: did the item trade at or below "Buy at" in the buy hour or the hour after?
//   sold:   did it trade at or above "Sell at" in the sell hour or the hour after?
//   buyReal / sellReal: the actual average price in those hours (the hour itself, else the hour after).
// Hours of the day follow the Netherlands: run it with TZ=Europe/Amsterdam (the workflow does).
//
//   { settings, predictions: [ { made, id, name, buyAt, sellAt, buy, sell, each, qty, buyHit, sellHit,
//       checked?: { bought, sold, buyReal, sellReal } | { noData: true } } ] }
// Times are unix seconds; buyAt / sellAt are the start of the hour to buy / sell in.
import fs from 'node:fs';
import { analyse, candidates, plan } from '../../docs/src/core/pattern.js';

const API = 'https://prices.runescape.wiki/api/v1/osrs';
const UA = { 'User-Agent': 'Bronzeman group site merch tracker (github.com/MiniGabby/Bronzeman)' };
const OUT = 'docs/data/merch-predictions.json';
const UNLOCKS = 'docs/data/unlocks.json';
const SETTINGS = { cash: 1_000_000, minVol: 100, candidates: 40, shown: 25 };
const DAY_GAP = 20 * 3600;      // at most one batch of predictions per ~day
const HOUR = 3600;

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function getJSON(path) {
  const r = await fetch(API + path, { headers: UA });
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
  return r.json();
}
const series = new Map();
async function rowsOf(id) {
  if (!series.has(id)) {
    await sleep(400);
    series.set(id, ((await getJSON(`/timeseries?timestep=1h&id=${id}`)).data || []).filter(r => r.timestamp));
  }
  return series.get(id);
}

/** Start of the first hour at or after `from` (unix s) whose local hour of the day is `hour`. */
function nextHour(from, hour) {
  let t = Math.ceil(from / HOUR) * HOUR;
  for (let i = 0; i < 48; i++, t += HOUR) if (new Date(t * 1000).getHours() === hour) return t;
  return null;
}

function read() {
  try { const j = JSON.parse(fs.readFileSync(OUT, 'utf8')); if (Array.isArray(j.predictions)) return j; } catch {}
  return { predictions: [] };
}

// One prediction per line: easy to read in a diff, and the file stays small.
function write(data) {
  const lines = data.predictions.map(p => '  ' + JSON.stringify(p));
  fs.writeFileSync(OUT, `{"generatedAt":${JSON.stringify(data.generatedAt)},"settings":${JSON.stringify(data.settings)},"predictions":[\n${lines.join(',\n')}\n]}\n`);
}

async function predict(data, now) {
  const last = Math.max(0, ...data.predictions.map(p => p.made));
  if (now - last < DAY_GAP) { console.log('Predictions already made in the last day.'); return; }
  const [mapping, latest, hour] = await Promise.all([getJSON('/mapping'), getJSON('/latest'), getJSON('/1h')]);
  const meta = Object.fromEntries(mapping.map(m => [m.id, m]));
  const unlocked = JSON.parse(fs.readFileSync(UNLOCKS, 'utf8')).items || [];
  // Same item info as prices.item() on the site.
  const items = unlocked.map(u => {
    const m = meta[u.id] || {}, l = latest.data[u.id] || {}, h = hour.data[u.id] || {};
    return { id: u.id, name: m.name || u.name, limit: m.limit || null,
      high: h.avgHighPrice ?? l.high ?? null, low: h.avgLowPrice ?? l.low ?? null,
      vol: (h.highPriceVolume || 0) + (h.lowPriceVolume || 0) };
  });
  const plans = [];
  for (const it of candidates(items, SETTINGS, SETTINGS.candidates)) {
    try { plans.push(plan(it, analyse(await rowsOf(it.id)), SETTINGS)); }
    catch (e) { console.log(`${it.name}: ${e.message}`); }
  }
  const good = plans.filter(p => !p.thin && p.each > 0).sort((a, b) => b.total - a.total).slice(0, SETTINGS.shown);
  for (const p of good) {
    const buyAt = nextHour(now, p.t.buyHour);
    data.predictions.push({
      made: now, id: p.it.id, name: p.it.name, buyAt, sellAt: nextHour(buyAt + HOUR, p.t.sellHour),
      buy: p.buy, sell: p.sell, each: p.each, qty: p.qty,
      buyHit: Math.round(p.t.buyHit * 100) / 100, sellHit: Math.round(p.t.sellHit * 100) / 100
    });
  }
  console.log(`Saved ${good.length} new predictions.`);
}

async function check(data, now) {
  const open = data.predictions.filter(p => !p.checked && now >= p.sellAt + 3 * HOUR);
  for (const p of open) {
    let rows;
    try { rows = await rowsOf(p.id); } catch (e) { console.log(`${p.name}: ${e.message}`); continue; }
    const at = t => rows.find(r => r.timestamp === t) || {};
    const two = (t, key, vol) => [at(t), at(t + HOUR)].filter(r => r[key] > 0 && r[vol] > 0).map(r => r[key]);
    const lows = two(p.buyAt, 'avgLowPrice', 'lowPriceVolume'), highs = two(p.sellAt, 'avgHighPrice', 'highPriceVolume');
    if (!lows.length || !highs.length) {
      // No trades in those hours, or the hours fell out of the wiki's ~15 days of hourly data.
      if (now > p.sellAt + 10 * 86400 || (rows.length && rows[0].timestamp > p.buyAt) || rows.at(-1)?.timestamp > p.sellAt + HOUR) p.checked = { noData: true };
      continue;
    }
    p.checked = { bought: Math.min(...lows) <= p.buy, sold: Math.max(...highs) >= p.sell, buyReal: Math.round(lows[0]), sellReal: Math.round(highs[0]) };
  }
  console.log(`Checked ${open.filter(p => p.checked).length} of ${open.length} predictions whose sell time has passed.`);
}

const now = Math.floor(Date.now() / 1000);
const data = read();
await check(data, now);
try { await predict(data, now); } catch (e) { console.log(`No new predictions: ${e.message}`); }
data.generatedAt = new Date(now * 1000).toISOString();
data.settings = SETTINGS;
write(data);
