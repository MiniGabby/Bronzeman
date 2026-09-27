// Smoke test: serves ../../docs locally, fakes the price and Wise Old Man APIs with fixtures,
// opens every page in a headless browser and reports JavaScript errors and key numbers.
//
// Needs Node 18+ and Playwright:   npm install playwright   (once, in this tools folder)
// Run from this folder:             node smoke-test.mjs
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const here = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.resolve(here, "../../docs");
const prices = JSON.parse(fs.readFileSync(path.join(here, "fixtures/prices.json"), "utf8")).items;
const stats = JSON.parse(fs.readFileSync(path.join(here, "fixtures/players.json"), "utf8"));

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".md": "text/plain" };
const server = http.createServer((req, res) => {
  const file = path.join(SITE, decodeURIComponent(req.url.split("?")[0]).replace(/\/$/, "/index.html"));
  if (!file.startsWith(SITE) || !fs.existsSync(file)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
}).listen(0);
const base = `http://localhost:${server.address().port}/`;

const json = body => ({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(body) });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1150, height: 1000 } });
let errors = 0;
page.on("pageerror", e => { errors++; console.log("JS ERROR:", e.message); });

await page.route("**/prices.runescape.wiki/**", r => {
  const u = r.request().url();
  if (u.endsWith("/mapping")) return r.fulfill(json(Object.entries(prices).map(([id, v]) => ({ id: +id, name: v.name, limit: v.limit }))));
  if (u.endsWith("/latest")) return r.fulfill(json({ data: Object.fromEntries(Object.entries(prices).map(([id, v]) => [id, { high: v.high, low: v.low }])) }));
  return r.fulfill(json({ data: Object.fromEntries(Object.entries(prices).map(([id, v]) => [id, { avgHighPrice: v.high, avgLowPrice: v.low, highPriceVolume: v.vol || 0, lowPriceVolume: 0 }])) }));
});
await page.route("**/api.wiseoldman.net/**", r => {
  const name = decodeURIComponent(r.request().url().split("/").pop()).toLowerCase();
  const levels = stats[name] || {};
  const skills = {};
  for (const k of ["attack","defence","strength","hitpoints","ranged","prayer","magic","cooking","woodcutting","fletching","fishing","firemaking","crafting","smithing","mining","herblore","agility","thieving","slayer","farming","runecrafting","hunter","construction","sailing"]) {
    const level = levels[k] || 1;
    skills[k] = { level, experience: 0 };
  }
  return r.fulfill(json({ displayName: name, updatedAt: new Date().toISOString(), latestSnapshot: { data: { skills } } }));
});

const pages = ["#/money", "#/training", "#/training/magic", "#/group"];
for (const hash of pages) {
  await page.goto(base + hash);
  await page.waitForTimeout(800);
  const text = await page.locator("#view").innerText();
  console.log(`\n=== ${hash} ===\n` + text.split("\n").slice(0, 12).join("\n"));
  await page.screenshot({ path: path.join(here, `screenshot-${hash.replace(/\W+/g, "-").replace(/^-|-$/g, "")}.png`), fullPage: true });
}
console.log(errors ? `\n${errors} JavaScript error(s).` : "\nNo JavaScript errors.");
await browser.close();
server.close();
