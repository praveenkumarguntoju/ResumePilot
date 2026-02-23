import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { calculateInterviewReadiness } from '@/lib/interview-readiness'

const calculateSchema = z.object({
  resumeId: z.string().min(1).optional(),
  targetRole: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { resumeId, targetRole } = calculateSchema.parse(body)

    // Get resume text - either from specific resume or raw profile
    let resumeText: string | null = null

    if (resumeId) {
      const resume = await prisma.resume.findUnique({
        where: { id: resumeId, userId: session.user.id },
      })
      if (!resume) {
        return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
      }
      resumeText = resume.tailoredResumeText
    } else {
      const profile = await prisma.profile.findUnique({
        where: { userId: session.user.id },
      })
      if (!profile?.rawResumeText) {
        return NextResponse.json(
          { error: 'No resume found. Please upload a resume first.' },
          { status: 400 }
        )
      }
      resumeText = profile.rawResumeText
    }

    // Calculate all scores
    const result = await calculateInterviewReadiness(resumeText, targetRole)

    // Save to database
    const readiness = await prisma.interviewReadiness.create({
      data: {
        userId: session.user.id,
        resumeId: resumeId || null,
        targetRole,
        resumeQualityScore: result.resumeQualityScore,
        skillMatchScore: result.skillMatchScore,
        experienceScore: result.experienceScore,
        marketDemandScore: result.marketDemandScore,
        overallScore: result.overallScore,
        missingSkills: JSON.stringify(result.missingSkills),
        weakAreas: JSON.stringify(result.weakAreas),
        suggestions: JSON.stringify(result.suggestions),
        resumeQualityDetail: result.resumeQualityDetail,
      },
    })

    return NextResponse.json({
      id: readiness.id,
      ...result,
    })
  } catch (error) {
    console.error('Interview readiness calculation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to calculate interview readiness' },
      { status: 500 }
    )
  }
}
