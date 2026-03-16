import { API_BASE_URL } from "./apiConfig.js";

export function buildN8nSessionPayload({ session, context }) {
  const answers = (session?.answers || []).filter(Boolean);
  const questions = session?.questions || [];

  return {
    id_session: context?.id_session ?? null,
    id_user: context?.id_user ?? null,
    context: {
      technology: context?.technology,
      topic: context?.topic,
      difficulty: context?.difficulty,
      levelId: context?.levelId,
      languageId: context?.languageId,
    },
    questions,
    answers,
    summary: session?.summary || null,
  };
}

export async function sendN8nSessionPayload(payload) {
  const response = await fetch(`${API_BASE_URL}/voice/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.toLowerCase().includes("application/json");

  if (!response.ok) {
    const errorBody = isJson ? await response.json() : await response.text();
    throw new Error(
      typeof errorBody === "string" ? errorBody : errorBody?.mensaje || "Error enviando a n8n."
    );
  }

  if (isJson) {
    return await response.json();
  }

  return null;
}
