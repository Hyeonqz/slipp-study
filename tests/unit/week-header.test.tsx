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

  it('place가 있는 회차는 장소를 배지로 보여준다', () => {
    render(<WeekHeader week={2} />)
    expect(screen.getByText('잠실 스터디룸')).toBeInTheDocument()
  })

  // 장소가 비어 있는 게 정상 상태다(홈의 기본 장소가 유효하다는 뜻). 빈 배지가
  // 뜨거나 `undefined`가 그대로 렌더되면 안 된다.
  it('place가 없는 회차는 장소 배지를 만들지 않는다', () => {
    const { container } = render(<WeekHeader week={1} />)
    expect(container.textContent).not.toContain('undefined')
    expect(container.querySelectorAll('span')).toHaveLength(3)
  })

  it('범위를 벗어난 회차에 대해 던진다', () => {
    expect(() => render(<WeekHeader week={99} />)).toThrow()
  })
})
