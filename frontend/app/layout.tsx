import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AASHA AI — Annanth Aasha Foundation',
  description: 'AI-native learning and impact ecosystem. One book → reusable class-wide learning infrastructure.',
}

import Header from './components/Header'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="relative min-h-screen">
        <Header />
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  )
}
