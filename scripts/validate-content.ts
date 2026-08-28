import fg from 'fast-glob'
import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import { curriculum } from '../content/data/curriculum'
import { glossary } from '../content/data/glossary'
import {
  checkCurriculumSlugs,
  checkArchiveFrontmatter,
  checkTerms,
  checkInternalLinks,
  docPathToUrl,
  parseFrontmatter,
  type Issue,
} from '../lib/validators'

async function main() {
  const files = await fg('content/docs/**/*.mdx')
  const urls = new Set(files.map(docPathToUrl))
  const knownTerms = new Set(glossary.map((g) => g.term))
  const issues: Issue[] = []

  const weekSlugs = files
    .filter((f) => f.startsWith('content/docs/weeks/'))
    .map((f) => basename(f, '.mdx'))
  issues.push(...checkCurriculumSlugs(weekSlugs, curriculum.map((w) => w.slug)))

  for (const file of files) {
    const parsed = parseFrontmatter(file, readFileSync(file, 'utf-8'))
    if ('issue' in parsed) {
      issues.push(parsed.issue)
      continue
    }
    const { data, content } = parsed

    if (file.startsWith('content/docs/archive/') && basename(file) !== 'index.mdx') {
      issues.push(...checkArchiveFrontmatter(file, data))
    }
    issues.push(...checkTerms(file, content, knownTerms))
    issues.push(...checkInternalLinks(file, content, urls))
  }

  if (issues.length > 0) {
    console.error(`\n콘텐츠 검증 실패 — ${issues.length}건\n`)
    for (const i of issues) console.error(`  ${i.file}\n    ${i.message}`)
    console.error('')
    process.exit(1)
  }
  console.log(`콘텐츠 검증 통과 — 문서 ${files.length}개`)
}

main().catch((err) => {
  console.error('콘텐츠 검증 스크립트가 예기치 못한 오류로 중단됐습니다.')
  console.error(err)
  process.exit(1)
})
