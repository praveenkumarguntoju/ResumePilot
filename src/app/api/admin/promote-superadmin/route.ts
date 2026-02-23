import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * One-time setup endpoint to promote an existing user to superadmin.
 * Protected by a secret token from environment variables.
 * 
 * Usage: POST /api/admin/promote-superadmin
 * Body: { "email": "your@email.com", "secret": "YOUR_SUPERADMIN_SECRET" }
 * 
 * Set SUPERADMIN_SECRET in your .env.local file.
 */
export async function POST(request: Request) {
  try {
    const { email, secret } = await request.json()

    const expectedSecret = process.env.SUPERADMIN_SECRET
    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 403 })
    }

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await prisma.user.update({
      where: { email },
      data: { role: 'superadmin', isApproved: true },
    })

    return NextResponse.json({ message: `User ${email} promoted to superadmin` })
  } catch (error) {
    console.error('Promote superadmin error:', error)
    return NextResponse.json({ error: 'Failed to promote user' }, { status: 500 })
  }
}
