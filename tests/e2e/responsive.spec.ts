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
    // 리뷰 Finding 2: goto의 응답을 버리면 404(Next.js가 오버플로도 axe 위반도
    // 없는 최소 페이지를 렌더한다)가 조용히 통과한다. 경로 목록은 하드코딩이라
    // 나중에 /archive/w02-example-reverse(예시 제출물, 삭제 예정) 같은 문서가
    // 지워지면 상태 코드 검증 없이는 그 페이지의 커버리지가 티 없이 사라진다.
    const res = await page.goto(path)
    expect(res?.status(), `${path} 응답 상태`).toBe(200)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow, `${path}에서 가로로 ${overflow}px 밀림`).toBeLessThanOrEqual(1)
  })
}

test('360px에서 사이드바가 드로어로 접힌다', async ({ page, viewport }) => {
  test.skip(viewport!.width > 1024, '데스크톱에서는 해당 없음')
  const res = await page.goto('/')
  expect(res?.status()).toBe(200)
  const nav = page.locator('#nd-sidebar')
  await expect(nav).toBeHidden()
})

// 리뷰 Finding 3: 원래 이름("여정 맵은 자기 컨테이너 안에서만 스크롤한다")은
// JourneyMap이 가로 스크롤 카드였던 초기 설계의 흔적이다(현재는 세로 스택 —
// components/visuals/journey-map.tsx 상단 주석 참고) — 지금은 컴포넌트 안에
// 가로로 스크롤하는 내부 컨테이너 자체가 없으므로 "자기 컨테이너 안에서만
// 스크롤한다"를 검증할 대상이 없다. `expect(typeof scrollable).toBe('boolean')`은
// 항상 참인 동어반복이었고, 그 위 줄은 PAGES 루프의 '/' 케이스와 같은 걸 다시
// 쟀다. 실제로 의미 있는 것 하나만 남긴다: 이 컴포넌트 자신의 바운딩 박스 폭이
// 뷰포트를 넘지 않는다. 로케이터도 구조적 탐색(`.locator('..')`) 대신
// data-testid로 고정했다(마크업이 바뀌어도 조용히 다른 요소를 잡지 않는다).
test('여정 맵 컨테이너가 뷰포트 폭을 넘지 않는다', async ({ page, viewport }) => {
  const res = await page.goto('/')
  expect(res?.status()).toBe(200)
  const map = page.getByTestId('journey-map')
  const mapWidth = await map.evaluate((el) => el.getBoundingClientRect().width)
  expect(mapWidth).toBeLessThanOrEqual(viewport!.width)
})
