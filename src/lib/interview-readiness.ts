import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// ─── A) Resume Quality Score (AI-powered) ───────────────────────────────────

interface ResumeQualityResult {
  score: number
  detail: string
}

export async function calculateResumeQualityScore(resumeText: string): Promise<ResumeQualityResult> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert UK career advisor and resume evaluator. Evaluate resumes strictly and return JSON only.`,
        },
        {
          role: 'user',
          content: `Evaluate this resume on the following criteria. Score each out of 25 (total max 100):

1. **Clarity** (0-25): Is the resume well-structured, easy to read, with clear sections?
2. **Impact Statements** (0-25): Does it use strong action verbs and STAR method?
3. **Quantified Achievements** (0-25): Are there measurable outcomes and numbers?
4. **ATS Friendliness** (0-25): Is it keyword-rich, properly formatted for ATS systems?

Resume:
${resumeText}

Return ONLY valid JSON in this exact format:
{
  "clarity": <number>,
  "impactStatements": <number>,
  "quantifiedAchievements": <number>,
  "atsFriendliness": <number>,
  "total": <number>,
  "summary": "<one sentence summary of key improvement area>"
}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 300,
    })

    const content = completion.choices[0]?.message?.content || ''
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { score: 50, detail: 'Unable to parse AI evaluation' }
    }

    const result = JSON.parse(jsonMatch[0])
    const score = Math.min(Math.max(Math.round(result.total), 0), 100)

    return {
      score,
      detail: JSON.stringify({
        clarity: result.clarity,
        impactStatements: result.impactStatements,
        quantifiedAchievements: result.quantifiedAchievements,
        atsFriendliness: result.atsFriendliness,
        summary: result.summary,
      }),
    }
  } catch (error) {
    console.error('Resume quality score error:', error)
    return { score: 50, detail: 'Error evaluating resume quality' }
  }
}

// ─── B) Skill Match Score ────────────────────────────────────────────────────

export function calculateSkillMatchScore(resumeText: string, targetRole: string): number {
  const roleSkillMap: Record<string, string[]> = {
    'software engineer': ['javascript', 'typescript', 'python', 'java', 'react', 'node', 'sql', 'git', 'docker', 'aws', 'api', 'rest', 'agile', 'testing', 'ci/cd'],
    'software developer': ['javascript', 'typescript', 'python', 'java', 'react', 'node', 'sql', 'git', 'docker', 'aws', 'api', 'rest', 'agile', 'testing', 'ci/cd'],
    'full stack developer': ['javascript', 'typescript', 'react', 'node', 'express', 'sql', 'mongodb', 'html', 'css', 'git', 'docker', 'api', 'rest', 'aws', 'testing'],
    'frontend developer': ['javascript', 'typescript', 'react', 'vue', 'angular', 'html', 'css', 'tailwind', 'sass', 'webpack', 'git', 'responsive', 'accessibility', 'testing', 'figma'],
    'backend developer': ['python', 'java', 'node', 'express', 'sql', 'postgresql', 'mongodb', 'docker', 'aws', 'api', 'rest', 'graphql', 'redis', 'testing', 'ci/cd'],
    'data scientist': ['python', 'r', 'sql', 'machine learning', 'tensorflow', 'pandas', 'numpy', 'statistics', 'visualization', 'jupyter', 'scikit', 'deep learning', 'nlp', 'spark', 'tableau'],
    'data analyst': ['sql', 'python', 'excel', 'tableau', 'power bi', 'statistics', 'visualization', 'pandas', 'r', 'reporting', 'dashboard', 'etl', 'data cleaning', 'analytics', 'business intelligence'],
    'devops engineer': ['docker', 'kubernetes', 'aws', 'azure', 'terraform', 'jenkins', 'ci/cd', 'linux', 'bash', 'python', 'monitoring', 'git', 'ansible', 'networking', 'security'],
    'product manager': ['agile', 'scrum', 'roadmap', 'stakeholder', 'analytics', 'user research', 'jira', 'strategy', 'prioritization', 'communication', 'leadership', 'metrics', 'a/b testing', 'market research', 'product'],
    'ux designer': ['figma', 'sketch', 'user research', 'wireframing', 'prototyping', 'usability', 'accessibility', 'design thinking', 'html', 'css', 'interaction design', 'information architecture', 'user testing', 'persona', 'journey mapping'],
    'cybersecurity analyst': ['security', 'networking', 'firewall', 'siem', 'penetration testing', 'vulnerability', 'linux', 'python', 'encryption', 'compliance', 'incident response', 'risk assessment', 'iso 27001', 'gdpr', 'threat intelligence'],
    'cloud engineer': ['aws', 'azure', 'gcp', 'terraform', 'docker', 'kubernetes', 'networking', 'linux', 'python', 'serverless', 'iam', 'monitoring', 'ci/cd', 'security', 'cost optimization'],
    'mobile developer': ['swift', 'kotlin', 'react native', 'flutter', 'ios', 'android', 'javascript', 'typescript', 'api', 'git', 'ui/ux', 'testing', 'firebase', 'app store', 'mobile'],
    'machine learning engineer': ['python', 'tensorflow', 'pytorch', 'scikit', 'deep learning', 'nlp', 'computer vision', 'docker', 'aws', 'sql', 'statistics', 'feature engineering', 'model deployment', 'mlops', 'data pipeline'],
    'project manager': ['agile', 'scrum', 'waterfall', 'jira', 'stakeholder', 'risk management', 'budgeting', 'scheduling', 'communication', 'leadership', 'prince2', 'pmp', 'reporting', 'resource management', 'change management'],
  }

  const roleLower = targetRole.toLowerCase()
  let skills: string[] = []

  // Try exact match first, then partial match
  if (roleSkillMap[roleLower]) {
    skills = roleSkillMap[roleLower]
  } else {
    for (const [key, value] of Object.entries(roleSkillMap)) {
      if (roleLower.includes(key) || key.includes(roleLower)) {
        skills = value
        break
      }
    }
  }

  // Fallback: generic tech skills
  if (skills.length === 0) {
    skills = ['communication', 'teamwork', 'problem solving', 'leadership', 'analytical', 'project management', 'technical', 'agile', 'presentation', 'time management']
  }

  const resumeLower = resumeText.toLowerCase()
  const matchedSkills = skills.filter(skill => resumeLower.includes(skill))
  const missingSkills = skills.filter(skill => !resumeLower.includes(skill))

  const score = Math.round((matchedSkills.length / skills.length) * 100)

  return Math.min(score, 100)
}

