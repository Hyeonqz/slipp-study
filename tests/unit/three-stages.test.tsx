import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThreeStages } from '@/components/visuals/three-stages'

describe('<ThreeStages />', () => {
  it('세 단계를 모두 보여준다', () => {
    render(<ThreeStages />)
    expect(screen.getByText(/눈 — 역기획/)).toBeInTheDocument()
    expect(screen.getByText(/손 — 기획 기법/)).toBeInTheDocument()
    expect(screen.getByText(/머리 — 0→1 실전/)).toBeInTheDocument()
  })

  it('회차 범위를 표시한다', () => {
    render(<ThreeStages />)
    expect(screen.getByText('1~3회차')).toBeInTheDocument()
    expect(screen.getByText('7~8회차')).toBeInTheDocument()
  })

  it('요리 비유를 담는다', () => {
    render(<ThreeStages />)
    expect(screen.getByText(/레시피 추측/)).toBeInTheDocument()
  })

  it('단계별 결과 차이를 담는다', () => {
    render(<ThreeStages />)
    expect(screen.getByText(/분석은 잘하는데 문서는 못 쓰는/)).toBeInTheDocument()
  })
})
