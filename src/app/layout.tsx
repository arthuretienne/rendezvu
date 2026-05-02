import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rendezvu',
  description: 'Movie rendez-vous for friends and family who don\'t live together.',
  appleWebApp: {
    capable: true,
    title: 'Rendezvu',
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
