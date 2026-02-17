import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Target, FileText, Briefcase, Zap, Shield, MessageSquare } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            <h1 className="text-xl font-bold">ResumePilot</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
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
            <div className="inline-flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered Resume Optimization
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-50 dark:to-zinc-400 bg-clip-text text-transparent">
              Land Your Dream Job with AI-Optimized Resumes
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto">
              Tailor your resume for every job posting with AI. Get higher ATS scores, generate cover letters, and track applications—all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Sign In
                </Button>
              </Link>
            </div>
            <p className="text-sm text-zinc-500 mt-4">
              Free plan includes 3 resume optimizations. No credit card required.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardHeader>
                <Target className="h-10 w-10 mb-4 text-blue-600" />
                <CardTitle>AI Resume Optimization</CardTitle>
                <CardDescription>
                  Paste any job description and get a tailored resume optimized for ATS systems
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="h-10 w-10 mb-4 text-green-600" />
                <CardTitle>Cover Letter Generation</CardTitle>
                <CardDescription>
                  Generate compelling cover letters that match your resume and the job requirements
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Briefcase className="h-10 w-10 mb-4 text-purple-600" />
                <CardTitle>Application Tracker</CardTitle>
                <CardDescription>
                  Manage all your job applications in a beautiful Kanban board
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative border-2 border-orange-500 dark:border-orange-600 shadow-lg">
              <div className="absolute -top-3 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                AI-Powered
              </div>
              <CardHeader>
                <MessageSquare className="h-10 w-10 mb-4 text-orange-600" />
                <CardTitle>Public Profile with AI Chatbot</CardTitle>
                <CardDescription>
                  Create a shareable profile with an AI chatbot that answers recruiter questions about your experience
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        <section className="bg-zinc-100 dark:bg-zinc-900 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="font-semibold mb-2">Upload Resume</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Upload your resume in PDF, DOCX, or TXT format
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="font-semibold mb-2">Paste Job Description</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Copy and paste the job posting you want to apply for
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="font-semibold mb-2">AI Optimization</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Our AI tailors your resume with relevant keywords and skills
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  4
                </div>
                <h3 className="font-semibold mb-2">Download & Apply</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Download as PDF or DOCX and apply with confidence
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  5
                </div>
                <h3 className="font-semibold mb-2">Create Public Profile</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Share your profile with an AI chatbot that answers recruiter questions
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Why ResumePilot?</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <Zap className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Lightning Fast</h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Get optimized resumes in seconds, not hours
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Target className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">ATS-Optimized</h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Beat applicant tracking systems with keyword-rich resumes
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Shield className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Privacy First</h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Your data is encrypted and never shared with third parties
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <MessageSquare className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">AI-Powered Profile</h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Create shareable profiles with an AI chatbot that answers recruiter questions 24/7
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
