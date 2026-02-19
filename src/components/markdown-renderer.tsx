'use client'

import React from 'react'

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Convert markdown to HTML-like structure
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n')
    const elements: React.ReactElement[] = []
    let key = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // Headers
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={key++} className="text-lg font-bold mt-6 mb-3 text-zinc-900 dark:text-zinc-100">
            {line.replace('### ', '')}
          </h3>
        )
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={key++} className="text-xl font-bold mt-6 mb-3 text-zinc-900 dark:text-zinc-100">
            {line.replace('## ', '')}
          </h2>
        )
      } else if (line.startsWith('# ')) {
        elements.push(
          <h1 key={key++} className="text-2xl font-bold mt-6 mb-4 text-zinc-900 dark:text-zinc-100">
            {line.replace('# ', '')}
          </h1>
        )
      }
      // Bullet points
      else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const content = line.trim().substring(2)
        const formatted = formatInlineMarkdown(content)
        elements.push(
          <li key={key++} className="ml-4 mb-2 text-zinc-700 dark:text-zinc-300">
            {formatted}
          </li>
        )
      }
      // Horizontal rule
      else if (line.trim() === '---' || line.trim() === '***') {
        elements.push(
          <hr key={key++} className="my-4 border-zinc-300 dark:border-zinc-700" />
        )
      }
      // Empty line
      else if (line.trim() === '') {
        elements.push(<div key={key++} className="h-2" />)
      }
      // Regular paragraph
      else {
        const formatted = formatInlineMarkdown(line)
        elements.push(
          <p key={key++} className="mb-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {formatted}
          </p>
        )
      }
    }

    return elements
  }

  const formatInlineMarkdown = (text: string) => {
    const parts: (string | React.ReactElement)[] = []
    let currentText = text
    let key = 0

    // Bold text **text**
    const boldRegex = /\*\*(.+?)\*\*/g
    let lastIndex = 0
    let match

    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index))
      }
      parts.push(
        <strong key={`bold-${key++}`} className="font-semibold text-zinc-900 dark:text-zinc-100">
          {match[1]}
        </strong>
      )
      lastIndex = match.index + match[0].length
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }

    return parts.length > 0 ? parts : text
  }

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      {renderMarkdown(content)}
    </div>
  )
}
