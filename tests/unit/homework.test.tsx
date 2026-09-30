import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Homework } from '@/components/ui/homework'
import { curriculum } from '@/content/data/curriculum'

describe('<Homework />', () => {
  it('다음 회차 숙제를 curriculum에서 가져온다', () => {
    render(<Homework week={4} />)
    expect(screen.getByText(/5주차 숙제/)).toBeInTheDocument()
    expect(screen.getByText(curriculum.find((w) => w.no === 4)!.deliverable)).toBeInTheDocument()
  })

  it('마지막 회차는 숙제가 없다고 알린다', () => {
    render(<Homework week={8} />)
    expect(screen.getByText(/없어요/)).toBeInTheDocument()
  })
})
