/**
 * 스터디 용어집의 단일 원천.
 *
 * `<Term>` 컴포넌트와 `pnpm validate`(콘텐츠 검증 스크립트)가 이 목록을 참조해
 * 본문의 `<Term>...</Term>` 표기가 실제로 정의된 용어인지 검사한다.
 */
export interface GlossaryEntry {
  term: string
  definition: string
  example?: string
}

export const glossary: GlossaryEntry[] = [
  {
    term: '역기획',
    definition:
      '이미 나와 있는 서비스를 보고, "이걸 만든 기획자는 무슨 생각이었을까"를 거꾸로 복원하는 것. 요리를 먹어보고 레시피를 추측하는 것과 같음',
    example:
      '당근마켓에 왜 채팅이 있고 전화번호는 없을까? → 거래 안전 + 데이터 확보 목적으로 추정',
  },
  {
    term: 'BM',
    definition: '비즈니스 모델. 이 회사가 돈을 버는 방식. "누가 → 누구에게 → 얼마를 → 왜 내는가"',
    example: '당근: 유저는 공짜, 동네 가게가 광고비를 냄',
  },
  {
    term: 'PRD',
    definition:
      'Product Requirements Document. "이걸 왜, 누구를 위해, 뭘 만들 건지" 적은 기획 문서. 기획자의 기본 산출물',
    example: '양식과 채운 예시는 "양식 · 예시" 그룹의 PRD 양식 문서에 있습니다',
  },
  {
    term: '타겟',
    definition:
      '이 서비스를 누가 쓰는가. "20대 여성" 말고 "이사 온 지 3개월 된 1인 가구" 수준으로 구체적으로',
  },
  { term: '지표', definition: '잘 되고 있는지 판단하는 숫자', example: '가입자 수, 재방문율, 결제 전환율' },
  {
    term: 'North Star 지표',
    definition: '여러 지표 중 "이거 하나만 오르면 회사가 잘 되는 것"인 대표 지표',
    example: '에어비앤비 = 숙박된 밤(nights booked)',
  },
  {
    term: '퍼널',
    definition: '유저가 거치는 깔때기 단계. 각 단계에서 사람이 빠져나감',
    example: '방문 → 가입 → 검색 → 예약 → 결제',
  },
  { term: '전환율', definition: '다음 단계로 넘어간 비율', example: '100명이 검색했는데 5명이 예약 = 전환율 5%' },
  {
    term: '리텐션',
    definition: '한 번 쓴 사람이 다시 오는가. 창업에서 가장 중요한 숫자',
    example: '가입 후 7일 뒤에도 쓰는 사람 비율',
  },
  {
    term: 'MVP',
    definition: 'Minimum Viable Product. 검증에 필요한 최소한만 만든 것. 완성품 아님',
    example: '랜딩페이지 하나 + 신청 폼',
  },
  {
    term: 'PMF',
    definition:
      'Product-Market Fit. "이 제품이 시장에 맞아떨어진 상태." 안 홍보해도 사람들이 알아서 쓰기 시작하는 지점',
  },
  { term: 'CAC', definition: '고객 1명 데려오는 데 쓴 돈', example: '광고비 100만원 써서 50명 가입 → CAC 2만원' },
  { term: 'LTV', definition: '고객 1명이 평생 남겨주는 돈' },
  {
    term: '유닛 이코노믹스',
    definition: '고객 1명 단위로 남는가 손해인가. LTV > CAC 여야 사업이 됨',
    example: 'CAC 2만원인데 LTV 1만원이면 팔수록 손해',
  },
  {
    term: 'RICE',
    definition:
      '우선순위 정하는 계산법. Reach(영향 인원) × Impact(효과) × Confidence(확신) ÷ Effort(공수)',
    example: '점수 높은 것부터 함',
  },
  { term: '피벗', definition: '사업 방향을 크게 트는 것', example: '쿠팡은 원래 소셜커머스였음' },
  {
    term: '0→1',
    definition:
      '아무것도 없는 데서 첫 제품을 만드는 단계. 1→100(이미 되는 걸 키우는 단계)과 완전히 다른 게임',
  },
  {
    term: 'eval',
    definition: 'AI 기능이 제대로 작동하는지 판정하는 기준·테스트셋. AI 기획의 핵심',
    example: '"이 질문 100개에 대해 정답률 90% 이상"',
  },
  { term: '환각', definition: 'AI가 그럴듯하게 틀린 답을 하는 것' },
]

export function lookup(term: string): GlossaryEntry | undefined {
  return glossary.find((g) => g.term === term)
}
