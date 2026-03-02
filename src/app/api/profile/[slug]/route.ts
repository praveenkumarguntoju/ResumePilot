import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const profile = await prisma.publicProfile.findUnique({
      where: { slug, isActive: true },
      include: {
        user: {
          select: {
            profileImage: true,
            showImageOnProfile: true,
          }
        }
      }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { user, ...profileData } = profile
    return NextResponse.json({
      ...profileData,
      profileImage: user?.showImageOnProfile ? user?.profileImage : null,
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}
