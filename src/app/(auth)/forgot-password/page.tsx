import React from 'react'
import type { Metadata } from 'next'
import ForgotPasswordForm from './ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Forgot Password | SpaceEZ',
  description: 'Reset your SpaceEZ account password. Enter your email to receive a password reset link.',
  keywords: ['forgot password', 'reset password', 'password recovery'],
  robots: 'noindex, follow',
  openGraph: {
    title: 'Forgot Password | SpaceEZ',
    description: 'Reset your account password securely.',
    type: 'website',
  },
}

const ForgotPasswordPage = () => {
  return <ForgotPasswordForm />
}

export default ForgotPasswordPage
