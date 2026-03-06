import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import OpenAI from 'openai'
import { z } from 'zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const reviewSchema = z.object({
  resumeText: z.string().min(50, 'Resume text must be at least 50 characters'),
  jobDescription: z.string().optional(),
})

export interface ReviewFeedback {
  overallRating: number
  weakBullets: string[]
  missingMetrics: string[]
  genericPhrasing: string[]
  improvements: string[]
  strengths: string[]
  jobDescriptionMatch?: {
    matchScore: number
    matchedSkills: string[]
    missingSkills: string[]
    recommendations: string[]
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { resumeText, jobDescription } = reviewSchema.parse(body)

    const systemPrompt = jobDescription
      ? `You are an experienced UK university career advisor. Review resumes against specific job descriptions to help graduates and early-career professionals improve their employability and job match. Be constructive but honest. Return JSON only.`
      : `You are an experienced UK university career advisor. Review resumes with a focus on helping graduates and early-career professionals improve their employability. Be constructive but honest. Return JSON only.`

    const userPrompt = jobDescription
      ? `Review this resume against the provided job description and provide structured feedback.

Resume:
${resumeText}

Job Description:
${jobDescription}

Analyse the resume and return ONLY valid JSON in this exact format:
{
  "overallRating": <number 1-10>,
  "weakBullets": ["<weak bullet point or section>"],
  "missingMetrics": ["<section missing quantification>"],
  "genericPhrasing": ["<generic phrase that could be more specific>"],
  "improvements": ["<actionable improvement suggestion>"],
  "strengths": ["<what the resume does well>"],
  "jobDescriptionMatch": {
    "matchScore": <percentage 0-100>,
    "matchedSkills": ["<skill from job description found in resume>"],
    "missingSkills": ["<required skill from job description not in resume>"],
    "recommendations": ["<specific action to improve match>"]
  }
}

Rules:
- Provide 3-5 items for each array
- Match score should reflect how well resume aligns with job requirements
- Extract actual skills/technologies from job description
- Identify both hard and soft skills
- Recommendations should be specific and actionable
- Use UK English`
      : `Review this resume thoroughly and provide structured feedback.

Resume:
${resumeText}

Analyse the resume and return ONLY valid JSON in this exact format:
{
  "overallRating": <number 1-10>,
  "weakBullets": ["<weak bullet point or section>"],
  "missingMetrics": ["<section missing quantification>"],
  "genericPhrasing": ["<generic phrase that could be more specific>"],
  "improvements": ["<actionable improvement suggestion>"],
  "strengths": ["<what the resume does well>"]
}

Rules:
- Provide 3-5 items for each array
- Be specific and actionable, not vague
- Use UK English`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.4,
      max_tokens: 2000,
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
