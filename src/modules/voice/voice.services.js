/**
 * voice.services.js
 *
 * Servicio de evaluación de entrevistas usando la API de OpenAI directamente.
 * Ya no depende de n8n — llama a GPT-4o-mini para evaluar respuestas y generar feedback.
 *
 * Dos modos:
 *  - is_final: false → no hace nada (scoring local en el frontend)
 *  - is_final: true  → evalúa TODAS las respuestas de una vez y devuelve
 *                       puntajes individuales + feedback global en un solo JSON
 *
 * Variable de entorno requerida:
 *   OPENAI_API_KEY → clave de API de OpenAI
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'
const MODEL = 'gpt-4o-mini'

function getOpenAIKey() {
  return process.env.OPENAI_API_KEY || null
}

/**
 * Llama a la API de OpenAI con los mensajes dados.
 * Retorna el texto de la respuesta del modelo.
 */
async function callOpenAI({ systemPrompt, userMessage, maxTokens = 1200, temperature = 0.4 }) {
  const apiKey = getOpenAIKey()
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY no está configurada en las variables de entorno.')
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      temperature,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenAI error ${response.status}: ${err}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

/**
 * Parsea el JSON que devuelve el modelo.
 * El modelo a veces envuelve el JSON en bloques de markdown (```json ... ```)
 * así que los limpiamos antes de parsear.
 */
function parseModelJSON(raw) {
  const cleaned = raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim()

  const match = cleaned.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No se encontró JSON en la respuesta del modelo.')
  return JSON.parse(match[0])
}

/**
 * Evalúa todas las respuestas de la entrevista de una sola llamada a GPT.
 * Devuelve puntajes individuales, razones y feedback global.
 *
 * @param {Object} body - Payload is_final enviado desde el frontend
 * @returns {Object} Resultado con evaluaciones individuales y feedback global
 */
export async function evaluateFullInterview(body) {
  const {
    technology = '',
    topic = '',
    difficulty = '',
    nivelEstimado = '',
    respuestasDetalladas = [],
    respuestas = [],
  } = body

  const answers = respuestasDetalladas.length > 0 ? respuestasDetalladas : respuestas

  const systemPrompt = `Eres NOVA, evaluadora técnica de la Plataforma Mahoraga.
Recibes el historial completo de una entrevista técnica y debes hacer DOS cosas:

1. Evaluar CADA respuesta individualmente con métricas (0-100) y una razón específica.
2. Generar un feedback GLOBAL motivador sobre el desempeño del candidato.

REGLAS ESTRICTAS:
- Responde ÚNICAMENTE con JSON válido. Sin markdown, sin texto antes o después.
- Todos los puntajes son enteros entre 0 y 100.
- puntaje_final: promedio de los puntajes individuales.
- razon en cada evaluación: 1-2 oraciones en español, dirigidas al candidato en segunda persona. NUNCA vacío.
- fortalezas, debilidades, recomendaciones: mínimo 2 items cada uno, concretos y específicos.
- feedback: 2-3 frases motivadoras dirigidas al candidato en segunda persona.

FORMATO EXACTO (sin texto adicional):
{
  "puntaje_final": 65,
  "evaluaciones": [
    {
      "orden": 1,
      "puntaje": 70,
      "correctness": 70,
      "depth": 60,
      "clarity": 75,
      "relevance": 70,
      "examples": 40,
      "razon": "Tu respuesta menciona los casos de uso más comunes, aunque podrías profundizar más en las características del lenguaje."
    }
  ],
  "fortalezas": ["Fortaleza concreta 1", "Fortaleza concreta 2"],
  "debilidades": ["Área de mejora concreta 1", "Área de mejora concreta 2"],
  "recomendaciones": ["Acción específica 1", "Acción específica 2"],
  "feedback": "Texto motivador de 2-3 frases dirigido al candidato."
}`

  const answersText = answers.map((a, i) => {
    const orden = a.orden ?? i + 1
    const pregunta = a.pregunta || `Pregunta ${orden}`
    const respuesta = a.respuesta || a.answer || '(sin respuesta)'
    return `Pregunta ${orden}: ${pregunta}\nRespuesta: ${respuesta}`
  }).join('\n\n')

  const userMessage = `Tecnología: ${technology}
Tema: ${topic}
Dificultad: ${difficulty}
Nivel estimado del candidato: ${nivelEstimado}

Preguntas y respuestas:
${answersText}`

  console.log('[OpenAI] Enviando evaluación final a GPT...')
  const raw = await callOpenAI({ systemPrompt, userMessage, maxTokens: 1200, temperature: 0.4 })
  console.log('[OpenAI] Respuesta cruda recibida:', raw.substring(0, 300))

  const parsed = parseModelJSON(raw)
  console.log('[OpenAI] Evaluación parseada correctamente. puntaje_final:', parsed.puntaje_final)
  return parsed
}
