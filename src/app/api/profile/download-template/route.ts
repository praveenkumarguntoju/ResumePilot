import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { generateResumePDF } from '@/lib/pdf-generator'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { template, contactInfo } = body

    if (!template || !['simple', 'modern', 'classic', 'minimal'].includes(template)) {
      return NextResponse.json(
        { error: 'Invalid template' },
        { status: 400 }
      )
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile?.rawResumeText) {
      return NextResponse.json(
        { error: 'No resume found' },
        { status: 404 }
      )
    }

    // Generate HTML based on template
    let htmlContent = ''
    
    if (template === 'simple') {
      // Simple template - markdown-like format
      const name = contactInfo?.fullName || 'Your Name'
      const email = contactInfo?.email || ''
      const phone = contactInfo?.phone || ''
      
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px;">
          ${(name || email || phone) ? `
            <div style="margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #ccc;">
              ${name ? `<h1 style="font-size: 24px; margin: 0 0 10px 0; color: #333;">${name}</h1>` : ''}
              ${(email || phone) ? `
                <div style="font-size: 14px; color: #666;">
                  ${email ? `<div>${email}</div>` : ''}
                  ${phone ? `<div>${phone}</div>` : ''}
                </div>
              ` : ''}
            </div>
          ` : ''}
          <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #333;">
            ${profile.rawResumeText}
          </div>
        </div>
      `
    } else if (template === 'modern') {
      // Modern template
      const name = contactInfo?.fullName || 'Your Name'
      const email = contactInfo?.email || ''
      const phone = contactInfo?.phone || ''
      
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 32px; background: white;">
          <div style="border-left: 4px solid #2563eb; padding-left: 16px; margin-bottom: 24px;">
            <h1 style="font-size: 32px; margin: 0 0 8px 0; color: #111827; font-weight: bold;">${name}</h1>
            ${(email || phone) ? `
              <div style="font-size: 14px; color: #6b7280;">
                ${email ? `<div>${email}</div>` : ''}
                ${phone ? `<div>${phone}</div>` : ''}
              </div>
            ` : ''}
          </div>
          <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #374151;">
            ${profile.rawResumeText}
          </div>
        </div>
      `
    } else if (template === 'classic') {
      // Classic template
      const name = contactInfo?.fullName || 'Your Name'
      const email = contactInfo?.email || ''
      const phone = contactInfo?.phone || ''
      
      htmlContent = `
        <div style="font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 32px; background: white; text-align: center;">
          <div style="margin-bottom: 32px; padding-bottom: 16px; border-bottom: 2px solid #111827;">
            <h1 style="font-size: 48px; margin: 0 0 12px 0; color: #111827; font-weight: bold;">${name}</h1>
            ${(email || phone) ? `
              <div style="font-size: 14px; color: #6b7280;">
                ${email ? `<div>${email}</div>` : ''}
                ${phone ? `<div>${phone}</div>` : ''}
              </div>
            ` : ''}
          </div>
          <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #374151; text-align: left;">
            ${profile.rawResumeText}
          </div>
        </div>
      `
    } else if (template === 'minimal') {
      // Minimal template
      const name = contactInfo?.fullName || 'Your Name'
      const email = contactInfo?.email || ''
      const phone = contactInfo?.phone || ''
      
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 32px; background: white;">
          <div style="margin-bottom: 32px;">
            <h1 style="font-size: 24px; margin: 0 0 8px 0; color: #111827; font-weight: 300;">${name}</h1>
            ${(email || phone) ? `
              <div style="font-size: 12px; color: #6b7280;">
                ${email ? `<div>${email}</div>` : ''}
                ${phone ? `<div>${phone}</div>` : ''}
              </div>
            ` : ''}
          </div>
          <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #374151;">
            ${profile.rawResumeText}
          </div>
        </div>
      `
    }

    const pdfBytes = await generateResumePDF(htmlContent)

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="resume-${template}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Template download error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
