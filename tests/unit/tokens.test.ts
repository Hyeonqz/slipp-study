import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

const css = readFileSync('app/global.css', 'utf-8')

describe('디자인 토큰', () => {
  const required = [
    '--g50: #F9FAFB', '--g100: #F2F4F6', '--g200: #E5E8EB', '--g300: #D1D6DB',
    '--g500: #8B95A1', '--g600: #6B7684', '--g700: #4E5968', '--g800: #333D4B',
    '--g900: #191F28', '--blue: #3182F6', '--blue-bg: #E8F3FF',
    '--red: #F04452', '--green: #15C26B',
    '--stage-eye-bar: #C6D8F5', '--stage-hand-bar: #C2E6D2', '--stage-head-bar: #F5D9C2',
  ]

  it.each(required)('%s 를 정의한다', (decl) => {
    expect(css).toContain(decl)
  })

  it('플레이스홀더가 남아 있지 않다', () => {
    expect(css).not.toContain('membered')
  })
})
