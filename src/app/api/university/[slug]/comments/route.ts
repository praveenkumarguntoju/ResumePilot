import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const commentSchema = z.object({
  studentId: z.string().min(1),
  commentText: z.string().min(1),
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

    const url = new URL(request.url)
    const studentId = url.searchParams.get('studentId')

    // Students can only see their own comments
    if (session.user.role === 'student') {
      const comments = await prisma.resumeComment.findMany({
        where: { studentId: session.user.id },
        include: {
          advisor: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(comments)
    }

    // Advisors/admins can see comments for a specific student
    if (!['advisor', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const where: { advisorId?: string; studentId?: string } = {}
    if (studentId) where.studentId = studentId
    if (session.user.role === 'advisor') where.advisorId = session.user.id

    const comments = await prisma.resumeComment.findMany({
      where,
      include: {
        advisor: { select: { name: true, email: true } },
        student: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Comments fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
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

    if (!['advisor', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Only advisors can add comments' }, { status: 403 })
    }

    const body = await request.json()
    const { studentId, commentText } = commentSchema.parse(body)

    // Verify student belongs to same university
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: { university: true },
    })

    if (!student || student.university?.slug !== slug) {
      return NextResponse.json({ error: 'Student not found in this university' }, { status: 404 })
    }

    const comment = await prisma.resumeComment.create({
      data: {
        studentId,
        advisorId: session.user.id,
        commentText,
      },
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    console.error('Comment create error:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
