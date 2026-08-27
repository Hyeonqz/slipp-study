import { lookup } from '@/content/data/glossary'

export function Term({ children }: { children: string }) {
  const entry = lookup(children)
  if (!entry) {
    throw new Error(
      `<Term>${children}</Term> — content/data/glossary.ts 에 '${children}' 항목이 없습니다`,
    )
  }
  return (
    <span
      tabIndex={0}
      aria-label={`${entry.term}: ${entry.definition}`}
      title={entry.definition}
      style={{
        borderBottom: '1.5px dotted var(--g500)',
        cursor: 'help',
        outlineColor: 'var(--blue)',
      }}
    >
      {children}
    </span>
  )
}
