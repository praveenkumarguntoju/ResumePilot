'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, Globe, Copy, Check } from 'lucide-react'

interface CreatePublicProfileModalProps {
  resumeId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreatePublicProfileModal({ resumeId, open, onOpenChange }: CreatePublicProfileModalProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [headline, setHeadline] = useState('')
  const [location, setLocation] = useState('')
  const [availability, setAvailability] = useState('')
  const [dayRate, setDayRate] = useState('')
  const [annualSalary, setAnnualSalary] = useState('')
  const [jobType, setJobType] = useState('')
  const [visaSponsorshipReq, setVisaSponsorshipReq] = useState(false)
  const [contactNumber, setContactNumber] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [profileUrl, setProfileUrl] = useState('')
  const [copied, setCopied] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/profile/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId,
          name,
          headline,
          location,
          availability,
          dayRate,
          annualSalary,
          jobType,
          visaSponsorshipReq,
          contactNumber,
          additionalNotes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.details 
          ? `${data.error}: ${data.details}` 
          : data.error || 'Failed to create profile'
        throw new Error(errorMsg)
      }

      const fullUrl = `${window.location.origin}${data.url}`
      setProfileUrl(fullUrl)
    } catch (err) {
      console.error('Create profile error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create public profile')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (profileUrl) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Globe className="h-5 w-5" />
              Public Profile Created!
            </DialogTitle>
            <DialogDescription>
              Share this link with recruiters and employers
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={profileUrl}
                readOnly
                className="bg-white dark:bg-zinc-900"
              />
              <Button onClick={copyToClipboard} variant="outline">
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <Button
              onClick={() => window.open(profileUrl, '_blank')}
              className="w-full"
            >
              View Public Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Create Public Profile
          </DialogTitle>
          <DialogDescription>
            Share your resume with recruiters via AI-powered chat
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="headline" className="text-sm font-medium">
              Professional Headline
            </label>
            <Input
              id="headline"
              placeholder="Full Stack Developer"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium">
              Location (Optional)
            </label>
            <Input
              id="location"
              placeholder="London, UK"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="availability" className="text-sm font-medium">
                Availability (Optional)
              </label>
              <Input
                id="availability"
                placeholder="Immediate / 2 weeks notice"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="contactNumber" className="text-sm font-medium">
                Contact Number (Optional)
              </label>
              <Input
                id="contactNumber"
                type="tel"
                placeholder="+44 7123 456789"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="dayRate" className="text-sm font-medium">
                Day Rate (Optional)
              </label>
              <Input
                id="dayRate"
                placeholder="£500/day"
                value={dayRate}
                onChange={(e) => setDayRate(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="annualSalary" className="text-sm font-medium">
                Annual Salary (Optional)
              </label>
              <Input
                id="annualSalary"
                placeholder="£60,000 - £80,000"
                value={annualSalary}
                onChange={(e) => setAnnualSalary(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="jobType" className="text-sm font-medium">
              Job Type Preference (Optional)
            </label>
            <select
              id="jobType"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              disabled={loading}
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
            >
              <option value="">Select job type</option>
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
              <option value="Contract">Contract</option>
              <option value="Freelance">Freelance</option>
              <option value="Permanent">Permanent</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="visaSponsorshipReq"
              checked={visaSponsorshipReq}
              onChange={(e) => setVisaSponsorshipReq(e.target.checked)}
              disabled={loading}
              className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus:ring-zinc-300"
            />
            <label htmlFor="visaSponsorshipReq" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Visa Sponsorship Required
            </label>
          </div>

          <div className="space-y-2">
            <label htmlFor="additionalNotes" className="text-sm font-medium">
              Additional Information (Optional)
            </label>
            <textarea
              id="additionalNotes"
              placeholder="Add any additional information you'd like recruiters to know..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              disabled={loading}
              rows={4}
              className="flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              <>
                <Globe className="mr-2 h-4 w-4" />
                Create Public Profile
              </>
            )}
          </Button>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
            Recruiters will be able to view your resume and ask questions via AI chat
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
