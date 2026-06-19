import { Suspense } from 'react'
import QRDisplayClient from './QRDisplayClient'

export const metadata = {
  title: 'Amenity QR Code | SpaceEZ Admin',
  description: 'Scan or download the QR code for this amenity.',
}

export default function QRPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-10 h-10 border-4 border-[#006b2c]/30 border-t-[#006b2c] rounded-full animate-spin" />
      </div>
    }>
      <QRDisplayClient />
    </Suspense>
  )
}
