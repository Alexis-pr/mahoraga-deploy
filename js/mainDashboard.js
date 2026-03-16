import { initDashboardRenderer, setActiveTechnology } from "./ui/dashboardRenderer.js";
import { initPhotoProfile } from "./data/profile/modalProfile.js";
import { initDetailPanel } from "./ui/viewManager.js";
import { renderRoadmap } from "./ui/roadmapRenderer.js";
import { applyTranslations, t } from "./services/i18n.js";
import { requireLoggedInUser } from "./services/sessionService.js";
import { initDashboardIdentity } from "./ui/userIdentity.js";
import { gameState } from "./state/gameState.js";
import { initDashboardProgressUI } from "./services/dashboardService.js";

function initRoadmapDrag() {
  const container = document.querySelector(".roadmap-container");
  if (!container) return;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let scrollLeft = 0;
  let scrollTop = 0;

  container.addEventListener("mousedown", (e) => {
    const target = e.target;
    if (
      target.closest("button") ||
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest(".detail-panel")
    ) {
      return;
    }

    isDragging = true;
    container.classList.add("active");

    startX = e.pageX - container.offsetLeft;
    startY = e.pageY - container.offsetTop;
    scrollLeft = container.scrollLeft;
    scrollTop = container.scrollTop;
  });

  container.addEventListener("mouseleave", () => {
    isDragging = false;
    container.classList.remove("active");
  });

  container.addEventListener("mouseup", () => {
    isDragging = false;
    container.classList.remove("active");
  });

  container.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    e.preventDefault();

    const x = e.pageX - container.offsetLeft;
    const y = e.pageY - container.offsetTop;

    const walkX = x - startX;
    const walkY = y - startY;

    container.scrollLeft = scrollLeft - walkX;
    container.scrollTop = scrollTop - walkY;
  });
}

function initSidebarToggle() {
  const toggleBtn = document.querySelector(".hamburger-toggle");
  const sidebar = document.querySelector(".sidebar");
  const roadmapContainer = document.querySelector(".roadmap-container");
  const toggleIcon = toggleBtn?.querySelector(".toggle-lordicon");

  if (!toggleBtn || !sidebar || !roadmapContainer) return;

  const syncToggleState = () => {
    const collapsed = sidebar.classList.contains("collapsed");
    toggleBtn.classList.toggle("is-collapsed", collapsed);

    if (toggleIcon) {
      toggleIcon.setAttribute("trigger", collapsed ? "hover" : "morph");
    }

    toggleBtn.setAttribute("aria-label", t("sidebar.toggle"));
    toggleBtn.title = t("sidebar.toggle");
  };

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    roadmapContainer.classList.toggle("sidebar-collapsed");
    syncToggleState();
  });

  syncToggleState();
  document.addEventListener("i18n:change", syncToggleState);
}

document.addEventListener("DOMContentLoaded", () => {
  const user = requireLoggedInUser("../index.html");
  if (!user) return;

  // Set default technology before any render to avoid empty state
  setActiveTechnology("python");

  // Initialize game state with user progress from database
  // We need to wait for the progress to load before rendering
  gameState.initProgress(user.id_user).then(() => {
    // After progress is loaded, render the roadmap
    renderRoadmap();
  });

  // Primer render mientras llega el progreso (muestra el roadmap con estado base)
  renderRoadmap();

  applyTranslations(document);
  initDashboardProgressUI();
  initRoadmapDrag();
  initSidebarToggle();
  initDashboardRenderer();
  initPhotoProfile();
  initDetailPanel();
  initDashboardIdentity();

  let resizeRaf = null;
  window.addEventListener("resize", () => {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      renderRoadmap();
    });
  });
});
