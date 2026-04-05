import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Taptico Disco',
  description: 'Taptico Discovery Call Portal',
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png' }],
    apple: '/favicon.png',
  },
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
