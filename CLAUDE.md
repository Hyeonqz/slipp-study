@AGENTS.md

# 이 저장소에서 일하는 법

**AI 기획자가 되어보자** 8주 스터디의 자료 사이트입니다. 배포는 https://study.calix.kr

두 대의 PC(Windows, macOS)에서 번갈아 작업합니다. 대화 기록은 PC 사이에 따라가지 않으므로, **맥락은 전부 이 파일과 `docs/superpowers/` 두 문서에 있습니다.**

- 설계 근거: `docs/superpowers/specs/2026-08-27-study-dashboard-design.md`
- 무엇을 어떤 순서로 만들었나: `docs/superpowers/plans/2026-08-27-study-dashboard.md`
- 배포·도메인 절차: `docs/DEPLOY.md`

---

## 무엇을 하는 곳인가

스터디 진행자가 문서를 쓰고, 팀원이 산출물을 PR로 올리는 **정적 사이트**입니다.

- **백엔드 없음.** DB도 API도 인증도 없습니다. 전부 빌드 타임에 정적 생성됩니다
- **환경변수 없음.** `.env` 파일이 존재하지 않습니다. 필요하다고 판단되면 그건 설계가 틀어진 것입니다
- **사이트가 원본입니다.** `content/docs/`가 유일한 원본이고 README는 저장소 안내서일 뿐입니다

## 기술 스택

| | |
|---|---|
| Next.js | 16.3.x App Router, 정적 생성 |
| Fumadocs | `fumadocs-ui` / `fumadocs-core` 16.15.x, `fumadocs-mdx` 15.3.x |
| 문서 | MDX + React 컴포넌트, 루트 라우팅(`baseUrl: '/'`) |
| 테스트 | Vitest(단위) + Playwright(반응형 · 접근성) |
| 패키지 | pnpm 11.24.0 (`packageManager` 고정), Node 22.x (`.nvmrc`) |

<!-- 학습 데이터의 Fumadocs / Next.js 지식이 이 버전과 다릅니다. -->
**API를 기억으로 쓰지 마세요.** `createMDXSource`, `fumadocs-ui/provider`, `fumadocs-mdx/runtime/next` 는 이 버전에 **없습니다.** 확실하지 않으면 `node_modules/fumadocs-ui/dist/` 와 `node_modules/next/dist/docs/` 를 직접 읽고 확인한 뒤 쓰세요. 실제로 이 저장소를 만드는 동안 가장 많이 깨진 지점입니다.

---

## 명령

```bash
pnpm dev        # http://localhost:3000
pnpm build      # prebuild(생성 → 타입 → 검증) 후 빌드. 배포와 동일한 게이트
pnpm validate   # 콘텐츠 검증만
pnpm test       # 단위 테스트
pnpm test:e2e   # 반응형 · 접근성 (브라우저 필요: pnpm exec playwright install)
```

`prebuild` 는 `fumadocs-mdx && tsc --noEmit && pnpm validate` 입니다. **이 체인을 바꾸지 마세요.**
`fumadocs-mdx` 단계가 빠지면 `.source/` 가 없는 새 클론에서 타입 검사가 실패합니다.

<!-- 아래는 실제로 겪은 사고입니다. 반복하지 마세요. -->
**렌더 확인은 `pnpm build && pnpm start` 로 하세요.** 오래 띄워둔 `pnpm dev` 는 증분 상태가 썩어서
`Error: It must not start with './' or '../'` 같은 유령 500을 냅니다. 이건 코드 결함이 아닙니다.

**모바일 폭 측정은 Playwright 로 하세요.** `chrome --headless=old` 는 meta viewport 에뮬레이션이 없어
넓게 레이아웃한 뒤 창 너비로 잘라냅니다. 이걸 실제 결함으로 오인해 11개 태스크를 끌고 간 적이 있습니다.

---

## 단일 원천 — 여기만 고치면 사이트가 따라옵니다

| 파일 | 무엇의 원천인가 |
|---|---|
| `content/data/curriculum.ts` | 8회차 전부. 제목·목표·산출물·단계·현재 회차 |
| `content/data/roadmap.ts` | 방향성 로드맵 마일스톤 |
| `content/data/why.ts` | "왜 이 스터디를 만들었나" 3칸 |
| `content/data/glossary.ts` | 용어 사전 = `<Term>` 이 인식하는 용어 목록 |
| `lib/stage.ts` | 단계(눈/손/머리)의 이모지·라벨·색 변수 이름 |
| `app/global.css` | 디자인 토큰 전부 |

`curriculum.ts` 의 `currentWeek` 는 **진행자가 매주 손으로 고치는 값**입니다. 날짜 기반 자동 계산을
넣지 마세요 — 일정은 밀리는 게 정상이고, 자동화하면 틀린 값이 화면에 뜹니다.

### 회차 라벨

`curriculum[].title` 은 짧은 이름(`킥오프`)입니다. 사이드바와 문서 H1 에 쓰는 `1회차 — 킥오프` 형태는
`weekLabel(w)` 이 만듭니다. 회차 문서의 frontmatter `title` 은 이 값과 **글자 그대로 같아야** 하고,
`tests/unit/sidebar.test.ts` 가 실제 페이지 트리에서 이를 검사합니다.

---

## 색 규칙 — 접근성 때문에 나눈 것이니 합치지 마세요

