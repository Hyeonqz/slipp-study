import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fumadocsMdx } from 'fumadocs-mdx/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), fumadocsMdx()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, '.') },
  },
})
