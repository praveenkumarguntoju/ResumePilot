'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChatBox } from '@/components/chat-box'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { MapPin, Briefcase, Award, Eye, Download, Calendar, Building2 } from 'lucide-react'
import { ResumeModal } from '@/components/resume-modal'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
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
}

export default function PublicProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [skills, setSkills] = useState<string[]>([])
  const [experience, setExperience] = useState<Array<{ company: string; role: string; summary: string }>>([])

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
        setExperience(JSON.parse(data.experience))
      } catch (error) {
        console.error('Failed to load profile:', error)
        router.push('/404')
      } finally {
        setLoading(false)
      }
    }
    
    loadProfile()
  }, [params, router])

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image 
              src="/images/resume-pilot.png" 
              alt="ResumePilot Logo"
              className="rounded-lg"
              width={180} 
              height={180}
            />
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      {/* Compact Hero Section */}
      <div className="bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

            {/* Experience */}
            {experience.length > 0 && (
              <Card className="border-zinc-200 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    Professional Experience
                  </CardTitle>
                  <CardDescription className="text-base">
                    Career highlights and achievements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {experience.map((exp, i) => (
                    <div key={i} className="relative pl-8 pb-8 last:pb-0">
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-blue-500"></div>
                      <div className="absolute left-0 top-0 w-4 h-4 -ml-[7px] rounded-full bg-purple-500 border-4 border-white dark:border-zinc-900"></div>
                      
                      <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                        <h3 className="font-bold text-xl text-zinc-900 dark:text-white mb-2">
                          {exp.role}
                        </h3>
                        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 mb-4">
                          <Building2 className="h-4 w-4" />
                          <span className="font-medium">{exp.company}</span>
                        </div>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                          {exp.summary}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Full Resume */}
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl mb-2">Optimized Resume</CardTitle>
                    <CardDescription className="text-base">
                      Tailored for this specific job posting
                    </CardDescription>
                  </div>
                  <div className="flex gap-3">
                    <ResumeModal resumeText={profile.resumeText} />
                    <Button 
                      variant="outline" 
                      size="default"
                      className="hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                      onClick={() => window.open(`/api/profile/${profile.slug}/download`, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 rounded-xl p-8 max-h-[400px] overflow-hidden relative border border-zinc-200 dark:border-zinc-700">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {profile.resumeText.split('\n').slice(0, 20).map((line, i) => {
                      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      
                      if (line.trim().endsWith(':') && line.trim().length > 2) {
                        return <h3 key={i} className="text-base font-bold mt-4 mb-2 text-zinc-900 dark:text-white" dangerouslySetInnerHTML={{ __html: formattedLine }} />
                      }
                      if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
                        return <li key={i} className="ml-4 text-sm text-zinc-700 dark:text-zinc-300" dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^[-•]\s*/, '') }} />
                      }
                      if (line.trim() === '') return <br key={i} />
                      return <p key={i} className="text-sm mb-2 text-zinc-700 dark:text-zinc-300" dangerouslySetInnerHTML={{ __html: formattedLine }} />
                    })}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-100 via-zinc-100/80 dark:from-zinc-800 dark:via-zinc-800/80 to-transparent flex items-end justify-center pb-4">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                      Click "View Full Resume" to see complete content
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
    </div>
  )
}
