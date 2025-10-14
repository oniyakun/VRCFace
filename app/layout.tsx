import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VRCFace - VRChat 面部模型分享平台',
  description: '分享和浏览自定义的 VRChat 面部模型 JSON 数据',
  keywords: ['VRChat', '面部模型', 'JSON', '分享', '社区'],
  authors: [{ name: 'VRCFace Team' }],
  openGraph: {
    title: 'VRCFace - VRChat 面部模型分享平台',
    description: '分享和浏览自定义的 VRChat 面部模型 JSON 数据',
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          {children}
        </div>
      </body>
    </html>
  )
}