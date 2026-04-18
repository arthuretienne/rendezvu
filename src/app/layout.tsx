import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cinephile Starter',
  description: 'Draw, watch, rate — together.',
  appleWebApp: {
    capable: true,
    title: 'Cinephile Starter',
    statusBarStyle: 'default',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  )
}
