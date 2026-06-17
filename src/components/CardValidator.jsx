import { useState } from 'react'
import SpreadDiagram from './SpreadDiagram'

// All 78 Rider-Waite cards for autocomplete suggestions
const ALL_CARDS = [
  // Arcanos Mayores
  'El Loco', 'El Mago', 'La Suma Sacerdotisa', 'La Emperatriz', 'El Emperador',
  'El Sumo Sacerdote', 'Los Enamorados', 'El Carro', 'La Fuerza', 'El Ermitaño',
  'La Rueda de la Fortuna', 'La Justicia', 'El Colgado', 'La Muerte', 'La Templanza',
  'El Diablo', 'La Torre', 'La Estrella', 'La Luna', 'El Sol',
  'El Juicio', 'El Mundo',
  // Bastos
  'As de Bastos', 'Dos de Bastos', 'Tres de Bastos', 'Cuatro de Bastos',
  'Cinco de Bastos', 'Seis de Bastos', 'Siete de Bastos', 'Ocho de Bastos',
  'Nueve de Bastos', 'Diez de Bastos',
  'Paje de Bastos', 'Caballero de Bastos', 'Reina de Bastos', 'Rey de Bastos',
  // Copas
  'As de Copas', 'Dos de Copas', 'Tres de Copas', 'Cuatro de Copas',
  'Cinco de Copas', 'Seis de Copas', 'Siete de Copas', 'Ocho de Copas',
  'Nueve de Copas', 'Diez de Copas',
  'Paje de Copas', 'Caballero de Copas', 'Reina de Copas', 'Rey de Copas',
  // Espadas
  'As de Espadas', 'Dos de Espadas', 'Tres de Espadas', 'Cuatro de Espadas',
  'Cinco de Espadas', 'Seis de Espadas', 'Siete de Espadas', 'Ocho de Espadas',
  'Nueve de Espadas', 'Diez de Espadas',
  'Paje de Espadas', 'Caballero de Espadas', 'Reina de Espadas', 'Rey de Espadas',
  // Oros / Pentáculos
  'As de Oros', 'Dos de Oros', 'Tres de Oros', 'Cuatro de Oros',
  'Cinco de Oros', 'Seis de Oros', 'Siete de Oros', 'Ocho de Oros',
  'Nueve de Oros', 'Diez de Oros',
  'Paje de Oros', 'Caballero de Oros', 'Reina de Oros', 'Rey de Oros',
]

