import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/interview/sessions - Get all interview sessions for current user
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sessions = await prisma.interviewSession.findMany({
      where: { userId: session.user.id },
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
    console.error('Fetch sessions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interview sessions' },
      { status: 500 }
    )
  }
}
