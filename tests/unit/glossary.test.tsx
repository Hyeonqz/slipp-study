import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { glossary, lookup } from '@/content/data/glossary'
import { Glossary } from '@/components/ui/glossary'
import { Term } from '@/components/ui/term'

describe('glossary 데이터', () => {
  it('README 2장의 용어를 모두 담는다', () => {
    const required = ['역기획', 'BM', 'PRD', '지표', 'North Star 지표', '퍼널',
      '전환율', '리텐션', 'MVP', 'PMF', 'CAC', 'LTV', '유닛 이코노믹스',
      'RICE', '피벗', 'eval', '환각']
    const terms = new Set(glossary.map((g) => g.term))
    required.forEach((t) => expect(terms.has(t), `'${t}' 누락`).toBe(true))
  })

  it('용어가 중복되지 않는다', () => {
    expect(new Set(glossary.map((g) => g.term)).size).toBe(glossary.length)
  })

  it('lookup이 항목을 찾는다', () => {
    expect(lookup('PRD')?.definition).toContain('Product Requirements')
    expect(lookup('없는용어')).toBeUndefined()
  })
})

describe('<Glossary />', () => {
  it('모든 용어를 렌더링한다', () => {
    render(<Glossary />)
    expect(screen.getByText('역기획')).toBeInTheDocument()
    expect(screen.getByText('PMF')).toBeInTheDocument()
  })

  it('검색어로 목록을 좁힌다', async () => {
    render(<Glossary />)
    await userEvent.type(screen.getByRole('searchbox'), '리텐션')
    expect(screen.getByText('리텐션')).toBeInTheDocument()
    expect(screen.queryByText('피벗')).not.toBeInTheDocument()
  })

  it('결과가 없으면 빈 상태를 보여준다', async () => {
    render(<Glossary />)
    await userEvent.type(screen.getByRole('searchbox'), 'zzzz')
    expect(screen.getByText(/찾는 용어가 없어요/)).toBeInTheDocument()
  })
})

describe('<Term />', () => {
  it('용어와 정의를 접근 가능하게 노출한다', () => {
    render(<Term>PRD</Term>)
    const el = screen.getByText('PRD')
    expect(el).toHaveAttribute('aria-label', expect.stringContaining('Product Requirements'))
  })

  it('사전에 없는 용어에 대해 던진다 — 빌드 때 잡히게', () => {
    expect(() => render(<Term>없는용어</Term>)).toThrow()
  })
})
