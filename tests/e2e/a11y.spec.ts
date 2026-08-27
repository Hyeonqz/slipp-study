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

for (const path of PAGES) {
  test(`${path} — 대비와 기본 접근성 위반이 없다`, async ({ page }) => {
    // 마운트 직후 크로스페이드 전환(예: TOC 팝오버의 제목 애니메이션) 도중 스냅샷을
    // 찍으면 부분 opacity 상태가 실제보다 낮은 대비로 측정된다. prefers-reduced-motion로
    // 전환을 없애 정지 상태만 검사한다(app/global.css의 전역 reduced-motion 규칙과 짝).
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(path)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
  })
}

test('키보드로 사이드바에서 본문으로 이동할 수 있다', async ({ page, viewport }) => {
  test.skip(viewport!.width < 1024, '모바일은 드로어라 별도 흐름')
  await page.goto('/')
  await page.keyboard.press('Tab')
  const focused = await page.evaluate(() => document.activeElement?.tagName)
  expect(focused).toBeTruthy()
  const outline = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement
    return getComputedStyle(el).outlineStyle
  })
  expect(outline).not.toBe('none')
})
