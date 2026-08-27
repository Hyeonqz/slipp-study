import { describe, it, expect } from 'vitest'
import {
  checkCurriculumSlugs,
  checkArchiveFrontmatter,
  checkTerms,
  checkInternalLinks,
  docPathToUrl,
  normalizeDateValue,
} from '@/lib/validators'
import { ARCHIVE_TYPES } from '@/content/data/archive-types'

describe('checkCurriculumSlugs', () => {
  it('일치하면 문제가 없다', () => {
    expect(checkCurriculumSlugs(['01-a', '02-b'], ['01-a', '02-b'])).toEqual([])
  })

  it('curriculum에 있는데 파일이 없으면 잡는다', () => {
    const issues = checkCurriculumSlugs(['01-a'], ['01-a', '02-b'])
    expect(issues).toHaveLength(1)
    expect(issues[0].message).toContain('02-b')
  })

  it('파일은 있는데 curriculum에 없으면 잡는다', () => {
    const issues = checkCurriculumSlugs(['01-a', '99-x'], ['01-a'])
    expect(issues).toHaveLength(1)
    expect(issues[0].message).toContain('99-x')
  })
})

describe('checkArchiveFrontmatter', () => {
  const ok = { title: 'T', week: 2, author: '홍길동', type: '역기획', date: '2026-09-15' }

  it('완전한 frontmatter를 통과시킨다', () => {
    expect(checkArchiveFrontmatter('a.mdx', ok)).toEqual([])
  })

  it('빠진 필드를 전부 보고한다', () => {
    const issues = checkArchiveFrontmatter('a.mdx', { title: 'T' })
    expect(issues.map((i) => i.message).join(' ')).toMatch(/week/)
    expect(issues.map((i) => i.message).join(' ')).toMatch(/author/)
    expect(issues.map((i) => i.message).join(' ')).toMatch(/type/)
    expect(issues.map((i) => i.message).join(' ')).toMatch(/date/)
  })

  it('week 범위를 검사한다', () => {
    expect(checkArchiveFrontmatter('a.mdx', { ...ok, week: 9 })).not.toEqual([])
  })

  it('content/data/archive-types.ts에 정의된 모든 type을 통과시킨다 (단일 원천 검증)', () => {
    for (const type of ARCHIVE_TYPES) {
      expect(checkArchiveFrontmatter('a.mdx', { ...ok, type })).toEqual([])
    }
  })

  it('ARCHIVE_TYPES에 없는 type을 잡는다', () => {
    const issues = checkArchiveFrontmatter('a.mdx', { ...ok, type: '없는타입' })
    expect(issues).toHaveLength(1)
    expect(issues[0].message).toContain('없는타입')
  })

  it('YAML이 date를 Date 객체로 파싱해도 (따옴표 없는 date: 2026-09-15) 형식 검사는 통과한다', () => {
    // gray-matter(js-yaml)는 frontmatter의 따옴표 없는 날짜를 문자열이 아니라
    // 실제 Date 인스턴스로 파싱한다. String(date)는 로캘 문자열이 되어
    // YYYY-MM-DD 정규식과 어긋나므로, 이를 정규화하지 않으면 정상 문서가
    // 오탐으로 실패한다.
    //
    // 주의: 이 테스트는 checkArchiveFrontmatter가 '형식'만 검사한다는 점의
    // 한계를 그대로 물려받는다 — 정규화된 문자열이 YYYY-MM-DD 모양이기만 하면
    // 통과이므로, 날짜 값 자체가 하루 밀리는 회귀(정확히 이 태스크의 리뷰에서
    // 지적된 종류)는 이 테스트로 잡을 수 없다. 그 회귀는 아래
    // `normalizeDateValue` 전용 테스트가 값 자체를 비교해서 잡는다.
    const parsedByYaml = new Date(Date.UTC(2026, 8, 15))
    expect(checkArchiveFrontmatter('a.mdx', { ...ok, date: parsedByYaml })).toEqual([])
  })
})

