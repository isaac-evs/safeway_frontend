import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SafeWay - News Feed',
  description: 'Explore all news and incident reports from SafeWay',
}

export default function NewsFeedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
} 