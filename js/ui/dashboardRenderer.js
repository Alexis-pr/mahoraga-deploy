import { gameState } from "../state/gameState.js";
import { renderRoadmap } from "./roadmapRenderer.js";

export function activateTechnology(techClass) {

    //Guardar en el estado 

    gameState.currentTechnology = techClass;

    // Cambiar el estado vusial

    document.querySelectorAll(".tech-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    const selected = document.querySelector(`.tech-btn.${techClass}`);
    if (selected) {
        selected.classList.add("active");
    }
}

 
document.querySelectorAll(".tech-btn").forEach(button => {
  button.addEventListener("click", (e) => {

    const tech = e.currentTarget.dataset.tech;

    gameState.currentTechnology = tech;

    console.log("Tecnología cambiada a:", tech);

    renderRoadmap(); //  importante
  });
});