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
 *   - 검색 다이얼로그 placeholder: components/dialog/search.js `SearchDialogInput`
 *   - 검색 트리거 라벨/aria: layouts/shared/slots/search-trigger.js
 *   - 사이드바 열기/닫기 aria: components/sidebar/base.js
 *   - 테마 전환 aria: layouts/shared/slots/theme-switch.js
 *   - TOC 제목: layouts/docs/page/slots/toc.js
 * `app/layout.tsx`에서 `<RootProvider i18n={{ translations: koChromeTranslations }}>`로 사용한다.
 */
export const koChromeTranslations: Record<string, string> = {
  'Search(search dialog)': '무엇이 궁금하세요?',
  'Search(search trigger)': '검색',
  'Open Search(search trigger)(aria-label)': '검색 열기',
  'Close Search(search dialog)(aria-label)': '검색 닫기',
  'Open Sidebar(sidebar)(aria-label)': '사이드바 열기',
  'Close Sidebar(sidebar)(aria-label)': '사이드바 닫기',
  'Toggle Theme(theme switcher)(aria-label)': '테마 바꾸기',
  'On this page(table of contents)': '목차',
}
