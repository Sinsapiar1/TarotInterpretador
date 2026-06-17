import { useState } from 'react'
import StarField from './components/StarField'
import ApiKeySetup from './components/ApiKeySetup'
import SpreadSelector from './components/SpreadSelector'
import ReadingForm from './components/ReadingForm'
import CardValidator from './components/CardValidator'
import InterpretationResult from './components/InterpretationResult'
import { identifyCards, interpretReading } from './utils/gemini'

const STAGES = {
  SETUP: 'setup',
  SELECT: 'select',
  FORM: 'form',
  LOADING_IDENTIFY: 'loading_identify',
  VALIDATE: 'validate',
  LOADING_INTERPRET: 'loading_interpret',
  RESULT: 'result',
}

const LOADING_IDENTIFY_MSGS = [
  'Analizando la imagen con visión mística...',
  'Identificando cada carta del Rider-Waite...',
  'Reconociendo orientaciones...',
  'Mapeando posiciones de la tirada...',
]

const LOADING_INTERPRET_MSGS = [
  'Invocando al maestro tarotista...',
  'Analizando las energías de las cartas...',
  'Leyendo los símbolos del Rider-Waite...',
  'Consultando el libro de los arcanos...',
  'Tejiendo la interpretación...',
  'Encontrando el hilo entre las cartas...',
]

export default function App() {
  const [stage, setStage] = useState(STAGES.SETUP)
  const [session, setSession] = useState(null)
  const [selectedSpread, setSelectedSpread] = useState(null)
  const [readingData, setReadingData] = useState(null)   // { question, imageFile, imagePreview }
  const [identifiedCards, setIdentifiedCards] = useState(null)
  const [validatedCards, setValidatedCards] = useState(null)
  const [interpretation, setInterpretation] = useState('')
  const [loadingMsg, setLoadingMsg] = useState('')
  const [error, setError] = useState(null)

  function handleConnected(sess) {
    setSession(sess)
    setStage(STAGES.SELECT)
  }

  function handleSpreadSelected(spread) {
    setSelectedSpread(spread)
    setStage(STAGES.FORM)
  }

  // Step 1: user submits form → identify cards
  async function handleFormSubmit({ question, imageFile }) {
    const imagePreview = imageFile ? URL.createObjectURL(imageFile) : null
    setReadingData({ question, imageFile, imagePreview })
    setError(null)
    setStage(STAGES.LOADING_IDENTIFY)

    let msgIdx = 0
    setLoadingMsg(LOADING_IDENTIFY_MSGS[0])
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_IDENTIFY_MSGS.length
      setLoadingMsg(LOADING_IDENTIFY_MSGS[msgIdx])
    }, 3000)

    try {
      const cards = await identifyCards({
        apiKey: session.apiKey,
        modelId: session.model.id,
        spread: selectedSpread,
        imageFile,
      })
      clearInterval(interval)
      setIdentifiedCards(cards)
      setStage(STAGES.VALIDATE)
    } catch (err) {
      clearInterval(interval)
      setError(err.message || 'Error al identificar las cartas.')
      setStage(STAGES.FORM)
    }
  }

  // Step 2: user confirms/edits cards → interpret
  async function handleValidationConfirmed(validatedCards) {
    setValidatedCards(validatedCards)
    setError(null)
    setStage(STAGES.LOADING_INTERPRET)

    let msgIdx = 0
    setLoadingMsg(LOADING_INTERPRET_MSGS[0])
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_INTERPRET_MSGS.length
      setLoadingMsg(LOADING_INTERPRET_MSGS[msgIdx])
    }, 3500)

    try {
      const result = await interpretReading({
        apiKey: session.apiKey,
        modelId: session.model.id,
        spread: selectedSpread,
        question: readingData.question,
        imageFile: readingData.imageFile,
        validatedCards,
      })
      clearInterval(interval)
      setInterpretation(result)
      setStage(STAGES.RESULT)
    } catch (err) {
      clearInterval(interval)
      setError(err.message || 'Error al interpretar la lectura.')
      setStage(STAGES.VALIDATE)
    }
  }

  const isLoading = stage === STAGES.LOADING_IDENTIFY || stage === STAGES.LOADING_INTERPRET
  const showNav = !isLoading && stage !== STAGES.SETUP

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'linear-gradient(135deg, #060010 0%, #0d0020 50%, #060018 100%)' }}>
      <StarField />

      <div style={{ position: 'relative', zIndex: 10 }}>

        {stage === STAGES.SETUP && (
          <ApiKeySetup onConnected={handleConnected} />
        )}

        {stage === STAGES.SELECT && (
          <SpreadSelector onSelect={handleSpreadSelected} modelInfo={session?.model} />
        )}

        {stage === STAGES.FORM && (
          <>
            <ErrorBanner error={error} onClose={() => setError(null)} />
            <ReadingForm
              spread={selectedSpread}
              modelInfo={session?.model}
              onSubmit={handleFormSubmit}
              onBack={() => setStage(STAGES.SELECT)}
            />
          </>
        )}

        {(stage === STAGES.LOADING_IDENTIFY || stage === STAGES.LOADING_INTERPRET) && (
          <LoadingScreen
            msg={loadingMsg}
            title={stage === STAGES.LOADING_IDENTIFY ? 'Identificando Cartas' : 'Consultando el Oráculo'}
            imagePreview={readingData?.imagePreview}
          />
        )}

        {stage === STAGES.VALIDATE && identifiedCards && (
          <>
            <ErrorBanner error={error} onClose={() => setError(null)} />
            <CardValidator
              spread={selectedSpread}
              identifiedCards={identifiedCards}
              question={readingData?.question}
              imagePreview={readingData?.imagePreview}
              onConfirm={handleValidationConfirmed}
              onBack={() => setStage(STAGES.FORM)}
            />
          </>
        )}

        {stage === STAGES.RESULT && (
          <InterpretationResult
            spread={selectedSpread}
            question={readingData?.question}
            interpretation={interpretation}
            imagePreview={readingData?.imagePreview}
            validatedCards={validatedCards}
            onReset={() => setStage(STAGES.SELECT)}
            onNewReading={() => {
              setReadingData(null)
              setIdentifiedCards(null)
              setValidatedCards(null)
              setInterpretation('')
              setStage(STAGES.FORM)
            }}
          />
        )}
      </div>

      {/* Floating nav */}
      {showNav && (
        <div style={{
          position: 'fixed', top: '1rem', right: '1rem', zIndex: 40,
          display: 'flex', gap: '0.5rem',
        }}>
          {stage !== STAGES.SELECT && (
            <button
              onClick={() => setStage(STAGES.SELECT)}
              style={navBtnStyle('#c9a227', 'rgba(201,162,39,0.2)')}
            >
              ✦ Tiradas
            </button>
          )}
          <button
            onClick={() => {
              setSession(null); setSelectedSpread(null)
              setReadingData(null); setIdentifiedCards(null)
              setInterpretation(''); setStage(STAGES.SETUP)
            }}
            style={navBtnStyle('rgba(232,213,183,0.3)', 'rgba(201,162,39,0.15)')}
          >
            API Key
          </button>
        </div>
      )}
    </div>
  )
}

