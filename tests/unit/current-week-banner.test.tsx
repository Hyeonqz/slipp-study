import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CurrentWeekBanner } from '@/components/ui/current-week-banner'
import { curriculum, formatWeekDate } from '@/content/data/curriculum'

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
    // 날짜가 같은 줄에 붙어 텍스트 노드가 나뉘므로 textContent로 본다(정규식은
    // `(수)`의 괄호가 그룹이 돼서 안 맞는다). 날짜 값은 curriculum에서 가져온다 —
    // 일정이 밀려도 테스트가 깨지지 않게.
    expect(link.textContent).toContain('이번 주')
    const w4 = curriculum.find((w) => w.no === 4)!
    if (w4.date) expect(link.textContent).toContain(formatWeekDate(w4.date))
    expect(screen.getByText('4회차 · 문제 정의 + PRD')).toBeInTheDocument()
  })
})
