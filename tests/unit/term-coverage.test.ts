import { describe, it, expect } from 'vitest'
import fg from 'fast-glob'
import { readFileSync } from 'node:fs'
import { checkTermCoverage } from '@/lib/term-coverage'
import { glossary } from '@/content/data/glossary'

const TERMS = glossary.map((g) => g.term)

describe('checkTermCoverage (단위) — 규칙 자체를 검사', () => {
  it('본문 문단의 첫 등장이 <Term>으로 감싸져 있으면 통과한다', () => {
    const raw = '---\ntitle: t\n---\n\n<Term>역기획</Term>을 해봅니다. 역기획은 재밌습니다.\n'
    expect(checkTermCoverage('content/docs/x.mdx', raw, ['역기획'])).toEqual([])
  })

  it('본문 문단의 첫 등장이 안 감싸져 있으면 잡아낸다', () => {
    const raw = '---\ntitle: t\n---\n\n역기획을 해봅니다.\n'
    const issues = checkTermCoverage('content/docs/x.mdx', raw, ['역기획'])
    expect(issues).toHaveLength(1)
    expect(issues[0].term).toBe('역기획')
  })

  it('헤딩에만 등장하면(본문엔 없으면) 검사 대상이 아니다', () => {
    const raw = '---\ntitle: t\n---\n\n## 역기획 소개\n\n오늘은 다른 얘기를 합니다.\n'
    expect(checkTermCoverage('content/docs/x.mdx', raw, ['역기획'])).toEqual([])
  })

  it('헤딩을 건너뛰고 그다음 본문 등장을 요구한다', () => {
    const raw = '---\ntitle: t\n---\n\n## 역기획 소개\n\n역기획을 해봅니다.\n'
    // 헤딩의 '역기획'은 적격 위치가 아니므로, 본문의 '역기획'이 첫 적격 등장이고
    // 이게 안 감싸져 있으면 잡아야 한다.
    const issues = checkTermCoverage('content/docs/x.mdx', raw, ['역기획'])
    expect(issues).toHaveLength(1)
  })

  it('표 셀은 기본적으로 적격 위치가 아니다 (표에만 있으면 검사 대상 아님)', () => {
    const raw = '---\ntitle: t\n---\n\n| 용어 | 뜻 |\n|---|---|\n| 역기획 | ... |\n'
    expect(checkTermCoverage('content/docs/how/rules.mdx', raw, ['역기획'])).toEqual([])
  })

  it('예외 문서 목록에서는 표 셀도 적격 위치라 감싸지 않으면 잡는다', () => {
    const raw = '---\ntitle: t\n---\n\n| 용어 | 뜻 |\n|---|---|\n| 역기획 | ... |\n'
    const issues = checkTermCoverage('content/docs/templates/resources.mdx', raw, ['역기획'])
    expect(issues).toHaveLength(1)
  })

  it('코드블록 안의 등장은(적격 위치가 아니므로) 검사 대상이 아니다 — 예외 문서에서도 마찬가지', () => {
    const raw = '---\ntitle: t\n---\n\n```\n역기획을 해봅니다.\n```\n'
    expect(checkTermCoverage('content/docs/templates/prd.mdx', raw, ['역기획'])).toEqual([])
  })

  it('겹치는 용어 — "지표"가 "North Star 지표" 안의 부분 문자열로만 등장하면 "지표" 단독으로 채점하지 않는다', () => {
    const raw = '---\ntitle: t\n---\n\n<Term>North Star 지표</Term> 1개를 정합니다.\n'
    // "지표"의 유일한 등장이 "North Star 지표" 안이므로, 그 구간은 이미 선점되어
    // "지표" 자체는 이 문서에서 적격 등장이 없는 것으로 취급되어야 한다(=이슈 없음).
    expect(checkTermCoverage('content/docs/x.mdx', raw, ['North Star 지표', '지표'])).toEqual([])
  })

  it('"지표"가 "North Star 지표"와 별개로 독립 등장하면 그건 따로 채점한다', () => {
    const raw =
      '---\ntitle: t\n---\n\n<Term>North Star 지표</Term> 1개, 그리고 하위 지표 3개.\n'
    const issues = checkTermCoverage('content/docs/x.mdx', raw, ['North Star 지표', '지표'])
    expect(issues).toHaveLength(1)
    expect(issues[0].term).toBe('지표')
  })

  it('기호가 섞인 용어(0→1)도 정확히 매치한다', () => {
    const raw = '---\ntitle: t\n---\n\n<Term>0→1</Term>은 1→100과 다릅니다.\n'
    expect(checkTermCoverage('content/docs/x.mdx', raw, ['0→1'])).toEqual([])
  })
})

describe('checkTermCoverage (통합) — 실제 content/docs 전체', () => {
  it('glossary.mdx를 제외한 모든 문서에서, 적격 위치의 용어 첫 등장이 <Term>으로 감싸져 있다', async () => {
    const files = (await fg('content/docs/**/*.mdx')).filter(
      (f) => f !== 'content/docs/start/glossary.mdx',
    )
    expect(files.length).toBeGreaterThan(0)

    const allIssues = files.flatMap((file) => {
      const raw = readFileSync(file, 'utf-8')
      return checkTermCoverage(file, raw, TERMS)
    })

    if (allIssues.length > 0) {
      const detail = allIssues.map((i) => `  ${i.file}: ${i.message}`).join('\n')
      throw new Error(`Step 7b 커버리지 위반 ${allIssues.length}건:\n${detail}`)
    }
  })
})
