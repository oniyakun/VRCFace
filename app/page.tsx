import HeroSection from '@/components/home/HeroSection'
import HomeFeed from '@/components/home/HomeFeed'

export default function HomePage() {
  return (
    <main>
      {/* Hero 介绍区域 */}
      <HeroSection />
      
      {/* 完整瀑布流区域 */}
      <HomeFeed />
    </main>
  )
}