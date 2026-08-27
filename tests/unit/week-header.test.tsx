import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WeekHeader } from '@/components/ui/week-header'

describe('<WeekHeader />', () => {
  it('회차 번호와 단계를 배지로 보여준다', () => {
    render(<WeekHeader week={4} />)
    expect(screen.getByText('4회차')).toBeInTheDocument()
    expect(screen.getByText(/손 — 기획 기법/)).toBeInTheDocument()
  })

  it('단계를 색이 아니라 이모지+라벨로도 전달한다', () => {
    render(<WeekHeader week={1} />)
    expect(screen.getByText(/👀/)).toBeInTheDocument()
    expect(screen.getByText(/눈 — 역기획/)).toBeInTheDocument()
  })

  it('범위를 벗어난 회차에 대해 던진다', () => {
    expect(() => render(<WeekHeader week={99} />)).toThrow()
  })
})
