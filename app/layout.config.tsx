import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'

export function baseOptions(): BaseLayoutProps {
  return {
    nav: { title: 'AI 기획자가 되어보자' },
  }
}

/**
 * UI 크롬 문자열의 한국어 번역 (스펙 §6.6: UI 요소는 `~해요`, 문서 본문은 원문 유지).
 *
 * `BaseLayoutProps.i18n` 필드는 존재하지만 fumadocs-ui docs 레이아웃 어디에서도
 * 실제로 소비되지 않는다(다국어 라우팅/언어 스위처 전용, deprecated) — 대신 실제로
 * 문자열을 바꾸는 통로는 `RootProvider`(fumadocs-ui/provider/next)의 `i18n` prop이
 * `@fuma-translate/react`의 `TranslationProvider`로 전달하는 `translations` 맵이다.
 * 키는 `text + notes.map(n => `(${n})`).join('')` 형식으로 인코딩되며
 * (`@fuma-translate/react/dist/index.mjs`의 `encodeKey` 확인),
 * 각 호출부의 실제 `useTranslations({ note })` / `t(text, { note })` 조합을 직접
 * node_modules에서 추적해 아래 키를 확정했다:
 *   - 검색 트리거(눈에 보이는 입력창 모양 UI): layouts/shared/slots/search-trigger.js
 *     `FullSearchTrigger` — 버튼이 아니라 돋보기 아이콘 + 플레이스홀더 텍스트 +
 *     `Ctrl K` 뱃지로 이루어진 "입력창처럼 생긴" 요소라서, 실제 input이 아니어도
 *     placeholder 관례(질문형 ~해요)를 따른다. 여기에 스펙의 "검색 플레이스홀더" 예문을 둔다.
 *   - 검색 다이얼로그: components/dialog/search.js `SearchDialogInput` — 모달을 연 뒤의
 *     실제 input placeholder. 이미 검색하기로 마음먹은 뒤라 간결한 명사로 충분하다.
 *   - 사이드바 열기/닫기/접기 aria: components/sidebar/base.js
 *     (`SidebarTrigger`, `SidebarCollapseTrigger` — 형제 컨트롤이라 둘 다 번역해야
 *     한쪽만 한국어이고 옆은 영어인 반쪽짜리 현지화를 피한다)
 *   - 테마 전환 aria: layouts/shared/slots/theme-switch.js
 *   - TOC 제목: layouts/docs/page/slots/toc.js
 *   - 이전/다음 페이지 캡션: layouts/docs/page/slots/footer.js `FooterItem`
 *     (지금은 문서가 1개라 안 보이지만, Task 4가 8개 회차 문서를 추가하면
 *     페이지네이션이 바로 나타난다 — 미리 번역해 스테일 영어 회귀를 막는다)
 * `app/layout.tsx`에서 `<RootProvider i18n={{ translations: koChromeTranslations }}>`로 사용한다.
 *
 * 등록 원칙: 버튼/aria-label은 간결한 명사·동사형 구, 입력창 모양 placeholder는
 * 스펙 §6.6의 질문형 ~해요 — 실제 화면 요소가 버튼인지 입력창인지로 구분한다
 * (문자열의 원본 텍스트가 아니라 렌더링되는 모양으로 판단).
 */
export const koChromeTranslations: Record<string, string> = {
  'Search(search trigger)': '무엇이 궁금하세요?',
  'Search(search dialog)': '검색',
  'Open Search(search trigger)(aria-label)': '검색 열기',
  'Close Search(search dialog)(aria-label)': '검색 닫기',
  'Open Sidebar(sidebar)(aria-label)': '사이드바 열기',
  'Close Sidebar(sidebar)(aria-label)': '사이드바 닫기',
  'Collapse Sidebar(sidebar)(aria-label)': '사이드바 접기',
  'Toggle Theme(theme switcher)(aria-label)': '테마 바꾸기',
  'On this page(table of contents)': '목차',
  'Previous Page(pagination)': '이전 페이지',
  'Next Page(pagination)': '다음 페이지',
}
