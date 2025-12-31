import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ClickSitter - Trusted Caregiver Marketplace',
  description: 'Connect with verified independent caregivers',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

