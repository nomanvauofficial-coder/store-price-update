import path from 'path'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Portable SQLite URL:
 * - If DATABASE_URL env var is provided (e.g. on Vercel dashboard), use it.
 * - Otherwise fall back to <project-root>/db/custom.db so the app works
 *   on any machine / serverless platform (Vercel includes ./db via
 *   outputFileTracingIncludes in next.config.ts).
 */
function resolveDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL
  if (envUrl && !envUrl.includes('/home/z')) return envUrl
  return `file:${path.join(process.cwd(), 'db', 'custom.db')}`
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: resolveDatabaseUrl(),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
