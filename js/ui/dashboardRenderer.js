import { gameState } from "../state/gameState.js";
import { renderRoadmap } from "./roadmapRenderer.js";

export function initDashboardRenderer() {
  const techButtons = document.querySelectorAll(".tech-btn");
  if (!techButtons.length) return;

  techButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const tech = e.currentTarget.dataset.tech;
      if (!tech) return;

      setActiveTechnology(tech);
      renderRoadmap();
    });
  });
}

export function setActiveTechnology(techClass) {
  gameState.currentTechnology = techClass;

  document.querySelectorAll(".tech-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tech === techClass);
  });
}
