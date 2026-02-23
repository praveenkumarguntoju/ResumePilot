'use client'

import React from 'react'
import { extractNameFromResume } from '@/lib/resume-utils'

interface MinimalTemplateProps {
  content: string
  contactInfo?: {
    fullName?: string
    email?: string
    phone?: string
  }
}

export function MinimalTemplate({ content, contactInfo }: MinimalTemplateProps) {
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

    // Debug logging
    console.log('Parsed sections:', Object.keys(sections))
    console.log('Technical skills section:', sections['technical skills'])
    console.log('Skills section:', sections['skills'])

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
        <strong key={key++} className="font-medium">
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
  const name = contactInfo?.fullName || extractNameFromResume(content)

  return (
    <div className="bg-white text-zinc-900 p-8 rounded-lg max-w-4xl mx-auto">
      {/* Minimal Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-light text-zinc-900 mb-2 tracking-tight">{name}</h1>
        {(contactInfo?.email || contactInfo?.phone) && (
          <div className="text-xs text-zinc-500 space-y-1">
            {contactInfo.email && <div>{contactInfo.email}</div>}
            {contactInfo.phone && <div>{contactInfo.phone}</div>}
          </div>
        )}
        {sections['professional summary'] && (
          <p className="text-xs text-zinc-500 leading-relaxed font-light">
            {sections['professional summary'].join(' ').replace(/\*\*/g, '')}
          </p>
        )}
      </div>

      {/* Clean Single Column */}
      <div className="space-y-8">
        {/* Skills - MOVED TO SECOND POSITION */}
        {(sections['technical skills'] || sections['skills'] || sections['technical'] || sections['soft skills'] || sections['soft skills & languages']) && (
          <div>
            <h2 className="text-xs font-semibold text-zinc-900 mb-3 uppercase tracking-widest">
              Skills
            </h2>
            <div className="pl-4 border-l border-zinc-200 space-y-3">
              {(sections['technical skills'] || sections['skills'] || sections['technical']) && (
                <div>
                  <p className="text-xs font-medium text-zinc-700 mb-1">Technical</p>
                  <div className="flex flex-wrap gap-2">
                    {(sections['technical skills'] || sections['skills'] || sections['technical']).map((line, idx) => (
                      <span key={idx} className="text-xs text-zinc-600 font-light">
                        {renderBoldText(line.replace(/^-\s*/, '').trim())}
                        {idx < (sections['technical skills'] || sections['skills'] || sections['technical']).length - 1 && ' ·'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {(sections['soft skills'] || sections['soft skills & languages'] || sections['languages']) && (
                <div>
                  <p className="text-xs font-medium text-zinc-700 mb-1">Soft Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {(sections['soft skills'] || sections['soft skills & languages'] || sections['languages']).map((line, idx) => (
                      <span key={idx} className="text-xs text-zinc-600 font-light">
                        {line.replace(/^-\s*/, '').trim()}
                        {idx < (sections['soft skills'] || sections['soft skills & languages'] || sections['languages']).length - 1 && ' ·'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Experience */}
        {sections.experience && (
          <div>
            <h2 className="text-xs font-semibold text-zinc-900 mb-3 uppercase tracking-widest">
              Experience
            </h2>
            <div className="space-y-2 pl-4 border-l border-zinc-200">
              {sections.experience.map((line, idx) => {
                const isBullet = line.trim().startsWith('-') || line.trim().startsWith('•')
                const cleanLine = line.replace(/^[-•]\s*/, '')
                
                return (
                  <div key={idx} className="text-xs">
                    {isBullet ? (
                      <div className="flex gap-2">
                        <span className="text-zinc-600 flex-shrink-0 font-light">·</span>
                        <p className="text-zinc-600 font-light flex-1">{renderBoldText(cleanLine)}</p>
                      </div>
                    ) : (
                      <p className={line.includes('**') ? 'font-medium text-zinc-900' : 'text-zinc-500 font-light'}>
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
            <h2 className="text-xs font-semibold text-zinc-900 mb-3 uppercase tracking-widest">
              Projects
            </h2>
            <div className="space-y-2 pl-4 border-l border-zinc-200">
              {sections.projects.map((line, idx) => {
                const isBullet = line.trim().startsWith('-') || line.trim().startsWith('•')
                const cleanLine = line.replace(/^[-•]\s*/, '')
                
                return (
                  <div key={idx} className="text-xs">
                    {isBullet ? (
                      <div className="flex gap-2">
                        <span className="text-zinc-600 flex-shrink-0 font-light">·</span>
                        <p className="text-zinc-600 font-light flex-1">{renderBoldText(cleanLine)}</p>
                      </div>
                    ) : (
                      <p className={line.includes('**') ? 'font-medium text-zinc-900' : 'text-zinc-500 font-light'}>
                        {renderBoldText(line)}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Education - MOVED TO LAST POSITION */}
        {sections.education && (
          <div>
            <h2 className="text-xs font-semibold text-zinc-900 mb-3 uppercase tracking-widest">
              Education
            </h2>
            <div className="space-y-2 pl-4 border-l border-zinc-200">
              {sections.education.map((line, idx) => (
                <p key={idx} className="text-xs text-zinc-600 font-light leading-relaxed">
                  {line.replace(/\*\*/g, '').replace(/^-\s*/, '')}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
