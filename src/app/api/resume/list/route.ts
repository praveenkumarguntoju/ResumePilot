import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resumes = await prisma.resume.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        jobTitle: true,
        company: true,
        atsScore: true,
        keywordMatch: true,
        createdAt: true,
      },
    })

    return NextResponse.json(resumes)
  } catch (error) {
    console.error('List resumes error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resumes' },
      { status: 500 }
    )
  }
}
