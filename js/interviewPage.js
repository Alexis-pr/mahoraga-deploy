import {
  clearInterviewSession,
  createInterviewSession,
  evaluateInterviewSession,
  fetchInterviewQuestions,
  getInterviewContext,
  getInterviewSession,
  saveInterviewQuestionInstances,
  saveInterviewContext,
  saveInterviewSession,
  saveQuestionAnswered,
  endInterviewSession,
} from "./services/interviewService.js";
import { getN8nExtractionSnapshot, sendN8nAnswer, buildN8nAnswerPayload, ensureInterviewSessionId, extractAnswersAsKeyValuePairs, extractDetailedAnswers, buildInterviewAnalysisPrompt } from "./services/n8nBridge.js";
import {
  getInterviewLanguageName,
  getInterviewLanguageOptions,
  getInterviewLanguagePreference,
  getLoggedInUser,
  requireLoggedInUser,
  setInterviewLanguagePreference,
} from "./services/sessionService.js";
import { initInterviewIdentity } from "./ui/userIdentity.js";

// Calcula puntaje ponderado según nivel y métricas devueltas por IA
function calcularPuntaje(metrics, nivel = "mid") {
  if (!metrics) return { puntaje: null, aprobado: false, nivel_respuesta: "Sin datos" };

  const pesos = {
    junior: { correctness: 0.40, depth: 0.15, clarity: 0.25, relevance: 0.15, examples: 0.05 },
    mid:    { correctness: 0.35, depth: 0.25, clarity: 0.20, relevance: 0.15, examples: 0.05 },
    senior: { correctness: 0.25, depth: 0.40, clarity: 0.15, relevance: 0.15, examples: 0.05 },
  };

  const w = pesos[nivel] || pesos.mid;

  const puntaje = Math.round(
    (metrics.correctness || 0) * w.correctness +
    (metrics.depth || 0)       * w.depth +
    (metrics.clarity || 0)     * w.clarity +
    (metrics.relevance || 0)   * w.relevance +
    (metrics.examples || 0)    * w.examples
  );

  const aprobado = puntaje >= 60 && (metrics.correctness || 0) >= 50;
  const nivel_respuesta =
    puntaje >= 85 ? "Excelente" :
    puntaje >= 70 ? "Bueno"     :
    puntaje >= 55 ? "Básico"    : "Insuficiente";

  return { puntaje, aprobado, nivel_respuesta };
}

function mapDifficultyToPesoLevel(difficulty) {
  if (difficulty === "advanced") return "senior";
  if (difficulty === "intermediate") return "mid";
  return "junior";
}

// Fallback: genera métricas aproximadas si el modelo no las envía
function buildFallbackMetrics(answerText = "") {
  const lengthScore = Math.max(20, Math.min(90, Math.round(answerText.trim().length / 3)));
  // Pequeña penalización si la respuesta es demasiado corta
  const base = answerText.trim().length < 20 ? 25 : lengthScore;
  return {
    correctness: base,
    depth: Math.max(20, Math.min(85, base - 5)),
    clarity: Math.max(20, Math.min(90, base + 5)),
    relevance: Math.max(20, Math.min(90, base)),
    examples: Math.max(10, Math.min(70, Math.round(base * 0.6))),
  };
}

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
  context.idUser = user.id_user;
  saveInterviewContext(context);

  initInterviewIdentity();
  bindStaticContext(context);
  bindLanguageSelector(context, user);
  bindExitAction();

  try {
    let sessionId = context.sessionId || getInterviewSession()?.sessionId || null;
    if (!sessionId) {
      const createdSession = await createInterviewSession({ context, user });
      sessionId = createdSession?.id_session || null;
      if (sessionId) {
        context.sessionId = sessionId;
        context.id_session = sessionId;
      }
      saveInterviewContext(context);
    }

    const questions = await fetchInterviewQuestions(context);
    const session = getInterviewSessionForContext(context, questions);
    if (sessionId && !session.sessionId) {
      session.sessionId = sessionId;
      saveInterviewSession(session);
      const savedInstances = await saveInterviewQuestionInstances({ id_session: sessionId, questions });
      // persist map of question instances for later lookups
      if (savedInstances?.created || Array.isArray(savedInstances)) {
        const instances = savedInstances.created || savedInstances;
        session.questionInstances = instances;
        saveInterviewSession(session);
      }
    }
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

    const submitted = await handleTextSubmission({ session, context, answer });
    if (!submitted) {
      return;
    }

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

  initVoiceRecorder({ session, context });
}

