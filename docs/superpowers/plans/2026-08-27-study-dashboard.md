# 스터디 대시보드 사이트 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 8회차 스터디 문서를 토스 스타일 문서 대시보드로 만들어 Vercel에 배포하고, 팀원이 `.mdx` 파일을 PR로 올리면 아카이브에 자동으로 쌓이게 한다.

**Architecture:** Next.js App Router + Fumadocs로 전 페이지 정적 생성(SSG). 백엔드·DB 없음. Fumadocs에서는 레이아웃 골격과 문서 인프라(사이드바 트리, TOC, 검색, MDX 파이프라인)만 가져다 쓰고 시각 표현은 전부 토스 기준으로 덮어쓴다. 8회차 메타데이터는 `content/data/curriculum.ts` 배열 하나가 단일 원천이고, 아카이브 목록은 빌드 시점에 MDX frontmatter를 읽어 자동 생성한다.

**Tech Stack:** Next.js 15 (App Router), Fumadocs (`fumadocs-ui` / `fumadocs-core` / `fumadocs-mdx`), TypeScript, Tailwind CSS, Pretendard Variable, Vitest + @testing-library/react, Playwright, pnpm

**Spec:** `docs/superpowers/specs/2026-08-27-study-dashboard-design.md`

## Global Constraints

이 절의 값은 모든 태스크의 요구사항에 암묵적으로 포함된다.

**패키지 매니저 / 명령**
- pnpm 을 쓴다. 검증 게이트는 `pnpm build` 하나다 (내부적으로 `prebuild`에서 `tsc --noEmit` + `validate-content` 실행).
- 별도 CI 워크플로를 만들지 않는다. Vercel이 PR마다 빌드하므로 그것이 게이트다.

**색 토큰 — 정확히 이 값을 쓴다**

| 토큰 | 값 | | 토큰 | 값 |
|---|---|---|---|---|
| `--g50` | `#F9FAFB` | | `--g700` | `#4E5968` |
| `--g100` | `#F2F4F6` | | `--g800` | `#333D4B` |
| `--g200` | `#E5E8EB` | | `--g900` | `#191F28` |
| `--g300` | `#D1D6DB` | | `--blue` | `#3182F6` |
| `--g500` | `#8B95A1` | | `--blue-bg` | `#E8F3FF` |
| `--g600` | `#6B7684` | | `--red` | `#F04452` |
| | | | `--green` | `#15C26B` |

단계 틴트 (바 색 / 칩 배경 / 칩 글자):
- `eye` 👀 눈 — `#C6D8F5` / `#E8F1FC` / `#2C5FA8`
- `hand` ✋ 손 — `#C2E6D2` / `#E3F5EA` / `#1E7A4C`
- `head` 🧠 머리 — `#F5D9C2` / `#FCEDE0` / `#9C5A26`

**색 사용 규칙**
- `--blue`는 "지금 여기"에만 쓴다: 현재 회차, 현재 TOC 항목, 링크, 숙제 카드.
- 단계 틴트는 `<JourneyMap />`의 바와 단계 칩에서만 쓴다. 사이드바·본문·아카이브 필터·버튼에는 쓰지 않는다.
- **`--g500`을 텍스트에 쓰지 않는다.** 흰 배경 대비 약 3.5:1로 WCAG AA 미달. 보조 텍스트 하한은 `--g600`. `--g500`은 아이콘·비활성 플레이스홀더 전용.
- 단계 구분을 색에만 의존하지 않는다. 이모지(👀 ✋ 🧠)와 텍스트 라벨을 항상 함께 둔다.

**타이포**
- Pretendard Variable, 한글 서브셋 self-host, `next/font/local` 로드.
- `letter-spacing: -0.02em` (제목 `-0.03em`). 숫자는 `font-variant-numeric: tabular-nums`.
- 문서 제목 30px/800 · 리드 15px/400 · 섹션 제목 19px/800 · 본문 15px/400 행간 1.75 · 보조 12.5px · 사이드바 13.5px

**표면**
- `border` / `box-shadow` 기본 사용 금지. 영역 구분은 `--g50` / `--g100` 배경 블록으로.
- 예외: TOC 왼쪽 레일, 카드 내부 구분선 — `--g200` 1px만.
- 모서리: 카드 `16px`, 배지·칩 `999px`, 사이드바 항목 `8px`, 작은 블록 `10px`. 본문 최대 폭 `640px`.

**카피 톤**
- UI 요소(섹션 제목, 빈 상태, 안내, 버튼, 플레이스홀더, 배지)는 `~해요` 체.
- 문서 본문·양식·AI 플레이북·용어 정의는 원문 `~합니다` 체 유지. **전면 전환하지 않는다.**

**반응형**
- `≥1280px` 3열 / `1024~1279px` 2열(TOC 숨김) / `<1024px` 1열 + 사이드바 드로어 + TOC 접이식.
- 360px 폭에서 페이지 전체가 가로로 밀리면 안 된다. 표는 자기 컨테이너 안에서만 스크롤.

**커밋**
- 각 태스크 끝에 커밋한다. 커밋 메시지 마지막에 다음 두 줄을 붙인다.
  ```
  Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01EomUUAkB57oP6Dy3oThGmP
  ```

---

## 파일 구조

작업 전에 어떤 파일이 무엇을 책임지는지 확정한다.

```
source.config.ts              fumadocs-mdx 콜렉션 정의 + zod frontmatter 스키마
lib/
  source.ts                   fumadocs loader — baseUrl '/' (사이트 루트가 곧 문서)
  stage.ts                    Stage 타입의 라벨·이모지·색 클래스 매핑 (단 하나의 매핑 지점)
  archive.ts                  아카이브 페이지 수집·그룹핑 순수 함수
app/
  layout.tsx                  루트 레이아웃 — 폰트, RootProvider
  layout.config.tsx           baseOptions (로고, 상단 네비)
  global.css                  토스 토큰 정의 + Fumadocs CSS 변수 덮어쓰기
  [[...slug]]/page.tsx        문서 catch-all 라우트
components/
  mdx.tsx                     getMDXComponents — 전역 MDX 컴포넌트 등록
  ui/                         week-header · homework · glossary · term · callout
  visuals/                    three-stages · two-hour-block · journey-map · why-study · roadmap
  archive/                    archive-board(서버) · archive-filters(클라이언트)
content/
  data/                       curriculum.ts · glossary.ts · why.ts · roadmap.ts
  docs/                       MDX 문서 (§4 정보 구조)
scripts/
  validate-content.ts         빌드 게이트 — 4가지 검사
tests/
  unit/                       Vitest
  e2e/                        Playwright
```

**분리 원칙:** 단계(Stage)의 라벨·이모지·색은 `lib/stage.ts` 한 곳에만 둔다. 여러 컴포넌트에 흩어지면 색 사용 규칙이 무너진다. 아카이브 그룹핑은 `lib/archive.ts`의 순수 함수로 빼서 렌더링 없이 테스트한다.

---

## Task 1: 프로젝트 부트스트랩 — 루트 라우팅으로 문서 한 장 띄우기

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `source.config.ts`, `lib/source.ts`, `app/layout.tsx`, `app/layout.config.tsx`, `app/global.css`, `app/[[...slug]]/page.tsx`, `content/docs/index.mdx`, `content/docs/meta.json`, `.gitignore`
- Create: `vitest.config.ts`, `tests/unit/source.test.ts`

**Interfaces:**
- Consumes: 없음 (첫 태스크)
- Produces:
  - `lib/source.ts` → `export const source` — `source.getPage(slug?: string[])`, `source.getPages()`, `source.getPageTree()`, `source.generateParams()`
  - 사이트 루트 `/`가 `content/docs/index.mdx`로 매핑된다 (`baseUrl: '/'`)

- [ ] **Step 1: Fumadocs 앱 생성**

대화형 프롬프트를 피하기 위해 빈 디렉터리에 생성한 뒤 파일을 옮긴다. 현재 디렉터리에는 `README.md`, `weeks/`, `notion/`, `docs/`가 이미 있으므로 덮어쓰지 않도록 주의한다.

```bash
cd /tmp && pnpm create fumadocs-app study-dashboard --template next-mdx --pm pnpm --no-eslint
```

프롬프트가 뜨면: 템플릿 `Next.js: Fumadocs MDX`, Tailwind CSS `Yes`, 설치 `Yes`.

생성된 것 중 다음만 프로젝트 루트로 복사한다. `README.md`는 **복사하지 않는다** (기존 README를 덮어쓴다).

```bash
cd "C:/develop/single/slipp-study"
cp -r /tmp/study-dashboard/{app,lib,components,content,package.json,tsconfig.json,next.config.mjs,source.config.ts,postcss.config.mjs} .
cp /tmp/study-dashboard/.gitignore .
```

- [ ] **Step 2: git 초기화**

```bash
git init -b main
```

`.gitignore`에 다음이 모두 있는지 확인하고, 없으면 추가한다.

```
node_modules/
.next/
.source/
.superpowers/
.omc/
.vercel/
.env*
```

- [ ] **Step 3: 사이트 루트를 문서 루트로 바꾼다**

기본 템플릿은 문서가 `/docs` 아래에 있다. 이 사이트는 문서가 전부이므로 루트로 올린다.

`lib/source.ts`:

```ts
import { docs, meta } from '@/.source'
import { createMDXSource } from 'fumadocs-mdx/runtime/next'
import { loader } from 'fumadocs-core/source'

export const source = loader({
  baseUrl: '/',
  source: createMDXSource(docs, meta),
})
```

템플릿이 만든 `app/docs/` 디렉터리를 지우고 `app/[[...slug]]/page.tsx`를 만든다.

```bash
rm -rf app/docs
mkdir -p "app/[[...slug]]"
```

`app/[[...slug]]/page.tsx`:

```tsx
import { source } from '@/lib/source'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page'
import { notFound } from 'next/navigation'
import { getMDXComponents } from '@/components/mdx'
import { createRelativeLink } from 'fumadocs-ui/mdx'
import type { Metadata } from 'next'

export default async function Page(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()

  const MDX = page.data.body

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={getMDXComponents({ a: createRelativeLink(source, page) })} />
      </DocsBody>
    </DocsPage>
  )
}

export async function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>
}): Promise<Metadata> {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()
  return { title: page.data.title, description: page.data.description }
}
```

`app/layout.tsx`가 `DocsLayout`을 직접 감싸도록 고친다 (문서 전용 사이트이므로 중첩 레이아웃이 필요 없다).

```tsx
import './global.css'
import { RootProvider } from 'fumadocs-ui/provider'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { source } from '@/lib/source'
import { baseOptions } from './layout.config'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <RootProvider>
          <DocsLayout tree={source.getPageTree()} {...baseOptions()}>
            {children}
          </DocsLayout>
        </RootProvider>
      </body>
    </html>
  )
}
```

`app/layout.config.tsx`:

```tsx
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'

export function baseOptions(): BaseLayoutProps {
  return {
    nav: { title: 'AI 기획자가 되어보자' },
  }
}
```

- [ ] **Step 4: 홈 문서 한 장 만들기**

`content/docs/index.mdx` (템플릿이 만든 파일을 덮어쓴다):

```mdx
---
title: 스터디 한눈에 보기
description: 잘나가는 서비스를 뜯어보고 → 직접 기획 문서를 써보고 → 내 아이디어를 진짜 사람들한테 검증해보는 8회차
---

잘나가는 서비스를 뜯어보고 → 직접 기획 문서를 써보고 → 내 아이디어를 진짜 사람들한테 검증해보는 8회차입니다.

**비용 0원.** 책 안 삽니다. 전부 무료 자료로 진행합니다.
```

템플릿이 만든 나머지 예제 MDX는 지운다.

```bash
find content/docs -name '*.mdx' ! -name 'index.mdx' -delete
```

- [ ] **Step 5: Vitest 설치와 설정**

```bash
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

`tests/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

`package.json`의 `scripts`를 다음으로 만든다.

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "prebuild": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 6: 실패하는 테스트 작성**

`tests/unit/source.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { source } from '@/lib/source'

describe('source', () => {
  it('사이트 루트를 홈 문서로 매핑한다', () => {
    const page = source.getPage([])
    expect(page).toBeDefined()
    expect(page!.url).toBe('/')
    expect(page!.data.title).toBe('스터디 한눈에 보기')
  })

  it('페이지 트리를 만든다', () => {
    expect(source.getPageTree().children.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 7: 테스트 실행 — 실패 확인**

Run: `pnpm test`
Expected: FAIL — `.source`가 아직 생성되지 않아 import 오류. `pnpm build`를 한 번 돌려 `.source`를 생성한 뒤 다시 실행하면 통과해야 한다.

- [ ] **Step 8: 빌드 후 테스트 통과 확인**

Run: `pnpm build && pnpm test`
Expected: 빌드 성공, 테스트 2개 PASS

- [ ] **Step 9: 개발 서버로 눈으로 확인**

Run: `pnpm dev`
`http://localhost:3000` 접속 → "스터디 한눈에 보기"가 Fumadocs 기본 테마로 보인다. 아직 토스 스타일이 아닌 게 정상이다.

- [ ] **Step 10: 커밋**

```bash
git add -A
git commit -m "chore: bootstrap Next.js + Fumadocs with root-level docs routing"
```

---

## Task 2: 토스 디자인 토큰 + Pretendard + Fumadocs 테마 덮어쓰기

**Files:**
- Create: `public/fonts/PretendardVariable.subset.woff2`, `app/fonts.ts`
- Modify: `app/global.css`, `app/layout.tsx`
- Test: `tests/e2e/theme.spec.ts` (Playwright는 Task 13에서 설치하므로, 여기서는 육안 확인 + CSS 변수 존재 확인 스크립트로 대체)
- Create: `tests/unit/tokens.test.ts`

**Interfaces:**
- Consumes: Task 1의 `app/global.css`, `app/layout.tsx`
- Produces: CSS 변수 `--g50`~`--g900`, `--blue`, `--blue-bg`, `--red`, `--green`, `--stage-eye-bar` 등이 `:root`에 정의된다. 이후 모든 컴포넌트가 이 변수만 참조한다.

- [ ] **Step 1: Fumadocs가 실제로 쓰는 CSS 변수 목록을 확인한다**

문서에 적힌 이름을 추측해서 덮어쓰면 안 된다. 실제 값을 확인한다.

Run: `pnpm dev` 후 브라우저 콘솔에서

```js
const s = getComputedStyle(document.body)
Array.from(document.styleSheets)
  .flatMap(sh => { try { return Array.from(sh.cssRules) } catch { return [] } })
  .filter(r => r.selectorText === ':root' || r.selectorText === '.dark')
  .flatMap(r => Array.from(r.style))
  .filter(n => n.startsWith('--color-fd'))
  .sort()
```

출력된 변수 이름 목록을 받아적는다. 최소한 배경·전경·프라이머리·뮤티드·보더·카드에 해당하는 변수가 있어야 한다. **이 목록이 다음 단계의 매핑 대상이다.**

- [ ] **Step 2: Pretendard 서브셋 폰트 배치**

```bash
mkdir -p public/fonts
curl -L -o public/fonts/PretendardVariable.subset.woff2 \
  https://github.com/orioncactus/pretendard/raw/main/packages/pretendard/dist/web/variable/woff2/PretendardVariable.woff2
```

다운로드가 실패하면 https://github.com/orioncactus/pretendard 릴리스에서 `PretendardVariable.woff2`를 받아 같은 경로에 둔다.

`app/fonts.ts`:

```ts
import localFont from 'next/font/local'

export const pretendard = localFont({
  src: './../public/fonts/PretendardVariable.subset.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
})
```

`app/layout.tsx`의 `<html>`에 클래스를 붙인다.

```tsx
import { pretendard } from './fonts'
// ...
<html lang="ko" className={pretendard.variable} suppressHydrationWarning>
```

- [ ] **Step 3: 토큰과 테마 덮어쓰기 작성**

`app/global.css` — 기존 내용 위에 다음을 **추가**한다 (`@import 'fumadocs-ui/css/...'` 줄은 지우지 않는다).

```css
:root {
  /* 그레이스케일 */
  --g50: #F9FAFB;  --g100: #F2F4F6; --g200: #E5E8EB; --g300: #D1D6DB;
  --g500: #8B95A1; --g600: #6B7684; --g700: #4E5968; --g800: #333D4B;
  --g900: #191F28;

  /* 액센트 */
  --blue: #3182F6; --blue-bg: #E8F3FF;
  --red: #F04452;  --green: #15C26B;

  /* 단계 틴트 — JourneyMap 바와 단계 칩에서만 사용 */
  --stage-eye-bar: #C6D8F5;  --stage-eye-chip-bg: #E8F1FC;  --stage-eye-chip-fg: #2C5FA8;
  --stage-hand-bar: #C2E6D2; --stage-hand-chip-bg: #E3F5EA; --stage-hand-chip-fg: #1E7A4C;
  --stage-head-bar: #F5D9C2; --stage-head-chip-bg: #FCEDE0; --stage-head-chip-fg: #9C5A26;

  /* 반경 */
  --r-card: 16px; --r-block: 10px; --r-item: 8px; --r-pill: 999px;
}

.dark {
  --g50: #1E1E24;  --g100: #24242C; --g200: #2E2E38; --g300: #3A3A46;
  --g500: #7C848F; --g600: #98A0AB; --g700: #C2C8D0; --g800: #DDE1E6;
  --g900: #F2F4F6;

  --blue: #4E93F7; --blue-bg: #1B2B45;
  --red: #F4707C;  --green: #3ED18C;

  --stage-eye-bar: #3C5membered;
}
```

