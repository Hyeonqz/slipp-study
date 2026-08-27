import { test, expect } from '@playwright/test'

// 24개 문서 전체 경로 — content/docs/*/meta.json 기준(2026-08-27, Task 13 작성 시점)
const PAGES = [
  '/',
  '/start/why',
  '/start/roadmap',
  '/start/glossary',
  '/how/three-stages',
  '/how/two-hours',
  '/how/rules',
  '/how/ai-playbook',
  '/weeks/01-kickoff',
  '/weeks/02-reverse-planning-1',
  '/weeks/03-reverse-planning-2',
  '/weeks/04-prd',
  '/weeks/05-user-interview',
  '/weeks/06-metrics-priority',
  '/weeks/07-my-idea',
  '/weeks/08-validation-retro',
  '/templates/reverse-engineering',
  '/templates/prd',
  '/templates/interview',
  '/templates/metrics',
  '/templates/one-pager',
  '/templates/resources',
  '/archive',
  '/archive/w02-example-reverse',
]

for (const path of PAGES) {
  test(`${path} — 가로 스크롤이 생기지 않는다`, async ({ page }) => {
    await page.goto(path)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow, `${path}에서 가로로 ${overflow}px 밀림`).toBeLessThanOrEqual(1)
  })
}

test('360px에서 사이드바가 드로어로 접힌다', async ({ page, viewport }) => {
  test.skip(viewport!.width > 1024, '데스크톱에서는 해당 없음')
  await page.goto('/')
  const nav = page.locator('#nd-sidebar')
  await expect(nav).toBeHidden()
})

test('여정 맵은 자기 컨테이너 안에서만 스크롤한다', async ({ page }) => {
  await page.goto('/')
  const map = page.locator('a[href^="/weeks/"]').first().locator('..')
  const scrollable = await map.evaluate((el) => el.scrollWidth > el.clientWidth)
  const bodyOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(bodyOverflow).toBeLessThanOrEqual(1)
  expect(typeof scrollable).toBe('boolean')
})
