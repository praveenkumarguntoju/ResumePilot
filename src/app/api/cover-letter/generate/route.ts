import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import { z } from 'zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const generateSchema = z.object({
  resumeId: z.string(),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { resumeId } = generateSchema.parse(body)

    const resume = await prisma.resume.findUnique({
      where: {
        id: resumeId,
        userId: session.user.id,
      },
    })

    if (!resume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      )
    }

    if (!resume.jobDescription) {
      return NextResponse.json(
        { error: 'Job description is required to generate a cover letter' },
        { status: 400 }
      )
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })

    const prompt = `You are an expert cover letter writer.

Job Title: ${resume.jobTitle}
Company: ${resume.company}

Job Description:
${resume.jobDescription}

Optimized Resume:
${resume.tailoredResumeText}

Task: Write a compelling, professional cover letter for this job application. Follow these guidelines:
1. Address it to the hiring manager (use "Dear Hiring Manager" if name unknown)
2. Opening paragraph: Express enthusiasm and mention the specific role
3. Body paragraphs: Highlight 2-3 key qualifications that match the job requirements
4. Use specific examples from the resume
5. Show knowledge of the company and role
6. Closing: Express interest in an interview and thank them
7. Keep it concise (3-4 paragraphs, under 400 words)
8. Professional but personable tone
9. Use the candidate's experience from the resume

Return ONLY the cover letter text. Do not include any meta-commentary or explanations.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert cover letter writer. Return only the cover letter text without any additional commentary.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 800,
    })

    const coverLetter = completion.choices[0]?.message?.content || ''

    if (!coverLetter) {
      throw new Error('Failed to generate cover letter')
    }

    return NextResponse.json({
      coverLetter,
    })
  } catch (error) {
    console.error('Cover letter generation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to generate cover letter' },
      { status: 500 }
    )
  }
}
