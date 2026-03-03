'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChatBox } from '@/components/chat-box'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { MapPin, Briefcase, Award, Eye, Download, Calendar, Building2, User } from 'lucide-react'
import { ResumeModal } from '@/components/resume-modal'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { BackButton } from '@/components/back-button'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import Image from 'next/image'

interface Profile {
  slug: string
  name: string
  headline: string
  location: string | null
  resumeText: string
  shortBrief: string | null
  skills: string
  experience: string
  profileImage?: string | null
}

export default function PublicProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [skills, setSkills] = useState<string[]>([])
  const [experienceFromResume, setExperienceFromResume] = useState<string[]>([])

  const topRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    async function loadProfile() {
      const { slug } = await params
      
      try {
        const response = await fetch(`/api/profile/${slug}`)
        if (!response.ok) {
          router.push('/404')
          return
        }
        const data = await response.json()
        setProfile(data)
        setSkills(JSON.parse(data.skills))
        // Parse experience from resume text
        const resumeLines = data.resumeText.split('\n')
        const expSection = []
        let inExperienceSection = false
        
        for (const line of resumeLines) {
          const trimmedLine = line.trim()
          if (trimmedLine.toLowerCase().includes('experience') || trimmedLine.toLowerCase().includes('professional experience')) {
            inExperienceSection = true
            continue
          }
          if (trimmedLine.toLowerCase().includes('education') || trimmedLine.toLowerCase().includes('projects') || trimmedLine.toLowerCase().includes('skills')) {
            inExperienceSection = false
            continue
          }
          if (inExperienceSection && trimmedLine && !trimmedLine.startsWith('#')) {
            expSection.push(trimmedLine)
          }
        }
        setExperienceFromResume(expSection)
      } catch (error) {
        console.error('Failed to load profile:', error)
        router.push('/404')
      } finally {
        setLoading(false)
        setTimeout(() => {
          topRef.current?.scrollIntoView()
          window.scrollTo(0, 0)
        }, 50)
      }
    }
    
    loadProfile()
  }, [params, router])

  return (
    <div ref={topRef} className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {(loading || !profile) ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-zinc-600 dark:text-zinc-400">Loading profile...</p>
          </div>
        </div>
      ) : (
        <>
      {/* Header - Public profile only shows logo */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image 
              src="/images/resume-pilot.png" 
              alt="ResumePilot Logo"
              className="rounded-lg"
              width={250} 
              height={250}
            />
          </div>
          <ThemeToggle />
        </div>
      </header>
      
      {/* Compact Hero Section */}
      <div className="bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start gap-6">
            {/* Profile Image */}
            {profile.profileImage ? (
              <div className="flex-shrink-0">
                <Image
                  src={profile.profileImage}
                  alt={profile.name}
                  width={100}
                  height={100}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white dark:border-zinc-800 shadow-lg"
                />
              </div>
            ) : (
              <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center border-4 border-white dark:border-zinc-800 shadow-lg">
                <User className="h-10 w-10 text-zinc-400 dark:text-zinc-500" />
              </div>
            )}

            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Available for opportunities
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-2">
                {profile.name}
              </h1>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-3">
                {profile.headline}
              </p>
              {profile.shortBrief && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 leading-relaxed max-w-3xl">
                  {profile.shortBrief}
                </p>
              )}
              {profile.location && (
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{profile.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Skills */}
            {skills.length > 0 && (
              <Card className="border-zinc-200 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    Technical Skills
                  </CardTitle>
                  <CardDescription className="text-base">
                    Core competencies and technologies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {skills.map((skill, i) => (
                      <span
                        key={i}
                        className="group relative bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg text-sm font-medium border border-blue-200 dark:border-blue-800 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-default"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Experience from Resume */}
            {experienceFromResume.length > 0 && (
              <Card className="border-zinc-200 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    Professional Experience
                  </CardTitle>
                  <CardDescription className="text-base">
                    Career highlights from resume
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="relative">
                    {experienceFromResume.map((line, i) => {
                      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      const isBold = line.includes('**') && !line.startsWith('-') && !line.startsWith('•')
                      const isBullet = line.trim().startsWith('-') || line.trim().startsWith('•')
                      const isEmpty = line.trim() === ''
                      
                      if (isEmpty) return <div key={i} className="h-4" />
                      
                      if (isBold) {
                        return (
                          <div key={i} className="mb-4">
                            <h4 
                              className="text-lg font-semibold text-zinc-900 dark:text-white mb-2"
                              dangerouslySetInnerHTML={{ __html: formattedLine }}
                            />
                          </div>
                        )
                      }
                      
                      if (isBullet) {
                        return (
                          <div key={i} className="flex items-start gap-3 mb-3 ml-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                            <p 
                              className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^[-•]\s*/, '') }}
                            />
                          </div>
                        )
                      }
                      
                      return (
                        <div key={i} className="mb-3">
                          <p 
                            className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: formattedLine }}
                          />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Full Resume */}
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl mb-2">Resume</CardTitle>
                  </div>
                  <div className="flex gap-3">
                    <ResumeModal resumeText={profile.resumeText} forceTemplate="modern" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 rounded-xl p-8 max-h-[400px] overflow-hidden relative border border-zinc-200 dark:border-zinc-700">
                  <MarkdownRenderer content={profile.resumeText.split('\n').slice(0, 30).join('\n')} />
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-100 via-zinc-100/80 dark:from-zinc-800 dark:via-zinc-800/80 to-transparent flex items-end justify-center pb-4">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                      Click &quot;View Full Resume&quot; to see complete content
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Chat */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <ChatBox slug={profile.slug} />
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  )
}
