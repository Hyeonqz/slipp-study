import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PrepList } from '@/components/visuals/prep-list'
import { curriculum } from '@/content/data/curriculum'

/**
 * 이 컴포넌트의 유일한 로직은 "한 칸 밀어 짝짓기"다 — N회차 카드에 붙는
 * '만들어 갈 것'은 N회차의 deliverable이 아니라 **N-1회차**의 deliverable이다.
 * 한 칸 밀기가 어긋나면 팀원이 매주 틀린 숙제를 만들어 오게 되므로 여기가
 * 이 파일에서 유일하게 지킬 값어치가 있는 지점이다.
 */
describe('<PrepList />', () => {
  it('1회차는 만들어 갈 것이 없다', () => {
    render(<PrepList />)
    expect(screen.getByText(/준비물 없어요/)).toBeInTheDocument()
  })

  it('N회차 카드의 "만들어 갈 것"은 N-1회차의 deliverable이다', () => {
    render(<PrepList />)
    for (let i = 1; i < curriculum.length; i++) {
      expect(screen.getAllByText(curriculum[i - 1].deliverable).length).toBeGreaterThan(0)
    }
  })

  it('마지막 회차 deliverable("없음 — 뒤풀이")은 어느 카드에도 붙지 않는다 — 뒤에 회차가 없으므로', () => {
    render(<PrepList />)
    expect(screen.queryByText(curriculum[curriculum.length - 1].deliverable)).toBeNull()
  })

  it('회차 문서 안에만 있던 preread를 한 자리에 모아 보여준다', () => {
    render(<PrepList />)
    const allPreread = curriculum.flatMap((w) => w.preread ?? [])
    expect(allPreread.length).toBeGreaterThan(0)
    for (const p of allPreread) {
      expect(screen.getByText(p)).toBeInTheDocument()
    }
  })

  it('모든 회차가 자기 진행 문서로 링크된다', () => {
    const { container } = render(<PrepList />)
    // 접근 가능한 이름으로 찾지 않는다 — 회차 제목에 `+`가 들어 있어(`문제 정의 + PRD`)
    // 정규식 특수문자가 된다. href 자체가 이 테스트가 지키려는 값이므로 그걸 직접 본다.
    const hrefs = [...container.querySelectorAll('a')].map((a) => a.getAttribute('href'))
    expect(hrefs).toEqual(curriculum.map((w) => `/weeks/${w.slug}`))
  })
})
