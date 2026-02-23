import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { consentGiven: true, consentAt: true },
    })

    return NextResponse.json({
      consentGiven: user?.consentGiven ?? false,
      consentAt: user?.consentAt ?? null,
    })
  } catch (error) {
    console.error('Consent fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch consent' }, { status: 500 })
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

    const body = await request.json()
    const { consent } = body as { consent: boolean }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        consentGiven: consent,
        consentAt: consent ? new Date() : null,
      },
    })

    return NextResponse.json({
      consentGiven: updated.consentGiven,
      consentAt: updated.consentAt,
    })
  } catch (error) {
    console.error('Consent update error:', error)
    return NextResponse.json({ error: 'Failed to update consent' }, { status: 500 })
  }
}
