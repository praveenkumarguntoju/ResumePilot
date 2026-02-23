import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    if (session.user.universitySlug !== slug) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const opportunities = await prisma.studentOpportunity.findMany({
      where: { studentId: session.user.id },
      include: {
        opportunity: {
          select: { title: true, description: true, link: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(opportunities)
  } catch (error) {
    console.error('Student opportunities error:', error)
    return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 })
  }
}
