/**
 * voice.controller.js
 *
 * Controlador del endpoint POST /api/voice/feedback.
 *
 * Lógica:
 *  - Si is_final === false (respuesta individual): devuelve éxito vacío inmediatamente.
 *    El scoring ya se hace localmente en el frontend — no gastamos tokens en cada respuesta.
 *
 *  - Si is_final === true (fin de entrevista): llama a OpenAI con todas las respuestas
 *    y devuelve evaluaciones individuales + feedback global en un solo JSON.
 */

import { evaluateFullInterview } from './voice.services.js'

export const voiceFeedbackReq = async (req, res) => {
  const body = req.body || {}

  console.log('[voice] POST /feedback — is_final:', body?.is_final)

  // Respuesta individual — scoring local en el frontend, no hacemos nada aquí
  if (!body.is_final) {
    return res.status(200).json({
      texto: body.texto || body.answer || '',
      puntaje: null,   // el frontend calculará localmente
      razon: '',
      metrics: null,
      continuar: true,
    })
  }

  // Fin de entrevista — evaluar todo con IA
  try {
    const resultado = await evaluateFullInterview(body)
    return res.status(200).json(resultado)
  } catch (error) {
    console.error('[voice] Error al evaluar con OpenAI:', error.message)

    // Si falla la IA, devolvemos un error claro (no un mock silencioso)
    return res.status(500).json({
      error: 'openai_evaluation_failed',
      mensaje: error.message || 'No se pudo evaluar la entrevista con IA.',
    })
  }
}
