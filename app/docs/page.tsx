import Link from 'next/link'
import { ArrowLeft, BookOpen, Code, Users, Zap } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span>返回首页</span>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">VRCFace 文档</h1>
            <div></div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <BookOpen className="w-16 h-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            VRCFace 使用文档
          </h1>
          <p className="text-xl text-gray-600">
            了解如何使用 VRCFace 平台分享和管理你的 VRChat 捏脸数据，通过插件和标签筛选功能轻松找到心仪的模型
          </p>
        </div>

        {/* 功能介绍卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="card p-6">
            <Code className="w-8 h-8 text-primary-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              JSON 格式说明
            </h3>
            <p className="text-gray-600 mb-4">
              了解 VRChat 面部模型 JSON 数据的标准格式和字段说明
            </p>
            <Button variant="outline" size="sm">
              查看格式
            </Button>
          </div>

          <div className="card p-6">
            <Zap className="w-8 h-8 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              快速开始
            </h3>
            <p className="text-gray-600 mb-4">
              5分钟快速上手，学会通过插件分享捏脸数据和使用标签筛选功能
            </p>
            <Button variant="outline" size="sm">
              开始教程
            </Button>
          </div>

          <div className="card p-6">
            <Users className="w-8 h-8 text-indigo-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              社区指南
            </h3>
            <p className="text-gray-600 mb-4">
              了解社区规则，学会与其他用户互动和协作
            </p>
            <Button variant="outline" size="sm">
              社区规则
            </Button>
          </div>

          <div className="card p-6">
            <BookOpen className="w-8 h-8 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              API 文档
            </h3>
            <p className="text-gray-600 mb-4">
              为开发者提供的完整 API 接口文档和示例代码
            </p>
            <Button variant="outline" size="sm">
              API 参考
            </Button>
          </div>
        </div>

        {/* 临时提示 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800 mb-4">
            📚 详细文档内容正在编写中...
          </p>
          <p className="text-blue-600 text-sm">
            文档将在后续开发步骤中逐步完善，敬请期待！
          </p>
        </div>
      </div>
    </div>
  )
}