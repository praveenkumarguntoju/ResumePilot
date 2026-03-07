import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import { z } from 'zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const completeSchema = z.object({
  sessionId: z.string(),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId } = completeSchema.parse(body)

    // Get session with all questions and answers
    const interviewSession = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        questions: {
          include: { answer: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    if (!interviewSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (interviewSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (interviewSession.status === 'completed') {
      return NextResponse.json(
        { error: 'Session already completed' },
        { status: 400 }
      )
    }

    // Verify all questions are answered
    const unansweredQuestions = interviewSession.questions.filter(q => !q.answer)
    if (unansweredQuestions.length > 0) {
      return NextResponse.json(
        { error: `${unansweredQuestions.length} questions still unanswered` },
        { status: 400 }
      )
    }

    // Build Q&A history for summary
    const qaHistory = interviewSession.questions
      .map((q: any) => `Q: ${q.questionText}\nA: ${q.answer?.answerText}\nScore: ${q.answer?.score}/10`)
      .join('\n\n')

    // Generate overall summary using AI
    const summaryPrompt = `You are an expert interview coach. Summarize this candidate's mock interview performance.

Role: ${interviewSession.roleTitle}

Questions and Answers:
${qaHistory}

Provide a comprehensive summary with:
1. Overall performance assessment
2. Key strengths (3-5 points)
3. Areas for improvement (3-5 points)
4. Recommended practice topics

Return ONLY valid JSON in this exact format:
{
  "overallScore": <number 0-100>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "recommendedPractice": ["topic 1", "topic 2", "topic 3"]
}

Be constructive and specific. Overall score should reflect the average performance.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert interview coach. Provide comprehensive, actionable feedback. Return only valid JSON.',
        },
        {
          role: 'user',
          content: summaryPrompt,
        },
      ],
      temperature: 0.4,
      max_tokens: 800,
    })

    const content = completion.choices[0]?.message?.content || ''
    const jsonMatch = content.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Failed to generate summary' },
        { status: 500 }
      )
    }

    const summary = JSON.parse(jsonMatch[0]) as {
      overallScore: number
      strengths: string[]
      improvements: string[]
      recommendedPractice: string[]
    }

    // Calculate average score from individual answers
    const totalScore = interviewSession.questions.reduce(
      (sum: number, q: any) => sum + (q.answer?.score || 0),
      0
    )
    const averageScore = Math.round((totalScore / interviewSession.questions.length) * 10)

    // Use AI's overall score but cap it based on actual performance
    const finalScore = Math.min(summary.overallScore, averageScore)

    // Create summary and update session
    const [interviewSummary] = await prisma.$transaction([
      prisma.interviewSummary.create({
        data: {
          sessionId,
          overallScore: finalScore,
          strengths: JSON.stringify(summary.strengths),
          improvements: JSON.stringify(summary.improvements),
          recommendedPractice: JSON.stringify(summary.recommendedPractice),
        },
      }),
      prisma.interviewSession.update({
        where: { id: sessionId },
        data: {
          status: 'completed',
          overallScore: finalScore,
        },
      }),
    ])

    return NextResponse.json({
      sessionId,
      overallScore: finalScore,
      strengths: summary.strengths,
      improvements: summary.improvements,
      recommendedPractice: summary.recommendedPractice,
      totalQuestions: interviewSession.questions.length,
      averageQuestionScore: (totalScore / interviewSession.questions.length).toFixed(1),
    })
  } catch (error) {
    console.error('Interview completion error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to complete interview' },
      { status: 500 }
    )
  }
}
