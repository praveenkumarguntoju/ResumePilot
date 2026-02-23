import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  universitySlug: z.string().min(1),
  role: z.enum(['student', 'advisor']).default('student'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, universitySlug, role } = signupSchema.parse(body)

    // Find university
    const university = await prisma.university.findUnique({
      where: { slug: universitySlug },
    })

    if (!university || !university.isActive) {
      return NextResponse.json(
        { error: 'University not found or inactive' },
        { status: 404 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)

    // Students need approval, advisors need admin approval
    const isApproved = false

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        planType: 'university',
        role,
        universityId: university.id,
        isApproved,
      },
    })

    await prisma.profile.create({
      data: {
        userId: user.id,
      },
    })

    return NextResponse.json(
      {
        message: 'Registration submitted. Awaiting admin approval.',
        userId: user.id,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('University signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
