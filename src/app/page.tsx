import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Target, FileText, Briefcase, Zap, Shield, MessageSquare, GraduationCap, TrendingUp, Bell, Users, ShieldCheck, CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/resume-pilot.png"
              alt="ResumePilot Logo"
              className="rounded-lg"
              width={250}
              height={250}
            />
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" className="text-zinc-900 dark:text-zinc-100">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-24 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-full text-sm font-medium mb-6 text-zinc-900 dark:text-zinc-100">
              <Sparkles className="h-4 w-4" />
              AI-Powered Career Platform
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-50 dark:to-zinc-400 bg-clip-text text-transparent">
              AI-Powered Career Platform for Everyone
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto">
              Build, optimise, and review resumes with AI. Check interview readiness, track applications, and get career advisor feedback — for job seekers, students, graduates, and university career services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100">
                  Sign In
                </Button>
              </Link>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-4">
              Free for individuals. University plans available for career services teams.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-4 text-zinc-900 dark:text-zinc-100">Everything You Need to Land Your Dream Job</h2>
          <p className="text-center text-zinc-600 dark:text-zinc-400 mb-12 max-w-2xl mx-auto">
            From building your first resume to acing interviews — powered by AI and backed by your university&apos;s career services.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">

            <Card className="relative border-2 border-blue-400 dark:border-blue-600 hover:shadow-xl transition-all">
              <div className="absolute -top-3 left-4">
                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  <Sparkles className="h-3 w-3" />
                  AI POWERED
                </span>
              </div>
              <CardHeader className="pt-7">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Create Resume</CardTitle>
                    <CardDescription className="mt-2">
                      Build a professional resume from scratch with our AI-guided wizard. Perfect for students and graduates.
                    </CardDescription>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0 ml-3">
                    <GraduationCap className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="relative border-2 border-amber-400 dark:border-amber-600 hover:shadow-xl transition-all">
              <div className="absolute -top-3 left-4">
                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  <Sparkles className="h-3 w-3" />
                  AI POWERED
                </span>
              </div>
              <CardHeader className="pt-7">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Optimize Resume</CardTitle>
                    <CardDescription className="mt-2">
                      Paste any job description and get a tailored resume optimized for ATS systems with the right keywords.
                    </CardDescription>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center shrink-0 ml-3">
                    <Target className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="relative border-2 border-rose-400 dark:border-rose-600 hover:shadow-xl transition-all">
              <div className="absolute -top-3 left-4">
                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  <Sparkles className="h-3 w-3" />
                  NEW
                </span>
              </div>
              <CardHeader className="pt-7">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>AI Resume Review</CardTitle>
                    <CardDescription className="mt-2">
                      Get detailed AI feedback on your resume — identify weaknesses, improve phrasing, and boost your chances.
                    </CardDescription>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center shrink-0 ml-3">
                    <FileText className="h-6 w-6 text-rose-600" />
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="relative border-2 border-cyan-400 dark:border-cyan-600 hover:shadow-xl transition-all">
              <div className="absolute -top-3 left-4">
                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  <Sparkles className="h-3 w-3" />
                  AI POWERED
                </span>
              </div>
              <CardHeader className="pt-7">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Interview Readiness Score</CardTitle>
                    <CardDescription className="mt-2">
                      AI analyses your resume, skills, and experience to give you a readiness score with actionable tips.
                    </CardDescription>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-cyan-100 dark:bg-cyan-950 flex items-center justify-center shrink-0 ml-3">
                    <TrendingUp className="h-6 w-6 text-cyan-600" />
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="relative border-2 border-orange-400 dark:border-orange-600 hover:shadow-xl transition-all">
              <div className="absolute -top-3 left-4">
                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  <Sparkles className="h-3 w-3" />
                  AI POWERED
                </span>
              </div>
              <CardHeader className="pt-7">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Public Profile &amp; AI Chatbot</CardTitle>
                    <CardDescription className="mt-2">
                      Create a shareable profile with an AI chatbot that answers recruiter questions about your experience 24/7.
                    </CardDescription>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center shrink-0 ml-3">
                    <MessageSquare className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Application Tracker</CardTitle>
                    <CardDescription className="mt-2">
                      Manage all your job applications in a beautiful Kanban board. Track status, deadlines, and notes.
                    </CardDescription>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center shrink-0 ml-3">
                    <Briefcase className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardHeader>
            </Card>

          </div>
        </section>

        {/* University Portal Section */}
        <section className="bg-zinc-100 dark:bg-zinc-900 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4 text-zinc-900 dark:text-zinc-100">Built for Universities</h2>
            <p className="text-center text-zinc-600 dark:text-zinc-400 mb-12 max-w-2xl mx-auto">
              A dedicated portal for universities to support students with career services, advisor feedback, and opportunity sharing.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div className="text-center p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-sm">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Student Dashboard</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Students access AI tools, track readiness, and receive advisor feedback in one place.
                </p>
              </div>
              <div className="text-center p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-sm">
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-950 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Career Advisor</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Advisors review student profiles, add personalised feedback, and track interview readiness.
                </p>
              </div>
              <div className="text-center p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-sm">
                <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-950 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-7 w-7 text-yellow-600" />
                </div>
                <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Opportunity Alerts</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Admins and advisors share job opportunities, graduate schemes, and internships directly with students.
                </p>
              </div>
              <div className="text-center p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-sm">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">GDPR Compliant</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Students control their data with explicit consent management. Full GDPR compliance built in.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-zinc-900 dark:text-zinc-100">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Create or Upload</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Build a resume from scratch with AI or upload your existing one
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Optimize &amp; Review</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Tailor your resume for specific jobs and get AI-powered feedback
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Check Readiness</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Get your interview readiness score and actionable improvement tips
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Apply &amp; Track</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Download your resume, apply with confidence, and track all applications
              </p>
            </div>
          </div>
        </section>

        {/* Why ResumePilot */}
        <section className="bg-zinc-100 dark:bg-zinc-900 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-zinc-900 dark:text-zinc-100">Why ResumePilot?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-950 flex items-center justify-center shrink-0">
                  <Zap className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-zinc-900 dark:text-zinc-100">Lightning Fast</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Get optimized resumes in seconds, not hours
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-zinc-900 dark:text-zinc-100">ATS-Optimized</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Beat applicant tracking systems with keyword-rich resumes
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center shrink-0">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-zinc-900 dark:text-zinc-100">Privacy First</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Your data is encrypted and never shared. Full GDPR compliance.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center shrink-0">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-zinc-900 dark:text-zinc-100">University Ready</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Dedicated portals for universities with advisor and student dashboards
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-cyan-100 dark:bg-cyan-950 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-zinc-900 dark:text-zinc-100">Interview Ready</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    AI-powered readiness scoring to know when you&apos;re prepared
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center shrink-0">
                  <MessageSquare className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-zinc-900 dark:text-zinc-100">AI Chatbot Profile</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Shareable profiles with an AI chatbot that answers recruiter questions 24/7
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-zinc-900 dark:bg-zinc-950 text-zinc-50 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Land Your Dream Job?</h2>
            <p className="text-xl text-zinc-300 mb-8 max-w-2xl mx-auto">
              Join thousands of job seekers who have optimized their resumes with ResumePilot
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                <Sparkles className="mr-2 h-5 w-5" />
                Get Started Free
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          <p>&copy; 2026 ResumePilot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
