import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

const css = readFileSync('app/global.css', 'utf-8')

describe('디자인 토큰', () => {
  // --g600 값은 Task 13에서 axe-core 실측 대비 위반(AA 4.5:1 미달) 때문에 조정됐다:
  // #6B7684→#5A6874(카드/서브내비 반투명 배경 위 4.3~4.4:1 미달 해결).
  //
  // --blue 는 Task 13 Fix Round 1에서 텍스트/비텍스트 용도로 분리됐다. 원래 --blue
  // 하나(#3182F6)를 텍스트에도 썼더니 흰 배경 3.71:1로 AA(4.5:1) 미달이었는데, 값
  // 자체를 어둡게 낮추면 텍스트 없는 순수 그래픽(포커스 링·바·점 — WCAG 비텍스트
  // 기준 3:1은 원래도 통과)까지 다 어두워져 브랜드 톤이 불필요하게 바뀐다. 그래서:
  //   --blue      원래 토스 블루(#3182F6) 그대로 — 텍스트 없는 그래픽 전용.
  //   --blue-text #1E5FCC — 텍스트, 그리고 그 텍스트와 붙어 있는 장식 전용.
  // 두 토큰이 같은 시각 단위에서 붙어 나타나는 자리(여정맵 현재 회차 점, 로드맵
  // 현재 마커 점)는 실측 스크린샷 비교 후 --blue-text로 통일했다 — 자세한 계산과
  // 판단 근거는 app/global.css 토큰 주석과 task-13-report.md Fix Round 1 절 참고.
  //
  // --blue-fill 은 Fix Round 2에서 추가됐다. 다크 리뷰에서 --blue-text를 그대로
  // 흰 텍스트를 얹는 채움(활성 필터 칩, 여정맵 "이번 주" 배지)에도 썼더니 다크
  // --blue-text(#4E93F7, 다크 배경 위 텍스트로는 5.82:1) 위의 흰 글자가 3.07:1로
  // AA 미달인 게 드러났다 — 다크에서 "텍스트는 밝아야" 하는 방향과 "흰 글자를
  // 얹는 채움은 어두워야" 하는 방향이 반대라 한 토큰으로 못 감당한다. 라이트는
  // 우연히 같은 값(#1E5FCC)으로 충분해 두 토큰이 같은 값이지만, 다크에서는
  // 갈라진다 — 자세한 계산은 app/global.css .dark 블록 주석과 task-13-report.md
  // Fix Round 2 절 참고.
  const required = [
    '--g50: #F9FAFB', '--g100: #F2F4F6', '--g200: #E5E8EB', '--g300: #D1D6DB',
    '--g500: #8B95A1', '--g600: #5A6874', '--g700: #4E5968', '--g800: #333D4B',
    '--g900: #191F28', '--blue: #3182F6', '--blue-text: #1E5FCC', '--blue-fill: #1E5FCC',
    '--blue-bg: #E8F3FF',
    '--red: #F04452', '--green: #15C26B',
    '--stage-eye-bar: #C6D8F5', '--stage-hand-bar: #C2E6D2', '--stage-head-bar: #F5D9C2',
  ]

  it.each(required)('%s 를 정의한다', (decl) => {
    expect(css).toContain(decl)
  })

  it('플레이스홀더가 남아 있지 않다', () => {
    expect(css).not.toContain('membered')
  })
})