function CardEditPanel({ card, onSave, onCancel }) {
  const [name, setName] = useState(card.card)
  const [reversed, setReversed] = useState(card.reversed)
  const [suggestions, setSuggestions] = useState([])

  function handleNameChange(val) {
    setName(val)
    if (val.length >= 2) {
      const q = val.toLowerCase()
      setSuggestions(ALL_CARDS.filter(c => c.toLowerCase().includes(q)).slice(0, 6))
    } else {
      setSuggestions([])
    }
  }

  return (
    <div
      className="animate-fade-in"
      style={{
        background: 'rgba(6,0,16,0.98)',
        border: '1px solid rgba(201,162,39,0.5)',
        borderRadius: '0.75rem',
        padding: '1.25rem',
        marginTop: '0.5rem',
        boxShadow: '0 0 30px rgba(201,162,39,0.1)',
      }}
    >
      <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: 'rgba(201,162,39,0.7)', marginBottom: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Posición {card.num} — {card.label}
      </p>

      {/* Name input */}
      <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
        <label style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.9rem', color: 'rgba(232,213,183,0.6)', display: 'block', marginBottom: '0.35rem' }}>
          Nombre de la carta
        </label>
        <input
          type="text"
          value={name}
          onChange={e => handleNameChange(e.target.value)}
          placeholder="Ej: La Emperatriz, Cinco de Copas..."
          autoFocus
          style={{
            width: '100%',
            padding: '0.65rem 0.875rem',
            background: 'rgba(17,0,37,0.9)',
            border: '1px solid rgba(201,162,39,0.4)',
            borderRadius: '0.4rem',
            color: '#e8d5b7',
            fontFamily: 'EB Garamond, serif',
            fontSize: '1.05rem',
            outline: 'none',
          }}
        />
        {/* Autocomplete suggestions */}
        {suggestions.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'rgba(13,0,25,0.98)',
            border: '1px solid rgba(201,162,39,0.3)',
            borderRadius: '0 0 0.4rem 0.4rem',
            zIndex: 10,
            overflow: 'hidden',
          }}>
            {suggestions.map(s => (
              <div
                key={s}
                onClick={() => { setName(s); setSuggestions([]) }}
                style={{
                  padding: '0.5rem 0.875rem',
                  fontFamily: 'EB Garamond, serif',
                  fontSize: '1rem',
                  color: 'rgba(232,213,183,0.8)',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  borderBottom: '1px solid rgba(201,162,39,0.08)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,162,39,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {s}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reversed toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
          marginBottom: '1rem',
          padding: '0.65rem 0.875rem',
          background: reversed ? 'rgba(239,68,68,0.08)' : 'rgba(201,162,39,0.05)',
          border: `1px solid ${reversed ? 'rgba(239,68,68,0.25)' : 'rgba(201,162,39,0.15)'}`,
          borderRadius: '0.4rem',
          cursor: 'pointer',
          transition: 'all 0.25s',
        }}
        onClick={() => setReversed(!reversed)}
      >
        {/* Toggle pill */}
        <div style={{
          width: '40px',
          height: '22px',
          borderRadius: '11px',
          background: reversed ? 'rgba(239,68,68,0.4)' : 'rgba(201,162,39,0.3)',
          border: `1px solid ${reversed ? 'rgba(239,68,68,0.5)' : 'rgba(201,162,39,0.4)'}`,
          position: 'relative',
          transition: 'all 0.25s',
          flexShrink: 0,
        }}>
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: reversed ? '#fca5a5' : '#c9a227',
            position: 'absolute',
            top: '2px',
            left: reversed ? '20px' : '2px',
            transition: 'left 0.25s',
          }} />
        </div>
        <div>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.8rem', color: reversed ? '#fca5a5' : '#c9a227', lineHeight: 1.2 }}>
            {reversed ? 'INVERTIDA' : 'DERECHA'}
          </p>
          <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.82rem', color: 'rgba(232,213,183,0.45)', lineHeight: 1.3, marginTop: '0.1rem' }}>
            {reversed ? 'Carta al revés — energía bloqueada o interiorizada' : 'Carta en posición normal — energía fluida'}
          </p>
        </div>
        {/* Rotation icon */}
        <span style={{ marginLeft: 'auto', fontSize: '1.2rem', opacity: 0.5 }}>
          {reversed ? '🔄' : '🃏'}
        </span>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => onSave({ ...card, card: name.trim() || card.card, reversed })}
          disabled={!name.trim()}
          style={{
            flex: 1,
            padding: '0.6rem',
            background: name.trim() ? 'linear-gradient(135deg, #8a6f1a, #c9a227)' : 'rgba(201,162,39,0.1)',
            border: 'none',
            borderRadius: '0.4rem',
            color: name.trim() ? '#060010' : 'rgba(201,162,39,0.4)',
            fontFamily: 'Cinzel, serif',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: name.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          ✦ Confirmar
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: '0.6rem 1rem',
            background: 'rgba(17,0,37,0.9)',
            border: '1px solid rgba(201,162,39,0.2)',
            borderRadius: '0.4rem',
            color: 'rgba(232,213,183,0.5)',
            fontFamily: 'Cinzel, serif',
            fontSize: '0.82rem',
            cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default function CardValidator({ spread, identifiedCards, question, imagePreview, onConfirm, onBack }) {
  const [cards, setCards] = useState(identifiedCards)
  const [editingNum, setEditingNum] = useState(null)
  const [selected, setSelected] = useState([]) // nums with checkbox selected for bulk edit
  const [showDiagram, setShowDiagram] = useState(false)

  function saveCard(updated) {
    setCards(prev => prev.map(c => c.num === updated.num ? updated : c))
    setEditingNum(null)
  }

  function toggleSelect(num) {
    setSelected(prev =>
      prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]
    )
  }

  const editingCard = editingNum ? cards.find(c => c.num === editingNum) : null

  return (
    <div className="min-h-screen px-4 py-10 relative" style={{ zIndex: 10 }}>

      {/* Header */}
      <div className="text-center mb-6 animate-fade-in-up">
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: 'none', border: 'none',
            color: 'rgba(201,162,39,0.5)', fontFamily: 'Cinzel, serif',
            fontSize: '0.8rem', cursor: 'pointer', marginBottom: '1rem',
          }}
        >
          ← Volver al formulario
        </button>

        <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>🔍</div>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', color: '#c9a227', marginBottom: '0.35rem' }}>
          Verifica las Cartas
        </h1>
        <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '1.05rem', color: 'rgba(232,213,183,0.6)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
          Estas son las cartas que el IA detectó en tu foto. Revisa cada una — si alguna está mal, haz click en la carta para corregirla.
        </p>
        <div style={{ margin: '1rem auto', width: '150px', height: '1px', background: 'linear-gradient(90deg, transparent, #c9a227, transparent)' }} />
      </div>

      <div style={{ maxWidth: '820px', margin: '0 auto', display: 'grid', gap: '1.25rem', gridTemplateColumns: imagePreview ? 'repeat(auto-fit, minmax(340px, 1fr))' : '1fr' }}>

        {/* Card list */}
        <div className="animate-fade-in-up delay-100">
          {/* Spread + question context */}
          <div style={{
            background: 'rgba(17,0,37,0.7)',
            border: '1px solid rgba(201,162,39,0.12)',
            borderRadius: '0.75rem',
            padding: '0.875rem 1.1rem',
            marginBottom: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.3rem',
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: 'rgba(201,162,39,0.7)' }}>{spread.icon}</span>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.85rem', color: 'rgba(201,162,39,0.8)' }}>{spread.name}</span>
            </div>
            <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.95rem', fontStyle: 'italic', color: 'rgba(232,213,183,0.55)', lineHeight: 1.4 }}>
              "{question}"
            </p>
          </div>

          {/* Cards grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {cards.map(card => {
              const isEditing = editingNum === card.num
              const isNotIdentified = card.card === 'No identificada' || card.card === 'Sin imagen'

              return (
                <div key={card.num}>
                  {/* Card row */}
                  <div
                    onClick={() => {
                      if (!isEditing) setEditingNum(card.num)
                      else setEditingNum(null)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      background: isEditing
                        ? 'rgba(201,162,39,0.1)'
                        : isNotIdentified
                          ? 'rgba(239,68,68,0.06)'
                          : 'rgba(17,0,37,0.7)',
                      border: `1px solid ${
                        isEditing ? 'rgba(201,162,39,0.5)'
                        : isNotIdentified ? 'rgba(239,68,68,0.2)'
                        : 'rgba(201,162,39,0.12)'
                      }`,
                      borderRadius: '0.6rem',
                      cursor: 'pointer',
                      transition: 'all 0.25s',
                    }}
                    onMouseEnter={e => !isEditing && (e.currentTarget.style.borderColor = 'rgba(201,162,39,0.3)')}
                    onMouseLeave={e => !isEditing && (e.currentTarget.style.borderColor = isNotIdentified ? 'rgba(239,68,68,0.2)' : 'rgba(201,162,39,0.12)')}
                  >
                    {/* Position number */}
                    <div style={{
                      flexShrink: 0,
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: isEditing ? 'rgba(201,162,39,0.2)' : 'rgba(201,162,39,0.1)',
                      border: `1px solid ${isEditing ? 'rgba(201,162,39,0.7)' : 'rgba(201,162,39,0.3)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'Cinzel, serif',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#c9a227',
                    }}>
                      {card.num}
                    </div>

                    {/* Card info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontFamily: 'EB Garamond, serif',
                        fontSize: '0.8rem',
                        color: 'rgba(232,213,183,0.45)',
                        lineHeight: 1.2,
                        marginBottom: '0.15rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {card.label}
                      </p>
                      <p style={{
                        fontFamily: 'Cinzel, serif',
                        fontSize: '0.95rem',
                        color: isNotIdentified ? '#fca5a5' : '#e8d5b7',
                        fontWeight: isNotIdentified ? 400 : 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {card.card}
                      </p>
                    </div>

                    {/* Reversed badge */}
                    <div style={{
                      flexShrink: 0,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px',
                      background: card.reversed ? 'rgba(239,68,68,0.1)' : 'rgba(201,162,39,0.08)',
                      border: `1px solid ${card.reversed ? 'rgba(239,68,68,0.3)' : 'rgba(201,162,39,0.2)'}`,
                      fontFamily: 'Cinzel, serif',
                      fontSize: '0.65rem',
                      color: card.reversed ? '#fca5a5' : 'rgba(201,162,39,0.7)',
                      letterSpacing: '0.05em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}>
                      <span>{card.reversed ? '🔄' : '🃏'}</span>
                      <span>{card.reversed ? 'INV' : 'DER'}</span>
                    </div>

                    {/* Edit icon */}
                    <div style={{
                      flexShrink: 0,
                      fontSize: '0.9rem',
                      color: isEditing ? '#c9a227' : 'rgba(201,162,39,0.3)',
                      transition: 'color 0.2s',
                    }}>
                      {isEditing ? '▲' : '✎'}
                    </div>
                  </div>

                  {/* Inline edit panel */}
                  {isEditing && editingCard && (
                    <CardEditPanel
                      card={editingCard}
                      onSave={saveCard}
                      onCancel={() => setEditingNum(null)}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Stats row */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            marginTop: '0.875rem',
            padding: '0.75rem',
            background: 'rgba(17,0,37,0.5)',
            border: '1px solid rgba(201,162,39,0.1)',
            borderRadius: '0.5rem',
            flexWrap: 'wrap',
          }}>
            <span style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.9rem', color: 'rgba(232,213,183,0.5)' }}>
              {cards.filter(c => c.reversed).length} invertidas · {cards.filter(c => c.reversed === false).length} derechas
            </span>
            <span style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.9rem', color: 'rgba(232,213,183,0.35)' }}>·</span>
            {cards.filter(c => c.card === 'No identificada' || c.card === 'Sin imagen').length > 0 && (
              <span style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.9rem', color: '#fca5a5' }}>
                ⚠ {cards.filter(c => c.card === 'No identificada' || c.card === 'Sin imagen').length} sin identificar
              </span>
            )}
          </div>
        </div>

        {/* Right: image + diagram */}
        <div className="animate-fade-in-up delay-200" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {imagePreview && (
            <div style={{
              borderRadius: '0.75rem',
              overflow: 'hidden',
              border: '1px solid rgba(201,162,39,0.2)',
              flexShrink: 0,
            }}>
              <img
                src={imagePreview}
                alt="Tu lectura"
                style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', display: 'block' }}
              />
            </div>
          )}

          {/* Diagram toggle */}
          <div style={{
            background: 'rgba(17,0,37,0.7)',
            border: '1px solid rgba(201,162,39,0.12)',
            borderRadius: '0.75rem',
            overflow: 'hidden',
          }}>
            <button
              onClick={() => setShowDiagram(!showDiagram)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(201,162,39,0.7)',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.78rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              <span>Diagrama de la Tirada</span>
              <span>{showDiagram ? '▲' : '▼'}</span>
            </button>
            {showDiagram && (
              <div style={{ padding: '0 1rem 1rem' }}>
                <SpreadDiagram spread={spread} compact />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm button */}
      <div style={{ maxWidth: '820px', margin: '1.25rem auto 0' }} className="animate-fade-in-up delay-300">
        <div style={{
          background: 'rgba(201,162,39,0.05)',
          border: '1px solid rgba(201,162,39,0.15)',
          borderRadius: '0.5rem',
          padding: '0.75rem 1rem',
          marginBottom: '0.875rem',
          fontFamily: 'EB Garamond, serif',
          fontSize: '0.95rem',
          color: 'rgba(232,213,183,0.55)',
          textAlign: 'center',
        }}>
          ✦ Una vez confirmes, el maestro tarotista interpretará con estas cartas exactas.
        </div>
        <button
          onClick={() => onConfirm(cards)}
          style={{
            width: '100%',
            padding: '1.1rem',
            background: 'linear-gradient(135deg, #8a6f1a, #c9a227, #8a6f1a)',
            backgroundSize: '200% auto',
            border: 'none',
            borderRadius: '0.75rem',
            color: '#060010',
            fontFamily: 'Cinzel, serif',
            fontSize: '1rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundPosition = 'right center'}
          onMouseLeave={e => e.currentTarget.style.backgroundPosition = 'left center'}
        >
          ✦ Confirmar Cartas y Revelar la Lectura ✦
        </button>
      </div>
    </div>
  )
}
