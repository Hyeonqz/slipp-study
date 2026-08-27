import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
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

  // 이름이 틀리면(예: --stage-eye-brr) 화면에서 조용히 투명하게 렌더링될 뿐 아무 테스트도
  // 안 깨진다 — 브리프가 경고한 실패 모드. 여기서 리터럴 문자열로 고정한다.
  it('각 단계의 CSS 변수 이름이 정확히 --stage-*-{bar,chip-bg,chip-fg} 형태다', () => {
    expect(STAGES.eye.barVar).toBe('var(--stage-eye-bar)')
    expect(STAGES.eye.chipBgVar).toBe('var(--stage-eye-chip-bg)')
    expect(STAGES.eye.chipFgVar).toBe('var(--stage-eye-chip-fg)')

    expect(STAGES.hand.barVar).toBe('var(--stage-hand-bar)')
    expect(STAGES.hand.chipBgVar).toBe('var(--stage-hand-chip-bg)')
    expect(STAGES.hand.chipFgVar).toBe('var(--stage-hand-chip-fg)')

    expect(STAGES.head.barVar).toBe('var(--stage-head-bar)')
    expect(STAGES.head.chipBgVar).toBe('var(--stage-head-chip-bg)')
    expect(STAGES.head.chipFgVar).toBe('var(--stage-head-chip-fg)')
  })

  // 리터럴 문자열 일치만으로는 "양쪽에서 똑같이 틀렸거나, CSS에서 나중에 지워진" 경우를
  // 못 잡는다. app/global.css를 직접 읽어 STAGES가 참조하는 이름이 실제로 정의돼 있는지 본다.
  it('STAGES가 참조하는 모든 CSS 변수가 app/global.css에 정의돼 있다', () => {
    const css = readFileSync('app/global.css', 'utf-8')
    const varNames = Object.values(STAGES).flatMap((s) => [s.barVar, s.chipBgVar, s.chipFgVar])

    varNames.forEach((ref) => {
      const name = ref.match(/^var\((--[a-z0-9-]+)\)$/)?.[1]
      expect(name, `${ref}가 var(--x) 형식이 아니다`).toBeTruthy()
      expect(css, `${name}가 app/global.css에 정의돼 있지 않다`).toMatch(
        new RegExp(`${name}\\s*:`)
      )
    })
  })
})
