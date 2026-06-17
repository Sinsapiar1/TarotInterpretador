function wrapText(text, maxChars, maxLines) {
  const words = text.split(' ')
  const lines = []
  let current = ''
  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length <= maxChars) {
      current = next
    } else {
      if (current) lines.push(current)
      current = word
      if (lines.length >= maxLines - 1) break
    }
  }
  if (current) lines.push(current)
  return lines.slice(0, maxLines)
}

export default function SpreadDiagram({ spread, compact = false, highlightNum = null }) {
  const svgW = 600

  // Compute the needed height from the spread's card positions
  const maxCardBottom = Math.max(...spread.positions.map(p => p.y + (p.h || 20) / 2))
  // Extra space below the bottom-most card: labels need ~14% in non-compact, ~6% in compact
  const extraY = compact ? 6 : 14
  const svgH = Math.round((maxCardBottom + extraY) * (svgW / 100) * (compact ? 0.52 : 0.60))

  const scaleX = svgW / 100
  const scaleY = svgH / 100

  const uid = spread.id // for unique gradient/filter IDs

  return (
    <div style={{
      width: '100%',
      maxWidth: compact ? '380px' : '580px',
      margin: '0 auto',
      // Extra bottom padding so labels below the SVG are never clipped
      paddingBottom: compact ? '4px' : '8px',
    }}>
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible', display: 'block' }}
      >
        <defs>
          <filter id={`glow-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id={`cg-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(201,162,39,0.20)" />
            <stop offset="100%" stopColor="rgba(107,33,168,0.12)" />
          </linearGradient>
          <linearGradient id={`cg-hi-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(201,162,39,0.50)" />
            <stop offset="100%" stopColor="rgba(201,162,39,0.22)" />
          </linearGradient>
        </defs>

        {spread.positions.map(pos => {
          const cx = pos.x * scaleX
          const cy = pos.y * scaleY
          const w  = (pos.w || 13) * scaleX
          const h  = (pos.h || 20) * scaleY
          const isHi = highlightNum === pos.num
          const isCrossing = !!pos.crossing

          // For a crossing card (Cruz Celta card 2), swap w/h to show it horizontal
          const rw = isCrossing ? h : w
          const rh = isCrossing ? w * 0.62 : h

          const rx = cx - rw / 2
          const ry = cy - rh / 2

          // Number font: big and centered
          const numSize = compact
            ? Math.max(8, rw * 0.30)
            : Math.max(13, rw * 0.38)

          // Short label below card (non-compact only, max 2 lines)
          const labelSize = Math.max(5.5, rw * 0.115)
          const firstWord = pos.label.split(' ')[0]
          const labelLines = !compact
            ? wrapText(firstWord.length > 10 ? pos.label : pos.label, 20, 2)
            : []

          return (
            <g
              key={pos.num}
              filter={`url(#glow-${uid})`}
              opacity={highlightNum && !isHi ? 0.35 : 1}
              style={{ transition: 'opacity 0.3s' }}
            >
              {/* Card body */}
              <rect
                x={rx} y={ry} width={rw} height={rh}
                rx={compact ? 3 : 5}
                fill={isHi ? `url(#cg-hi-${uid})` : `url(#cg-${uid})`}
                stroke={isHi ? 'rgba(201,162,39,0.95)' : isCrossing ? 'rgba(201,162,39,0.65)' : 'rgba(201,162,39,0.55)'}
                strokeWidth={isHi ? 1.5 : 1}
              />

              {/* Corner dots */}
              {!compact && (
                <>
                  <circle cx={rx + 4}      cy={ry + 4}      r={1.3} fill="rgba(201,162,39,0.35)" />
                  <circle cx={rx + rw - 4} cy={ry + rh - 4} r={1.3} fill="rgba(201,162,39,0.35)" />
                </>
              )}

              {/* Position number — large, centered */}
              <text
                x={cx}
                y={cy + numSize * 0.38}
                textAnchor="middle"
                fill={isHi ? '#ffe566' : '#c9a227'}
                fontSize={numSize}
                fontFamily="Cinzel, serif"
                fontWeight="bold"
                style={{ userSelect: 'none', letterSpacing: '-0.02em' }}
              >
                {pos.num}
              </text>

              {/* Label lines below card (non-compact) */}
              {!compact && labelLines.map((line, li) => (
                <text
                  key={li}
                  x={cx}
                  y={ry + rh + labelSize * 1.3 + li * (labelSize * 1.5)}
                  textAnchor="middle"
                  fill="rgba(232,213,183,0.62)"
                  fontSize={labelSize}
                  fontFamily="EB Garamond, serif"
                  style={{ userSelect: 'none' }}
                >
                  {line}
                </text>
              ))}
            </g>
          )
        })}
      </svg>

      {/* ── Full numbered list with placement instructions (non-compact only) ── */}
      {!compact && (
        <div style={{ marginTop: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {[...spread.positions].sort((a, b) => a.num - b.num).map(pos => (
            <div
              key={pos.num}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
                opacity: highlightNum && highlightNum !== pos.num ? 0.35 : 1,
                transition: 'opacity 0.3s',
              }}
            >
              {/* Number bubble */}
              <span style={{
                flexShrink: 0,
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: highlightNum === pos.num
                  ? 'rgba(201,162,39,0.25)'
                  : 'rgba(201,162,39,0.10)',
                border: `1px solid ${highlightNum === pos.num
                  ? 'rgba(201,162,39,0.85)'
                  : 'rgba(201,162,39,0.32)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.68rem',
                fontWeight: 700,
                color: highlightNum === pos.num ? '#ffe566' : '#c9a227',
              }}>
                {pos.num}
              </span>

              {/* Label + placement */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                <span style={{
                  fontFamily: 'EB Garamond, serif',
                  fontSize: '1rem',
                  color: 'rgba(232,213,183,0.85)',
                  lineHeight: 1.3,
                  fontWeight: pos.crossing ? 600 : 400,
                }}>
                  {pos.label}
                  {pos.crossing && (
                    <span style={{
                      marginLeft: '0.4rem',
                      fontFamily: 'Cinzel, serif',
                      fontSize: '0.65rem',
                      color: 'rgba(201,162,39,0.65)',
                      letterSpacing: '0.05em',
                    }}>
                      [HORIZONTAL]
                    </span>
                  )}
                </span>
                {pos.placement && (
                  <span style={{
                    fontFamily: 'EB Garamond, serif',
                    fontSize: '0.85rem',
                    color: 'rgba(201,162,39,0.55)',
                    fontStyle: 'italic',
                    lineHeight: 1.3,
                  }}>
                    → {pos.placement}
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Overall guide */}
          {spread.guide && (
            <div style={{
              marginTop: '0.75rem',
              padding: '0.75rem 1rem',
              background: 'rgba(201,162,39,0.05)',
              border: '1px solid rgba(201,162,39,0.15)',
              borderRadius: '0.5rem',
            }}>
              <p style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '0.68rem',
                color: 'rgba(201,162,39,0.6)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '0.3rem',
              }}>
                Guía de colocación
              </p>
              <p style={{
                fontFamily: 'EB Garamond, serif',
                fontSize: '0.95rem',
                color: 'rgba(232,213,183,0.65)',
                lineHeight: 1.6,
              }}>
                {spread.guide}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
