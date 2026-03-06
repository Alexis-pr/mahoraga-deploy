const STORAGE_KEY = "profilePhoto";

export function initPhotoProfile() {
  const photoContainer = document.getElementById("photoContainer");
  const photoInput = document.getElementById("photoInput");
  const deleteBtn = document.querySelector(".delete");
  const cameraIcon = document.querySelector(".camera-icon");

  if (!photoContainer || !photoInput || !deleteBtn || !cameraIcon) return;

  // Cargar imagen guardada
  const savedPhoto = localStorage.getItem(STORAGE_KEY);

  if (savedPhoto) {
    photoContainer.style.backgroundImage = `url(${savedPhoto})`;
    photoContainer.classList.add("has-image");
    cameraIcon.style.display = "none";
  }

  // Click en contenedor
  photoContainer.addEventListener("click", (e) => {
    if (!e.target.classList.contains("delete")) {
      photoInput.click();
    }
  });

  // Subir imagen
  photoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = function (event) {
        const imageBase64 = event.target.result;

        photoContainer.style.backgroundImage = `url(${imageBase64})`;
        photoContainer.classList.add("has-image");
        cameraIcon.style.display = "none";

        localStorage.setItem(STORAGE_KEY, imageBase64);
      };

      reader.readAsDataURL(file);
    }
  });

  // Eliminar imagen
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    photoContainer.style.backgroundImage = "";
    photoContainer.classList.remove("has-image");
    cameraIcon.style.display = "block";

    localStorage.removeItem(STORAGE_KEY);
  });
}