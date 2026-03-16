import { clearInterviewSession } from "../services/interviewService.js";
import { clearLoggedInUser } from "../services/sessionService.js";

const THEME_STORAGE_KEY = "dashboardTheme";

export function initThemeManager() {
  const overlay = document.getElementById("settingsOverlay");
  const openButton = document.querySelector(".sidebar-settings");
  const closeButton = document.querySelector(".settings-close");
  const themeButtons = document.querySelectorAll(".theme-btn");
  const logoutButton = document.querySelector(".logout-btn");
  const sidebarLogoutButton = document.getElementById("sidebarLogout");

  if (!overlay || !openButton || !closeButton || !themeButtons.length) {
    return;
  }

  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) || "dark";
  applyTheme(storedTheme, themeButtons);

  openButton.addEventListener("click", () => {
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  });

  closeButton.addEventListener("click", () => closeSettings(overlay));
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeSettings(overlay);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeSettings(overlay);
    }
  });

  themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applyTheme(button.dataset.theme || "dark", themeButtons);
    });
  });

  logoutButton?.addEventListener("click", handleLogout);
  sidebarLogoutButton?.addEventListener("click", handleLogout);
}

function applyTheme(theme, themeButtons) {
  const isLightTheme = theme === "light";

  document.body.classList.toggle("light-mode", isLightTheme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);

  themeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.theme === theme);
  });
}

function closeSettings(overlay) {
  overlay.classList.remove("active");
  document.body.style.overflow = "";
}

function handleLogout() {
  clearInterviewSession();
  clearLoggedInUser();
  window.location.href = "../index.html";
}
