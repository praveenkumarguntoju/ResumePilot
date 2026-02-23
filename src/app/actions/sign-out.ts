'use server'

import { signOut } from '@/auth'

export async function signOutAction() {
  await signOut({ redirectTo: 'https://www.resumepilot.co.uk/' })
}
