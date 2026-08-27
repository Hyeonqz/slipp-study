/**
 * 스터디 용어집의 단일 원천.
 *
 * `<Term>` 컴포넌트와 `pnpm validate`(콘텐츠 검증 스크립트)가 이 목록을 참조해
 * 본문의 `<Term>...</Term>` 표기가 실제로 정의된 용어인지 검사한다.
 *
 * TODO(Task 7): 이 파일은 스텁이다. Task 7에서 실제 용어 목록을 채운다.
 */
export interface GlossaryEntry {
  term: string
  definition: string
  example?: string
}

export const glossary: GlossaryEntry[] = []
