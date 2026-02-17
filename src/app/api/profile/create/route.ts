import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createProfileSchema = z.object({
  resumeId: z.string(),
  name: z.string().min(1),
  headline: z.string().min(1),
  location: z.string().optional(),
})

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + Math.random().toString(36).substring(2, 8)
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { resumeId, name, headline, location } = createProfileSchema.parse(body)

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

    // Parse resume to extract skills and experience
    const lines = resume.tailoredResumeText.split('\n')
    let skills: string[] = []
    let experience: { company: string; role: string; summary: string }[] = []
    
    let inSkills = false
    let inExperience = false
    let currentExp: any = null
    
    for (const line of lines) {
      const trimmed = line.trim()
      const lower = trimmed.toLowerCase()
      
      if (lower.includes('technical skills') || lower.includes('key skills') || lower === 'skills') {
        inSkills = true
        inExperience = false
        continue
      }
      
      if (lower.includes('professional experience') || lower.includes('work history')) {
        inSkills = false
        inExperience = true
        continue
      }
      
      if (lower.includes('experience') && !inSkills) {
        inSkills = false
        inExperience = true
        continue
      }
      
      // Parse skills - handle both bullet points and items after colons
      if (inSkills && trimmed) {
        // Skip category headers with **
        if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
          continue
        }
        
        // Handle bullet points with skills after colon
        if (trimmed.startsWith('-')) {
          const skillLine = trimmed.substring(1).trim()
          // Check if there's a colon (e.g., "- **Web Technologies:** React, Node.js")
          if (skillLine.includes(':')) {
            const parts = skillLine.split(':')
            if (parts.length > 1) {
              // Extract individual skills after the colon
              const skillsList = parts[1].split(',').map((s: string) => s.trim().replace(/\*\*/g, ''))
              skills.push(...skillsList.filter((s: string) => s.length > 0))
            }
          } else {
            // Single skill on the line
            const skill = skillLine.replace(/\*\*/g, '').trim()
            if (skill) skills.push(skill)
          }
        }
      }
      
      if (inExperience && trimmed.includes('**') && !lower.includes('experience')) {
        if (currentExp) {
          experience.push(currentExp)
        }
        currentExp = {
          company: resume.company,
          role: trimmed.replace(/\*\*/g, ''),
          summary: ''
        }
      } else if (inExperience && currentExp && trimmed && !trimmed.startsWith('-')) {
        currentExp.summary += trimmed + ' '
      }
    }
    
    if (currentExp) {
      experience.push(currentExp)
    }

    // Ensure we have at least some data
    if (skills.length === 0) {
      skills = ['Full Stack Development', 'Problem Solving', 'Team Collaboration']
    }
    
    if (experience.length === 0) {
      experience = [{
        company: resume.company,
        role: resume.jobTitle,
        summary: 'Experienced professional with strong technical skills'
      }]
    }

    const slug = generateSlug(name)

    const publicProfile = await prisma.publicProfile.create({
      data: {
        userId: session.user.id,
        slug,
        name,
        headline,
        location: location || '',
        resumeText: resume.tailoredResumeText,
        skills: JSON.stringify(skills),
        experience: JSON.stringify(experience),
      },
    })

    return NextResponse.json({
      message: 'Public profile created successfully',
      slug: publicProfile.slug,
      url: `/p/${publicProfile.slug}`,
    })
  } catch (error) {
    console.error('Create profile error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    // Return detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error('Detailed error:', {
      message: errorMessage,
      stack: errorStack,
      error
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to create public profile',
        details: errorMessage,
        debug: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    )
  }
}
