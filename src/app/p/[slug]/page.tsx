'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChatBox } from '@/components/chat-box'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { MapPin, Briefcase, Award } from 'lucide-react'
import { ResumeModal } from '@/components/resume-modal'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import Image from 'next/image'

interface Profile {
  slug: string
  name: string
  headline: string
  location: string | null
  resumeText: string
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
    return <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
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
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
                    <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-2">
                      {profile.headline}
                    </p>
                    {profile.location && (
                      <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Skills */}
            {skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, i) => (
                      <span
                        key={i}
                        className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-3 py-1 rounded-full text-sm font-medium"
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {experience.map((exp, i) => (
                    <div key={i} className="border-l-2 border-blue-500 pl-4">
                      <h3 className="font-semibold text-lg">{exp.role}</h3>
                      <p className="text-zinc-600 dark:text-zinc-400 mb-2">
                        {exp.company}
                      </p>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300">
                        {exp.summary}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Full Resume */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Optimized Resume</CardTitle>
                  <CardDescription>
                    Tailored for this specific job posting
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <ResumeModal resumeText={profile.resumeText} />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`/api/profile/${profile.slug}/download`, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6 max-h-[300px] overflow-hidden relative">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {profile.resumeText.split('\n').slice(0, 15).map((line, i) => {
                      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      
                      if (line.trim().endsWith(':') && line.trim().length > 2) {
                        return <h3 key={i} className="text-base font-bold mt-3 mb-1" dangerouslySetInnerHTML={{ __html: formattedLine }} />
                      }
                      if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
                        return <li key={i} className="ml-4 text-sm" dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^[-•]\s*/, '') }} />
                      }
                      if (line.trim() === '') return <br key={i} />
                      return <p key={i} className="text-sm mb-1" dangerouslySetInnerHTML={{ __html: formattedLine }} />
                    })}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-zinc-50 dark:from-zinc-900 to-transparent" />
                </div>
                <p className="text-xs text-center text-zinc-500 mt-2">
                  Showing preview - Scroll down to see complete content
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Chat */}
          <div className="lg:col-span-1">
            <ChatBox slug={profile.slug} />
          </div>
        </div>
      </div>
    </div>
  )
}
