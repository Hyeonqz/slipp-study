'use client'

import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { lookup } from '@/content/data/glossary'

/**
 * Fix Round 1 / Finding 1: `title`은 터치 기기에서 아무 반응이 없다. 실제
 * 팝오버로 교체했다.
 *
 * Fix Round 2 / Finding 1 (재오픈): Round 1은 "tabIndex가 있는 span은 모바일에서
 * 탭하면 포커스를 받는다"를 iOS Safari에도 그대로 적용했는데, 이건 틀렸다.
 * WebKit은 폼 요소·링크가 아닌 커스텀 tabIndex 요소를, 사용자가 "전체 키보드
 * 접근"(기본 꺼짐)을 켜지 않는 한 탭으로 포커스시키지 않는다(iOS Safari의
 * 오래된, 잘 알려진 동작). 그래서 CSS `:focus-within`에만 기대면 iOS에서
 * 탭해도 아무 일도 안 일어날 수 있다.
 *
 * 그래서 트리거를 실제 `<button type="button">`으로 바꾸고(폼 컨트롤이라
 * iOS에서도 포커스 대상이 되는 요소지만, 그 포커스 동작에마저 기대지 않도록),
 * 열림 상태를 명시적 React state(`open`)로 관리한다. 탭이든 클릭이든 모든
 * 포인터 입력은 예외 없이 `click` 이벤트를 낸다 — 이건 iOS/Android/데스크톱
 * 어디서나 논쟁의 여지가 없는, 검증된 동작이다. `onClick`이 그 위에서
 * `open`을 켠다. 즉 탭 인식은 이제 "브라우저가 포커스를 주길 바라는 것"이
 * 아니라 "브라우저가 100% 보장하는 click 이벤트"에 의존한다.
 *
 * 마우스 호버는 여전히 데스크톱에서 "가볍게"(클릭 없이) 열리도록 유지한다
 * (onMouseEnter/onMouseLeave). 키보드 포커스도 유지한다(onFocus/onBlur).
 * 닫힘은 Esc(onKeyDown), 마우스 아웃, blur, 그리고 바깥을 탭/클릭했을 때의
 * document 리스너 — 네 가지 경로 전부로 확실히 닫히게 했다(포커스가 실제로
 * 옮겨가는지에 기대지 않는다).
 */
export function Term({ children }: { children: string }) {
  const entry = lookup(children)
  if (!entry) {
    throw new Error(
      `<Term>${children}</Term> — content/data/glossary.ts 에 '${children}' 항목이 없습니다`,
    )
  }

  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLSpanElement>(null)

  /**
   * Fix Round 2 / Finding 4: 예시(entry.example)는 지금까지 팝오버 안에만
   * 있었고 aria-label에는 없었다. 팝오버가 aria-hidden이라 스크린리더
   * 사용자는 예시를 영영 못 받았다 — 19개 중 14개 항목에 example이 있으니
   * 사실상 대부분의 용어에서 시각 사용자가 더 많은 정보를 받고 있었다.
   *
   * 두 방법(예시를 accessible name에 합치기 / aria-describedby로 분리하기)
   * 중 전자를 택했다: `tests/unit/glossary.test.tsx`의 원 스펙 테스트가
   * `aria-label`이 "Product Requirements"(정의 일부)를 담고 있어야 한다고
   * 이미 못 박아뒀는데, aria-describedby로 분리하면 aria-label에는 term만
   * 남아 그 테스트가 깨진다. aria-label에 예시까지 이어붙이면 그 테스트를
   * 그대로 만족시키면서 예시 정보도 스크린리더에 도달한다 — 안 보이는
   * 팝오버가 이중으로 다시 발화될 위험도 없다(그 팝오버는 aria-hidden으로
   * 완전히 숨겨 접근성 트리에서 아예 제외했으므로 정보원이 aria-label
   * 하나뿐이다).
   */
  const accessibleLabel = entry.example
    ? `${entry.term}: ${entry.definition} 예: ${entry.example}`
    : `${entry.term}: ${entry.definition}`

  // 바깥을 탭/클릭하면 닫는다 — 트리거가 실제로 포커스를 받았는지와 무관하게
  // 항상 동작하도록, blur 대신(만) 기대지 않고 document 리스너로 확실히 처리한다.
  useEffect(() => {
    if (!open) return
    function onOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', onOutside)
    return () => document.removeEventListener('click', onOutside)
  }, [open])

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'Escape') {
      setOpen(false)
      e.currentTarget.blur()
    }
  }

  return (
    <span ref={rootRef} className="relative inline-block">
      <button
        type="button"
        aria-label={accessibleLabel}
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="m-0 inline border-0 bg-transparent p-0 align-baseline cursor-help outline-offset-2"
        style={{
          borderBottom: '1.5px dotted var(--g500)',
          outlineColor: 'var(--blue)',
          font: 'inherit',
          color: 'inherit',
        }}
      >
        {children}
      </button>

      {/*
        시각 전용 레이어 — 위 button의 aria-label이 이미 정의+예시 전체를
        담고 있으므로(스크린리더는 열림 상태와 무관하게 그걸로 충분하다),
        여기는 aria-hidden으로 접근성 트리에서 완전히 제외해 이중 발화를
        막는다.

        Fix Round 2 / Finding 5: 640~1024px 폭에서 절대 위치 팝오버가 오른쪽
        가장자리를 넘어갈 수 있다는 지적 — `sm:`(640px) 대신 `lg:`(1024px)에서
        전환하도록 브레이크포인트를 올렸다. 1024px 이상은 640px 본문 컬럼 +
        오른쪽 TOC 거터가 있는 3단 레이아웃이라 안전한 여백이 항상 있다.
        1024px 미만은 전부 뷰포트에 고정된 하단 시트라 가로 충돌이 구조적으로
        불가능하다.
      */}
      <span
        role="presentation"
        aria-hidden="true"
        className={
          (open ? 'visible opacity-100' : 'invisible opacity-0') +
          ' pointer-events-none fixed inset-x-3 bottom-3 z-50 transition-opacity duration-150' +
          ' lg:absolute lg:inset-x-auto lg:bottom-auto lg:left-1/2 lg:top-[calc(100%+6px)]' +
          ' lg:w-max lg:max-w-[280px] lg:-translate-x-1/2'
        }
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
