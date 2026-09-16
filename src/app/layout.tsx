import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'El Tactico',
  description: 'Build your squad, choose your formation, and conquer the tournament!',
  keywords: ['football', 'soccer', 'draft', 'manager', 'tournament', 'game'],
  openGraph: {
    title: 'El Tactico',
    description: 'Build your squad, choose your formation, and conquer the tournament!',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="app-shell bg-background text-text-primary min-h-screen antialiased">
        <div className="wall-backdrop" aria-hidden="true" />
        {children}
      </body>
    </html>
  )
}