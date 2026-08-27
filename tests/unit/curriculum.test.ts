import { describe, it, expect } from 'vitest'
import { curriculum, currentWeek } from '@/content/data/curriculum'

describe('curriculum', () => {
  it('8회차를 갖는다', () => {
    expect(curriculum).toHaveLength(8)
  })

  it('회차 번호가 1~8 연속이다', () => {
    expect(curriculum.map((w) => w.no)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('단계가 1~3=eye, 4~6=hand, 7~8=head 이다', () => {
    expect(curriculum.map((w) => w.stage)).toEqual([
      'eye', 'eye', 'eye', 'hand', 'hand', 'hand', 'head', 'head',
    ])
  })

  it('slug가 유일하고 NN-이름 형식이다', () => {
    const slugs = curriculum.map((w) => w.slug)
    expect(new Set(slugs).size).toBe(8)
    slugs.forEach((s) => expect(s).toMatch(/^0[1-8]-[a-z0-9-]+$/))
  })

  it('모든 회차에 headline과 deliverable이 있다', () => {
    curriculum.forEach((w) => {
      expect(w.headline.length).toBeGreaterThan(0)
      expect(w.deliverable.length).toBeGreaterThan(0)
    })
  })

  it('currentWeek는 null이거나 1~8이다', () => {
    if (currentWeek !== null) {
      expect(currentWeek).toBeGreaterThanOrEqual(1)
      expect(currentWeek).toBeLessThanOrEqual(8)
    }
  })
})
