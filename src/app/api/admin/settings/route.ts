import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'অনুমতি নেই।' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const updates: { key: string; value: string }[] = []

    if (typeof body?.shopName === 'string' && body.shopName.trim()) {
      updates.push({ key: 'shopName', value: body.shopName.trim() })
    }

    if (typeof body?.announcement === 'string') {
      updates.push({ key: 'announcement', value: body.announcement.trim() })
    }

    if (typeof body?.adminPassword === 'string' && body.adminPassword.trim()) {
      const newPassword = body.adminPassword.trim()
      if (newPassword.length < 4) {
        return NextResponse.json(
          { error: 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' },
          { status: 400 }
        )
      }
      updates.push({ key: 'adminPassword', value: newPassword })
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'কোনো পরিবর্তন নেই।' }, { status: 400 })
    }

    for (const u of updates) {
      await db.setting.upsert({
        where: { key: u.key },
        create: { key: u.key, value: u.value },
        update: { value: u.value },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('POST /api/admin/settings error:', error)
    return NextResponse.json({ error: 'সেটিংস সংরক্ষণ করতে সমস্যা হয়েছে।' }, { status: 500 })
  }
}
