import fs from 'fs'
import path from 'path'

export default function SteinFirmPage() {
  const htmlPath = path.join(process.cwd(), 'steinfirm', 'index.html')
  const html = fs.readFileSync(htmlPath, 'utf-8')
  return (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  )
}

export const metadata = {
  title: 'AI Discovery — The Stein Firm × Taptico',
  description: 'Discover your biggest AI opportunities in 10 minutes.',
}
