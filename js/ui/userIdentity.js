import {
  getLoggedInUser,
  getStoredProfilePhoto,
  getUserPresentation,
} from "../services/sessionService.js";

export function initDashboardIdentity() {
  const user = getLoggedInUser();

  if (!user) {
    return;
  }

  const presentation = getUserPresentation(user);
  const badges =
    document.getElementById("dashboardBadges") ||
    document.querySelector(".sidebar .levels");

  setText("dashboardUsername", presentation.name);
  setText("identityName", presentation.name);
  setText(
    "identityCopy",
    `${presentation.levelName} path active. ${presentation.languageName} profile connected for interviews and roadmap progress.`,
  );
  setText("identityLevel", presentation.levelName);
  setText("identityLanguage", presentation.languageName);
  setText("profileUsername", presentation.name);
  setText("profileLevel", presentation.levelName);
  const nameTargets = [
    document.getElementById("dashboardUsername"),
    document.querySelector(".sidebar .username"),
    document.getElementById("profileUsername"),
    document.querySelector(".profile-view h2"),
  ];

  nameTargets.forEach((element) => {
    if (!element) return;
    element.textContent = presentation.name;
    element.removeAttribute("data-i18n");
    element.removeAttribute("data-i18n-html");
  });
  const progress = getProfileProgress(user.id_level);
  setText("profileProgressLabel", `${progress}%`);
  setProgress("profileProgressFill", progress);

  if (badges) {
    badges.innerHTML = `
      <span class="user-badge">${presentation.levelName}</span>
      <span class="user-badge muted">${presentation.languageName}</span>
    `;
  }

  applyPhotoToIdentity(getStoredProfilePhoto(user), presentation.initials);
  document.addEventListener("profile-photo-updated", ({ detail }) => {
    applyPhotoToIdentity(detail?.image || "", presentation.initials);
  });
}

export function initInterviewIdentity() {
  const user = getLoggedInUser();

  if (!user) {
    return;
  }

  const presentation = getUserPresentation(user);
  setText("interviewUsername", presentation.name);
  setText("interviewUserMeta", `${presentation.levelName} • ${presentation.languageName}`);
  applyPhotoToInterview(getStoredProfilePhoto(user), presentation.initials);
  document.addEventListener("profile-photo-updated", ({ detail }) => {
    applyPhotoToInterview(detail?.image || "", presentation.initials);
  });
}

function applyPhotoToIdentity(photo, initials) {
  const avatar = document.getElementById("sidebarAvatar") || document.querySelector(".user-avatar");
  const profilePhoto = document.getElementById("photoContainer");

  [avatar, profilePhoto].forEach((element) => {
    if (!element) {
      return;
    }

    const icon = element.querySelector("i");
    element.style.backgroundImage = photo ? `url(${photo})` : "";
    element.classList.toggle("has-image", Boolean(photo));

    if (icon) {
      icon.style.display = photo || element.id !== "photoContainer" ? "none" : "block";
    }

    if (!photo && element.id !== "photoContainer") {
      element.dataset.initials = initials;
    } else {
      delete element.dataset.initials;
    }
  });
}

function applyPhotoToInterview(photo, initials) {
  const avatar = document.getElementById("interviewUserAvatar");

  if (!avatar) {
    return;
  }

  avatar.style.backgroundImage = photo ? `url(${photo})` : "";
  avatar.classList.toggle("has-image", Boolean(photo));
  avatar.textContent = photo ? "" : initials;
}

function getProfileProgress(idLevel) {
  switch (Number(idLevel)) {
    case 3:
      return 88;
    case 2:
      return 62;
    case 1:
      return 34;
    default:
      return 20;
  }
}

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}

function setProgress(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.style.width = `${value}%`;
  }
}
