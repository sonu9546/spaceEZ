import React from 'react'
import type { Metadata } from 'next'
import OTPForm from './OTPForm'

export const metadata: Metadata = {
  title: 'OTP Verification | SpaceEZ',
  description: 'Verify your identity with a one-time password (OTP) for secure login to SpaceEZ.',
  keywords: ['OTP verification', 'two-factor authentication', 'secure login'],
  robots: 'noindex, follow',
  openGraph: {
    title: 'OTP Verification | SpaceEZ',
    description: 'Complete two-factor authentication securely.',
    type: 'website',
  },
}

const OTPPage = () => {
  return <OTPForm />
}

export default OTPPage
