import { t } from "../services/i18n.js";

const TECH_LABELS = {
  python: "Python",
  html: "HTML",
  css: "CSS",
  javascript: "JavaScript",
  sql: "SQL",
};

let selectedNode = null;

export function initDetailPanel() {
  const panel = document.querySelector(".detail-panel");
  const closeBtn = document.querySelector(".close-panel");
  const interviewBtn = document.querySelector(".interview-btn");

  if (!panel) return;

  closeBtn?.addEventListener("click", () => {
    panel.classList.remove("active");
  });

  interviewBtn?.addEventListener("click", () => {
    if (!selectedNode) return;

    panel.classList.remove("active");
    document.dispatchEvent(
      new CustomEvent("interview:start", {
        detail: selectedNode,
      }),
    );
  });

  document.addEventListener("roadmap:nodeSelected", (event) => {
    const detail = event.detail;
    if (!detail?.node) return;

    selectedNode = detail;
    renderDetail(detail);
    panel.classList.add("active");
  });

  document.addEventListener("i18n:change", () => {
    if (selectedNode) {
      renderDetail(selectedNode);
    }
  });
}

function renderDetail({ node, status, technology, map, progress }) {
  const titleEl = document.querySelector(".detail-title");
  const topicsList = document.querySelector(".topics-list");
  const progressValue = document.querySelector(".technology-progress-percent");
  const progressFill = document.querySelector(".technology-progress-fill");
  const interviewBtn = document.querySelector(".interview-btn");

  if (titleEl) {
    titleEl.textContent = `${TECH_LABELS[technology] || technology} • ${node.title}`;
  }

  const total = map?.length || 0;
  const unlockedCount = progress?.unlocked?.length || 0;
  const completedCount = progress?.completed?.length || 0;
  const count = Math.max(unlockedCount, completedCount);
  const percent = total ? Math.round((count / total) * 100) : 0;

  if (progressValue) progressValue.textContent = `${percent}%`;
  if (progressFill) progressFill.style.width = `${percent}%`;

  if (interviewBtn) {
    const disabled = status === "locked";
    interviewBtn.disabled = disabled;
    interviewBtn.title = disabled
      ? t("view.unlock")
      : t("view.start");
  }

  const topics = buildTopics(node, status, map, progress);

  if (topicsList) {
    topicsList.innerHTML = topics.map((item) => `<li>${item}</li>`).join("");
  }
}

function buildTopics(node, status, map, progress) {
  const prereq = map.find((item) => item.id === node.requires);
  const following = map.find((item) => item.requires === node.id);
  const completed = progress?.completed?.includes(node.id);
  const unlocked = progress?.unlocked?.includes(node.id);
  const translatedStatus = t(`view.status_${status}`) || status.toUpperCase();

  return [
    `${t("view.status")}: ${translatedStatus}${completed ? ` (${t("view.completed")})` : unlocked ? ` (${t("view.status_available")})` : ""}`,
    `${t("view.difficulty")}: ${node.difficulty}`,
    prereq ? `${t("view.prereq")}: ${prereq.title}` : `${t("view.prereq")}: ${t("view.none")}`,
    following
      ? `${t("view.next")}: ${following.title}`
      : `${t("view.next")}: ${t("view.terminal")}`,
    `${t("view.practice")}: ${t("view.practiceText", { title: node.title })}`,
  ];
}
