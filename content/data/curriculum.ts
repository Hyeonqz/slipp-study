export type Stage = 'eye' | 'hand' | 'head'

export interface Week {
  no: number
  stage: Stage
  slug: string
  title: string
  /** 이번 시간에 하는 것 */
  headline: string
  /** 다음 시간까지 만들어 올 것 */
  deliverable: string
  /** 미리 볼 것 (무료) */
  preread?: string[]
  /**
   * 이 회차 모임 날짜 (`YYYY-MM-DD`). 진행자가 손으로 채우는 값이고, 비어 있으면
   * 화면에서 날짜 줄이 통째로 빠진다 — 일정이 안 정해진 상태가 예외가 아니라
   * 정상 상태다.
   */
  date?: string
}

/**
 * 8회차 커리큘럼의 단일 원천.
 *
 * README.md 3장 "8회차 한눈에 보기" 표 + "8회차 상세 계획"의 1단/2단/3단 표에서
 * 옮겨 적었다. 커리큘럼이 바뀌면 이 배열 하나만 고치면 된다 — README는 문서로서
 * 남아있지만, 사이트에 나타나는 값은 전부 여기서 나온다.
 */
export const curriculum: Week[] = [
  {
    no: 1, stage: 'eye', slug: '01-kickoff', title: '킥오프',
    headline: 'OT + "이 기능은 왜 있을까" 워밍업',
    deliverable: '역기획 ① + 예측 봉인',
  },
  {
    no: 2, stage: 'eye', slug: '02-reverse-planning-1', title: '어떻게 돈을 버나',
    headline: '역기획 ① — 어떻게 돈을 버나 (BM 발표 + 반박, DART 같이 열어보기)',
    deliverable: '역기획 ② (같은 시장 승자/패자 비교)',
    preread: ['SVPG 블로그 글 2편', 'DART에서 대상 회사 감사보고서'],
  },
  {
    no: 3, stage: 'eye', slug: '03-reverse-planning-2', title: '봉인 개봉',
    headline: '역기획 ② — 예측 봉인 개봉 / AI 프로덕트 역기획',
    deliverable: 'PRD 1장',
    preread: ['Blake Masters CS183 노트 1~5강', 'Google PAIR 가이드북'],
  },
  {
    no: 4, stage: 'hand', slug: '04-prd', title: '문제 정의 + PRD',
    headline: '문제 정의 + PRD 상호 리뷰 / 인터뷰 질문지 제작',
    deliverable: '실제 사람 3~5명 인터뷰 + 기록',
    preread: ['SVPG "Product Discovery"', 'The Mom Test 저자 강연'],
  },
  {
    no: 5, stage: 'hand', slug: '05-user-interview', title: '유저 인터뷰',
    headline: '유저 인터뷰 결과 + 유도질문 잡아내기',
    deliverable: '지표 트리 + 우선순위 판단서 (RICE)',
    preread: ['요즘IT 그로스 아티클 1편'],
  },
  {
    no: 6, stage: 'hand', slug: '06-metrics-priority', title: '지표 · 우선순위',
    headline: '지표 설계 + 우선순위 / 아이디어 브레인스토밍',
    deliverable: '원페이저 + 검증 착수',
    preread: ["Lenny's Newsletter 무료글 1편"],
  },
  {
    no: 7, stage: 'head', slug: '07-my-idea', title: '내 아이디어',
    headline: '내 아이디어 — 전원 공격',
    deliverable: '검증 결과 + AI로만 만든 제안 PPT',
    preread: ['YC "How to talk to users"', '벤 호로위츠 강연'],
  },
  {
    no: 8, stage: 'head', slug: '08-validation-retro', title: 'AI 사업 제안 + 회고',
    headline: 'AI만 써서 만든 PPT로 사업 제안 + 8주 전체 회고',
    deliverable: '없음 — 뒤풀이',
  },
]

/**
 * 지금 진행 중인 회차. 스터디 시작 전이면 null.
 *
 * 진행자가 매주 손으로 고치는 값이다. 날짜 기반 자동 계산을 넣지 않는다 —
 * 일정은 밀리는 게 정상이고, 자동화하면 틀린 값이 화면에 뜬다.
 *
 * 이 값 하나가 사이드바 `이번 주` 배지 · 홈 배너 · 여정 맵 현재 위치 마커를 만든다.
 */
export const currentWeek: number | null = null

export function weekBySlug(slug: string): Week | undefined {
  return curriculum.find((w) => w.slug === slug)
}

/**
 * 사이드바·문서 제목에 쓰는 회차 라벨. 예: `1회차 — 킥오프`
 *
 * `title`은 짧은 이름 그대로 둔다 — 여정 맵 카드나 배지처럼 회차 번호를 이미
 * 따로 보여주는 자리에서 "1회차 1회차 — 킥오프"가 되는 걸 막기 위해서다.
 * 번호가 붙은 형태가 필요한 곳(회차 문서 frontmatter의 title → 사이드바 항목명
 * 이자 페이지 H1)에서만 이 함수를 거친다.
 *
 * `tests/unit/sidebar.test.ts`가 실제 페이지 트리의 항목명이 이 값과 같은지
 * 검사하므로, frontmatter를 고치면서 여기를 안 고치면 테스트가 잡는다.
 */
export function weekLabel(w: Week): string {
  return `${w.no}회차 — ${w.title}`
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

/**
 * `2026-09-02` → `9월 2일 (수)`.
 *
 * 요일만 날짜에서 계산한다 — 회차 날짜 자체를 "시작일 + N주"로 자동 계산하지는
 * 않는다. 일정은 밀리는 게 정상이고, 자동화하면 틀린 값이 화면에 뜬다
 * (`currentWeek`를 손으로 고치는 것과 같은 이유다).
 *
 * UTC로 파싱해 UTC 게터로 읽는다 — `new Date('2026-09-02')`는 UTC 자정이라
 * 로컬 게터로 읽으면 UTC보다 뒤진 타임존에서 하루 앞으로 밀린다.
 */
export function formatWeekDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) throw new Error(`회차 날짜 형식이 잘못됐습니다: ${date}`)
  return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 (${DAY_NAMES[d.getUTCDay()]})`
}
