import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/university/[slug]/students/[studentId]/interviews
// Advisors can view student interview sessions
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; studentId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only advisors and admins can access this endpoint
    if (session.user.role !== 'advisor' && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { studentId } = await params

    // Fetch all interview sessions for the student
    const sessions = await prisma.interviewSession.findMany({
      where: { userId: studentId },
      include: {
        questions: {
          include: { answer: true },
          orderBy: { orderIndex: 'asc' },
        },
        summary: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(
      sessions.map((s: any) => ({
        id: s.id,
        roleTitle: s.roleTitle,
        status: s.status,
        overallScore: s.overallScore,
        totalQuestions: s.questions.length,
        answeredQuestions: s.questions.filter((q: any) => q.answer).length,
        createdAt: s.createdAt,
        summary: s.summary
          ? {
              strengths: s.summary.strengths ? JSON.parse(s.summary.strengths) : [],
              improvements: s.summary.improvements ? JSON.parse(s.summary.improvements) : [],
              recommendedPractice: s.summary.recommendedPractice
                ? JSON.parse(s.summary.recommendedPractice)
                : [],
              advisorComment: s.summary.advisorComment,
            }
          : null,
      }))
    )
  } catch (error) {
    console.error('Fetch student interviews error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch student interview sessions' },
      { status: 500 }
    )
  }
}
