import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CurrentWeekBanner } from '@/components/ui/current-week-banner'

afterEach(() => vi.resetModules())

describe('<CurrentWeekBanner />', () => {
  it('currentWeek가 null이면 아무것도 그리지 않는다', () => {
    const { container } = render(<CurrentWeekBanner />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('<CurrentWeekBanner /> — 진행 중일 때', () => {
  it('currentWeek 회차로 이동하는 배너를 그린다', async () => {
    vi.doMock('@/content/data/curriculum', async () => {
      const actual = await vi.importActual<typeof import('@/content/data/curriculum')>(
        '@/content/data/curriculum',
      )
      return { ...actual, currentWeek: 4 }
    })
    const { CurrentWeekBanner: Banner } = await import('@/components/ui/current-week-banner')
    render(<Banner />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/weeks/04-prd')
    expect(screen.getByText('이번 주')).toBeInTheDocument()
    expect(screen.getByText('4회차 · 문제 정의 + PRD')).toBeInTheDocument()
  })
})
