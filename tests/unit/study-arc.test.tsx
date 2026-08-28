import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StudyArc } from '@/components/visuals/study-arc'
import { curriculum, weekLabel } from '@/content/data/curriculum'
import { STAGES } from '@/lib/stage'

/**
 * 조감도는 curriculum 에서 파생되므로, 회차가 바뀌거나 단계 배분이 달라져도
 * 화면이 따라가는지를 검사한다 — 하드코딩한 8개가 아니라 curriculum 을 기준으로
 * 단언해서, 커리큘럼만 고치고 이 컴포넌트를 안 고치는 회귀를 잡는다.
 */
describe('<StudyArc />', () => {
  it('curriculum 의 모든 회차를 빠짐없이 보여준다', () => {
    render(<StudyArc />)
    curriculum.forEach((w) => {
      expect(screen.getByText(weekLabel(w)), `${w.no}회차가 안 보임`).toBeInTheDocument()
    })
  })

  it('회차마다 headline 을 함께 보여준다', () => {
    render(<StudyArc />)
    curriculum.forEach((w) => {
      expect(screen.getByText(w.headline), `${w.no}회차 headline 이 안 보임`).toBeInTheDocument()
    })
  })

  it('세 단계를 이모지+라벨로 보여준다 — 색에만 의존하지 않는다', () => {
    render(<StudyArc />)
    Object.values(STAGES).forEach((s) => {
      expect(screen.getByText(new RegExp(s.emoji))).toBeInTheDocument()
      expect(screen.getByText(new RegExp(s.label))).toBeInTheDocument()
      expect(screen.getByText(s.range)).toBeInTheDocument()
    })
  })

  it('각 단계 밴드가 자기 회차만 담는다', () => {
    render(<StudyArc />)
    const lists = screen.getAllByRole('list')
    expect(lists).toHaveLength(Object.keys(STAGES).length)

    const counts = lists.map((ul) => ul.querySelectorAll('li').length)
    const expected = (['eye', 'hand', 'head'] as const).map(
      (k) => curriculum.filter((w) => w.stage === k).length,
    )
    expect(counts).toEqual(expected)
  })

  it('마지막 회차를 결승선으로 강조한다', () => {
    render(<StudyArc />)
    const last = curriculum[curriculum.length - 1]!
    const node = screen.getByText(weekLabel(last))
    expect(node.textContent).toContain('🏁')
    expect(node.getAttribute('style')).toContain('--blue-text')
  })

  it('결승선이 아닌 회차에는 깃발을 달지 않는다', () => {
    render(<StudyArc />)
    curriculum.slice(0, -1).forEach((w) => {
      expect(screen.getByText(weekLabel(w)).textContent).not.toContain('🏁')
    })
  })

  it('본문 720px 상한을 벗어나도록 fullbleed 를 단다', () => {
    const { container } = render(<StudyArc />)
    expect(container.querySelector('.fullbleed')).not.toBeNull()
  })
})
