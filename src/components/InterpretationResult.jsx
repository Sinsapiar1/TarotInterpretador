import { useState } from 'react'
import { downloadReadingHTML } from '../utils/exportHtml'

// Parse the markdown from Gemini into structured sections
function parseInterpretation(text) {
  if (!text) return []
  const lines = text.split('\n')
  const sections = []
  let current = null

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith('## ')) {
      if (current) sections.push(current)
      current = { type: 'h2', title: trimmed.replace(/^##\s*/, ''), content: [] }
    } else if (trimmed.startsWith('### ')) {
      if (current) sections.push(current)
      current = { type: 'h3', title: trimmed.replace(/^###\s*/, ''), content: [] }
    } else if (trimmed === '---') {
      if (current) sections.push(current)
      current = null
    } else if (current) {
      current.content.push(line)
    } else if (trimmed) {
      current = { type: 'p', title: '', content: [line] }
    }
  }
  if (current) sections.push(current)
  return sections
}

// Convert **bold** and *italic* in text
function renderInlineMarkdown(text) {
  if (!text) return text
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#e8c84a">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em style="color:#c4b0d8">$1</em>')
}

function ContentBlock({ lines }) {
  const text = lines.join('\n').trim()
  if (!text) return null

  const paragraphs = text.split(/\n\n+/).filter(Boolean)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {paragraphs.map((para, i) => {
        const p = para.trim()
        if (!p) return null

        if (p.startsWith('**Carta:**')) {
          const cardText = p.replace('**Carta:**', '').trim()
          const isInverted = cardText.includes('INVERTIDA')
          return (
            <div
              key={i}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: isInverted ? 'rgba(239,68,68,0.08)' : 'rgba(201,162,39,0.08)',
                border: `1px solid ${isInverted ? 'rgba(239,68,68,0.25)' : 'rgba(201,162,39,0.3)'}`,
                borderRadius: '0.5rem',
                padding: '0.4rem 0.875rem',
                alignSelf: 'flex-start',
              }}
            >
              <span style={{ fontSize: '1rem' }}>{isInverted ? '🔄' : '🃏'}</span>
              <span
                style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.9rem',
                  color: isInverted ? '#fca5a5' : '#e8c84a',
                }}
                dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(cardText) }}
              />
            </div>
          )
        }

        return (
          <p
            key={i}
            style={{
              fontFamily: 'EB Garamond, serif',
              fontSize: '1.1rem',
              lineHeight: 1.8,
              color: 'rgba(232,213,183,0.88)',
            }}
            dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(p) }}
          />
        )
      })}
    </div>
  )
}

