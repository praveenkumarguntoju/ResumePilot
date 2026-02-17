import NextAuth from 'next-auth'
import { edgeAuthConfig } from '@/auth.edge.config'

export const { auth } = NextAuth(edgeAuthConfig)

export default auth

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