function navBtnStyle(color, borderColor) {
  return {
    padding: '0.4rem 0.875rem',
    background: 'rgba(17,0,37,0.9)',
    border: `1px solid ${borderColor}`,
    borderRadius: '999px',
    color,
    fontFamily: 'Cinzel, serif',
    fontSize: '0.72rem',
    cursor: 'pointer',
    letterSpacing: '0.05em',
    backdropFilter: 'blur(8px)',
  }
}

function ErrorBanner({ error, onClose }) {
  if (!error) return null
  return (
    <div style={{
      position: 'fixed', top: '1rem', left: '50%', transform: 'translateX(-50%)',
      zIndex: 50,
      background: 'rgba(17,0,37,0.97)',
      border: '1px solid rgba(239,68,68,0.4)',
      borderRadius: '0.75rem',
      padding: '1rem 1.5rem',
      maxWidth: '480px', width: '90vw',
      boxShadow: '0 0 30px rgba(239,68,68,0.2)',
    }}>
      <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.8rem', color: '#fca5a5', marginBottom: '0.4rem' }}>
        Error
      </p>
      <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '1rem', color: 'rgba(232,213,183,0.8)' }}>
        {error}
      </p>
      <button
        onClick={onClose}
        style={{ marginTop: '0.75rem', background: 'none', border: 'none', color: 'rgba(201,162,39,0.6)', fontFamily: 'Cinzel, serif', fontSize: '0.8rem', cursor: 'pointer' }}
      >
        Cerrar ×
      </button>
    </div>
  )
}

function LoadingScreen({ msg, title, imagePreview }) {
  return (
    <div className="animate-fade-in" style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, background: 'rgba(6,0,16,0.96)',
    }}>
      {/* Animated rings */}
      <div style={{ position: 'relative', width: '150px', height: '150px', marginBottom: '2.5rem' }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '2px solid transparent', borderTopColor: '#c9a227',
          animation: 'spin-slow 1.4s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: '12px', borderRadius: '50%',
          border: '1px solid transparent', borderBottomColor: 'rgba(201,162,39,0.5)',
          animation: 'spin-slow 2.2s linear infinite reverse',
        }} />
        <div style={{
          position: 'absolute', inset: '24px', borderRadius: '50%',
          border: '1px dashed rgba(201,162,39,0.2)',
          animation: 'spin-slow 4s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.8rem',
        }}>
          🔮
        </div>
      </div>

      <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.1rem', color: '#c9a227', marginBottom: '0.75rem' }}>
        {title}
      </h2>
      <p
        key={msg}
        className="animate-fade-in"
        style={{
          fontFamily: 'EB Garamond, serif', fontSize: '1.05rem',
          color: 'rgba(232,213,183,0.6)', textAlign: 'center', maxWidth: '300px',
        }}
      >
        {msg}
      </p>

      {imagePreview && (
        <div style={{
          marginTop: '1.5rem', width: '72px', height: '72px',
          borderRadius: '0.5rem', overflow: 'hidden',
          border: '1px solid rgba(201,162,39,0.3)', opacity: 0.45,
        }}>
          <img src={imagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
    </div>
  )
}