describe('normalizeDateValue', () => {
  it('문자열은 그대로 통과시킨다', () => {
    expect(normalizeDateValue('2026-09-15')).toBe('2026-09-15')
  })

  it('YAML이 파싱한 UTC 자정 Date를 호스트 타임존과 무관하게 정확한 UTC 날짜로 복원한다', () => {
    // 이 값 자체(2026-09-15)를 검증하는 것이 핵심이다 — checkArchiveFrontmatter를
    // 통해 간접적으로 "통과/실패"만 보면, 날짜가 하루 밀려도 YYYY-MM-DD
    // 형식 자체는 그대로라서 그 회귀를 못 잡는다(위 describe 블록 참고).
    //
    // 또한 UTC/양의 오프셋 호스트(한국 포함, Vercel 빌드 환경 상당수도 마찬가지)
    // 에서는 자정 UTC 시각을 로컬 getter로 읽어도 같은 날짜로 남기 때문에,
    // 여기서 타임존을 바꾸지 않으면 normalizeDateValue가 getUTC*를
    // getFullYear류(로컬)로 잘못 되돌려도 이 테스트가 우연히 통과해버린다.
    // 그래서 음의 오프셋 타임존(America/New_York)으로 강제 전환해 자정 UTC가
    // 로컬로는 전날이 되는 조건을 만든 뒤 정확한 값을 비교한다. TZ 오버라이드가
    // 이 vitest(jsdom) 환경에서 실제로 적용되는지, 그리고 이 테스트가
    // getUTC*→getFullYear류로 되돌리는 회귀를 실제로 잡는지는 직접 스왑해서
    // 확인했다 (task-5-report.md의 Fix Round 1 참고).
    const originalTZ = process.env.TZ
    process.env.TZ = 'America/New_York'
    try {
      const parsedByYaml = new Date(Date.UTC(2026, 8, 15))
      expect(normalizeDateValue(parsedByYaml)).toBe('2026-09-15')
    } finally {
      process.env.TZ = originalTZ
    }
  })
})

describe('checkTerms', () => {
  const known = new Set(['PRD', 'MVP'])

  it('사전에 있는 용어를 통과시킨다', () => {
    expect(checkTerms('a.mdx', '<Term>PRD</Term>를 씁니다', known)).toEqual([])
  })

  it('사전에 없는 용어를 잡는다', () => {
    const issues = checkTerms('a.mdx', '<Term>ARPU</Term>', known)
    expect(issues).toHaveLength(1)
    expect(issues[0].message).toContain('ARPU')
  })

  it('한 파일의 여러 용어를 모두 검사한다', () => {
    expect(checkTerms('a.mdx', '<Term>PRD</Term><Term>ARPU</Term>', known)).toHaveLength(1)
  })
})

describe('checkInternalLinks', () => {
  const urls = new Set(['/', '/weeks/04-prd', '/weeks/05-user-interview', '/archive'])

  it('존재하는 내부 링크를 통과시킨다', () => {
    expect(checkInternalLinks('a.mdx', '[4주차](/weeks/04-prd)', urls)).toEqual([])
  })

  it('깨진 내부 링크를 잡는다', () => {
    const issues = checkInternalLinks('a.mdx', '[없음](/weeks/99-x)', urls)
    expect(issues).toHaveLength(1)
    expect(issues[0].message).toContain('/weeks/99-x')
  })

  it('외부 링크와 앵커는 검사하지 않는다', () => {
    expect(checkInternalLinks('a.mdx', '[구글](https://google.com) [앵커](#준비물)', urls)).toEqual([])
  })

  it('링크 뒤 앵커를 떼고 검사한다', () => {
    expect(checkInternalLinks('a.mdx', '[x](/weeks/04-prd#준비물)', urls)).toEqual([])
  })

  it('같은 디렉토리를 가리키는 상대 링크를 파일 경로 기준으로 해석한다', () => {
    expect(
      checkInternalLinks(
        'content/docs/weeks/04-prd.mdx',
        '[5주차](./05-user-interview)',
        urls,
      ),
    ).toEqual([])
  })

  it('깨진 상대 링크를 잡는다', () => {
    const issues = checkInternalLinks(
      'content/docs/weeks/04-prd.mdx',
      '[없음](./99-nope)',
      urls,
    )
    expect(issues).toHaveLength(1)
    expect(issues[0].message).toContain('./99-nope')
  })

  it('상위 디렉토리로 올라가는 상대 링크도 해석한다', () => {
    expect(
      checkInternalLinks('content/docs/weeks/04-prd.mdx', '[아카이브](../archive)', urls),
    ).toEqual([])
  })

  it('이미지 등 정적 자산 링크는 페이지 링크로 취급하지 않는다', () => {
    expect(
      checkInternalLinks('a.mdx', '![로고](/images/logo.png)', urls),
    ).toEqual([])
  })
})

describe('docPathToUrl', () => {
  it('루트 index.mdx를 /로 매핑한다', () => {
    expect(docPathToUrl('content/docs/index.mdx')).toBe('/')
  })

  it('폴더의 index.mdx를 폴더 경로로 매핑한다', () => {
    expect(docPathToUrl('content/docs/archive/index.mdx')).toBe('/archive')
  })

  it('일반 문서를 슬러그 경로로 매핑한다', () => {
    expect(docPathToUrl('content/docs/weeks/04-prd.mdx')).toBe('/weeks/04-prd')
  })
})
