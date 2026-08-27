/**
 * 경고 배경은 하드코딩하지 않는다 — app/global.css의 --warn-bg 토큰을 쓴다.
 * 라이트/다크 값이 거기서 갈리므로 컴포넌트는 var(--warn-bg)만 참조한다.
 */
export function Callout({
  type = 'info',
  children,
}: {
  type?: 'info' | 'warn'
  children: React.ReactNode
}) {
  const warn = type === 'warn'
  return (
    <div
      role="note"
      style={{
        background: warn ? 'var(--warn-bg)' : 'var(--g50)',
        borderRadius: 'var(--r-card)',
        padding: '16px 18px',
        margin: '20px 0',
        color: warn ? 'var(--g800)' : 'var(--g700)',
        lineHeight: 1.75,
      }}
    >
      {children}
    </div>
  )
}
