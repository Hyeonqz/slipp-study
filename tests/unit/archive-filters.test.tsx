import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ArchiveFilters } from '@/components/archive/archive-filters'
import { ARCHIVE_TYPES } from '@/content/data/archive-types'
import type { Submission } from '@/lib/archive'

/**
 * Fix Wave finding 1: 종류별 필터 칩이 실제로 렌더되고, 회차별·작성자별 두 뷰
 * 모두에서 목록을 좁힌다. 필터링 결과가 0개일 때 빈 상태 문구("없어요")로
 * 읽혀야 하고, `groupByAuthor`가 빈 배열을 반환할 때 아무 것도 안 그리는
 * 기존 동작(components/archive/archive-filters.tsx L27)에 그대로 기대면
 * 화면이 빈 백지처럼 보이는 회귀가 나므로 이걸 직접 검증한다.
 */
const s = (overrides: Partial<Submission> = {}): Submission => ({
  url: '/archive/a',
  title: '당근마켓 역기획',
  week: 2,
  author: '홍길동',
  type: '역기획',
  date: '2026-09-15',
  ...overrides,
})

describe('<ArchiveFilters /> 종류별 필터', () => {
  it('전체 + 6종 타입 칩을 모두 렌더한다', () => {
    render(<ArchiveFilters submissions={[s()]} />)
    expect(screen.getByRole('button', { name: '전체' })).toBeInTheDocument()
    for (const t of ARCHIVE_TYPES) {
      expect(screen.getByRole('button', { name: t })).toBeInTheDocument()
    }
  })

  it('타입 칩을 고르면 다른 타입 제출물이 목록(회차별 뷰)에서 사라진다', async () => {
    const user = userEvent.setup()
    render(
      <ArchiveFilters
        submissions={[s({ url: '/archive/a', title: '역기획 글', type: '역기획' }), s({ url: '/archive/b', title: '인터뷰 글', type: '인터뷰' })]}
      />,
    )
    expect(screen.getByRole('link', { name: /인터뷰 글/ })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '인터뷰' }))
    expect(screen.queryByRole('link', { name: /역기획 글/ })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /인터뷰 글/ })).toBeInTheDocument()
  })

  it('아무도 제출하지 않은 타입으로 좁히면 "없어요" 빈 상태를 보여준다 (회차별 뷰)', async () => {
    const user = userEvent.setup()
    render(<ArchiveFilters submissions={[s({ type: '역기획' })]} />)
    await user.click(screen.getByRole('button', { name: '인터뷰' }))
    expect(screen.getByText(/인터뷰 제출물은 아직 없어요/)).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('아무도 제출하지 않은 타입으로 좁히면 "없어요" 빈 상태를 보여준다 (작성자별 뷰 — groupByAuthor가 빈 배열을 주는 경로)', async () => {
    const user = userEvent.setup()
    render(<ArchiveFilters submissions={[s({ type: '역기획' })]} />)
    await user.click(screen.getByRole('button', { name: '작성자별' }))
    await user.click(screen.getByRole('button', { name: '인터뷰' }))
    expect(screen.getByText(/인터뷰 제출물은 아직 없어요/)).toBeInTheDocument()
  })

  it('전체를 다시 고르면 필터가 풀리고 원래 목록이 돌아온다', async () => {
    const user = userEvent.setup()
    render(<ArchiveFilters submissions={[s({ title: '역기획 글', type: '역기획' })]} />)
    await user.click(screen.getByRole('button', { name: '인터뷰' }))
    expect(screen.getByText(/인터뷰 제출물은 아직 없어요/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '전체' }))
    expect(screen.queryByText(/인터뷰 제출물은 아직 없어요/)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /역기획 글/ })).toBeInTheDocument()
  })
})
