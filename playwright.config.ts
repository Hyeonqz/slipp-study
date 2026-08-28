import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:3000' },
  webServer: {
    command: 'pnpm build && pnpm start',
    url: 'http://localhost:3000',
    // Fix Round 2 (review Finding 4): 브리프가 dev 서버를 명시적으로 금지한 이유가
    // "오래 띄운 dev 서버의 증분 캐시가 깨져 실제와 다른 500을 봤다"였다. true였다면
    // 이미 로컬에서 포트 3000을 물고 있는 아무 서버(그 dev 서버 포함)에 그냥 붙어서
    // 매번 새로 build+start하지 않는다 — 정확히 그 위험을 다시 열어준다. 항상 새로
    // build+start한다.
    reuseExistingServer: false,
    timeout: 180_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Desktop Chrome'], viewport: { width: 360, height: 740 } } },
  ],
})
