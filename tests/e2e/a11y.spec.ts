import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// 브리프 기본 5개 + 결함 보고에 등장한 페이지(/start/why, /archive/w02-example-reverse) 보강
const PAGES = [
  '/',
  '/start/why',
  '/start/glossary',
  '/how/two-hours',
  '/weeks/04-prd',
  '/archive',
  '/archive/w02-example-reverse',
]

// 리뷰 Finding 1: emulateMedia({ reducedMotion })만 걸면 colorScheme은 Playwright
// 기본값인 'light'로 고정된다. Fumadocs의 RootProvider는 next-themes를
// attribute:"class", defaultTheme:"system"으로 쓰므로(fumadocs-ui/dist/provider/
// base.js), 다크 팔레트(app/global.css의 `.dark { ... }`)는 브라우저의
// prefers-color-scheme이 dark일 때만 <html>에 .dark가 붙어 켜진다 — 즉 이
// 매트릭스에 'dark'를 추가하지 않으면 다크 토큰은 이 게이트를 한 번도 통과한 적이
// 없는 셈이다. 페이지마다 라이트/다크 두 번씩 스캔한다.
const COLOR_SCHEMES = ['light', 'dark'] as const

for (const scheme of COLOR_SCHEMES) {
  for (const path of PAGES) {
    test(`${path} [${scheme}] — 대비와 기본 접근성 위반이 없다`, async ({ page }) => {
      // colorScheme은 반드시 goto 이전에 걸어야 한다 — next-themes의 초기 테마
      // 결정은 최초 파싱 시점에 한 번 도는 블로킹 스크립트라, goto 이후에
      // emulateMedia를 호출하면 이미 그려진 라이트 상태가 그대로 남는다(직접
      // 검증: emulateMedia를 goto 뒤로 옮기면 html class가 light로 고정됨).
      //
      // 마운트 직후 크로스페이드 전환(예: TOC 팝오버의 제목 애니메이션) 도중
      // 스냅샷을 찍으면 부분 opacity 상태가 실제보다 낮은 대비로 측정된다.
      // prefers-reduced-motion로 전환을 없애 정지 상태만 검사한다
      // (app/global.css의 전역 reduced-motion 규칙과 짝).
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' })

      // 리뷰 Finding 2: goto 응답을 버리면 404(오버플로도 axe 위반도 없는 최소
      // 페이지)가 조용히 통과한다. 경로 목록은 하드코딩이라 나중에
      // /archive/w02-example-reverse(예시 제출물, 삭제 예정) 같은 문서가 지워지면
      // 상태 코드 검증 없이는 그 페이지의 커버리지가 티 없이 사라진다.
      const res = await page.goto(path)
      expect(res?.status(), `${path} 응답 상태`).toBe(200)

      // emulateMedia가 실제로 .dark를 <html>에 붙였는지 가정하지 않고 직접 확인한다
      // — RootProvider가 class 속성 전략을 바꾸거나 defaultTheme이 바뀌면 이 게이트
      // 자체가 다크를 전혀 스캔하지 못하는 채로 조용히 계속 통과할 수 있다.
      const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
      expect(isDark, `${path}에서 <html> class가 colorScheme=${scheme}과 안 맞음`).toBe(
        scheme === 'dark',
      )

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze()
      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
    })
  }
}

test('키보드로 사이드바에서 본문으로 이동할 수 있다', async ({ page, viewport }) => {
  test.skip(viewport!.width < 1024, '모바일은 드로어라 별도 흐름')
  const res = await page.goto('/')
  expect(res?.status()).toBe(200)
  await page.keyboard.press('Tab')
  const focused = await page.evaluate(() => document.activeElement?.tagName)
  expect(focused).toBeTruthy()

  // 리뷰(Fix Wave finding 7): `outlineStyle !== 'none'`만 보면 브라우저 기본
  // 포커스 링(대개 `auto`/검정)도 통과해버려서, 스펙 §6.7의 "--blue 2px
  // 아웃라인"이 실제로 적용됐는지는 이 단언으로 전혀 검증되지 않았다.
  // outline-width와 outline-color 실측값까지 확인해야 --blue가 실제로
  // 렌더링됐다는 증거가 된다. --blue는 #3182F6 = rgb(49, 130, 246).
  const outline = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement
    const style = getComputedStyle(el)
    return { style: style.outlineStyle, width: style.outlineWidth, color: style.outlineColor }
  })
  expect(outline.style).toBe('solid')
  expect(outline.width).toBe('2px')
  expect(outline.color).toBe('rgb(49, 130, 246)')
})
