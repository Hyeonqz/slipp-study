import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Roadmap } from '@/components/visuals/roadmap'
import { roadmap } from '@/content/data/roadmap'

describe('<Roadmap />', () => {
  it('현재 시점 마일스톤이 정확히 하나다', () => {
    expect(roadmap.filter((m) => m.current)).toHaveLength(1)
  })

  it('결승선 마일스톤이 정확히 하나다 — 8주 스터디의 도착점', () => {
    expect(roadmap.filter((m) => m.finish)).toHaveLength(1)
  })

  it('현재 시점과 결승선은 서로 다른 항목이다', () => {
    const [current] = roadmap.filter((m) => m.current)
    const [finish] = roadmap.filter((m) => m.finish)
    expect(current!.when).not.toBe(finish!.when)
  })

  it('첫 마일스톤은 8주 스터디이고 채워져 있다', () => {
    expect(roadmap[0]!.current).toBe(true)
    expect(roadmap[0]!.draft).toBeFalsy()
    expect(roadmap[0]!.what.length).toBeGreaterThan(0)
  })

  it('결승선이 AI로 만든 제안 발표라는 걸 본문에 담고 있다', () => {
    const [finish] = roadmap.filter((m) => m.finish)
    expect(`${finish!.what} ${finish!.detail ?? ''}`).toMatch(/AI/)
  })

  it('모든 마일스톤을 렌더링한다', () => {
    render(<Roadmap />)
    expect(screen.getAllByRole('listitem')).toHaveLength(roadmap.length)
  })

  it('미작성 마일스톤을 작성 예정으로 표시한다', () => {
    render(<Roadmap />)
    expect(screen.queryAllByText('작성 예정')).toHaveLength(roadmap.filter((m) => m.draft).length)
  })

  it('채워진 마일스톤의 detail 을 화면에 낸다', () => {
    render(<Roadmap />)
    const withDetail = roadmap.filter((m) => !m.draft && m.detail)
    expect(withDetail.length).toBeGreaterThan(0)
    withDetail.forEach((m) => {
      expect(screen.getByText(m.detail!), `${m.when}: detail 이 안 보임`).toBeInTheDocument()
    })
  })

  it('본문 720px 상한을 벗어나도록 fullbleed 를 단다', () => {
    const { container } = render(<Roadmap />)
    expect(container.querySelector('ul')!.className).toContain('fullbleed')
  })
})
