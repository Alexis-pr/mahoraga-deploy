/**
 * n8nBridge.js
 * 
 * Puente de comunicación entre el frontend y el workflow de n8n.
 * 
 * Este módulo se encarga de:
 *  - Construir los payloads que se envían a n8n para evaluación de respuestas
 *  - Enviar la respuesta individual de cada pregunta para que la IA la evalúe en tiempo real
 *  - Enviar el paquete final de la entrevista para generar el feedback global
 *  - Extraer y transformar las respuestas de la sesión en distintos formatos
 * 
 * Flujo principal:
 *   Usuario responde → buildN8nAnswerPayload() → sendN8nAnswer() → n8n → GPT → score + razon
 *   Entrevista termina → payload is_final:true → n8n → GPT → feedback global
 */

import { API_BASE_URL } from "./apiConfig.js";
import { getLoggedInUser } from "./sessionService.js";
import { getInterviewContext, getInterviewSession } from "./interviewService.js";

/**
 * Extrae las respuestas en formato clave-valor
 * Clave: Pregunta (texto)
 * Valor: Respuesta del usuario (texto)
 * @param {Object} session - Sesión de entrevista
 * @param {Object} context - Contexto de la entrevista
 * @returns {Object} Objeto con preguntas como claves y respuestas como valores
 */
export function extractAnswersAsKeyValuePairs({ session, context }) {
  const respuestasObjeto = {};

  if (!session?.questions || !session?.answers) {
    return respuestasObjeto;
  }

  session.questions.forEach((question, index) => {
    const entry = session.answers[index] || {};
    const preguntaTexto = question?.question_text ?? `Pregunta ${index + 1}`;
    const respuestaTexto = entry.answer ?? "";

    respuestasObjeto[preguntaTexto] = respuestaTexto;
  });

  return respuestasObjeto;
}

/**
 * Extrae las respuestas en formato detallado con metadatos
 * @param {Object} session - Sesión de entrevista
 * @param {Object} context - Contexto de la entrevista
 * @returns {Array} Array de objetos con detalles de cada respuesta
 */
export function extractDetailedAnswers({ session, context }) {
  const respuestasDetalladas = [];

  if (!session?.questions || !session?.answers) {
    return respuestasDetalladas;
  }

  session.questions.forEach((question, index) => {
    const entry = session.answers[index] || {};
    respuestasDetalladas.push({
      orden: index + 1,
      pregunta: question?.question_text ?? `Pregunta ${index + 1}`,
      respuesta: entry.answer ?? "",
      puntaje: entry.score ?? entry.puntaje ?? 0,
      razon: entry.reason ?? entry.razon ?? "",
      id_question: question?.id_question ?? null,
      id_question_instance: question?.id_question_instance ?? null,
    });
  });

  return respuestasDetalladas;
}

export function extractInterviewAnswers({ session, context }) {
  const answers = (session?.answers || []).filter(Boolean);

  return answers.map((entry, index) => {
    const question = session?.questions?.[index];
    return {
      order_num: index + 1,
      id_question: entry?.questionId ?? question?.id_question ?? null,
      question_text: question?.question_text ?? "",
      answer: entry?.answer ?? "",
      pregunta: question?.question_text ?? "",
      respuesta: entry?.answer ?? "",
      puntaje: entry?.score ?? entry?.puntaje ?? 0,
      razon: entry?.reason ?? entry?.razon ?? "",
    };
  });
}

/**
 * Construye el payload estándar para enviar una respuesta individual a n8n.
 * Incluye aliases en inglés (question/answer) para compatibilidad con validaciones en n8n.
 * 
 * @param {Object} params
 * @param {string} params.id_session - ID de la sesión de entrevista
 * @param {number} params.id_question_instance - ID de la instancia de la pregunta
 * @param {number} params.id_user - ID del usuario
 * @param {number} params.order_num - Número de orden de la pregunta (1-5)
 * @param {number} params.id_question - ID de la pregunta en la base de datos
 * @param {string} params.pregunta - Texto de la pregunta
 * @param {string} params.texto - Respuesta escrita del usuario
 * @param {Blob|null} params.audio - Audio grabado (si aplica)
 * @param {string} params.mode - "evaluate" para texto, "transcribe" para audio
 * @returns {Object} Payload listo para enviar a n8n
 */