> ⚠️ 위 `.dark` 블록의 마지막 줄은 의도적으로 비워둔 자리다. 다크 모드 단계 틴트는 라이트 값의 채도를 더 낮춘 값으로 채운다:
> ```css
>   --stage-eye-bar: #35507A;  --stage-eye-chip-bg: #1C2A40;  --stage-eye-chip-fg: #9DBDEA;
>   --stage-hand-bar: #2E5A44; --stage-hand-chip-bg: #162C22; --stage-hand-chip-fg: #8FD3AE;
>   --stage-head-bar: #6B4A30; --stage-head-chip-bg: #332215; --stage-head-chip-fg: #E0AE85;
> ```
> 위 스니펫으로 `--stage-eye-bar: #3C5membered;` 줄을 교체한다.

이어서 Fumadocs 변수를 토스 토큰으로 매핑한다. **Step 1에서 확인한 실제 변수 이름을 쓴다.** 아래는 Fumadocs 15 기준 예상 이름이므로, 다르면 확인한 이름으로 바꾼다.

```css
:root {
  --color-fd-background: #FFFFFF;
  --color-fd-foreground: var(--g900);
  --color-fd-muted: var(--g100);
  --color-fd-muted-foreground: var(--g600);
  --color-fd-card: var(--g50);
  --color-fd-card-foreground: var(--g900);
  --color-fd-border: var(--g200);
  --color-fd-primary: var(--blue);
  --color-fd-primary-foreground: #FFFFFF;
  --color-fd-accent: var(--blue-bg);
  --color-fd-accent-foreground: var(--blue);
  --color-fd-ring: var(--blue);
}

.dark {
  --color-fd-background: #17171C;
  --color-fd-card: var(--g50);
}
```

마지막으로 타이포와 표면 규칙:

```css
body {
  font-family: var(--font-pretendard), -apple-system, 'Apple SD Gothic Neo', sans-serif;
  letter-spacing: -0.02em;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4 { letter-spacing: -0.03em; font-weight: 800; }

/* 숫자 정렬 */
time, .tabular { font-variant-numeric: tabular-nums; }

/* 토스 원칙: 테두리 대신 배경으로 나눈다 */
#nd-docs-layout aside, #nd-toc { border: none; }
```

> 마지막 선택자는 Fumadocs가 실제로 쓰는 것과 다를 수 있다. Step 1처럼 개발자 도구로 사이드바/TOC 컨테이너의 실제 선택자를 확인하고 맞춘다. 테두리가 남아 있으면 이 태스크는 완료가 아니다.

- [ ] **Step 4: 실패하는 테스트 작성**

`tests/unit/tokens.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

const css = readFileSync('app/global.css', 'utf-8')

describe('디자인 토큰', () => {
  const required = [
    '--g50: #F9FAFB', '--g100: #F2F4F6', '--g200: #E5E8EB', '--g300: #D1D6DB',
    '--g500: #8B95A1', '--g600: #6B7684', '--g700: #4E5968', '--g800: #333D4B',
    '--g900: #191F28', '--blue: #3182F6', '--blue-bg: #E8F3FF',
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
```

- [ ] **Step 5: 테스트 실행 — 실패 확인**

Run: `pnpm test tests/unit/tokens.test.ts`
Expected: `--stage-eye-bar` 관련 항목 또는 플레이스홀더 검사가 FAIL

- [ ] **Step 6: Step 3의 다크 모드 스니펫 교체 후 테스트 통과 확인**

Run: `pnpm test tests/unit/tokens.test.ts`
Expected: 전부 PASS

- [ ] **Step 7: 육안 확인**

Run: `pnpm dev`

확인할 것:
- 폰트가 Pretendard로 바뀌었다 (한글 자간이 좁아진 느낌)
- 사이드바와 TOC에 세로 테두리가 없다
- 현재 사이드바 항목이 연한 파랑 배경(`--blue-bg`)이다
- 다크 모드 토글 시 순검정이 아니라 `#17171C` 계열이다

- [ ] **Step 8: 커밋**

```bash
git add -A
git commit -m "feat: apply Toss design tokens, Pretendard font, and Fumadocs theme override"
```

---

## Task 3: 커리큘럼 단일 원천 + 단계 매핑

**Files:**
- Create: `content/data/curriculum.ts`, `lib/stage.ts`
- Test: `tests/unit/curriculum.test.ts`, `tests/unit/stage.test.ts`

**Interfaces:**
- Consumes: 없음 (순수 데이터/유틸)
- Produces:
  - `content/data/curriculum.ts` → `export type Stage = 'eye' | 'hand' | 'head'`, `export interface Week { no: number; stage: Stage; slug: string; title: string; headline: string; deliverable: string; preread?: string[] }`, `export const curriculum: Week[]` (길이 8), `export const currentWeek: number | null`
  - `lib/stage.ts` → `export interface StageMeta { key: Stage; emoji: string; label: string; range: string; barVar: string; chipBgVar: string; chipFgVar: string }`, `export const STAGES: Record<Stage, StageMeta>`, `export function stageOf(weekNo: number): StageMeta`

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/unit/curriculum.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { curriculum, currentWeek } from '@/content/data/curriculum'

