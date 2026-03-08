import { gameState } from "../state/gameState.js";
import { clearInterviewSession, saveInterviewContext } from "../services/interviewService.js";
import { getInterviewLanguagePreference, getLoggedInUser } from "../services/sessionService.js";

const DEFAULT_DETAIL_MESSAGE = "Choose an available node to inspect its content.";

export function initDashboardViewManager() {
  const detailPanel = document.querySelector(".detail-panel");
  const closeButton = document.querySelector(".close-panel");
  const interviewButton = document.querySelector(".interview-btn");

  closeButton?.addEventListener("click", () => {
    detailPanel?.classList.remove("active");
  });

  interviewButton?.addEventListener("click", () => {
    const topic = interviewButton.dataset.topic;
    const nodeId = interviewButton.dataset.nodeId;

    if (!topic || !nodeId) {
      return;
    }

    const loggedInUser = getLoggedInUser();
    const context = {
      technology: gameState.currentTechnology,
      topic,
      difficulty: interviewButton.dataset.difficulty || "basic",
      nodeId: Number(nodeId),
      // El nivel de la entrevista debe salir del perfil real del usuario, no del nodo visual.
      levelId: Number(loggedInUser?.id_level || 1),
      // Usa el idioma seleccionado para la entrevista si el usuario ya cambio esa preferencia.
      languageId: getInterviewLanguagePreference(loggedInUser),
      totalQuestions: 5,
    };

    clearInterviewSession();
    saveInterviewContext(context);
    window.location.href = "../pages/interview.html";
  });

  resetDetailPanel();
}

export function openDetailPanel(nodeData, currentMap) {
  const detailPanel = document.querySelector(".detail-panel");
  const title = document.querySelector(".detail-title");
  const topicsList = document.querySelector(".topics-list");
  const interviewButton = document.querySelector(".interview-btn");

  if (!detailPanel || !title || !topicsList || !interviewButton) {
    return;
  }

  title.textContent = nodeData.title;
  topicsList.innerHTML = buildTopics(nodeData).map((topic) => `<li>${topic}</li>`).join("");
  interviewButton.dataset.topic = nodeData.title;
  interviewButton.dataset.difficulty = nodeData.difficulty;
  interviewButton.dataset.nodeId = String(nodeData.id);
  interviewButton.disabled = false;
  detailPanel.classList.add("active");

  const progress = getTechnologyProgress(currentMap);
  syncTechnologyProgress(progress);
}

export function resetDetailPanel() {
  const detailPanel = document.querySelector(".detail-panel");
  const title = document.querySelector(".detail-title");
  const topicsList = document.querySelector(".topics-list");
  const interviewButton = document.querySelector(".interview-btn");

  if (title) {
    title.textContent = "Select a topic";
  }

  if (topicsList) {
    topicsList.innerHTML = `<li>${DEFAULT_DETAIL_MESSAGE}</li>`;
  }

  if (interviewButton) {
    interviewButton.disabled = true;
    interviewButton.dataset.topic = "";
    interviewButton.dataset.difficulty = "";
    interviewButton.dataset.nodeId = "";
  }

  detailPanel?.classList.remove("active");
}

export function syncTechnologyProgress(progress) {
  const progressFill = document.querySelector(".technology-progress-fill");
  const progressLabel = document.querySelector(".technology-progress-percent");

  if (progressFill) {
    progressFill.style.width = `${progress}%`;
  }

  if (progressLabel) {
    progressLabel.textContent = `${progress}%`;
  }
}

function getTechnologyProgress(currentMap) {
  if (!currentMap.length || !gameState.currentTechnology) {
    return 0;
  }

  const completedNodes = gameState.progress[gameState.currentTechnology]?.length || 0;
  return Math.round((completedNodes / currentMap.length) * 100);
}

function buildTopics(nodeData) {
  const cleanTitle = nodeData.title.replace(/\((.*?)\)/g, "$1");
  const chunks = cleanTitle
    .split(/[:/&,-]/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  const topics = [
    `Difficulty: ${capitalize(nodeData.difficulty)}`,
    `Node ${nodeData.id} in the ${gameState.currentTechnology.toUpperCase()} roadmap`,
  ];

  if (chunks.length > 1) {
    topics.push(...chunks.slice(0, 3).map((chunk) => `Review ${chunk}`));
  } else {
    topics.push(`Core concept: ${nodeData.title}`);
    topics.push("Practice with examples and applied exercises");
  }

  if (nodeData.requires) {
    topics.push(`Prerequisite node: ${nodeData.requires}`);
  } else {
    topics.push("This is an entry node for the selected technology");
  }

  return topics;
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
