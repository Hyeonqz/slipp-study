import { describe, it, expect } from 'vitest'
import { STAGES, stageOf } from '@/lib/stage'

describe('stage', () => {
  it('회차 번호를 단계로 매핑한다', () => {
    expect(stageOf(1).key).toBe('eye')
    expect(stageOf(3).key).toBe('eye')
    expect(stageOf(4).key).toBe('hand')
    expect(stageOf(6).key).toBe('hand')
    expect(stageOf(7).key).toBe('head')
    expect(stageOf(8).key).toBe('head')
  })

  it('범위를 벗어난 회차에 대해 던진다', () => {
    expect(() => stageOf(0)).toThrow()
    expect(() => stageOf(9)).toThrow()
  })

  it('모든 단계가 이모지와 텍스트 라벨을 함께 갖는다 — 색에만 의존하지 않기 위해', () => {
    Object.values(STAGES).forEach((s) => {
      expect(s.emoji.length).toBeGreaterThan(0)
      expect(s.label.length).toBeGreaterThan(0)
    })
  })
})
