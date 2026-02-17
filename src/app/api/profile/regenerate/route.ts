import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const regenerateSchema = z.object({
  slug: z.string(),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { slug } = regenerateSchema.parse(body)

    const existingProfile = await prisma.publicProfile.findUnique({
      where: { slug, userId: session.user.id },
    })

    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Parse resume to extract skills and experience with improved logic
    const lines = existingProfile.resumeText.split('\n')
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
        // Skip section headers
        if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
          continue
        }
        
        // Skip the word "Skills" itself
        if (lower === 'skills' || lower === 'technical skills' || lower === 'key skills') {
          continue
        }
        
        // Handle bullet points with skills after colon
        if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
          const skillLine = trimmed.substring(1).trim()
          // Check if there's a colon (e.g., "- **Web Technologies:** React, Node.js")
          if (skillLine.includes(':')) {
            const parts = skillLine.split(':')
            if (parts.length > 1) {
              // Extract individual skills after the colon
              const skillsList = parts[1]
                .split(/[,;]/)
                .map((s: string) => s.trim().replace(/\*\*/g, '').replace(/[()]/g, ''))
                .filter((s: string) => s.length > 2 && !s.includes('**'))
              skills.push(...skillsList)
            }
          } else {
            // Single skill on the line
            const skill = skillLine.replace(/\*\*/g, '').replace(/[()]/g, '').trim()
            if (skill && skill.length > 2) skills.push(skill)
          }
        } else if (!trimmed.includes('**')) {
          // Handle comma-separated skills on a single line without bullets
          const skillsList = trimmed
            .split(/[,;]/)
            .map((s: string) => s.trim().replace(/\*\*/g, '').replace(/[()]/g, ''))
            .filter((s: string) => s.length > 2)
          skills.push(...skillsList)
        }
      }
      
      if (inExperience && trimmed.includes('**') && !lower.includes('experience')) {
        if (currentExp) {
          experience.push(currentExp)
        }
        currentExp = {
          company: existingProfile.name,
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

    // Clean up and deduplicate skills
    skills = [...new Set(skills)]
      .filter(skill => skill && skill.length > 2 && skill !== '--')
      .map(skill => skill.trim())
      .slice(0, 20) // Limit to 20 skills

    // Ensure we have at least some data
    if (skills.length === 0) {
      skills = ['Full Stack Development', 'Problem Solving', 'Team Collaboration']
    }
    
    if (experience.length === 0) {
      experience = [{
        company: existingProfile.name,
        role: existingProfile.headline,
        summary: 'Experienced professional with strong technical skills'
      }]
    }

    // Update the profile with regenerated data
    const updatedProfile = await prisma.publicProfile.update({
      where: { slug },
      data: {
        skills: JSON.stringify(skills),
        experience: JSON.stringify(experience),
      },
    })

    return NextResponse.json({
      message: 'Profile regenerated successfully',
      skills,
      experience,
    })
  } catch (error) {
    console.error('Regenerate profile error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to regenerate profile' },
      { status: 500 }
    )
  }
}
