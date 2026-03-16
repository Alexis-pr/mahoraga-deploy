const STORAGE_KEY = "dashboardLang";

const translations = {
  es: {
    "app.title": "Mahoraga Dashboard",
    "sidebar.toggle": "Alternar barra lateral",
    "sidebar.profile": "Perfil",
    "chat.mode": "Modo Entrevista",
    "chat.close": "Cerrar chat",
    "chat.placeholder": "Escribe tu respuesta...",
    "detail.progress": "Progreso de Tecnología",
    "detail.topics": "Temas",
    "detail.interview": "Entrevista",
    "profile.name": "Nombre de usuario",
    "profile.total": "Proceso total",
    "profile.answers": "Resumen de respuestas",
    "profile.correct": "Correctas",
    "profile.incorrect": "Incorrectas",
    "profile.level_html": "Tienes nivel <br><span>Mid developer</span>",
    "profile.achievements": "Logros",
    "profile.a1": "Responde 5 preguntas seguidas correctamente en nivel Senior.",
    "profile.a2": "Responde 10 preguntas correctamente en nivel Junior.",
    "profile.a3": "Completa un nivel de cualquier lenguaje en nivel Mid developer.",
    "profile.a4": "Completa 15 respuestas correctas seguidas en nivel Senior sin errores.",
    "profile.a5": "Consigue un puntaje del 100% en una evaluación completa de nivel Senior.",
    "settings.title": "Ajustes",
    "settings.language": "Idioma",
    "settings.lang_es": "Español",
    "settings.lang_en": "Inglés",
    "settings.logout": "Cerrar sesión",
    "photo.options": "Opciones de foto",
    "photo.edit": "Editar foto",
    "photo.delete": "Eliminar foto",
    "photo.cancel": "Cancelar",
    "view.status": "Estado",
    "view.status_locked": "BLOQUEADO",
    "view.status_available": "DISPONIBLE",
    "view.status_completed": "COMPLETADO",
    "view.completed": "completado",
    "view.difficulty": "Dificultad",
    "view.prereq": "Prerequisito",
    "view.none": "ninguno (tema de entrada)",
    "view.next": "Siguiente tema recomendado",
    "view.terminal": "este es un tema final",
    "view.practice": "Enfoque de práctica",
    "view.practiceText": "Crea un mini ejercicio para \"{title}\"",
    "view.unlock": "Completa los temas prerequisito para desbloquear",
    "view.start": "Iniciar entrevista para este tema",
    "interviewer.start": "Empecemos con <strong>{topic}</strong>. Explica el concepto principal con tus palabras.",
    "interviewer.next": "Bien. Siguiente paso: da un ejemplo práctico y menciona un error común.",
    "interviewer.label": "Entrevistador",
    "you.label": "Tú",
    "detail.default1": "Contenedor e ítems de grid",
    "detail.default2": "grid-template-columns / rows",
    "detail.default3": "grid-gap y gap",
    "detail.default4": "Grid areas y template areas",
    "detail.default5": "Grid implícito vs explícito",
  },
  en: {
    "app.title": "Mahoraga Dashboard",
    "sidebar.toggle": "Toggle sidebar",
    "sidebar.profile": "Profile",
    "chat.mode": "Interview Mode",
    "chat.close": "Close chat",
    "chat.placeholder": "Type your answer...",
    "detail.progress": "Technology Progress",
    "detail.topics": "Topics",
    "detail.interview": "Interview",
    "profile.name": "User name",
    "profile.total": "Total process",
    "profile.answers": "Answers summary",
    "profile.correct": "Correct",
    "profile.incorrect": "Incorrect",
    "profile.level_html": "You have <br><span>Mid developer</span> level",
    "profile.achievements": "Achievements",
    "profile.a1": "Answer 5 questions correctly in a row at Senior level.",
    "profile.a2": "Answer 10 questions correctly at Junior level.",
    "profile.a3": "Complete one level of any language at Mid developer level.",
    "profile.a4": "Complete 15 consecutive correct answers at Senior level without mistakes.",
    "profile.a5": "Get a 100% score in a full Senior-level assessment.",
    "settings.title": "Settings",
    "settings.language": "Language",
    "settings.lang_es": "Spanish",
    "settings.lang_en": "English",
    "settings.logout": "Logout",
    "photo.options": "Photo options",
    "photo.edit": "Edit photo",
    "photo.delete": "Delete photo",
    "photo.cancel": "Cancel",
    "view.status": "Status",
    "view.status_locked": "LOCKED",
    "view.status_available": "AVAILABLE",
    "view.status_completed": "COMPLETED",
    "view.completed": "completed",
    "view.difficulty": "Difficulty",
    "view.prereq": "Prerequisite",
    "view.none": "none (entry topic)",
    "view.next": "Next recommended topic",
    "view.terminal": "this is a terminal topic",
    "view.practice": "Practice focus",
    "view.practiceText": "Build one mini exercise for \"{title}\"",
    "view.unlock": "Complete prerequisite topics to unlock",
    "view.start": "Start interview for this topic",
    "interviewer.start": "Let's start with <strong>{topic}</strong>. Explain the core concept in your own words.",
    "interviewer.next": "Good. Next step: give one practical example and mention a common mistake.",
    "interviewer.label": "Interviewer",
    "you.label": "You",
    "detail.default1": "Grid container and grid items",
    "detail.default2": "grid-template-columns / rows",
    "detail.default3": "grid-gap and gap",
    "detail.default4": "Grid areas and template areas",
    "detail.default5": "Implicit vs explicit grid",
  },
};

let currentLanguage = localStorage.getItem(STORAGE_KEY) || "es";
if (!translations[currentLanguage]) currentLanguage = "es";

export function getLanguage() {
  return currentLanguage;
}

export function t(key, vars = {}) {
  const pack = translations[currentLanguage] || translations.es;
  let text = pack[key] ?? translations.es[key] ?? key;

  Object.entries(vars).forEach(([k, v]) => {
    text = text.replaceAll(`{${k}}`, String(v));
  });

  return text;
}

export function applyTranslations(root = document) {
  if (root === document) {
    document.documentElement.lang = currentLanguage;
  }

  root.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });

  root.querySelectorAll("[data-i18n-html]").forEach((el) => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });

  root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  root.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });

  root.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAriaLabel));
  });
}

export function setLanguage(language) {
  if (!translations[language]) return;

  currentLanguage = language;
  localStorage.setItem(STORAGE_KEY, language);
  applyTranslations(document);
  document.dispatchEvent(new CustomEvent("i18n:change", { detail: { language } }));
}
