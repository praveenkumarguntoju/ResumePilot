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

    // Only advisors and admins can list students
    if (!['advisor', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Verify user belongs to this university
    if (session.user.universitySlug !== slug) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const university = await prisma.university.findUnique({
      where: { slug },
    })

    if (!university) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 })
    }

    const students = await prisma.user.findMany({
      where: {
        universityId: university.id,
        role: 'student',
        isActive: true,
      },
      include: {
        profile: { select: { rawResumeText: true } },
        interviewReadiness: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { overallScore: true, targetRole: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const result = students.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      isApproved: s.isApproved,
      readinessScore: s.interviewReadiness[0]?.overallScore ?? null,
      targetRole: s.interviewReadiness[0]?.targetRole ?? null,
      hasResume: !!s.profile?.rawResumeText,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Students list error:', error)
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
}
