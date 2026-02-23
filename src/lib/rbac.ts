import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export type UserRole = 'individual' | 'student' | 'advisor' | 'admin' | 'superadmin'

export interface AuthUser {
  id: string
  email: string
  name?: string | null
  role: UserRole
  universityId?: string | null
  universitySlug?: string | null
  isApproved: boolean
  planType: string
}

/**
 * Get the authenticated user with role info.
 * Returns null if not authenticated.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await auth()
  if (!session?.user?.id) return null

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role as UserRole,
    universityId: session.user.universityId,
    universitySlug: session.user.universitySlug,
    isApproved: session.user.isApproved,
    planType: session.user.planType,
  }
}

/**
 * Check if user has one of the allowed roles.
 */
export function hasRole(user: AuthUser, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(user.role)
}

/**
 * Check if user belongs to a specific university (by slug).
 */
export function belongsToUniversity(user: AuthUser, slug: string): boolean {
  return user.universitySlug === slug
}

/**
 * Require specific roles. Returns the user if authorized, null otherwise.
 */
export async function requireRole(
  allowedRoles: UserRole[],
  universitySlug?: string
): Promise<AuthUser | null> {
  const user = await getAuthUser()
  if (!user) return null
  if (!user.isApproved) return null
  if (!hasRole(user, allowedRoles)) return null
  if (universitySlug && !belongsToUniversity(user, universitySlug)) return null
  return user
}

/**
 * Get all students in a university (for advisor/admin use).
 */
export async function getUniversityStudents(universityId: string) {
  return prisma.user.findMany({
    where: {
      universityId,
      role: 'student',
      isActive: true,
    },
    include: {
      profile: true,
      interviewReadiness: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Get university by slug.
 */
export async function getUniversityBySlug(slug: string) {
  return prisma.university.findUnique({
    where: { slug },
  })
}