describe('curriculum', () => {
  it('8회차를 갖는다', () => {
    expect(curriculum).toHaveLength(8)
  })

  it('회차 번호가 1~8 연속이다', () => {
    expect(curriculum.map((w) => w.no)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('단계가 1~3=eye, 4~6=hand, 7~8=head 이다', () => {
    expect(curriculum.map((w) => w.stage)).toEqual([
      'eye', 'eye', 'eye', 'hand', 'hand', 'hand', 'head', 'head',
    ])
  })

  it('slug가 유일하고 NN-이름 형식이다', () => {
    const slugs = curriculum.map((w) => w.slug)
    expect(new Set(slugs).size).toBe(8)
    slugs.forEach((s) => expect(s).toMatch(/^0[1-8]-[a-z0-9-]+$/))
  })

  it('모든 회차에 headline과 deliverable이 있다', () => {
    curriculum.forEach((w) => {
      expect(w.headline.length).toBeGreaterThan(0)
      expect(w.deliverable.length).toBeGreaterThan(0)
    })
  })

  it('currentWeek는 null이거나 1~8이다', () => {
    if (currentWeek !== null) {
      expect(currentWeek).toBeGreaterThanOrEqual(1)
      expect(currentWeek).toBeLessThanOrEqual(8)
    }
  })
})
```

`tests/unit/stage.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { STAGES, stageOf } from '@/lib/stage'

describe('stage', () => {
  it('회차 번호를 단계로 매핑한다', () => {
    expect(stageOf(1).key).toBe('eye')
    expect(stageOf(3).key).toBe('eye')
    expect(stageOf(4).key).toBe('hand')
    expect(stageOf(6).key).toBe('hand')
    expect(stageOf(7).key).toBe('head')
    expect(stageOf(8).key).toBe('head')
  })

  it('범위를 벗어난 회차에 대해 던진다', () => {
    expect(() => stageOf(0)).toThrow()
    expect(() => stageOf(9)).toThrow()
  })

  it('모든 단계가 이모지와 텍스트 라벨을 함께 갖는다 — 색에만 의존하지 않기 위해', () => {
    Object.values(STAGES).forEach((s) => {
      expect(s.emoji.length).toBeGreaterThan(0)
      expect(s.label.length).toBeGreaterThan(0)
    })
  })
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `pnpm test tests/unit/curriculum.test.ts tests/unit/stage.test.ts`
Expected: FAIL — 모듈을 찾을 수 없음

- [ ] **Step 3: `lib/stage.ts` 구현**

```ts
import type { Stage } from '@/content/data/curriculum'

export interface StageMeta {
  key: Stage
  emoji: string
  label: string
  range: string
  barVar: string
  chipBgVar: string
  chipFgVar: string
}

export const STAGES: Record<Stage, StageMeta> = {
  eye: {
    key: 'eye', emoji: '👀', label: '눈 — 역기획', range: '1~3회차',
    barVar: 'var(--stage-eye-bar)',
    chipBgVar: 'var(--stage-eye-chip-bg)',
    chipFgVar: 'var(--stage-eye-chip-fg)',
  },
  hand: {
    key: 'hand', emoji: '✋', label: '손 — 기획 기법', range: '4~6회차',
    barVar: 'var(--stage-hand-bar)',
    chipBgVar: 'var(--stage-hand-chip-bg)',
    chipFgVar: 'var(--stage-hand-chip-fg)',
  },
  head: {
    key: 'head', emoji: '🧠', label: '머리 — 0→1 실전', range: '7~8회차',
    barVar: 'var(--stage-head-bar)',
    chipBgVar: 'var(--stage-head-chip-bg)',
    chipFgVar: 'var(--stage-head-chip-fg)',
  },
}

export function stageOf(weekNo: number): StageMeta {
  if (weekNo >= 1 && weekNo <= 3) return STAGES.eye
  if (weekNo >= 4 && weekNo <= 6) return STAGES.hand
  if (weekNo >= 7 && weekNo <= 8) return STAGES.head
  throw new Error(`회차 번호가 1~8 범위를 벗어났습니다: ${weekNo}`)
}
```

- [ ] **Step 4: `content/data/curriculum.ts` 구현**

원본은 `README.md` 3장의 "8회차 한눈에 보기" 표와 "8회차 상세 계획" 3개 표다.

```ts
export type Stage = 'eye' | 'hand' | 'head'

export interface Week {
  no: number
  stage: Stage
  slug: string
  title: string
  /** 이번 시간에 하는 것 */
  headline: string
  /** 다음 시간까지 만들어 올 것 */
  deliverable: string
  /** 미리 볼 것 (무료) */
  preread?: string[]
}

export const curriculum: Week[] = [
  {
    no: 1, stage: 'eye', slug: '01-kickoff', title: '킥오프',
    headline: 'OT + "이 기능은 왜 있을까" 워밍업',
    deliverable: '역기획 ① + 예측 봉인',
  },
  {
    no: 2, stage: 'eye', slug: '02-reverse-planning-1', title: '어떻게 돈을 버나',
    headline: '역기획 ① — BM 발표 + 반박, DART 같이 열어보기',
    deliverable: '역기획 ② (같은 시장 승자/패자 비교)',
    preread: ['SVPG 블로그 글 2편', 'DART에서 대상 회사 감사보고서'],
  },
  {
    no: 3, stage: 'eye', slug: '03-reverse-planning-2', title: '봉인 개봉',
    headline: '역기획 ② — 예측 봉인 개봉 / AI 프로덕트 역기획',
    deliverable: 'PRD 1장',
    preread: ['Blake Masters CS183 노트 1~5강', 'Google PAIR 가이드북'],
  },
  {
    no: 4, stage: 'hand', slug: '04-prd', title: '문제 정의 + PRD',
    headline: '문제 정의 + PRD 상호 리뷰 / 인터뷰 질문지 제작',
    deliverable: '실제 사람 3~5명 인터뷰 + 기록',
    preread: ['SVPG "Product Discovery"', 'The Mom Test 저자 강연'],
  },
  {
    no: 5, stage: 'hand', slug: '05-user-interview', title: '유저 인터뷰',
    headline: '유저 인터뷰 결과 + 유도질문 잡아내기',
    deliverable: '지표 트리 + 우선순위 판단서 (RICE)',
    preread: ['요즘IT 그로스 아티클 1편'],
  },
  {
    no: 6, stage: 'hand', slug: '06-metrics-priority', title: '지표 · 우선순위',
    headline: '지표 설계 + 우선순위 / 아이디어 브레인스토밍',
    deliverable: '원페이저 + 검증 착수',
    preread: ["Lenny's Newsletter 무료글 1편"],
  },
  {
    no: 7, stage: 'head', slug: '07-my-idea', title: '내 아이디어',
    headline: '내 아이디어 — 전원 공격',
    deliverable: '검증 실행 결과 + 계속할까 접을까 결론',
    preread: ['YC "How to talk to users"', '벤 호로위츠 강연'],
  },
  {
    no: 8, stage: 'head', slug: '08-validation-retro', title: '검증 결과 + 회고',
    headline: '검증 결과 발표 + 8주 전체 회고',
    deliverable: '없음 — 뒤풀이',
  },
]

/**
 * 지금 진행 중인 회차. 스터디 시작 전이면 null.
 *
 * 진행자가 매주 손으로 고치는 값이다. 날짜 기반 자동 계산을 넣지 않는다 —
 * 일정은 밀리는 게 정상이고, 자동화하면 틀린 값이 화면에 뜬다.
 *
 * 이 값 하나가 사이드바 `이번 주` 배지 · 홈 배너 · 여정 맵 현재 위치 마커를 만든다.
 */
export const currentWeek: number | null = null

export function weekBySlug(slug: string): Week | undefined {
  return curriculum.find((w) => w.slug === slug)
}
```

- [ ] **Step 5: 테스트 실행 — 통과 확인**

Run: `pnpm test tests/unit/curriculum.test.ts tests/unit/stage.test.ts`
Expected: 전부 PASS

- [ ] **Step 6: 커밋**

```bash
git add -A
git commit -m "feat: add curriculum single source of truth and stage mapping"
```

---

## Task 4: 회차 문서 8개 마이그레이션 + 사이드바 구조

**Files:**
- Create: `content/docs/weeks/01-kickoff.mdx` … `08-validation-retro.mdx`, `content/docs/weeks/meta.json`, `content/docs/meta.json`, `content/docs/start/meta.json`, `content/docs/how/meta.json`, `content/docs/templates/meta.json`, `content/docs/archive/meta.json`
- Modify: `source.config.ts`
- Test: `tests/unit/weeks.test.ts`

**Interfaces:**
- Consumes: Task 1 `source`, Task 3 `curriculum`
- Produces: `content/docs/weeks/<slug>.mdx` 8개가 `curriculum`의 slug와 1:1 대응한다. 각 파일 frontmatter는 `title`, `description`, `week`(number).

- [ ] **Step 1: frontmatter 스키마 확장**

`source.config.ts`:

```ts
import { defineDocs } from 'fumadocs-mdx/config'
import { pageSchema, metaSchema } from 'fumadocs-core/source/schema'
import { z } from 'zod'

export const ARCHIVE_TYPES = ['역기획', 'PRD', '인터뷰', '지표트리', '원페이저', '검증결과'] as const

export const { docs, meta } = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema.extend({
      /** 회차 문서: 1~8 */
      week: z.number().int().min(1).max(8).optional(),
      /** 아카이브 제출물 전용 */
      author: z.string().optional(),
      type: z.enum(ARCHIVE_TYPES).optional(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    }),
  },
  meta: { schema: metaSchema },
})
```

> **왜 optional 인가:** `week`/`author`/`type`/`date`는 아카이브 파일에서만 필수다. zod 스키마 하나로 "archive 폴더 아래에서만 필수"를 표현하려면 콜렉션을 쪼개야 하는데, 그러면 아카이브가 페이지 트리에서 빠진다. 대신 **필수 여부는 Task 5의 `validate-content.ts`가 강제한다.** enum 오타와 범위 위반은 여기 zod가 잡는다.

- [ ] **Step 2: 실패하는 테스트 작성**

`tests/unit/weeks.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { curriculum } from '@/content/data/curriculum'

const DIR = 'content/docs/weeks'

describe('회차 문서', () => {
  it('curriculum의 slug마다 mdx 파일이 하나씩 있다', () => {
    curriculum.forEach((w) => {
      expect(existsSync(`${DIR}/${w.slug}.mdx`), `${w.slug}.mdx 없음`).toBe(true)
    })
  })

  it('weeks 폴더에 curriculum에 없는 mdx가 없다', () => {
    const files = readdirSync(DIR).filter((f) => f.endsWith('.mdx'))
    const known = new Set(curriculum.map((w) => `${w.slug}.mdx`))
    files.forEach((f) => expect(known.has(f), `${f}는 curriculum에 없음`).toBe(true))
  })

  it('각 문서 frontmatter의 week가 curriculum과 일치한다', () => {
    curriculum.forEach((w) => {
      const raw = readFileSync(`${DIR}/${w.slug}.mdx`, 'utf-8')
      const m = raw.match(/^---\n([\s\S]*?)\n---/)
      expect(m, `${w.slug}: frontmatter 없음`).not.toBeNull()
      expect(m![1]).toContain(`week: ${w.no}`)
    })
  })

  it('이전/다음 링크 푸터가 남아 있지 않다 — Fumadocs가 자동 생성한다', () => {
    curriculum.forEach((w) => {
      const raw = readFileSync(`${DIR}/${w.slug}.mdx`, 'utf-8')
      expect(raw, `${w.slug}: 수동 이전/다음 링크 발견`).not.toMatch(/\*\*\[← 이전/)
    })
  })
})
```

- [ ] **Step 3: 테스트 실행 — 실패 확인**

Run: `pnpm test tests/unit/weeks.test.ts`
Expected: FAIL — `content/docs/weeks` 디렉터리 없음

- [ ] **Step 4: 8개 파일 이관**

각 `weeks/NN-*.md`를 `content/docs/weeks/NN-*.mdx`로 옮긴다. 파일마다 손으로 해야 할 일:

1. 최상단에 frontmatter 추가
2. 원본의 `# 4주차 — 문제 정의 + PRD` 같은 H1 제거 (frontmatter `title`이 대신한다)
3. 최하단의 `**[← 이전: 3주차](./03-...)** | **[다음: 5주차 →](./05-...)**` 줄 제거 (Fumadocs가 자동 생성)

`content/docs/weeks/04-prd.mdx` 예시:

```mdx
---
title: 문제 정의 + PRD
description: 각자 써 온 PRD를 서로 뜯어보고, 다음 주에 실제로 쓸 인터뷰 질문지를 같이 만들어요
week: 4
---

## 준비물

(원본 weeks/04-prd.md 의 "## 준비물" 이하 본문을 그대로 옮긴다)
```

나머지 7개도 같은 방식으로. `title`은 `curriculum`의 `title`과 같게 맞추고, `description`은 `headline`을 `~해요` 체로 다듬어 쓴다.

원본 파일은 아직 지우지 않는다 (Task 14에서 정리).

- [ ] **Step 5: `meta.json` 6개 작성**

`content/docs/meta.json`:

```json
{
  "pages": ["index", "start", "how", "weeks", "templates", "archive"]
}
```

`content/docs/start/meta.json`:

```json
{
  "title": "시작하기",
  "pages": ["why", "roadmap", "glossary"]
}
```

`content/docs/how/meta.json`:

```json
{
  "title": "진행 방식",
  "pages": ["three-stages", "two-hours", "rules", "ai-playbook"]
}
```

`content/docs/weeks/meta.json`:

```json
{
  "title": "회차",
  "pages": [
    "01-kickoff",
    "02-reverse-planning-1",
    "03-reverse-planning-2",
    "04-prd",
    "05-user-interview",
    "06-metrics-priority",
    "07-my-idea",
    "08-validation-retro"
  ]
}
```

`content/docs/templates/meta.json`:

```json
{
  "title": "양식 · 예시",
  "pages": ["reverse-engineering", "prd", "interview", "metrics", "one-pager", "resources"]
}
```

`content/docs/archive/meta.json` — **개별 제출물을 사이드바에서 숨긴다:**

```json
{
  "title": "아카이브",
  "pages": ["index"]
}
```

- [ ] **Step 6: 테스트 실행 — 통과 확인**

Run: `pnpm test tests/unit/weeks.test.ts`
Expected: 4개 PASS

`start`/`how`/`templates`/`archive`의 MDX는 아직 없으므로 `meta.json`의 `pages`가 없는 항목을 가리킨다. Fumadocs는 없는 항목을 무시하므로 빌드는 통과한다. 확인:

Run: `pnpm build`
Expected: 성공. 사이드바에 `회차` 그룹과 8개 항목이 보인다.

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "feat: migrate 8 week documents to content/docs and define sidebar structure"
```

---

## Task 5: 콘텐츠 검증 스크립트 (빌드 게이트)

**Files:**
- Create: `scripts/validate-content.ts`, `lib/validators.ts`
- Modify: `package.json`
- Test: `tests/unit/validators.test.ts`

**Interfaces:**
- Consumes: Task 3 `curriculum`, Task 4 `content/docs/**`
- Produces: `lib/validators.ts` →
  - `export interface Issue { file: string; message: string }`
  - `export function checkCurriculumSlugs(files: string[], slugs: string[]): Issue[]`
  - `export function checkArchiveFrontmatter(file: string, fm: Record<string, unknown>): Issue[]`
  - `export function checkTerms(file: string, body: string, known: Set<string>): Issue[]`
  - `export function checkInternalLinks(file: string, body: string, urls: Set<string>): Issue[]`

검사 로직은 순수 함수로 `lib/validators.ts`에 두고, 파일 읽기와 종료 코드만 `scripts/validate-content.ts`가 담당한다. 이래야 파일 시스템 없이 테스트할 수 있다.

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/unit/validators.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  checkCurriculumSlugs,
  checkArchiveFrontmatter,
  checkTerms,
  checkInternalLinks,
} from '@/lib/validators'

describe('checkCurriculumSlugs', () => {
  it('일치하면 문제가 없다', () => {
    expect(checkCurriculumSlugs(['01-a', '02-b'], ['01-a', '02-b'])).toEqual([])
  })

  it('curriculum에 있는데 파일이 없으면 잡는다', () => {
    const issues = checkCurriculumSlugs(['01-a'], ['01-a', '02-b'])
    expect(issues).toHaveLength(1)
    expect(issues[0].message).toContain('02-b')
  })

  it('파일은 있는데 curriculum에 없으면 잡는다', () => {
    const issues = checkCurriculumSlugs(['01-a', '99-x'], ['01-a'])
    expect(issues).toHaveLength(1)
    expect(issues[0].message).toContain('99-x')
  })
})

describe('checkArchiveFrontmatter', () => {
  const ok = { title: 'T', week: 2, author: '홍길동', type: '역기획', date: '2026-09-15' }

  it('완전한 frontmatter를 통과시킨다', () => {
    expect(checkArchiveFrontmatter('a.mdx', ok)).toEqual([])
  })

  it('빠진 필드를 전부 보고한다', () => {
    const issues = checkArchiveFrontmatter('a.mdx', { title: 'T' })
    expect(issues.map((i) => i.message).join(' ')).toMatch(/week/)
    expect(issues.map((i) => i.message).join(' ')).toMatch(/author/)
    expect(issues.map((i) => i.message).join(' ')).toMatch(/type/)
    expect(issues.map((i) => i.message).join(' ')).toMatch(/date/)
  })

  it('week 범위를 검사한다', () => {
    expect(checkArchiveFrontmatter('a.mdx', { ...ok, week: 9 })).not.toEqual([])
  })
})

describe('checkTerms', () => {
  const known = new Set(['PRD', 'MVP'])

  it('사전에 있는 용어를 통과시킨다', () => {
    expect(checkTerms('a.mdx', '<Term>PRD</Term>를 씁니다', known)).toEqual([])
  })

  it('사전에 없는 용어를 잡는다', () => {
    const issues = checkTerms('a.mdx', '<Term>ARPU</Term>', known)
    expect(issues).toHaveLength(1)
    expect(issues[0].message).toContain('ARPU')
  })

  it('한 파일의 여러 용어를 모두 검사한다', () => {
    expect(checkTerms('a.mdx', '<Term>PRD</Term><Term>ARPU</Term>', known)).toHaveLength(1)
  })
})

describe('checkInternalLinks', () => {
  const urls = new Set(['/', '/weeks/04-prd'])

  it('존재하는 내부 링크를 통과시킨다', () => {
    expect(checkInternalLinks('a.mdx', '[4주차](/weeks/04-prd)', urls)).toEqual([])
  })

  it('깨진 내부 링크를 잡는다', () => {
    const issues = checkInternalLinks('a.mdx', '[없음](/weeks/99-x)', urls)
    expect(issues).toHaveLength(1)
    expect(issues[0].message).toContain('/weeks/99-x')
  })

  it('외부 링크와 앵커는 검사하지 않는다', () => {
    expect(checkInternalLinks('a.mdx', '[구글](https://google.com) [앵커](#준비물)', urls)).toEqual([])
  })

  it('링크 뒤 앵커를 떼고 검사한다', () => {
    expect(checkInternalLinks('a.mdx', '[x](/weeks/04-prd#준비물)', urls)).toEqual([])
  })
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `pnpm test tests/unit/validators.test.ts`
Expected: FAIL — `@/lib/validators` 모듈 없음

- [ ] **Step 3: `lib/validators.ts` 구현**

```ts
export interface Issue {
  file: string
  message: string
}

export function checkCurriculumSlugs(fileSlugs: string[], curriculumSlugs: string[]): Issue[] {
  const files = new Set(fileSlugs)
  const known = new Set(curriculumSlugs)
  const issues: Issue[] = []

  for (const slug of curriculumSlugs) {
    if (!files.has(slug)) {
      issues.push({
        file: 'content/data/curriculum.ts',
        message: `curriculum에 '${slug}'가 있는데 content/docs/weeks/${slug}.mdx 가 없습니다`,
      })
    }
  }
  for (const slug of fileSlugs) {
    if (!known.has(slug)) {
      issues.push({
        file: `content/docs/weeks/${slug}.mdx`,
        message: `'${slug}' 문서가 있는데 curriculum에 해당 회차가 없습니다`,
      })
    }
  }
  return issues
}

const ARCHIVE_TYPES = ['역기획', 'PRD', '인터뷰', '지표트리', '원페이저', '검증결과']

export function checkArchiveFrontmatter(file: string, fm: Record<string, unknown>): Issue[] {
  const issues: Issue[] = []
  const need = (k: string) => {
    if (fm[k] === undefined || fm[k] === null || fm[k] === '') {
      issues.push({ file, message: `아카이브 문서에 '${k}' frontmatter가 필요합니다` })
      return false
    }
    return true
  }

  need('title')
  if (need('week')) {
    const w = fm.week
    if (typeof w !== 'number' || !Number.isInteger(w) || w < 1 || w > 8) {
      issues.push({ file, message: `'week'는 1~8 정수여야 합니다 (받은 값: ${String(w)})` })
    }
  }
  need('author')
  if (need('type') && !ARCHIVE_TYPES.includes(String(fm.type))) {
    issues.push({
      file,
      message: `'type'은 ${ARCHIVE_TYPES.join(' | ')} 중 하나여야 합니다 (받은 값: ${String(fm.type)})`,
    })
  }
  if (need('date') && !/^\d{4}-\d{2}-\d{2}$/.test(String(fm.date))) {
    issues.push({ file, message: `'date'는 YYYY-MM-DD 형식이어야 합니다 (받은 값: ${String(fm.date)})` })
  }
  return issues
}

export function checkTerms(file: string, body: string, known: Set<string>): Issue[] {
  const issues: Issue[] = []
  for (const m of body.matchAll(/<Term>([^<]+)<\/Term>/g)) {
    const term = m[1].trim()
    if (!known.has(term)) {
      issues.push({
        file,
        message: `<Term>${term}</Term> — content/data/glossary.ts 에 '${term}' 항목이 없습니다`,
      })
    }
  }
  return issues
}

export function checkInternalLinks(file: string, body: string, urls: Set<string>): Issue[] {
  const issues: Issue[] = []
  for (const m of body.matchAll(/\]\((\/[^)\s]*)\)/g)) {
    const href = m[1].split('#')[0]
    if (href === '') continue
    const normalized = href.length > 1 && href.endsWith('/') ? href.slice(0, -1) : href
    if (!urls.has(normalized)) {
      issues.push({ file, message: `깨진 내부 링크: ${m[1]}` })
    }
  }
  return issues
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `pnpm test tests/unit/validators.test.ts`
Expected: 전부 PASS

- [ ] **Step 5: 실행 스크립트 작성**

```bash
pnpm add -D tsx gray-matter fast-glob
```

`scripts/validate-content.ts`:

```ts
import fg from 'fast-glob'
import matter from 'gray-matter'
import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import { curriculum } from '../content/data/curriculum'
import { glossary } from '../content/data/glossary'
import {
  checkCurriculumSlugs,
  checkArchiveFrontmatter,
  checkTerms,
  checkInternalLinks,
  type Issue,
} from '../lib/validators'

function urlOf(path: string): string {
  const rel = path.replace(/^content\/docs\//, '').replace(/\.mdx$/, '')
  if (rel === 'index') return '/'
  return '/' + rel.replace(/\/index$/, '')
}

async function main() {
  const files = await fg('content/docs/**/*.mdx')
  const urls = new Set(files.map(urlOf))
  const knownTerms = new Set(glossary.map((g) => g.term))
  const issues: Issue[] = []

  const weekSlugs = files
    .filter((f) => f.startsWith('content/docs/weeks/'))
    .map((f) => basename(f, '.mdx'))
  issues.push(...checkCurriculumSlugs(weekSlugs, curriculum.map((w) => w.slug)))

  for (const file of files) {
    const { data, content } = matter(readFileSync(file, 'utf-8'))

    if (file.startsWith('content/docs/archive/') && basename(file) !== 'index.mdx') {
      issues.push(...checkArchiveFrontmatter(file, data))
    }
    issues.push(...checkTerms(file, content, knownTerms))
    issues.push(...checkInternalLinks(file, content, urls))
  }

  if (issues.length > 0) {
    console.error(`\n콘텐츠 검증 실패 — ${issues.length}건\n`)
    for (const i of issues) console.error(`  ${i.file}\n    ${i.message}`)
    console.error('')
    process.exit(1)
  }
  console.log(`콘텐츠 검증 통과 — 문서 ${files.length}개`)
}

main()
```

`package.json`:

```json
{
  "scripts": {
    "validate": "tsx scripts/validate-content.ts",
    "prebuild": "fumadocs-mdx && tsc --noEmit && pnpm validate"
  }
}
```

> `content/data/glossary.ts`는 Task 7에서 만든다. 이 태스크를 먼저 끝내려면 임시로 `export const glossary: { term: string; definition: string }[] = []` 만 담은 파일을 만들어 두고, Task 7에서 채운다.

- [ ] **Step 6: 검증 스크립트가 실제로 잡는지 확인**

일부러 깨뜨려 본다.

```bash
echo '[없는 링크](/weeks/99-nope)' >> content/docs/weeks/01-kickoff.mdx
pnpm validate
```

Expected: 종료 코드 1, `깨진 내부 링크: /weeks/99-nope` 출력

되돌린다.

```bash
git checkout content/docs/weeks/01-kickoff.mdx
pnpm validate
```

Expected: `콘텐츠 검증 통과`

- [ ] **Step 7: 빌드 게이트 확인**

Run: `pnpm build`
Expected: prebuild에서 `tsc --noEmit` → `validate` 순으로 돌고 성공

- [ ] **Step 8: 커밋**

```bash
git add -A
git commit -m "feat: add content validation as a build gate"
```

---

## Task 6: README → 시작하기 · 진행 방식 · 양식 문서 마이그레이션

**Files:**
- Create: `content/docs/start/glossary.mdx`, `content/docs/how/three-stages.mdx`, `content/docs/how/two-hours.mdx`, `content/docs/how/rules.mdx`, `content/docs/how/ai-playbook.mdx`, `content/docs/templates/{reverse-engineering,prd,interview,metrics,one-pager,resources}.mdx`
- Modify: `content/docs/index.mdx`

**Interfaces:**
- Consumes: Task 4의 `meta.json` 구조
- Produces: `meta.json`이 가리키는 모든 페이지가 실제로 존재한다 (`start/why`, `start/roadmap`은 Task 11에서 만든다)

- [ ] **Step 1: 매핑표대로 옮긴다**

스펙 §4.1의 매핑표를 따른다. 각 파일은 frontmatter(`title`, `description`) + 본문.

| 만들 파일 | 원본 |
|---|---|
| `content/docs/index.mdx` | `README.md` 0장 + 1장 |
| `content/docs/start/glossary.mdx` | `README.md` 2장 |
| `content/docs/how/three-stages.mdx` | `README.md` 3장 + 부록 |
| `content/docs/how/two-hours.mdx` | `README.md` 4장 |
| `content/docs/how/rules.mdx` | `README.md` 7장 + 8장 + 10장 |
| `content/docs/how/ai-playbook.mdx` | `notion/09-ai-playbook.md` 전체 |
| `content/docs/templates/reverse-engineering.mdx` | `README.md` 5-1 + 당근마켓 예시 + 개선안 게이트 + 5-6 |
| `content/docs/templates/prd.mdx` | `README.md` 5-2 |
| `content/docs/templates/interview.mdx` | `README.md` 5-3 |
| `content/docs/templates/metrics.mdx` | `README.md` 5-4 |
| `content/docs/templates/one-pager.mdx` | `README.md` 5-5 |
| `content/docs/templates/resources.mdx` | `README.md` 6장 + 9장 |

옮기면서 지켜야 할 것:

1. 원본 H1/H2 중 문서 제목에 해당하는 것은 제거하고 frontmatter `title`로 올린다. 하위 헤딩은 한 단계씩 올린다 (`###` → `##`).
2. **본문 문장은 손대지 않는다.** `~합니다` 체 그대로. 섹션 제목만 `~해요` 체로 다듬는다 (예: "2시간 동안 실제로 뭘 하나" → "2시간을 이렇게 써요").
3. README 내부의 `./weeks/04-prd.md` 링크는 `/weeks/04-prd`로 바꾼다.
4. **표를 아직 컴포넌트로 바꾸지 않는다.** 이 태스크는 순수 이관이다. 8회차 표는 Task 10에서, 용어 사전 표는 Task 7에서 대체한다.

5. **볼드가 깨지는 패턴을 고치면서 옮긴다.** `**"따옴표로 시작하는 볼드"**를` 같은 구조는 CommonMark에서 볼드로 렌더되지 않고 `**`가 글자 그대로 남는다 — 닫는 구분자 앞이 구두점이고 뒤에 조사가 바로 붙으면 닫는 구분자로 인정되지 않기 때문이다. Task 4에서 회차 문서 6개·15건이 이 문제로 확인됐고, `README.md`에도 같은 패턴이 있다.

   기계적으로 변환한다: `**"X"**` → `"**X**"` (따옴표를 볼드 밖으로). 의미도 문구도 바뀌지 않고 렌더 결과는 의도대로 `"X"` 볼드가 된다.

   찾는 법:

   ```bash
   grep -nP '\*\*[^*
]*["”\)\]]\*\*(?=[^\s*.,!?;:\)\]}])' README.md
   ```

   이관 후 렌더된 페이지에 리터럴 `**`가 남아 있지 않은지 확인한다. **이것은 3번의 "본문 문장을 손대지 않는다" 규칙의 유일한 예외다** — 그 규칙의 목적은 임의 윤문 방지이지 렌더 결함 방치가 아니다.

- [ ] **Step 1b: `index.mdx`에 "누구를 위한 스터디인가" 섹션을 쓴다**

이 섹션은 원본 README에 없다. 진행자가 새로 준 내용이다. `index.mdx`의 소개 문단 다음, "8회차 여정" 앞에 아래를 **그대로** 넣는다.

```mdx
## 누구를 위한 스터디인가

혼자 사업을 하거나, 부업으로 뭔가를 시작하려는 사람을 위한 스터디입니다.

1인 사업에 필요한 능력은 크게 셋으로 갈립니다.

| | 회사에서는 | 혼자 할 때는 |
|---|---|---|
| **기획** | 기획자가 함 | 내가 해야 함 |
| **개발** | 개발자가 함 | 내가 해야 함 |
| **마케팅** | 마케터가 함 | 내가 해야 함 |

회사에서는 세 사람이 나눠 갖는 것을, 혼자 할 때는 한 사람이 다 갖거나
최소한 **뭐가 부족한지는 알아야** 합니다.

### 개발은 다루지 않습니다

여기 오시는 분들은 이미 개발자입니다. 만드는 건 이미 하실 줄 압니다.

그런데 **만들 줄 아는 게 오히려 함정이 됩니다.** 만들 수 있으니까 만들고,
만들었는데 아무도 안 쓰는 일이 반복됩니다.
기획은 "뭘 만들지" 정하는 일이기도 하지만, 실은 **"뭘 만들지 않을지" 정하는 일**에
더 가깝습니다. 그 판단을 못 하면 개발 실력이 좋을수록 더 빨리, 더 많이 헛것을 만듭니다.

### 기획에도 기법이 있습니다

기획을 "감"이나 "센스"라고 생각하는 경우가 많습니다. 아닙니다.
전문가들이 쓰는 방법이 있습니다. 문제를 정의하는 방식, 유저에게 묻는 방식,
지표를 세우는 방식, 우선순위를 정하는 방식 — 전부 배울 수 있는 기법입니다.

이 스터디는 그 기법들을 8주 동안 **실제로 써보는** 자리입니다.
읽고 고개 끄덕이는 게 아니라요.

### 마케팅은 왜 빠졌나

순서 때문입니다. 마케팅은 **팔 물건이 정해진 다음의 문제**입니다.
뭘 파는지 모르는 상태에서 마케팅을 배우면 쓸 데가 없습니다.
8주에 셋을 다 담을 수도 없고요. 기획이 먼저입니다.

### 어디까지 다루나

**전략 기획은 다루지 않습니다.** 전략 기획은 "우리 회사가 어느 시장에 들어갈 것인가"에
가깝습니다. 이 스터디는 그다음 단계 — **시장 분석 → 프로덕트 기획 → 서비스 기획**이
중심입니다.

1인 사업은 자원이 없어서 대개 여기서 승부가 갈립니다. 부업이라면 시간이 더 없습니다.
**틀린 걸 오래 만드는 비용이 회사 다닐 때보다 훨씬 큽니다.**
그래서 이 스터디는 마지막 2주를 통째로 "실제로 검증하기"에 씁니다.

목표는 하나입니다 — **1인 사업이든 부업이든, 실제로 뭔가를 이루는 것.**
```

이 섹션의 표는 3행짜리 작은 표라 모바일에서도 넘치지 않는다. 컴포넌트로 바꾸지 않는다.


`content/docs/how/two-hours.mdx` 예시:

```mdx
---
title: 2시간을 이렇게 써요
description: 매 회차 이 순서로 진행합니다. 반박 타임이 40분인 이유가 여기 있습니다
---

매 회차 이 순서로 진행합니다.

(README 4장의 코드블록 타임테이블을 그대로 옮긴다 — Task 9에서 <TwoHourBlock />으로 교체한다)

## 왜 "반박 타임"이 40분이나 되나

발표는 준비하면 누구나 합니다. 근데 **내 기획안이 공격당했을 때 방어하는 경험**이 기획력을 만듭니다.
...
```

- [ ] **Step 2: 링크 검증**

Run: `pnpm validate`
Expected: 통과. 깨진 링크가 나오면 3번 규칙대로 고친다.

- [ ] **Step 3: 빌드하고 사이드바 확인**

Run: `pnpm build && pnpm dev`

확인할 것: 사이드바에 5그룹(`시작하기` / `진행 방식` / `회차` / `양식 · 예시` / `아카이브`)이 스펙 순서대로 보인다. `시작하기`에는 `용어 사전`만 있고 `why`/`roadmap`은 아직 없다 (Task 11).

- [ ] **Step 4: 커밋**

```bash
git add -A
git commit -m "feat: migrate README chapters into start/how/templates documents"
```

---

## Task 7: 용어 사전 — `<Glossary />` 와 `<Term />`

**Files:**
- Create: `content/data/glossary.ts`, `components/ui/glossary.tsx`, `components/ui/term.tsx`
- Modify: `components/mdx.tsx`, `content/docs/start/glossary.mdx`
- Test: `tests/unit/glossary.test.tsx`

**Interfaces:**
- Consumes: 없음
- Produces:
  - `content/data/glossary.ts` → `export interface GlossaryEntry { term: string; definition: string; example?: string }`, `export const glossary: GlossaryEntry[]`, `export function lookup(term: string): GlossaryEntry | undefined`
  - `components/ui/glossary.tsx` → `export function Glossary(): JSX.Element` (검색 입력 + 아코디언, 클라이언트 컴포넌트)
  - `components/ui/term.tsx` → `export function Term({ children }: { children: string }): JSX.Element`

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/unit/glossary.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { glossary, lookup } from '@/content/data/glossary'
import { Glossary } from '@/components/ui/glossary'
import { Term } from '@/components/ui/term'

describe('glossary 데이터', () => {
  it('README 2장의 용어를 모두 담는다', () => {
    const required = ['역기획', 'BM', 'PRD', '지표', 'North Star 지표', '퍼널',
      '전환율', '리텐션', 'MVP', 'PMF', 'CAC', 'LTV', '유닛 이코노믹스',
      'RICE', '피벗', 'eval', '환각']
    const terms = new Set(glossary.map((g) => g.term))
    required.forEach((t) => expect(terms.has(t), `'${t}' 누락`).toBe(true))
  })

  it('용어가 중복되지 않는다', () => {
    expect(new Set(glossary.map((g) => g.term)).size).toBe(glossary.length)
  })

  it('lookup이 항목을 찾는다', () => {
    expect(lookup('PRD')?.definition).toContain('Product Requirements')
    expect(lookup('없는용어')).toBeUndefined()
  })
})

describe('<Glossary />', () => {
  it('모든 용어를 렌더링한다', () => {
    render(<Glossary />)
    expect(screen.getByText('역기획')).toBeInTheDocument()
    expect(screen.getByText('PMF')).toBeInTheDocument()
  })

  it('검색어로 목록을 좁힌다', async () => {
    render(<Glossary />)
    await userEvent.type(screen.getByRole('searchbox'), '리텐션')
    expect(screen.getByText('리텐션')).toBeInTheDocument()
    expect(screen.queryByText('피벗')).not.toBeInTheDocument()
  })

  it('결과가 없으면 빈 상태를 보여준다', async () => {
    render(<Glossary />)
    await userEvent.type(screen.getByRole('searchbox'), 'zzzz')
    expect(screen.getByText(/찾는 용어가 없어요/)).toBeInTheDocument()
  })
})

describe('<Term />', () => {
  it('용어와 정의를 접근 가능하게 노출한다', () => {
    render(<Term>PRD</Term>)
    const el = screen.getByText('PRD')
    expect(el).toHaveAttribute('aria-label', expect.stringContaining('Product Requirements'))
  })

  it('사전에 없는 용어에 대해 던진다 — 빌드 때 잡히게', () => {
    expect(() => render(<Term>없는용어</Term>)).toThrow()
  })
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `pnpm test tests/unit/glossary.test.tsx`
Expected: FAIL

- [ ] **Step 3: `content/data/glossary.ts` 구현**

Task 5에서 만든 임시 파일을 덮어쓴다. `README.md` 2장 표의 20개 항목을 그대로 옮긴다.

```ts
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
    // 원본 README 표는 이 자리에 "5장에 예시 있음"이라고 적혀 있었다. 장 번호는 분할 이후
    // 존재하지 않으므로, 지금 실제로 그 내용이 있는 곳을 말로 가리킨다.
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
```

> 위 목록은 19개다. 테스트가 요구하는 `'지표'`까지 포함되어 있는지 확인하고, README 2장을 다시 훑어 빠진 항목이 있으면 채운다.

- [ ] **Step 4: `components/ui/term.tsx` 구현**

```tsx
import { lookup } from '@/content/data/glossary'

export function Term({ children }: { children: string }) {
  const entry = lookup(children)
  if (!entry) {
    throw new Error(
      `<Term>${children}</Term> — content/data/glossary.ts 에 '${children}' 항목이 없습니다`,
    )
  }
  return (
    <span
      tabIndex={0}
      aria-label={`${entry.term}: ${entry.definition}`}
      title={entry.definition}
      style={{
        borderBottom: '1.5px dotted var(--g500)',
        cursor: 'help',
        outlineColor: 'var(--blue)',
      }}
    >
      {children}
    </span>
  )
}
```

> `--g500`은 텍스트가 아니라 밑줄(장식)에 쓰므로 색 규칙 위반이 아니다.

- [ ] **Step 5: `components/ui/glossary.tsx` 구현**

```tsx
'use client'

import { useMemo, useState } from 'react'
import { glossary } from '@/content/data/glossary'

export function Glossary() {
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return glossary
    return glossary.filter(
      (g) =>
        g.term.toLowerCase().includes(needle) ||
        g.definition.toLowerCase().includes(needle),
    )
  }, [q])

  return (
    <div>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="어떤 용어가 궁금하세요?"
        style={{
          width: '100%',
          background: 'var(--g100)',
          border: 'none',
          borderRadius: 'var(--r-block)',
          padding: '12px 16px',
          fontSize: 15,
          color: 'var(--g900)',
          outlineColor: 'var(--blue)',
        }}
      />

      {filtered.length === 0 ? (
        <p style={{ color: 'var(--g600)', marginTop: 20 }}>찾는 용어가 없어요.</p>
      ) : (
        <div style={{ marginTop: 12 }}>
          {filtered.map((g) => (
            <details
              key={g.term}
              style={{
                background: 'var(--g50)',
                borderRadius: 'var(--r-block)',
                padding: '12px 16px',
                marginBottom: 8,
              }}
            >
              <summary style={{ fontWeight: 700, color: 'var(--g900)', cursor: 'pointer' }}>
                {g.term}
              </summary>
              <p style={{ color: 'var(--g700)', marginTop: 8, lineHeight: 1.75 }}>{g.definition}</p>
              {g.example && (
                <p style={{ color: 'var(--g600)', marginTop: 6, fontSize: 13 }}>예: {g.example}</p>
              )}
            </details>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: MDX 전역 등록**

`components/mdx.tsx`:

```tsx
import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'
import { Glossary } from '@/components/ui/glossary'
import { Term } from '@/components/ui/term'

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Glossary,
    Term,
    ...components,
  }
}
```

- [ ] **Step 7: 용어 사전 문서를 컴포넌트로 교체**

`content/docs/start/glossary.mdx` — Task 6에서 옮긴 표를 지우고:

```mdx
---
title: 용어 사전
description: 모르는 단어가 나오면 여기로 오세요. 본문에서 점선 밑줄 친 단어는 그 자리에서 뜻이 보여요
---

이 스터디에 나오는 단어들입니다. 본문에서 점선 밑줄이 그어진 단어는 마우스를 올리거나 탭하면 그 자리에서 뜻이 보입니다.

<Glossary />
```

- [ ] **Step 7b: 본문에 `<Term>` 을 실제로 붙인다**

`<Term>` 을 만들기만 하고 본문에 안 쓰면 아무 효과가 없다. 스펙 §7.2 와 완료 기준 §12-10 이 "본문 용어에 `<Term />` 팝오버가 붙어 있다"를 요구하고, 원본 README 0장의 "용어 사전을 먼저 읽으면 나머지가 쉬워집니다"라는 조언을 Task 6 에서 뺀 근거가 바로 이 기능이다. 붙이지 않으면 그 근거가 무너진다.

**범위 — 정확히 이만큼만:**

- 각 문서에서 **용어당 첫 등장 한 번만** 감싼다. 같은 문서에서 두 번째부터는 그대로 둔다 — 모든 등장에 점선 밑줄을 그으면 본문이 시끄러워진다
- **본문 문단에만** 붙인다. 헤딩·표 셀·코드블록 안에는 붙이지 않는다 (헤딩은 TOC 에 그대로 들어가고, 표 셀은 좁아서 밑줄이 답답하다)
- `content/docs/start/glossary.mdx` 는 대상이 아니다 — 이미 `<Glossary />` 로 대체됐다
- **단어 자체는 바꾸지 않는다.** `<Term>` 태그로 감싸기만 한다. 조사·띄어쓰기·어투를 건드리지 않는다. 이것이 "본문 문장을 손대지 않는다" 규칙의 또 다른 좁은 예외다

대상 문서와 용어는 아래 스크립트로 확인한다 (측정 결과 문서 19개 · 지점 80곳, `glossary.mdx` 제외 시 약 61곳):

```bash
node -e "
const fs=require('fs'),path=require('path');
const {glossary}=require('./content/data/glossary.ts');
" 2>/dev/null || true
```

`.ts` 를 node 로 직접 읽을 수 없으므로, 실제로는 `content/data/glossary.ts` 의 `term` 목록을 눈으로 옮겨 grep 하거나 짧은 `tsx` 스크립트를 임시로 써서 목록을 뽑는다. 임시 스크립트는 커밋하지 않는다.

주의할 점:

- `역기획` 처럼 다른 단어의 일부로 들어가는 경우를 조심한다. `역기획할` 의 `역기획` 을 감싸는 것은 맞지만, 감싼 뒤 `<Term>역기획</Term>할` 이 되어야 하고 `<Term>역기획할</Term>` 이 되면 안 된다 — `<Term>` 은 사전에 없는 용어에 대해 던지므로 후자는 빌드를 깨뜨린다
- `0→1` 처럼 기호가 섞인 용어는 `<Term>0→1</Term>` 로 정확히 일치해야 한다
- 감싼 뒤 `pnpm validate` 가 통과해야 한다. Task 5 의 `checkTerms` 가 사전에 없는 용어를 잡는다

작업 후 **문서별 삽입 개수**를 리포트에 표로 적고, 렌더된 페이지에서 점선 밑줄이 실제로 보이는지 최소 3개 문서에서 확인한다.

- [ ] **Step 8: 테스트 실행 — 통과 확인**

Run: `pnpm test tests/unit/glossary.test.tsx`
Expected: 전부 PASS

- [ ] **Step 9: 빌드 확인**

Run: `pnpm build`
Expected: 성공

- [ ] **Step 10: 커밋**

```bash
git add -A
git commit -m "feat: replace glossary table with searchable Glossary and inline Term components"
```

---

## Task 8: 회차 문서 UI 부품 — `<WeekHeader />` `<Homework />` `<Callout />`

**Files:**
- Create: `components/ui/week-header.tsx`, `components/ui/homework.tsx`, `components/ui/callout.tsx`
- Modify: `components/mdx.tsx`, `content/docs/weeks/*.mdx` (8개)
- Test: `tests/unit/week-header.test.tsx`, `tests/unit/homework.test.tsx`

**Interfaces:**
- Consumes: Task 3 `curriculum`, `weekBySlug`, `lib/stage.ts`의 `stageOf`
- Produces:
  - `export function WeekHeader({ week }: { week: number }): JSX.Element`
  - `export function Homework({ week }: { week: number }): JSX.Element`
  - `export function Callout({ type, children }: { type?: 'info' | 'warn'; children: React.ReactNode }): JSX.Element`

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/unit/week-header.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WeekHeader } from '@/components/ui/week-header'

describe('<WeekHeader />', () => {
  it('회차 번호와 단계를 배지로 보여준다', () => {
    render(<WeekHeader week={4} />)
    expect(screen.getByText('4회차')).toBeInTheDocument()
    expect(screen.getByText(/손 — 기획 기법/)).toBeInTheDocument()
  })

  it('단계를 색이 아니라 이모지+라벨로도 전달한다', () => {
    render(<WeekHeader week={1} />)
    expect(screen.getByText(/👀/)).toBeInTheDocument()
    expect(screen.getByText(/눈 — 역기획/)).toBeInTheDocument()
  })

  it('범위를 벗어난 회차에 대해 던진다', () => {
    expect(() => render(<WeekHeader week={99} />)).toThrow()
  })
})
```

`tests/unit/homework.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Homework } from '@/components/ui/homework'

describe('<Homework />', () => {
  it('다음 회차 숙제를 curriculum에서 가져온다', () => {
    render(<Homework week={4} />)
    expect(screen.getByText(/5주차 숙제/)).toBeInTheDocument()
    expect(screen.getByText(/인터뷰/)).toBeInTheDocument()
  })

  it('마지막 회차는 숙제가 없다고 알린다', () => {
    render(<Homework week={8} />)
    expect(screen.getByText(/없어요/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `pnpm test tests/unit/week-header.test.tsx tests/unit/homework.test.tsx`
Expected: FAIL

- [ ] **Step 3: `components/ui/week-header.tsx` 구현**

```tsx
import { curriculum } from '@/content/data/curriculum'
import { stageOf } from '@/lib/stage'

const badge: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  background: 'var(--g100)',
  color: 'var(--g700)',
  fontSize: 12,
  fontWeight: 700,
  padding: '5px 11px',
  borderRadius: 'var(--r-pill)',
}

export function WeekHeader({ week }: { week: number }) {
  const w = curriculum.find((x) => x.no === week)
  if (!w) throw new Error(`curriculum에 ${week}회차가 없습니다`)
  const stage = stageOf(week)

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '0 0 16px' }}>
      <span style={badge} className="tabular">{week}회차</span>
      <span style={{ ...badge, background: stage.chipBgVar, color: stage.chipFgVar }}>
        {stage.emoji} {stage.label}
      </span>
      <span style={badge}>2시간</span>
    </div>
  )
}
```

- [ ] **Step 4: `components/ui/homework.tsx` 구현**

```tsx
import { curriculum } from '@/content/data/curriculum'

export function Homework({ week }: { week: number }) {
  const w = curriculum.find((x) => x.no === week)
  if (!w) throw new Error(`curriculum에 ${week}회차가 없습니다`)

  const isLast = week === curriculum.length

  return (
    <div
      style={{
        background: 'var(--blue-bg)',
        borderRadius: 'var(--r-card)',
        padding: '17px 19px',
        margin: '20px 0',
      }}
    >
      <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--blue)' }}>
        {isLast ? '숙제' : `${week + 1}주차 숙제`}
      </div>
      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--g900)', marginTop: 5 }}>
        {isLast ? '없어요 — 뒤풀이입니다' : w.deliverable}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: `components/ui/callout.tsx` 구현**

```tsx
export function Callout({
  type = 'info',
  children,
}: {
  type?: 'info' | 'warn'
  children: React.ReactNode
}) {
  const warn = type === 'warn'
  return (
    <div
      role="note"
      style={{
        background: warn ? '#FEF0F1' : 'var(--g50)',
        borderRadius: 'var(--r-card)',
        padding: '16px 18px',
        margin: '20px 0',
        color: warn ? 'var(--g800)' : 'var(--g700)',
        lineHeight: 1.75,
      }}
    >
      {children}
    </div>
  )
}
```

> 다크 모드용 경고 배경은 `app/global.css`의 `.dark` 블록에 `--warn-bg`를 추가하고 이 값을 `var(--warn-bg)`로 바꿔도 된다. 라이트 우선이므로 지금은 이대로 둔다.

- [ ] **Step 6: MDX 등록**

`components/mdx.tsx`에 `WeekHeader`, `Homework`, `Callout`을 추가한다 (Task 7의 `Glossary`, `Term` 옆에).

- [ ] **Step 7: 8개 회차 문서에 적용**

각 `content/docs/weeks/NN-*.mdx`에서:

1. frontmatter 바로 뒤에 `<WeekHeader week={N} />` 추가
2. 원본의 "📌 N주차까지 숙제" 섹션 제목 바로 아래에 `<Homework week={N} />` 추가 (기존 숙제 상세 설명은 그대로 두고, 카드가 요약 역할)
3. 원본의 `> ⚠️ ...` 인용 경고 블록을 `<Callout type="warn">...</Callout>`로 교체

`04-prd.mdx` 상단 예시:

```mdx
---
title: 문제 정의 + PRD
description: 각자 써 온 PRD를 서로 뜯어보고, 다음 주에 실제로 쓸 인터뷰 질문지를 같이 만들어요
week: 4
---

<WeekHeader week={4} />

## 준비물
```

- [ ] **Step 8: 테스트 실행 — 통과 확인**

Run: `pnpm test tests/unit/week-header.test.tsx tests/unit/homework.test.tsx`
Expected: 전부 PASS

- [ ] **Step 9: 빌드 + 육안 확인**

Run: `pnpm build && pnpm dev`

`/weeks/04-prd` 확인: 제목 아래에 배지 3개(4회차 / ✋ 손 — 기획 기법 / 2시간), 숙제가 파란 카드로 독립되어 보인다.

- [ ] **Step 10: 커밋**

```bash
git add -A
git commit -m "feat: add WeekHeader, Homework, Callout components and apply to week documents"
```

---

## Task 9: 시각화 ① `<ThreeStages />` · ② `<TwoHourBlock />`

**Files:**
- Create: `components/visuals/three-stages.tsx`, `components/visuals/two-hour-block.tsx`
- Modify: `components/mdx.tsx`, `content/docs/how/three-stages.mdx`, `content/docs/how/two-hours.mdx`
- Test: `tests/unit/three-stages.test.tsx`, `tests/unit/two-hour-block.test.tsx`

**Interfaces:**
- Consumes: `lib/stage.ts`의 `STAGES`
- Produces:
  - `export function ThreeStages(): JSX.Element`
  - `export function TwoHourBlock(): JSX.Element`

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/unit/three-stages.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThreeStages } from '@/components/visuals/three-stages'

describe('<ThreeStages />', () => {
  it('세 단계를 모두 보여준다', () => {
    render(<ThreeStages />)
    expect(screen.getByText(/눈 — 역기획/)).toBeInTheDocument()
    expect(screen.getByText(/손 — 기획 기법/)).toBeInTheDocument()
    expect(screen.getByText(/머리 — 0→1 실전/)).toBeInTheDocument()
  })

  it('회차 범위를 표시한다', () => {
    render(<ThreeStages />)
    expect(screen.getByText('1~3회차')).toBeInTheDocument()
    expect(screen.getByText('7~8회차')).toBeInTheDocument()
  })

  it('요리 비유를 담는다', () => {
    render(<ThreeStages />)
    expect(screen.getByText(/레시피 추측/)).toBeInTheDocument()
  })

  it('단계별 결과 차이를 담는다', () => {
    render(<ThreeStages />)
    expect(screen.getByText(/분석은 잘하는데 문서는 못 쓰는/)).toBeInTheDocument()
  })
})
```

`tests/unit/two-hour-block.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TwoHourBlock, BLOCKS } from '@/components/visuals/two-hour-block'

describe('<TwoHourBlock />', () => {
  it('블록 시간 합이 120분이다', () => {
    expect(BLOCKS.reduce((s, b) => s + b.minutes, 0)).toBe(120)
  })

  it('네 블록을 모두 보여준다', () => {
    render(<TwoHourBlock />)
    expect(screen.getByText('체크인')).toBeInTheDocument()
    expect(screen.getByText(/반박 타임/)).toBeInTheDocument()
    expect(screen.getByText(/다음 회차 정하기/)).toBeInTheDocument()
  })

  it('반박 타임 하나만 강조 블록이다', () => {
    expect(BLOCKS.filter((b) => b.hero)).toHaveLength(1)
    expect(BLOCKS.find((b) => b.hero)!.label).toContain('반박')
  })

  it('각 블록의 분을 표시한다', () => {
    render(<TwoHourBlock />)
    expect(screen.getByText('40분')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `pnpm test tests/unit/three-stages.test.tsx tests/unit/two-hour-block.test.tsx`
Expected: FAIL

- [ ] **Step 3: `components/visuals/three-stages.tsx` 구현**

데스크톱 3칸 가로 → 모바일 세로 스택. CSS Grid `auto-fit`으로 미디어 쿼리 없이 처리한다.

```tsx
import { STAGES } from '@/lib/stage'

const DETAIL: Record<string, { doing: string; cooking: string; ifOnly: string }> = {
  eye: {
    doing: '남의 서비스를 뜯어본다',
    cooking: '맛집 가서 먹어보고 레시피 추측하기',
    ifOnly: '1단만 하면 — 분석은 잘하는데 문서는 못 쓰는 사람',
  },
  hand: {
    doing: '내가 직접 기획 문서를 쓴다',
    cooking: '레시피 직접 써보기',
    ifOnly: '1+2단만 하면 — 문서는 쓰는데 결정은 못 하는 사람',
  },
  head: {
    doing: '내 아이디어를 실제로 검증한다',
    cooking: '내 요리 만들어서 남한테 먹여보기 — 여기서만 실력이 늚',
    ifOnly: '3단까지 하면 — 마음가짐이 생김. 3단에서만 생깁니다',
  },
}

export function ThreeStages() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 10,
        margin: '20px 0',
      }}
    >
      {Object.values(STAGES).map((s) => {
        const d = DETAIL[s.key]
        return (
          <div
            key={s.key}
            style={{
              background: 'var(--g50)',
              borderRadius: 'var(--r-card)',
              padding: '16px 18px',
            }}
          >
            <div style={{ fontSize: 26 }}>{s.emoji}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--g900)', marginTop: 4 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--g600)' }} className="tabular">
              {s.range}
            </div>
            <p style={{ fontSize: 14.5, color: 'var(--g700)', marginTop: 10, lineHeight: 1.7 }}>
              {d.doing}
            </p>
            <p
              style={{
                fontSize: 12.5,
                color: 'var(--g600)',
                marginTop: 10,
                paddingTop: 10,
                borderTop: '1px solid var(--g200)',
              }}
            >
              {d.cooking}
            </p>
            <p style={{ fontSize: 12.5, color: 'var(--g600)', marginTop: 8 }}>{d.ifOnly}</p>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: `components/visuals/two-hour-block.tsx` 구현**

데스크톱에서도 세로 스택이다 (가로 120분 바는 모바일에서 텍스트가 안 들어간다).

```tsx
export interface Block {
  minutes: number
  label: string
  detail: string
  hero?: boolean
}

export const BLOCKS: Block[] = [
  { minutes: 10, label: '체크인', detail: '이번 주 어땠는지, 산출물 만들다 막힌 지점 공유' },
  {
    minutes: 50,
    label: '발표',
    detail: '각자 만들어 온 산출물 발표 (1인 10분 내외). 슬라이드 만들지 마세요 — 문서 그대로 화면공유',
  },
  {
    minutes: 40,
    label: '🗡 반박 타임',
    detail:
      '"악마의 변호인" 1명이 그 회차 발표를 전부 깨려고 시도. 역기획 회차엔 "그 회사 CEO 역할" 1명이 개선안을 방어. 역할은 매 회차 돌아가면서 맡습니다',
    hero: true,
  },
  {
    minutes: 20,
    label: '다음 회차 정하기',
    detail: '다음 주제·대상 회사 확정, 역할 배정, 막히면 도와줄 사람 짝 지정',
  },
]

const TOTAL = 120

export function TwoHourBlock() {
  return (
    <div
      style={{
        background: 'var(--g50)',
        borderRadius: 'var(--r-card)',
        padding: '16px 18px',
        margin: '20px 0',
      }}
    >
      {BLOCKS.map((b) => (
        <div key={b.label} style={{ padding: '10px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              className="tabular"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: b.hero ? 'var(--blue)' : 'var(--g600)',
                width: 42,
                flexShrink: 0,
              }}
            >
              {b.minutes}분
            </span>
            <span
              aria-hidden
              style={{
                height: 8,
                borderRadius: 'var(--r-pill)',
                background: b.hero ? 'var(--blue)' : 'var(--g300)',
                width: `${(b.minutes / TOTAL) * 100}%`,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 14.5,
                fontWeight: b.hero ? 800 : 600,
                color: b.hero ? 'var(--g900)' : 'var(--g700)',
              }}
            >
              {b.label}
            </span>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--g600)', margin: '4px 0 0 54px', lineHeight: 1.6 }}>
            {b.detail}
          </p>
        </div>
      ))}
      <p
        style={{
          fontSize: 12.5,
          color: 'var(--g600)',
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid var(--g200)',
          lineHeight: 1.7,
        }}
      >
        발표는 준비하면 누구나 합니다. 근데{' '}
        <b style={{ color: 'var(--g900)' }}>내 기획안이 공격당했을 때 방어하는 경험</b>이 기획력을
        만듭니다. 그래서 반박이 40분입니다.
      </p>
    </div>
  )
}
```

- [ ] **Step 5: MDX 등록 및 문서 교체**

`components/mdx.tsx`에 `ThreeStages`, `TwoHourBlock` 추가.

`content/docs/how/three-stages.mdx` — 원본 ASCII 코드블록과 요리 비유 표를 지우고 `<ThreeStages />`로 교체.

`content/docs/how/two-hours.mdx` — 원본 코드블록 타임테이블을 지우고 `<TwoHourBlock />`로 교체. "왜 반박 타임이 40분이나 되나" 이후 본문은 그대로 둔다.

- [ ] **Step 6: 테스트 실행 — 통과 확인**

Run: `pnpm test tests/unit/three-stages.test.tsx tests/unit/two-hour-block.test.tsx`
Expected: 전부 PASS

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "feat: add ThreeStages and TwoHourBlock visualizations"
```

---

## Task 10: 시각화 ③ `<JourneyMap />` + 현재 회차 표시

**Files:**
- Create: `components/visuals/journey-map.tsx`, `components/ui/current-week-banner.tsx`
- Modify: `components/mdx.tsx`, `content/docs/index.mdx`, `app/layout.tsx`, `app/global.css`
- Test: `tests/unit/journey-map.test.tsx`

**Interfaces:**
- Consumes: Task 3 `curriculum`, `currentWeek`, `lib/stage.ts`의 `stageOf`
- Produces:
  - `export function JourneyMap(): JSX.Element` — 8칸, 각 칸이 `/weeks/<slug>` 링크
  - `export function CurrentWeekBanner(): JSX.Element | null` — `currentWeek`가 `null`이면 `null` 반환

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/unit/journey-map.test.tsx`:

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { JourneyMap } from '@/components/visuals/journey-map'
import { curriculum } from '@/content/data/curriculum'

afterEach(() => vi.resetModules())

describe('<JourneyMap />', () => {
  it('8회차를 모두 링크로 그린다', () => {
    render(<JourneyMap />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(8)
    curriculum.forEach((w) => {
      expect(links.some((a) => a.getAttribute('href') === `/weeks/${w.slug}`)).toBe(true)
    })
  })

  it('각 칸에 하는 것과 만들어 올 것을 함께 보여준다', () => {
    render(<JourneyMap />)
    expect(screen.getByText(curriculum[0].title)).toBeInTheDocument()
    expect(screen.getByText(curriculum[0].deliverable)).toBeInTheDocument()
  })

  it('단계를 색이 아니라 이모지로도 구분한다', () => {
    render(<JourneyMap />)
    expect(screen.getAllByText('👀')).toHaveLength(3)
    expect(screen.getAllByText('✋')).toHaveLength(3)
    expect(screen.getAllByText('🧠')).toHaveLength(2)
  })

  it('currentWeek가 null이면 현재 위치 마커가 없다', () => {
    render(<JourneyMap />)
    expect(screen.queryByText('이번 주')).not.toBeInTheDocument()
  })
})

describe('<JourneyMap /> — 진행 중일 때', () => {
  it('currentWeek 칸에 이번 주 마커를 붙인다', async () => {
    vi.doMock('@/content/data/curriculum', async () => {
      const actual = await vi.importActual<typeof import('@/content/data/curriculum')>(
        '@/content/data/curriculum',
      )
      return { ...actual, currentWeek: 4 }
    })
    const { JourneyMap: Mapped } = await import('@/components/visuals/journey-map')
    render(<Mapped />)
    expect(screen.getByText('이번 주')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `pnpm test tests/unit/journey-map.test.tsx`
Expected: FAIL

> ⚠️ **`#nd-page`에 `max-width: 640px`가 걸려 있다** (Task 2). 이 규칙은 Fumadocs의 `full` 모드 넓은 레이아웃까지 무조건 조인다. 여정 맵은 프로즈 칼럼 안에서 **자체 가로 스크롤**하도록 설계됐으므로 640px 안에서 정상 동작해야 한다. 만약 여정 맵을 본문보다 넓게 빼고 싶어지면 그 상한과 싸우게 되는데, 그때는 임의로 규칙을 지우지 말고 `#nd-page`에 예외 선택자를 추가하는 쪽으로 가고 리포트에 적는다. 640px 상한 자체는 스펙의 구속 조건이다.

- [ ] **Step 3: `components/visuals/journey-map.tsx` 구현**

모바일에서는 가로 스크롤 + 스냅. 컨테이너 자신만 스크롤하므로 페이지가 밀리지 않는다.

```tsx
import Link from 'next/link'
import { curriculum, currentWeek } from '@/content/data/curriculum'
import { stageOf } from '@/lib/stage'

export function JourneyMap() {
  return (
    <div
      style={{
        display: 'flex',
        gap: 6,
        margin: '20px 0',
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        paddingBottom: 4,
      }}
    >
      {curriculum.map((w) => {
        const stage = stageOf(w.no)
        const isCurrent = currentWeek === w.no
        return (
          <Link
            key={w.slug}
            href={`/weeks/${w.slug}`}
            style={{
              flex: '1 0 116px',
              scrollSnapAlign: 'start',
              textDecoration: 'none',
              background: isCurrent ? 'var(--blue-bg)' : 'var(--g50)',
              borderRadius: 'var(--r-block)',
              padding: '10px 10px 12px',
            }}
          >
            <div
              aria-hidden
              style={{
                height: 6,
                borderRadius: 'var(--r-pill)',
                background: isCurrent ? 'var(--blue)' : stage.barVar,
                marginBottom: 7,
              }}
            />
            <div
              className="tabular"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: isCurrent ? 'var(--blue)' : 'var(--g600)',
              }}
            >
              {String(w.no).padStart(2, '0')} <span>{stage.emoji}</span>
            </div>
            {isCurrent && (
              <div
                style={{
                  display: 'inline-block',
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#fff',
                  background: 'var(--blue)',
                  borderRadius: 'var(--r-pill)',
                  padding: '1.5px 6px',
                  margin: '4px 0',
                }}
              >
                이번 주
              </div>
            )}
            <div
              style={{ fontSize: 13, fontWeight: 700, color: 'var(--g900)', marginTop: 4, lineHeight: 1.35 }}
            >
              {w.title}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--g600)', marginTop: 6, lineHeight: 1.4 }}>
              {w.deliverable}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: `components/ui/current-week-banner.tsx` 구현**

```tsx
import Link from 'next/link'
import { curriculum, currentWeek } from '@/content/data/curriculum'

export function CurrentWeekBanner() {
  if (currentWeek === null) return null
  const w = curriculum.find((x) => x.no === currentWeek)
  if (!w) return null

  return (
    <Link
      href={`/weeks/${w.slug}`}
      style={{
        display: 'block',
        background: 'var(--blue-bg)',
        borderRadius: 'var(--r-card)',
        padding: '14px 18px',
        margin: '0 0 24px',
        textDecoration: 'none',
      }}
    >
      <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--blue)' }}>이번 주</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--g900)', marginTop: 3 }}>
        {currentWeek}회차 · {w.title}
      </div>
      <div style={{ fontSize: 13, color: 'var(--g700)', marginTop: 3 }}>{w.headline}</div>
    </Link>
  )
}
```

- [ ] **Step 5: 홈 문서에 붙이고 8회차 표를 대체한다**

`components/mdx.tsx`에 `JourneyMap`, `CurrentWeekBanner` 추가.

`content/docs/index.mdx` — **파일을 통째로 다시 쓰지 않는다.** Task 6이 쓴 본문(특히 "누구를 위한 스터디인가" 섹션)을 그대로 두고, 다음 두 가지만 고친다.

1. frontmatter 바로 뒤에 `<CurrentWeekBanner />` 추가
2. "8회차 한눈에 보기" 표를 지우고 `## 8회차 여정` + `<JourneyMap />`으로 교체

결과물은 이런 모양이 된다 (가운데 본문은 Task 6이 쓴 그대로):

```mdx
---
title: 스터디 한눈에 보기
description: 잘나가는 서비스를 뜯어보고 → 직접 기획 문서를 써보고 → 내 아이디어를 진짜 사람들한테 검증해보는 8회차
---

<CurrentWeekBanner />

잘나가는 서비스를 뜯어보고 → 직접 기획 문서를 써보고 → 내 아이디어를 진짜 사람들한테 검증해보는 8회차입니다.
**비용 0원.** 책 안 삽니다. 전부 무료 자료로 진행합니다.

**대상** 개발자 / 기획 직무 전환에 관심 있는 분 / 언젠가 창업을 생각 중인 분
**인원** 4~6명 · **기간** 8회차 (주 1회 × 2시간 = 약 2개월) · **비용** 0원

## 누구를 위한 스터디인가

(Task 6이 쓴 섹션 그대로 — 손대지 않는다)

## 8회차 여정

<JourneyMap />

(README 1장 "왜 하는가" 본문 — Task 6이 옮긴 그대로)
```

- [ ] **Step 6: 사이드바 현재 회차 배지**

Fumadocs 사이드바 항목을 직접 커스터마이징하는 대신, CSS로 현재 회차 링크에 마커를 붙인다. `app/global.css`에 추가:

```css
/* currentWeek 배지 — data-current-week 속성이 있을 때만 표시 */
#nd-sidebar a[href="/weeks/CURRENT_SLUG"]::after {
  content: '이번 주';
  margin-left: auto;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  background: var(--blue);
  padding: 1.5px 6px;
  border-radius: var(--r-pill);
}
```

> 위 방식은 slug를 CSS에 하드코딩해야 해서 `curriculum.ts` 단일 원천 원칙을 깬다. **대신 이렇게 한다:** `app/layout.tsx`에서 `currentWeek`를 읽어 `<body>`에 `data-current-week={slug ?? ''}` 를 붙이고, CSS는 속성 선택자로 잡는다.
>
> `app/layout.tsx`:
> ```tsx
> import { curriculum, currentWeek } from '@/content/data/curriculum'
> const currentSlug = currentWeek
>   ? curriculum.find((w) => w.no === currentWeek)?.slug ?? ''
>   : ''
> // <body data-current-week={currentSlug}>
> ```
>
> `app/global.css`:
> ```css
> body[data-current-week=''] #nd-sidebar a::after { content: none; }
> #nd-sidebar a[href^='/weeks/']:has(+ *)::after { content: none; }
> ```
>
> 순수 CSS로 "body 속성값과 링크 href를 비교"하는 것은 불가능하다. **가장 단순한 해법을 쓴다:** `app/layout.config.tsx`의 `sidebar.components.Item`을 커스터마이징하는 대신, `JourneyMap`과 `CurrentWeekBanner`만으로 현재 회차를 알리고 **사이드바 배지는 만들지 않는다.** 사이드바 배지는 Fumadocs 내부 렌더링에 손대야 해서 비용 대비 효과가 낮다.
>
> **결정: 사이드바 배지를 범위에서 뺀다.** 위 CSS 스니펫은 작성하지 않는다. 현재 회차는 홈 배너와 여정 맵에서 확인한다. 스펙 §5와 §12-9의 "사이드바 배지" 항목은 이 결정으로 대체된다 — Task 14에서 스펙에 반영한다.

- [ ] **Step 7: 테스트 실행 — 통과 확인**

Run: `pnpm test tests/unit/journey-map.test.tsx`
Expected: 전부 PASS

- [ ] **Step 8: `currentWeek`를 바꿔가며 육안 확인**

`content/data/curriculum.ts`에서 `currentWeek = 4`로 바꾸고:

Run: `pnpm dev`
확인: 홈 상단에 파란 배너, 여정 맵 4번 칸에 `이번 주` 마커.

다시 `null`로 되돌린다. 배너와 마커가 모두 사라지고 레이아웃이 깨지지 않아야 한다.

- [ ] **Step 9: 커밋**

```bash
git add -A
git commit -m "feat: add JourneyMap and current week banner, replace 8-week table"
```

---

## Task 11: 시각화 ④ `<WhyStudy />` · ⑤ `<Roadmap />` (플레이스홀더)

**Files:**
- Create: `content/data/why.ts`, `content/data/roadmap.ts`, `components/visuals/why-study.tsx`, `components/visuals/roadmap.tsx`, `content/docs/start/why.mdx`, `content/docs/start/roadmap.mdx`
- Modify: `components/mdx.tsx`
- Test: `tests/unit/why-study.test.tsx`, `tests/unit/roadmap.test.tsx`

**Interfaces:**
- Consumes: 없음
- Produces:
  - `content/data/why.ts` → `export interface WhyColumn { label: string; body: string; links?: { text: string; href: string }[]; draft?: boolean }`, `export const why: [WhyColumn, WhyColumn, WhyColumn]`
  - `content/data/roadmap.ts` → `export interface Milestone { when: string; what: string; current?: boolean; draft?: boolean }`, `export const roadmap: Milestone[]`
  - `export function WhyStudy(): JSX.Element`, `export function Roadmap(): JSX.Element`

`draft: true`인 항목은 화면에 "작성 예정"으로 표시된다. 이 상태에서도 레이아웃이 깨지면 안 된다.

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/unit/why-study.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WhyStudy } from '@/components/visuals/why-study'
import { why } from '@/content/data/why'

describe('<WhyStudy />', () => {
  it('3칸을 그린다', () => {
    render(<WhyStudy />)
    expect(screen.getByText('겪은 문제')).toBeInTheDocument()
    expect(screen.getByText('그래서 내린 진단')).toBeInTheDocument()
    expect(screen.getByText('그래서 이렇게 설계했다')).toBeInTheDocument()
  })

  it('첫 칸은 채워져 있다', () => {
    expect(why[0].draft).toBeFalsy()
    expect(why[0].body.length).toBeGreaterThan(0)
  })

  it('세 칸 모두 내용이 채워져 있다 — why에는 draft가 없다', () => {
    why.forEach((c) => {
      expect(c.draft, `${c.label}이 draft 상태`).toBeFalsy()
      expect(c.body.length).toBeGreaterThan(0)
    })
  })

  it('draft 칸 수만큼만 작성 예정이 뜬다 (지금은 0개)', () => {
    render(<WhyStudy />)
    expect(screen.queryAllByText('작성 예정')).toHaveLength(why.filter((c) => c.draft).length)
  })

  it('진단과 설계 결정 내용이 화면에 나온다', () => {
    render(<WhyStudy />)
    expect(screen.getByText(/만들 줄 아는 게 오히려 함정/)).toBeInTheDocument()
    expect(screen.getByText(/시장 분석 → 프로덕트·서비스 기획/)).toBeInTheDocument()
  })

  it('빈 본문으로도 레이아웃이 깨지지 않는다 — 각 칸이 항상 렌더링된다', () => {
    render(<WhyStudy />)
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })
})
```

`tests/unit/roadmap.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Roadmap } from '@/components/visuals/roadmap'
import { roadmap } from '@/content/data/roadmap'

describe('<Roadmap />', () => {
  it('현재 시점 마일스톤이 정확히 하나다', () => {
    expect(roadmap.filter((m) => m.current)).toHaveLength(1)
  })

  it('첫 마일스톤은 8주 스터디이고 채워져 있다', () => {
    expect(roadmap[0].current).toBe(true)
    expect(roadmap[0].draft).toBeFalsy()
    expect(roadmap[0].what.length).toBeGreaterThan(0)
  })

  it('모든 마일스톤을 렌더링한다', () => {
    render(<Roadmap />)
    expect(screen.getAllByRole('listitem')).toHaveLength(roadmap.length)
  })

  it('미작성 마일스톤을 작성 예정으로 표시한다', () => {
    render(<Roadmap />)
    expect(screen.queryAllByText('작성 예정')).toHaveLength(roadmap.filter((m) => m.draft).length)
  })
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `pnpm test tests/unit/why-study.test.tsx tests/unit/roadmap.test.tsx`
Expected: FAIL

- [ ] **Step 3: `content/data/why.ts` 구현**

```ts
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
    body: '전략 기획이 아니라 시장 분석 → 프로덕트·서비스 기획에 집중한다. 매 회차 반드시 산출물을 만들고, 40분을 통째로 그걸 깨는 데 쓴다. 마지막 2주는 실제 사람에게 검증한다 — 부업이라면 틀린 걸 오래 만드는 비용이 가장 크기 때문이다.',
    links: [
      { text: '3단 구조 — 눈·손·머리', href: '/how/three-stages' },
      { text: '반박 40분', href: '/how/two-hours' },
      { text: '8회차 여정', href: '/' },
    ],
  },
]
```

- [ ] **Step 4: `content/data/roadmap.ts` 구현**

```ts
export interface Milestone {
  when: string
  what: string
  current?: boolean
  /** true면 화면에 "작성 예정"으로 표시된다 */
  draft?: boolean
}

/**
 * 나의 방향성 로드맵.
 *
 * ── 채우는 법 ──
 * 첫 항목(지금)만 채워져 있다. 나머지 draft 항목의 what을 쓰고 draft를 지운다.
 * when은 자유롭게 바꿔도 된다 (예: "2027 상반기"). 항목 수도 늘리거나 줄여도 된다.
 * 단, current: true 는 정확히 하나만 있어야 한다.
 */
export const roadmap: Milestone[] = [
  { when: '지금 — 8주 스터디', what: '기획 감각 만들기', current: true },
  { when: '+3개월', what: '', draft: true },
  { when: '+6개월', what: '', draft: true },
  { when: '+1년', what: '', draft: true },
  { when: '그 다음', what: '', draft: true },
]
```

- [ ] **Step 5: `components/visuals/why-study.tsx` 구현**

```tsx
import Link from 'next/link'
import { why } from '@/content/data/why'

function Draft() {
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--g600)',
        background: 'var(--g100)',
        borderRadius: 'var(--r-pill)',
        padding: '2px 8px',
      }}
    >
      작성 예정
    </span>
  )
}

