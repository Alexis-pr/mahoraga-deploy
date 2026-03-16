import { gameState } from "../state/gameState.js";
import { pythonMap } from "../data/maps/pythonMap.js";
import { htmlMap } from "../data/maps/htmlMap.js";
import { cssMap } from "../data/maps/cssMap.js";
import { javascriptMap } from "../data/maps/javaScriptMap.js";
import { sqlMap } from "../data/maps/sqlMap.js";

const MAP_SIZES = {
  python: pythonMap.length,
  html: htmlMap.length,
  css: cssMap.length,
  javascript: javascriptMap.length,
  sql: sqlMap.length,
};

function getTechPercent(tech) {
  const total = MAP_SIZES[tech] || 0;
  if (!total) return 0;

  const unlocked = gameState.progress[tech]?.unlocked?.length || 0;
  const completed = gameState.progress[tech]?.completed?.length || 0;
  const count = Math.max(unlocked, completed);

  return Math.min(100, Math.round((count / total) * 100));
}

function updateSidebarProgress() {
  document.querySelectorAll(".tech-btn").forEach((btn) => {
    const tech = btn.dataset.tech;
    if (!tech) return;
    const percentEl = btn.querySelector(".percent");
    if (!percentEl) return;
    percentEl.textContent = `${getTechPercent(tech)}%`;
  });
}

function updateProfileProgress() {
  const totalTechs = Object.keys(MAP_SIZES).length || 1;
  const sum = Object.keys(MAP_SIZES).reduce((acc, tech) => acc + getTechPercent(tech), 0);
  const overall = Math.round(sum / totalTechs);

  const loadBar = document.querySelector(".total-process .load");
  const loadText = document.querySelector(".total-process .load p");
  if (loadBar) loadBar.style.width = `${overall}%`;
  if (loadText) loadText.textContent = `${overall}%`;
}

export function initDashboardProgressUI() {
  updateSidebarProgress();
  updateProfileProgress();

  window.addEventListener("gameState:progressLoaded", () => {
    updateSidebarProgress();
    updateProfileProgress();
  });

  window.addEventListener("gameState:progressUpdated", () => {
    updateSidebarProgress();
    updateProfileProgress();
  });
}
