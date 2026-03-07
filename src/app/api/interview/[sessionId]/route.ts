import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/interview/[sessionId] - Get specific interview session details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await params

    const interviewSession = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        questions: {
          include: { answer: true },
          orderBy: { orderIndex: 'asc' },
        },
        summary: true,
      },
    })

    if (!interviewSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Allow access for session owner or advisors
    const isOwner = interviewSession.userId === session.user.id
    const isAdvisor = session.user.role === 'advisor' || session.user.role === 'admin'

    if (!isOwner && !isAdvisor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({
      id: interviewSession.id,
      userId: interviewSession.userId,
      roleTitle: interviewSession.roleTitle,
      jobDescription: interviewSession.jobDescription,
      status: interviewSession.status,
      overallScore: interviewSession.overallScore,
      createdAt: interviewSession.createdAt,
      questions: interviewSession.questions.map((q: any) => ({
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        orderIndex: q.orderIndex,
        answer: q.answer
          ? {
              id: q.answer.id,
              answerText: q.answer.answerText,
              score: q.answer.score,
              strengths: q.answer.strengths,
              improvements: q.answer.improvements,
              createdAt: q.answer.createdAt,
            }
          : null,
      })),
      summary: interviewSession.summary
        ? {
            overallScore: interviewSession.summary.overallScore,
            strengths: interviewSession.summary.strengths
              ? JSON.parse(interviewSession.summary.strengths)
              : [],
            improvements: interviewSession.summary.improvements
              ? JSON.parse(interviewSession.summary.improvements)
              : [],
            recommendedPractice: interviewSession.summary.recommendedPractice
              ? JSON.parse(interviewSession.summary.recommendedPractice)
              : [],
            advisorComment: interviewSession.summary.advisorComment,
          }
        : null,
    })
  } catch (error) {
    console.error('Fetch session error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interview session' },
      { status: 500 }
    )
  }
}