export function WhyStudy() {
  return (
    <ul
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 10,
        margin: '20px 0',
        padding: 0,
        listStyle: 'none',
      }}
    >
      {why.map((c) => (
        <li
          key={c.label}
          style={{
            background: 'var(--g50)',
            borderRadius: 'var(--r-card)',
            padding: '16px 18px',
            minHeight: 140,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: 'var(--g600)',
              textTransform: 'uppercase',
            }}
          >
            {c.label}
          </div>
          <div style={{ marginTop: 8 }}>
            {c.draft ? <Draft /> : (
              <p style={{ fontSize: 14, color: 'var(--g700)', lineHeight: 1.7, margin: 0 }}>{c.body}</p>
            )}
          </div>
          {c.links && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {c.links.map((l) => (
                <Link key={l.href} href={l.href} style={{ fontSize: 13, color: 'var(--blue)' }}>
                  {l.text} →
                </Link>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 6: `components/visuals/roadmap.tsx` 구현**

세로 타임라인이다 (모바일에서도 그대로 동작하고, 항목 수가 늘어도 안 깨진다).

```tsx
import { roadmap } from '@/content/data/roadmap'

export function Roadmap() {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0' }}>
      {roadmap.map((m, i) => (
        <li key={m.when} style={{ display: 'flex', gap: 14 }}>
          <div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}
            aria-hidden
          >
            <span
              style={{
                width: 11,
                height: 11,
                borderRadius: '50%',
                marginTop: 6,
                background: m.current ? 'var(--blue)' : 'var(--g300)',
                boxShadow: m.current ? '0 0 0 4px var(--blue-bg)' : undefined,
              }}
            />
            {i < roadmap.length - 1 && (
              <span style={{ width: 2, flex: 1, minHeight: 34, background: 'var(--g200)' }} />
            )}
          </div>
          <div style={{ paddingBottom: 22 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: m.current ? 800 : 700,
                color: m.current ? 'var(--blue)' : 'var(--g600)',
              }}
            >
              {m.when}
            </div>
            <div style={{ marginTop: 4 }}>
              {m.draft ? (
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--g600)',
                    background: 'var(--g100)',
                    borderRadius: 'var(--r-pill)',
                    padding: '2px 8px',
                  }}
                >
                  작성 예정
                </span>
              ) : (
                <span style={{ fontSize: 15, color: 'var(--g800)' }}>{m.what}</span>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 7: 문서 2개 작성 + MDX 등록**

`components/mdx.tsx`에 `WhyStudy`, `Roadmap` 추가.

`content/docs/start/why.mdx`:

```mdx
---
title: 왜 이 스터디를 만들었나
description: 겪은 문제와, 그래서 이 스터디를 이렇게 설계한 이유
---

<WhyStudy />
```

`content/docs/start/roadmap.mdx`:

```mdx
---
title: 나의 방향성 로드맵
description: 이 8주가 더 큰 계획의 어느 지점인지
---

<Roadmap />
```

- [ ] **Step 8: 테스트 실행 — 통과 확인**

Run: `pnpm test tests/unit/why-study.test.tsx tests/unit/roadmap.test.tsx`
Expected: 전부 PASS

- [ ] **Step 9: 빌드 + 육안 확인**

Run: `pnpm build && pnpm dev`
`/start/why`, `/start/roadmap` 확인: 플레이스홀더 상태에서도 카드/타임라인이 정상으로 서 있고 "작성 예정"이 보인다.

- [ ] **Step 10: 커밋**

```bash
git add -A
git commit -m "feat: add WhyStudy and Roadmap visualizations with draft placeholders"
```

---

## Task 12: 아카이브 — `<ArchiveBoard />` + 기여 장치

**Files:**
- Create: `lib/archive.ts`, `components/archive/archive-board.tsx`, `components/archive/archive-filters.tsx`, `content/docs/archive/index.mdx`, `content/docs/archive/w02-example-reverse.mdx`, `.github/PULL_REQUEST_TEMPLATE.md`
- Modify: `components/mdx.tsx`, `content/docs/templates/interview.mdx`
- Test: `tests/unit/archive.test.ts`, `tests/unit/archive-board.test.tsx`

**Interfaces:**
- Consumes: Task 1 `source`, Task 3 `curriculum`, Task 4 `content/data/archive-types.ts`의 `ARCHIVE_TYPES`
- Produces:
  - `lib/archive.ts` → `export interface Submission { url: string; title: string; week: number; author: string; type: string; date: string }`, `export function groupByWeek(subs: Submission[]): { week: number; items: Submission[] }[]`, `export function groupByAuthor(subs: Submission[]): { author: string; items: Submission[] }[]`
  - `lib/archive-source.ts` → `export function collectSubmissions(): Submission[]`
  - `export function ArchiveBoard(): JSX.Element`

> ### ⚠️ 아래 코드보다 우선하는 두 가지 결정
>
> **1. `lib/archive.ts`를 둘로 나눈다.** 아래 Step 3 코드는 `lib/archive.ts` 안에서 `@/lib/source`를 최상위 import 하는데, 그러면 `groupByWeek`/`groupByAuthor` 단위 테스트가 Fumadocs 빌드 산출물(`.source/`)에 의존하게 된다. 순수 함수 테스트가 빌드 산출물을 요구해서는 안 된다.
>
> - `lib/archive.ts` — `Submission` 타입과 순수 함수 `groupByWeek`·`groupByAuthor` 만. **`@/lib/source`를 import 하지 않는다.** `curriculum` import는 괜찮다(순수 데이터)
> - `lib/archive-source.ts` — `collectSubmissions()` 만. 여기서 `@/lib/source`를 import 한다
> - `components/archive/archive-board.tsx`의 `ArchiveBoard()`는 `archive-source`에서 `collectSubmissions`를, `archive.ts`에서 타입과 그룹핑 함수를 가져온다
>
> **2. `ArchiveBoardView`와 `ArchiveFilters`의 역할을 미리 확정한다.** 아래 Step 4는 회차별 목록을 `ArchiveBoardView`에 넣고, Step 5의 주석이 그걸 다시 `ArchiveFilters`로 옮기라고 한다. 최종 구조를 두 번 읽지 말고 처음부터 이렇게 만든다:
>
> - `ArchiveBoardView(props)` — 제출물이 0개면 빈 상태를 렌더하고 끝낸다. 0개가 아니면 `<ArchiveFilters submissions={...} />` **하나만** 렌더한다
> - `ArchiveFilters` — 클라이언트 컴포넌트. 회차별(기본)과 작성자별 **두 뷰를 모두 소유**한다. Step 4의 `groupByWeek(...)` 렌더링 블록이 여기 `{!byAuthor && (...)}` 자리로 들어간다
>
> Step 5 끝의 인용 주석은 이 결정으로 대체된다 — 따로 읽지 않아도 된다.

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/unit/archive.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { groupByWeek, groupByAuthor, type Submission } from '@/lib/archive'

const s = (week: number, author: string, title: string): Submission => ({
  url: `/archive/${title}`, title, week, author, type: '역기획', date: '2026-09-15',
})

describe('groupByWeek', () => {
  it('1~8회차를 전부 반환한다 — 제출물이 없는 회차도', () => {
    const groups = groupByWeek([s(2, '홍길동', 'a')])
    expect(groups).toHaveLength(8)
    expect(groups[0].items).toEqual([])
    expect(groups[1].items).toHaveLength(1)
  })

  it('회차 오름차순으로 정렬한다', () => {
    const groups = groupByWeek([s(5, 'A', 'a'), s(2, 'B', 'b')])
    expect(groups.map((g) => g.week)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('제출물이 하나도 없으면 8개 빈 그룹을 준다', () => {
    expect(groupByWeek([])).toHaveLength(8)
    expect(groupByWeek([]).every((g) => g.items.length === 0)).toBe(true)
  })
})

describe('groupByAuthor', () => {
  it('작성자별로 묶는다', () => {
    const groups = groupByAuthor([s(1, '홍길동', 'a'), s(2, '홍길동', 'b'), s(1, '김철수', 'c')])
    expect(groups).toHaveLength(2)
    expect(groups.find((g) => g.author === '홍길동')!.items).toHaveLength(2)
  })

  it('작성자를 가나다순으로 정렬한다', () => {
    const groups = groupByAuthor([s(1, '홍길동', 'a'), s(1, '김철수', 'b')])
    expect(groups.map((g) => g.author)).toEqual(['김철수', '홍길동'])
  })

  it('제출물이 없으면 빈 배열이다', () => {
    expect(groupByAuthor([])).toEqual([])
  })
})
```

`tests/unit/archive-board.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ArchiveBoardView } from '@/components/archive/archive-board'

describe('<ArchiveBoardView />', () => {
  it('제출물이 0개면 빈 상태를 보여준다', () => {
    render(<ArchiveBoardView submissions={[]} />)
    expect(screen.getByText(/아직 제출물이 없어요/)).toBeInTheDocument()
  })

  it('빈 상태에서 올리는 법을 안내한다', () => {
    render(<ArchiveBoardView submissions={[]} />)
    expect(screen.getByRole('link', { name: /올리는 법/ })).toBeInTheDocument()
  })

  it('제출물을 회차별로 보여준다', () => {
    render(
      <ArchiveBoardView
        submissions={[
          { url: '/archive/a', title: '당근마켓 역기획', week: 2, author: '홍길동', type: '역기획', date: '2026-09-15' },
        ]}
      />,
    )
    expect(screen.getByRole('link', { name: /당근마켓 역기획/ })).toHaveAttribute('href', '/archive/a')
    expect(screen.getByText('홍길동')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `pnpm test tests/unit/archive.test.ts tests/unit/archive-board.test.tsx`
Expected: FAIL

- [ ] **Step 3: `lib/archive.ts` 구현**

```ts
import { source } from '@/lib/source'
import { curriculum } from '@/content/data/curriculum'

export interface Submission {
  url: string
  title: string
  week: number
  author: string
  type: string
  date: string
}

export function collectSubmissions(): Submission[] {
  return source
    .getPages()
    .filter((p) => p.url.startsWith('/archive/') && p.url !== '/archive')
    .filter((p) => p.data.week != null && p.data.author != null)
    .map((p) => ({
      url: p.url,
      title: p.data.title,
      week: p.data.week as number,
      author: p.data.author as string,
      type: p.data.type as string,
      date: p.data.date as string,
    }))
    .sort((a, b) => a.week - b.week || a.date.localeCompare(b.date))
}

export function groupByWeek(subs: Submission[]): { week: number; items: Submission[] }[] {
  return curriculum.map((w) => ({
    week: w.no,
    items: subs.filter((s) => s.week === w.no),
  }))
}

export function groupByAuthor(subs: Submission[]): { author: string; items: Submission[] }[] {
  const map = new Map<string, Submission[]>()
  for (const s of subs) {
    const list = map.get(s.author) ?? []
    list.push(s)
    map.set(s.author, list)
  }
  return Array.from(map.entries())
    .map(([author, items]) => ({ author, items }))
    .sort((a, b) => a.author.localeCompare(b.author, 'ko'))
}
```

- [ ] **Step 4: `components/archive/archive-board.tsx` 구현**

데이터 수집(서버)과 렌더링(순수)을 분리해 테스트 가능하게 한다.

```tsx
import Link from 'next/link'
import { collectSubmissions, groupByWeek, type Submission } from '@/lib/archive'
import { curriculum } from '@/content/data/curriculum'
import { ArchiveFilters } from './archive-filters'

export function ArchiveBoardView({ submissions }: { submissions: Submission[] }) {
  if (submissions.length === 0) {
    return (
      <div
        style={{
          background: 'var(--g50)',
          borderRadius: 'var(--r-card)',
          padding: '32px 24px',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--g900)', margin: 0 }}>
          아직 제출물이 없어요
        </p>
        <p style={{ fontSize: 14, color: 'var(--g600)', margin: '8px 0 16px' }}>
          첫 번째로 올려보세요.
        </p>
        <Link href="/templates/reverse-engineering" style={{ fontSize: 14, color: 'var(--blue)' }}>
          올리는 법 보기 →
        </Link>
      </div>
    )
  }

  return (
    <div>
      <ArchiveFilters submissions={submissions} />
      {groupByWeek(submissions).map((g) => {
        const w = curriculum.find((x) => x.no === g.week)!
        return (
          <section key={g.week} style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--g900)', margin: '0 0 8px' }}>
              <span className="tabular">{g.week}회차</span> · {w.title}
            </h3>
            {g.items.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--g600)', margin: 0 }}>아직 없어요</p>
            ) : (
              g.items.map((s) => (
                <Link
                  key={s.url}
                  href={s.url}
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'baseline',
                    background: 'var(--g50)',
                    borderRadius: 'var(--r-block)',
                    padding: '11px 14px',
                    marginBottom: 6,
                    textDecoration: 'none',
                  }}
                >
                  <span style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--g900)' }}>
                    {s.title}
                  </span>
                  <span style={{ fontSize: 12.5, color: 'var(--g600)' }}>{s.author}</span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--g700)',
                      background: 'var(--g100)',
                      borderRadius: 'var(--r-pill)',
                      padding: '2px 8px',
                    }}
                  >
                    {s.type}
                  </span>
                  <time className="tabular" style={{ fontSize: 12, color: 'var(--g600)', marginLeft: 'auto' }}>
                    {s.date}
                  </time>
                </Link>
              ))
            )}
          </section>
        )
      })}
    </div>
  )
}

