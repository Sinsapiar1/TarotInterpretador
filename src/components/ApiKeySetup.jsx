import { useState } from 'react'
import { detectBestModel } from '../utils/gemini'

export default function ApiKeySetup({ onConnected }) {
  const [apiKey, setApiKey] = useState('')
  const [status, setStatus] = useState('idle') // idle | checking | success | error
  const [modelInfo, setModelInfo] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [showKey, setShowKey] = useState(false)

  async function handleConnect() {
    if (!apiKey.trim()) return
    setStatus('checking')
    setErrorMsg('')
    setModelInfo(null)
    try {
      const model = await detectBestModel(apiKey.trim())
      setModelInfo(model)
      setStatus('success')
      setTimeout(() => onConnected({ apiKey: apiKey.trim(), model }), 1800)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message)
    }
  }

  const tierLabels = { latest: 'Última Generación', fast: 'Alta Velocidad', pro: 'Profesional' }
  const tierColors = { latest: '#c9a227', fast: '#a78bfa', pro: '#34d399' }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative" style={{ zIndex: 10 }}>

      {/* Logo / Título */}
      <div className="text-center mb-12 animate-fade-in-up">
        {/* Ornamental ring */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div
            className="absolute inset-0 rounded-full border-2 animate-spin-slow"
            style={{ borderColor: 'rgba(201,162,39,0.3)' }}
          />
          <div
            className="absolute inset-3 rounded-full border animate-spin-reverse"
            style={{ borderColor: 'rgba(201,162,39,0.2)', borderStyle: 'dashed' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span style={{ fontSize: '3rem' }}>🌙</span>
          </div>
        </div>

        <h1
          className="shimmer-text mb-3"
          style={{
            fontFamily: 'Cinzel Decorative, serif',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          Arcana
        </h1>
        <p
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '0.85rem',
            letterSpacing: '0.3em',
            color: 'rgba(201,162,39,0.7)',
            textTransform: 'uppercase',
          }}
        >
          Intérprete de Tarot Rider · Waite
        </p>

        <div className="mt-6 mx-auto" style={{ width: '200px', height: '1px', background: 'linear-gradient(90deg, transparent, #c9a227, transparent)' }} />
      </div>

      {/* Card de conexión */}
      <div
        className="w-full max-w-lg animate-fade-in-up delay-200"
        style={{
          background: 'linear-gradient(135deg, rgba(17,0,37,0.98) 0%, rgba(13,0,32,0.95) 100%)',
          border: '1px solid rgba(201,162,39,0.25)',
          borderRadius: '1rem',
          padding: '2.5rem',
          boxShadow: '0 0 60px rgba(107,33,168,0.2), 0 0 120px rgba(0,0,0,0.5)',
        }}
      >
        <h2
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '1.1rem',
            color: '#c9a227',
            marginBottom: '0.5rem',
            textAlign: 'center',
          }}
        >
          Conecta tu Oracle de Gemini
        </h2>
        <p
          style={{
            fontFamily: 'EB Garamond, serif',
            fontSize: '1.05rem',
            color: 'rgba(232,213,183,0.7)',
            textAlign: 'center',
            marginBottom: '2rem',
            lineHeight: 1.6,
          }}
        >
          Ingresa tu API key de Google AI Studio para activar el intérprete maestro. La clave se usa directamente en tu navegador — nunca se envía a ningún servidor.
        </p>

        {/* Input */}
        <div className="relative mb-4">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && status !== 'checking' && handleConnect()}
            placeholder="AIza..."
            style={{
              width: '100%',
              padding: '0.875rem 3rem 0.875rem 1.25rem',
              background: 'rgba(6,0,16,0.8)',
              border: `1px solid ${status === 'error' ? '#ef4444' : status === 'success' ? '#c9a227' : 'rgba(201,162,39,0.3)'}`,
              borderRadius: '0.5rem',
              color: '#e8d5b7',
              fontFamily: 'monospace',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'border-color 0.3s, box-shadow 0.3s',
              boxShadow: status === 'success' ? '0 0 15px rgba(201,162,39,0.2)' : 'none',
            }}
            disabled={status === 'checking' || status === 'success'}
          />
          <button
            onClick={() => setShowKey(!showKey)}
            style={{
              position: 'absolute',
              right: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(201,162,39,0.5)',
              fontSize: '1rem',
            }}
          >
            {showKey ? '🙈' : '👁'}
          </button>
        </div>

        {/* Error */}
        {status === 'error' && (
          <div
            className="animate-fade-in-up mb-4"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              color: '#fca5a5',
              fontFamily: 'EB Garamond, serif',
              fontSize: '1rem',
            }}
          >
            ⚠ {errorMsg}
          </div>
        )}

        {/* Success */}
        {status === 'success' && modelInfo && (
          <div
            className="animate-fade-in-up mb-4"
            style={{
              background: 'rgba(201,162,39,0.08)',
              border: '1px solid rgba(201,162,39,0.4)',
              borderRadius: '0.5rem',
              padding: '0.875rem 1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '1.25rem' }}>✦</span>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.9rem', color: '#c9a227' }}>
                Conexión establecida
              </span>
            </div>
            <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '1rem', color: '#e8d5b7' }}>
              Usando{' '}
              <strong style={{ color: tierColors[modelInfo.tier] }}>
                {modelInfo.label}
              </strong>
              {' '}— {tierLabels[modelInfo.tier]}
            </p>
            <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.9rem', color: 'rgba(232,213,183,0.5)', marginTop: '0.25rem' }}>
              Redirigiendo al sanctuario...
            </p>
          </div>
        )}

        {/* Button */}
        {status !== 'success' && (
          <button
            onClick={handleConnect}
            disabled={!apiKey.trim() || status === 'checking'}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: !apiKey.trim() || status === 'checking'
                ? 'rgba(201,162,39,0.15)'
                : 'linear-gradient(135deg, #8a6f1a, #c9a227, #8a6f1a)',
              backgroundSize: '200% auto',
              border: '1px solid rgba(201,162,39,0.4)',
              borderRadius: '0.5rem',
              color: !apiKey.trim() || status === 'checking' ? 'rgba(201,162,39,0.5)' : '#060010',
              fontFamily: 'Cinzel, serif',
              fontSize: '0.95rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              cursor: !apiKey.trim() || status === 'checking' ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
            }}
          >
            {status === 'checking' ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid #c9a227', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite' }} />
                Detectando modelo...
              </span>
            ) : 'Activar el Oráculo ✦'}
          </button>
        )}

        {/* Link */}
        <p
          style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            fontFamily: 'EB Garamond, serif',
            fontSize: '0.95rem',
            color: 'rgba(232,213,183,0.45)',
          }}
        >
          Obtén tu API key gratuita en{' '}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'rgba(201,162,39,0.6)', textDecoration: 'underline' }}
          >
            Google AI Studio
          </a>
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-3 gap-4 mt-10 w-full max-w-lg animate-fade-in-up delay-400">
        {[
          { icon: '🔮', title: 'IA Maestra', desc: '35 años de experiencia en el alma del modelo' },
          { icon: '🃏', title: 'Rider-Waite', desc: 'Reconocimiento visual de las 78 cartas' },
          { icon: '🔐', title: '100% Privado', desc: 'Tu key nunca sale de tu navegador' },
        ].map(f => (
          <div
            key={f.title}
            style={{
              background: 'rgba(17,0,37,0.7)',
              border: '1px solid rgba(201,162,39,0.12)',
              borderRadius: '0.75rem',
              padding: '1rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{f.icon}</div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: '#c9a227', marginBottom: '0.25rem' }}>
              {f.title}
            </div>
            <div style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.85rem', color: 'rgba(232,213,183,0.5)', lineHeight: 1.4 }}>
              {f.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
