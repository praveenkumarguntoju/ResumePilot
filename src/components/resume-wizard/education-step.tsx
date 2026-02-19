'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import { ResumeFormData } from '@/app/dashboard/create/page'

interface EducationStepProps {
  formData: ResumeFormData
  updateFormData: (section: string, data: any) => void
}

export function EducationStep({ formData, updateFormData }: EducationStepProps) {
  const [moduleInput, setModuleInput] = useState('')

  const handleChange = (field: string, value: string) => {
    updateFormData('education', {
      ...formData.education,
      [field]: value,
    })
  }

  const addModule = () => {
    if (moduleInput.trim()) {
      updateFormData('education', {
        ...formData.education,
        modules: [...formData.education.modules, moduleInput.trim()],
      })
      setModuleInput('')
    }
  }

  const removeModule = (index: number) => {
    updateFormData('education', {
      ...formData.education,
      modules: formData.education.modules.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Education</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Tell us about your academic background
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="degree">Degree *</Label>
          <Input
            id="degree"
            placeholder="e.g., BSc, MSc, BA"
            value={formData.education.degree}
            onChange={(e) => handleChange('degree', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="field">Field of Study *</Label>
          <Input
            id="field"
            placeholder="e.g., Computer Science, Business Administration"
            value={formData.education.field}
            onChange={(e) => handleChange('field', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="university">University *</Label>
          <Input
            id="university"
            placeholder="e.g., University of London"
            value={formData.education.university}
            onChange={(e) => handleChange('university', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="gradYear">Graduation Year *</Label>
            <Input
              id="gradYear"
              placeholder="e.g., 2024"
              value={formData.education.gradYear}
              onChange={(e) => handleChange('gradYear', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="grade">Grade (Optional)</Label>
            <Input
              id="grade"
              placeholder="e.g., First Class, 3.8 GPA"
              value={formData.education.grade}
              onChange={(e) => handleChange('grade', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="modules">Relevant Modules (Optional)</Label>
          <div className="flex gap-2 mb-2">
            <Input
              id="modules"
              placeholder="e.g., Machine Learning, Data Structures"
              value={moduleInput}
              onChange={(e) => setModuleInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addModule())}
            />
            <Button type="button" onClick={addModule} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.education.modules.map((module, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-full text-sm"
              >
                {module}
                <button onClick={() => removeModule(index)} className="hover:text-blue-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
