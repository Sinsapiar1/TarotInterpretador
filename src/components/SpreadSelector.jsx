import { useState } from 'react'
import { SPREADS, SPREAD_CATEGORIES } from '../data/spreads'
import SpreadDiagram from './SpreadDiagram'

export default function SpreadSelector({ onSelect, modelInfo }) {
  const [activeCategory, setActiveCategory] = useState('basicas')
  const [expandedSpread, setExpandedSpread] = useState(null)

  const filtered = SPREADS.filter(s => s.category === activeCategory)

  return (
    <div className="min-h-screen px-4 py-12 relative" style={{ zIndex: 10 }}>
      {/* Header */}
      <div className="text-center mb-10 animate-fade-in-up">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <span
            style={{
              fontFamily: 'Cinzel Decorative, serif',
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              color: '#c9a227',
              filter: 'drop-shadow(0 0 20px rgba(201,162,39,0.4))',
            }}
          >
            Arcana
          </span>
        </div>
        <h2
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
            color: 'rgba(232,213,183,0.8)',
            letterSpacing: '0.15em',
            fontWeight: 400,
          }}
        >
          Elige tu Tirada
        </h2>
        <div style={{ margin: '1rem auto', width: '150px', height: '1px', background: 'linear-gradient(90deg, transparent, #c9a227, transparent)' }} />
        <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '1.05rem', color: 'rgba(232,213,183,0.55)', maxWidth: '500px', margin: '0 auto' }}>
          25 tiradas certificadas de las tradiciones esotéricas más importantes. Cada una diseñada para revelar una dimensión específica de tu realidad.
        </p>

        {/* Model badge */}
        {modelInfo && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginTop: '1rem',
              padding: '0.25rem 0.75rem',
              background: 'rgba(201,162,39,0.08)',
              border: '1px solid rgba(201,162,39,0.25)',
              borderRadius: '999px',
              fontFamily: 'EB Garamond, serif',
              fontSize: '0.85rem',
              color: 'rgba(201,162,39,0.8)',
            }}
          >
            ✦ {modelInfo.label}
          </div>
        )}
      </div>

      {/* Category tabs */}
      <div
        className="flex flex-wrap justify-center gap-2 mb-8 animate-fade-in-up delay-100"
        style={{ maxWidth: '800px', margin: '0 auto 2rem' }}
      >
        {SPREAD_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setActiveCategory(cat.id); setExpandedSpread(null) }}
            style={{
              padding: '0.5rem 1.25rem',
              background: activeCategory === cat.id
                ? 'linear-gradient(135deg, rgba(201,162,39,0.2), rgba(201,162,39,0.1))'
                : 'rgba(17,0,37,0.6)',
              border: `1px solid ${activeCategory === cat.id ? 'rgba(201,162,39,0.6)' : 'rgba(201,162,39,0.15)'}`,
              borderRadius: '999px',
              color: activeCategory === cat.id ? '#c9a227' : 'rgba(232,213,183,0.5)',
              fontFamily: 'Cinzel, serif',
              fontSize: '0.78rem',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Spread cards grid */}
      <div
        className="grid gap-4 mx-auto animate-fade-in-up delay-200"
        style={{
          maxWidth: '900px',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        }}
      >
        {filtered.map((spread, i) => {
          const isExpanded = expandedSpread === spread.id
          return (
            <div
              key={spread.id}
              style={{
                background: isExpanded
                  ? 'linear-gradient(135deg, rgba(201,162,39,0.08), rgba(17,0,37,0.99))'
                  : 'rgba(17,0,37,0.85)',
                border: `1px solid ${isExpanded ? 'rgba(201,162,39,0.5)' : 'rgba(201,162,39,0.15)'}`,
                borderRadius: '0.875rem',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                transform: isExpanded ? 'scale(1.01)' : 'scale(1)',
                boxShadow: isExpanded ? '0 0 40px rgba(201,162,39,0.12)' : 'none',
                animationDelay: `${i * 0.05}s`,
              }}
              onClick={() => setExpandedSpread(isExpanded ? null : spread.id)}
            >
              {/* Card header */}
              <div style={{ padding: '1.25rem 1.25rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '1.1rem', color: '#c9a227' }}>{spread.icon}</span>
                      <h3
                        style={{
                          fontFamily: 'Cinzel, serif',
                          fontSize: '1rem',
                          color: '#e8d5b7',
                          fontWeight: 600,
                          lineHeight: 1.2,
                        }}
                      >
                        {spread.name}
                      </h3>
                    </div>
                    <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.85rem', color: 'rgba(201,162,39,0.7)', lineHeight: 1.3 }}>
                      {spread.subtitle}
                    </p>
                  </div>
                  <div
                    style={{
                      flexShrink: 0,
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(201,162,39,0.1)',
                      border: '1px solid rgba(201,162,39,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'EB Garamond, serif',
                      fontSize: '0.8rem',
                      color: '#c9a227',
                      fontWeight: 700,
                    }}
                  >
                    {spread.cards}
                  </div>
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div
                  className="animate-fade-in"
                  style={{ padding: '0 1.25rem 1.25rem' }}
                  onClick={e => e.stopPropagation()}
                >
                  {/* Divider */}
                  <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,162,39,0.3), transparent)', marginBottom: '1rem' }} />

                  {/* Origin badge */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <span style={{
                      fontFamily: 'Cinzel, serif',
                      fontSize: '0.7rem',
                      color: 'rgba(201,162,39,0.6)',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}>
                      Origen: {spread.origin}
                    </span>
                  </div>

                  {/* Description */}
                  <p style={{
                    fontFamily: 'EB Garamond, serif',
                    fontSize: '1rem',
                    color: 'rgba(232,213,183,0.8)',
                    lineHeight: 1.7,
                    marginBottom: '0.875rem',
                  }}>
                    {spread.description}
                  </p>

                  {/* When to use */}
                  <div
                    style={{
                      background: 'rgba(201,162,39,0.05)',
                      border: '1px solid rgba(201,162,39,0.15)',
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.7rem', color: 'rgba(201,162,39,0.7)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Cuándo usarla
                    </p>
                    <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.95rem', color: 'rgba(232,213,183,0.7)', lineHeight: 1.5 }}>
                      {spread.whenToUse}
                    </p>
                  </div>

                  {/* Diagram */}
                  <div style={{ marginBottom: '1rem', opacity: 0.85 }}>
                    <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.7rem', color: 'rgba(201,162,39,0.6)', textAlign: 'center', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Diagrama de posiciones
                    </p>
                    <SpreadDiagram spread={spread} compact />
                  </div>

                  {/* Select button */}
                  <button
                    onClick={() => onSelect(spread)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'linear-gradient(135deg, #8a6f1a, #c9a227, #8a6f1a)',
                      backgroundSize: '200% auto',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: '#060010',
                      fontFamily: 'Cinzel, serif',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={e => e.target.style.backgroundPosition = 'right center'}
                    onMouseLeave={e => e.target.style.backgroundPosition = 'left center'}
                  >
                    Elegir esta Tirada ✦
                  </button>
                </div>
              )}

              {/* Collapsed footer */}
              {!isExpanded && (
                <div style={{ padding: '0.5rem 1.25rem 0.875rem' }}>
                  <p style={{
                    fontFamily: 'EB Garamond, serif',
                    fontSize: '0.88rem',
                    color: 'rgba(232,213,183,0.4)',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {spread.description}
                  </p>
                  <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.7rem', color: 'rgba(201,162,39,0.4)', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Toca para expandir
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
