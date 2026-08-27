import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ArchiveBoardView } from '@/components/archive/archive-board'

describe('<ArchiveBoardView />', () => {
  it('제출물이 0개면 빈 상태를 보여준다', () => {
    render(<ArchiveBoardView submissions={[]} />)
    expect(screen.getByText(/아직 제출물이 없어요/)).toBeInTheDocument()
  })

  it('빈 상태에서 올리는 법을 안내한다', () => {
    render(<ArchiveBoardView submissions={[]} />)
    expect(screen.getByRole('link', { name: /올리는 법/ })).toBeInTheDocument()
  })

  it('제출물을 회차별로 보여준다', () => {
    render(
      <ArchiveBoardView
        submissions={[
          { url: '/archive/a', title: '당근마켓 역기획', week: 2, author: '홍길동', type: '역기획', date: '2026-09-15' },
        ]}
      />,
    )
    expect(screen.getByRole('link', { name: /당근마켓 역기획/ })).toHaveAttribute('href', '/archive/a')
    expect(screen.getByText('홍길동')).toBeInTheDocument()
  })
})
