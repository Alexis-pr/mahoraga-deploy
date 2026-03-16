import { applyTranslations, getLanguage, setLanguage } from "./services/i18n.js";
import { clearInterviewSession } from "./services/interviewService.js";

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.querySelector("#settingsOverlay");
  const settingsBtn = document.querySelector(".sidebar-settings");
  const closeBtn = document.querySelector(".settings-close");
  const langBtns = document.querySelectorAll(".lang-btn");
  const logoutBtn = document.querySelector(".logout-btn");

  if (!overlay || !settingsBtn || !closeBtn || !langBtns.length) return;

  function syncLangButtons() {
    const current = getLanguage();
    langBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === current);
    });
  }

  function openSettings() {
    overlay.classList.remove("closing");
    overlay.classList.add("active");
  }

  function closeSettings() {
    overlay.classList.add("closing");
    setTimeout(() => {
      overlay.classList.remove("active", "closing");
    }, 220);
  }

  settingsBtn.addEventListener("click", openSettings);
  closeBtn.addEventListener("click", closeSettings);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeSettings();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeSettings();
    }
  });

  langBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      setLanguage(btn.dataset.lang || "es");
      syncLangButtons();
    });
  });

  logoutBtn?.addEventListener("click", () => {
    clearInterviewSession();
    sessionStorage.removeItem("loggedInUser");
    window.location.href = "../index.html";
  });

  applyTranslations(document);
  syncLangButtons();
});
