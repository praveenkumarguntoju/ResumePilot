import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import { z } from 'zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const createSchema = z.object({
  roleTitle: z.string().min(3, 'Role title must be at least 3 characters'),
  jobDescription: z.string().optional(),
  consentGiven: z.boolean(),
})

interface GeneratedQuestion {
  type: 'behavioural' | 'technical' | 'resume_based' | 'scenario'
  question: string
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { roleTitle, jobDescription, consentGiven } = createSchema.parse(body)

    if (!consentGiven) {
      return NextResponse.json(
        { error: 'Consent is required to proceed with mock interview' },
        { status: 400 }
      )
    }

    // Get user's resume
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { rawResumeText: true },
    })

    if (!profile?.rawResumeText) {
      return NextResponse.json(
        { error: 'Please create a resume before starting a mock interview' },
        { status: 400 }
      )
    }

    // Generate interview questions using AI
    const prompt = jobDescription
      ? `You are an expert interview coach preparing a candidate for a job interview.

Candidate Resume:
${profile.rawResumeText}

Job Description:
${jobDescription}

Role Title: ${roleTitle}

Generate exactly 5 interview questions tailored to this role and candidate's background.

Mix the following types:
- 2 behavioural questions (STAR method)
- 1 resume-based question (about their specific experience)
- 1 scenario/problem-solving question
- 1 technical question (if applicable to role)

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {"type": "behavioural", "question": "Tell me about a time when..."},
    {"type": "resume_based", "question": "I see you worked on X project..."},
    {"type": "scenario", "question": "How would you handle..."},
    {"type": "technical", "question": "Explain..."},
    {"type": "behavioural", "question": "Describe a situation..."}
  ]
}

Make questions realistic, relevant, and challenging but fair.`
      : `You are an expert interview coach preparing a candidate for a job interview.

Candidate Resume:
${profile.rawResumeText}

Role Title: ${roleTitle}

Generate exactly 5 interview questions tailored to this role and candidate's background.

Mix the following types:
- 2 behavioural questions (STAR method)
- 1 resume-based question (about their specific experience)
- 1 scenario/problem-solving question
- 1 technical question (if applicable to role)

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {"type": "behavioural", "question": "Tell me about a time when..."},
    {"type": "resume_based", "question": "I see you worked on X project..."},
    {"type": "scenario", "question": "How would you handle..."},
    {"type": "technical", "question": "Explain..."},
    {"type": "behavioural", "question": "Describe a situation..."}
  ]
}

Make questions realistic, relevant, and challenging but fair.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert interview coach. Generate realistic interview questions. Return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const content = completion.choices[0]?.message?.content || ''
    const jsonMatch = content.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Failed to generate interview questions' },
        { status: 500 }
      )
    }

    const { questions } = JSON.parse(jsonMatch[0]) as { questions: GeneratedQuestion[] }

    if (!questions || questions.length !== 5) {
      return NextResponse.json(
        { error: 'Invalid number of questions generated' },
        { status: 500 }
      )
    }

    // Create interview session with questions
    const interviewSession = await prisma.interviewSession.create({
      data: {
        userId: session.user.id,
        roleTitle,
        jobDescription: jobDescription || null,
        consentGiven,
        status: 'in_progress',
        questions: {
          create: questions.map((q: GeneratedQuestion, index: number) => ({
            questionText: q.question,
            questionType: q.type,
            orderIndex: index + 1,
          })),
        },
      },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    return NextResponse.json({
      sessionId: interviewSession.id,
      roleTitle: interviewSession.roleTitle,
      totalQuestions: interviewSession.questions.length,
      questions: interviewSession.questions.map((q: any) => ({
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        orderIndex: q.orderIndex,
      })),
    })
  } catch (error) {
    console.error('Interview creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create interview session' },
      { status: 500 }
    )
  }
}
