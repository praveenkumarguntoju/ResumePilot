'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, GraduationCap, Briefcase } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggle } from '@/components/theme-toggle'
import { DashboardHeader } from '@/components/dashboard-header'
import { IntroStep } from '@/components/resume-wizard/intro-step'
import { EducationStep } from '@/components/resume-wizard/education-step'
import { ExperienceStep } from '@/components/resume-wizard/experience-step'
import { ProjectsStep } from '@/components/resume-wizard/projects-step'
import { SkillsStep } from '@/components/resume-wizard/skills-step'
import { TargetRoleStep } from '@/components/resume-wizard/target-role-step'
import { GeneratingStep } from '@/components/resume-wizard/generating-step'
import { ReviewStep } from '@/components/resume-wizard/review-step'
import { ContactStep } from '@/components/resume-wizard/contact-step'

export interface ResumeFormData {
  contact: {
    fullName: string
    email: string
    phone: string
  }
  userType: 'student' | 'career-change' | ''
  education: {
    degree: string
    field: string
    university: string
    gradYear: string
    grade: string
    modules: string[]
  }
  experience: Array<{
    role: string
    company: string
    duration: string
    description: string
    type: 'internship' | 'part-time' | 'volunteer' | 'freelance'
  }>
  projects: Array<{
    name: string
    tools: string[]
    problem: string
    contribution: string
  }>
  skills: {
    technical: string[]
    soft: string[]
    languages: string[]
    certifications: string[]
  }
  targetRole: {
    role: string
    location: string
    industry: string
  }
}

const STEPS = [
  { id: 0, name: 'Intro', component: IntroStep },
  { id: 1, name: 'Contact', component: ContactStep },
  { id: 2, name: 'Education', component: EducationStep },
  { id: 3, name: 'Experience', component: ExperienceStep },
  { id: 4, name: 'Projects', component: ProjectsStep },
  { id: 5, name: 'Skills', component: SkillsStep },
  { id: 6, name: 'Target Role', component: TargetRoleStep },
  { id: 7, name: 'Generate', component: GeneratingStep },
  { id: 8, name: 'Review', component: ReviewStep },
]

export default function CreateResumePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<ResumeFormData>({
    contact: {
      fullName: '',
      email: '',
      phone: '',
    },
    userType: '',
    education: {
      degree: '',
      field: '',
      university: '',
      gradYear: '',
      grade: '',
      modules: [],
    },
    experience: [],
    projects: [],
    skills: {
      technical: [],
      soft: [],
      languages: [],
      certifications: [],
    },
    targetRole: {
      role: '',
      location: '',
      industry: '',
    },
  })
  const [generatedResume, setGeneratedResume] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('resumeWizardData')
    const savedStep = localStorage.getItem('resumeWizardStep')
    const savedResume = localStorage.getItem('resumeWizardGenerated')

    if (savedData) {
      try {
        setFormData(JSON.parse(savedData))
      } catch (e) {
        console.error('Failed to parse saved data:', e)
      }
    }

    if (savedStep) {
      setCurrentStep(parseInt(savedStep, 10))
    }

    if (savedResume) {
      setGeneratedResume(savedResume)
    }

    setIsLoaded(true)
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('resumeWizardData', JSON.stringify(formData))
    }
  }, [formData, isLoaded])

  // Save current step
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('resumeWizardStep', currentStep.toString())
    }
  }, [currentStep, isLoaded])

  // Save generated resume
  useEffect(() => {
    if (isLoaded && generatedResume) {
      localStorage.setItem('resumeWizardGenerated', generatedResume)
    }
  }, [generatedResume, isLoaded])

  const updateFormData = (section: string, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: data,
    }))
  }

  const clearWizardData = () => {
    localStorage.removeItem('resumeWizardData')
    localStorage.removeItem('resumeWizardStep')
    localStorage.removeItem('resumeWizardGenerated')
  }

  const handleNext = () => {
    // Validate contact step
    if (currentStep === 1) {
      const isContactValid = formData.contact.fullName.trim() !== '' && formData.contact.email.trim() !== ''
      if (!isContactValid) {
        alert('Please fill in your full name and email address to continue.')
        return
      }
    }
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const CurrentStepComponent = STEPS[currentStep].component

  const progress = ((currentStep + 1) / STEPS.length) * 100

  // Don't render until data is loaded from localStorage
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Image 
                src="/images/resume-pilot.png" 
                alt="ResumePilot Logo"
                className="rounded-lg cursor-pointer"
                width={250} 
                height={250}
              />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm('Are you sure you want to start over? All progress will be lost.')) {
                    clearWizardData()
                    window.location.reload()
                  }
                }}
              >
                Start Over
              </Button>
            )}
            <Link href="/dashboard">
              <Button>Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Your First Resume</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].name}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="pt-6">
            <CurrentStepComponent
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
              setGeneratedResume={setGeneratedResume}
              generatedResume={generatedResume}
            />
            {/* Pass formData to ReviewStep for regeneration */}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        {currentStep < 7 && (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
