import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { edgeAuthConfig } from '@/auth.edge.config'

export const authConfig = {
  ...edgeAuthConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data
          const user = await prisma.user.findUnique({
            where: { email },
            include: { university: true },
          })
          if (!user) return null
          if (!user.isActive) return null
          const passwordsMatch = await bcrypt.compare(password, user.passwordHash)

          if (passwordsMatch) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              planType: user.planType,
              role: user.role,
              universityId: user.universityId,
              universitySlug: user.university?.slug || null,
              isApproved: user.isApproved,
            }
          }
        }

        return null
      },
    }),
  ],
} satisfies NextAuthConfig
