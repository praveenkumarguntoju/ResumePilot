import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const opportunitySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  link: z.string().url().optional().or(z.literal('')),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    if (session.user.universitySlug !== slug) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!['admin', 'advisor'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const university = await prisma.university.findUnique({
      where: { slug },
    })

    if (!university) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 })
    }

    const opportunities = await prisma.opportunity.findMany({
      where: { universityId: university.id },
      include: {
        _count: { select: { students: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(opportunities)
  } catch (error) {
    console.error('Opportunities list error:', error)
    return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    if (session.user.universitySlug !== slug) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!['admin', 'advisor'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Only admins and advisors can create opportunities' }, { status: 403 })
    }

    const university = await prisma.university.findUnique({
      where: { slug },
    })

    if (!university) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, link } = opportunitySchema.parse(body)

    // Create the opportunity
    const opportunity = await prisma.opportunity.create({
      data: {
        universityId: university.id,
        title,
        description: description || null,
        link: link || null,
        createdBy: session.user.id,
      },
    })

    // Notify all active, approved students in the university
    const students = await prisma.user.findMany({
      where: {
        universityId: university.id,
        role: 'student',
        isActive: true,
        isApproved: true,
      },
      select: { id: true },
    })

    if (students.length > 0) {
      await prisma.studentOpportunity.createMany({
        data: students.map((s) => ({
          studentId: s.id,
          opportunityId: opportunity.id,
        })),
      })
    }

    return NextResponse.json(
      { ...opportunity, notifiedStudents: students.length },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    console.error('Opportunity create error:', error)
    return NextResponse.json({ error: 'Failed to create opportunity' }, { status: 500 })
  }
}
