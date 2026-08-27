import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'
import { Glossary } from '@/components/ui/glossary'
import { Term } from '@/components/ui/term'

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Glossary,
    Term,
    ...components,
  } satisfies MDXComponents
}
