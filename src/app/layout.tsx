import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'LeadForge — Automated Lead Generation',
  description: 'Automated lead generation and email outreach powered by n8n',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#fff',
              border: '1px solid #e8ecf0',
              borderRadius: '10px',
              color: '#0d1117',
              fontSize: '14px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            },
            success: {
              iconTheme: { primary: '#00e676', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  )
}
