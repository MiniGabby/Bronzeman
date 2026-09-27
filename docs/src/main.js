// App entry: starts the data services and swaps pages based on the URL hash (#/money, #/training/magic, #/group).
import * as prices from "./core/prices.js";
import * as group from "./core/players.js";
import * as money from "./views/money.js";
import * as training from "./views/training.js";
import * as groupView from "./views/group.js";
import * as requests from "./views/requests.js";

// To add a page: create src/views/<name>.js exporting mount(root, params) and title,
// add it here, and add a link with href="#/<name>" to the nav in index.html.
const ROUTES = { money, training, group: groupView, requests };

const view = document.getElementById("view");
let cleanup = null;

function route() {
  const [name, ...params] = location.hash.replace(/^#\/?/, "").split("/");
  const page = ROUTES[name] ? name : "money";
  if (typeof cleanup === "function") cleanup();
  view.innerHTML = "";
  cleanup = ROUTES[page].mount(view, params);
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

prices.onChange(() => { renderMode(); renderStatus(); });
renderMode();
prices.start();
group.load();
window.addEventListener("hashchange", () => { a11yFocus = true; route(); });
route();
