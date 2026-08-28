import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WeekHeader } from '@/components/ui/week-header'

describe('<WeekHeader />', () => {
  it('단계와 소요 시간을 배지로 보여준다', () => {
    render(<WeekHeader week={4} />)
    expect(screen.getByText(/손 — 기획 기법/)).toBeInTheDocument()
    expect(screen.getByText('2시간')).toBeInTheDocument()
  })

  it('회차 번호 배지는 두지 않는다 — 문서 제목이 이미 `N회차 — 제목`이라 중복이다', () => {
    render(<WeekHeader week={4} />)
    expect(screen.queryByText('4회차')).not.toBeInTheDocument()
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
