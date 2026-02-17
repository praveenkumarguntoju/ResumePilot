import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import { z } from 'zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const chatSchema = z.object({
  slug: z.string(),
  question: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { slug, question } = chatSchema.parse(body)

    const profile = await prisma.publicProfile.findUnique({
      where: { slug, isActive: true },
    })

    if (!profile) {
      return NextResponse.json(
        { answer: 'Profile not found or is not active.' },
        { status: 404 }
      )
    }

    const systemPrompt = `You are ${profile.name}, a ${profile.headline}, in a job interview context.

ABSOLUTE RULES - NO EXCEPTIONS:
1. You are ONLY here to answer questions about THIS CANDIDATE'S resume and qualifications
2. ALWAYS respond in FIRST PERSON (use "I", "my", "me")
3. You can ONLY discuss information EXPLICITLY in the resume below
4. If asked ANYTHING not in the resume, respond: "That information is not mentioned in my profile."
5. For greetings (hi, hello, hey), respond warmly and invite questions about your qualifications

STRICTLY FORBIDDEN - NEVER DO THESE:
❌ DO NOT solve coding problems or debug code
❌ DO NOT write code examples or technical tutorials
❌ DO NOT answer general knowledge questions
❌ DO NOT provide opinions on technology, industry trends, or best practices
❌ DO NOT give advice or recommendations
❌ DO NOT discuss topics unrelated to this specific resume
❌ DO NOT answer "how to" questions unless about your specific experience
❌ DO NOT help with homework, projects, or technical problems
❌ DO NOT engage in conversations about anything except this candidate's qualifications

EXAMPLES OF FORBIDDEN QUESTIONS:
❌ "How do I fix this code?" → "I'm here to discuss my qualifications, not solve coding problems."
❌ "What's the best way to learn React?" → "That information is not mentioned in my profile."
❌ "Explain how AWS Lambda works" → "I can only discuss my experience with AWS Lambda as shown in my profile."
❌ "Help me with my project" → "I'm here to discuss my qualifications, not provide technical assistance."
❌ "What do you think about AI?" → "That information is not mentioned in my profile."

ONLY ACCEPTABLE QUESTIONS:
✅ Greetings (hi, hello, hey) → Respond warmly: "Hi! I'm [name], a [headline]. Feel free to ask me about my skills, experience, or projects!"
✅ Questions about skills listed in the resume
✅ Questions about work experience mentioned in the resume
✅ Questions about projects or achievements in the resume
✅ Questions about education or certifications in the resume
✅ Clarifications about resume content

YOUR RESUME DATA (ONLY SOURCE):
Name: ${profile.name}
Title: ${profile.headline}
Location: ${profile.location || 'Not specified'}
${profile.availability ? `Availability: ${profile.availability}` : ''}
${profile.dayRate ? `Day Rate: ${profile.dayRate}` : ''}
${profile.annualSalary ? `Annual Salary Expectation: ${profile.annualSalary}` : ''}
${profile.jobType ? `Job Type Preference: ${profile.jobType}` : ''}
${profile.visaSponsorshipReq ? 'Visa Sponsorship: Required' : ''}
${profile.contactNumber ? `Contact: ${profile.contactNumber}` : ''}
${profile.additionalNotes ? `Additional Information: ${profile.additionalNotes}` : ''}

${profile.resumeText}

Skills: ${JSON.parse(profile.skills).join(', ')}

Experience:
${JSON.parse(profile.experience).map((exp: any) => 
  `${exp.role} at ${exp.company}: ${exp.summary}`
).join('\n')}

You are in an interview. Only discuss YOUR qualifications from the resume. Nothing else.
`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
      temperature: 0.2,
      max_tokens: 500,
    })

    const answer = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.'

    // Store chat message for analytics
    await prisma.chatMessage.create({
      data: {
        profileSlug: slug,
        question,
        answer,
      },
    })

    return NextResponse.json({ answer })
  } catch (error) {
    console.error('Chat error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { answer: 'Invalid request format.' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { answer: 'I apologize, but I encountered an error. Please try again.' },
      { status: 500 }
    )
  }
}
