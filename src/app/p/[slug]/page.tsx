import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ChatBox } from '@/components/chat-box'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Briefcase, Award } from 'lucide-react'

export default async function PublicProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const profile = await prisma.publicProfile.findUnique({
    where: { slug, isActive: true },
  })

  if (!profile) {
    notFound()
  }

  const skills = JSON.parse(profile.skills) as string[]
  const experience = JSON.parse(profile.experience) as Array<{
    company: string
    role: string
    summary: string
  }>

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
                    <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-2">
                      {profile.headline}
                    </p>
                    {profile.location && (
                      <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Skills */}
            {skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, i) => (
                      <span
                        key={i}
                        className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {experience.map((exp, i) => (
                    <div key={i} className="border-l-2 border-blue-500 pl-4">
                      <h3 className="font-semibold text-lg">{exp.role}</h3>
                      <p className="text-zinc-600 dark:text-zinc-400 mb-2">
                        {exp.company}
                      </p>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300">
                        {exp.summary}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Full Resume */}
            <Card>
              <CardHeader>
                <CardTitle>Full Resume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm font-mono text-zinc-700 dark:text-zinc-300">
                    {profile.resumeText}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Chat */}
          <div className="lg:col-span-1">
            <ChatBox slug={profile.slug} />
          </div>
        </div>
      </div>
    </div>
  )
}
