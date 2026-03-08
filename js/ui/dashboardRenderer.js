import { gameState } from "../state/gameState.js";

export function activateTechnology(technology) {
  gameState.currentTechnology = technology;

  document.querySelectorAll(".tech-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.tech === technology);
  });
}
