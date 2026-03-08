const STORAGE_KEY = "profilePhoto";

export function initPhotoProfile() {
  const modal = document.querySelector(".modalProfile");
  const openButton = document.querySelector(".user-section");
  const closeButton = document.querySelector(".exitLogo");
  const photoContainer = document.getElementById("photoContainer");
  const sidebarAvatar = document.getElementById("sidebarAvatar");
  const photoInput = document.getElementById("photoInput");
  const deleteButton = document.querySelector(".delete");
  const cameraIcon = document.querySelector(".camera-icon");

  if (!modal || !openButton || !photoContainer || !photoInput || !deleteButton || !cameraIcon) {
    return;
  }

  const backdrop = document.createElement("div");
  backdrop.classList.add("modal-backdrop");
  document.body.appendChild(backdrop);

  const savedPhoto = localStorage.getItem(STORAGE_KEY);
  syncAvatar(savedPhoto, photoContainer, sidebarAvatar, cameraIcon);

  photoContainer.addEventListener("click", (event) => {
    if (!event.target.classList.contains("delete")) {
      photoInput.click();
    }
  });

  photoInput.addEventListener("change", (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = ({ target }) => {
      const imageBase64 = target?.result;

      if (typeof imageBase64 !== "string") {
        return;
      }

      localStorage.setItem(STORAGE_KEY, imageBase64);
      syncAvatar(imageBase64, photoContainer, sidebarAvatar, cameraIcon);
      document.dispatchEvent(new CustomEvent("profile-photo-updated", { detail: { image: imageBase64 } }));
    };

    reader.readAsDataURL(file);
  });

  deleteButton.addEventListener("click", (event) => {
    event.stopPropagation();
    localStorage.removeItem(STORAGE_KEY);
    syncAvatar("", photoContainer, sidebarAvatar, cameraIcon);
    document.dispatchEvent(new CustomEvent("profile-photo-updated", { detail: { image: "" } }));
  });

  openButton.addEventListener("click", () => {
    modal.classList.remove("closing");
    modal.classList.add("active");
    backdrop.classList.add("active");
    document.body.style.overflow = "hidden";
  });

  closeButton?.addEventListener("click", () => closeModal(modal, backdrop));
  backdrop.addEventListener("click", () => closeModal(modal, backdrop));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal(modal, backdrop);
    }
  });
}

function syncAvatar(image, photoContainer, sidebarAvatar, cameraIcon) {
  const hasImage = Boolean(image);

  photoContainer.style.backgroundImage = hasImage ? `url(${image})` : "";
  photoContainer.classList.toggle("has-image", hasImage);
  cameraIcon.style.display = hasImage ? "none" : "block";

  if (!sidebarAvatar) {
    return;
  }

  sidebarAvatar.style.backgroundImage = hasImage ? `url(${image})` : "";
  sidebarAvatar.classList.toggle("has-image", hasImage);

  const sidebarIcon = sidebarAvatar.querySelector("i");

  if (sidebarIcon) {
    sidebarIcon.style.display = hasImage ? "none" : "block";
  }
}

function closeModal(modal, backdrop) {
  if (!modal.classList.contains("active")) {
    return;
  }

  modal.classList.add("closing");
  backdrop.classList.remove("active");
  document.body.style.overflow = "";

  window.setTimeout(() => {
    modal.classList.remove("active", "closing");
  }, 250);
}
