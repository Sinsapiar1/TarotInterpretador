import { GoogleGenerativeAI } from '@google/generative-ai'

const VISION_MODELS = [
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', tier: 'latest' },
  { id: 'gemini-2.5-flash-preview-05-20', label: 'Gemini 2.5 Flash Preview', tier: 'latest' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', tier: 'fast' },
  { id: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Exp)', tier: 'fast' },
  { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', tier: 'pro' },
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', tier: 'fast' },
]

function isAuthError(msg) {
  return msg.includes('API_KEY_INVALID') || msg.includes('401') || msg.includes('403')
}

function isSkippableError(msg) {
  return (
    msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('404') || msg.includes('is not found') || msg.includes('not supported')
  )
}

// Tries primaryModelId first; on quota (429) falls through to other models automatically.
async function callWithFallback(apiKey, primaryModelId, callFn) {
  const orderedIds = [
    primaryModelId,
    ...VISION_MODELS.map(m => m.id).filter(id => id !== primaryModelId),
  ]

  for (const modelId of orderedIds) {
    try {
      return await callFn(new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: modelId }))
    } catch (err) {
      const msg = err?.message || ''
      if (isAuthError(msg)) {
        throw new Error('API key inválida. Verifica que sea correcta en Google AI Studio.')
      }
      if (isSkippableError(msg)) continue  // quota exhausted or model unavailable: try next
      throw err  // unexpected error — bubble up
    }
  }

  throw new Error(
    'Cuota diaria agotada en todos los modelos disponibles.\n\n' +
    'El plan gratuito de Gemini permite ~20 peticiones/día por modelo. ' +
    'Puedes esperar hasta mañana o activar facturación en Google AI Studio ' +
    'para obtener límites mucho más altos.'
  )
}