export function getMissingSkills(resumeText: string, targetRole: string): string[] {
  const roleSkillMap: Record<string, string[]> = {
    'software engineer': ['javascript', 'typescript', 'python', 'java', 'react', 'node', 'sql', 'git', 'docker', 'aws', 'api', 'rest', 'agile', 'testing', 'ci/cd'],
    'software developer': ['javascript', 'typescript', 'python', 'java', 'react', 'node', 'sql', 'git', 'docker', 'aws', 'api', 'rest', 'agile', 'testing', 'ci/cd'],
    'full stack developer': ['javascript', 'typescript', 'react', 'node', 'express', 'sql', 'mongodb', 'html', 'css', 'git', 'docker', 'api', 'rest', 'aws', 'testing'],
    'frontend developer': ['javascript', 'typescript', 'react', 'vue', 'angular', 'html', 'css', 'tailwind', 'sass', 'webpack', 'git', 'responsive', 'accessibility', 'testing', 'figma'],
    'backend developer': ['python', 'java', 'node', 'express', 'sql', 'postgresql', 'mongodb', 'docker', 'aws', 'api', 'rest', 'graphql', 'redis', 'testing', 'ci/cd'],
    'data scientist': ['python', 'r', 'sql', 'machine learning', 'tensorflow', 'pandas', 'numpy', 'statistics', 'visualization', 'jupyter', 'scikit', 'deep learning', 'nlp', 'spark', 'tableau'],
    'data analyst': ['sql', 'python', 'excel', 'tableau', 'power bi', 'statistics', 'visualization', 'pandas', 'r', 'reporting', 'dashboard', 'etl', 'data cleaning', 'analytics', 'business intelligence'],
    'devops engineer': ['docker', 'kubernetes', 'aws', 'azure', 'terraform', 'jenkins', 'ci/cd', 'linux', 'bash', 'python', 'monitoring', 'git', 'ansible', 'networking', 'security'],
    'product manager': ['agile', 'scrum', 'roadmap', 'stakeholder', 'analytics', 'user research', 'jira', 'strategy', 'prioritization', 'communication', 'leadership', 'metrics', 'a/b testing', 'market research', 'product'],
    'ux designer': ['figma', 'sketch', 'user research', 'wireframing', 'prototyping', 'usability', 'accessibility', 'design thinking', 'html', 'css', 'interaction design', 'information architecture', 'user testing', 'persona', 'journey mapping'],
    'cybersecurity analyst': ['security', 'networking', 'firewall', 'siem', 'penetration testing', 'vulnerability', 'linux', 'python', 'encryption', 'compliance', 'incident response', 'risk assessment', 'iso 27001', 'gdpr', 'threat intelligence'],
    'cloud engineer': ['aws', 'azure', 'gcp', 'terraform', 'docker', 'kubernetes', 'networking', 'linux', 'python', 'serverless', 'iam', 'monitoring', 'ci/cd', 'security', 'cost optimization'],
    'mobile developer': ['swift', 'kotlin', 'react native', 'flutter', 'ios', 'android', 'javascript', 'typescript', 'api', 'git', 'ui/ux', 'testing', 'firebase', 'app store', 'mobile'],
    'machine learning engineer': ['python', 'tensorflow', 'pytorch', 'scikit', 'deep learning', 'nlp', 'computer vision', 'docker', 'aws', 'sql', 'statistics', 'feature engineering', 'model deployment', 'mlops', 'data pipeline'],
    'project manager': ['agile', 'scrum', 'waterfall', 'jira', 'stakeholder', 'risk management', 'budgeting', 'scheduling', 'communication', 'leadership', 'prince2', 'pmp', 'reporting', 'resource management', 'change management'],
  }

  const roleLower = targetRole.toLowerCase()
  let skills: string[] = []

  if (roleSkillMap[roleLower]) {
    skills = roleSkillMap[roleLower]
  } else {
    for (const [key, value] of Object.entries(roleSkillMap)) {
      if (roleLower.includes(key) || key.includes(roleLower)) {
        skills = value
        break
      }
    }
  }

  if (skills.length === 0) return []

  const resumeLower = resumeText.toLowerCase()
  return skills.filter(skill => !resumeLower.includes(skill))
}