export function buildN8nAnswerPayload({
  id_session,
  id_question_instance,
  id_user,
  order_num,
  id_question,
  pregunta,
  texto,
  audio,
  mode,
}) {
  return {
    id_session,
    id_question_instance,
    id_user,
    order_num,
    id_question,
    pregunta,
    texto,
    // Aliases to satisfacer validaciones en n8n (en caso de que espere keys en inglés)
    question: pregunta,
    answer: texto,
    audio,
    mode,
  };
}

/**
 * Garantiza que exista un ID de sesión de entrevista antes de enviar respuestas.
 * Si el contexto ya tiene un id_session, lo reutiliza sin crear uno nuevo.
 * Si no existe, crea una nueva sesión en el backend y guarda el ID en el contexto.
 * 
 * @param {Object} params
 * @param {Object} params.context - Contexto de la entrevista (tecnología, tema, dificultad)
 * @param {Object} params.user - Usuario autenticado
 * @returns {{ id_session: string|null, created: boolean, error?: string }}
 */
export async function ensureInterviewSessionId({ context, user } = {}) {
  const resolvedContext = context || getInterviewContext();
  const resolvedUser = user || getLoggedInUser();

  const existingSessionId =
    resolvedContext?.id_session ||
    resolvedContext?.sessionId ||
    resolvedContext?.session_id ||
    null;

  if (existingSessionId) {
    return { id_session: existingSessionId, created: false };
  }

  if (!resolvedUser?.id_user) {
    return { id_session: null, created: false, error: "missing_id_user" };
  }

  const payload = {
    id_user: resolvedUser.id_user,
    id_topic: resolvedContext?.id_topic ?? resolvedContext?.nodeId ?? null,
    id_level: resolvedUser.id_level,
    session_status: "active",
    date_ini: new Date().toISOString(),
  };

  const response = await fetch(`${API_BASE_URL}/interview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    return { id_session: null, created: false, error: text || "create_session_failed" };
  }

  const data = await response.json();
  const interview = data?.interview || data?.session || data;

  const newId =
    interview?.id_session ??
    interview?.sessionId ??
    interview?.id ??
    null;

  // Si lo obtenemos, lo guardamos de vuelta en el contexto para no recrear sesiones
  if (newId && resolvedContext) {
    resolvedContext.id_session = newId;
    resolvedContext.sessionId = newId;
    saveInterviewContext(resolvedContext);
  }

  return {
    id_session: newId,
    created: true,
    raw: data,
  };
}

/**
 * Envía el payload de respuesta (o el resumen final) al endpoint /voice/feedback del backend,
 * que lo reenvía al webhook de n8n.
 * 
 * - Si viene audioBlob, envía como FormData (multipart) para que n8n transcriba el audio
 * - Si no, envía como JSON para evaluación directa del texto
 * 
 * El backend actúa como proxy y agrega las cabeceras de autenticación de n8n.
 * 
 * @param {Object} params
 * @param {Object} params.payload - Datos de la respuesta o del resumen final
 * @param {Blob|null} params.audioBlob - Audio grabado (opcional)
 * @returns {Promise<Object>} Respuesta de n8n con puntaje, razón y métricas
 */
export async function sendN8nAnswer({ payload, audioBlob } = {}) {
  if (!payload) {
    throw new Error("missing_payload");
  }

  // Debug: Log payload before sending
  console.log("[n8nBridge] Final payload being sent:", JSON.stringify(payload, null, 2));
  console.log("[n8nBridge] Payload keys:", Object.keys(payload));
  console.log("[n8nBridge] id_session value:", payload.id_session);
  console.log("[n8nBridge] id_user value:", payload.id_user);
  console.log("[n8nBridge] order_num value:", payload.order_num);
  console.log("[n8nBridge] id_question value:", payload.id_question);

  let response;

  if (audioBlob) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    formData.append("audio", audioBlob, "answer.webm");

    response = await fetch(`${API_BASE_URL}/voice/feedback`, {
      method: "POST",
      body: formData,
    });
  } else {
    const fetchOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    };
    
    console.log("[n8nBridge] Fetch options:", {
      method: fetchOptions.method,
      url: `${API_BASE_URL}/voice/feedback`,
      headers: fetchOptions.headers,
      bodyPreview: typeof payload === 'string' ? payload.substring(0, 200) : JSON.stringify(payload).substring(0, 200)
    });
    
    response = await fetch(`${API_BASE_URL}/voice/feedback`, fetchOptions);
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.toLowerCase().includes("application/json");

  if (!response.ok) {
    const errorBody = isJson ? await response.json() : await response.text();
    throw new Error(
      typeof errorBody === "string" ? errorBody : errorBody?.mensaje || "n8n_request_failed"
    );
  }

  return isJson ? await response.json() : await response.arrayBuffer();
}

/**
 * Genera un prompt detallado para que n8n/IA analice la entrevista de forma general
 * @param {Object} params - Parámetros para generar el prompt
 * @returns {string} Prompt estructurado para análisis de IA
 */
export function buildInterviewAnalysisPrompt({
  technology,
  topic,
  difficulty,
  respuestasObjeto,
  respuestasDetalladas,
  scorePromedio,
  nivelEstimado,
  language = "es",
} = {}) {
  const isSpanish = language === "es" || language === 1;

  if (isSpanish) {
    return `
## Análisis General de Entrevista Técnica

### Contexto
- **Tecnología Evaluada:** ${technology}
- **Tema:** ${topic}
- **Dificultad:** ${difficulty}
- **Puntaje Promedio Inicial:** ${scorePromedio}%
- **Nivel Estimado Inicial:** ${nivelEstimado}

### Preguntas y Respuestas Completas
${JSON.stringify(respuestasObjeto, null, 2)}

### Instrucciones de Análisis - RETORNA SOLO JSON

Analiza el conjunto COMPLETO de preguntas y respuestas de forma hoística (NO respuesta por respuesta).

**RETORNA ÚNICAMENTE UN OBJETO JSON (sin texto adicional) con esta estructura exacta:**

\`\`\`json
{
  "score": 75,
  "feedback": "Análisis general de 2-3 párrafos que incluya: nivel real del candidato, fortalezas identificadas con ejemplos específicos, áreas de mejora concretas, y recomendaciones para mejorar."
}
\`\`\`

**Criterios de Calificación (1-100):**
- 85-100: Dominio avanzado, respuestas profundas, coherentes y con vocabulario técnico adecuado
- 65-84: Dominio intermedio, buena comprensión pero con áreas por mejorar
- 45-64: Dominio básico, respuestas superficiales o incompletas
- 0-44: Conocimiento muy limitado, respuestas confusas o incorrectas

**IMPORTANTE:**
- NO evalúes cada respuesta por separado
- Analiza la coherencia y consistencia del conocimiento
- Proporciona UN ÚNICO feedback general basado en patrones observados
- Retorna SOLO el JSON válido, sin explicaciones, texto adicional o markdown
`;
  }

  return `
## Technical Interview General Analysis

### Context
- **Technology Evaluated:** ${technology}
- **Topic:** ${topic}
- **Difficulty:** ${difficulty}
- **Initial Average Score:** ${scorePromedio}%
- **Estimated Level:** ${nivelEstimado}

### Complete Questions and Answers
${JSON.stringify(respuestasObjeto, null, 2)}

### Analysis Instructions - RETURN ONLY JSON

Analyze the COMPLETE set of questions and answers holistically (NOT answer by answer).

**RETURN ONLY A JSON OBJECT (no additional text) with this exact structure:**

\`\`\`json
{
  "score": 75,
  "feedback": "General analysis of 2-3 paragraphs including: candidate's real level, identified strengths with specific examples, concrete areas for improvement, and recommendations to enhance performance."
}
\`\`\`

**Scoring Criteria (1-100):**
- 85-100: Advanced mastery, deep and coherent responses with appropriate technical vocabulary
- 65-84: Intermediate mastery, good understanding but with areas for improvement
- 45-64: Basic mastery, superficial or incomplete responses
- 0-44: Very limited knowledge, confused or incorrect responses

**IMPORTANT:**
- DO NOT evaluate each response separately
- Analyze coherence and consistency of knowledge
- Provide ONE SINGLE general feedback based on observed patterns
- Return ONLY valid JSON, no explanations, additional text or markdown
`;
}

export function getN8nExtractionSnapshot() {
  const context = getInterviewContext();
  const session = getInterviewSession();
  const user = getLoggedInUser();

  return {
    context,
    session,
    user,
    answers: extractInterviewAnswers({ session, context }),
  };
}
