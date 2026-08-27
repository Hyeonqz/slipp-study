import type { Stage } from '@/content/data/curriculum'

/**
 * 회차 단계(eye/hand/head)의 표시 정보.
 *
 * emoji + label을 항상 함께 둔다 — 색각 이상 사용자와 흑백 인쇄를 고려해
 * 단계 구분을 색에만 의존하지 않기 위해서다.
 *
 * barVar/chipBgVar/chipFgVar는 app/global.css에 정의된 CSS 변수 이름이다.
 * 이 파일이 유일하게 이모지·라벨·색 변수 이름을 아는 곳이다.
 */
export interface StageMeta {
  key: Stage
  emoji: string
  label: string
  range: string
  barVar: string
  chipBgVar: string
  chipFgVar: string
}

export const STAGES: Record<Stage, StageMeta> = {
  eye: {
    key: 'eye', emoji: '👀', label: '눈 — 역기획', range: '1~3회차',
    barVar: 'var(--stage-eye-bar)',
    chipBgVar: 'var(--stage-eye-chip-bg)',
    chipFgVar: 'var(--stage-eye-chip-fg)',
  },
  hand: {
    key: 'hand', emoji: '✋', label: '손 — 기획 기법', range: '4~6회차',
    barVar: 'var(--stage-hand-bar)',
    chipBgVar: 'var(--stage-hand-chip-bg)',
    chipFgVar: 'var(--stage-hand-chip-fg)',
  },
  head: {
    key: 'head', emoji: '🧠', label: '머리 — 0→1 실전', range: '7~8회차',
    barVar: 'var(--stage-head-bar)',
    chipBgVar: 'var(--stage-head-chip-bg)',
    chipFgVar: 'var(--stage-head-chip-fg)',
  },
}

/**
 * 회차 번호(1~8)를 단계 표시 정보로 매핑한다.
 * 범위를 벗어난 회차 번호는 프로그래밍 오류이므로 던진다.
 */
export function stageOf(weekNo: number): StageMeta {
  if (weekNo >= 1 && weekNo <= 3) return STAGES.eye
  if (weekNo >= 4 && weekNo <= 6) return STAGES.hand
  if (weekNo >= 7 && weekNo <= 8) return STAGES.head
  throw new Error(`회차 번호가 1~8 범위를 벗어났습니다: ${weekNo}`)
}