// ─── C) Experience Strength Score (Logic-based) ──────────────────────────────

export function calculateExperienceScore(resumeText: string): number {
  const textLower = resumeText.toLowerCase()
  let score = 0

  // Internship present? +15
  if (/intern(ship)?/i.test(textLower)) {
    score += 15
  }

  // Part-time / full-time job? +5 / +10
  if (/part[- ]?time/i.test(textLower)) {
    score += 5
  }
  if (/full[- ]?time|employment|work experience|professional experience/i.test(textLower)) {
    score += 10
  }

  // Projects > 2? +10
  const projectMatches = textLower.match(/project/g)
  if (projectMatches && projectMatches.length >= 2) {
    score += 10
  }

  // Leadership role? +10
  if (/lead|leader|captain|president|chair|head|manager|coordinator|founded|co-founded/i.test(textLower)) {
    score += 10
  }

  // Certifications? +10
  if (/certif(ied|ication)|aws certified|google certified|microsoft certified|prince2|pmp|scrum master/i.test(textLower)) {
    score += 10
  }

  // Volunteering? +5
  if (/volunteer|volunteering|charity|non-profit|nonprofit/i.test(textLower)) {
    score += 5
  }

  // Education level? +10 for degree, +15 for masters
  if (/master|msc|mba|m\.sc|postgraduate/i.test(textLower)) {
    score += 15
  } else if (/bachelor|bsc|b\.sc|degree|university|undergraduate/i.test(textLower)) {
    score += 10
  }

  // Quantified achievements? +10
  const numberPattern = /\d+%|\d+\+|\$\d+|£\d+|\d+ (users|clients|customers|projects|team|members)/g
  const quantified = textLower.match(numberPattern)
  if (quantified && quantified.length >= 2) {
    score += 10
  }

  // Awards / honours? +5
  if (/award|honour|honor|distinction|dean.*list|scholarship/i.test(textLower)) {
    score += 5
  }

  return Math.min(score, 100)
}

// ─── D) Market Demand Score (Adzuna API) ─────────────────────────────────────

export async function calculateMarketDemandScore(targetRole: string): Promise<number> {
  try {
    const appId = process.env.ADZUNA_APP_ID
    const appKey = process.env.ADZUNA_APP_KEY

    if (!appId || !appKey) {
      // Fallback: estimate based on common roles
      return estimateDemandFromRole(targetRole)
    }

    const encodedRole = encodeURIComponent(targetRole)
    const url = `https://api.adzuna.com/v1/api/jobs/gb/search/1?app_id=${appId}&app_key=${appKey}&what=${encodedRole}&content-type=application/json`

    const response = await fetch(url, { next: { revalidate: 86400 } }) // Cache for 24h
    if (!response.ok) {
      return estimateDemandFromRole(targetRole)
    }

    const data = await response.json()
    const jobCount = data.count || 0

    if (jobCount > 5000) return 90
    if (jobCount > 2000) return 75
    if (jobCount > 1000) return 65
    if (jobCount > 500) return 55
    if (jobCount > 100) return 45
    return 35
  } catch (error) {
    console.error('Market demand score error:', error)
    return estimateDemandFromRole(targetRole)
  }
}

