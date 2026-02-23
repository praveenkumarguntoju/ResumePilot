'use client'

import React from 'react'
import { extractNameFromResume } from '@/lib/resume-utils'

interface ClassicTemplateProps {
  content: string
  contactInfo?: {
    fullName?: string
    email?: string
    phone?: string
  }
}

export function ClassicTemplate({ content, contactInfo }: ClassicTemplateProps) {
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
  const name = contactInfo?.fullName || extractNameFromResume(content)

  return (
    <div className="bg-white text-zinc-900 p-8 rounded-lg max-w-4xl mx-auto">
      {/* Centered Header */}
      <div className="text-center mb-8 pb-4 border-b-2 border-zinc-800">
        <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-3">{name}</h1>
        {(contactInfo?.email || contactInfo?.phone) && (
          <div className="text-sm text-zinc-600 space-y-1">
            {contactInfo.email && <div>{contactInfo.email}</div>}
            {contactInfo.phone && <div>{contactInfo.phone}</div>}
          </div>
        )}
        {sections['professional summary'] && (
          <p className="text-sm text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            {sections['professional summary'].join(' ').replace(/\*\*/g, '')}
          </p>
        )}
      </div>

      {/* Single Column Layout */}
      <div className="space-y-6">
        {/* Skills - Table Layout - MOVED TO SECOND POSITION */}
        {(sections['technical skills'] || sections['skills'] || sections['technical'] || sections['soft skills'] || sections['soft skills & languages']) && (
          <div>
            <h2 className="text-lg font-serif font-bold text-zinc-900 mb-3 pb-1 border-b border-zinc-300 uppercase tracking-wide">
              Skills
            </h2>
            <table className="w-full border-collapse border border-zinc-300">
              <thead>
                <tr className="border-b border-zinc-300">
                  <th className="text-left py-2 px-4 bg-zinc-50 font-serif font-bold text-sm text-zinc-900 uppercase tracking-wide">
                    Technical Skills
                  </th>
                  <th className="text-left py-2 px-4 bg-zinc-50 font-serif font-bold text-sm text-zinc-900 uppercase tracking-wide">
                    Soft Skills
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="align-top py-3 px-4 border-r border-zinc-200">
                    {(sections['technical skills'] || sections['skills'] || sections['technical']) ? (
                      <div className="space-y-1">
                        {(sections['technical skills'] || sections['skills'] || sections['technical']).map((line, idx) => (
                          <p key={idx} className="text-sm text-zinc-700">
                            {renderBoldText(line.replace(/^-\s*/, '• '))}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-400 italic">N/A</p>
                    )}
                  </td>
                  <td className="align-top py-3 px-4">
                    {(sections['soft skills'] || sections['soft skills & languages'] || sections['languages']) ? (
                      <div className="space-y-1">
                        {(sections['soft skills'] || sections['soft skills & languages'] || sections['languages']).map((line, idx) => (
                          <p key={idx} className="text-sm text-zinc-700">
                            {line.replace(/\*\*/g, '').replace(/^-\s*/, '• ')}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-400 italic">N/A</p>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Experience */}
        {sections.experience && (
          <div>
            <h2 className="text-lg font-serif font-bold text-zinc-900 mb-3 pb-1 border-b border-zinc-300 uppercase tracking-wide">
              Professional Experience
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
                      <p className={line.includes('**') ? 'font-semibold text-zinc-900 mt-2' : 'text-zinc-600 italic'}>
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
            <h2 className="text-lg font-serif font-bold text-zinc-900 mb-3 pb-1 border-b border-zinc-300 uppercase tracking-wide">
              Projects
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
                      <p className={line.includes('**') ? 'font-semibold text-zinc-900 mt-2' : 'text-zinc-600'}>
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
            <h2 className="text-lg font-serif font-bold text-zinc-900 mb-3 pb-1 border-b border-zinc-300 uppercase tracking-wide">
              Education
            </h2>
            <div className="space-y-2">
              {sections.education.map((line, idx) => (
                <p key={idx} className="text-sm text-zinc-700 leading-relaxed">
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
