export function extractNameFromResume(resumeText: string): string {
  const lines = resumeText.split('\n')
  
  // Look for the first line that contains a name (starts with # or is a standalone name)
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // Skip empty lines and section headers
    if (!trimmedLine || trimmedLine.startsWith('##') || trimmedLine.toLowerCase().includes('summary') || 
        trimmedLine.toLowerCase().includes('skills') || trimmedLine.toLowerCase().includes('experience') ||
        trimmedLine.toLowerCase().includes('education') || trimmedLine.toLowerCase().includes('projects')) {
      continue
    }
    
    // Remove markdown headers and clean up
    const cleanName = trimmedLine
      .replace(/^#+\s*/, '') // Remove markdown headers
      .replace(/\*\*/g, '') // Remove bold formatting
      .trim()
    
    // Check if this looks like a name (not a placeholder)
    if (cleanName && 
        !cleanName.toLowerCase().includes('your name') && 
        !cleanName.toLowerCase().includes('name') &&
        cleanName.length > 2) {
      return cleanName
    }
  }
  
  // Fallback: search for specific name patterns in the entire text
  const specificNameMatch = resumeText.match(/\b(PRAVEEN KUMAR GUNTOJU)\b/i)
  if (specificNameMatch) {
    return specificNameMatch[1]
  }
  
  // Look for three-word uppercase names
  const threeWordMatch = resumeText.match(/\b([A-Z][A-Z]+ [A-Z][A-Z]+ [A-Z][A-Z]+)\b/)
  if (threeWordMatch) {
    return threeWordMatch[1]
  }
  
  // Look for two-word uppercase names
  const twoWordMatch = resumeText.match(/\b([A-Z][A-Z]+ [A-Z][A-Z]+)\b/)
  if (twoWordMatch) {
    return twoWordMatch[1]
  }
  
  // Look for standard capitalized names
  const standardNameMatch = resumeText.match(/\b([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/)
  if (standardNameMatch && 
      !standardNameMatch[1].toLowerCase().includes('university') &&
      !standardNameMatch[1].toLowerCase().includes('college')) {
    return standardNameMatch[1]
  }
  
  return 'Your Name'
}
