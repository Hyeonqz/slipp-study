import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { curriculum } from '@/content/data/curriculum'

const DIR = 'content/docs/weeks'

describe('회차 문서', () => {
  it('curriculum의 slug마다 mdx 파일이 하나씩 있다', () => {
    curriculum.forEach((w) => {
      expect(existsSync(`${DIR}/${w.slug}.mdx`), `${w.slug}.mdx 없음`).toBe(true)
    })
  })

  it('weeks 폴더에 curriculum에 없는 mdx가 없다', () => {
    const files = readdirSync(DIR).filter((f) => f.endsWith('.mdx'))
    const known = new Set(curriculum.map((w) => `${w.slug}.mdx`))
    files.forEach((f) => expect(known.has(f), `${f}는 curriculum에 없음`).toBe(true))
  })

  it('각 문서 frontmatter의 week가 curriculum과 일치한다', () => {
    curriculum.forEach((w) => {
      const raw = readFileSync(`${DIR}/${w.slug}.mdx`, 'utf-8')
      const m = raw.match(/^---\n([\s\S]*?)\n---/)
      expect(m, `${w.slug}: frontmatter 없음`).not.toBeNull()
      expect(m![1]).toContain(`week: ${w.no}`)
    })
  })

  it('이전/다음 링크 푸터가 남아 있지 않다 — Fumadocs가 자동 생성한다', () => {
    curriculum.forEach((w) => {
      const raw = readFileSync(`${DIR}/${w.slug}.mdx`, 'utf-8')
      expect(raw, `${w.slug}: 수동 이전/다음 링크 발견`).not.toMatch(/\*\*\[← 이전/)
    })
  })
})