export default function InterpretationResult({ spread, question, interpretation, imagePreview, validatedCards, onReset, onNewReading }) {
  const [copied, setCopied] = useState(false)
  const [exported, setExported] = useState(false)
  const [showImage, setShowImage] = useState(false)
  const sections = parseInterpretation(interpretation)

  function handleExport() {
    downloadReadingHTML({ spread, question, interpretation, validatedCards })
    setExported(true)
    setTimeout(() => setExported(false), 3000)
  }

  function handleCopy() {
    navigator.clipboard.writeText(
      `TIRADA: ${spread.name}\nPREGUNTA: ${question}\n\n${interpretation}`
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="min-h-screen px-4 py-10 relative" style={{ zIndex: 10 }}>

      {/* Image modal */}
      {showImage && imagePreview && (
        <div
          className="fixed inset-0 flex items-center justify-center animate-fade-in"
          style={{ zIndex: 200, background: 'rgba(0,0,0,0.92)', cursor: 'pointer' }}
          onClick={() => setShowImage(false)}
        >
          <img
            src={imagePreview}
            alt="Lectura"
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '0.5rem' }}
          />
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8 animate-fade-in-up">
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✦</div>
        <h1
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 'clamp(1.4rem, 3vw, 2.2rem)',
            color: '#c9a227',
            marginBottom: '0.4rem',
            filter: 'drop-shadow(0 0 20px rgba(201,162,39,0.3))',
          }}
        >
          {spread.name}
        </h1>
        <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.95rem', color: 'rgba(232,213,183,0.5)' }}>
          {spread.subtitle}
        </p>
        <div style={{ margin: '1rem auto', width: '200px', height: '1px', background: 'linear-gradient(90deg, transparent, #c9a227, transparent)' }} />

        {/* Question display */}
        <div
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            background: 'rgba(17,0,37,0.7)',
            border: '1px solid rgba(201,162,39,0.2)',
            borderRadius: '0.75rem',
            padding: '1rem 1.5rem',
          }}
        >
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.7rem', color: 'rgba(201,162,39,0.5)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Pregunta consultada
          </p>
          <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '1.1rem', fontStyle: 'italic', color: 'rgba(232,213,183,0.8)', lineHeight: 1.6 }}>
            "{question}"
          </p>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        {/* Image thumbnail */}
        {imagePreview && (
          <div
            className="animate-fade-in-up delay-100"
            style={{ marginBottom: '1.5rem', cursor: 'pointer' }}
            onClick={() => setShowImage(true)}
          >
            <div style={{
              position: 'relative',
              borderRadius: '0.75rem',
              overflow: 'hidden',
              border: '1px solid rgba(201,162,39,0.3)',
            }}>
              <img
                src={imagePreview}
                alt="Tu lectura"
                style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', display: 'block', filter: 'brightness(0.85)' }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, transparent 40%, rgba(6,0,16,0.7))',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: '0.75rem',
              }}>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: 'rgba(201,162,39,0.7)', letterSpacing: '0.1em' }}>
                  Toca para ampliar
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Interpretation sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {sections.map((section, i) => {
            if (section.type === 'h2') {
              return (
                <div
                  key={i}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <h2
                    style={{
                      fontFamily: 'Cinzel, serif',
                      fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
                      color: '#c9a227',
                      marginBottom: '1rem',
                      paddingBottom: '0.5rem',
                      borderBottom: '1px solid rgba(201,162,39,0.2)',
                    }}
                  >
                    {section.title}
                  </h2>
                  <ContentBlock lines={section.content} />
                </div>
              )
            }

            if (section.type === 'h3') {
              const isCardSection = section.title.match(/^\d+\s*[—–-]/)
              return (
                <div
                  key={i}
                  className="animate-fade-in-up"
                  style={{
                    background: isCardSection ? 'rgba(17,0,37,0.7)' : 'transparent',
                    border: isCardSection ? '1px solid rgba(201,162,39,0.12)' : 'none',
                    borderRadius: '0.75rem',
                    padding: isCardSection ? '1.25rem' : '0',
                    animationDelay: `${i * 0.06}s`,
                  }}
                >
                  <h3
                    style={{
                      fontFamily: 'Cinzel, serif',
                      fontSize: '0.95rem',
                      color: isCardSection ? '#e8c84a' : '#c9a227',
                      marginBottom: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    {isCardSection && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'rgba(201,162,39,0.15)',
                        border: '1px solid rgba(201,162,39,0.35)',
                        fontSize: '0.7rem',
                        color: '#c9a227',
                        flexShrink: 0,
                      }}>
                        {section.title.match(/^(\d+)/)?.[1]}
                      </span>
                    )}
                    <span>{isCardSection ? section.title.replace(/^\d+\s*[—–-]\s*/, '') : section.title}</span>
                  </h3>
                  <ContentBlock lines={section.content} />
                </div>
              )
            }

            return (
              <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <ContentBlock lines={section.content} />
              </div>
            )
          })}
        </div>

        {/* Footer ornament */}
        <div style={{ textAlign: 'center', margin: '2.5rem 0 1.5rem' }}>
          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,162,39,0.4), transparent)', marginBottom: '1rem' }} />
          <p style={{ fontFamily: 'EB Garamond, serif', fontStyle: 'italic', fontSize: '0.95rem', color: 'rgba(232,213,183,0.35)' }}>
            El tarot no determina el futuro — lo ilumina. Tú tienes el poder de elegir.
          </p>
          <div style={{ marginTop: '0.5rem', color: 'rgba(201,162,39,0.3)', letterSpacing: '0.5em', fontSize: '0.8rem' }}>✦ ✦ ✦</div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '3rem' }}>
          <button
            onClick={handleExport}
            style={{
              padding: '0.75rem 1.5rem',
              background: exported
                ? 'linear-gradient(135deg, rgba(201,162,39,0.18), rgba(201,162,39,0.08))'
                : 'rgba(17,0,37,0.9)',
              border: `1px solid ${exported ? 'rgba(201,162,39,0.7)' : 'rgba(201,162,39,0.42)'}`,
              borderRadius: '0.5rem',
              color: exported ? '#e8c84a' : '#c9a227',
              fontFamily: 'Cinzel, serif',
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.3s',
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            {exported ? '✦ Descargado' : '⬇ Exportar HTML'}
          </button>

          <button
            onClick={handleCopy}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(17,0,37,0.9)',
              border: '1px solid rgba(201,162,39,0.22)',
              borderRadius: '0.5rem',
              color: copied ? '#c9a227' : 'rgba(232,213,183,0.5)',
              fontFamily: 'Cinzel, serif',
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.3s',
              letterSpacing: '0.05em',
            }}
          >
            {copied ? '✦ Copiado' : '◈ Copiar Texto'}
          </button>

          <button
            onClick={onNewReading}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(17,0,37,0.9)',
              border: '1px solid rgba(107,33,168,0.35)',
              borderRadius: '0.5rem',
              color: 'rgba(196,176,216,0.7)',
              fontFamily: 'Cinzel, serif',
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.3s',
              letterSpacing: '0.05em',
            }}
          >
            🔮 Nueva Lectura
          </button>

          <button
            onClick={onReset}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #8a6f1a, #c9a227)',
              border: 'none',
              borderRadius: '0.5rem',
              color: '#060010',
              fontFamily: 'Cinzel, serif',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s',
              letterSpacing: '0.05em',
            }}
          >
            ✦ Cambiar Tirada
          </button>
        </div>
      </div>
    </div>
  )
}
