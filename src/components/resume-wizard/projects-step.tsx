'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, X } from 'lucide-react'
import { ResumeFormData } from '@/app/dashboard/create/page'

interface ProjectsStepProps {
  formData: ResumeFormData
  updateFormData: (section: string, data: any) => void
}

export function ProjectsStep({ formData, updateFormData }: ProjectsStepProps) {
  const [toolInput, setToolInput] = useState<string[]>([])

  const addProject = () => {
    updateFormData('projects', [
      ...formData.projects,
      { name: '', tools: [], problem: '', contribution: '' },
    ])
    setToolInput([...toolInput, ''])
  }

  const removeProject = (index: number) => {
    updateFormData(
      'projects',
      formData.projects.filter((_, i) => i !== index)
    )
    setToolInput(toolInput.filter((_, i) => i !== index))
  }

  const updateProject = (index: number, field: string, value: any) => {
    const updated = [...formData.projects]
    updated[index] = { ...updated[index], [field]: value }
    updateFormData('projects', updated)
  }

  const addTool = (projectIndex: number) => {
    if (toolInput[projectIndex]?.trim()) {
      const updated = [...formData.projects]
      updated[projectIndex].tools = [...updated[projectIndex].tools, toolInput[projectIndex].trim()]
      updateFormData('projects', updated)
      
      const newToolInput = [...toolInput]
      newToolInput[projectIndex] = ''
      setToolInput(newToolInput)
    }
  }

  const removeTool = (projectIndex: number, toolIndex: number) => {
    const updated = [...formData.projects]
    updated[projectIndex].tools = updated[projectIndex].tools.filter((_, i) => i !== toolIndex)
    updateFormData('projects', updated)
  }

  const updateToolInput = (projectIndex: number, value: string) => {
    const newToolInput = [...toolInput]
    newToolInput[projectIndex] = value
    setToolInput(newToolInput)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Projects</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Showcase your academic, personal, or GitHub projects. This is crucial for demonstrating your skills!
        </p>
      </div>

      <div className="space-y-6">
        {formData.projects.map((project, index) => (
          <div key={index} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Project {index + 1}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeProject(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <Label>Project Name</Label>
              <Input
                placeholder="e.g., E-commerce Website, Machine Learning Model"
                value={project.name}
                onChange={(e) => updateProject(index, 'name', e.target.value)}
              />
            </div>

            <div>
              <Label>Tools & Technologies Used</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="e.g., React, Python, TensorFlow"
                  value={toolInput[index] || ''}
                  onChange={(e) => updateToolInput(index, e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTool(index))}
                />
                <Button type="button" onClick={() => addTool(index)} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.tools.map((tool, toolIndex) => (
                  <span
                    key={toolIndex}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 rounded-full text-sm"
                  >
                    {tool}
                    <button onClick={() => removeTool(index, toolIndex)} className="hover:text-green-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <Label>What problem did it solve?</Label>
              <Textarea
                placeholder="Describe the problem or challenge this project addressed..."
                value={project.problem}
                onChange={(e) => updateProject(index, 'problem', e.target.value)}
                rows={2}
              />
            </div>

            <div>
              <Label>Your contribution</Label>
              <Textarea
                placeholder="What was your role? What did you build or implement?"
                value={project.contribution}
                onChange={(e) => updateProject(index, 'contribution', e.target.value)}
                rows={2}
              />
            </div>
          </div>
        ))}

        <Button onClick={addProject} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>

        {formData.projects.length === 0 && (
          <div className="text-center p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-2">
              💡 Projects are extremely valuable for graduates!
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Include coursework, personal projects, hackathons, or open-source contributions
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
