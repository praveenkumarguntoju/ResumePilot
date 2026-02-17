import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { z } from 'zod'

const extractSchema = z.object({
  url: z.string().url(),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { url } = extractSchema.parse(body)

    // Fetch the webpage content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch job posting')
    }

    const html = await response.text()

    // Extract job details using simple text parsing
    // This is a basic implementation - you could enhance with a proper HTML parser
    let jobTitle = ''
    let company = ''
    let jobDescription = ''

    // Try to extract job title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (titleMatch) {
      jobTitle = titleMatch[1]
        .replace(/\s*-\s*LinkedIn/i, '')
        .replace(/\s*-\s*Indeed/i, '')
        .replace(/\s*\|.*$/i, '')
        .trim()
    }

    // Try to extract company name
    const companyPatterns = [
      /<meta[^>]*property="og:site_name"[^>]*content="([^"]+)"/i,
      /<span[^>]*class="[^"]*company[^"]*"[^>]*>([^<]+)</i,
      /<div[^>]*class="[^"]*company[^"]*"[^>]*>([^<]+)</i,
    ]
    
    for (const pattern of companyPatterns) {
      const match = html.match(pattern)
      if (match && match[1]) {
        company = match[1].trim()
        break
      }
    }

    // Extract main content - remove HTML tags and scripts
    jobDescription = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim()

    // Try to find the job description section
    const descriptionKeywords = [
      'job description',
      'about the role',
      'responsibilities',
      'requirements',
      'qualifications',
      'what you',
      'we are looking',
    ]

    let bestMatch = ''
    let maxLength = 0

    for (const keyword of descriptionKeywords) {
      const regex = new RegExp(`${keyword}[\\s\\S]{100,3000}`, 'i')
      const match = jobDescription.match(regex)
      if (match && match[0].length > maxLength) {
        bestMatch = match[0]
        maxLength = match[0].length
      }
    }

    if (bestMatch) {
      jobDescription = bestMatch
    } else {
      // Fallback: take a reasonable chunk from the middle
      const start = Math.floor(jobDescription.length * 0.2)
      jobDescription = jobDescription.substring(start, start + 2000)
    }

    // Clean up extracted data
    jobDescription = jobDescription
      .substring(0, 3000) // Limit length
      .trim()

    return NextResponse.json({
      jobTitle: jobTitle || 'Job Title',
      company: company || 'Company Name',
      jobDescription: jobDescription || 'Could not extract job description. Please paste it manually.',
      success: true,
    })
  } catch (error) {
    console.error('Extract job error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to extract job details from URL. Please paste the job description manually.' },
      { status: 500 }
    )
  }
}
