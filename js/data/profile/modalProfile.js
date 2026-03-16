import { getLoggedInUser, getStoredProfilePhoto, setStoredProfilePhoto } from "../../services/sessionService.js";

export function initPhotoProfile() {
  const modal = document.querySelector(".modalProfile");
  const openButton = document.querySelector(".user-section");
  const closeButton = document.querySelector(".exitLogo");
  const photoContainer = document.getElementById("photoContainer");
  const sidebarAvatar = document.getElementById("sidebarAvatar") || document.querySelector(".user-avatar");
  const photoInput = document.getElementById("photoInput");
  const deleteButton = document.querySelector(".delete");
  const editButton = document.querySelector(".edit");
  const cameraIcon = document.querySelector(".camera-icon");
  const actionBackdrop = document.getElementById("photoActionBackdrop");
  const actionModal = document.getElementById("photoActionModal");
  const actionEdit = document.querySelector(".photo-action-edit");
  const actionDelete = document.querySelector(".photo-action-delete");
  const actionCancel = document.querySelector(".photo-action-cancel");

  if (
    !modal ||
    !openButton ||
    !photoContainer ||
    !photoInput ||
    !deleteButton ||
    !cameraIcon ||
    !actionBackdrop ||
    !actionModal ||
    !actionEdit ||
    !actionDelete ||
    !actionCancel
  ) {
    return;
  }

  const backdrop = document.createElement("div");
  backdrop.classList.add("modal-backdrop");
  document.body.appendChild(backdrop);

  const user = getLoggedInUser();
  const savedPhoto = getStoredProfilePhoto(user);
  syncAvatar(savedPhoto, photoContainer, sidebarAvatar, cameraIcon);

  photoContainer.addEventListener("click", (event) => {
    event.stopPropagation();
    openPhotoActionModal(actionBackdrop, actionModal);
  });

  deleteButton.addEventListener("click", (event) => {
    event.stopPropagation();
    openPhotoActionModal(actionBackdrop, actionModal);
  });

  editButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    openPhotoActionModal(actionBackdrop, actionModal);
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

      setStoredProfilePhoto(user, imageBase64);
      syncAvatar(imageBase64, photoContainer, sidebarAvatar, cameraIcon);
      document.dispatchEvent(new CustomEvent("profile-photo-updated", { detail: { image: imageBase64 } }));
    };

    reader.readAsDataURL(file);
  });

  actionEdit.addEventListener("click", () => {
    closePhotoActionModal(actionBackdrop, actionModal);
    photoInput.click();
  });

  actionDelete.addEventListener("click", () => {
    closePhotoActionModal(actionBackdrop, actionModal);
    setStoredProfilePhoto(user, "");
    syncAvatar("", photoContainer, sidebarAvatar, cameraIcon);
    document.dispatchEvent(new CustomEvent("profile-photo-updated", { detail: { image: "" } }));
  });

  actionCancel.addEventListener("click", () => closePhotoActionModal(actionBackdrop, actionModal));
  actionBackdrop.addEventListener("click", () => closePhotoActionModal(actionBackdrop, actionModal));

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
      if (actionModal.classList.contains("active")) {
        closePhotoActionModal(actionBackdrop, actionModal);
        return;
      }
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

function openPhotoActionModal(backdrop, modal) {
  backdrop.classList.add("active");
  modal.classList.add("active");
}

function closePhotoActionModal(backdrop, modal) {
  backdrop.classList.remove("active");
  modal.classList.remove("active");
}