// 리뷰 Finding 1: 위 라이트 토큰 검증만으로는 다크 값이 --blue-text와 조용히
// 다시 합쳐지는 회귀를 못 잡는다(라이트에서는 두 토큰이 같은 값이라 헷갈리기
// 쉽다). 다크 전용 값을 별도로 고정한다.
describe('디자인 토큰 — 다크 모드 (Fix Round 2)', () => {
  const requiredDark = [
    '--blue: #4E93F7',
    '--blue-text: #4E93F7',
    '--blue-fill: #2469DB',
    '--blue-bg: #16233A',
  ]

  it.each(requiredDark)('.dark 블록이 %s 를 정의한다', (decl) => {
    expect(css).toContain(decl)
  })

  it('다크 --blue-text 와 --blue-fill 이 서로 다른 값이다 (텍스트/흰-글자-채움이 다시 합쳐지지 않는다)', () => {
    // 라이트에서는 두 토큰이 우연히 같은 값이라도 되지만, 다크에서 같은 값으로
    // 되돌아가면 정확히 review Finding 1의 3.07:1 실패가 재발한다. css 파일에서
    // 직접 값을 뽑아 비교한다 — 하드코딩한 리터럴끼리 비교하면 파일이 바뀌어도
    // 항상 통과하는 동어반복이 된다(리뷰 Finding 3와 같은 함정).
    const darkBlock = css.match(/\.dark\s*\{[^}]*\}/)?.[0]
    expect(darkBlock, '.dark 블록을 찾지 못함').toBeTruthy()
    const blueText = darkBlock!.match(/--blue-text:\s*(#[0-9A-Fa-f]{6})/)?.[1]
    const blueFill = darkBlock!.match(/--blue-fill:\s*(#[0-9A-Fa-f]{6})/)?.[1]
    expect(blueText, '.dark --blue-text 값을 찾지 못함').toBeTruthy()
    expect(blueFill, '.dark --blue-fill 값을 찾지 못함').toBeTruthy()
    expect(blueText).not.toBe(blueFill)
  })
})

// 위 "디자인 토큰" 스위트는 --g50 등이 *정의*됐는지만 본다. 토큰이 정의만 되고
// 아무 데도 배선(wire)되지 않아도 통과하므로, 이 태스크의 본질인 "fumadocs 변수 매핑"을
// 보호하지 못한다 (Task 2 review round 1, Important #2). 아래는 실제 사용처(fd-* 변수,
// body 폰트, 사이드바 테두리 리셋, 본문 최대 폭)에 우리 토큰이 연결됐는지를 검증한다.
describe('Fumadocs 변수 매핑 (와이어링)', () => {
  const wiring = [
    '--color-fd-background: #FFFFFF',
    '--color-fd-foreground: var(--g900)',
    '--color-fd-muted: var(--g100)',
    '--color-fd-muted-foreground: var(--g600)',
    '--color-fd-card: var(--g50)',
    '--color-fd-card-foreground: var(--g900)',
    '--color-fd-border: var(--g200)',
    '--color-fd-primary: var(--blue-text)',
    '--color-fd-primary-foreground: #FFFFFF',
    '--color-fd-accent: var(--g100)',
    '--color-fd-accent-foreground: var(--g900)',
    '--color-fd-ring: var(--blue)',
  ]

  it.each(wiring)('%s 로 매핑되어 있다', (decl) => {
    expect(css).toContain(decl)
  })

  it('다크 모드 배경이 #17171C 계열이고 순검정(#000)이 아니다', () => {
    expect(css).toContain('--color-fd-background: #17171C')
    expect(css).not.toContain('--color-fd-background: #000')
  })

  it('다크 모드에서 --color-fd-primary-foreground 가 흰색이 아닌 어두운 잉크로 뒤집혀 있다 (Fix Round 2)', () => {
    // fumadocs-ui 내부(<Steps> 마커, 검색 커스텀 태그, primary 버튼)는
    // --color-fd-primary 를 배경, --color-fd-primary-foreground 를 그 위 글자로
    // 쓴다. 다크에서 --color-fd-primary(=--blue-text, 밝은 파랑)를 흰 글자와
    // 짝지으면 3.07:1로 AA 미달이라, 흰색 대신 어두운 잉크로 뒤집어 방어한다.
    expect(css).toContain('--color-fd-primary-foreground: #191F28')
  })

  it('body 가 --font-pretendard 를 참조한다', () => {
    expect(css).toContain('var(--font-pretendard)')
  })

  it('#nd-sidebar 의 세로 테두리를 지운다', () => {
    expect(css).toMatch(/#nd-sidebar\s*\{\s*border-color:\s*transparent;/)
  })

  /**
   * 전체 폭 대시보드 레이아웃 — 세 규칙이 한 세트로 동작한다. 하나만 빠져도
   * 화면이 조용히 예전으로 돌아가므로(가운데 정렬된 좁은 문서 사이트) 셋 다 건다.
   */
  it('#nd-docs-layout 의 --fd-layout-width 를 100% 로 올려 좌우 여백을 없앤다', () => {
    expect(css).toMatch(/#nd-docs-layout\s*\{[^}]*--fd-layout-width:\s*100%;/)
  })

  it('--fd-layout-width 에 100vw 를 쓰지 않는다 — 스크롤바 폭만큼 잘린다', () => {
    expect(css).not.toMatch(/--fd-layout-width:\s*100vw/)
  })

  it('#nd-page 의 폭 상한과 가운데 정렬을 푼다', () => {
    expect(css).toMatch(/#nd-page\s*\{\s*max-width:\s*none;\s*margin-inline:\s*0;/)
  })

  it('산문(.prose 직계 자식)은 720px 로 붙잡는다', () => {
    expect(css).toMatch(/#nd-page \.prose > \*\s*\{\s*max-width:\s*720px;/)
  })

  it('.fullbleed 만 그 상한에서 빠져나간다', () => {
    expect(css).toMatch(/#nd-page \.prose > \.fullbleed\s*\{\s*max-width:\s*none;/)
  })

  it('표와 코드블록은 자동으로 풀리지 않는다 — 전체 폭은 명시적 opt-in 이다', () => {
    expect(css).not.toMatch(/#nd-page \.prose > table/)
    expect(css).not.toMatch(/#nd-page \.prose > figure\.shiki/)
  })
})

/**
 * Fix Wave finding 7: `outline-color`만 주고 `outline-style`/`outline-width`가
 * 없으면 Chrome의 `outline: auto` 기본값이 색을 무시하고 브라우저 기본 링을
 * 그린다 — 스펙 §6.7 "--blue 2px 아웃라인"이 실제로는 적용되지 않고 있었다.
 * 전역 `:focus-visible` 규칙이 style/width/color를 한 번에 셋(shorthand)으로
 * 지정하는지 직접 검증한다.
 */
describe('포커스 링 (Fix Wave finding 7)', () => {
  it(':focus-visible이 --blue 2px 아웃라인을 shorthand로 지정한다 (색만 있고 너비/스타일이 없는 회귀 방지)', () => {
    expect(css).toMatch(/:focus-visible\s*\{[^}]*outline:\s*2px\s+solid\s+var\(--blue\)/)
  })
})
