import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { JourneyMap } from '@/components/visuals/journey-map'
import { curriculum } from '@/content/data/curriculum'

afterEach(() => vi.resetModules())

describe('<JourneyMap />', () => {
  it('8회차를 모두 링크로 그린다', () => {
    render(<JourneyMap />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(8)
    curriculum.forEach((w) => {
      expect(links.some((a) => a.getAttribute('href') === `/weeks/${w.slug}`)).toBe(true)
    })
  })

  it('각 칸에 하는 것과 만들어 올 것을 함께 보여준다', () => {
    render(<JourneyMap />)
    expect(screen.getByText(curriculum[0].title)).toBeInTheDocument()
    expect(screen.getByText(curriculum[0].deliverable)).toBeInTheDocument()
  })

  it('단계를 색이 아니라 이모지로도 구분한다', () => {
    render(<JourneyMap />)
    expect(screen.getAllByText('👀')).toHaveLength(3)
    expect(screen.getAllByText('✋')).toHaveLength(3)
    expect(screen.getAllByText('🧠')).toHaveLength(2)
  })

  it('currentWeek가 null이면 현재 위치 마커가 없다', () => {
    render(<JourneyMap />)
    expect(screen.queryByText('이번 주')).not.toBeInTheDocument()
  })

  /**
   * 정보 대조 (Task 10 결정 4) — 원본 표는 회차 / 단계 / 이번 시간에 하는 것
   * (headline) / 다음 시간까지 만들어 올 것(deliverable) 4열이었다. 브리프
   * 예시 코드는 title과 deliverable만 그리고 headline을 빠뜨린다. 표를 지우기
   * 전에 이 정보가 카드 안에서도 유지되는지 여기서 직접 검사한다.
   */
  it('표에서 빠지면 안 되는 headline(이번 시간에 하는 것)도 카드에 보여준다', () => {
    render(<JourneyMap />)
    expect(screen.getByText(curriculum[0].headline)).toBeInTheDocument()
  })

  it('단계를 이모지뿐 아니라 짧은 라벨(눈/손/머리)로도 보여준다', () => {
    render(<JourneyMap />)
    expect(screen.getAllByText('눈')).toHaveLength(3)
    expect(screen.getAllByText('손')).toHaveLength(3)
    expect(screen.getAllByText('머리')).toHaveLength(2)
  })
})

describe('<JourneyMap /> — 진행 중일 때', () => {
  it('currentWeek 칸에 이번 주 마커를 붙인다', async () => {
    vi.doMock('@/content/data/curriculum', async () => {
      const actual = await vi.importActual<typeof import('@/content/data/curriculum')>(
        '@/content/data/curriculum',
      )
      return { ...actual, currentWeek: 4 }
    })
    const { JourneyMap: Mapped } = await import('@/components/visuals/journey-map')
    render(<Mapped />)
    expect(screen.getByText('이번 주')).toBeInTheDocument()
  })
})

/**
 * Fix Round 1 — 리뷰 지적: 가로 스크롤 카드는 640px 프로즈 컬럼 안에서 8칸 중
 * 3.5칸만 보여 "산출물이 다음 회차 재료가 되는 사슬"을 드러낸다는 컴포넌트의
 * 존재 이유를 달성하지 못했다. 세로 타임라인 + 명시적 연결 문구로 재설계했다.
 * 이 사슬 표시 자체를 검사하는 테스트가 없었으므로 여기서 추가한다.
 */
describe('<JourneyMap /> — 회차 사이 사슬 연결', () => {
  it('회차 사이마다 산출물→다음 회차 재료 연결 문구를 보여준다 (8회차면 7개)', () => {
    render(<JourneyMap />)
    const connectors = screen.getAllByText(/^\d회차 산출물이 \d회차 재료가 돼요$/)
    expect(connectors).toHaveLength(curriculum.length - 1)
  })

  it('1회차 산출물이 2회차 재료가 된다는 연결을 명시한다', () => {
    render(<JourneyMap />)
    expect(screen.getByText('1회차 산출물이 2회차 재료가 돼요')).toBeInTheDocument()
  })

  it('마지막 회차 뒤에는 연결 문구가 없다', () => {
    render(<JourneyMap />)
    expect(screen.queryByText(/8회차 산출물이/)).not.toBeInTheDocument()
  })
})
