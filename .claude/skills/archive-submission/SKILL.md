---
name: archive-submission
description: 팀원 산출물(역기획·PRD·인터뷰 기록·지표 트리·원페이저·검증 결과)을 아카이브에 추가할 때 사용한다. "산출물 올려줘", "역기획 올려줘", "아카이브에 추가" 같은 요청에 쓴다.
---

# 아카이브에 산출물 올리기

파일 하나를 `content/docs/archive/` 에 넣으면 `/archive` 보드에 자동으로 집계된다.
집계 코드를 고칠 일은 없다 — **frontmatter만 정확하면 된다.**

## 1. 파일명

```
w<회차 두 자리>-<영문 슬러그>.mdx
```

예: `w02-reverse-toss.mdx`, `w05-interview-hyeonqz.mdx`

- 회차 번호는 frontmatter 의 `week` 와 **반드시 일치**해야 한다
- 확장자는 `.mdx` 다. `.md` 는 빌드가 인식하지 못한다

## 2. frontmatter — 5개 필드 전부 필수

```yaml
---
title: 토스 송금 역기획
week: 2
author: 홍길동
type: 역기획
date: "2026-09-15"
---
```

| 필드 | 규칙 |
|---|---|
| `title` | 자유 |
| `week` | 1~8 사이 정수. 파일명의 `w<번호>` 와 같아야 한다 |
| `author` | 자유. 실명·닉네임 무관 |
| `type` | `역기획` `PRD` `인터뷰` `지표` `원페이저` `검증` 중 하나 |
| `date` | **반드시 따옴표로 감싼다** |

`date` 에 따옴표가 없으면 YAML 이 `Date` 객체로 파싱해서 검증에서 걸린다. 문자열이어야 한다.

## 3. 본문 — MDX 다

<!-- 아래 두 가지가 이 파일 형식에서 사람들이 실제로 걸리는 지점이다 -->
- 꺾쇠(`<`)로 시작하는 글자는 JSX 태그로 해석된다. `<Term>` 같은 등록된 컴포넌트가 아니면 빌드가 깨진다
- 중괄호(`{`)도 JS 표현식으로 해석된다. 글자 그대로 쓰려면 백틱 코드로 감싼다

일반 마크다운(제목·표·코드블록·링크)은 전부 그대로 쓸 수 있다.

## 4. 인터뷰 기록이면 — 익명화

**사이트는 전체 공개다.** 인터뷰 기록에는 다음이 남으면 안 된다.

- 실명 → `A님` `30대 직장인 B` 같은 표기로
- 회사명·팀명 → `국내 이커머스 회사` 같은 범주로
- 연락처·SNS 계정·특정 가능한 세부 사항

`content/docs/templates/interview.mdx` 상단 배너에 규칙 전문이 있다.

## 5. 확인

```bash
pnpm validate   # frontmatter 5필드, week 범위, 파일명 일치 검사
pnpm build      # 전체 게이트. 여기까지 통과하면 배포도 통과한다
```

검증이 실패하면 **어느 파일의 무엇이 틀렸는지 메시지에 나온다.** 그대로 고치면 된다.

## 6. 올리기

작업 브랜치에서 PR 로 올린다. `main` 에 직접 커밋하지 않는다.

```bash
git switch -c archive/w02-홍길동
git add content/docs/archive/w02-reverse-toss.mdx
git commit -m "docs: 2회차 역기획 추가 (홍길동)"
git push -u origin archive/w02-홍길동
```

PR 에 Vercel Preview 링크가 자동으로 붙는다. **Preview 의 `/archive` 에서 실제로 보이는지 확인한 뒤** 머지한다.

## 참고

- 사이트에 있는 안내: `/archive#how-to-upload`
- 예시 파일: `content/docs/archive/w02-example-reverse.mdx`
- 집계 로직: `lib/archive-source.ts` (수정할 일 없음)
- 검증 규칙: `lib/validators.ts`
