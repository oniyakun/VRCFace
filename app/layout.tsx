import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { ToastProvider } from '@/components/ui/ToastProvider'
import Navigation from '@/components/layout/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VRCFace - 免费公开的 VRChat 捏脸数据分享平台',
  description: 'VRCFace是一个免费的公开的用于给VRChat玩家分享自己捏脸数据的平台，用户可以下载我们的插件来分享捏脸数据，也可以根据模型名字的标签来筛选你想查看的模型捏脸数据',
  keywords: ['VRChat', '捏脸数据', '面部模型', '插件', '标签筛选', '免费分享', '社区'],
  authors: [{ name: 'VRCFace Team' }],
  openGraph: {
    title: 'VRCFace - 免费公开的 VRChat 捏脸数据分享平台',
    description: 'VRCFace是一个免费的公开的用于给VRChat玩家分享自己捏脸数据的平台，用户可以下载我们的插件来分享捏脸数据，也可以根据模型名字的标签来筛选你想查看的模型捏脸数据',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
              <Navigation />
              {children}
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}