import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TwoHourBlock, BLOCKS } from '@/components/visuals/two-hour-block'

describe('<TwoHourBlock />', () => {
  it('블록 시간 합이 120분이다', () => {
    expect(BLOCKS.reduce((s, b) => s + b.minutes, 0)).toBe(120)
  })

  it('네 블록을 모두 보여준다', () => {
    render(<TwoHourBlock />)
    expect(screen.getByText('체크인')).toBeInTheDocument()
    expect(screen.getByText(/반박 타임/)).toBeInTheDocument()
    expect(screen.getByText(/다음 회차 정하기/)).toBeInTheDocument()
  })

  it('반박 타임 하나만 강조 블록이다', () => {
    expect(BLOCKS.filter((b) => b.hero)).toHaveLength(1)
    expect(BLOCKS.find((b) => b.hero)!.label).toContain('반박')
  })

  it('각 블록의 분을 표시한다', () => {
    render(<TwoHourBlock />)
    expect(screen.getByText('40분')).toBeInTheDocument()
  })
})
