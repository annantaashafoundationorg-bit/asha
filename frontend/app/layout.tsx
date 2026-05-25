import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AASHA AI — Annanth Aasha Foundation',
  description: 'AI-native learning and impact ecosystem. One book → reusable class-wide learning infrastructure.',
}

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/student', label: 'Student' },
  { href: '/teacher', label: 'Teacher' },
  { href: '/impact', label: 'Impact' },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="relative min-h-screen">
        <header className="relative z-10 border-b border-line/60 bg-bg/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-aasha/10 border border-aasha/30">
                <span className="text-aasha text-sm font-bold">A</span>
              </div>
              <div>
                <span className="font-display text-base font-semibold text-text">AASHA AI</span>
                <span className="ml-2 text-xs text-muted">Annanth Aasha Foundation</span>
              </div>
            </div>
            <nav className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted transition-colors hover:text-text"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  )
}
