import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const scores = await prisma.interviewReadiness.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    return NextResponse.json(scores)
  } catch (error) {
    console.error('Fetch interview readiness error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interview readiness scores' },
      { status: 500 }
    )
  }
}
