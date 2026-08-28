import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Term } from '@/components/ui/term'

/**
 * Fix Round 1 / Finding 1: `title` 속성 팝오버는 터치 기기에서 아예 뜨지 않는다.
 *
 * Fix Round 2 / Finding 1: Round 1의 "tabIndex 붙은 span은 모바일에서 탭하면
 * 포커스를 받는다"는 전제가 iOS Safari에서는 틀렸다(폼 요소·링크가 아닌 커스텀
 * tabIndex 요소는 "전체 키보드 접근"을 켜지 않는 한 탭으로 포커스되지 않는다).
 * 그래서 트리거를 실제 `<button>`으로 바꾸고, 열림 상태를 `open` state로
 * 명시적으로 관리한다 — 탭/클릭은 모든 브라우저가 예외 없이 내는 `click`
 * 이벤트에 의존하므로 포커스 여부와 무관하게 확실히 동작한다.
 *
 * jsdom은 실제 CSS 엔진이 없어 `:hover`가 시각적으로 무엇을 보여주는지까지는
 * 검증할 수 없지만(그건 컴파일된 Tailwind 산출물 검사로 별도 확인했다 —
 * task-7-report.md 참고), `open` state가 실제로 켜지는 이벤트(click, hover,
 * focus)와 꺼지는 이벤트(Escape, 바깥 클릭, mouseleave, blur)는 순수 JS
 * 동작이라 여기서 그대로 검증 가능하다 — 그 state가 패널의 className에
 * 반영되는 것까지 확인한다.
 */
describe('<Term /> 팝오버 상호작용', () => {
  it('트리거는 실제 <button>이라 별도 tabIndex 없이도 기본적으로 포커스를 받는다', () => {
    render(<Term>PRD</Term>)
    const trigger = screen.getByText('PRD')
    expect(trigger.tagName).toBe('BUTTON')
    trigger.focus()
    expect(document.activeElement).toBe(trigger)
  })

  it('클릭(=탭)하면 패널이 열린다 — 포커스 여부와 무관한 click 이벤트에 의존', async () => {
    const user = userEvent.setup()
    render(<Term>PRD</Term>)
    const trigger = screen.getByText('PRD')
    const panel = document.querySelector('[aria-hidden="true"]') as HTMLElement

    expect(panel.className).toContain('opacity-0')
    await user.click(trigger)
    expect(panel.className).toContain('opacity-100')
  })

  it('호버하면 패널이 열리고, 마우스가 나가면 닫힌다 (데스크톱 포인터 사용자)', () => {
    render(<Term>PRD</Term>)
    const trigger = screen.getByText('PRD')
    const panel = document.querySelector('[aria-hidden="true"]') as HTMLElement

    fireEvent.mouseEnter(trigger)
    expect(panel.className).toContain('opacity-100')
    fireEvent.mouseLeave(trigger)
    expect(panel.className).toContain('opacity-0')
  })

  it('열린 상태에서 바깥을 클릭(=바깥을 탭)하면 닫힌다', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <Term>PRD</Term>
        <button>바깥 버튼</button>
      </div>,
    )
    const trigger = screen.getByText('PRD')
    const outside = screen.getByRole('button', { name: '바깥 버튼' })
    const panel = document.querySelector('[aria-hidden="true"]') as HTMLElement

    await user.click(trigger)
    expect(panel.className).toContain('opacity-100')

    await user.click(outside)
    expect(panel.className).toContain('opacity-0')
  })

  it('포커스된 상태에서 Escape를 누르면 트리거가 blur되고 패널이 닫힌다', async () => {
    const user = userEvent.setup()
    render(<Term>PRD</Term>)
    const trigger = screen.getByText('PRD')
    const panel = document.querySelector('[aria-hidden="true"]') as HTMLElement

    // userEvent.click은 실제 브라우저처럼 포커스 이동 + click 이벤트를 함께
    // 일으키고 act()로 올바르게 감싸므로, 이 테스트에서 activeElement와
    // state 파생 className을 함께 검증할 수 있다.
    await user.click(trigger)
    expect(document.activeElement).toBe(trigger)
    expect(panel.className).toContain('opacity-100')

    await user.keyboard('{Escape}')

    expect(document.activeElement).not.toBe(trigger)
    expect(panel.className).toContain('opacity-0')
  })

  it('Fix Round 1 회귀 방지: 다른 곳으로 포커스가 이동하면 트리거는 포커스를 잃는다', () => {
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
  })

  it('Finding 4 — aria-label이 정의뿐 아니라 예시까지 담아, 팝오버를 열지 않아도 스크린리더가 예시까지 받는다', () => {
    render(<Term>PRD</Term>)
    const trigger = screen.getByText('PRD')
    const label = trigger.getAttribute('aria-label') ?? ''
    expect(label).toContain('Product Requirements')
    // PRD 항목의 example: '양식과 채운 예시는 "양식 · 예시" 그룹의 PRD 양식 문서에 있습니다'
    expect(label).toContain('양식과 채운 예시는')
  })

  it('시각적 팝오버 레이어는 스크린리더에서 이중으로 읽히지 않도록 aria-hidden 처리돼 있다', () => {
    render(<Term>PRD</Term>)
    const hidden = document.querySelector('[aria-hidden="true"]')
    expect(hidden).not.toBeNull()
    expect(hidden?.textContent).toContain('Product Requirements')
  })

  it('디자인 토큰 규칙: 팝오버 텍스트 색이 --g500보다 어둡다 (보조 텍스트 하한 --g600 이상 사용)', () => {
    render(<Term>PRD</Term>)
    const hidden = document.querySelector('[aria-hidden="true"]') as HTMLElement
    expect(hidden.style.color).toBe('var(--g700)')
  })

  /**
   * Fix Wave finding 5: 같은 트리거를 두 번째로 탭(=클릭)하면 닫혀야 한다.
   * 모바일에는 Escape가 없고, 트리거를 다시 탭하는 것 말고는 "바깥을 탭"할
   * 손가락이 이미 트리거 위에 있는 셈이라 자연스러운 닫기 동작이다.
   */
  it('Finding 5 — 같은 트리거를 두 번 연속 탭하면 두 번째 탭에 닫힌다', async () => {
    const user = userEvent.setup()
    render(<Term>PRD</Term>)
    const trigger = screen.getByText('PRD')
    const panel = document.querySelector('[aria-hidden="true"]') as HTMLElement

    expect(panel.className).toContain('opacity-0')
    await user.click(trigger)
    expect(panel.className).toContain('opacity-100')
    await user.click(trigger)
    expect(panel.className).toContain('opacity-0')
  })

  it('Finding 5 — 세 번째 탭에 다시 열린다 (토글이 매번 반대로 뒤집힌다)', async () => {
    const user = userEvent.setup()
    render(<Term>PRD</Term>)
    const trigger = screen.getByText('PRD')
    const panel = document.querySelector('[aria-hidden="true"]') as HTMLElement

    await user.click(trigger)
    await user.click(trigger)
    expect(panel.className).toContain('opacity-0')
    await user.click(trigger)
    expect(panel.className).toContain('opacity-100')
  })
})
