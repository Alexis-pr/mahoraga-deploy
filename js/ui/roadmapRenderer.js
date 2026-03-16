import { pythonMap } from "../data/maps/pythonMap.js";
import { htmlMap } from "../data/maps/htmlMap.js";
import { cssMap } from "../data/maps/cssMap.js";
import { javascriptMap } from "../data/maps/javaScriptMap.js";
import { sqlMap } from "../data/maps/sqlMap.js";
import { gameState } from "../state/gameState.js";

const MAPS = {
  python: pythonMap,
  html: htmlMap,
  css: cssMap,
  javascript: javascriptMap,
  sql: sqlMap,
};

// Event listener para redibujar el roadmap cuando se carga el progreso desde la DB
window.addEventListener("gameState:progressLoaded", () => {
  console.log("[Roadmap] Progress loaded, re-rendering roadmap...");
  renderRoadmap();
});

// Event listener para redibujar el roadmap cuando se actualiza el progreso
window.addEventListener("gameState:progressUpdated", () => {
  console.log("[Roadmap] Progress updated, re-rendering roadmap...");
  renderRoadmap();
});

export function getCurrentMap() {
  return MAPS[gameState.currentTechnology] || [];
}

export function renderRoadmap() {
  const layer = document.querySelector(".nodes-layer");
  const svg = document.querySelector(".connections");
  const world = document.querySelector(".roadmap-world");

  if (!layer || !svg || !world) return;

  layer.innerHTML = "";
  svg.innerHTML = "";

  const currentMap = getCurrentMap();
  if (!currentMap.length) return;

  const minY = Math.min(...currentMap.map((n) => n.y));
  const maxX = Math.max(...currentMap.map((n) => n.x)) + 280;
  const rawMaxY = Math.max(...currentMap.map((n) => n.y));
  const nodeSize = 104;
  const mapHeight = rawMaxY - minY + nodeSize;
  const viewportHeight =
    document.querySelector(".roadmap-container")?.clientHeight || 760;
  const centeredTop = Math.max((viewportHeight - mapHeight) / 2, 80);
  const yOffset = centeredTop - minY;
  const maxY = rawMaxY + yOffset + 220;

  layer.style.width = `${maxX}px`;
  layer.style.height = `${maxY}px`;
  world.style.width = `${Math.max(maxX, 2200)}px`;
  world.style.height = `${Math.max(maxY, 760)}px`;

  svg.setAttribute("width", String(maxX));
  svg.setAttribute("height", String(maxY));

  const techProgress = gameState.progress[gameState.currentTechnology] || {
    unlocked: [],
    completed: [],
  };

  currentMap.forEach((nodeData, index) => {
    const status = getNodeStatus(nodeData, techProgress);

    const node = document.createElement("button");
    node.type = "button";
    node.className = `node ${status}`;
    node.style.left = `${nodeData.x}px`;
    node.style.top = `${nodeData.y + yOffset}px`;
    node.dataset.nodeId = String(nodeData.id);
    node.style.setProperty("--delay", `${index * 24}ms`);

    node.innerHTML = `
      <span class="node-title">${nodeData.title}</span>
      <span class="node-difficulty ${nodeData.difficulty}">${nodeData.difficulty}</span>
    `;

    node.addEventListener("click", () => {
      if (status === "locked") return;

      centerNodeInViewport(node);
      document.dispatchEvent(
        new CustomEvent("roadmap:nodeSelected", {
          detail: {
            node: nodeData,
            status,
            technology: gameState.currentTechnology,
            map: currentMap,
            progress: techProgress,
          },
        }),
      );
    });

    layer.appendChild(node);
    drawConnection(svg, nodeData, currentMap, techProgress, yOffset);
  });
}

function centerNodeInViewport(nodeElement) {
  const container = document.querySelector(".roadmap-container");
  const detailPanel = document.querySelector(".detail-panel");
  if (!container || !nodeElement) return;

  const nodeCenterX = nodeElement.offsetLeft + nodeElement.offsetWidth / 2;
  const nodeCenterY = nodeElement.offsetTop + nodeElement.offsetHeight / 2;

  const panelOpen = detailPanel?.classList.contains("active");
  const panelWidth = panelOpen ? detailPanel.offsetWidth || 0 : 0;
  const safeViewportWidth = Math.max(container.clientWidth - panelWidth, 1);

  const targetLeft = Math.max(nodeCenterX - safeViewportWidth / 2, 0);
  const targetTop = Math.max(nodeCenterY - container.clientHeight / 2, 0);

  container.scrollTo({
    left: targetLeft,
    top: targetTop,
    behavior: "smooth",
  });
}

function getNodeStatus(nodeData, techProgress = { unlocked: [], completed: [] }) {
  const completed = techProgress.completed?.includes(nodeData.id);
  const unlocked = techProgress.unlocked?.includes(nodeData.id);
  const prereqMet =
    !nodeData.requires ||
    techProgress.completed?.includes(nodeData.requires) ||
    techProgress.unlocked?.includes(nodeData.requires);

  if (completed) return "completed";
  if (unlocked || prereqMet) return "available";
  return "locked";
}

function drawConnection(svg, nodeData, currentMap, techProgress, yOffset) {
  if (!nodeData.requires) return;

  const prev = currentMap.find((n) => n.id === nodeData.requires);
  if (!prev) return;

  const offset = 52;
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

  line.setAttribute("x1", String(prev.x + offset));
  line.setAttribute("y1", String(prev.y + yOffset + offset));
  line.setAttribute("x2", String(nodeData.x + offset));
  line.setAttribute("y2", String(nodeData.y + yOffset + offset));
  line.setAttribute("stroke-width", "3");
  const prevCompleted = techProgress?.completed?.includes(prev.id);

  line.setAttribute("stroke", prevCompleted ? "var(--accent-primary)" : "rgba(255,255,255,0.22)");
  line.setAttribute("stroke-linecap", "round");
  line.setAttribute("opacity", "0.9");

  svg.appendChild(line);
}
