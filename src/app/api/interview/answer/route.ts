import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import { z } from 'zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const answerSchema = z.object({
  questionId: z.string(),
  answerText: z.string().min(10, 'Answer must be at least 10 characters'),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { questionId, answerText } = answerSchema.parse(body)

    // Get question and verify ownership
    const question = await prisma.interviewQuestion.findUnique({
      where: { id: questionId },
      include: {
        session: true,
      },
    })

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    if (question.session.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (question.session.status === 'completed') {
      return NextResponse.json(
        { error: 'Interview session is already completed' },
        { status: 400 }
      )
    }

    // Evaluate answer using AI
    const evaluationPrompt = `You are an expert interview evaluator. Evaluate this candidate's answer.

Question: ${question.questionText}
Question Type: ${question.questionType}

Candidate's Answer:
${answerText}

Evaluate the answer on:
- Clarity and structure
- Relevance to the question
- Depth and detail
- Use of examples/specifics
- Overall quality

Return ONLY valid JSON in this exact format:
{
  "score": <number 0-10>,
  "strengths": "<what the candidate did well>",
  "improvements": "<specific suggestions for improvement>"
}

Be constructive but honest. Score fairly based on the quality of the answer.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert interview evaluator. Provide fair, constructive feedback. Return only valid JSON.',
        },
        {
          role: 'user',
          content: evaluationPrompt,
        },
      ],
      temperature: 0.4,
      max_tokens: 500,
    })

    const content = completion.choices[0]?.message?.content || ''
    const jsonMatch = content.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Failed to evaluate answer' },
        { status: 500 }
      )
    }

    const evaluation = JSON.parse(jsonMatch[0]) as {
      score: number
      strengths: string
      improvements: string
    }

    // Save answer with evaluation
    const answer = await prisma.interviewAnswer.create({
      data: {
        questionId,
        answerText,
        score: Math.min(10, Math.max(0, evaluation.score)),
        feedback: `Strengths: ${evaluation.strengths}\n\nImprovements: ${evaluation.improvements}`,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
      },
    })

    // Check if this was the last question
    const allQuestions = await prisma.interviewQuestion.findMany({
      where: { sessionId: question.sessionId },
      include: { answer: true },
    })

    const allAnswered = allQuestions.every(q => q.answer !== null)

    return NextResponse.json({
      answerId: answer.id,
      score: answer.score,
      strengths: answer.strengths,
      improvements: answer.improvements,
      allAnswered,
      totalQuestions: allQuestions.length,
      answeredCount: allQuestions.filter(q => q.answer !== null).length,
    })
  } catch (error) {
    console.error('Answer submission error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    )
  }
}
