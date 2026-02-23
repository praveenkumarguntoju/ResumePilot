'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Mail, Phone } from 'lucide-react'
import { ResumeFormData } from '@/app/dashboard/create/page'

interface ContactStepProps {
  formData: ResumeFormData
  updateFormData: (section: string, data: any) => void
}

export function ContactStep({ formData, updateFormData }: ContactStepProps) {
  const handleInputChange = (field: string, value: string) => {
    updateFormData('contact', {
      ...formData.contact,
      [field]: value,
    })
  }

  const isFormValid = formData.contact.fullName.trim() !== '' && formData.contact.email.trim() !== ''

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Your Contact Information</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Add your contact details to appear on your resume
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Details
          </CardTitle>
          <CardDescription>
            This information will be displayed at the top of your resume
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={formData.contact.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.contact.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="pl-10 text-base"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.contact.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="pl-10 text-base"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
