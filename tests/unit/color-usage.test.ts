import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import fg from 'fast-glob'

/**
 * 리뷰 Finding 6: 토큰 값은 tests/unit/tokens.test.ts가 지키지만, "--blue는
 * 텍스트 색으로 안 쓴다"·"--g500은 텍스트 색으로 안 쓴다"는 규칙 자체는 프로즈
 * (app/global.css 상단 주석)에만 있었다 — 아무것도 미래의 `color: 'var(--blue)'`
 * 하나를 막지 못했다. --g500의 기존 관례(Task 13 구현 중 `grep -rn "var(--g500)"
 * components/ app/`로 수동 확인했던 것)를 실제 테스트로 승격해 --blue와 함께
 * 자동으로 지킨다.
 *
 * 판별 방법: JSX 인라인 스타일 프로퍼티는 카멜케이스라 `outlineColor`/
 * `borderColor`/`backgroundColor`는 대문자 C로 시작하는 "Color:"이고, 순수
 * 텍스트 색 프로퍼티만 소문자 "color:"다 — 대소문자를 구분해 검색하면
 * `outlineColor: 'var(--blue)'`(허용, 텍스트 아님) 같은 것과
 * `color: 'var(--blue)'`(금지, 텍스트) 같은 것이 자동으로 갈린다.
 */
describe('색 사용 규칙: 텍스트 색으로 금지된 토큰', () => {
  const FORBIDDEN_AS_TEXT_COLOR = ['--blue', '--g500'] as const

  it.each(FORBIDDEN_AS_TEXT_COLOR)('%s 가 텍스트 color로 쓰인 곳이 없다', async (token) => {
    const files = await fg(['components/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}'])
    // 카멜케이스 접두(outline/border/background)가 아닌, 진짜 `color:` 프로퍼티만
    // 잡는다. 대소문자 구분 검색이라 "outlineColor:"(대문자 C)는 자동 제외된다.
    const pattern = new RegExp(`(?<![A-Za-z])color:\\s*['"\`]?var\\(${token}\\)`, 'g')

    const offenders: string[] = []
    for (const file of files) {
      const content = readFileSync(file, 'utf-8')
      const matches = content.match(pattern)
      if (matches) offenders.push(`${file}: ${matches.join(', ')}`)
    }

    expect(offenders, `${token}을 텍스트 color로 쓴 곳:\n${offenders.join('\n')}`).toEqual([])
  })

  it('app/global.css에도 위반이 없다 (CSS 커스텀 프로퍼티 선언부 자체는 예외)', () => {
    const css = readFileSync('app/global.css', 'utf-8')
    for (const token of FORBIDDEN_AS_TEXT_COLOR) {
      // `--blue: #3182F6;` 같은 토큰 *정의* 줄은 제외하고, 다른 규칙 안에서
      // `color: var(--blue)` 형태로 쓰인 것만 잡는다.
      const pattern = new RegExp(`(?<![A-Za-z-])color:\\s*var\\(${token}\\)`, 'g')
      const matches = css.match(pattern)
      expect(matches, `app/global.css에서 ${token}을 텍스트 color로 씀: ${matches?.join(', ')}`).toBeNull()
    }
  })
})
