'use client'

import { useState, useEffect, useRef } from 'react'
import { DashboardHeader } from '@/components/dashboard-header'
import { BackButton } from '@/components/back-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Camera, Trash2, User, Eye, EyeOff, Save } from 'lucide-react'
import Image from 'next/image'

interface UserSettings {
  id: string
  name: string | null
  email: string
  profileImage: string | null
  showImageOnProfile: boolean
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [name, setName] = useState('')
  const [showImageOnProfile, setShowImageOnProfile] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch('/api/profile/settings')
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
          setName(data.name || '')
          setShowImageOnProfile(data.showImageOnProfile)
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      showMessage('error', 'Only JPEG, PNG, WebP, and GIF images are allowed.')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      showMessage('error', 'Image must be smaller than 2MB.')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/profile/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(prev => prev ? { ...prev, profileImage: data.profileImage } : null)
        showMessage('success', 'Profile image updated!')
      } else {
        const error = await response.json()
        showMessage('error', error.error || 'Failed to upload image.')
      }
    } catch (error) {
      console.error('Upload error:', error)
      showMessage('error', 'Failed to upload image.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveImage = async () => {
    if (!confirm('Remove your profile image?')) return

    setRemoving(true)
    try {
      const response = await fetch('/api/profile/upload-image', {
        method: 'DELETE',
      })

      if (response.ok) {
        setSettings(prev => prev ? { ...prev, profileImage: null } : null)
        showMessage('success', 'Profile image removed.')
      } else {
        showMessage('error', 'Failed to remove image.')
      }
    } catch (error) {
      console.error('Remove error:', error)
      showMessage('error', 'Failed to remove image.')
    } finally {
      setRemoving(false)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/profile/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, showImageOnProfile }),
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        showMessage('success', 'Settings saved!')
      } else {
        showMessage('error', 'Failed to save settings.')
      }
    } catch (error) {
      console.error('Save error:', error)
      showMessage('error', 'Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <DashboardHeader />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <BackButton />

        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Settings</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">
          Manage your profile and preferences
        </p>

        {/* Toast Message */}
        {message && (
          <div className={`mb-6 p-3 rounded-lg text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Profile Image */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-blue-600" />
              Profile Image
            </CardTitle>
            <CardDescription>
              Upload a profile photo. This will be displayed across the application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              {/* Image Preview */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center border-2 border-zinc-300 dark:border-zinc-600">
                  {settings?.profileImage ? (
                    <Image
                      src={settings.profileImage}
                      alt="Profile"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-zinc-400 dark:text-zinc-500" />
                  )}
                </div>
                {uploading && (
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {settings?.profileImage ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                  {settings?.profileImage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveImage}
                      disabled={removing}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 border-red-200 dark:border-red-800"
                    >
                      {removing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-zinc-500">
                  JPEG, PNG, WebP or GIF. Max 2MB.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your display name and profile preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={settings?.email || ''}
                disabled
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 cursor-not-allowed"
              />
              <p className="text-xs text-zinc-500 mt-1">Email cannot be changed</p>
            </div>
          </CardContent>
        </Card>

        {/* Public Profile Visibility */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {showImageOnProfile ? (
                <Eye className="h-5 w-5 text-green-600" />
              ) : (
                <EyeOff className="h-5 w-5 text-zinc-400" />
              )}
              Public Profile
            </CardTitle>
            <CardDescription>
              Control whether your profile image is visible on your public profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Show profile image on public profile
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  When enabled, your photo will appear on your public profile page
                </p>
              </div>
              <button
                onClick={() => setShowImageOnProfile(!showImageOnProfile)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  showImageOnProfile ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-600'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    showImageOnProfile ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSaveSettings}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>
      </main>
    </div>
  )
}
