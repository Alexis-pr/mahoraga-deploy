import { loadUserProgress } from "../services/sessionService.js";

const createEmptyProgress = () => ({
  python: { unlocked: [], completed: [] },
  html: { unlocked: [], completed: [] },
  css: { unlocked: [], completed: [] },
  javascript: { unlocked: [], completed: [] },
  sql: { unlocked: [], completed: [] },
});

export const gameState = {
  currentTechnology: "python",

  progress: createEmptyProgress(),

  // Inicializa el progreso desde la base de datos
  async initProgress(userId) {
    if (!userId) {
      console.log("[gameState] No userId provided, using default progress");
      return;
    }

    try {
      const dbProgress = await loadUserProgress(userId);
      if (dbProgress) {
        // Solo actualizar si hay datos en la DB
        this.progress = { ...createEmptyProgress(), ...dbProgress };
        console.log("[gameState] Progress loaded from DB:", this.progress);

        // Dispatch event para notificar que el progreso cambio
        window.dispatchEvent(
          new CustomEvent("gameState:progressLoaded", { detail: this.progress }),
        );
      }
    } catch (error) {
      console.error("[gameState] Error initializing progress:", error);
    }
  },

  // Actualiza el progreso (para usar despues de completar una entrevista)
  // Permite registrar niveles desbloqueados y completados.
  updateProgress(tech, update) {
    if (!this.progress[tech]) {
      this.progress[tech] = { unlocked: [], completed: [] };
    }

    const entry = this.progress[tech];

    const unlockLevels = [];
    const completeLevels = [];

    // Compatibilidad hacia atras: si se pasa un numero, se considera nivel desbloqueado
    if (typeof update === "number") {
      unlockLevels.push(update);
    } else if (update) {
      if (Array.isArray(update.unlockLevels)) unlockLevels.push(...update.unlockLevels);
      if (update.unlockLevel) unlockLevels.push(update.unlockLevel);
      if (Array.isArray(update.completeLevels)) completeLevels.push(...update.completeLevels);
      if (update.completeLevel) completeLevels.push(update.completeLevel);
    }

    unlockLevels
      .filter(Boolean)
      .forEach((levelId) => {
        const normalized = Number(levelId);
        if (!Number.isNaN(normalized) && !entry.unlocked.includes(normalized)) {
          entry.unlocked.push(normalized);
        }
      });

    completeLevels
      .filter(Boolean)
      .forEach((levelId) => {
        const normalized = Number(levelId);
        if (Number.isNaN(normalized)) return;

        if (!entry.completed.includes(normalized)) {
          entry.completed.push(normalized);
        }
        // Un nivel completado debe considerarse tambien desbloqueado
        if (!entry.unlocked.includes(normalized)) {
          entry.unlocked.push(normalized);
        }
      });

    console.log(`[gameState] Progress updated for ${tech}:`, entry);

    // Dispatch event para notificar que el progreso cambio
    window.dispatchEvent(
      new CustomEvent("gameState:progressUpdated", {
        detail: { tech, update, progress: this.progress },
      }),
    );
  },
};
