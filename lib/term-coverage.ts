/**
 * Fix Round 1 / Finding 2: Step 7b가 "문서당 용어별 첫 등장을 <Term>으로 감싼다"는
 * 규칙 그 자체를 실행 가능한 검사로 인코딩한다. `checkTerms`(lib/validators.ts)는
 * 사전에 없는 <Term>을 잡지만, <Term> 태그가 통째로 사라져도 잡지 못한다 —
 * 이 모듈은 그 반대(있어야 할 태그가 없는 경우)를 잡는다.
 *
 * 규칙(용어당 문서당):
 *  - 프런트매터 / 헤딩(`#`으로 시작하는 줄) / 펜스드 코드블록(``` ... ```)은
 *    "적격 위치"가 아니다 — 헤딩은 TOC에 그대로 노출되고, 코드블록 안의 <Term>은
 *    MDX가 리터럴 텍스트로만 렌더링해 실제로 동작하지 않는다(펜스 안은 JSX로
 *    파싱되지 않음 — 실제 빌드로 확인함).
 *  - 표 셀(`|`로 시작하는 줄)은 기본적으로 적격 위치가 아니다. 단,
 *    TABLE_CELL_ELIGIBLE_FILES에 속한 문서(용어 사용이 사실상 전부 표/양식인
 *    5개 템플릿 문서)에서는 표 셀도 적격 위치다 — Finding 3의 타겟 예외.
 *  - 한 용어가 다른(더 긴) 용어의 부분 문자열일 수 있다(`지표` ⊂ `North Star 지표`).
 *    긴 용어부터 먼저 자기 자리를 "선점"해서, 짧은 용어가 그 구간을 다시
 *    자기 첫 등장으로 오인하지 않게 한다.
 *  - 용어가 문서 안에 적격 위치로 전혀 등장하지 않으면 검사 대상이 아니다
 *    (그 문서에서 그 용어를 쓸 필요가 아예 없었다는 뜻).
 */

export interface TermCoverageIssue {
  file: string
  term: string
  message: string
}

/** Finding 3 — 용어 사용이 사실상 전부 표(또는 양식)인 문서라, 표 셀도 적격 위치로 친다. */
export const TABLE_CELL_ELIGIBLE_FILES: ReadonlySet<string> = new Set([
  'content/docs/templates/metrics.mdx',
  'content/docs/templates/prd.mdx',
  'content/docs/templates/interview.mdx',
  'content/docs/templates/one-pager.mdx',
  'content/docs/templates/resources.mdx',
])

interface Line {
  /** 이 줄의 첫 글자가 `body` 안에서 시작하는 오프셋 */
  start: number
  text: string
  eligible: boolean
}

/** frontmatter(`--- ... ---`)를 잘라내고, 본문과 raw 안에서의 시작 오프셋을 돌려준다. */
export function splitFrontmatter(raw: string): { body: string; bodyOffset: number } {
  if (!raw.startsWith('---')) return { body: raw, bodyOffset: 0 }
  const closingStart = raw.indexOf('\n---', 3)
  if (closingStart === -1) return { body: raw, bodyOffset: 0 }
  const lineEnd = raw.indexOf('\n', closingStart + 1)
  const bodyStart = lineEnd === -1 ? raw.length : lineEnd + 1
  return { body: raw.slice(bodyStart), bodyOffset: bodyStart }
}

function classifyLines(body: string, allowTableCells: boolean): Line[] {
  const lines: Line[] = []
  let offset = 0
  let inFence = false
  for (const text of body.split('\n')) {
    const trimmed = text.trim()
    let eligible: boolean
    if (trimmed.startsWith('```')) {
      eligible = false
      inFence = !inFence
    } else if (inFence) {
      eligible = false
    } else if (trimmed.startsWith('#')) {
      eligible = false
    } else if (trimmed.startsWith('|') && !allowTableCells) {
      eligible = false
    } else {
      eligible = true
    }
    lines.push({ start: offset, text, eligible })
    offset += text.length + 1 // + '\n'
  }
  return lines
}

/**
 * `file`(raw 원문)에서 `terms` 각각의 "적격 위치 첫 등장"이 실제로
 * `<Term>...</Term>`으로 감싸져 있는지 검사한다. 감싸져 있지 않으면(또는
 * 애초에 태그 없이 맨 텍스트로만 있으면) issue를 낸다.
 */
export function checkTermCoverage(file: string, raw: string, terms: string[]): TermCoverageIssue[] {
  const issues: TermCoverageIssue[] = []
  const { body, bodyOffset } = splitFrontmatter(raw)
  const allowTableCells = TABLE_CELL_ELIGIBLE_FILES.has(file)
  const lines = classifyLines(body, allowTableCells)

  const sortedTerms = [...terms].sort((a, b) => b.length - a.length)
  const claimed: Array<{ start: number; end: number }> = []

  for (const term of sortedTerms) {
    let match: { start: number; end: number } | null = null

    for (const line of lines) {
      if (!line.eligible) continue
      let searchFrom = 0
      while (searchFrom <= line.text.length) {
        const idx = line.text.indexOf(term, searchFrom)
        if (idx === -1) break
        const absStart = bodyOffset + line.start + idx
        const absEnd = absStart + term.length
        const overlapsClaimed = claimed.some((c) => absStart < c.end && absEnd > c.start)
        if (!overlapsClaimed) {
          match = { start: absStart, end: absEnd }
          break
        }
        searchFrom = idx + 1
      }
      if (match) break
    }

    if (!match) continue // 이 문서엔 적격 위치에 이 용어가 아예 없음 — 검사 대상 아님
    claimed.push(match)

    const before = raw.slice(Math.max(0, match.start - '<Term>'.length), match.start)
    const after = raw.slice(match.end, match.end + '</Term>'.length)
    if (before !== '<Term>' || after !== '</Term>') {
      issues.push({
        file,
        term,
        message: `'${term}'의 적격 위치 첫 등장이 <Term>으로 감싸져 있지 않습니다`,
      })
    }
  }

  return issues
}
