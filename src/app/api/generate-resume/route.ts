import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getOpenAI } from '@/lib/openai'
import { z } from 'zod'

const generateResumeSchema = z.object({
  userType: z.enum(['student', 'career-change']),
  education: z.object({
    degree: z.string(),
    field: z.string(),
    university: z.string(),
    gradYear: z.string(),
    grade: z.string().optional(),
    modules: z.array(z.string()).optional(),
  }),
  experience: z.array(z.object({
    role: z.string(),
    company: z.string(),
    duration: z.string(),
    description: z.string(),
    type: z.enum(['internship', 'part-time', 'volunteer', 'freelance']),
  })).optional(),
  projects: z.array(z.object({
    name: z.string(),
    tools: z.array(z.string()),
    problem: z.string(),
    contribution: z.string(),
  })).optional(),
  skills: z.object({
    technical: z.array(z.string()),
    soft: z.array(z.string()),
    languages: z.array(z.string()),
    certifications: z.array(z.string()).optional(),
  }),
  targetRole: z.object({
    role: z.string(),
    location: z.string().optional(),
    industry: z.string().optional(),
  }),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const formData = generateResumeSchema.parse(body)

    const openai = getOpenAI()

    const prompt = `You are a UK career advisor specializing in graduate and entry-level resumes.

Create a professional, ATS-friendly resume for this candidate.

Candidate Profile:
${JSON.stringify(formData, null, 2)}

CRITICAL RULES:
- Do NOT exaggerate or fabricate experience
- Do NOT use placeholder text like "Your Name" or "markdown" - extract the actual name from the candidate's education/profile data
- Do NOT include empty sections (e.g., if no certifications, omit the Certifications section entirely)
- Do NOT add placeholder text like "None at this time" for empty sections - just omit the section
- Make it ATS-friendly with clear sections and keywords
- Use strong action verbs (developed, implemented, designed, led, created)
- Keep it concise - aim for 1 page
- If experience is limited, emphasize projects and education
- Align the professional summary with the target role: ${formData.targetRole.role}
- Use UK English spelling and formatting
- Include relevant keywords from the target role and industry
- For projects, focus on technical skills and measurable outcomes
- Quantify achievements where possible (but don't make up numbers)

STRUCTURE:
1. Name Header (use a professional name format, NOT "Your Name" or placeholder text)
2. Professional Summary (2-3 sentences aligned with target role)
3. Technical Skills (categorized - THIS MUST BE THE SECOND SECTION after summary)
4. Soft Skills & Languages
5. Experience (if any - use STAR method for descriptions)
6. Projects (critical for graduates - highlight technical skills and impact)
7. Education (include relevant modules if provided - THIS MUST BE THE LAST SECTION)
8. Certifications (ONLY if the candidate has certifications - DO NOT include this section if they have none)

FORMATTING RULES:
- Start with the candidate's name as a # header (use a realistic professional name, NOT placeholder text)
- Use markdown headers (## for main sections, ### for subsections)
- Use hyphens (-) for bullet points, NOT bullet symbols (•) or double dashes (--)
- Keep formatting clean and simple
- Use **bold** for job titles, company names, and project names
- Format as clean, professional markdown that can be easily parsed by ATS systems
- IMPORTANT: Generate a realistic professional name for the header, do not use "Your Name", "markdown", or any placeholder text
`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert UK career advisor and resume writer specializing in graduate and entry-level positions. Create professional, ATS-optimized resumes that highlight transferable skills and potential.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 2000,
    })

    const resume = completion.choices[0]?.message?.content?.trim() || ''

    if (!resume) {
      throw new Error('Failed to generate resume')
    }

    return NextResponse.json({
      message: 'Resume generated successfully',
      resume,
    })
  } catch (error) {
    console.error('Generate resume error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to generate resume' },
      { status: 500 }
    )
  }
}
