'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download, FileText, Target, TrendingUp, MessageSquare, RefreshCw, Mail } from 'lucide-react'
import Link from 'next/link'
import { DownloadButtons } from '@/components/download-buttons'
import { CoverLetterGenerator } from '@/components/cover-letter-generator'
import { ReoptimizeButton } from '@/components/reoptimize-button'
import { ThemeToggle } from '@/components/theme-toggle'
import { CreatePublicProfileModal } from '@/components/create-public-profile-modal'
import { ResumeModal } from '@/components/resume-modal'
import { ResumeActionsMenu } from '@/components/resume-actions-menu'
import { BriefGenerator } from '@/components/brief-generator'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { DashboardHeader } from '@/components/dashboard-header'
import { BackButton } from '@/components/back-button'

interface Resume {
  id: string
  jobTitle: string
  company: string
  tailoredResumeText: string
  atsScore: number | null
  keywordMatch: number | null
  jobDescription: string | null
}

export default function ResumePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [resume, setResume] = useState<Resume | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [generatedBrief, setGeneratedBrief] = useState('')

  useEffect(() => {
    async function loadResume() {
      const { id } = await params
      
      try {
        const response = await fetch(`/api/resume/${id}`)
        if (!response.ok) {
          router.push('/dashboard')
          return
        }
        const data = await response.json()
        setResume(data)
      } catch (error) {
        console.error('Failed to load resume:', error)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    
    loadResume()
  }, [params, router])

  if (loading || !resume) {
    return <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <DashboardHeader userEmail={null} />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{resume.jobTitle} <BackButton /></h1>
          <p className="text-zinc-600 dark:text-zinc-400">{resume.company}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className={`border-2 ${
            (resume.atsScore || 0) >= 71 ? 'border-green-500 bg-green-50 dark:bg-green-950/20' :
            (resume.atsScore || 0) >= 41 ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' :
            'border-red-500 bg-red-50 dark:bg-red-950/20'
          }`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ATS Score</CardTitle>
              <Target className={`h-4 w-4 ${
                (resume.atsScore || 0) >= 71 ? 'text-green-600' :
                (resume.atsScore || 0) >= 41 ? 'text-orange-600' :
                'text-red-600'
              }`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${
                (resume.atsScore || 0) >= 71 ? 'text-green-600' :
                (resume.atsScore || 0) >= 41 ? 'text-orange-600' :
                'text-red-600'
              }`}>{resume.atsScore || 0}%</div>
              <p className={`text-xs font-medium mt-1 ${
                (resume.atsScore || 0) >= 71 ? 'text-green-700 dark:text-green-400' :
                (resume.atsScore || 0) >= 41 ? 'text-orange-700 dark:text-orange-400' :
                'text-red-700 dark:text-red-400'
              }`}>
                {(resume.atsScore || 0) >= 71 ? '✓ Excellent match!' : (resume.atsScore || 0) >= 41 ? '⚠ Needs improvement' : '✗ Very low - needs work'}
              </p>
            </CardContent>
          </Card>

          <Card className={`border-2 ${
            (resume.keywordMatch || 0) >= 71 ? 'border-green-500 bg-green-50 dark:bg-green-950/20' :
            (resume.keywordMatch || 0) >= 41 ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' :
            'border-red-500 bg-red-50 dark:bg-red-950/20'
          }`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Keyword Match</CardTitle>
              <TrendingUp className={`h-4 w-4 ${
                (resume.keywordMatch || 0) >= 71 ? 'text-green-600' :
                (resume.keywordMatch || 0) >= 41 ? 'text-orange-600' :
                'text-red-600'
              }`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${
                (resume.keywordMatch || 0) >= 71 ? 'text-green-600' :
                (resume.keywordMatch || 0) >= 41 ? 'text-orange-600' :
                'text-red-600'
              }`}>{resume.keywordMatch?.toFixed(0) || 0}%</div>
              <p className={`text-xs font-medium mt-1 ${
                (resume.keywordMatch || 0) >= 71 ? 'text-green-700 dark:text-green-400' :
                (resume.keywordMatch || 0) >= 41 ? 'text-orange-700 dark:text-orange-400' :
                'text-red-700 dark:text-red-400'
              }`}>
                {(resume.keywordMatch || 0) >= 71 ? '✓ Great coverage!' : (resume.keywordMatch || 0) >= 41 ? '⚠ Could be better' : '✗ Low keyword match'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <FileText className="h-4 w-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">Ready</div>
              <p className="text-xs text-zinc-500 mt-1">
                Download and apply
              </p>
            </CardContent>
          </Card>

          <div onClick={() => setProfileModalOpen(true)} className="block transition-transform hover:scale-105 cursor-pointer">
            <Card className="border-2 border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI-Powered Profile</CardTitle>
                <MessageSquare className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">✨ NEW</div>
                <p className="text-xs font-medium text-orange-700 dark:text-orange-400 mt-1">
                  Create shareable profile with AI chatbot
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Optimized Resume</CardTitle>
                  <CardDescription>
                    Tailored for this specific job posting
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <ResumeModal resumeText={resume.tailoredResumeText} />
                  {/* <ResumeActionsMenu resumeId={resume.id} /> */}
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 max-h-[300px] overflow-hidden relative border border-zinc-200 dark:border-zinc-800">
                  <MarkdownRenderer content={resume.tailoredResumeText.split('\n').slice(0, 15).join('\n')} />
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-zinc-900 to-transparent" />
                </div>
                <p className="text-xs text-center text-zinc-500 mt-2">
                  Showing preview - Click "View Full Resume" to see complete content
                </p>
              </CardContent>
            </Card>

            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
              <RefreshCw className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">Not satisfied?</span>
              <div className="ml-auto">
                <ReoptimizeButton resumeId={resume.id} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Mail className="h-5 w-5" />
                  Cover Letter
                </CardTitle>
                <CardDescription>
                  Generate a tailored cover letter for this application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CoverLetterGenerator resumeId={resume.id} />
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <MessageSquare className="h-5 w-5" />
                  Professional Brief
                </CardTitle>
                <CardDescription>
                  AI-generated summary for your public profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BriefGenerator 
                  resumeId={resume.id} 
                  onBriefGenerated={setGeneratedBrief}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
                <CardDescription>
                  Original posting used for optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6 max-h-[300px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">
                    {resume.jobDescription || 'No job description available'}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <CreatePublicProfileModal 
        resumeId={resume.id} 
        open={profileModalOpen} 
        onOpenChange={setProfileModalOpen}
        initialBrief={generatedBrief}
      />
    </div>
  )
}
