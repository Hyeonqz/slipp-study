import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

const css = readFileSync('app/global.css', 'utf-8')

describe('디자인 토큰', () => {
  // --g600, --blue 값은 Task 13에서 axe-core 실측 대비 위반(AA 4.5:1 미달) 때문에
  // 조정됐다: --g600 #6B7684→#5A6874(카드/서브내비 반투명 배경 위 4.3~4.4:1 미달 해결),
  // --blue #3182F6→#1E5FCC(사이드바 "지금 여기" 라벨의 3.71:1, 활성 블루 배경 위 4.28:1
  // 미달 해결). 자세한 계산은 app/global.css 해당 토큰 주석 참고.
  const required = [
    '--g50: #F9FAFB', '--g100: #F2F4F6', '--g200: #E5E8EB', '--g300: #D1D6DB',
    '--g500: #8B95A1', '--g600: #5A6874', '--g700: #4E5968', '--g800: #333D4B',
    '--g900: #191F28', '--blue: #1E5FCC', '--blue-bg: #E8F3FF',
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
    '--color-fd-primary: var(--blue)',
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

  it('body 가 --font-pretendard 를 참조한다', () => {
    expect(css).toContain('var(--font-pretendard)')
  })

  it('#nd-sidebar 의 세로 테두리를 지운다', () => {
    expect(css).toMatch(/#nd-sidebar\s*\{\s*border-color:\s*transparent;/)
  })

  it('#nd-page(본문 컨테이너)에 640px 최대 폭을 적용한다', () => {
    expect(css).toMatch(/#nd-page\s*\{\s*max-width:\s*640px;/)
  })
})