export function ArchiveBoard() {
  return <ArchiveBoardView submissions={collectSubmissions()} />
}
```

- [ ] **Step 5: `components/archive/archive-filters.tsx` 구현**

작성자별·종류별 뷰 전환. 클라이언트 컴포넌트.

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { groupByAuthor, type Submission } from '@/lib/archive'

const chip = (on: boolean): React.CSSProperties => ({
  fontSize: 12.5,
  fontWeight: 700,
  padding: '6px 12px',
  borderRadius: 'var(--r-pill)',
  border: 'none',
  cursor: 'pointer',
  background: on ? 'var(--blue)' : 'var(--g100)',
  color: on ? '#fff' : 'var(--g700)',
})

export function ArchiveFilters({ submissions }: { submissions: Submission[] }) {
  const [byAuthor, setByAuthor] = useState(false)

  return (
    <div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button style={chip(!byAuthor)} onClick={() => setByAuthor(false)}>회차별</button>
        <button style={chip(byAuthor)} onClick={() => setByAuthor(true)}>작성자별</button>
      </div>

      {byAuthor && (
        <div style={{ marginTop: 16 }}>
          {groupByAuthor(submissions).map((g) => (
            <section key={g.author} style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--g900)', margin: '0 0 6px' }}>
                {g.author}
              </h3>
              {g.items.map((s) => (
                <Link
                  key={s.url}
                  href={s.url}
                  style={{
                    display: 'block',
                    fontSize: 14,
                    color: 'var(--g700)',
                    padding: '6px 0',
                    textDecoration: 'none',
                  }}
                >
                  <span className="tabular">{s.week}회차</span> · {s.title}
                </Link>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
```

