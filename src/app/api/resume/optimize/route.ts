import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import { z } from 'zod'
import { generateResumeOptimizationPrompt } from '@/lib/resume-prompt-template'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const optimizeSchema = z.object({
  jobTitle: z.string().min(1),
  company: z.string().min(1),
  jobDescription: z.string().min(50),
  jobUrl: z.string().url().optional().or(z.literal('')).transform(val => val || undefined),
})

function calculateATSScore(resume: string, jobDescription: string): number {
  const jdLower = jobDescription.toLowerCase()
  const resumeLower = resume.toLowerCase()
  
  const keywords = jdLower
    .split(/\W+/)
    .filter(word => word.length > 3)
    .filter((word, index, self) => self.indexOf(word) === index)
  
  const matchedKeywords = keywords.filter(keyword => 
    resumeLower.includes(keyword)
  )
  
  const score = Math.round((matchedKeywords.length / keywords.length) * 100)
  return Math.min(score, 95)
}

function calculateKeywordMatch(resume: string, jobDescription: string): number {
  const jdWords = jobDescription.toLowerCase().split(/\W+/).filter(w => w.length > 3)
  const resumeWords = resume.toLowerCase().split(/\W+/).filter(w => w.length > 3)
  
  const uniqueJDWords = [...new Set(jdWords)]
  const matchCount = uniqueJDWords.filter(word => resumeWords.includes(word)).length
  
  return Math.round((matchCount / uniqueJDWords.length) * 100)
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { resumes: true },
    })

    if (user?.planType === 'free' && user.resumes.length >= 10) {
      return NextResponse.json(
        { error: 'Free plan limit reached. Upgrade to continue optimizing resumes.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { jobTitle, company, jobDescription, jobUrl } = optimizeSchema.parse(body)

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile?.rawResumeText) {
      return NextResponse.json(
        { error: 'No resume found. Please upload a resume first.' },
        { status: 400 }
      )
    }

    const prompt = generateResumeOptimizationPrompt({
      rawResumeText: profile.rawResumeText,
      jobTitle,
      company,
      jobDescription
    })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume optimization assistant. Return only the optimized resume text without any additional commentary.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const optimizedResume = completion.choices[0]?.message?.content || ''

    if (!optimizedResume) {
      throw new Error('Failed to generate optimized resume')
    }

    const atsScore = calculateATSScore(optimizedResume, jobDescription)
    const keywordMatch = calculateKeywordMatch(optimizedResume, jobDescription)

    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        jobTitle,
        company,
        jobDescription,
        jobUrl,
        tailoredResumeText: optimizedResume,
        atsScore,
        keywordMatch,
      },
    })

    return NextResponse.json({
      message: 'Resume optimized successfully',
      resumeId: resume.id,
      atsScore,
      keywordMatch,
    })
  } catch (error) {
    console.error('Resume optimization error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to optimize resume' },
      { status: 500 }
    )
  }
}
