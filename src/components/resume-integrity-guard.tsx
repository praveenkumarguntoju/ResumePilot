'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, CheckCircle, AlertCircle, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface IntegrityIssue {
  type: 'buzzword' | 'inflation' | 'unrealistic'
  severity: 'low' | 'medium' | 'high'
  text: string
  suggestion: string
  position: number
}

interface ResumeIntegrityGuardProps {
  resumeText: string
  onIssuesFound?: (issues: IntegrityIssue[]) => void
}

export function ResumeIntegrityGuard({ resumeText, onIssuesFound }: ResumeIntegrityGuardProps) {
  const [issues, setIssues] = useState<IntegrityIssue[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  // Common buzzwords that may indicate overuse
  const buzzwords = [
    'synergy', 'paradigm shift', 'game-changer', 'disruptive', 'innovative', 'cutting-edge',
    'world-class', 'best-in-class', 'state-of-the-art', 'revolutionary', 'breakthrough',
    'mission-critical', 'enterprise-level', 'scalable', 'robust', 'seamless integration',
    'out-of-the-box thinking', 'blue-sky thinking', 'thought leader', 'change agent',
    'value-added', 'win-win situation', 'low-hanging fruit', 'circle back', 'deep dive',
    'leverage', 'optimize', 'streamline', 'empower', 'facilitate', 'synergize'
  ]

  // Unrealistic claims patterns
  const unrealisticPatterns = [
    { pattern: /increased.*\d{3,}%/gi, suggestion: 'Verify percentage claims are realistic' },
    { pattern: /saved.*\$\d{6,}/gi, suggestion: 'Verify large monetary claims with evidence' },
    { pattern: /managed.*team of \d{3,}/gi, suggestion: 'Verify team size claims' },
    { pattern: /years? of experience.*\d{2,}/gi, suggestion: 'Check if experience years align with career timeline' },
    { pattern: /expert.*\d+/gi, suggestion: 'Be specific about expertise level' }
  ]

  // Skill inflation indicators
  const skillInflationPatterns = [
    { pattern: /(master|expert|guru|ninja).*\b(react|vue|angular|python|java|javascript)\b/gi, suggestion: 'Specify proficiency level with evidence' },
    { pattern: /\b(fluent|native|bilingual)\b.*(language|speaking|writing)/gi, suggestion: 'Provide certification or evidence' },
    { pattern: /\b(architect|lead|senior|principal)\b.*(experience|role)/gi, suggestion: 'Verify actual role titles' }
  ]

  useEffect(() => {
    if (resumeText) {
      scanResume()
    }
  }, [resumeText])

  const scanResume = async () => {
    setIsScanning(true)
    const foundIssues: IntegrityIssue[] = []

    // Check for buzzwords
    buzzwords.forEach(buzzword => {
      const regex = new RegExp(`\\b${buzzword}\\b`, 'gi')
      const matches = resumeText.match(regex)
      if (matches && matches.length > 2) { // More than 2 uses
        foundIssues.push({
          type: 'buzzword',
          severity: matches.length > 4 ? 'high' : 'medium',
          text: `"${buzzword}" used ${matches.length} times`,
          suggestion: 'Consider using more specific, concrete language',
          position: resumeText.indexOf(buzzword)
        })
      }
    })

    // Check for unrealistic claims
    unrealisticPatterns.forEach(({ pattern, suggestion }) => {
      const matches = resumeText.match(pattern)
      if (matches) {
        matches.forEach(match => {
          foundIssues.push({
            type: 'unrealistic',
            severity: 'medium',
            text: match,
            suggestion,
            position: resumeText.indexOf(match)
          })
        })
      }
    })

    // Check for skill inflation
    skillInflationPatterns.forEach(({ pattern, suggestion }) => {
      const matches = resumeText.match(pattern)
      if (matches) {
        matches.forEach(match => {
          foundIssues.push({
            type: 'inflation',
            severity: 'low',
            text: match,
            suggestion,
            position: resumeText.indexOf(match)
          })
        })
      }
    })

    setIssues(foundIssues)
    setIsScanning(false)
    onIssuesFound?.(foundIssues)
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'low':
        return <AlertCircle className="h-4 w-4 text-blue-600" />
      default:
        return null
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800'
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800'
      case 'low':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800'
      default:
        return ''
    }
  }

  const highSeverityCount = issues.filter(i => i.severity === 'high').length
  const overallScore = Math.max(0, 100 - (highSeverityCount * 20) - (issues.filter(i => i.severity === 'medium').length * 10))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          AI Resume Integrity Guard
        </CardTitle>
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          Automatic detection for buzzwords, skill inflation, and unrealistic claims
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Overall Score */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                overallScore >= 80 ? 'bg-green-100' : overallScore >= 60 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                {overallScore >= 80 ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div>
                <div className="text-2xl font-bold">{overallScore}%</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Integrity Score
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              disabled={isScanning}
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
          </div>

          {/* Warning Message */}
          {highSeverityCount > 0 && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800 dark:text-red-200">
                  <strong>Warning:</strong> {highSeverityCount} high-severity issues detected. 
                  Claim strength appears exaggerated. Ensure accuracy.
                </div>
              </div>
            </div>
          )}

          {/* Detailed Issues */}
          {showDetails && issues.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Detected Issues:</h4>
              {issues.map((issue, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${getSeverityColor(issue.severity)}`}
                >
                  <div className="flex items-start gap-2">
                    {getSeverityIcon(issue.severity)}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{issue.text}</div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                        {issue.suggestion}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                        Type: {issue.type} • Severity: {issue.severity}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Issues */}
          {issues.length === 0 && !isScanning && (
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div className="text-sm text-green-800 dark:text-green-200">
                  No integrity issues detected. Your resume appears authentic and well-qualified.
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
