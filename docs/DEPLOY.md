# 배포 · 도메인 연결

사이트 주소: **https://study.calix.kr**

> 이 문서는 저장소 소유자가 직접 수행하는 절차입니다. Vercel 계정과 도메인 관리 콘솔 접근이 필요해서 사람이 해야 합니다.

---

## 1. Vercel 프로젝트 연결 (최초 1회)

1. https://vercel.com/new 에서 이 저장소를 **Import**
2. Framework Preset이 **Next.js**로 자동 인식되는지 확인
3. Build Command / Output Directory / Install Command 전부 **기본값 그대로** 둡니다
   - `pnpm build`가 `prebuild`를 자동으로 먼저 실행합니다
   - `prebuild`는 `fumadocs-mdx && tsc --noEmit && pnpm validate` — 콘텐츠 생성 · 타입 검사 · 콘텐츠 검증 순서입니다
   - **이 체인을 건드리지 마세요.** `fumadocs-mdx` 단계가 빠지면 새로 클론한 환경에서 빌드가 깨집니다
4. **Deploy**

배포가 끝나면 `<프로젝트명>.vercel.app` 주소가 나옵니다. 도메인을 붙이기 전에 이 주소로 먼저 확인하세요.

## 2. study.calix.kr 연결

### 2-1. Vercel에 도메인 등록

1. 프로젝트 → **Settings → Domains**
2. `study.calix.kr` 입력 후 **Add**
3. Vercel이 **CNAME 값**을 보여줍니다 (보통 `cname.vercel-dns.com`)

> ⚠️ **화면에 표시된 값을 그대로 쓰세요.** Vercel이 값을 바꾸는 경우가 있으므로, 이 문서에 적힌 예시가 아니라 **대시보드 값이 기준**입니다.

### 2-2. 메가존클라우드 DNS에 CNAME 추가

도메인 관리 콘솔에서 `calix.kr`의 DNS 레코드에 추가합니다.

| 항목 | 값 |
|---|---|
| 타입 | `CNAME` |
| 호스트 / 이름 | `study` (콘솔에 따라 `study.calix.kr` 전체를 넣어야 할 수도 있습니다) |
| 값 / 대상 | Vercel이 알려준 값 (예: `cname.vercel-dns.com`) |
| TTL | 기본값 (300~3600) |

> **왜 apex(`calix.kr`)가 아니라 서브도메인인가**
>
> DNS 표준상 apex 도메인에는 CNAME과 다른 레코드(NS, SOA 등)가 공존할 수 없습니다.
> apex에 붙이려면 A 레코드(`76.76.21.21`)를 써야 합니다.
> `study.calix.kr`은 서브도메인이라 CNAME이 정석이고, Vercel이 IP를 바꿔도 따라갑니다.

### 2-3. 확인

DNS 전파에 보통 몇 분, 최대 몇 시간 걸립니다.

```bash
nslookup study.calix.kr
# 또는
dig study.calix.kr CNAME +short
```

Vercel **Settings → Domains**에서 `study.calix.kr` 옆이 **Valid Configuration**이 되고 HTTPS 인증서가 자동 발급되면 끝입니다.

## 3. 이후 배포

손댈 것이 없습니다.

- `main`에 push → 프로덕션(`study.calix.kr`) 자동 갱신
- PR 생성 → Preview URL 자동 생성 (머지 전 확인용)
- **빌드가 실패하면 배포되지 않습니다** — 잘못된 frontmatter나 깨진 내부 링크가 프로덕션에 올라갈 수 없습니다

## 4. 팀원에게 저장소 열어주기

GitHub 저장소 → **Settings → Collaborators** → 팀원 계정 추가.

팀원이 할 일은 저장소 `README.md`의 "산출물 올리는 법"에 있습니다.

## 5. 배포 후 확인 체크리스트

- [ ] 사이드바 5그룹이 순서대로 보인다 — `시작하기` / `진행 방식` / `회차` / `양식 · 예시` / `아카이브`
- [ ] 홈에서 "누구를 위한 스터디인가" 섹션이 보인다
- [ ] `/weeks/04-prd` — 3열 레이아웃, 상단 배지 3개, 파란 숙제 카드
- [ ] 본문의 점선 밑줄 단어(용어)를 **폰에서 탭**했을 때 정의가 뜬다
      → 이건 실기기 확인이 필요합니다. 개발 중에는 시뮬레이션만 했습니다
- [ ] 폰 또는 개발자 도구 360px — 가로 스크롤 없음, 사이드바가 드로어로 접힘
- [ ] 검색창에 `역기획` / `기획` / `PRD` 를 각각 넣어본다
      → `기획`으로 `역기획` 문서가 안 잡히면 한국어 검색 이슈입니다. 이슈로 남기고 대안(Pagefind) 교체를 별도 작업으로 잡습니다

## 6. 아카이브 PR 흐름 시험

산출물 수집이 실제로 도는지 한 번 돌려보는 절차입니다. (아카이브 기능은 아직 구현 중입니다 — 완성 후 시험하세요.)

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

확인이 끝나면 PR과 브랜치를 닫습니다.

---

## 현재 진행 상황

이 문서를 쓰는 시점에 사이트는 아직 만들어지는 중입니다. 완료된 것과 남은 것:

**완료** — 사이트 골격과 루트 라우팅, 토스 스타일 디자인 토큰, 8회차 커리큘럼 데이터, 회차 문서 8개, 콘텐츠 검증 게이트, README 분할(문서 20개), 용어 사전과 인라인 용어 팝오버, 회차 페이지 UI(배지 · 숙제 카드 · 경고 블록)

**남음** — 3단 구조와 2시간 타임블록 시각화, 8회차 여정 맵, 기획 의도와 방향성 로드맵, 팀원 산출물 아카이브, 반응형·접근성 검증, 마무리 정리

지금 배포해도 동작합니다. 남은 작업은 `main`에 push될 때마다 자동으로 반영됩니다.
