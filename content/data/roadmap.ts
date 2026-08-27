export interface Milestone {
  when: string
  what: string
  current?: boolean
  /** true면 화면에 "작성 예정"으로 표시된다 */
  draft?: boolean
}

/**
 * 나의 방향성 로드맵.
 *
 * ── 채우는 법 ──
 * 첫 항목(지금)만 채워져 있다. 나머지 draft 항목의 what을 쓰고 draft를 지운다.
 * when은 자유롭게 바꿔도 된다 (예: "2027 상반기"). 항목 수도 늘리거나 줄여도 된다.
 * 단, current: true 는 정확히 하나만 있어야 한다.
 */
export const roadmap: Milestone[] = [
  { when: '지금 — 8주 스터디', what: '기획 감각 만들기', current: true },
  { when: '+3개월', what: '', draft: true },
  { when: '+6개월', what: '', draft: true },
  { when: '+1년', what: '', draft: true },
  { when: '그 다음', what: '', draft: true },
]
