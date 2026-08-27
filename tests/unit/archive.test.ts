import { describe, it, expect } from 'vitest'
import { groupByWeek, groupByAuthor, type Submission } from '@/lib/archive'

const s = (week: number, author: string, title: string): Submission => ({
  url: `/archive/${title}`, title, week, author, type: '역기획', date: '2026-09-15',
})

describe('groupByWeek', () => {
  it('1~8회차를 전부 반환한다 — 제출물이 없는 회차도', () => {
    const groups = groupByWeek([s(2, '홍길동', 'a')])
    expect(groups).toHaveLength(8)
    expect(groups[0].items).toEqual([])
    expect(groups[1].items).toHaveLength(1)
  })

  it('회차 오름차순으로 정렬한다', () => {
    const groups = groupByWeek([s(5, 'A', 'a'), s(2, 'B', 'b')])
    expect(groups.map((g) => g.week)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('제출물이 하나도 없으면 8개 빈 그룹을 준다', () => {
    expect(groupByWeek([])).toHaveLength(8)
    expect(groupByWeek([]).every((g) => g.items.length === 0)).toBe(true)
  })
})

describe('groupByAuthor', () => {
  it('작성자별로 묶는다', () => {
    const groups = groupByAuthor([s(1, '홍길동', 'a'), s(2, '홍길동', 'b'), s(1, '김철수', 'c')])
    expect(groups).toHaveLength(2)
    expect(groups.find((g) => g.author === '홍길동')!.items).toHaveLength(2)
  })

  it('작성자를 가나다순으로 정렬한다', () => {
    const groups = groupByAuthor([s(1, '홍길동', 'a'), s(1, '김철수', 'b')])
    expect(groups.map((g) => g.author)).toEqual(['김철수', '홍길동'])
  })

  it('제출물이 없으면 빈 배열이다', () => {
    expect(groupByAuthor([])).toEqual([])
  })
})