> `byAuthor`가 true일 때 부모의 회차별 목록도 같이 보이는 문제가 있다. `ArchiveBoardView`에서 필터 상태를 알 수 없으므로, **회차별 목록 전체를 `ArchiveFilters` 안으로 옮긴다.** 즉 `ArchiveFilters`가 두 뷰를 모두 렌더링하고, `ArchiveBoardView`는 빈 상태 판정과 데이터 전달만 한다. Step 4의 `ArchiveBoardView`에서 `groupByWeek(...)` 렌더링 블록을 잘라 `ArchiveFilters`의 `{!byAuthor && (...)}` 자리로 옮기고, `ArchiveBoardView`는 `<ArchiveFilters submissions={submissions} />` 하나만 남긴다. 테스트의 "제출물을 회차별로 보여준다"는 그대로 통과해야 한다 (기본값이 회차별이므로).

- [ ] **Step 6: 아카이브 문서와 예시 제출물**

`content/docs/archive/index.mdx`:

```mdx
---
title: 팀원 산출물
description: 회차별로 각자 만들어 온 산출물이 여기 쌓여요
---

각 회차 숙제로 만든 산출물이 여기 모입니다. 올리는 법은 <Term>양식</Term> 페이지가 아니라 저장소 README에 있어요 — 파일 하나 추가하고 PR을 올리면 끝입니다.

<ArchiveBoard />
```

