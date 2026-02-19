'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import { ResumeFormData } from '@/app/dashboard/create/page'

interface SkillsStepProps {
  formData: ResumeFormData
  updateFormData: (section: string, data: any) => void
}

export function SkillsStep({ formData, updateFormData }: SkillsStepProps) {
  const [inputs, setInputs] = useState({
    technical: '',
    soft: '',
    languages: '',
    certifications: '',
  })

  const addSkill = (category: 'technical' | 'soft' | 'languages' | 'certifications') => {
    if (inputs[category].trim()) {
      updateFormData('skills', {
        ...formData.skills,
        [category]: [...formData.skills[category], inputs[category].trim()],
      })
      setInputs({ ...inputs, [category]: '' })
    }
  }

  const removeSkill = (category: 'technical' | 'soft' | 'languages' | 'certifications', index: number) => {
    updateFormData('skills', {
      ...formData.skills,
      [category]: formData.skills[category].filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Skills</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          List your technical skills, soft skills, languages, and certifications
        </p>
      </div>

      <div className="space-y-6">
        {/* Technical Skills */}
        <div>
          <Label>Technical Skills</Label>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
            Programming languages, frameworks, tools, software
          </p>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="e.g., JavaScript, React, Python, SQL"
              value={inputs.technical}
              onChange={(e) => setInputs({ ...inputs, technical: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('technical'))}
            />
            <Button type="button" onClick={() => addSkill('technical')} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.skills.technical.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-full text-sm"
              >
                {skill}
                <button onClick={() => removeSkill('technical', index)} className="hover:text-blue-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Soft Skills */}
        <div>
          <Label>Soft Skills</Label>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
            Communication, teamwork, problem-solving, leadership
          </p>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="e.g., Team Collaboration, Problem Solving"
              value={inputs.soft}
              onChange={(e) => setInputs({ ...inputs, soft: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('soft'))}
            />
            <Button type="button" onClick={() => addSkill('soft')} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.skills.soft.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-full text-sm"
              >
                {skill}
                <button onClick={() => removeSkill('soft', index)} className="hover:text-purple-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div>
          <Label>Languages</Label>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
            Spoken languages and proficiency level
          </p>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="e.g., English (Native), Spanish (Intermediate)"
              value={inputs.languages}
              onChange={(e) => setInputs({ ...inputs, languages: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('languages'))}
            />
            <Button type="button" onClick={() => addSkill('languages')} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.skills.languages.map((lang, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 rounded-full text-sm"
              >
                {lang}
                <button onClick={() => removeSkill('languages', index)} className="hover:text-green-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div>
          <Label>Certifications (Optional)</Label>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
            Professional certifications, online courses, awards
          </p>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="e.g., AWS Certified, Google Analytics"
              value={inputs.certifications}
              onChange={(e) => setInputs({ ...inputs, certifications: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('certifications'))}
            />
            <Button type="button" onClick={() => addSkill('certifications')} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.skills.certifications.map((cert, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 rounded-full text-sm"
              >
                {cert}
                <button onClick={() => removeSkill('certifications', index)} className="hover:text-orange-900">
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
