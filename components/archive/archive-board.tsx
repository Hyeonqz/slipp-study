import Link from 'next/link'
import type { Submission } from '@/lib/archive'
import { collectSubmissions } from '@/lib/archive-source'
import { ArchiveFilters } from './archive-filters'

/**
 * 데이터 수집(서버)과 렌더링(순수)을 분리해 테스트 가능하게 한다.
 *
 * 역할 분담(브리프 상단 결정 2):
 *  - `ArchiveBoardView`는 제출물이 0개면 빈 상태를 렌더하고 끝난다. 0개가 아니면
 *    `<ArchiveFilters />` 하나만 렌더한다 — 회차별/작성자별 두 뷰 모두 그 안에서
 *    소유한다. `byAuthor` 필터 상태를 부모(`ArchiveBoardView`)가 모르는 채로
 *    회차별 목록을 여기서 렌더해버리면, 작성자별 보기를 켜도 회차별 목록이
 *    같이 남는 문제가 생긴다 — 그래서 두 뷰 전체를 `ArchiveFilters`가 갖는다.
 *  - `ArchiveBoard()`는 `archive-source`에서 실제 문서를 수집해 `ArchiveBoardView`에
 *    넘기기만 하는 서버 컴포넌트다.
 */
export function ArchiveBoardView({ submissions }: { submissions: Submission[] }) {
  if (submissions.length === 0) {
    return (
      <div
        style={{
          background: 'var(--g50)',
          borderRadius: 'var(--r-card)',
          padding: '32px 24px',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--g900)', margin: 0 }}>
          아직 제출물이 없어요
        </p>
        <p style={{ fontSize: 14, color: 'var(--g600)', margin: '8px 0 16px' }}>
          첫 번째로 올려보세요.
        </p>
        <Link href="/archive#how-to-upload" style={{ fontSize: 14, color: 'var(--blue-text)' }}>
          올리는 법 보기 →
        </Link>
      </div>
    )
  }

  return <ArchiveFilters submissions={submissions} />
}

export function ArchiveBoard() {
  return <ArchiveBoardView submissions={collectSubmissions()} />
}
