import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const scores = await prisma.interviewReadiness.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    return NextResponse.json(scores)
  } catch (error) {
    console.error('Fetch interview readiness error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interview readiness scores' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 })
    }

    // Verify the assessment belongs to the user
    const assessment = await prisma.interviewReadiness.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    // Delete the assessment
    await prisma.interviewReadiness.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: 'Assessment deleted successfully' })
  } catch (error) {
    console.error('Delete interview readiness error:', error)
    return NextResponse.json(
      { error: 'Failed to delete assessment' },
      { status: 500 }
    )
  }
}
