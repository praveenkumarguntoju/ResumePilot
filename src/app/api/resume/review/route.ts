import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import OpenAI from 'openai'
import { z } from 'zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const reviewSchema = z.object({
  resumeText: z.string().min(50, 'Resume text must be at least 50 characters'),
})

export interface ReviewFeedback {
  overallRating: number
  weakBullets: { text: string; issue: string; suggestion: string }[]
  missingMetrics: { section: string; suggestion: string }[]
  genericPhrasing: { text: string; betterVersion: string }[]
  improvements: string[]
  strengths: string[]
  summary: string
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { resumeText } = reviewSchema.parse(body)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an experienced UK university career advisor. Review resumes with a focus on helping graduates and early-career professionals improve their employability. Be constructive but honest. Return JSON only.`,
        },
        {
          role: 'user',
          content: `Review this resume thoroughly and provide structured feedback.

Resume:
${resumeText}

Analyse the resume and return ONLY valid JSON in this exact format:
{
  "overallRating": <number 1-10>,
  "weakBullets": [
    {
      "text": "<exact weak bullet point from resume>",
      "issue": "<what's wrong with it>",
      "suggestion": "<improved version>"
    }
  ],
  "missingMetrics": [
    {
      "section": "<section name e.g. Experience, Projects>",
      "suggestion": "<what metrics or quantification to add>"
    }
  ],
  "genericPhrasing": [
    {
      "text": "<generic phrase found>",
      "betterVersion": "<more specific, impactful version>"
    }
  ],
  "improvements": [
    "<actionable improvement suggestion>"
  ],
  "strengths": [
    "<what the resume does well>"
  ],
  "summary": "<2-3 sentence overall assessment>"
}

Rules:
- Find at least 3 weak bullets if they exist
- Identify at least 2 sections missing quantification
- Flag at least 3 generic phrases
- Provide at least 3 improvement suggestions
- Acknowledge at least 2 strengths
- Use UK English
- Be specific and actionable, not vague`,
        },
      ],
      temperature: 0.4,
      max_tokens: 1500,
    })

    const content = completion.choices[0]?.message?.content || ''
    const jsonMatch = content.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Failed to parse AI review' },
        { status: 500 }
      )
    }

    const feedback: ReviewFeedback = JSON.parse(jsonMatch[0])

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('Resume review error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to review resume' },
      { status: 500 }
    )
  }
}
