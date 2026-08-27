import { posix } from 'node:path'
import { ARCHIVE_TYPES } from '@/content/data/archive-types'

/**
 * `content/data/archive-types.ts`가 `as const` 튜플이라 `.includes(string)`에
 * 그대로 넘기면 타입 오류가 난다. 여기서만 `readonly string[]`로 넓혀서 쓴다.
 * (단일 원천은 여전히 `content/data/archive-types.ts` 하나뿐이다 — 목록을
 * 중복 정의하지 않는다. `source.config.ts`의 zod enum도 같은 파일을 본다.)
 */
const KNOWN_ARCHIVE_TYPES: readonly string[] = ARCHIVE_TYPES

export interface Issue {
  file: string
  message: string
}

export function checkCurriculumSlugs(fileSlugs: string[], curriculumSlugs: string[]): Issue[] {
  const files = new Set(fileSlugs)
  const known = new Set(curriculumSlugs)
  const issues: Issue[] = []

  for (const slug of curriculumSlugs) {
    if (!files.has(slug)) {
      issues.push({
        file: 'content/data/curriculum.ts',
        message: `curriculum에 '${slug}'가 있는데 content/docs/weeks/${slug}.mdx 가 없습니다`,
      })
    }
  }
  for (const slug of fileSlugs) {
    if (!known.has(slug)) {
      issues.push({
        file: `content/docs/weeks/${slug}.mdx`,
        message: `'${slug}' 문서가 있는데 curriculum에 해당 회차가 없습니다`,
      })
    }
  }
  return issues
}

export function checkArchiveFrontmatter(file: string, fm: Record<string, unknown>): Issue[] {
  const issues: Issue[] = []
  const need = (k: string) => {
    if (fm[k] === undefined || fm[k] === null || fm[k] === '') {
      issues.push({ file, message: `아카이브 문서에 '${k}' frontmatter가 필요합니다` })
      return false
    }
    return true
  }

  need('title')
  if (need('week')) {
    const w = fm.week
    if (typeof w !== 'number' || !Number.isInteger(w) || w < 1 || w > 8) {
      issues.push({ file, message: `'week'는 1~8 정수여야 합니다 (받은 값: ${String(w)})` })
    }
  }
  need('author')
  if (need('type') && !KNOWN_ARCHIVE_TYPES.includes(String(fm.type))) {
    issues.push({
      file,
      message: `'type'은 ${KNOWN_ARCHIVE_TYPES.join(' | ')} 중 하나여야 합니다 (받은 값: ${String(fm.type)})`,
    })
  }
  if (need('date')) {
    const normalized = normalizeDateValue(fm.date)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      issues.push({ file, message: `'date'는 YYYY-MM-DD 형식이어야 합니다 (받은 값: ${normalized})` })
    }
  }
  return issues
}

/**
 * YAML frontmatter에 `date: 2026-09-15`처럼 따옴표 없이 쓰면 js-yaml(gray-matter가
 * 내부에서 씀)이 이를 문자열이 아니라 YAML 1.1 timestamp로 인식해 실제 JS `Date`
 * 객체로 파싱한다. 이 경우 `String(fm.date)`는 `Tue Sep 15 2026 ...` 같은 로캘
 * 문자열이 되어, 정상적으로 작성한 날짜인데도 정규식 검사에서 오탐(false
 * positive)으로 떨어진다 — 고의 파손 검증 중 실제로 재현해서 발견한 문제.
 * `Date` 인스턴스는 UTC 구성요소로 `YYYY-MM-DD`를 복원해 이 문제를 없앤다.
 */
export function normalizeDateValue(v: unknown): string {
  if (v instanceof Date) {
    const y = v.getUTCFullYear()
    const m = String(v.getUTCMonth() + 1).padStart(2, '0')
    const d = String(v.getUTCDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  return String(v)
}

export function checkTerms(file: string, body: string, known: Set<string>): Issue[] {
  const issues: Issue[] = []
  for (const m of body.matchAll(/<Term>([^<]+)<\/Term>/g)) {
    const term = m[1].trim()
    if (!known.has(term)) {
      issues.push({
        file,
        message: `<Term>${term}</Term> — content/data/glossary.ts 에 '${term}' 항목이 없습니다`,
      })
    }
  }
  return issues
}

/**
 * `content/docs` 기준 상대 파일 경로(fast-glob이 돌려주는 posix 경로, 예:
 * `content/docs/weeks/04-prd.mdx`)를 Fumadocs가 실제로 부여하는 URL로 바꾼다.
 *
 * `lib/source.ts`가 진짜 URL을 알고 있지만(`source.getPages()`), 그 값은
 * `.source/server.ts`가 생성하는 `import.meta.glob` 호출에 의존한다 —
 * Vite(vitest)나 Next의 번들러 안에서만 동작하는 매크로라, `tsx`로 직접 실행하는
 * 이 검증 스크립트에서는 `lib/source.ts`를 import하면
 * `TypeError: (intermediate value).glob is not a function`로 즉시 죽는다
 * (직접 확인함). 그래서 파일 경로 → URL 규칙을 여기서 순수 함수로 재현한다.
 * Fumadocs의 기본 규칙(폴더의 index → 폴더 경로, 그 외는 확장자만 제거)과
 * 어긋나면 이 함수가 실제 사이트와 다르게 판정할 수 있다는 한계가 있다.
 */
export function docPathToUrl(path: string): string {
  const rel = path.replace(/^content\/docs\//, '').replace(/\.mdx$/, '')
  if (rel === '' || rel === 'index') return '/'
  return '/' + rel.replace(/\/index$/, '')
}

function normalizeUrl(href: string): string {
  return href.length > 1 && href.endsWith('/') ? href.slice(0, -1) : href
}

/** 페이지가 아닌 정적 자산(이미지 등) 링크는 URL 집합 검사 대상이 아니다. */
const ASSET_EXTENSION_RE =
  /\.(png|jpe?g|gif|svg|webp|avif|ico|pdf|mp4|webm|mp3|json|css|js|mjs|woff2?|ttf|eot)$/i

export function checkInternalLinks(file: string, body: string, urls: Set<string>): Issue[] {
  const issues: Issue[] = []
  const dir = posix.dirname(file)

  for (const m of body.matchAll(/\]\(([^)\s]+)\)/g)) {
    const raw = m[1]
    if (/^(https?:|mailto:|tel:)/.test(raw) || raw.startsWith('#')) continue

    const pathPart = raw.split('#')[0]
    if (pathPart === '' || ASSET_EXTENSION_RE.test(pathPart)) continue

    const isAbsolute = pathPart.startsWith('/')
    // 상대 링크(Fumadocs의 createRelativeLink, 예: `./05-user-interview`,
    // `../archive`)는 현재 문서 파일의 디렉토리를 기준으로 해석한 뒤 같은
    // 규칙(docPathToUrl)으로 URL로 바꿔서 검사한다.
    const url = isAbsolute ? pathPart : docPathToUrl(posix.join(dir, pathPart))
    const normalized = normalizeUrl(url)

    if (!urls.has(normalized)) {
      issues.push({ file, message: `깨진 내부 링크: ${raw}` })
    }
  }

  return issues
}
