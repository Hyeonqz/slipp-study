'use client'

import type { KeyboardEvent } from 'react'
import { lookup } from '@/content/data/glossary'

/**
 * Fix Round 1 / Finding 1: `title`은 터치 기기에서 아무 반응이 없다(호버가 없으니
 * 절대 뜨지 않는다). 그래서 실제 팝오버로 교체한다.
 *
 * 노출 트리거(호버·포커스·탭)는 순수 CSS로 처리한다 — `tabIndex`가 있는 요소는
 * 모바일 브라우저에서도 탭하면 실제로 포커스를 받으므로(iOS Safari·Chrome
 * Android 공통 동작), `:hover`/`:focus-within` 두 가지만으로 마우스 호버·키보드
 * 포커스·터치 탭을 전부 커버한다. "다른 곳을 탭하면 닫힘"도 포커스가 빠지면서
 * (blur) 자연히 CSS로 닫힌다 — 별도 JS 없이 된다.
 *
 * 다만 Esc로 닫는 것만은 CSS로 불가능하다(브라우저가 Esc에 blur를 걸어주지
 * 않는다). 그 한 가지 때문에 이 컴포넌트는 'use client'가 되지만, `useState`나
 * `useEffect`는 쓰지 않는다 — 트리거에 매달린 `onKeyDown` 하나가 자기 자신을
 * blur시키는 게 전부다. 나머지 표시/숨김 로직은 여전히 CSS다.
 *
 * 360px 폭에서 "오른쪽 끝 단어의 팝오버가 화면 밖으로 안 나가야 한다"는 요구는,
 * 좁은 화면에서는 팝오버를 트리거 위치가 아니라 뷰포트 하단에 고정(`fixed`)해
 * 애초에 가로 충돌이 생길 수 없게 해서 만족시킨다. `sm:` 이상(≈640px+)에서만
 * 단어 아래 중앙에 붙는 절대 위치 팝오버로 바뀐다.
 */
export function Term({ children }: { children: string }) {
  const entry = lookup(children)
  if (!entry) {
    throw new Error(
      `<Term>${children}</Term> — content/data/glossary.ts 에 '${children}' 항목이 없습니다`,
    )
  }

  function blurOnEscape(e: KeyboardEvent<HTMLSpanElement>) {
    if (e.key === 'Escape') e.currentTarget.blur()
  }

  return (
    <span className="group relative inline-block">
      <span
        tabIndex={0}
        aria-label={`${entry.term}: ${entry.definition}`}
        onKeyDown={blurOnEscape}
        className="cursor-help outline-offset-2"
        style={{ borderBottom: '1.5px dotted var(--g500)', outlineColor: 'var(--blue)' }}
      >
        {children}
      </span>

      {/* 팝오버 — 스크린리더는 이 안 내용이 아니라 위 span의 aria-label로
          정의를 이미 즉시 받으므로(포커스만 가도 전달됨), 여기는
          aria-hidden으로 눈에 보이는 사람용 시각 레이어로만 둔다. */}
      <span
        role="presentation"
        aria-hidden="true"
        className="
          pointer-events-none invisible fixed inset-x-3 bottom-3 z-50 opacity-0
          transition-opacity duration-150
          group-hover:visible group-hover:opacity-100
          group-focus-within:visible group-focus-within:opacity-100
          sm:absolute sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-[calc(100%+6px)]
          sm:w-max sm:max-w-[280px] sm:-translate-x-1/2
        "
        style={{
          background: 'var(--g50)',
          color: 'var(--g700)',
          borderRadius: 'var(--r-block)',
          padding: '10px 12px',
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        {entry.definition}
        {entry.example && (
          <>
            <br />
            <span style={{ color: 'var(--g600)' }}>예: {entry.example}</span>
          </>
        )}
      </span>
    </span>
  )
}
