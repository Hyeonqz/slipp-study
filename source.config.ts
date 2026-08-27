import { defineDocs, defineConfig } from 'fumadocs-mdx/config'
import { pageSchema, metaSchema } from 'fumadocs-core/source/schema'
import { z } from 'zod'
import { ARCHIVE_TYPES } from './content/data/archive-types'

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema.extend({
      /** 회차 문서: 1~8 */
      week: z.number().int().min(1).max(8).optional(),
      /** 아카이브 제출물 전용 */
      author: z.string().optional(),
      type: z.enum(ARCHIVE_TYPES).optional(),
      date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
    }),
  },
  meta: { schema: metaSchema },
})

export default defineConfig()
