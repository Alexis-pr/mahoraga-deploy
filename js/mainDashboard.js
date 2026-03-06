import { activateTechnology } from "./ui/dashboardRenderer.js";
import { renderRoadmap } from "./ui/roadmapRenderer.js";
import { gameState } from "./state/gameState.js";
import { initPhotoProfile } from "./data/profile/modalProfile.js";

const container = document.querySelector(".roadmap-container");

let isDragging = false;
let startX, startY;
let scrollLeft, scrollTop;

container.addEventListener('mousedown', (e) => {
  isDragging = true;
  container.classList.add("active");

  startX = e.pageX - container.offsetLeft;
  startY = e.pageY - container.offsetTop;

  scrollLeft = container.scrollLeft;
  scrollTop = container.scrollTop;
});

container.addEventListener("mouseleave", () =>  {
  isDragging = false;
});

container.addEventListener("mouseup", () => {
  isDragging = false;
});

container.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  e.preventDefault();

  const x = e.pageX - container.offsetLeft;
  const y = e.pageY - container.offsettop;

  const walkX = (x - startX);
  const walkY = (y - startY);

  container.scrollLeft = scrollLeft - walkX;
  container.scrollTop = scrollTop - walkY;

});

document.addEventListener("DOMContentLoaded", () => {

    // Inicializar módulo de foto de perfil
    initPhotoProfile();

    const pythonBtn = document.querySelector(".tech-btn.python");

    if (pythonBtn) {
        pythonBtn.addEventListener("click", () => {
            activateTechnology("python");
            renderRoadmap();

            console.log("Tecnologia actual: ", gameState.currentTechnology);
        });
    }

});

document.addEventListener("DOMContentLoaded", () => {

  const modal = document.querySelector(".modalProfile");
  const openBtn = document.querySelector(".user-section");
  const closeBtn = document.querySelector(".exitLogo");

  if (!modal || !openBtn) return;

  // Crear fondo oscuro
  const backdrop = document.createElement("div");
  backdrop.classList.add("modal-backdrop");
  document.body.appendChild(backdrop);

  function openModal() {
    modal.classList.add("active");
    backdrop.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("active");
    backdrop.classList.remove("active");
    document.body.style.overflow = "";
  }

  // Abrir modal al hacer click en el botón
  openBtn.addEventListener("click", openModal);

  // Cerrar con la X
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  // Cerrar al hacer click fuera
  backdrop.addEventListener("click", closeModal);

  // Cerrar con ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
    }
  });

});