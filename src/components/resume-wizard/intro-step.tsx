'use client'

import { Button } from '@/components/ui/button'
import { GraduationCap, Briefcase } from 'lucide-react'
import { ResumeFormData } from '@/app/dashboard/create/page'

interface IntroStepProps {
  formData: ResumeFormData
  updateFormData: (section: string, data: any) => void
  onNext: () => void
}

export function IntroStep({ formData, updateFormData, onNext }: IntroStepProps) {
  const handleSelect = (type: 'student' | 'career-change') => {
    updateFormData('userType', type)
    setTimeout(onNext, 300)
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Create Your First Professional Resume</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Let's build a resume that stands out. Choose your situation:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => handleSelect('student')}
          className={`p-6 border-2 rounded-lg transition-all hover:border-blue-500 hover:shadow-lg ${
            formData.userType === 'student'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
              : 'border-zinc-200 dark:border-zinc-800'
          }`}
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-lg">I'm a Student / Graduate</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Fresh graduate or still studying, looking to start my career
            </p>
          </div>
        </button>

        <button
          onClick={() => handleSelect('career-change')}
          className={`p-6 border-2 rounded-lg transition-all hover:border-purple-500 hover:shadow-lg ${
            formData.userType === 'career-change'
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
              : 'border-zinc-200 dark:border-zinc-800'
          }`}
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
              <Briefcase className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-lg">I'm Changing Careers</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Transitioning to a new field or industry
            </p>
          </div>
        </button>
      </div>
    </div>
  )
}
