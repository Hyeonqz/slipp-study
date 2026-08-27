import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WhyStudy } from '@/components/visuals/why-study'
import { why } from '@/content/data/why'

describe('<WhyStudy />', () => {
  it('3칸을 그린다', () => {
    render(<WhyStudy />)
    expect(screen.getByText('겪은 문제')).toBeInTheDocument()
    expect(screen.getByText('그래서 내린 진단')).toBeInTheDocument()
    expect(screen.getByText('그래서 이렇게 설계했다')).toBeInTheDocument()
  })

  it('첫 칸은 채워져 있다', () => {
    expect(why[0].draft).toBeFalsy()
    expect(why[0].body.length).toBeGreaterThan(0)
  })

  it('세 칸 모두 내용이 채워져 있다 — why에는 draft가 없다', () => {
    why.forEach((c) => {
      expect(c.draft, `${c.label}이 draft 상태`).toBeFalsy()
      expect(c.body.length).toBeGreaterThan(0)
    })
  })

  it('draft 칸 수만큼만 작성 예정이 뜬다 (지금은 0개)', () => {
    render(<WhyStudy />)
    expect(screen.queryAllByText('작성 예정')).toHaveLength(why.filter((c) => c.draft).length)
  })

  it('진단과 설계 결정 내용이 화면에 나온다', () => {
    render(<WhyStudy />)
    expect(screen.getByText(/만들 줄 아는 게 오히려 함정/)).toBeInTheDocument()
    expect(screen.getByText(/시장 분석 → 프로덕트·서비스 기획/)).toBeInTheDocument()
  })

  it('빈 본문으로도 레이아웃이 깨지지 않는다 — 각 칸이 항상 렌더링된다', () => {
    render(<WhyStudy />)
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })
})
