import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name?: string | null
    planType: string
    role: string
    universityId?: string | null
    universitySlug?: string | null
    isApproved: boolean
  }

  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      planType: string
      role: string
      universityId?: string | null
      universitySlug?: string | null
      isApproved: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    planType: string
    role: string
    universityId?: string | null
    universitySlug?: string | null
    isApproved: boolean
  }
}