> `<Term>양식</Term>`은 glossary에 '양식' 항목이 없으면 빌드가 실패한다. 위 문장에서 `<Term>` 을 빼고 평문으로 쓰거나, glossary에 항목을 추가한다. **평문으로 쓴다.**

`content/docs/archive/w02-example-reverse.mdx` — `<ArchiveBoard />`가 실제로 동작하는지 보기 위한 예시 1건:

```mdx
---
title: 당근마켓 역기획 (예시)
week: 2
author: 예시
type: 역기획
date: 2026-09-15
---

이 문서는 아카이브가 어떻게 보이는지 확인하기 위한 예시입니다. 실제 제출물이 쌓이면 지워도 됩니다.

## 1. 이 서비스는 무엇인가

(양식대로 채웁니다)
```

- [ ] **Step 7: PR 템플릿과 개인정보 배너**

`.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## 무엇을 올리나요

<!-- 예: 5주차 유저 인터뷰 기록 -->

## 체크리스트

- [ ] `content/docs/archive/` 아래에 `wNN-이름-종류.mdx` 형식으로 파일을 추가했습니다
- [ ] frontmatter에 `title` `week` `author` `type` `date`를 모두 적었습니다
- [ ] **인터뷰 기록인 경우** — 실명·회사명·연락처를 제거하고 `A씨(30대 직장인)` 형태로 바꿨습니다
- [ ] 녹취 원문과 스크린샷을 넣지 않았습니다

## 확인하는 법

PR을 올리면 아래에 Vercel Preview 링크가 자동으로 생깁니다.
머지 전에 그 링크로 들어가 **내 글이 사이트에서 어떻게 보이는지** 확인해주세요.
```

`content/docs/templates/interview.mdx` 최상단(frontmatter 바로 뒤)에 고정 배너:

```mdx
<Callout type="warn">
**이 사이트는 인터넷에 공개됩니다.** 인터뷰 기록을 올릴 때는 반드시 가명 처리를 해주세요.

- 인터뷰이는 `A씨(30대 직장인)` 형태로만 적습니다
- 실명 · 회사명 · 연락처 · 녹취 원문 · 스크린샷은 올리지 않습니다
</Callout>
```

- [ ] **Step 8: MDX 등록 및 테스트 통과 확인**

`components/mdx.tsx`에 `ArchiveBoard` 추가.

Run: `pnpm test tests/unit/archive.test.ts tests/unit/archive-board.test.tsx`
Expected: 전부 PASS

- [ ] **Step 9: 검증 스크립트가 아카이브 frontmatter를 잡는지 확인**

```bash
sed -i 's/^week: 2$/week: 99/' content/docs/archive/w02-example-reverse.mdx
pnpm validate
```

Expected: 종료 코드 1, `'week'는 1~8 정수여야 합니다` 출력

되돌리고 재확인:

```bash
git checkout content/docs/archive/w02-example-reverse.mdx
pnpm build
```

Expected: 성공. `/archive`에서 2회차 아래 예시 1건이 보이고, 나머지 7개 회차는 "아직 없어요".

- [ ] **Step 10: 커밋**

```bash
git add -A
git commit -m "feat: add archive board with auto-aggregation, PR template, and privacy banner"
```

---

## Task 13: 반응형 · 접근성 E2E

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/responsive.spec.ts`, `tests/e2e/a11y.spec.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: Task 1~12의 모든 페이지
- Produces: `pnpm test:e2e` 가 반응형·접근성 회귀를 잡는다

- [ ] **Step 1: Playwright 설치**

```bash
pnpm add -D @playwright/test @axe-core/playwright
pnpm exec playwright install chromium
```

`playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:3000' },
  webServer: {
    command: 'pnpm build && pnpm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Desktop Chrome'], viewport: { width: 360, height: 740 } } },
  ],
})
```

`package.json`에 추가:

```json
{
  "scripts": {
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 2: 실패하는 반응형 테스트 작성**

`tests/e2e/responsive.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

