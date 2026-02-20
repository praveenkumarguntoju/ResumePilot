export interface ResumePromptData {
  rawResumeText: string
  jobTitle: string
  company: string
  jobDescription: string
}

export function generateResumeOptimizationPrompt(data: ResumePromptData): string {
  const { rawResumeText, jobTitle, company, jobDescription } = data

  return `You are an expert resume writer and ATS optimization specialist. 

CRITICAL RULES:
- Do NOT exaggerate or fabricate experience
- **CRITICAL: Extract the ACTUAL candidate name from the resume data - NEVER use "Your Name" or any placeholder text**
- Look for names in: education section, experience section, email addresses, or any personal identifiers
- Common name formats: "John Smith", "Mary Anne Johnson", "Dr. John Smith", "PRAVEEN KUMAR GUNTOJU"
- Search for uppercase names like "PRAVEEN KUMAR GUNTOJU" throughout the entire resume
- If no clear name is found, use "John Smith" as LAST resort
- Do NOT include empty sections (e.g., if no certifications, omit the Certifications section entirely)
- Do NOT add placeholder text like "None at this time" for empty sections - just omit the section
- Make it ATS-friendly with clear sections and keywords
- Use strong action verbs (developed, implemented, designed, led, created)
- Keep it concise - aim for 1 page
- If experience is limited, emphasize projects and education
- Align the professional summary with the target role: ${jobTitle}
- Use UK English spelling and formatting
- Include relevant keywords from the target role and industry
- For projects, focus on technical skills and measurable outcomes
- Quantify achievements where possible (but don't make up numbers)

STRUCTURE:
1. Name Header (extract ACTUAL name from resume - NEVER use "Your Name" or placeholder text)
2. Professional Summary (2-3 sentences aligned with target role)
3. Technical Skills (categorized with **bold** categories - THIS MUST BE THE SECOND SECTION after summary)
4. Soft Skills & Languages
5. Experience (if any - use STAR method for descriptions)
6. Projects (critical for graduates - highlight technical skills and impact)
7. Education (include relevant modules if provided - THIS MUST BE THE LAST SECTION)
8. Certifications (ONLY if the candidate has certifications - DO NOT include this section if they have none)

NAME EXTRACTION INSTRUCTIONS:
- Search the entire resume for proper names (capitalized first and last names)
- Look in education: "University of X - John Smith graduated..."
- Look in experience: "John Smith - Senior Developer at Company"
- Look in email addresses: "john.smith@email.com"
- First line MUST be "# [Actual Found Name]" - never "# Your Name"

FORMATTING RULES:
- Start with the candidate's name as a # header (use a realistic professional name, NOT placeholder text)
- Use markdown headers (## for main sections, ### for subsections)
- Use hyphens (-) for bullet points, NOT bullet symbols (•) or double dashes (--)
- Keep formatting clean and simple
- Use **bold** for job titles, company names, and project names
- Format as clean, professional markdown that can be easily parsed by ATS systems
- CRITICAL: The first line MUST be "# [Candidate's Full Name]" - extract the actual name from the resume data
- NEVER use "Your Name", "markdown", or any placeholder text for the name header
- If you cannot find a clear name in the resume, use "John Smith" as a placeholder but this should be rare

Original Resume:
${rawResumeText}

Job Title: ${jobTitle}
Company: ${company}
Job Description:
${jobDescription}

FIRST TASK: Extract the candidate's name from the original resume above.
- Look for "PRAVEEN KUMAR GUNTOJU" or similar uppercase name patterns
- Check education section, experience section, and throughout the document
- Find names like "John Smith", "Mary Johnson", etc.
- The extracted name will be used as the header

Task: Optimize this resume for the job posting above. Follow these guidelines:
1. Tailor the resume to match the job requirements and keywords
2. Highlight relevant experience and skills from the original resume
3. Use action verbs and quantifiable achievements
4. Ensure ATS compatibility (simple formatting, relevant keywords)
5. Follow the exact structure and formatting rules specified above
6. Do NOT fabricate experience - only enhance what's already there
7. Match the tone and language used in the job description
8. **CRITICAL: Find and use the ACTUAL candidate name - NEVER output "Your Name"**

Return ONLY the optimized resume text in clean markdown format. Do not include any explanations or meta-commentary.

IMPORTANT SKILLS SECTION REQUIREMENTS:
- The "## Technical Skills" section MUST be included immediately after Professional Summary
- Use this exact format: "## Technical Skills" followed by categorized skills with hyphens
- Example format:
  ## Technical Skills
  - **Programming Languages**: JavaScript, Python, Java
  - **Frameworks**: React, Node.js, Express
  - **Cloud Platforms**: AWS, Azure, Google Cloud
  - **Tools**: Docker, Git, Jenkins
- If "## Soft Skills & Languages" exists, include it after Technical Skills
- NEVER omit the Technical Skills section - extract from original resume even if limited`
}

export function generateResumeStyleVariants(baseResume: string): {
  modern: string
  classic: string
  minimal: string
  simple: string
} {
  return {
    modern: baseResume,
    classic: baseResume,
    minimal: baseResume,
    simple: baseResume
  }
}