파랑이 세 토큰으로 갈라져 있습니다. 토스 블루 `#3182F6` 은 흰 배경에서 3.71:1 이라 **본문 텍스트로 쓰면
WCAG AA(4.5:1)에 미달**합니다. 그래서 용도별로 나눴습니다.

| 토큰 | 용도 |
|---|---|
| `--blue` | 텍스트가 **없는** 순수 그래픽 전용 (포커스 링, 진행률 바) |
| `--blue-text` | 파랑 텍스트, 그리고 그 텍스트에 바짝 붙은 장식(점·마커) |
| `--blue-fill` | **흰 글자를 얹는** 파랑 채움 (활성 칩, 배지) |
| `--blue-bg` | 옅은 파랑 배경 |

- `color: var(--blue)` 는 금지입니다. `tests/unit/color-usage.test.ts` 가 잡습니다
- `--g500` 은 텍스트로 쓰지 않습니다. 보조 텍스트 하한은 `--g600`
- 단계 틴트(`--stage-*`)는 여정 맵 바와 단계 칩에서만 씁니다
- 다크 모드에서 `--blue-text` 와 `--blue-fill` 은 **서로 반대 방향**입니다(텍스트는 밝게, 채움은 어둡게).
  하나로 합치면 흰 글자 대비가 3.07:1 로 떨어집니다 — 실제로 한 번 그렇게 깨졌습니다

## 레이아웃 — 전체 폭 대시보드

`app/global.css` 의 세 규칙이 한 세트입니다. 하나만 빠져도 좁은 문서 사이트로 조용히 돌아갑니다.

```
#nd-docs-layout { --fd-layout-width: 100%; }   /* 사이드바를 화면 왼쪽 끝에 */
#nd-page        { max-width: none; margin-inline: 0; }
#nd-page .prose > *          { max-width: 720px; }   /* 글줄은 붙잡고 */
#nd-page .prose > .fullbleed { max-width: none;  }   /* 자료는 풀어준다 */
```

- `100vw` 를 쓰지 마세요 — 세로 스크롤바 폭만큼 오른쪽이 조용히 잘립니다
- 넓게 써야 하는 컴포넌트는 루트 요소에 `className="fullbleed"` 를 답니다
- `tests/unit/tokens.test.ts` 가 네 규칙을 전부 잠급니다

---

## 콘텐츠 규칙

**UI 문구는 `~해요` 체, 문서 본문은 원문 그대로.** 버튼·aria 라벨은 간결한 명사형, 입력창
플레이스홀더는 질문형(`무엇이 궁금하세요?`). 크롬 문자열 번역은 `app/layout.config.tsx` 에 모여 있습니다.

**볼드 안에 따옴표를 넣지 마세요.** `**"X"**를` 는 CommonMark 에서 별표가 글자로 렌더됩니다.
`"**X**"를` 로 쓰세요. 회차 문서 최상단 인용문에서 15건 터진 적이 있습니다.

**용어 사전에 있는 단어는 본문 첫 등장에 `<Term>` 을 감쌉니다.** 문서당 한 번, 본문 문단만
(헤딩·표 셀·코드블록 제외). 이건 `pnpm validate` 가 아니라 **`pnpm test`** 가 검사합니다
(`tests/unit/term-coverage.test.ts`) — 즉 빌드는 통과하니 커밋 전에 테스트를 돌려야 잡힙니다.
**아카이브 제출물(`content/docs/archive/`)은 검사 대상이 아닙니다** — 팀원에게 요구하는 건
frontmatter 5필드와 익명화뿐입니다.

**아카이브는 전체 공개입니다.** 인터뷰 기록은 반드시 익명화합니다 —
`content/docs/templates/interview.mdx` 상단 배너와 PR 템플릿 체크박스가 그 장치입니다.

**아카이브 frontmatter 의 `date` 는 따옴표로 감쌉니다.** 맨 값으로 두면 YAML 이 `Date` 객체로
파싱해서 검증에 걸립니다.

---

## 작업 방식

**빌드 게이트가 진짜 게이트입니다.** 잘못된 frontmatter 와 깨진 내부 링크는 `pnpm build` 에서
실패하고 **Vercel 배포가 안 됩니다.** 다만 용어 커버리지와 컴포넌트 삽입 여부는 빌드가 아니라
테스트가 봅니다 — 그래서 커밋 전에 **`pnpm build` 와 `pnpm test` 를 둘 다** 돌려야 합니다.

**테스트는 산출물을 지켜야 합니다.** 이 저장소에서 반복적으로 나온 실패 유형이
"컴포넌트를 고립해서만 검사하고, 그게 실제 문서에 삽입됐는지는 아무도 안 보는 것"입니다.
그래서 `*-doc-components.test.ts` 들이 문서 raw 텍스트를 직접 읽습니다. 새 컴포넌트를 만들면
**쓰이는 자리까지** 테스트하세요.

**`components/mdx.tsx` 는 추가 전용입니다.** 기존 등록을 지우지 말고 항목만 추가하세요.

**작업 브랜치는 `main` 이 아닌 별도 브랜치**에서 하고, PR 로 올립니다.
`git add -A` 를 쓸 때는 무엇이 담기는지 먼저 `git status` 로 확인하세요.

---

## 다른 PC에서 처음 열었다면

```bash
node -v                       # 22.x
corepack enable
pnpm install
pnpm exec playwright install
pnpm build                    # 여기까지 통과하면 환경이 맞은 겁니다
```

`.omc/` `.superpowers/` `.idea/` 는 로컬 전용이라 따라오지 않습니다. 정상입니다.
