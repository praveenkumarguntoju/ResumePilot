import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getOpenAI } from '@/lib/openai'
import { z } from 'zod'

const generateBriefSchema = z.object({
  resumeId: z.string(),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { resumeId } = generateBriefSchema.parse(body)

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

    const openai = getOpenAI()
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional resume writer. Generate a concise, compelling 2-3 sentence professional brief/summary from the provided resume. 

The brief should:
- Highlight key expertise and years of experience
- Mention 2-3 most impressive achievements or skills using qualitative descriptions
- Be written in first person (use "I" and "my")
- Be engaging and professional
- Be suitable for a public profile page
- Focus on impact and outcomes rather than specific metrics or percentages
- Use descriptive language like "significantly improved", "successfully delivered", "enhanced", "optimized", "streamlined" instead of numbers

Keep it under 100 words.`
        },
        {
          role: 'user',
          content: `Generate a professional brief from this resume:\n\n${resume.tailoredResumeText}`
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
    })

    const shortBrief = completion.choices[0]?.message?.content?.trim() || ''

    if (!shortBrief) {
      throw new Error('Failed to generate brief')
    }

    return NextResponse.json({
      message: 'Brief generated successfully',
      shortBrief,
    })
  } catch (error) {
    console.error('Generate brief error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to generate brief' },
      { status: 500 }
    )
  }
}
