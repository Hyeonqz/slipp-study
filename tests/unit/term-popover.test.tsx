import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Term } from '@/components/ui/term'

/**
 * Fix Round 1 / Finding 1: `title` 속성 팝오버는 터치 기기에서 아예 뜨지 않는다.
 * 새 구현은 호버/탭에 의한 노출 자체는 `:hover`/`:focus-within` CSS로 처리하므로
 * (jsdom은 실제 CSS 엔진이 없어 `:hover` 반응을 검증할 수 없다 — 이건 컴파일된
 * Tailwind 산출물 검사로 별도 확인했다, task-7-report.md 참고), 여기서는 JS로
 * 실제 동작하는 부분 — 포커스 도달 가능성, 다른 곳 포커스 시 닫힘(=탭하면 닫힘과
 * 동일한 메커니즘), Esc로 닫힘 — 을 검증한다.
 */
describe('<Term /> 팝오버 상호작용', () => {
  it('트리거가 키보드/탭 포커스를 받을 수 있다 (tabIndex=0)', async () => {
    render(<Term>PRD</Term>)
    const trigger = screen.getByText('PRD')
    expect(trigger).toHaveAttribute('tabindex', '0')
    trigger.focus()
    expect(document.activeElement).toBe(trigger)
  })

  it('다른 곳으로 포커스가 이동하면(= 다른 곳을 탭하면) 트리거는 포커스를 잃는다', () => {
    render(
      <div>
        <Term>PRD</Term>
        <button>다른 버튼</button>
      </div>,
    )
    const trigger = screen.getByText('PRD')
    const otherButton = screen.getByRole('button', { name: '다른 버튼' })
    trigger.focus()
    expect(document.activeElement).toBe(trigger)
    otherButton.focus()
    expect(document.activeElement).not.toBe(trigger)
    expect(document.activeElement).toBe(otherButton)
  })

  it('포커스된 상태에서 Escape를 누르면 트리거가 blur된다 (팝오버가 닫힌다)', async () => {
    const user = userEvent.setup()
    render(<Term>PRD</Term>)
    const trigger = screen.getByText('PRD')
    trigger.focus()
    expect(document.activeElement).toBe(trigger)

    await user.keyboard('{Escape}')

    expect(document.activeElement).not.toBe(trigger)
  })

  it('접근성: aria-label에 정의가 있어 팝오버가 열리기 전에도 스크린리더가 정의를 읽을 수 있다', () => {
    render(<Term>PRD</Term>)
    const trigger = screen.getByText('PRD')
    expect(trigger).toHaveAttribute('aria-label', expect.stringContaining('Product Requirements'))
  })

  it('시각적 팝오버 레이어는 스크린리더에서 이중으로 읽히지 않도록 aria-hidden 처리돼 있다', () => {
    render(<Term>PRD</Term>)
    // aria-label이 이미 완전한 정의를 담고 있으므로, 시각용 패널은 보조기기에서 숨긴다.
    const hidden = document.querySelector('[aria-hidden="true"]')
    expect(hidden).not.toBeNull()
    expect(hidden?.textContent).toContain('Product Requirements')
  })

  it('디자인 토큰 규칙: 팝오버 텍스트 색이 --g500보다 어둡다 (보조 텍스트 하한 --g600 이상 사용)', () => {
    render(<Term>PRD</Term>)
    const hidden = document.querySelector('[aria-hidden="true"]') as HTMLElement
    // --g500을 텍스트로 쓰지 않는다는 규칙 — 팝오버 본문은 --g700, 밑줄은 --g500(장식).
    expect(hidden.style.color).toBe('var(--g700)')
  })
})
