// App entry: starts the data services and swaps pages based on the URL hash (#/money, #/training/magic, #/group).
import * as prices from "./core/prices.js";
import * as group from "./core/players.js";
import * as unlocks from "./core/unlocks.js";
import * as me from "./core/me.js";
import * as ui from "./core/ui.js";
import PLAYERS from "../data/players.js";
import * as money from "./views/money.js";
import * as training from "./views/training.js";
import * as groupView from "./views/group.js";
import * as requests from "./views/requests.js";
import * as unlocked from "./views/unlocks.js";
import * as alchemy from "./views/alchemy.js";
import * as merch from "./views/merch.js";
import * as updates from "./views/updates.js";
import * as player from "./views/player.js";
import * as catchup from "./views/catchup.js";

// To add a page: create src/views/<name>.js exporting mount(root, params) and title,
// add it here, and add a link with href="#/<name>" to the nav in index.html.
const ROUTES = { player, money, training, alchemy, merch, group: groupView, arcanekitten: catchup, unlocked, requests, updates };

const view = document.getElementById("view");
let cleanup = null;

// Simple view: one plain sentence at the top of every page about what it's for.
const PAGE_HELP = {
  player: "This page is about you. Pick your name at the top of the site and it shows what you can do right now.",
  money: "Ways to earn coins, the best one first. Click a name in the list to see what to buy and what to sell.",
  training: "Pick a skill to see how to train it, step by step.",
  alchemy: "Items you can turn into coins with the High Level Alchemy spell, and how much each one earns.",
  merch: "Buying items cheaply and selling them for more. This page shows what to buy, and when.",
  group: "Everyone's levels side by side, and who has gained XP lately.",
  arcanekitten: "The levels the group still has to reach before arcanekitten can join.",
  unlocked: "Every item the group can already buy on the Grand Exchange.",
  requests: "Ask here for a new guide on the site.",
  updates: "What's new on the site, newest first."
};
const pageHelp = document.getElementById("pageHelp");

function route() {
  const [name, ...params] = location.hash.replace(/^#\/?/, "").split("/");
  // Without a page in the link: your own page if you've picked your name in the "You" menu, else Money makers.
  const page = ROUTES[name] ? name : (!name && PLAYERS.includes(me.get()) ? "player" : "money");
  if (typeof cleanup === "function") cleanup();
  view.innerHTML = "";
  cleanup = ROUTES[page].mount(view, params);
  pageHelp.hidden = !ui.simple();
  pageHelp.textContent = PAGE_HELP[page] || "";
  document.querySelectorAll(".tabs a").forEach(a =>
    a.toggleAttribute("aria-current", a.getAttribute("href") === "#/" + page));
  if (a11yFocus) view.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}
let a11yFocus = false;

// Price mode switch and live status in the header.
const modeHelp = document.getElementById("modeHelp");
function renderMode() {
  document.querySelectorAll("#modeSeg button").forEach(b =>
    b.setAttribute("aria-pressed", String(b.dataset.mode === prices.getMode())));
  modeHelp.textContent = prices.MODES[prices.getMode()];
}
document.querySelectorAll("#modeSeg button").forEach(b =>
  b.addEventListener("click", () => prices.setMode(b.dataset.mode)));

function renderStatus() {
  const { fetchedAt, error } = prices.status();
  const dot = document.getElementById("dot"), text = document.getElementById("statusText"), banner = document.getElementById("banner");
  if (error) {
    dot.className = "dot old";
    banner.hidden = false;
    banner.textContent = `Couldn't load prices from prices.runescape.wiki (${error}). Retrying in a minute.`;
  } else {
    banner.hidden = true;
  }
  if (fetchedAt) {
    if (!error) dot.className = "dot fresh";
    text.textContent = `Live prices · updated ${fetchedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
  }
}

// Simple view switch in the header: re-opens the current page so it's drawn again in the chosen view.
const simpleBtn = document.getElementById("simpleBtn");
function renderSimple() { simpleBtn.setAttribute("aria-pressed", String(ui.simple())); }
simpleBtn.addEventListener("click", () => ui.setSimple(!ui.simple()));
ui.onChange(() => { renderSimple(); route(); });
ui.apply();
renderSimple();

// "Who are you?" picker in the header.
const meSel = document.getElementById("meSel");
meSel.innerHTML = `<option value="">Everyone</option>` + PLAYERS.map(n => `<option>${n.replace(/[&<>"]/g, "")}</option>`).join("");
meSel.value = PLAYERS.includes(me.get()) ? me.get() : "";
meSel.addEventListener("change", () => me.set(meSel.value));

prices.onChange(() => { renderMode(); renderStatus(); });
renderMode();
prices.start();
group.load();
group.loadQuests();
unlocks.load();
window.addEventListener("hashchange", () => { a11yFocus = true; route(); });
route();
