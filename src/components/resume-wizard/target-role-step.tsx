'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ResumeFormData } from '@/app/dashboard/create/page'

interface TargetRoleStepProps {
  formData: ResumeFormData
  updateFormData: (section: string, data: any) => void
}

export function TargetRoleStep({ formData, updateFormData }: TargetRoleStepProps) {
  const handleChange = (field: string, value: string) => {
    updateFormData('targetRole', {
      ...formData.targetRole,
      [field]: value,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Target Role</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Tell us about the job you're targeting so we can tailor your resume
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="role">What job role are you targeting? *</Label>
          <Input
            id="role"
            placeholder="e.g., Junior Software Engineer, Marketing Assistant"
            value={formData.targetRole.role}
            onChange={(e) => handleChange('role', e.target.value)}
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Be specific - this helps us align your resume with the role
          </p>
        </div>

        <div>
          <Label htmlFor="location">Location Preference</Label>
          <Input
            id="location"
            placeholder="e.g., London, Remote, Manchester"
            value={formData.targetRole.location}
            onChange={(e) => handleChange('location', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="industry">Industry (Optional)</Label>
          <Input
            id="industry"
            placeholder="e.g., Fintech, Healthcare, E-commerce"
            value={formData.targetRole.industry}
            onChange={(e) => handleChange('industry', e.target.value)}
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Helps us use industry-specific terminology
          </p>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            💡 Pro Tip
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            The more specific you are about your target role, the better we can tailor your resume to match what employers are looking for.
          </p>
        </div>
      </div>
    </div>
  )
}
