'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Download, Save, Edit, Sparkles, Layout } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { ModernTemplate } from '@/components/resume-templates/modern-template'
import { ClassicTemplate } from '@/components/resume-templates/classic-template'
import { MinimalTemplate } from '@/components/resume-templates/minimal-template'

type TemplateType = 'markdown' | 'modern' | 'classic' | 'minimal'

interface ReviewStepProps {
  generatedResume: string
  onBack: () => void
  formData?: any
}

export function ReviewStep({ generatedResume, onBack, formData }: ReviewStepProps) {
  const router = useRouter()
  const [resume, setResume] = useState(generatedResume)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('modern')

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/profile/save-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: resume }),
      })

      if (response.ok) {
        // Clear wizard data from localStorage after successful save
        localStorage.removeItem('resumeWizardData')
        localStorage.removeItem('resumeWizardStep')
        localStorage.removeItem('resumeWizardGenerated')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleRegenerate = async () => {
    if (!formData) return
    
    setRegenerating(true)
    try {
      const response = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to regenerate resume')
      }

      setResume(data.resume)
      localStorage.setItem('resumeWizardGenerated', data.resume)
    } catch (error) {
      console.error('Regenerate error:', error)
      alert('Failed to regenerate resume. Please try again.')
    } finally {
      setRegenerating(false)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([resume], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'resume.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Your Professional Resume</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Choose a template and review your resume before saving or downloading
        </p>
      </div>

      {/* Template Selector */}
      {!isEditing && (
        <div className="flex items-center gap-2 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <Layout className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Template:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTemplate('modern')}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                selectedTemplate === 'modern'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700'
              }`}
            >
              Modern
            </button>
            <button
              onClick={() => setSelectedTemplate('classic')}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                selectedTemplate === 'classic'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700'
              }`}
            >
              Classic
            </button>
            <button
              onClick={() => setSelectedTemplate('minimal')}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                selectedTemplate === 'minimal'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700'
              }`}
            >
              Minimal
            </button>
            <button
              onClick={() => setSelectedTemplate('markdown')}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                selectedTemplate === 'markdown'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700'
              }`}
            >
              Simple
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {isEditing ? (
          <Textarea
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            rows={20}
            className="font-mono text-sm"
          />
        ) : (
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden max-h-[600px] overflow-y-auto">
            {selectedTemplate === 'modern' && <ModernTemplate content={resume} />}
            {selectedTemplate === 'classic' && <ClassicTemplate content={resume} />}
            {selectedTemplate === 'minimal' && <MinimalTemplate content={resume} />}
            {selectedTemplate === 'markdown' && (
              <div className="bg-white dark:bg-zinc-900 p-6">
                <MarkdownRenderer content={resume} />
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant="outline"
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? 'Preview' : 'Edit Resume'}
          </Button>

          <Button
            onClick={handleRegenerate}
            variant="outline"
            disabled={regenerating}
          >
            {regenerating ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Regenerate
              </>
            )}
          </Button>

          <Button
            onClick={handleDownload}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="ml-auto"
          >
            {saving ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save to Dashboard
              </>
            )}
          </Button>
        </div>

        <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
            🎉 Next Steps
          </h3>
          <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
            <li>• Save this resume to your dashboard</li>
            <li>• Use it to optimize for specific job postings</li>
            <li>• Create a public profile to share with recruiters</li>
            <li>• Track your applications in the application tracker</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
