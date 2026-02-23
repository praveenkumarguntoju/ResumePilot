import type { NextAuthConfig } from 'next-auth'

/**
 * Base auth config — edge-compatible (no bcrypt/prisma imports).
 * Used by the middleware AND extended by auth.config.ts with providers.
 * Contains jwt, session, and authorized callbacks.
 */
export const edgeAuthConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id
        token.planType = user.planType
        token.role = user.role
        token.universityId = user.universityId
        token.universitySlug = user.universitySlug
        token.isApproved = user.isApproved
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.planType = token.planType
        session.user.role = token.role
        session.user.universityId = token.universityId
        session.user.universitySlug = token.universitySlug
        session.user.isApproved = token.isApproved
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }: { auth: any; request: { nextUrl: URL } }) {
      const isLoggedIn = !!auth?.user
      const role = auth?.user?.role as string | undefined
      const universitySlug = auth?.user?.universitySlug as string | undefined
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isOnAuth = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/signup')
      const isOnPublicProfile = nextUrl.pathname.startsWith('/p/')
      const isOnUniversity = nextUrl.pathname.startsWith('/u/')

      // University routes: /u/[slug]/login is public, rest require auth
      if (isOnUniversity) {
        const parts = nextUrl.pathname.split('/')
        const subPath = parts[3]
        if (subPath === 'login' || subPath === 'signup' || subPath === 'consent' || subPath === 'pending') return true
        if (isLoggedIn) return true
        const slug = parts[2]
        return Response.redirect(new URL(`/u/${slug}/login`, nextUrl))
      }

      // Protect super-admin routes
      if (nextUrl.pathname.startsWith('/admin')) {
        if (!isLoggedIn) return false
        if (role !== 'superadmin') {
          return Response.redirect(new URL('/dashboard', nextUrl))
        }
        return true
      }

      // Protect dashboard routes — redirect role-based users from /dashboard home only
      if (isOnDashboard) {
        if (!isLoggedIn) return false
        if (nextUrl.pathname === '/dashboard') {
          if (role === 'superadmin') {
            return Response.redirect(new URL('/admin/universities', nextUrl))
          }
          if (universitySlug && (role === 'student' || role === 'advisor' || role === 'admin')) {
            return Response.redirect(new URL(`/u/${universitySlug}/${role}`, nextUrl))
          }
        }
        return true
      }

      // Redirect logged-in users away from auth pages
      if (isOnAuth && isLoggedIn) {
        if (role === 'superadmin') {
          return Response.redirect(new URL('/admin/universities', nextUrl))
        }
        if (universitySlug && role && role !== 'individual') {
          return Response.redirect(new URL(`/u/${universitySlug}/${role}`, nextUrl))
        }
        return Response.redirect(new URL('/dashboard', nextUrl))
      }

      if (isOnPublicProfile) {
        return true
      }

      return true
    },
  },
  providers: [],
} satisfies NextAuthConfig
