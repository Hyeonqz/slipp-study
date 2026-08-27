export interface WhyColumn {
  label: string
  body: string
  links?: { text: string; href: string }[]
  /** true면 화면에 "작성 예정"으로 표시된다 */
  draft?: boolean
}

/**
 * "왜 이 스터디를 만들었나" 3칸 흐름.
 *
 * 세 칸 모두 진행자가 준 내용으로 채워져 있다. draft 칸은 없다.
 * 고칠 때는 body만 바꾸면 된다 — 비우려면 body를 ''로 두고 draft: true를 붙인다.
 * [3]의 links가 시각화 페이지를 가리켜서 이 페이지가 허브 역할을 한다.
 */
export const why: [WhyColumn, WhyColumn, WhyColumn] = [
  {
    label: '겪은 문제',
    body: '"이거 왜 만들어요?" 라고 물었는데 아무도 제대로 답을 못 함. 열심히 만들었는데 아무도 안 씀. 내가 창업하면 뭘 만들어야 할지 감이 안 옴.',
  },
  {
    label: '그래서 내린 진단',
    body: '1인 사업에 필요한 건 기획·개발·마케팅 셋인데, 개발자는 개발만 갖고 있다. 그런데 만들 줄 아는 게 오히려 함정이 된다 — 만들 수 있으니까 만들고, 아무도 안 쓴다. 기획은 감이 아니라 배울 수 있는 기법인데, 그걸 제대로 써볼 자리가 없었다.',
  },
  {
    label: '그래서 이렇게 설계했다',
    body: '전략 기획이 아니라 시장 분석 → 프로덕트 기획 → 서비스 기획에 집중한다. 매 회차 반드시 산출물을 만들고, 40분을 통째로 그걸 깨는 데 쓴다. 마지막 2주는 실제 사람에게 검증한다 — 부업이라면 틀린 걸 오래 만드는 비용이 가장 크기 때문이다.',
    links: [
      { text: '3단 구조 — 눈·손·머리', href: '/how/three-stages' },
      { text: '반박 40분', href: '/how/two-hours' },
      { text: '8회차 여정', href: '/' },
    ],
  },
]
