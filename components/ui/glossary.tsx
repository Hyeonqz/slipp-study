'use client'

import { useMemo, useState } from 'react'
import { glossary } from '@/content/data/glossary'

export function Glossary() {
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return glossary
    return glossary.filter(
      (g) =>
        g.term.toLowerCase().includes(needle) ||
        g.definition.toLowerCase().includes(needle),
    )
  }, [q])

  return (
    <div>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="어떤 용어가 궁금하세요?"
        style={{
          width: '100%',
          background: 'var(--g100)',
          border: 'none',
          borderRadius: 'var(--r-block)',
          padding: '12px 16px',
          fontSize: 15,
          color: 'var(--g900)',
          outlineColor: 'var(--blue)',
        }}
      />

      {filtered.length === 0 ? (
        <p style={{ color: 'var(--g600)', marginTop: 20 }}>찾는 용어가 없어요.</p>
      ) : (
        <div style={{ marginTop: 12 }}>
          {filtered.map((g) => (
            <details
              key={g.term}
              style={{
                background: 'var(--g50)',
                borderRadius: 'var(--r-block)',
                padding: '12px 16px',
                marginBottom: 8,
              }}
            >
              <summary style={{ fontWeight: 700, color: 'var(--g900)', cursor: 'pointer' }}>
                {g.term}
              </summary>
              <p style={{ color: 'var(--g700)', marginTop: 8, lineHeight: 1.75 }}>{g.definition}</p>
              {g.example && (
                <p style={{ color: 'var(--g600)', marginTop: 6, fontSize: 13 }}>예: {g.example}</p>
              )}
            </details>
          ))}
        </div>
      )}
    </div>
  )
}
