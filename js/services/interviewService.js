import { API_BASE_URL } from "./apiConfig.js";

const INTERVIEW_CONTEXT_KEY = "interviewContext";
const INTERVIEW_SESSION_KEY = "interviewSession";

export function saveInterviewContext(context) {
  sessionStorage.setItem(INTERVIEW_CONTEXT_KEY, JSON.stringify(context));
}

export function getInterviewContext() {
  const value = sessionStorage.getItem(INTERVIEW_CONTEXT_KEY);
  return value ? JSON.parse(value) : null;
}

export function getInterviewSession() {
  const value = sessionStorage.getItem(INTERVIEW_SESSION_KEY);
  return value ? JSON.parse(value) : null;
}

export function saveInterviewSession(session) {
  sessionStorage.setItem(INTERVIEW_SESSION_KEY, JSON.stringify(session));
}

export function clearInterviewSession() {
  sessionStorage.removeItem(INTERVIEW_SESSION_KEY);
  sessionStorage.removeItem(INTERVIEW_CONTEXT_KEY);
}

export async function fetchInterviewQuestions(context) {
  const params = new URLSearchParams({
    level: String(context.levelId),
    language: String(context.languageId),
    technology: context.technology,
    topic: context.topic,
    limit: String(context.totalQuestions || 5),
  });

  if (context.idUser) {
    params.set("id_user", String(context.idUser));
  }

  const response = await fetch(`${API_BASE_URL}/questions/interview?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Could not fetch interview questions.");
  }

  const questions = await response.json();

  if (!Array.isArray(questions) || !questions.length) {
    throw new Error("No interview questions were found for the selected topic.");
  }

  return questions;
}

export async function createInterviewSession({ context, user }) {
  if (!user?.id_user || !context?.technology || !context?.levelId) {
    return null;
  }

  const payload = {
    id_user: user.id_user,
    // Prefer technology so el backend resuelve el topic correcto; nodeId puede no coincidir con id_topic en DB.
    technology: context.technology,
    // si existiera una coincidencia directa, la enviamos también
    id_topic: context.nodeId,
    id_level: context.levelId,
    date_ini: new Date().toISOString(),
  };

  const response = await fetch(`${API_BASE_URL}/interview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Could not start interview session.");
  }

  const data = await response.json();
  return data?.interview || null;
}

export async function saveInterviewQuestionInstances({ id_session, questions }) {
  if (!id_session || !Array.isArray(questions) || !questions.length) {
    return null;
  }

  const payload = {
    id_session,
    // preserve incoming order as order_num (idx+1)
    id_questions: questions.map((question) => question.id_question),
  };

  const response = await fetch(`${API_BASE_URL}/questions/instance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Could not save interview questions.");
  }

  return response.json();
}

export async function saveQuestionAnswered({ id_user, id_question_instance, answer, score, feedback, answered_at }) {
  if (!id_user || !id_question_instance || !answer || score === undefined || score === null || !answered_at) {
    throw new Error("missing_required_fields");
  }

  const safeFeedback = feedback && String(feedback).trim().length ? String(feedback) : "Sin feedback";

  const payload = { id_user, id_question_instance, answer, score, feedback: safeFeedback, answered_at };

  const response = await fetch(`${API_BASE_URL}/questions/answered`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Could not save answered question.");
  }

  return response.json();
}

export async function endInterviewSession({ id_session, date_fin }) {
  if (!id_session || !date_fin) {
    throw new Error("missing_id_session_or_date");
  }

  const response = await fetch(`${API_BASE_URL}/interview/${id_session}/end`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date_fin }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Could not end interview session.");
  }

  return response.json();
}

export async function evaluateInterviewSession({ questions, answers, context }) {
  const validAnswers = answers.filter(Boolean);
  const answerScores = validAnswers.map((answerEntry) => {
    const relatedQuestion = questions.find((question) => question.id_question === answerEntry.questionId);
    const expectedTerms = buildExpectedTerms(relatedQuestion, context);
    const normalizedAnswer = answerEntry.answer.toLowerCase();
    const matchedTerms = expectedTerms.filter((term) => normalizedAnswer.includes(term));
    const baseScore = Math.min(100, Math.max(20, answerEntry.answer.trim().length / 4));

    return {
      score: Math.min(100, Math.round(baseScore + matchedTerms.length * 8)),
      matchedTerms,
      expectedTerms,
    };
  });

  const score = calculateAverageScore(answerScores.map((entry) => entry.score));
  const estimatedLevel = getEstimatedLevel(score);
  const weakestAnswer = answerScores.sort((left, right) => left.score - right.score)[0];

  return {
    score,
    estimatedLevel,
    feedback: buildFeedback(score, weakestAnswer?.matchedTerms || [], weakestAnswer?.expectedTerms || []),
  };
}

function buildExpectedTerms(question, context) {
  return `${context.technology} ${context.topic} ${question?.question_text || ""}`
    .toLowerCase()
    .split(/[^a-z0-9áéíóúñ+#.]+/i)
    .map((term) => term.trim())
    .filter((term) => term.length > 3)
    .slice(0, 10);
}

function calculateAverageScore(scores) {
  if (!scores.length) {
    return 0;
  }

  const total = scores.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  return Math.round(total / scores.length);
}

function getEstimatedLevel(score) {
  if (score >= 85) {
    return "Advanced";
  }

  if (score >= 65) {
    return "Intermediate";
  }

  return "Beginner";
}

function buildFeedback(score, matchedTerms, expectedTerms) {
  if (score >= 85) {
    return "La respuesta cubre bien el concepto, usa vocabulario tecnico relevante y muestra buen dominio del tema.";
  }

  if (score >= 65) {
    return `La respuesta va bien, pero puedes profundizar mas. Intenta reforzar ideas como: ${expectedTerms
      .filter((term) => !matchedTerms.includes(term))
      .slice(0, 3)
      .join(", ")}.`;
  }

  return `La respuesta todavia es superficial. Te conviene explicar mejor el concepto central y mencionar elementos como: ${expectedTerms
    .slice(0, 3)
    .join(", ")}.`;
}
