import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import mammoth from 'mammoth'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    let extractedText = ''
    const fileType = file.type

    if (fileType === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const pdfParse = (await import('pdf-parse')).default
      const data = await pdfParse(buffer)
      extractedText = data.text
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'application/msword'
    ) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const result = await mammoth.extractRawText({ buffer })
      extractedText = result.value
    } else if (fileType === 'text/plain') {
      extractedText = await file.text()
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload PDF, DOCX, or TXT' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      text: extractedText,
      textLength: extractedText.length,
    })
  } catch (error) {
    console.error('Resume text extraction error:', error)
    return NextResponse.json(
      { error: 'Failed to extract text from file' },
      { status: 500 }
    )
  }
}
