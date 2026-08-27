import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { source } from '@/lib/source'
import { curriculum } from '@/content/data/curriculum'
import type { Folder, Item } from 'fumadocs-core/page-tree'

/**
 * 사이드바 구조(6개 meta.json)가 실제로 만들어내는 페이지 트리를 검증한다.
 *
 * `source.getPageTree()`를 직접 assert한다 — meta.json 텍스트를 다시 읽는 테스트는
 * "파일이 그렇게 써 있다"만 증명하고 "Fumadocs가 의도대로 트리를 만들었다"는 증명하지
 * 못한다.
 *
 * Task 12가 `content/docs/archive/index.mdx`와 예시 제출물
 * (`w02-example-reverse.mdx`)을 추가하면서 이 파일의 예전 전제("아카이브 그룹은
 * 지금 시점엔 비어 있다")가 깨졌다 — 이제 `source`에 실제 제출물 문서가 존재한다.
 * 그래서 아카이브 케이스도 다른 그룹과 동일하게 빌드된 트리에서 직접 검증한다:
 * `archive/meta.json`의 `pages: ["index"]`가 실제로 `getPageTree()`에도 반영돼
 * "아카이브 그룹의 자식은 index 하나뿐"이라는 걸 보장하는지 — 즉 제출물이 쌓여도
 * 사이드바로 새어나가지 않는지가 이 테스트의 핵심이다. meta.json 텍스트 검사도
 * 남겨서, 트리 검사가 실패하기 전에 "설정 자체가 잘못됐다"는 신호를 먼저 준다.
 */

const GROUP_TITLES = ['시작하기', '진행 방식', '회차', '양식 · 예시', '아카이브']

function isFolder(node: unknown): node is Folder {
  return !!node && typeof node === 'object' && (node as Folder).type === 'folder'
}

describe('사이드바 구조', () => {
  const tree = source.getPageTree()

  it('루트 children의 첫 항목은 인덱스 페이지, 그다음이 5개 그룹 폴더다', () => {
    expect(tree.children).toHaveLength(6)
    expect(tree.children[0]!.type).toBe('page')

    const folders = tree.children.slice(1)
    folders.forEach((node) => expect(isFolder(node)).toBe(true))
  })

  it('그룹 제목이 브리프 순서(시작하기 → 진행 방식 → 회차 → 양식 · 예시 → 아카이브) 그대로다', () => {
    const groupTitles = tree.children.slice(1).map((node) => (node as Folder).name)
    expect(groupTitles).toEqual(GROUP_TITLES)
  })

  it('"회차" 그룹이 curriculum의 8개 회차를 순서대로 담고 있다', () => {
    const weeksFolder = tree.children.find(
      (node) => isFolder(node) && node.name === '회차',
    ) as Folder

    expect(weeksFolder).toBeDefined()
    expect(weeksFolder.children).toHaveLength(8)

    const items = weeksFolder.children as Item[]
    items.forEach((item) => expect(item.type).toBe('page'))

    expect(items.map((item) => item.name)).toEqual(curriculum.map((w) => w.title))
    expect(items.map((item) => item.url)).toEqual(curriculum.map((w) => `/weeks/${w.slug}`))
  })

  it('"아카이브" 그룹의 자식은 정확히 index 페이지 하나뿐이다 — 제출물(w02-example-reverse 등)이 실제로 있어도 사이드바로 새어나가지 않는다', () => {
    const archiveFolder = tree.children.find(
      (node) => isFolder(node) && node.name === '아카이브',
    ) as Folder

    expect(archiveFolder).toBeDefined()
    expect(archiveFolder.children).toHaveLength(1)

    const [only] = archiveFolder.children as Item[]
    expect(only.type).toBe('page')
    expect(only.url).toBe('/archive')
  })

  it('archive/meta.json의 pages는 정확히 ["index"]다 — 제출물이 쌓여도 사이드바에 안 새어나가게 하는 장치', () => {
    const raw = readFileSync('content/docs/archive/meta.json', 'utf-8')
    const parsed = JSON.parse(raw) as { pages?: string[] }
    expect(parsed.pages).toEqual(['index'])
  })
})
