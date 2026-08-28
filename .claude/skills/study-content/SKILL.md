---
name: study-content
description: 스터디 콘텐츠를 고칠 때 사용한다 — 이번 주 회차 변경, 회차 내용 수정, 커리큘럼 변경, 로드맵·용어 사전 수정, 새 시각화 컴포넌트 추가. "이번 주 바꿔줘", "3회차 내용 고쳐줘", "로드맵 수정" 같은 요청에 쓴다.
---

# 스터디 콘텐츠 고치기

**어디를 고쳐야 하는지**가 이 저장소에서 가장 자주 틀리는 지점이다. 값은 한 곳에만 있고
화면 여러 곳이 그걸 읽어 간다. 화면에서 본 문구를 grep 해서 컴포넌트를 직접 고치면 안 된다.

## 무엇을 고칠 것인가

| 하려는 일 | 고칠 파일 | 따라오는 화면 |
|---|---|---|
| 이번 주 회차 변경 | `content/data/curriculum.ts` 의 `currentWeek` | 사이드바 배지, 홈 배너, 여정 맵 현재 위치 |
| 회차 제목·목표·산출물 | `content/data/curriculum.ts` | 사이드바, 여정 맵, 조감도, 회차 헤더, 숙제 카드 |
| 회차 본문 | `content/docs/weeks/<slug>.mdx` | 그 페이지만 |
| 방향성 로드맵 | `content/data/roadmap.ts` | `/start/roadmap` |
| "왜 만들었나" | `content/data/why.ts` | `/start/why` |
| 용어 사전 | `content/data/glossary.ts` | 용어 사전 페이지 + `<Term>` 이 인식하는 목록 |
| 단계 이름·색 | `lib/stage.ts` | 여정 맵 바, 단계 칩 |
| 색·간격·폭 | `app/global.css` | 전역 |

## 회차를 바꿀 때 — 두 파일이 짝이다

`curriculum[].title` 은 짧은 이름(`킥오프`)이고, 사이드바와 문서 H1 에는 `1회차 — 킥오프` 형태로
나간다. 그 형태는 `weekLabel(w)` 이 만들고, **회차 문서의 frontmatter `title` 이 그 값과 글자 그대로
같아야 한다.**

```
content/data/curriculum.ts   title: '킥오프'
content/docs/weeks/01-kickoff.mdx   title: 1회차 — 킥오프
```

한쪽만 고치면 `tests/unit/sidebar.test.ts` 가 잡는다. 둘 다 고쳐라.

`currentWeek` 은 **손으로 고치는 값**이다. 날짜 기반 자동 계산을 넣지 마라 — 일정은 밀리는 게
정상이고, 자동화하면 틀린 값이 화면에 뜬다.

## 본문을 쓸 때

- **볼드 안에 따옴표 금지.** `**"X"**를` 는 별표가 글자로 렌더된다. `"**X**"를` 로 쓴다
- **용어 사전 단어는 본문 첫 등장에 `<Term>` 을 감싼다.** 문서당 한 번, 본문 문단만
  (헤딩·표 셀·코드블록 제외). `pnpm validate` 가 아니라 **`pnpm test`** 가 검사한다
  (아카이브 제출물은 대상 아님)
- **내부 링크는 실제 경로로.** 깨진 링크는 빌드를 실패시킨다
- 회차 문서는 `<WeekHeader week={N} />` 로 시작하고, 마지막 회차를 제외하면
  `<Homework week={N} />` 을 갖는다. `tests/unit/week-doc-components.test.ts` 가 검사한다

## 시각화 컴포넌트를 추가할 때

1. `components/visuals/<name>.tsx` 에 만든다. 데이터는 `content/data/` 에서 읽는다
2. `components/mdx.tsx` 에 등록한다 — **추가 전용이다. 기존 등록을 지우지 마라**
3. 넓게 써야 하면 루트 요소에 `className="fullbleed"` 를 단다
   (본문 720px 상한에서 빠져나온다. `app/global.css` 참고)
4. 색은 토큰만 쓴다. `color: var(--blue)` 는 금지 — 텍스트는 `--blue-text`,
   흰 글자를 얹는 채움은 `--blue-fill`. `tests/unit/color-usage.test.ts` 가 잡는다
5. 단계를 표시하면 **색만으로 구분하지 말고** 이모지+라벨을 함께 낸다
6. 테스트를 두 개 쓴다 — 컴포넌트 자체, 그리고 **그게 실제 문서에 삽입됐는지**
   (`tests/unit/*-doc-components.test.ts` 패턴). 전자만 있으면 만들어두고 안 쓰는 걸 못 잡는다

## 확인

```bash
pnpm validate   # 콘텐츠 규칙
pnpm test       # 단위 테스트
pnpm build      # 전체 게이트 — 배포와 같은 조건
```

렌더를 눈으로 볼 때는 `pnpm build && pnpm start` 를 쓴다.
오래 띄워둔 `pnpm dev` 는 증분 상태가 썩어서 실제와 다른 500 을 낸다.