function estimateDemandFromRole(targetRole: string): number {
  const highDemand = ['software', 'developer', 'engineer', 'data', 'cloud', 'devops', 'cyber', 'security', 'ai', 'machine learning', 'full stack']
  const mediumDemand = ['product', 'project', 'analyst', 'designer', 'ux', 'mobile', 'frontend', 'backend']
  const roleLower = targetRole.toLowerCase()

  if (highDemand.some(kw => roleLower.includes(kw))) return 80
  if (mediumDemand.some(kw => roleLower.includes(kw))) return 65
  return 50
}

// ─── E) AI Skill Gap Suggestions ─────────────────────────────────────────────

export interface SkillSuggestion {
  skill: string
  projects: string[]
  certifications: string[]
  steps: string[]
}

export async function generateSkillGapSuggestions(
  missingSkills: string[],
  weakAreas: string[],
  targetRole: string,
  overallScore: number
): Promise<SkillSuggestion[]> {
  if (missingSkills.length === 0 && weakAreas.length === 0) return []

  try {
    const topMissing = missingSkills.slice(0, 5)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a UK career advisor specialising in helping graduates and early-career professionals. Return JSON only.',
        },
        {
          role: 'user',
          content: `A candidate targeting "${targetRole}" has an interview readiness score of ${overallScore}%.

Missing skills: ${topMissing.join(', ')}
Weak areas: ${weakAreas.join(', ')}

For each missing skill, suggest:
1. A practical project to build (realistic for a UK graduate)
2. A relevant certification or free course
3. One practical step they can take this week

Return ONLY valid JSON array:
[
  {
    "skill": "Docker",
    "projects": ["Containerise a personal portfolio app with Docker Compose"],
    "certifications": ["Docker Essentials on LinkedIn Learning (free)"],
    "steps": ["Install Docker Desktop and run your first container today"]
  }
]

Keep suggestions realistic, UK-focused, and actionable. Max 5 skills.`,
        },
      ],
      temperature: 0.5,
      max_tokens: 800,
    })

    const content = completion.choices[0]?.message?.content || ''
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return []

    const suggestions: SkillSuggestion[] = JSON.parse(jsonMatch[0])
    return suggestions.slice(0, 5)
  } catch (error) {
    console.error('Skill gap suggestions error:', error)
    return []
  }
}

// ─── Combined Score ──────────────────────────────────────────────────────────

export interface ReadinessResult {
  resumeQualityScore: number
  skillMatchScore: number
  experienceScore: number
  marketDemandScore: number
  overallScore: number
  missingSkills: string[]
  weakAreas: string[]
  resumeQualityDetail: string
  suggestions: SkillSuggestion[]
}

export async function calculateInterviewReadiness(
  resumeText: string,
  targetRole: string
): Promise<ReadinessResult> {
  // Run AI quality score and market demand in parallel
  const [qualityResult, marketDemandScore] = await Promise.all([
    calculateResumeQualityScore(resumeText),
    calculateMarketDemandScore(targetRole),
  ])

  const skillMatchScore = calculateSkillMatchScore(resumeText, targetRole)
  const experienceScore = calculateExperienceScore(resumeText)
  const missingSkills = getMissingSkills(resumeText, targetRole)

  // Weighted calculation: Resume 30%, Skills 30%, Experience 20%, Market 20%
  const overallScore = Math.round(
    qualityResult.score * 0.3 +
    skillMatchScore * 0.3 +
    experienceScore * 0.2 +
    marketDemandScore * 0.2
  )

  // Determine weak areas
  const weakAreas: string[] = []
  if (qualityResult.score < 60) weakAreas.push('Resume Quality')
  if (skillMatchScore < 60) weakAreas.push('Skill Match')
  if (experienceScore < 40) weakAreas.push('Experience')
  if (marketDemandScore < 50) weakAreas.push('Market Demand')

  // Generate AI suggestions for skill gaps
  const suggestions = await generateSkillGapSuggestions(
    missingSkills,
    weakAreas,
    targetRole,
    overallScore
  )

  return {
    resumeQualityScore: qualityResult.score,
    skillMatchScore,
    experienceScore,
    marketDemandScore,
    overallScore,
    missingSkills,
    weakAreas,
    resumeQualityDetail: qualityResult.detail,
    suggestions,
  }
}