const PAGES = [
  '/',
  '/start/why',
  '/start/roadmap',
  '/start/glossary',
  '/how/three-stages',
  '/how/two-hours',
  '/how/ai-playbook',
  '/weeks/04-prd',
  '/templates/interview',
  '/archive',
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
```

- [ ] **Step 3: 실패하는 접근성 테스트 작성**

`tests/e2e/a11y.spec.ts`:

```ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const PAGES = ['/', '/start/glossary', '/how/two-hours', '/weeks/04-prd', '/archive']

for (const path of PAGES) {
  test(`${path} — 대비와 기본 접근성 위반이 없다`, async ({ page }) => {
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
```

- [ ] **Step 4: 테스트 실행 — 실패 확인**

Run: `pnpm test:e2e`
Expected: 일부 FAIL. 특히 다음이 예상된다.
- 대비 위반: `--g500`을 텍스트에 쓴 곳이 남아 있으면 잡힌다
- 가로 스크롤: 마이그레이션한 표가 감싸이지 않았으면 잡힌다

- [ ] **Step 4b: 이미 확인된 실재 결함 — 360~390px 오른쪽 여백 없음**

Task 2 진행 중에 컨트롤러와 구현자가 **독립적으로 재현한 실재 결함**이 하나 있다. 이 태스크가 그것을 소유한다.

증상: 390px 폭에서 본문 텍스트가 뷰포트 오른쪽 끝(x=389/390)까지 닿는다. 왼쪽 여백은 17px인데 오른쪽 여백이 사실상 0이다. 헤더 우측 컨트롤(`Open Sidebar` / `Open Search` / `Toggle Theme`)이 화면에 나타나지 않는다 — 서빙된 HTML에는 세 버튼이 모두 존재하므로 마크업 누락이 아니라 레이아웃 문제다.

이미 배제된 원인:

- **헤드리스 캡처 아티팩트가 아니다.** `--headless=old`와 `--headless=new` 양쪽에서 픽셀 단위로 동일하게 재현됐다
- **Task 2의 CSS 탓이 아니다.** `app/global.css`를 원래의 3줄(`@import` 만 남긴 상태)로 되돌리고 다시 촬영해도 동일하게 재현됐다. 커스텀 CSS가 0인 상태에서 나오는 결함이다

즉 Fumadocs 기본 레이아웃 또는 Task 1의 루트 라우팅 구성에서 오는 것이다. Playwright는 실제 모바일 에뮬레이션과 JS 측정을 제공하므로, 이 태스크가 원인을 특정하고 고칠 수 있는 첫 지점이다.

Step 2의 `responsive.spec.ts`가 이미 이걸 잡는다 — `가로 스크롤이 생기지 않는다` 테스트가 실패해야 정상이다. 실패하지 않으면 그것 자체가 의심스럽다: Playwright의 실제 뷰포트 에뮬레이션에서는 증상이 다르게 나타난다는 뜻이므로, 어떻게 다른지 확인하고 리포트에 적는다.

원인을 특정할 때 확인할 것: 본문 컨테이너의 `padding-inline`이 모바일 브레이크포인트에서 사라지는지, `#nd-subnav`가 뷰포트를 넘는 폭을 갖는지, 어떤 자식 요소가 컨테이너보다 넓은지 (`document.querySelectorAll('*')`를 순회하며 `scrollWidth > document.documentElement.clientWidth`인 요소를 찾는 방법이 빠르다).

- [ ] **Step 5: 잡힌 문제를 고친다**

**표 가로 스크롤** — `app/global.css`에 추가:

```css
.prose table, #nd-page table {
  display: block;
  max-width: 100%;
  overflow-x: auto;
}
```

> Fumadocs가 본문에 붙이는 실제 컨테이너 선택자를 개발자 도구로 확인해 맞춘다.

**대비 위반** — axe가 지적한 요소를 찾아 `--g500` → `--g600` 이상으로 올린다. `components/` 전체를 훑는다:

```bash
grep -rn "var(--g500)" components/ app/
```

텍스트 색으로 쓰인 곳이 있으면 전부 고친다. 밑줄·아이콘·보더로 쓰인 것은 그대로 둔다 (`components/ui/term.tsx`의 `borderBottom`은 유지).

- [ ] **Step 6: 테스트 실행 — 통과 확인**

Run: `pnpm test:e2e`
Expected: desktop / mobile 양쪽 프로젝트 전부 PASS

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "test: add responsive and accessibility E2E coverage"
```

---

## Task 14: 중복 원본 정리 · README 축소 · 배포 준비 · push

**Files:**
- Delete: `weeks/`, `notion/01~08.md`, `notion/09-ai-playbook.md`
- Create: `docs/DEPLOY.md`
- Modify: `README.md`, `docs/superpowers/specs/2026-08-27-study-dashboard-design.md`
- Keep: `notion/00-proposal.md`

**Interfaces:**
- Consumes: Task 1~13 전부
- Produces: GitHub에 push된 `main` + `docs/DEPLOY.md` (Vercel 연결과 study.calix.kr DNS 설정은 저장소 소유자가 수행)

- [ ] **Step 1: 마이그레이션 누락 확인**

지우기 전에 원본과 대조한다.

```bash
wc -l weeks/*.md notion/09-ai-playbook.md
wc -l content/docs/weeks/*.mdx content/docs/how/ai-playbook.mdx
```

각 회차 문서의 줄 수가 원본과 크게 차이나면(±20줄 이상) 누락된 섹션이 있는 것이다. 해당 파일의 헤딩을 비교한다.

```bash
for f in weeks/*.md; do
  b=$(basename "$f" .md)
  echo "=== $b ==="
  diff <(grep '^#\{2,4\} ' "$f") <(grep '^#\{2,4\} ' "content/docs/weeks/$b.mdx")
done
```

차이가 나는 헤딩을 확인하고, 의도적으로 뺀 것(H1, 이전/다음 링크)이 아니면 채운다.

- [ ] **Step 2: 중복 원본 삭제**

```bash
git rm -r weeks
git rm notion/01-kickoff.md notion/02-reverse-planning-1.md notion/03-reverse-planning-2.md \
       notion/04-prd.md notion/05-user-interview.md notion/06-metrics-priority.md \
       notion/07-my-idea.md notion/08-validation-retro.md notion/09-ai-playbook.md
```

`notion/00-proposal.md`는 남긴다 (외부 모집 플랫폼 제출용).

- [ ] **Step 3: README를 저장소 안내문으로 축소**

`README.md` 전체를 다음으로 교체한다.

```markdown
# AI 기획자가 되어보자 — 스터디 사이트

8회차 기획 스터디의 자료 사이트 소스입니다.
스터디 내용은 전부 사이트에 있습니다 → **https://study.calix.kr**

## 왜 하는가

혼자 사업을 하거나 부업으로 뭔가를 시작하려는 개발자를 위한 스터디입니다.

1인 사업에 필요한 능력은 **기획 · 개발 · 마케팅** 셋으로 갈립니다.
회사에서는 세 사람이 나눠 갖지만, 혼자 할 때는 한 사람이 다 갖거나
최소한 뭐가 부족한지는 알아야 합니다.

여기 오시는 분들은 개발은 이미 하십니다. 그런데 **만들 줄 아는 게 오히려 함정이 됩니다** —
만들 수 있으니까 만들고, 아무도 안 씁니다.
기획은 감이 아니라 배울 수 있는 기법이고, 이 스터디는 그 기법을 8주 동안 실제로 써봅니다.

마케팅은 다루지 않습니다. 팔 물건이 정해진 다음의 문제라 순서가 뒤입니다.
전략 기획도 다루지 않습니다. **시장 분석 → 프로덕트 기획 → 서비스 기획**이 중심입니다.

목표는 하나입니다 — 1인 사업이든 부업이든, 실제로 뭔가를 이루는 것.

## 이 저장소는 무엇인가

- `content/docs/` — 사이트에 보이는 모든 문서. **여기가 유일한 원본입니다**
- `content/data/` — 8회차 커리큘럼, 용어 사전, 로드맵 데이터
- `components/` — 시각화·UI 컴포넌트
- `notion/00-proposal.md` — 외부 모집 플랫폼 제출용 (사이트에는 없음)

## 로컬에서 실행하기

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # 타입 검사 + 콘텐츠 검증 + 빌드
pnpm test       # 단위 테스트
pnpm test:e2e   # 반응형 · 접근성 테스트
```

## 산출물 올리는 법

1. 브랜치를 만듭니다
2. `content/docs/archive/` 아래에 파일을 추가합니다 — 파일명은 `wNN-이름-종류.mdx`

   ```yaml
   ---
   title: 당근마켓 역기획
   week: 2                # 1~8
   author: 홍길동
   type: 역기획            # 역기획 | PRD | 인터뷰 | 지표트리 | 원페이저 | 검증결과
   date: 2026-09-15
   ---
   ```

3. PR을 올립니다
4. **PR에 자동으로 붙는 Vercel Preview 링크**로 들어가 내 글이 어떻게 보이는지 확인합니다
5. 머지하면 사이트에 자동 반영됩니다

목록은 따로 관리하지 않습니다. 파일만 추가하면 아카이브에 자동으로 나타납니다.

> ⚠️ **인터뷰 기록을 올릴 때** — 이 사이트는 인터넷에 공개됩니다.
> 실명·회사명·연락처를 지우고 `A씨(30대 직장인)` 형태로 바꿔주세요.

## 이번 주 회차 바꾸기

`content/data/curriculum.ts`의 `currentWeek` 값을 고칩니다. 홈 배너와 여정 맵 마커가 따라 움직입니다.
```

- [ ] **Step 4: 스펙에 Task 10의 결정을 반영한다**

`docs/superpowers/specs/2026-08-27-study-dashboard-design.md`에서 "사이드바의 `이번 주` 배지"를 언급한 두 곳(§5 본문, §12-9)을 수정한다. Fumadocs 내부 렌더링에 손대야 해서 비용 대비 효과가 낮아 범위에서 뺐고, 현재 회차는 홈 배너와 여정 맵이 알린다.

- §5: `**사이드바의 이번 주 배지, 홈 상단 배너, 여정 맵의 현재 위치 마커**를 만든다` → `**홈 상단 배너와 여정 맵의 현재 위치 마커**를 만든다`
- §12-9: `사이드바 배지 · 홈 배너 · 여정 맵 마커가 한 번에 따라 움직인다` → `홈 배너와 여정 맵 마커가 한 번에 따라 움직인다`

- [ ] **Step 5: 전체 검증**

```bash
pnpm build && pnpm test && pnpm test:e2e
```

Expected: 전부 통과. `pnpm validate`가 깨진 링크를 잡으면 — README 삭제로 사라진 경로를 참조하는 문서가 있는 것이므로 고친다.

- [ ] **Step 6: 커밋**

```bash
git add -A
git commit -m "chore: remove duplicated sources, shrink README to repo guide, sync spec"
```


- [ ] **Step 7: 배포·도메인 안내 문서 작성**

Vercel 연결과 DNS 설정은 **저장소 소유자가 직접** 한다 (계정 접근이 필요하므로). 대신 그대로 따라 할 수 있는 문서를 남긴다.

`docs/DEPLOY.md`:

```markdown
# 배포 · 도메인 연결

사이트 주소: **https://study.calix.kr**

## 1. Vercel 프로젝트 연결 (최초 1회)

1. https://vercel.com/new 에서 이 저장소를 **Import**
2. Framework Preset이 **Next.js**로 자동 인식되는지 확인
3. Build Command / Output Directory / Install Command 전부 **기본값 그대로** 둔다
   - `pnpm build`가 `prebuild`(타입 검사 + 콘텐츠 검증)를 자동으로 먼저 실행한다
4. **Deploy**

배포가 끝나면 `<프로젝트명>.vercel.app` 주소가 나온다. 도메인을 붙이기 전에 이 주소로 먼저 확인한다.

## 2. study.calix.kr 연결

### 2-1. Vercel에 도메인 등록

1. 프로젝트 → **Settings → Domains**
2. `study.calix.kr` 입력 후 **Add**
3. Vercel이 **CNAME 값**을 보여준다 (보통 `cname.vercel-dns.com`)
   - ⚠️ **화면에 표시된 값을 그대로 쓴다.** Vercel이 값을 바꾸는 경우가 있으므로
     이 문서에 적힌 값이 아니라 대시보드 값이 기준이다

### 2-2. 메가존클라우드 DNS에 CNAME 추가

도메인 관리 콘솔에서 `calix.kr`의 DNS 레코드에 추가한다.

| 항목 | 값 |
|---|---|
| 타입 | `CNAME` |
| 호스트 / 이름 | `study` (또는 `study.calix.kr` — 콘솔 형식에 따라 다름) |
| 값 / 대상 | Vercel이 알려준 값 (예: `cname.vercel-dns.com`) |
| TTL | 기본값 (300~3600) |

> **왜 apex(`calix.kr`)가 아니라 서브도메인인가**
> DNS 표준상 apex 도메인에는 CNAME과 다른 레코드(NS, SOA 등)가 공존할 수 없다.
> apex에 붙이려면 A 레코드(`76.76.21.21`)를 써야 한다.
> `study.calix.kr`은 서브도메인이라 CNAME이 정석이고, Vercel이 IP를 바꿔도 따라간다.

### 2-3. 확인

DNS 전파에 보통 몇 분~최대 몇 시간 걸린다.

```bash
nslookup study.calix.kr
# 또는
dig study.calix.kr CNAME +short
```

Vercel Settings → Domains에서 `study.calix.kr` 옆이 **Valid Configuration**이 되고,
HTTPS 인증서가 자동 발급되면 끝이다.

## 3. 이후 배포

손댈 것이 없다.

- `main`에 push → 프로덕션(`study.calix.kr`) 자동 갱신
- PR 생성 → Preview URL 자동 생성 (머지 전 확인용)
- 빌드가 실패하면 배포되지 않는다 — 잘못된 frontmatter가 프로덕션에 올라갈 수 없다

## 4. 팀원에게 저장소 열어주기

GitHub 저장소 → **Settings → Collaborators** → 팀원 계정 추가.
팀원이 할 일은 저장소 `README.md`의 "산출물 올리는 법"에 있다.

## 5. 배포 후 확인 체크리스트

- [ ] `study.calix.kr` 접속 시 사이드바 5그룹이 순서대로 보인다
      (`시작하기` / `진행 방식` / `회차` / `양식 · 예시` / `아카이브`)
- [ ] `/weeks/04-prd` — 3열 레이아웃, 회차 배지, 파란 숙제 카드
- [ ] 폰 또는 개발자 도구 360px — 가로 스크롤 없음, 사이드바가 드로어로 접힘
- [ ] `/archive` — 예시 제출물 1건, 나머지 회차는 "아직 없어요"
- [ ] `/start/why`, `/start/roadmap` — "작성 예정" 상태로 레이아웃이 멀쩡함
- [ ] 검색창에 `역기획` / `기획` / `PRD` 를 각각 넣어본다
      → `기획`으로 `역기획` 문서가 안 잡히면 한국어 검색 이슈다 (설계 문서 §10).
        이슈로 남기고 Pagefind 교체를 별도 작업으로 잡는다
- [ ] 아카이브 PR을 한 번 시험해본다 (아래)

## 6. 아카이브 PR 흐름 시험

```bash
git switch -c test/archive-flow
cat > content/docs/archive/w01-test-warmup.mdx <<'EOF'
---
title: 워밍업 — 내가 매일 쓰는 앱
week: 1
author: 테스트
type: 역기획
date: 2026-09-08
---

PR 흐름 확인용 문서입니다.
EOF
git add -A && git commit -m "test: verify archive PR flow"
git push -u origin test/archive-flow
```

확인할 것:

1. PR에 Vercel Preview 링크가 자동으로 붙는다
2. Preview의 `/archive`에 1회차 아래 새 문서가 보인다
3. `week: 99`로 고쳐 push하면 **Vercel 빌드가 실패한다** (검증 게이트 동작 확인)

확인이 끝나면 PR과 브랜치를 닫는다.
```

`README.md` 하단에 `배포와 도메인 설정은 [docs/DEPLOY.md](docs/DEPLOY.md)를 보세요.` 한 줄을 추가한다.

- [ ] **Step 8: 전체 검증**

```bash
pnpm build && pnpm test && pnpm test:e2e
```

Expected: 전부 통과. `pnpm validate`가 깨진 링크를 잡으면 — README 축소로 사라진 경로를 참조하는 문서가 있는 것이므로 고친다.

- [ ] **Step 9: 커밋**

```bash
git add -A
git commit -m "chore: remove duplicated sources, shrink README, add deploy guide"
```

- [ ] **Step 10: GitHub 저장소 생성 및 push**

저장소 소유자가 이 단계를 명시적으로 허가했다.

```bash
gh repo create slipp-study --public --source=. --remote=origin --push
```

`gh`가 없거나 인증되어 있지 않으면 — GitHub에서 빈 저장소를 만든 뒤:

```bash
git remote add origin https://github.com/<사용자>/slipp-study.git
git push -u origin main
```

push 후 확인:

```bash
git remote -v
git log --oneline -1
gh repo view --web   # 또는 브라우저에서 저장소 확인
```

**Vercel 연결과 DNS 설정은 여기서 하지 않는다.** `docs/DEPLOY.md`를 저장소 소유자에게 넘기고 종료한다.

## 자체 검토

**1. 스펙 커버리지**

| 스펙 절 | 담당 태스크 |
|---|---|
| §3.1 스택 | 1, 2 |
| §3.2 배포 흐름 | 14 |
| §3.3 저장소 초기화 | 1, 14 |
| §4 정보 구조 | 4, 6 |
| §4.1 매핑 | 4, 6 |
| §4.2 중복 원본 정리 | 14 |
| §5 커리큘럼 단일 원천 | 3, 10 |
| §6.1 원칙 | 2 (전역), 8~12 (각 컴포넌트) |
| §6.2 색 | 2, 3 (`lib/stage.ts`) |
| §6.3 타이포 | 2 |
| §6.4 표면·간격 | 2 |
| §6.5 반응형 | 9, 10, 11, 13 |
| §6.6 카피 톤 | 6, 8, 12 |
| §6.7 접근성 | 3 (이모지+라벨), 13 (axe) |
| §7.1 시각화 5종 | 9, 10, 11 |
| §7.2 UI 컴포넌트 | 7, 8 |
| §7.3 ④⑤ 플레이스홀더 | 11 |
| §8.1 파일 규약 | 12, 14 (README) |
| §8.2 자동 집계 | 12 |
| §8.3 개인정보 | 12 |
| §8.4 기여 흐름 | 12, 14 |
| §9 검증 | 5, 13 |
| §10 검색 리스크 | 14 Step 9 |
| §12 완료 기준 | 14 Step 9~10 |

**커버리지 예외 1건:** §5와 §12-9의 "사이드바 `이번 주` 배지"는 Task 10 Step 6에서 범위에서 뺐다. Fumadocs 사이드바 항목 렌더링을 교체해야 하는데 비용 대비 효과가 낮다. 현재 회차는 홈 배너와 여정 맵이 알린다. Task 14 Step 4가 스펙을 이 결정에 맞춰 고친다.

**2. 플레이스홀더 스캔**

- Task 2 Step 3의 `#3C5membered` 는 **의도적 실패 유발 장치**다. Step 4의 테스트가 이걸 잡고 Step 6에서 실제 값으로 교체한다. TDD 사이클의 일부이므로 플레이스홀더 결함이 아니다.
- `content/data/why.ts`, `roadmap.ts`의 빈 `body`/`what`은 **스펙 §7.3이 명시한 산출물**이다. `draft: true`로 표시되고 화면에 "작성 예정"으로 나타나며, 테스트가 이 동작을 검증한다.
- 그 외 "TBD" / "적절히 처리" / "테스트 작성" 같은 서술 없음.

**3. 타입 일관성**

- `Stage` 는 `content/data/curriculum.ts`에서 정의하고 `lib/stage.ts`가 import한다. 반대 방향 의존 없음.
- `stageOf(weekNo: number): StageMeta` — Task 3에서 정의, Task 8·10에서 같은 시그니처로 사용.
- `Submission` 필드(`url` `title` `week` `author` `type` `date`) — Task 12의 `lib/archive.ts`에서 정의, 같은 태스크의 컴포넌트와 테스트가 동일하게 사용.
- `ARCHIVE_TYPES` — `source.config.ts`(Task 4)와 `lib/validators.ts`(Task 5)에 값이 **중복 정의**되어 있다. `validators.ts`는 `scripts/`에서 tsx로 실행되고 `source.config.ts`는 fumadocs-mdx 빌드 파이프라인이 로드하므로, 순환 참조를 피하려면 분리가 안전하다. 대신 Task 5 완료 후 두 목록이 같은지 확인하는 테스트를 `tests/unit/validators.test.ts`에 추가한다:

  ```ts
  import { ARCHIVE_TYPES } from '@/source.config'
  it('source.config.ts와 validators.ts의 타입 목록이 같다', () => {
    expect([...ARCHIVE_TYPES]).toEqual(['역기획', 'PRD', '인터뷰', '지표트리', '원페이저', '검증결과'])
  })
  ```

- `Week` 인터페이스의 `deliverable`은 Task 8의 `<Homework />`, Task 10의 `<JourneyMap />`이 동일하게 사용.
- `WhyColumn.draft` / `Milestone.draft` — 두 타입 모두 같은 의미(`true`면 "작성 예정" 표시)로 일관.
