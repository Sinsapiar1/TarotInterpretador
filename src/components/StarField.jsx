import { useMemo } from 'react'

export default function StarField() {
  const stars = useMemo(() => {
    return Array.from({ length: 120 }, (_, i) => ({
      id: i,
      x: (i * 137.508) % 100,
      y: (i * 97.631) % 100,
      size: i % 3 === 0 ? 2 : i % 5 === 0 ? 1.5 : 1,
      delay: (i * 0.37) % 5,
      duration: 3 + (i % 4),
    }))
  }, [])

  const nebulas = [
    { x: 20, y: 30, r: 200, color: 'rgba(107,33,168,0.06)' },
    { x: 75, y: 60, r: 250, color: 'rgba(88,28,135,0.08)' },
    { x: 50, y: 10, r: 180, color: 'rgba(201,162,39,0.04)' },
    { x: 10, y: 80, r: 220, color: 'rgba(76,29,149,0.05)' },
  ]

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Nebula glow spots */}
      {nebulas.map((n, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${n.x}%`,
            top: `${n.y}%`,
            width: n.r,
            height: n.r,
            background: `radial-gradient(circle, ${n.color} 0%, transparent 70%)`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* Stars */}
      <svg className="absolute inset-0 w-full h-full">
        {stars.map(star => (
          <circle
            key={star.id}
            cx={`${star.x}%`}
            cy={`${star.y}%`}
            r={star.size}
            fill={star.id % 7 === 0 ? '#c9a227' : '#e8d5b7'}
            style={{
              animation: `twinkle ${star.duration}s ${star.delay}s ease-in-out infinite`,
              opacity: 0.4,
            }}
          />
        ))}
      </svg>
    </div>
  )
}
