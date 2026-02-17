import type { NextAuthConfig } from 'next-auth'

export const edgeAuthConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isOnAuth = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/signup')
      const isOnPublicProfile = nextUrl.pathname.startsWith('/p/')
      
      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false
      }
      
      if (isOnAuth && isLoggedIn) {
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
