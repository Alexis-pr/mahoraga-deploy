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
