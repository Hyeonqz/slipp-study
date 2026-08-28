'use client'

import { useState } from 'react'
import Link from 'next/link'
import { groupByWeek, groupByAuthor, type Submission } from '@/lib/archive'
import { curriculum } from '@/content/data/curriculum'

const chip = (on: boolean): React.CSSProperties => ({
  fontSize: 12.5,
  fontWeight: 700,
  padding: '6px 12px',
  borderRadius: 'var(--r-pill)',
  border: 'none',
  cursor: 'pointer',
  // 흰 글자를 얹는 채움 -> --blue-fill(Fix Round 2: 다크에서 --blue-text와
  // 갈라짐 — 흰 텍스트 대비를 만족하는 값이 텍스트-온-다크-배경 대비를
  // 만족하는 값과 반대 방향이라 --blue-text로는 다크에서 3.07:1까지 떨어졌다).
  background: on ? 'var(--blue-fill)' : 'var(--g100)',
  color: on ? '#fff' : 'var(--g700)',
})

/**
 * 회차별(기본)·작성자별 두 뷰를 모두 소유한다(브리프 상단 결정 2).
 *
 * `byAuthor` 필터 상태가 이 컴포넌트 안에 있으므로, 회차별 목록도 여기서
 * `{!byAuthor && (...)}` 조건으로 렌더해야 두 뷰가 동시에 보이는 문제가 없다.
 */
export function ArchiveFilters({ submissions }: { submissions: Submission[] }) {
  const [byAuthor, setByAuthor] = useState(false)

  return (
    <div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button style={chip(!byAuthor)} onClick={() => setByAuthor(false)}>회차별</button>
        <button style={chip(byAuthor)} onClick={() => setByAuthor(true)}>작성자별</button>
      </div>

      {!byAuthor && (
        <div>
          {groupByWeek(submissions).map((g) => {
            const w = curriculum.find((x) => x.no === g.week)!
            return (
              <section key={g.week} style={{ marginTop: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--g900)', margin: '0 0 8px' }}>
                  <span className="tabular">{g.week}회차</span> · {w.title}
                </h3>
                {g.items.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--g600)', margin: 0 }}>아직 없어요</p>
                ) : (
                  g.items.map((s) => (
                    <Link
                      key={s.url}
                      href={s.url}
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 10,
                        alignItems: 'baseline',
                        background: 'var(--g50)',
                        borderRadius: 'var(--r-block)',
                        padding: '11px 14px',
                        marginBottom: 6,
                        textDecoration: 'none',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14.5,
                          fontWeight: 700,
                          color: 'var(--g900)',
                          minWidth: 0,
                          overflowWrap: 'break-word',
                        }}
                      >
                        {s.title}
                      </span>
                      <span style={{ fontSize: 12.5, color: 'var(--g600)' }}>{s.author}</span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: 'var(--g700)',
                          background: 'var(--g100)',
                          borderRadius: 'var(--r-pill)',
                          padding: '2px 8px',
                        }}
                      >
                        {s.type}
                      </span>
                      <time className="tabular" style={{ fontSize: 12, color: 'var(--g600)', marginLeft: 'auto' }}>
                        {s.date}
                      </time>
                    </Link>
                  ))
                )}
              </section>
            )
          })}
        </div>
      )}

      {byAuthor && (
        <div style={{ marginTop: 16 }}>
          {groupByAuthor(submissions).map((g) => (
            <section key={g.author} style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--g900)', margin: '0 0 6px' }}>
                {g.author}
              </h3>
              {g.items.map((s) => (
                <Link
                  key={s.url}
                  href={s.url}
                  style={{
                    display: 'block',
                    fontSize: 14,
                    color: 'var(--g700)',
                    padding: '6px 0',
                    textDecoration: 'none',
                  }}
                >
                  <span className="tabular">{s.week}회차</span> · {s.title}
                </Link>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