async function handleTextSubmission({ session, context, answer }) {
  const submitButton = document.getElementById("submitAnswer");
  const nextButton = document.getElementById("nextQuestion");
  const answerInput = document.getElementById("answerInput");

  setSubmissionState({ busy: true });
  submitButton?.setAttribute("disabled", "true");
  nextButton?.setAttribute("disabled", "true");
  answerInput?.setAttribute("disabled", "true");

  try {
    const storedUser = getLoggedInUser();
    const id_user = storedUser?.id_user ?? context?.idUser ?? context?.id_user ?? null;
    const currentQuestion = session.questions[session.currentIndex];
    const id_question_instance =
      currentQuestion?.id_question_instance ??
      session?.questionInstances?.[session.currentIndex]?.id_question_instance ??
      session?.questionInstances?.[currentQuestion?.id_question] ??
      session.currentIndex + 1;
    if (!id_question_instance) throw new Error("Falta id_question_instance");

    const response = await submitToN8n({
      session,
      context,
      answerText: answer,
      audioBlob: null,
    });

    const resolvedText = response?.texto ?? answer;
    let metrics = response?.metrics || null;
    if (!metrics || Object.values(metrics).every((v) => v === 0)) {
      metrics = buildFallbackMetrics(resolvedText);
    }
    const pesoLevel = mapDifficultyToPesoLevel(context.difficulty);
    const weighted = calcularPuntaje(metrics, pesoLevel);
    session.answers[session.currentIndex] = {
      questionId: currentQuestion.id_question,
      id_question_instance,
      answer: resolvedText,
      score: response?.puntaje ?? weighted.puntaje ?? null,
      reason: response?.razon ?? null,
      metrics,
      nivel_respuesta: weighted.nivel_respuesta,
      aprobado: weighted.aprobado,
    };

    saveInterviewSession(session);
    // persist answered question
    try {
      await saveQuestionAnswered({
        id_user,
        id_question_instance,
        answer: resolvedText,
        score: session.answers[session.currentIndex].score ?? 0,
        feedback: session.answers[session.currentIndex].reason ?? "Sin feedback",
        answered_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn("No se pudo guardar question_answered:", err?.message || err);
    }
    renderPendingReview(session, response);
    const voiceButton = document.getElementById("voiceRecordButton");
    if (voiceButton) voiceButton.disabled = true;
    return true;
  } catch (error) {
    renderErrorState(error?.message || "No se pudo enviar la respuesta.");
    answerInput?.removeAttribute("disabled");
    return false;
  } finally {
    setSubmissionState({ busy: false });
    submitButton?.removeAttribute("disabled");
    nextButton?.removeAttribute("disabled");
  }
}

async function handleAudioSubmission({ session, context, audioBlob }) {
  if (!audioBlob) return false;

  const submitButton = document.getElementById("submitAnswer");
  const nextButton = document.getElementById("nextQuestion");
  const answerInput = document.getElementById("answerInput");
  const voiceStatus = document.getElementById("voiceStatus");

  setSubmissionState({ busy: true });
  submitButton?.setAttribute("disabled", "true");
  nextButton?.setAttribute("disabled", "true");
  answerInput?.setAttribute("disabled", "true");

  if (voiceStatus) {
    voiceStatus.textContent = "Procesando audio...";
  }

  try {
    const storedUser = getLoggedInUser();
    const id_user = storedUser?.id_user ?? context?.idUser ?? context?.id_user ?? null;
    const currentQuestion = session.questions[session.currentIndex];
    const id_question_instance =
      currentQuestion?.id_question_instance ??
      session?.questionInstances?.[session.currentIndex]?.id_question_instance ??
      session?.questionInstances?.[currentQuestion?.id_question] ??
      session.currentIndex + 1;
    if (!id_question_instance) throw new Error("Falta id_question_instance");

    const response = await submitToN8n({
      session,
      context,
      answerText: answerInput?.value?.trim() || "",
      audioBlob,
    });

    const resolvedText = response?.texto || answerInput?.value?.trim() || "";
    let metrics = response?.metrics || null;
    if (!metrics || Object.values(metrics).every((v) => v === 0)) {
      metrics = buildFallbackMetrics(resolvedText);
    }
    const pesoLevel = mapDifficultyToPesoLevel(context.difficulty);
    const weighted = calcularPuntaje(metrics, pesoLevel);

    if (answerInput) {
      answerInput.value = resolvedText;
      answerInput.disabled = true;
    }

    session.answers[session.currentIndex] = {
      questionId: currentQuestion.id_question,
      id_question_instance,
      answer: resolvedText,
      score: response?.puntaje ?? weighted.puntaje ?? null,
      reason: response?.razon ?? null,
      metrics,
      nivel_respuesta: weighted.nivel_respuesta,
      aprobado: weighted.aprobado,
    };

    saveInterviewSession(session);
    renderPendingReview(session, response);

    // persist answered question
    try {
      await saveQuestionAnswered({
        id_user,
        id_question_instance,
        answer: resolvedText,
        score: session.answers[session.currentIndex].score ?? 0,
        feedback: session.answers[session.currentIndex].reason ?? "Sin feedback",
        answered_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn("No se pudo guardar question_answered:", err?.message || err);
    }

    const submitAnswer = document.getElementById("submitAnswer");
    const nextQuestion = document.getElementById("nextQuestion");
    const voiceButton = document.getElementById("voiceRecordButton");
    if (voiceButton) voiceButton.disabled = true;
    if (submitAnswer && nextQuestion) {
      submitAnswer.hidden = true;
      nextQuestion.hidden = false;
    }

    return true;
  } catch (error) {
    renderErrorState(error?.message || "No se pudo transcribir el audio.");
    if (answerInput) answerInput.disabled = false;
    return false;
  } finally {
    setSubmissionState({ busy: false });
    submitButton?.removeAttribute("disabled");
    nextButton?.removeAttribute("disabled");
    if (voiceStatus) {
      voiceStatus.textContent = "Click para grabar tu respuesta";
    }
  }
}

async function submitToN8n({ session, context, answerText, audioBlob }) {
  const currentQuestion = session.questions[session.currentIndex];
  const storedUser = getLoggedInUser();
  const fallbackUser = storedUser || {
    id_user: context?.idUser ?? context?.id_user ?? null,
  };
  const ensured = await ensureInterviewSessionId({ context, user: fallbackUser });
  const id_session =
    ensured?.id_session ||
    context?.sessionId ||
    context?.id_session ||
    session?.sessionId ||
    null;
  const id_question_instance =
    currentQuestion?.id_question_instance ??
    session?.questionInstances?.find?.((qi) => qi.id_question === currentQuestion?.id_question)?.id_question_instance ??
    session?.questionInstances?.find?.((qi) => qi.order_num === session.currentIndex + 1)?.id_question_instance ??
    session?.questionInstances?.[session.currentIndex]?.id_question_instance ??
    null;
  const missing = [];
  if (!id_session) missing.push("id_session");
  if (!fallbackUser?.id_user) missing.push("id_user");
  if (!currentQuestion?.id_question) missing.push("id_question");
  if (!id_question_instance) missing.push("id_question_instance");
  if (missing.length) {
    throw new Error(`Faltan campos obligatorios: ${missing.join(", ")}`);
  }

  const payload = buildN8nAnswerPayload({
    id_session,
    id_question_instance,
    id_user: fallbackUser?.id_user ?? null,
    order_num: session.currentIndex + 1,
    id_question: currentQuestion?.id_question ?? null,
    pregunta: currentQuestion?.question_text ?? "",
    texto: answerText || "",
    audio: null,
  });

  console.log("[n8n] Enviando payload a n8n", {
    ...payload,
    hasAudio: Boolean(audioBlob),
    audioSize: audioBlob?.size || 0,
  });

  const n8nResponse = await sendN8nAnswer({ payload, audioBlob });

  console.log("[n8n] Respuesta recibida de n8n", n8nResponse);

  return n8nResponse;
}

function setSubmissionState({ busy }) {
  const voiceButton = document.getElementById("voiceRecordButton");
  if (voiceButton) {
    voiceButton.classList.toggle("is-busy", Boolean(busy));
    voiceButton.disabled = Boolean(busy);
  }
}

function initVoiceRecorder({ session, context }) {
  const voiceButton = document.getElementById("voiceRecordButton");
  const voiceStatus = document.getElementById("voiceStatus");

  if (!voiceButton || !voiceStatus) return;

  const hasSupport = Boolean(navigator.mediaDevices?.getUserMedia) && typeof MediaRecorder !== "undefined";
  if (!hasSupport) {
    voiceButton.disabled = true;
    voiceStatus.textContent = "Grabación de audio no disponible en este navegador.";
    return;
  }

  let mediaRecorder = null;
  let chunks = [];
  let isRecording = false;

  const setVoiceUi = (state) => {
    if (state === "recording") {
      voiceButton.classList.add("is-recording");
      voiceStatus.textContent = "Grabando... vuelve a presionar para detener";
    } else if (state === "processing") {
      voiceButton.classList.remove("is-recording");
      voiceButton.classList.add("is-busy");
      voiceStatus.textContent = "Procesando audio...";
    } else {
      voiceButton.classList.remove("is-recording", "is-busy");
      voiceStatus.textContent = "Click para grabar tu respuesta";
    }
  };

  voiceButton.addEventListener("click", async () => {
    if (isRecording) {
      mediaRecorder?.stop();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunks = [];
      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      });

      mediaRecorder.addEventListener("stop", async () => {
        stream.getTracks().forEach((track) => track.stop());
        isRecording = false;
        setVoiceUi("processing");

        const blob = new Blob(chunks, { type: mediaRecorder.mimeType || "audio/webm" });
        await handleAudioSubmission({ session, context, audioBlob: blob });

        setVoiceUi("idle");
      });

      isRecording = true;
      setVoiceUi("recording");
      mediaRecorder.start();
    } catch (error) {
      renderErrorState("No se pudo acceder al micrófono.");
      setVoiceUi("idle");
    }
  });
}

function renderCurrentQuestion(session, context) {
  if (session.answers.filter(Boolean).length === session.questions.length) {
    renderInterviewSummary(session, context);
    return;
  }

  const question = session.questions[session.currentIndex];
  const existingAnswer = session.answers[session.currentIndex];
  const answerInput = document.getElementById("answerInput");
  const submitButton = document.getElementById("submitAnswer");
  const nextButton = document.getElementById("nextQuestion");
  const voiceButton = document.getElementById("voiceRecordButton");
  const voiceStatus = document.getElementById("voiceStatus");

  document.getElementById("questionText").textContent = question.question_text;
  document.getElementById("questionLevel").textContent = mapDifficultyLabel(context.difficulty);
  document.getElementById("questionPoints").textContent = `${getQuestionPoints(context.difficulty)} pts`;
  document.getElementById("interviewCounter").textContent = `${session.currentIndex + 1}/${session.questions.length}`;
  document.getElementById("interviewProgressBar").style.width = `${((session.currentIndex + 1) / session.questions.length) * 100}%`;

  answerInput.value = existingAnswer?.answer || "";
  answerInput.disabled = Boolean(existingAnswer);
  submitButton.hidden = Boolean(existingAnswer);
  nextButton.hidden = !existingAnswer;
  nextButton.querySelector("span").textContent =
    session.currentIndex === session.questions.length - 1 ? "Finalizar entrevista" : "Siguiente pregunta";

  if (existingAnswer) {
    renderPendingReview(session);
  } else {
    resetFeedback();
  }

  if (voiceButton) {
    voiceButton.disabled = Boolean(existingAnswer);
    voiceButton.classList.remove("is-recording", "is-busy");
  }
  if (voiceStatus) {
    voiceStatus.textContent = existingAnswer ? "Respuesta guardada." : "Click para grabar tu respuesta";
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
    "Las respuestas se acumulan en la sesion y el feedback general se genera al finalizar la entrevista.";
}

function renderPendingReview(session) {
  document.getElementById("feedbackBadge").textContent = "Saved";
  document.getElementById("feedbackScore").textContent = String(session.answers.filter(Boolean).length);
  document.getElementById("feedbackLevel").textContent = "En espera";
  document.getElementById("feedbackText").textContent =
    "La respuesta se guardo. El feedback general se genera al finalizar la entrevista.";
}

function renderErrorState(message) {
  document.getElementById("feedbackBadge").textContent = "Error";
  document.getElementById("feedbackText").textContent = message;
}

async function renderInterviewSummary(session, context) {
  const summary = await evaluateInterviewSession({
    questions: session.questions,
    answers: session.answers,
    context,
  });

  session.totalScore = summary.score;
  session.summary = summary;
  saveInterviewSession(session);

  // Renderar UI base primero
  document.getElementById("questionText").textContent = "Interview completed";
  document.getElementById("questionLevel").textContent = "summary";
  document.getElementById("answerInput").disabled = true;
  document.getElementById("submitAnswer").hidden = true;
  document.getElementById("nextQuestion").hidden = true;

  let n8nScore = null;
  let n8nFeedback = null;

  try {
    const snapshot = getN8nExtractionSnapshot();
    const ensured = await ensureInterviewSessionId({ context: snapshot.context, user: snapshot.user });
    const id_session = ensured?.id_session || snapshot?.context?.id_session;

    if (id_session) {
      const endedAt = new Date().toISOString();
      try {
        await endInterviewSession({ id_session, date_fin: endedAt });
      } catch (err) {
        console.warn("No se pudo registrar la hora de cierre de la entrevista:", err?.message || err);
      }

      // Obtener respuestas en formato clave-valor y detallado
      const respuestasObjeto = extractAnswersAsKeyValuePairs({ session, context });
      const respuestasDetalladas = extractDetailedAnswers({ session, context });

      // Generar prompt mejorado para análisis general
      const promptAnalisis = buildInterviewAnalysisPrompt({
        technology: context?.technology ?? "unknown",
        topic: context?.topic ?? "unknown",
        difficulty: context?.difficulty ?? "beginner",
        respuestasObjeto,
        respuestasDetalladas,
        scorePromedio: summary.score,
        nivelEstimado: summary.estimatedLevel,
        language: context?.languageId ?? 1,
      });

      const payload = {
        id_session,
        id_user: snapshot?.user?.id_user || null,
        is_final: true,
        technology: context?.technology ?? "unknown",
        topic: context?.topic ?? "unknown",
        difficulty: context?.difficulty ?? "beginner",
        language: context?.languageId ?? 1,
        totalQuestions: session.questions.length,
        scorePromedio: summary.score,
        nivelEstimado: summary.estimatedLevel,
        respuestas: respuestasObjeto,
        respuestasDetalladas,
        prompt: promptAnalisis,
      };

      console.log("📊 Enviando análisis completo a n8n:", {
        id_session,
        technology: context?.technology,
        topic: context?.topic,
        totalQuestions: session.questions.length,
        scorePromedio: summary.score,
        nivelEstimado: summary.estimatedLevel,
        respuestasCount: Object.keys(respuestasObjeto).length,
        hasPrompt: Boolean(promptAnalisis),
      });

      try {
        const feedbackResponse = await sendN8nAnswer({ payload });

        // Procesar respuesta de n8n
        if (feedbackResponse) {
          // Si la respuesta es un JSON con score y feedback
          if (feedbackResponse.score !== undefined && feedbackResponse.feedback) {
            n8nScore = Number(feedbackResponse.score);
            n8nFeedback = feedbackResponse.feedback;
            console.log("✅ Análisis recibido de n8n:", { score: n8nScore, feedbackLength: n8nFeedback.length });
          }
          // Si es un string directo (feedback)
          else if (typeof feedbackResponse === 'string') {
            n8nFeedback = feedbackResponse;
          }
          // Si tiene propiedad feedback
          else if (feedbackResponse.feedback) {
            n8nFeedback = feedbackResponse.feedback;
            if (feedbackResponse.score) {
              n8nScore = Number(feedbackResponse.score);
            }
          }
          // Si tiene analisisGeneral
          else if (feedbackResponse.analisisGeneral) {
            n8nFeedback = feedbackResponse.analisisGeneral;
            if (feedbackResponse.score) {
              n8nScore = Number(feedbackResponse.score);
            }
          }
        }
      } catch (n8nError) {
        console.warn("⚠️ Error al obtener feedback de n8n:", n8nError);
      }
    } else {
      console.warn("No se pudo resolver id_session para n8n.");
    }
  } catch (error) {
    console.error("❌ Error en análisis de entrevista:", error);
  }

  // Renderizar los resultados (usando n8n si está disponible, sino summary)
  const finalScore = n8nScore !== null ? n8nScore : summary.score;
  const finalFeedback = n8nFeedback || summary.feedback;

  document.getElementById("questionPoints").textContent = `${finalScore} pts`;
  document.getElementById("feedbackBadge").textContent = "Completed";
  document.getElementById("feedbackScore").textContent = String(finalScore);
  document.getElementById("feedbackLevel").textContent = summary.estimatedLevel;
  document.getElementById("feedbackText").textContent = finalFeedback;
}

function renderFatalState(message) {
  document.getElementById("questionText").textContent = message;
  document.getElementById("feedbackText").textContent =
    "No fue posible iniciar la entrevista con la informacion disponible.";
  document.getElementById("submitAnswer").disabled = true;
  document.getElementById("answerInput").disabled = true;
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
