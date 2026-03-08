import {
  evaluateInterviewAnswer,
  clearInterviewSession,
  fetchInterviewQuestions,
  getInterviewContext,
  getInterviewSession,
  saveInterviewContext,
  saveInterviewSession,
} from "./services/interviewService.js";
import {
  getInterviewLanguageName,
  getInterviewLanguageOptions,
  getInterviewLanguagePreference,
  requireLoggedInUser,
  setInterviewLanguagePreference,
} from "./services/sessionService.js";
import { initInterviewIdentity } from "./ui/userIdentity.js";

document.addEventListener("DOMContentLoaded", async () => {
  const user = requireLoggedInUser("../index.html");

  if (!user) {
    return;
  }

  const context = getInterviewContext();

  if (!context) {
    window.location.href = "../pages/dashboard.html";
    return;
  }

  // Aterriza el contexto al idioma elegido por el usuario antes de pedir preguntas.
  context.languageId = getInterviewLanguagePreference(user);
  saveInterviewContext(context);

  initInterviewIdentity();
  bindStaticContext(context);
  bindLanguageSelector(context, user);
  bindExitAction();

  try {
    const questions = await fetchInterviewQuestions(context);
    const session = getInterviewSessionForContext(context, questions);
    bindInterviewActions(session, context);
    renderCurrentQuestion(session, context);
  } catch (error) {
    renderFatalState(error.message);
  }
});

function getInterviewSessionForContext(context, questions) {
  const savedSession = getInterviewSession();

  if (
    savedSession &&
    savedSession.contextKey === getContextKey(context) &&
    Array.isArray(savedSession.questions) &&
    savedSession.questions.length
  ) {
    savedSession.currentIndex = getSafeCurrentIndex(savedSession);
    saveInterviewSession(savedSession);
    return savedSession;
  }

  const freshSession = {
    contextKey: getContextKey(context),
    currentIndex: 0,
    questions,
    answers: [],
    totalScore: 0,
  };

  saveInterviewSession(freshSession);
  return freshSession;
}

function getSafeCurrentIndex(session) {
  const firstPendingIndex = session.questions.findIndex((_, index) => !session.answers[index]);

  if (firstPendingIndex === -1) {
    return session.questions.length - 1;
  }

  return Math.min(session.currentIndex || 0, firstPendingIndex);
}

function bindStaticContext(context) {
  document.getElementById("interviewTechnology").textContent = capitalize(context.technology);
  document.getElementById("interviewModule").textContent = context.topic;
  document.getElementById("interviewTechnologyIcon").textContent = context.technology.slice(0, 2).toUpperCase();
}

function bindLanguageSelector(context, user) {
  const languageSelect = document.getElementById("interviewLanguageSelect");

  if (!languageSelect) {
    return;
  }

  languageSelect.innerHTML = getInterviewLanguageOptions()
    .map(
      (option) =>
        `<option value="${option.id}" ${Number(context.languageId) === option.id ? "selected" : ""}>${option.label}</option>`
    )
    .join("");

  // Rehace la entrevista al cambiar el idioma para que las preguntas correspondan a la seleccion actual.
  languageSelect.addEventListener("change", () => {
    const nextLanguageId = Number(languageSelect.value || user?.id_language || 1);
    setInterviewLanguagePreference(nextLanguageId);
    clearInterviewSession();
    saveInterviewContext({
      ...context,
      languageId: nextLanguageId,
    });
    window.location.reload();
  });

  const interviewUserMeta = document.getElementById("interviewUserMeta");

  if (interviewUserMeta) {
    const currentLevel = interviewUserMeta.textContent.split("•")[0]?.trim() || "";
    interviewUserMeta.textContent = `${currentLevel} • ${getInterviewLanguageName(Number(context.languageId))}`;
  }
}

function bindExitAction() {
  document.getElementById("backToDashboard")?.addEventListener("click", () => {
    window.location.href = "../pages/dashboard.html";
  });
}

function bindInterviewActions(session, context) {
  const submitButton = document.getElementById("submitAnswer");
  const nextButton = document.getElementById("nextQuestion");
  const answerInput = document.getElementById("answerInput");

  submitButton?.addEventListener("click", async () => {
    const answer = answerInput.value.trim();

    if (!answer) {
      answerInput.focus();
      return;
    }

    const currentQuestion = session.questions[session.currentIndex];
    const evaluation = await evaluateInterviewAnswer({
      question: currentQuestion,
      answer,
      context,
    });

    session.answers[session.currentIndex] = {
      questionId: currentQuestion.id_question,
      answer,
      evaluation,
    };

    session.totalScore = calculateAverageScore(session.answers);
    saveInterviewSession(session);
    renderFeedback(evaluation);

    submitButton.hidden = true;
    nextButton.hidden = false;
    answerInput.disabled = true;
  });

  nextButton?.addEventListener("click", () => {
    if (!session.answers[session.currentIndex]) {
      return;
    }

    if (session.currentIndex < session.questions.length - 1) {
      session.currentIndex += 1;
      saveInterviewSession(session);
      renderCurrentQuestion(session, context);
      return;
    }

    renderInterviewSummary(session);
  });
}

