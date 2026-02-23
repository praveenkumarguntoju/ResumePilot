'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader2, ArrowLeft, Sparkles, Link2 } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { DashboardHeader } from '@/components/dashboard-header'
import { BackButton } from '@/components/back-button'

export default function OptimizePage() {
  const router = useRouter()
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState('')

  const handleExtractFromUrl = async () => {
    if (!jobUrl) return
    
    setError('')
    setExtracting(true)

    try {
      const response = await fetch('/api/job/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: jobUrl }),
      })

      const data = await response.json()

      if (response.ok) {
        setJobTitle(data.jobTitle)
        setCompany(data.company)
        setJobDescription(data.jobDescription)
        
        // Auto-submit after successful extraction
        setExtracting(false)
        await handleOptimizeWithData(data.jobTitle, data.company, data.jobDescription)
      } else {
        setError(data.error || 'Failed to extract job details')
        setExtracting(false)
      }
    } catch (err) {
      setError('Failed to extract job details from URL')
      setExtracting(false)
    }
  }

  const handleOptimizeWithData = async (title: string, comp: string, desc: string) => {
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/resume/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: title,
          company: comp,
          jobDescription: desc,
          jobUrl: jobUrl || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Optimization failed')
      }

      router.push(`/dashboard/resumes/${data.resumeId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to optimize resume')
    } finally {
      setLoading(false)
    }
  }

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/resume/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle,
          company,
          jobDescription,
          jobUrl: jobUrl || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Optimization failed')
      }

      router.push(`/dashboard/resumes/${data.resumeId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to optimize resume')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <DashboardHeader userEmail={null} />
      
      

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Optimize Resume <BackButton /></h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Paste the job description and we&apos;ll tailor your resume with AI
          </p>
        </div>

        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900 rounded-lg">
          <h3 className="font-medium text-sm mb-2">💡 Two ways to optimize:</h3>
          <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
            <li>• <strong>Quick:</strong> Paste a job URL (LinkedIn, Indeed, CV-Library) and click the button</li>
            <li>• <strong>Manual:</strong> Fill in job details manually and click the button</li>
            <li>• The button changes based on whether you provide a URL or manual details</li>
          </ul>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Job Details
            </CardTitle>
            <CardDescription>
              Provide the job information to optimize your resume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOptimize} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="jobUrl" className="text-sm font-medium">
                  Job URL (Optional)
                </label>
                <Input
                  id="jobUrl"
                  type="url"
                  placeholder="e.g., https://linkedin.com/jobs/view/123456 or Indeed/CV-Library URL"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  disabled={loading || extracting}
                />
                <p className="text-xs text-zinc-500">
                  {jobUrl 
                    ? 'Click "Extract & Optimize from URL" button below to auto-extract and optimize'
                    : 'Or paste a job URL and click the button below to auto-extract'}
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="jobTitle" className="text-sm font-medium">
                  Job Title {!jobUrl && <span className="text-red-500">*</span>}
                </label>
                <Input
                  id="jobTitle"
                  placeholder="e.g., Senior Software Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required={!jobUrl}
                  disabled={loading || extracting}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="company" className="text-sm font-medium">
                  Company {!jobUrl && <span className="text-red-500">*</span>}
                </label>
                <Input
                  id="company"
                  placeholder="e.g., Google"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required={!jobUrl}
                  disabled={loading || extracting}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="jobDescription" className="text-sm font-medium">
                  Job Description {!jobUrl && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  id="jobDescription"
                  className="flex min-h-[300px] w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                  placeholder="Paste the full job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  required={!jobUrl}
                  disabled={loading || extracting}
                />
                <p className="text-xs text-zinc-500">
                  Include requirements, responsibilities, and qualifications
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <Button 
                type={jobUrl ? "button" : "submit"} 
                className="w-full" 
                size="lg" 
                disabled={loading || extracting}
                onClick={jobUrl ? handleExtractFromUrl : undefined}
              >
                {loading || extracting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {extracting ? 'Extracting & Optimizing...' : 'Optimizing with AI...'}
                  </>
                ) : (
                  <>
                    {jobUrl ? <Link2 className="mr-2 h-5 w-5" /> : <Sparkles className="mr-2 h-5 w-5" />}
                    {jobUrl ? 'Extract & Optimize from URL' : 'Optimize Resume'}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
