'use server'

import { cookies } from 'next/headers'

/**
 * Sets the 'auth' cookie with the given token.
 * Expunges the cookie on session close but here we give it a duration for persistence.
 */
export async function setAuthAction(token: string) {
    const cookieStore = await cookies()
    cookieStore.set('auth', token, {
        path: '/',
        httpOnly: true, // Stronger security
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax',
    })
}

/**
 * Removes the 'auth' cookie.
 */
export async function removeAuthAction() {
    const cookieStore = await cookies()
    cookieStore.delete('auth')
}