function renderCurrentQuestion(session, context) {
  if (session.answers.filter(Boolean).length === session.questions.length) {
    renderInterviewSummary(session);
    return;
  }

  const question = session.questions[session.currentIndex];
  const existingAnswer = session.answers[session.currentIndex];
  const answerInput = document.getElementById("answerInput");
  const submitButton = document.getElementById("submitAnswer");
  const nextButton = document.getElementById("nextQuestion");

  document.getElementById("questionText").textContent = question.question_text;
  document.getElementById("questionLevel").textContent = mapDifficultyLabel(context.difficulty);
  document.getElementById("questionPoints").textContent = `${getQuestionPoints(context.difficulty)} pts`;
  document.getElementById("interviewCounter").textContent = `${session.currentIndex + 1}/${session.questions.length}`;
  document.getElementById("interviewProgressBar").style.width = `${((session.currentIndex + 1) / session.questions.length) * 100}%`;

  answerInput.value = existingAnswer?.answer || "";
  answerInput.disabled = Boolean(existingAnswer);
  submitButton.hidden = Boolean(existingAnswer);
  nextButton.hidden = !existingAnswer;

  if (existingAnswer) {
    renderFeedback(existingAnswer.evaluation);
  } else {
    resetFeedback();
  }
}

function renderFeedback(evaluation) {
  document.getElementById("feedbackBadge").textContent = "Reviewed";
  document.getElementById("feedbackScore").textContent = String(evaluation.score);
  document.getElementById("feedbackLevel").textContent = evaluation.estimatedLevel;
  document.getElementById("feedbackText").textContent = evaluation.feedback;
}

function resetFeedback() {
  document.getElementById("feedbackBadge").textContent = "Pending";
  document.getElementById("feedbackScore").textContent = "0";
  document.getElementById("feedbackLevel").textContent = "Sin evaluar";
  document.getElementById("feedbackText").textContent =
    "Responde la pregunta actual para generar retroalimentacion y estimar el nivel.";
}

function renderInterviewSummary(session) {
  document.getElementById("questionText").textContent = "Interview completed";
  document.getElementById("questionLevel").textContent = "summary";
  document.getElementById("questionPoints").textContent = `${session.totalScore} avg`;
  document.getElementById("feedbackBadge").textContent = "Completed";
  document.getElementById("feedbackScore").textContent = String(session.totalScore);
  document.getElementById("feedbackLevel").textContent = getGlobalLevel(session.totalScore);
  document.getElementById("feedbackText").textContent =
    "La sesion quedo guardada en sessionStorage. El siguiente paso natural es reemplazar la evaluacion local por un endpoint con IA.";
  document.getElementById("answerInput").disabled = true;
  document.getElementById("submitAnswer").hidden = true;
  document.getElementById("nextQuestion").hidden = true;
}

function renderFatalState(message) {
  document.getElementById("questionText").textContent = message;
  document.getElementById("feedbackText").textContent =
    "No fue posible iniciar la entrevista con la informacion disponible.";
  document.getElementById("submitAnswer").disabled = true;
  document.getElementById("answerInput").disabled = true;
}

function calculateAverageScore(answers) {
  const validAnswers = answers.filter(Boolean);

  if (!validAnswers.length) {
    return 0;
  }

  const total = validAnswers.reduce((accumulator, answer) => accumulator + answer.evaluation.score, 0);
  return Math.round(total / validAnswers.length);
}

function getGlobalLevel(score) {
  if (score >= 85) {
    return "Advanced";
  }

  if (score >= 65) {
    return "Intermediate";
  }

  return "Beginner";
}

function getContextKey(context) {
  return `${context.technology}:${context.topic}:${context.difficulty}`;
}

function getQuestionPoints(difficulty) {
  switch (difficulty) {
    case "advanced":
      return 20;
    case "intermediate":
      return 15;
    default:
      return 10;
  }
}

function mapDifficultyLabel(difficulty) {
  switch (difficulty) {
    case "advanced":
      return "advanced";
    case "intermediate":
      return "intermediate";
    default:
      return "beginner";
  }
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
