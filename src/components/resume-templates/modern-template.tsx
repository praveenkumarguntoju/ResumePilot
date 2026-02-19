'use client'

import React from 'react'

interface ModernTemplateProps {
  content: string
}

export function ModernTemplate({ content }: ModernTemplateProps) {
  const parseResume = (text: string) => {
    const sections: { [key: string]: string[] } = {}
    let currentSection = 'header'
    const lines = text.split('\n')

    for (const line of lines) {
      if (line.startsWith('# ') || line.startsWith('## ') || line.startsWith('### ')) {
        currentSection = line.replace(/^#+\s+/, '').toLowerCase()
        sections[currentSection] = []
      } else if (line.trim()) {
        if (!sections[currentSection]) sections[currentSection] = []
        sections[currentSection].push(line)
      }
    }

    return sections
  }

  const renderBoldText = (text: string) => {
    const parts = []
    const regex = /\*\*(.+?)\*\*/g
    let lastIndex = 0
    let match
    let key = 0

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index))
      }
      parts.push(
        <strong key={key++} className="font-semibold">
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

  const sections = parseResume(content)
  const name = sections.header?.[0]?.replace(/\*\*/g, '') || 'Your Name'

  return (
    <div className="bg-white text-zinc-900 p-8 shadow-lg rounded-lg max-w-4xl mx-auto">
      {/* Header with accent color */}
      <div className="border-l-4 border-blue-600 pl-4 mb-6">
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">{name}</h1>
        {sections['professional summary'] && (
          <p className="text-sm text-zinc-600 leading-relaxed">
            {sections['professional summary'].join(' ').replace(/\*\*/g, '')}
          </p>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* Main Content - 2 columns */}
        <div className="col-span-2 space-y-6">
          {/* Experience */}
          {sections.experience && (
            <div>
              <h2 className="text-xl font-bold text-blue-600 mb-3 pb-2 border-b-2 border-blue-600">
                EXPERIENCE
              </h2>
              <div className="space-y-2">
                {sections.experience.map((line, idx) => {
                  const isBullet = line.trim().startsWith('-') || line.trim().startsWith('•')
                  const cleanLine = line.replace(/^[-•]\s*/, '')
                  
                  return (
                    <div key={idx} className="text-sm">
                      {isBullet ? (
                        <div className="flex gap-2">
                          <span className="text-zinc-700 flex-shrink-0">•</span>
                          <p className="text-zinc-700 flex-1">{renderBoldText(cleanLine)}</p>
                        </div>
                      ) : (
                        <p className={line.includes('**') ? 'font-semibold text-zinc-900' : 'text-zinc-600'}>
                          {renderBoldText(line)}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Projects */}
          {sections.projects && (
            <div>
              <h2 className="text-xl font-bold text-blue-600 mb-3 pb-2 border-b-2 border-blue-600">
                PROJECTS
              </h2>
              <div className="space-y-2">
                {sections.projects.map((line, idx) => {
                  const isBullet = line.trim().startsWith('-') || line.trim().startsWith('•')
                  const cleanLine = line.replace(/^[-•]\s*/, '')
                  
                  return (
                    <div key={idx} className="text-sm">
                      {isBullet ? (
                        <div className="flex gap-2">
                          <span className="text-zinc-700 flex-shrink-0">•</span>
                          <p className="text-zinc-700 flex-1">{renderBoldText(cleanLine)}</p>
                        </div>
                      ) : (
                        <p className={line.includes('**') ? 'font-semibold text-zinc-900' : 'text-zinc-600'}>
                          {renderBoldText(line)}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Education */}
          {sections.education && (
            <div>
              <h2 className="text-lg font-bold text-blue-600 mb-3">EDUCATION</h2>
              <div className="space-y-2">
                {sections.education.map((line, idx) => (
                  <p key={idx} className="text-xs text-zinc-700 leading-relaxed">
                    {line.replace(/\*\*/g, '').replace(/^-\s*/, '')}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Technical Skills */}
          {sections['technical skills'] && (
            <div>
              <h2 className="text-lg font-bold text-blue-600 mb-3">SKILLS</h2>
              <div className="space-y-1">
                {sections['technical skills'].map((line, idx) => (
                  <p key={idx} className="text-xs text-zinc-700">
                    {renderBoldText(line.replace(/^-\s*/, '• '))}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Soft Skills */}
          {sections['soft skills'] && (
            <div>
              <h2 className="text-lg font-bold text-blue-600 mb-3">SOFT SKILLS</h2>
              <div className="space-y-1">
                {sections['soft skills'].map((line, idx) => (
                  <p key={idx} className="text-xs text-zinc-700">
                    {line.replace(/\*\*/g, '').replace(/^-\s*/, '• ')}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
