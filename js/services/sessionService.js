const LOGGED_IN_USER_KEY = "loggedInUser";
const PROFILE_PHOTO_KEY = "profilePhoto";
const INTERVIEW_LANGUAGE_KEY = "interviewLanguageId";

export function getLoggedInUser() {
  const value = sessionStorage.getItem(LOGGED_IN_USER_KEY);
  return value ? JSON.parse(value) : null;
}

export function requireLoggedInUser(redirectPath = "../index.html") {
  const user = getLoggedInUser();

  if (!user) {
    window.location.href = redirectPath;
    return null;
  }

  return user;
}

export function getStoredProfilePhoto() {
  return localStorage.getItem(PROFILE_PHOTO_KEY) || "";
}

// Guarda el idioma elegido para la entrevista sin tocar el perfil base del usuario.
export function setInterviewLanguagePreference(languageId) {
  sessionStorage.setItem(INTERVIEW_LANGUAGE_KEY, String(languageId));
}

// Prioriza la seleccion manual de entrevista y si no existe usa el idioma del usuario.
export function getInterviewLanguagePreference(user) {
  const storedValue = sessionStorage.getItem(INTERVIEW_LANGUAGE_KEY);
  return Number(storedValue || user?.id_language || 1);
}

// Expone las opciones visibles para el selector del interview.
export function getInterviewLanguageOptions() {
  return [
    // La DB actual usa 1 para espanol y 2 para ingles.
    { id: 1, label: "Spanish" },
    { id: 2, label: "English" },
  ];
}

export function getUserPresentation(user) {
  const levelName = getLevelName(user?.id_level);
  const languageName = getLanguageName(user?.id_language);

  return {
    name: user?.user_name || "Mahoraga User",
    levelName,
    languageName,
    initials: (user?.user_name || "MU")
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  };
}

export function getLevelName(idLevel) {
  switch (Number(idLevel)) {
    case 3:
      return "Senior";
    case 2:
      return "Mid";
    case 1:
      return "Junior";
    default:
      return "Explorer";
  }
}

export function getLanguageName(idLanguage) {
  switch (Number(idLanguage)) {
    case 1:
      return "Spanish";
    case 2:
      return "English";
    default:
      return "General";
  }
}

// Reutiliza el mismo mapeo para el idioma elegido solo dentro del interview.
export function getInterviewLanguageName(idLanguage) {
  return getLanguageName(idLanguage);
}
