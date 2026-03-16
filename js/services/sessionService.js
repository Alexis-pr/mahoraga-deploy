const LOGGED_IN_USER_KEY = "loggedInUser";
const PROFILE_PHOTO_KEY = "profilePhoto";
const INTERVIEW_LANGUAGE_KEY = "interviewLanguageId";

// API Base URL - adjustable for different environments
const API_BASE_URL = window.API_BASE_URL || "http://127.0.0.1:3000/api";

export function getLoggedInUser() {
  const value = sessionStorage.getItem(LOGGED_IN_USER_KEY);

  if (!value) {
    return null;
  }

  try {
    const user = JSON.parse(value);

    if (!user || typeof user !== "object") {
      clearLoggedInUser();
      return null;
    }

    return normalizeLoggedInUser(user);
  } catch {
    clearLoggedInUser();
    return null;
  }
}

export function setLoggedInUser(user) {
  const normalizedUser = normalizeLoggedInUser(user);
  sessionStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(normalizedUser));
  return normalizedUser;
}

export function clearLoggedInUser() {
  sessionStorage.removeItem(LOGGED_IN_USER_KEY);
  sessionStorage.removeItem(INTERVIEW_LANGUAGE_KEY);
}

export function requireLoggedInUser(redirectPath = "../index.html") {
  const user = getLoggedInUser();

  if (!user) {
    window.location.href = redirectPath;
    return null;
  }

  return user;
}

export function getStoredProfilePhoto(user) {
  const key = getProfilePhotoKey(user);
  return key ? localStorage.getItem(key) || "" : "";
}

export function setStoredProfilePhoto(user, image) {
  const key = getProfilePhotoKey(user);

  if (!key) {
    return;
  }

  if (image) {
    localStorage.setItem(key, image);
  } else {
    localStorage.removeItem(key);
  }
}

export function redirectLoggedInUser(targetPath = "./pages/dashboard.html") {
  const user = getLoggedInUser();

  if (!user) {
    return null;
  }

  window.location.href = targetPath;
  return user;
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

function normalizeLoggedInUser(user) {
  return {
    ...user,
    id_user: user?.id_user ? String(user.id_user) : null,
    id_level: Number(user?.id_level || 1),
    id_language: Number(user?.id_language || 1),
  };
}

function getProfilePhotoKey(user) {
  if (!user) {
    return null;
  }

  const identifier = user?.id_user || user?.id || user?.email || user?.user_name;

  if (!identifier) {
    return null;
  }

  return `${PROFILE_PHOTO_KEY}:${identifier}`;
}

// Carga el progreso del usuario desde la base de datos
export async function loadUserProgress(id_user) {
  try {
    let response = await fetch(`${API_BASE_URL}/users/topic-progress/${id_user}`);
    if (response.status === 404) {
      response = await fetch(`${API_BASE_URL}/user/topic-progress/${id_user}`);
    }
    // Fallback al endpoint "progress" anterior si existiera
    if (!response.ok) {
      response = await fetch(`${API_BASE_URL}/users/progress/${id_user}`);
      if (response.status === 404) {
        response = await fetch(`${API_BASE_URL}/user/progress/${id_user}`);
      }
    }
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error("[Progress] Endpoint error body:", body);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const progressData = await response.json();
    
    console.log('[Progress] Raw data from DB:', progressData);
    
    // Convertir el progreso de la DB al formato de gameState
    // gameState.progress: { python: { unlocked: [], completed: [] }, ... }
    const progressByTech = {
      python: { unlocked: [], completed: [] },
      html: { unlocked: [], completed: [] },
      css: { unlocked: [], completed: [] },
      javascript: { unlocked: [], completed: [] },
      sql: { unlocked: [], completed: [] },
    };
    
    // Mapeo por ID conocido (la tabla no expone topic_name en este entorno)
    // Mapeo por ID según tu tabla topic:
    // 1 Python, 2 HTML, 3 JavaScrip, 4 data base, 6 CSS
    const topicIdFallback = {
      1: "python",
      2: "html",
      3: "javascript", // JavaScrip (typo en DB) -> javascript
      4: "sql",        // data base -> sql path
      5: "sql",        // por si existe
      6: "css",
    };
    
    progressData.forEach((item) => {
      const levelId = Number(item.id_asinated_level);
      if (Number.isNaN(levelId)) return;

      const tech = topicIdFallback[item.id_topic];
      if (!tech || !progressByTech[tech]) return;

      if (item.is_unlocked && !progressByTech[tech].unlocked.includes(levelId)) {
        progressByTech[tech].unlocked.push(levelId);
      }

      if (item.is_completed && !progressByTech[tech].completed.includes(levelId)) {
        progressByTech[tech].completed.push(levelId);
        if (!progressByTech[tech].unlocked.includes(levelId)) {
          progressByTech[tech].unlocked.push(levelId);
        }
      }
    });
    
    console.log('[Progress] Loaded from DB:', progressByTech);
    return progressByTech;
  } catch (error) {
    console.error('[Progress] Error loading:', error);
    return null;
  }
}