export async function detectBestModel(apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey)
  for (const modelInfo of VISION_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelInfo.id })
      await model.generateContent({ contents: [{ role: 'user', parts: [{ text: 'Hi' }] }] })
      return { ...modelInfo, valid: true }
    } catch (err) {
      const msg = err?.message || ''
      if (isAuthError(msg)) {
        throw new Error('API key inválida. Verifica que sea correcta en Google AI Studio.')
      }
      continue  // quota errors or not-found: try next
    }
  }
  throw new Error('No se encontró ningún modelo Gemini compatible con visión para esta API key.')
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ─── PASO 1: identificar cartas desde la foto ────────────────────────────────
export async function identifyCards({ apiKey, modelId, spread, imageFile }) {
  const positionsList = [...spread.positions]
    .sort((a, b) => a.num - b.num)
    .map(p => `${p.num}. ${p.label}`)
    .join('\n')

  const prompt = `Eres un experto en el Mazo Rider-Waite-Smith con 35 años de experiencia. Tu única tarea ahora es IDENTIFICAR las cartas visibles en la foto, no interpretar nada todavía.

TIRADA: ${spread.name} — ${spread.cards} cartas
POSICIONES:
${positionsList}

INSTRUCCIONES:
- Examina la foto con mucha atención.
- Identifica cada carta por su posición en el layout de la tirada (de izquierda a derecha, de arriba a abajo, según el orden numérico).
- Para cada posición, indica el nombre completo de la carta en español del Rider-Waite.
- Indica si está DERECHA (upright, orientación normal) o INVERTIDA (reversed, al revés).
- Si no puedes ver claramente una carta, escribe "No identificada".

RESPONDE EXACTAMENTE en este formato, sin texto adicional, sin explicaciones:
1: Nombre de la carta (DERECHA)
2: Nombre de la carta (INVERTIDA)
...y así para cada posición.`

  if (!imageFile) {
    return spread.positions
      .sort((a, b) => a.num - b.num)
      .map(p => ({ num: p.num, label: p.label, card: 'Sin imagen', reversed: false }))
  }

  const base64Data = await fileToBase64(imageFile)
  const parts = [
    { text: prompt },
    { inlineData: { mimeType: imageFile.type, data: base64Data } },
    { text: 'Analiza la foto y responde con el formato indicado.' },
  ]

  const text = await callWithFallback(apiKey, modelId, model =>
    model.generateContent({
      contents: [{ role: 'user', parts }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
    }).then(r => r.response.text().trim())
  )

  return parseIdentifiedCards(text, spread)
}

function parseIdentifiedCards(text, spread) {
  const posMap = Object.fromEntries(
    spread.positions.map(p => [p.num, p.label])
  )

  // Parse lines like: "1: La Emperatriz (DERECHA)" or "1. La Emperatriz (INVERTIDA)"
  const lineRegex = /^(\d+)[:.]\s*(.+?)\s*\((DERECHA|INVERTIDA|NO IDENTIFICADA)\)\s*$/im
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  const parsed = {}
  for (const line of lines) {
    const m = line.match(lineRegex)
    if (m) {
      const num = parseInt(m[1])
      parsed[num] = {
        num,
        label: posMap[num] || `Posición ${num}`,
        card: m[2].trim(),
        reversed: m[3].toUpperCase() === 'INVERTIDA',
      }
    }
  }

  // Fill any missing positions
  return spread.positions
    .sort((a, b) => a.num - b.num)
    .map(p => parsed[p.num] || { num: p.num, label: p.label, card: 'No identificada', reversed: false })
}

// ─── PASO 2: interpretación completa con cartas validadas ────────────────────
export async function interpretReading({ apiKey, modelId, spread, question, imageFile, validatedCards }) {

  const spreadPositionsText = spread.positions
    .sort((a, b) => a.num - b.num)
    .map(p => `  Posición ${p.num}: ${p.label}`)
    .join('\n')

  // Build the confirmed cards section if we have validated data
  const confirmedSection = validatedCards
    ? `\nCARTAS CONFIRMADAS POR EL CONSULTANTE (usa estas exactamente, no re-identifiques desde la imagen):\n` +
      validatedCards
        .sort((a, b) => a.num - b.num)
        .map(c => `  Posición ${c.num} (${c.label}): ${c.card} — ${c.reversed ? 'INVERTIDA' : 'DERECHA'}`)
        .join('\n') +
      `\n\nIMPORTANTE: Las cartas ya están verificadas por el consultante. NO uses la imagen para re-identificarlas. Usa la imagen solo como referencia visual adicional del layout.\n`
    : ''

  const systemPrompt = `Eres un maestro tarotista con 35 años de experiencia interpretando el Mazo Rider-Waite-Smith. Tu conocimiento abarca la simbología esotérica profunda, la psicología junguiana aplicada al tarot, la kábala, la numerología, la astrología y la alquimia. Interpretas con la precisión de un académico y la sabiduría de un guía espiritual.

TIRADA SELECCIONADA: ${spread.name} (${spread.subtitle})
DESCRIPCIÓN: ${spread.description}
NÚMERO DE CARTAS: ${spread.cards}

POSICIONES DE LA TIRADA:
${spreadPositionsText}
${confirmedSection}
PREGUNTA DEL CONSULTANTE: "${question}"

INSTRUCCIONES PARA LA INTERPRETACIÓN:
1. ${validatedCards ? 'Usa las cartas confirmadas listadas arriba (ya verificadas por el consultante).' : 'Identifica cada carta visible del Rider-Waite en la foto, su nombre y orientación.'}
2. Para cada carta, considera su simbolismo profundo — colores, figuras, números, elementos — en el Rider-Waite.
3. Para cada posición interpreta:
   - Si la carta está INVERTIDA: la energía está bloqueada, interiorizada o se manifiesta en su sombra.
   - El simbolismo central de la carta en el contexto específico de esa posición.
   - La conexión directa con la pregunta del consultante.
4. Analiza las relaciones entre cartas: patrones numéricos, repeticiones de palos, balance Mayor/Menor, elementos dominantes.
5. Síntesis final que responda directamente y con profundidad a la pregunta.

FORMATO DE RESPUESTA:

## ✦ Visión General de la Lectura

[Párrafo introductorio: energía dominante, balance arcanos Mayor/Menor, elementos, impresión general de la lectura]

## Las Cartas Reveladas

### [N] — [Nombre de la Posición]
**Carta:** [Nombre completo] [DERECHA/INVERTIDA]
[Interpretación profunda: 2-4 párrafos — simbolismo en Rider-Waite, significado en esta posición, conexión con la pregunta]

---

## ✦ El Tejido de la Lectura

[Análisis de relaciones entre cartas, patrones, tensiones y flujos energéticos entre posiciones]

## ✦ Síntesis & Mensaje Final

[Respuesta directa y completa a la pregunta del consultante. La más extensa y personal. Termina con consejo práctico o reflexión transformadora.]

---
*Recuerda: el tarot no determina el futuro, lo ilumina. Tú tienes el poder de elegir.*`

  const parts = [{ text: systemPrompt }]

  if (imageFile) {
    const base64Data = await fileToBase64(imageFile)
    parts.push({ inlineData: { mimeType: imageFile.type, data: base64Data } })
    parts.push({
      text: validatedCards
        ? 'Esta es la foto de la lectura. Las cartas ya están confirmadas en el prompt — úsalas directamente y usa la imagen solo como referencia visual del layout.'
        : 'Esta es la foto de la lectura de tarot. Identifica cada carta del mazo Rider-Waite visible, su orientación y realiza la interpretación completa.',
    })
  } else {
    parts.push({
      text: validatedCards
        ? 'No se proporcionó imagen. Interpreta usando las cartas confirmadas listadas arriba.'
        : 'No se proporcionó imagen. Realiza una interpretación energética/intuitiva basada en la pregunta y la tirada seleccionada.',
    })
  }

  return callWithFallback(apiKey, modelId, model =>
    model.generateContent({
      contents: [{ role: 'user', parts }],
      generationConfig: { temperature: 0.85, topP: 0.95, maxOutputTokens: 8192 },
    }).then(r => r.response.text())
  )
}
