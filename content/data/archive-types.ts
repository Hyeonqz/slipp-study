/**
 * 아카이브 제출물 frontmatter `type` 값의 허용 목록.
 *
 * `source.config.ts`의 zod 스키마가 이 값으로 `type` enum을 만든다.
 * `source.config.ts`는 collection 정의만 export할 수 있어(fumadocs-mdx 제약),
 * 이 상수는 별도 파일에 두고 import해서 쓴다.
 */
export const ARCHIVE_TYPES = ['역기획', 'PRD', '인터뷰', '지표트리', '원페이저', '검증결과'] as const
