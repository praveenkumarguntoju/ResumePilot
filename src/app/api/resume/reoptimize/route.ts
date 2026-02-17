import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import { z } from 'zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const reoptimizeSchema = z.object({
  resumeId: z.string().min(1),
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

    const body = await request.json()
    const { resumeId } = reoptimizeSchema.parse(body)

    const existingResume = await prisma.resume.findUnique({
      where: {
        id: resumeId,
        userId: session.user.id,
      },
    })

    if (!existingResume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      )
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile?.rawResumeText) {
      return NextResponse.json(
        { error: 'No original resume found. Please upload a resume first.' },
        { status: 400 }
      )
    }

    const prompt = `You are an expert resume writer and ATS optimization specialist. 

Original Resume:
${profile.rawResumeText}

Job Title: ${existingResume.jobTitle}
Company: ${existingResume.company}
Job Description:
${existingResume.jobDescription}

Task: Create a NEW optimized version of this resume for the same job posting. This is a re-optimization, so provide a DIFFERENT approach than before while still following these guidelines:
1. Tailor the resume to match the job requirements and keywords
2. Highlight relevant experience and skills from the original resume
3. Use action verbs and quantifiable achievements
4. Ensure ATS compatibility (simple formatting, relevant keywords)
5. Keep the same structure but optimize content differently
6. Do NOT fabricate experience - only enhance what's already there
7. Match the tone and language used in the job description
8. Try different phrasing and emphasis compared to previous versions

Return ONLY the optimized resume text, formatted professionally. Do not include any explanations or meta-commentary.`

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
      temperature: 0.8,
      max_tokens: 2000,
    })

    const optimizedResume = completion.choices[0]?.message?.content || ''

    if (!optimizedResume) {
      throw new Error('Failed to generate optimized resume')
    }

    if (!existingResume.jobDescription) {
      return NextResponse.json(
        { error: 'Job description is required for re-optimization' },
        { status: 400 }
      )
    }

    const atsScore = calculateATSScore(optimizedResume, existingResume.jobDescription)
    const keywordMatch = calculateKeywordMatch(optimizedResume, existingResume.jobDescription)

    const updatedResume = await prisma.resume.update({
      where: { id: resumeId },
      data: {
        tailoredResumeText: optimizedResume,
        atsScore,
        keywordMatch,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Resume re-optimized successfully',
      resumeId: updatedResume.id,
      atsScore,
      keywordMatch,
    })
  } catch (error) {
    console.error('Resume re-optimization error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to re-optimize resume' },
      { status: 500 }
    )
  }
}
