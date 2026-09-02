import { describe, it, expect } from 'vitest'
import { curriculum, currentWeek, formatWeekDate } from '@/content/data/curriculum'

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

/**
 * 날짜는 진행자가 손으로 채우는 값이라 오타가 나기 쉽고, 오타가 나면 화면에
 * `NaN월 NaN일`이 뜬다. 형식 검사와 포맷 결과를 여기서 잠근다.
 */
describe('회차 날짜', () => {
  it('date가 있으면 YYYY-MM-DD 형식이다', () => {
    curriculum.forEach((w) => {
      if (w.date !== undefined) expect(w.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  it('date를 채운 회차는 회차 순서대로 날짜도 앞선다', () => {
    const dated = curriculum.filter((w) => w.date !== undefined).map((w) => w.date as string)
    expect([...dated].sort()).toEqual(dated)
  })

  it('place는 채웠으면 빈 문자열이 아니다', () => {
    curriculum.forEach((w) => {
      if (w.place !== undefined) expect(w.place.trim()).not.toBe('')
    })
  })

  it('`9월 2일 (수)` 형태로 포맷한다', () => {
    expect(formatWeekDate('2026-09-02')).toBe('9월 2일 (수)')
  })

  it('UTC로 읽는다 — 로컬 게터를 쓰면 UTC보다 뒤진 타임존에서 하루 밀린다', () => {
    expect(formatWeekDate('2026-01-01')).toBe('1월 1일 (목)')
  })

  it('형식이 깨진 날짜는 조용히 NaN을 렌더하지 않고 던진다', () => {
    expect(() => formatWeekDate('2026-13-99')).toThrow()
  })
})
