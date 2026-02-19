'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2 } from 'lucide-react'
import { ResumeFormData } from '@/app/dashboard/create/page'

interface ExperienceStepProps {
  formData: ResumeFormData
  updateFormData: (section: string, data: any) => void
}

export function ExperienceStep({ formData, updateFormData }: ExperienceStepProps) {
  const addExperience = () => {
    updateFormData('experience', [
      ...formData.experience,
      { role: '', company: '', duration: '', description: '', type: 'internship' },
    ])
  }

  const removeExperience = (index: number) => {
    updateFormData(
      'experience',
      formData.experience.filter((_, i) => i !== index)
    )
  }

  const updateExperience = (index: number, field: string, value: string) => {
    const updated = [...formData.experience]
    updated[index] = { ...updated[index], [field]: value }
    updateFormData('experience', updated)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Experience</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Add any work experience, internships, volunteer work, or freelance projects
        </p>
      </div>

      <div className="space-y-6">
        {formData.experience.map((exp, index) => (
          <div key={index} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Experience {index + 1}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeExperience(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <select
                  value={exp.type}
                  onChange={(e) => updateExperience(index, 'type', e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950"
                >
                  <option value="internship">Internship</option>
                  <option value="part-time">Part-time Job</option>
                  <option value="volunteer">Volunteer Work</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>

              <div>
                <Label>Duration</Label>
                <Input
                  placeholder="e.g., Jun 2023 - Aug 2023"
                  value={exp.duration}
                  onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Role / Position</Label>
              <Input
                placeholder="e.g., Software Engineering Intern"
                value={exp.role}
                onChange={(e) => updateExperience(index, 'role', e.target.value)}
              />
            </div>

            <div>
              <Label>Company / Organization</Label>
              <Input
                placeholder="e.g., Tech Startup Ltd"
                value={exp.company}
                onChange={(e) => updateExperience(index, 'company', e.target.value)}
              />
            </div>

            <div>
              <Label>What did you do?</Label>
              <Textarea
                placeholder="Describe your responsibilities and achievements..."
                value={exp.description}
                onChange={(e) => updateExperience(index, 'description', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        ))}

        <Button onClick={addExperience} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Experience
        </Button>

        {formData.experience.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
            No experience yet? That's okay! Add any relevant work, even if it's not in your target field.
          </p>
        )}
      </div>
    </div>
  )
}
