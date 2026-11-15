import crypto from 'crypto'
import { cookies } from 'next/headers'

export const ADMIN_COOKIE = 'mudi_admin_session'
const SECRET = process.env.ADMIN_SECRET ?? 'mudi-ghor-local-shop-secret-2026'
const TTL_MS = 7 * 24 * 3600 * 1000 // 7 days

export function createToken(ttlMs = TTL_MS): string {
  const exp = Date.now() + ttlMs
  const sig = crypto.createHmac('sha256', SECRET).update(String(exp)).digest('hex')
  return `${exp}.${sig}`
}

export function verifyToken(token?: string | null): boolean {
  if (!token) return false
  const [expStr, sig] = token.split('.')
  if (!expStr || !sig) return false
  const exp = Number(expStr)
  if (!Number.isFinite(exp) || exp < Date.now()) return false
  const expected = crypto.createHmac('sha256', SECRET).update(expStr).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  } catch {
    return false
  }
}

/** Check admin session from request cookies (server side) */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies()
  return verifyToken(store.get(ADMIN_COOKIE)?.value)
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: TTL_MS / 1000,
}
