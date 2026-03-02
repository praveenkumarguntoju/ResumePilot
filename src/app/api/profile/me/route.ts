import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [profile, user] = await Promise.all([
      prisma.profile.findUnique({
        where: { userId: session.user.id },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          rawResumeText: true,
          updatedAt: true,
        },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          profileImage: true,
          showImageOnProfile: true,
        },
      }),
    ])

    if (!profile) return NextResponse.json(null)

    return NextResponse.json({
      ...profile,
      profileImage: user?.profileImage || null,
      showImageOnProfile: user?.showImageOnProfile ?? true,
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}
