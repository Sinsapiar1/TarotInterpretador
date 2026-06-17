import { useState, useRef } from 'react'
import SpreadDiagram from './SpreadDiagram'

export default function ReadingForm({ spread, modelInfo, onSubmit, onBack }) {
  const [question, setQuestion] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [focusMode, setFocusMode] = useState(false)
  const [focusStep, setFocusStep] = useState(0) // 0=idle 1=breathing 2=done
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  function handleImageSelect(file) {
    if (!file || !file.type.startsWith('image/')) return
    setImageFile(file)
    const url = URL.createObjectURL(file)
    setImagePreview(url)
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleImageSelect(file)
  }

  function startFocusRitual() {
    setFocusMode(true)
    setFocusStep(1)
    setTimeout(() => setFocusStep(2), 15000)
  }

  function canSubmit() {
    return question.trim().length >= 10
  }

  return (
    <div className="min-h-screen px-4 py-10 relative" style={{ zIndex: 10 }}>

      {/* Ritual de enfoque modal */}
      {focusMode && focusStep === 1 && (
        <div
          className="fixed inset-0 flex flex-col items-center justify-center animate-fade-in"
          style={{
            zIndex: 100,
            background: 'rgba(6,0,16,0.97)',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '480px', padding: '2rem' }}>
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                border: '3px solid rgba(201,162,39,0.4)',
                margin: '0 auto 2rem',
                animation: 'pulse-glow 4s ease-in-out infinite',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
              }}
            >
              🕯️
            </div>
            <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.3rem', color: '#c9a227', marginBottom: '1.5rem' }}>
              Ritual de Conexión
            </h2>
            <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '1.15rem', color: 'rgba(232,213,183,0.8)', lineHeight: 1.8, marginBottom: '2rem' }}>
              Toma tu mazo en las manos. Cierra los ojos.<br />
              Respira profundo tres veces.<br />
              Mientras barajas, concentra toda tu intención en la pregunta que tienes en el corazón.<br />
              Cuando sientas que las cartas tienen tu energía, detente y colócalas.
            </p>
            <div style={{ width: '200px', margin: '0 auto 1.5rem', height: '4px', background: 'rgba(201,162,39,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #8a6f1a, #c9a227)',
                  animation: 'shimmer 15s linear forwards',
                  width: '100%',
                  transformOrigin: 'left',
                  transform: 'scaleX(0)',
                  animationFillMode: 'forwards',
                }}
              />
            </div>
            <button
              onClick={() => { setFocusMode(false); setFocusStep(0) }}
              style={{
                background: 'none',
                border: '1px solid rgba(201,162,39,0.3)',
                borderRadius: '0.5rem',
                color: 'rgba(201,162,39,0.6)',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.85rem',
                padding: '0.5rem 1.5rem',
                cursor: 'pointer',
              }}
            >
              Saltar →
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8 animate-fade-in-up">
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'none',
            border: 'none',
            color: 'rgba(201,162,39,0.5)',
            fontFamily: 'Cinzel, serif',
            fontSize: '0.8rem',
            cursor: 'pointer',
            marginBottom: '1.5rem',
            letterSpacing: '0.05em',
          }}
        >
          ← Cambiar tirada
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '1.5rem', color: '#c9a227' }}>{spread.icon}</span>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(1.3rem, 3vw, 2rem)', color: '#c9a227' }}>
            {spread.name}
          </h1>
        </div>
        <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '1rem', color: 'rgba(232,213,183,0.55)' }}>
          {spread.subtitle} · {spread.origin}
        </p>
        <div style={{ margin: '1rem auto', width: '120px', height: '1px', background: 'linear-gradient(90deg, transparent, #c9a227, transparent)' }} />
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>

        {/* Left column — Question + Ritual */}
        <div className="animate-fade-in-up delay-100" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Ritual button */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(107,33,168,0.15), rgba(17,0,37,0.9))',
              border: '1px solid rgba(107,33,168,0.3)',
              borderRadius: '0.875rem',
              padding: '1.25rem',
            }}
          >
            <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '0.85rem', color: 'rgba(201,162,39,0.8)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ① Ritual de Conexión
            </h3>
            <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.95rem', color: 'rgba(232,213,183,0.65)', lineHeight: 1.6, marginBottom: '0.875rem' }}>
              Antes de barajar, activa tu conexión con las cartas. Este ritual guiado te ayuda a llevar tu energía e intención al mazo.
            </p>
            <button
              onClick={startFocusRitual}
              style={{
                width: '100%',
                padding: '0.65rem',
                background: 'rgba(107,33,168,0.2)',
                border: '1px solid rgba(107,33,168,0.4)',
                borderRadius: '0.5rem',
                color: '#c4b0d8',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.82rem',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            >
              🕯️ Iniciar Ritual de Conexión
            </button>
          </div>

          {/* Question */}
          <div
            style={{
              background: 'rgba(17,0,37,0.9)',
              border: '1px solid rgba(201,162,39,0.2)',
              borderRadius: '0.875rem',
              padding: '1.25rem',
            }}
          >
            <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '0.85rem', color: 'rgba(201,162,39,0.8)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ② Tu Pregunta
            </h3>
            <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.95rem', color: 'rgba(232,213,183,0.55)', lineHeight: 1.5, marginBottom: '0.875rem' }}>
              Escribe exactamente la pregunta que estabas pensando mientras barajabas. Sé honesto y específico — el tarot responde con precisión a la pregunta real.
            </p>
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="¿Qué necesito saber sobre...? ¿Cuál es el mensaje de...? ¿Hacia dónde se dirige mi situación con...?"
              rows={5}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: 'rgba(6,0,16,0.7)',
                border: `1px solid ${question.length >= 10 ? 'rgba(201,162,39,0.4)' : 'rgba(201,162,39,0.2)'}`,
                borderRadius: '0.5rem',
                color: '#e8d5b7',
                fontFamily: 'EB Garamond, serif',
                fontSize: '1.05rem',
                lineHeight: 1.7,
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.3s',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
              <span style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.8rem', color: question.length >= 10 ? 'rgba(201,162,39,0.5)' : 'rgba(232,213,183,0.3)' }}>
                {question.length >= 10 ? '✦ Pregunta lista' : 'Mínimo 10 caracteres'}
              </span>
              <span style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.8rem', color: 'rgba(232,213,183,0.3)' }}>
                {question.length} caracteres
              </span>
            </div>
          </div>
        </div>

        {/* Right column — Image + Diagram */}
        <div className="animate-fade-in-up delay-200" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Photo upload */}
          <div
            style={{
              background: 'rgba(17,0,37,0.9)',
              border: `1px dashed ${isDragging ? 'rgba(201,162,39,0.6)' : imagePreview ? 'rgba(201,162,39,0.4)' : 'rgba(201,162,39,0.2)'}`,
              borderRadius: '0.875rem',
              padding: '1.25rem',
              transition: 'border-color 0.3s',
            }}
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '0.85rem', color: 'rgba(201,162,39,0.8)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ③ Foto de la Lectura
            </h3>

            {imagePreview ? (
              <div>
                <div style={{ position: 'relative', borderRadius: '0.5rem', overflow: 'hidden', marginBottom: '0.75rem' }}>
                  <img
                    src={imagePreview}
                    alt="Lectura de tarot"
                    style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    background: 'rgba(6,0,16,0.8)',
                    border: '1px solid rgba(201,162,39,0.3)',
                    borderRadius: '0.3rem',
                    padding: '0.15rem 0.4rem',
                    fontFamily: 'Cinzel, serif',
                    fontSize: '0.65rem',
                    color: '#c9a227',
                  }}>
                    ✦ Imagen lista
                  </div>
                </div>
                <button
                  onClick={() => { setImageFile(null); setImagePreview(null) }}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    borderRadius: '0.4rem',
                    color: 'rgba(252,165,165,0.7)',
                    fontFamily: 'Cinzel, serif',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  Cambiar imagen
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed rgba(201,162,39,0.2)',
                  borderRadius: '0.5rem',
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  background: isDragging ? 'rgba(201,162,39,0.05)' : 'transparent',
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📸</div>
                <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.85rem', color: 'rgba(201,162,39,0.6)', marginBottom: '0.4rem' }}>
                  Toca para subir o arrastra la foto
                </p>
                <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.88rem', color: 'rgba(232,213,183,0.4)', lineHeight: 1.5 }}>
                  Coloca las cartas según el diagrama y fotografía tu lectura. El IA identificará cada carta automáticamente.
                </p>
                <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.78rem', color: 'rgba(232,213,183,0.3)', marginTop: '0.5rem' }}>
                  JPG, PNG, WebP · Máx. 10MB
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => handleImageSelect(e.target.files?.[0])}
            />
          </div>

          {/* Diagram reference */}
          <div
            style={{
              background: 'rgba(17,0,37,0.7)',
              border: '1px solid rgba(201,162,39,0.12)',
              borderRadius: '0.875rem',
              padding: '1.25rem',
            }}
          >
            <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '0.8rem', color: 'rgba(201,162,39,0.6)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>
              Diagrama de la Tirada · {spread.cards} cartas
            </h3>
            <SpreadDiagram spread={spread} />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="animate-fade-in-up delay-300" style={{ maxWidth: '860px', margin: '1.5rem auto 0' }}>
        {!imageFile && (
          <div style={{
            background: 'rgba(201,162,39,0.05)',
            border: '1px solid rgba(201,162,39,0.15)',
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            fontFamily: 'EB Garamond, serif',
            fontSize: '0.95rem',
            color: 'rgba(232,213,183,0.55)',
            textAlign: 'center',
          }}>
            ℹ Sin imagen, la interpretación será energética / intuitiva basada en tu pregunta y la tirada elegida.
          </div>
        )}

        <button
          onClick={() => onSubmit({ question: question.trim(), imageFile })}
          disabled={!canSubmit()}
          style={{
            width: '100%',
            padding: '1.1rem',
            background: canSubmit()
              ? 'linear-gradient(135deg, #8a6f1a, #c9a227, #8a6f1a)'
              : 'rgba(201,162,39,0.1)',
            backgroundSize: '200% auto',
            border: `1px solid ${canSubmit() ? 'rgba(201,162,39,0.5)' : 'rgba(201,162,39,0.15)'}`,
            borderRadius: '0.75rem',
            color: canSubmit() ? '#060010' : 'rgba(201,162,39,0.3)',
            fontFamily: 'Cinzel, serif',
            fontSize: '1rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            cursor: canSubmit() ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s',
          }}
        >
          {canSubmit() ? '✦ Revelar la Lectura ✦' : 'Completa tu pregunta para continuar'}
        </button>
      </div>
    </div>
  )
}
