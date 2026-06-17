function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function inlineMd(text) {
  return escHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong class="gold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="purple">$1</em>')
}

function parseInterpretation(text) {
  if (!text) return []
  const lines = text.split('\n')
  const sections = []
  let current = null
  for (const line of lines) {
    const t = line.trim()
    if (t.startsWith('## ')) {
      if (current) sections.push(current)
      current = { type: 'h2', title: t.replace(/^##\s*/, ''), content: [] }
    } else if (t.startsWith('### ')) {
      if (current) sections.push(current)
      current = { type: 'h3', title: t.replace(/^###\s*/, ''), content: [] }
    } else if (t === '---') {
      if (current) sections.push(current)
      current = null
    } else if (current) {
      current.content.push(line)
    } else if (t) {
      current = { type: 'p', title: '', content: [line] }
    }
  }
  if (current) sections.push(current)
  return sections
}

function renderBody(section) {
  const text = section.content.join('\n').trim()
  if (!text) return ''
  return text.split(/\n\n+/).filter(p => p.trim()).map(p => {
    const t = p.trim()
    if (t.startsWith('**Carta:**')) {
      const card = t.replace('**Carta:**', '').trim()
      const inv = card.includes('INVERTIDA')
      return `<div class="card-badge ${inv ? 'inv' : 'der'}">${inv ? '🔄' : '🃏'}&nbsp;${inlineMd(card)}</div>`
    }
    return `<p>${inlineMd(t)}</p>`
  }).join('\n')
}

function renderSections(sections) {
  return sections.map(sec => {
    const body = renderBody(sec)

    if (sec.type === 'h2') {
      return `<div class="block h2-block">
  <h2>${inlineMd(sec.title)}</h2>
  <div class="body">${body}</div>
</div>`
    }

    if (sec.type === 'h3') {
      const isCard = /^\d+\s*[—–-]/.test(sec.title)
      if (isCard) {
        const num = sec.title.match(/^(\d+)/)?.[1] ?? ''
        const title = sec.title.replace(/^\d+\s*[—–-]\s*/, '')
        return `<div class="block card-block">
  <h3><span class="num-badge">${num}</span>${inlineMd(title)}</h3>
  <div class="body">${body}</div>
</div>`
      }
      return `<div class="block h3-block">
  <h3>${inlineMd(sec.title)}</h3>
  <div class="body">${body}</div>
</div>`
    }

    return `<div class="block">${body}</div>`
  }).join('\n')
}

function buildCardsTable(validatedCards, positions) {
  if (!validatedCards?.length) return ''
  const rows = [...validatedCards]
    .sort((a, b) => a.num - b.num)
    .map(card => {
      const pos = positions.find(p => p.num === card.num)
      const posLabel = pos ? escHtml(pos.label) : `Posición ${card.num}`
      const inv = card.reversed === true
      return `<tr>
        <td class="num-cell">${card.num}</td>
        <td>${posLabel}</td>
        <td><strong>${escHtml(card.card)}</strong></td>
        <td><span class="ori-badge ${inv ? 'inv' : 'der'}">${inv ? '↶ INVERTIDA' : '↑ DERECHA'}</span></td>
      </tr>`
    }).join('\n')

  return `<section class="cards-section">
  <p class="section-label">Cartas de la Tirada</p>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Posición</th>
        <th>Carta</th>
        <th>Orientación</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</section>`
}

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background-color: #060010;
    background-image:
      radial-gradient(ellipse 80% 40% at 15% 0%, rgba(107,33,168,0.18) 0%, transparent 70%),
      radial-gradient(ellipse 60% 35% at 85% 100%, rgba(201,162,39,0.09) 0%, transparent 70%),
      radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,0.35) 0%, transparent 100%),
      radial-gradient(1px 1px at 34% 7%,  rgba(255,255,255,0.25) 0%, transparent 100%),
      radial-gradient(1px 1px at 67% 22%, rgba(255,255,255,0.3) 0%, transparent 100%),
      radial-gradient(1px 1px at 88% 14%, rgba(201,162,39,0.45) 0%, transparent 100%),
      radial-gradient(1px 1px at 51% 42%, rgba(255,255,255,0.2) 0%, transparent 100%),
      radial-gradient(1px 1px at 23% 55%, rgba(201,162,39,0.3) 0%, transparent 100%),
      radial-gradient(1px 1px at 76% 61%, rgba(255,255,255,0.2) 0%, transparent 100%),
      radial-gradient(1px 1px at 44% 78%, rgba(255,255,255,0.25) 0%, transparent 100%),
      radial-gradient(1px 1px at 91% 83%, rgba(201,162,39,0.3) 0%, transparent 100%);
    color: rgba(232,213,183,0.88);
    font-family: 'EB Garamond', Georgia, 'Times New Roman', serif;
    font-size: 16px;
    line-height: 1.7;
    padding: 2.5rem 1rem 4rem;
    min-height: 100vh;
  }

  .container {
    max-width: 780px;
    margin: 0 auto;
    background: rgba(9,1,22,0.82);
    border: 1px solid rgba(201,162,39,0.16);
    border-radius: 1rem;
    overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(201,162,39,0.04),
      0 0 60px rgba(201,162,39,0.06),
      0 0 120px rgba(107,33,168,0.12),
      0 30px 80px rgba(0,0,0,0.6);
  }

  /* ── HEADER ── */
  .header {
    text-align: center;
    padding: 3rem 2.5rem 2.25rem;
    border-bottom: 1px solid rgba(201,162,39,0.13);
    background: linear-gradient(180deg, rgba(107,33,168,0.09) 0%, transparent 100%);
  }
  .brand {
    font-family: 'Cinzel', serif;
    font-size: 0.68rem;
    color: rgba(201,162,39,0.45);
    letter-spacing: 0.45em;
    text-transform: uppercase;
    margin-bottom: 1.75rem;
  }
  .spread-name {
    font-family: 'Cinzel', serif;
    font-size: clamp(1.5rem, 4vw, 2.2rem);
    color: #c9a227;
    line-height: 1.2;
    margin-bottom: 0.45rem;
    text-shadow: 0 0 30px rgba(201,162,39,0.35);
  }
  .spread-subtitle {
    font-style: italic;
    font-size: 1.05rem;
    color: rgba(232,213,183,0.45);
    margin-bottom: 0.65rem;
  }
  .meta-line {
    font-family: 'Cinzel', serif;
    font-size: 0.65rem;
    color: rgba(201,162,39,0.38);
    letter-spacing: 0.12em;
  }
  .ornament {
    color: rgba(201,162,39,0.28);
    letter-spacing: 0.55em;
    font-size: 0.8rem;
    margin: 1.2rem 0;
    font-family: serif;
  }
  .question-box {
    background: rgba(17,0,37,0.55);
    border: 1px solid rgba(201,162,39,0.18);
    border-radius: 0.6rem;
    padding: 1rem 1.4rem;
    margin-top: 1rem;
    text-align: left;
  }
  .question-label {
    font-family: 'Cinzel', serif;
    font-size: 0.6rem;
    color: rgba(201,162,39,0.48);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-bottom: 0.35rem;
  }
  .question-text {
    font-style: italic;
    font-size: 1.12rem;
    color: rgba(232,213,183,0.82);
    line-height: 1.65;
  }

  /* ── CARDS TABLE ── */
  .cards-section {
    padding: 1.75rem 2.5rem;
    border-bottom: 1px solid rgba(201,162,39,0.1);
  }
  .section-label {
    font-family: 'Cinzel', serif;
    font-size: 0.65rem;
    color: rgba(201,162,39,0.5);
    text-transform: uppercase;
    letter-spacing: 0.15em;
    margin-bottom: 1rem;
  }
  table { width: 100%; border-collapse: collapse; }
  th {
    font-family: 'Cinzel', serif;
    font-size: 0.62rem;
    color: rgba(201,162,39,0.5);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 0.45rem 0.7rem;
    text-align: left;
    border-bottom: 1px solid rgba(201,162,39,0.18);
  }
  td {
    font-size: 0.92rem;
    color: rgba(232,213,183,0.82);
    padding: 0.55rem 0.7rem;
    border-bottom: 1px solid rgba(201,162,39,0.05);
    vertical-align: middle;
  }
  tr:last-child td { border-bottom: none; }
  tr:nth-child(even) td { background: rgba(201,162,39,0.025); }
  .num-cell {
    font-family: 'Cinzel', serif;
    font-size: 0.78rem;
    color: #c9a227;
    width: 36px;
    text-align: center;
  }
  .ori-badge {
    font-family: 'Cinzel', serif;
    font-size: 0.62rem;
    padding: 0.18em 0.55em;
    border-radius: 0.3em;
    white-space: nowrap;
    letter-spacing: 0.04em;
  }
  .ori-badge.der {
    background: rgba(201,162,39,0.1);
    border: 1px solid rgba(201,162,39,0.28);
    color: #c9a227;
  }
  .ori-badge.inv {
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.24);
    color: #fca5a5;
  }

  /* ── INTERPRETATION ── */
  .interpretation { padding: 2rem 2.5rem; }

  .block { margin-bottom: 1.5rem; }
  .block p {
    font-size: 1.05rem;
    line-height: 1.85;
    color: rgba(232,213,183,0.88);
    margin-bottom: 0.8rem;
  }
  .block p:last-child { margin-bottom: 0; }

  .h2-block h2 {
    font-family: 'Cinzel', serif;
    font-size: 1.15rem;
    color: #c9a227;
    margin-bottom: 0.8rem;
    padding-bottom: 0.45rem;
    border-bottom: 1px solid rgba(201,162,39,0.22);
    letter-spacing: 0.03em;
  }
  .h3-block h3 {
    font-family: 'Cinzel', serif;
    font-size: 0.88rem;
    color: #c9a227;
    margin-bottom: 0.65rem;
  }
  .card-block {
    background: rgba(17,0,37,0.65);
    border: 1px solid rgba(201,162,39,0.13);
    border-radius: 0.6rem;
    padding: 1.1rem 1.3rem;
    margin-bottom: 1rem;
  }
  .card-block h3 {
    font-family: 'Cinzel', serif;
    font-size: 0.88rem;
    color: #e8c84a;
    margin-bottom: 0.7rem;
    display: flex;
    align-items: center;
    gap: 0.55em;
  }
  .num-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgba(201,162,39,0.14);
    border: 1px solid rgba(201,162,39,0.38);
    font-size: 0.68rem;
    color: #c9a227;
    flex-shrink: 0;
    font-family: 'Cinzel', serif;
  }
  .card-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.45em;
    padding: 0.28em 0.8em;
    border-radius: 0.35em;
    font-family: 'Cinzel', serif;
    font-size: 0.82rem;
    margin-bottom: 0.5em;
  }
  .card-badge.der {
    background: rgba(201,162,39,0.1);
    border: 1px solid rgba(201,162,39,0.28);
    color: #e8c84a;
  }
  .card-badge.inv {
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.22);
    color: #fca5a5;
  }

  .gold { color: #e8c84a; font-weight: 600; }
  .purple { color: #c4b0d8; }

  /* ── DIVIDER ── */
  .divider-line {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(201,162,39,0.35), transparent);
    margin: 0.5rem 0;
  }

  /* ── FOOTER ── */
  .footer {
    text-align: center;
    padding: 2rem 2.5rem 2.5rem;
    border-top: 1px solid rgba(201,162,39,0.1);
    background: linear-gradient(0deg, rgba(107,33,168,0.07) 0%, transparent 100%);
  }
  .footer-ornament {
    color: rgba(201,162,39,0.28);
    letter-spacing: 0.55em;
    font-size: 0.85rem;
    margin-bottom: 0.85rem;
  }
  .footer-quote {
    font-style: italic;
    font-size: 0.95rem;
    color: rgba(232,213,183,0.32);
    margin-bottom: 0.7rem;
    line-height: 1.6;
  }
  .footer-credit {
    font-family: 'Cinzel', serif;
    font-size: 0.6rem;
    color: rgba(201,162,39,0.28);
    letter-spacing: 0.12em;
  }

  /* ── PRINT ── */
  @media print {
    body {
      background: #fff;
      background-image: none;
      color: #1a0a00;
      padding: 0;
      font-size: 14px;
    }
    .container {
      border: none;
      box-shadow: none;
      background: #fff;
      border-radius: 0;
    }
    .header {
      background: none;
      border-bottom: 2px solid #c9a227;
      padding: 2rem 2rem 1.5rem;
    }
    .brand, .meta-line { color: rgba(139,101,20,0.7); }
    .spread-name { color: #8a6a10; text-shadow: none; font-size: 1.8rem; }
    .spread-subtitle, .question-text, .footer-quote { color: #3a2a10; }
    .question-box {
      background: #fdf8ee;
      border-color: #c9a227;
    }
    .question-label { color: #8a6a10; }
    .cards-section { border-bottom: 1px solid #d4b060; }
    .section-label { color: #8a6a10; }
    th { color: #8a6a10; border-bottom-color: #c9a227; }
    td { color: #2a1a00; border-bottom-color: #e8d5a0; }
    tr:nth-child(even) td { background: #fdf8ee; }
    .num-cell { color: #8a6a10; }
    .ori-badge.der { background: #fdf3d0; border-color: #c9a227; color: #8a6a10; }
    .ori-badge.inv { background: #fff0f0; border-color: #e88; color: #a00; }
    .h2-block h2 { color: #8a6a10; border-bottom-color: #c9a227; }
    .h3-block h3, .card-block h3 { color: #6a4a00; }
    .card-block {
      background: #fdf8ee;
      border-color: #d4b060;
    }
    .num-badge { background: #fdf3d0; border-color: #c9a227; color: #8a6a10; }
    .card-badge.der { background: #fdf3d0; border-color: #c9a227; color: #6a4a00; }
    .card-badge.inv { background: #fff0f0; border-color: #e88; color: #a00; }
    .block p { color: #2a1a00; }
    .gold { color: #6a4a00; }
    .purple { color: #4a2a6a; }
    .footer { background: none; border-top-color: #c9a227; }
    .footer-ornament, .footer-credit { color: rgba(139,101,20,0.5); }
    .footer-quote { color: #5a4a30; }
    .divider-line { background: #c9a227; }
  }
`

export function downloadReadingHTML({ spread, question, interpretation, validatedCards }) {
  const now = new Date()
  const dateStr = now.toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  const isoDate = now.toISOString().slice(0, 10)

  const sections = parseInterpretation(interpretation)
  const cardsTable = buildCardsTable(validatedCards, spread.positions)
  const interpretationHTML = renderSections(sections)

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Arcana · ${escHtml(spread.name)} · ${isoDate}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@400;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&display=swap" rel="stylesheet">
  <style>${CSS}</style>
</head>
<body>
  <div class="container">

    <header class="header">
      <div class="brand">✦ &nbsp; A R C A N A &nbsp; ✦</div>
      <h1 class="spread-name">${escHtml(spread.name)}</h1>
      <p class="spread-subtitle">${escHtml(spread.subtitle)}</p>
      <p class="meta-line">${escHtml(spread.origin)} &nbsp;·&nbsp; ${escHtml(spread.cards)} cartas &nbsp;·&nbsp; ${dateStr}, ${timeStr}</p>
      <div class="ornament">◈ &nbsp; ✦ &nbsp; ◈</div>
      <div class="question-box">
        <p class="question-label">Pregunta consultada</p>
        <p class="question-text">"${escHtml(question)}"</p>
      </div>
    </header>

    ${cardsTable}

    <section class="interpretation">
      ${interpretationHTML}
    </section>

    <div class="divider-line" style="margin: 0 2.5rem;"></div>

    <footer class="footer">
      <div class="footer-ornament">✦ &nbsp; ✦ &nbsp; ✦</div>
      <p class="footer-quote">El tarot no determina el futuro — lo ilumina. Tú tienes el poder de elegir.</p>
      <p class="footer-credit">GENERADO CON ARCANA &nbsp;·&nbsp; ${dateStr.toUpperCase()}</p>
    </footer>

  </div>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `arcana-${spread.id}-${isoDate}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
