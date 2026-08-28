'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { groupByWeek, groupByAuthor, type Submission } from '@/lib/archive'
import { curriculum } from '@/content/data/curriculum'
import { ARCHIVE_TYPES } from '@/content/data/archive-types'

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
 * 종류별 필터 칩(Fix Wave finding 1). 위 `chip`(회차별/작성자별 뷰 토글)과
 * 일부러 다른 크기·색으로 만든다 — 토글은 "둘 중 하나가 항상 선택돼 있는
 * 뷰 전환"이고, 이건 "0개도 될 수 있는 좁히기(필터)"라 역할이 다르다. 같은
 * 크기·색이면 8개 칩이 한 줄의 동일한 선택지처럼 보여 사용자가 뷰 토글과
 * 종류 필터를 같은 축으로 착각한다(브리프 지적). 캡션 라벨 + 더 작은 칩 +
 * 별도 줄로 구조적으로 분리한다.
 */
const typeChip = (on: boolean): React.CSSProperties => ({
  fontSize: 12,
  fontWeight: 700,
  padding: '5px 10px',
  borderRadius: 'var(--r-pill)',
  border: 'none',
  cursor: 'pointer',
  background: on ? 'var(--blue-fill)' : 'var(--g100)',
  color: on ? '#fff' : 'var(--g600)',
})

/**
 * 회차별(기본)·작성자별 두 뷰를 모두 소유한다(브리프 상단 결정 2).
 *
 * `byAuthor` 필터 상태가 이 컴포넌트 안에 있으므로, 회차별 목록도 여기서
 * `{!byAuthor && (...)}` 조건으로 렌더해야 두 뷰가 동시에 보이는 문제가 없다.
 *
 * `type` 필터(Fix Wave finding 1)는 별도 축이다 — 회차별/작성자별 "그룹 방식"을
 * 바꾸지 않고, 그 위에서 목록을 좁히기만 한다. 그래서 필터 상태
 * (`selectedType`)는 `byAuthor`와 독립적으로 두고, 두 뷰 모두 같은
 * `filtered` 배열을 넘겨받는다.
 */
export function ArchiveFilters({ submissions }: { submissions: Submission[] }) {
  const [byAuthor, setByAuthor] = useState(false)
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const filtered = useMemo(
    () => (selectedType ? submissions.filter((s) => s.type === selectedType) : submissions),
    [submissions, selectedType],
  )

  return (
    // 전체 폭: 제출물이 쌓이면 회차별 그리드가 좌우로 넓어야 한 화면에 더 들어온다
    // (app/global.css 의 .fullbleed 참고 — 본문 720px 상한에서 빠져나온다).
    <div className="fullbleed">
      <div style={{ display: 'flex', gap: 6 }}>
        <button style={chip(!byAuthor)} onClick={() => setByAuthor(false)}>회차별</button>
        <button style={chip(byAuthor)} onClick={() => setByAuthor(true)}>작성자별</button>
      </div>

      <div style={{ marginTop: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--g600)', margin: '0 0 6px' }}>
          종류로 좁혀볼까요?
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <button style={typeChip(selectedType === null)} onClick={() => setSelectedType(null)}>
            전체
          </button>
          {ARCHIVE_TYPES.map((t) => (
            <button key={t} style={typeChip(selectedType === t)} onClick={() => setSelectedType(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p style={{ fontSize: 14, color: 'var(--g600)', marginTop: 20 }}>
          {selectedType} 제출물은 아직 없어요.
        </p>
      ) : (
        <>
      {!byAuthor && (
        <div>
          {groupByWeek(filtered).map((g) => {
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
          {groupByAuthor(filtered).map((g) => (
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
        </>
      )}
    </div>
  )
}
