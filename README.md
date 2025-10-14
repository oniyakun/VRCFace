# VRCFace

VRChat 面部模型分享平台 - 让用户分享和浏览他们自定义的 VRChat 面部模型 JSON 数据。

## 技术栈

- **前端**: Next.js 14 (App Router) + TypeScript + TailwindCSS
- **后端**: Supabase (数据库 + 认证 + 存储)
- **部署**: Vercel

## 开发环境设置

1. 克隆项目并安装依赖：
```bash
npm install
```

2. 配置环境变量：
```bash
cp .env.local.example .env.local
```
然后编辑 `.env.local` 文件，填入你的 Supabase 项目信息。

3. 启动开发服务器：
```bash
npm run dev
```

4. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
├── app/                 # Next.js App Router 页面
├── components/          # React 组件
├── lib/                # 工具函数和配置
├── public/             # 静态资源
└── types/              # TypeScript 类型定义
```

## 功能特性

- 🎭 VRChat 面部模型 JSON 数据分享
- 🖼️ 瀑布流布局展示
- 🏷️ 标签分类筛选
- 👤 用户认证系统
- 💾 一键复制 JSON 数据
- 👍 点赞和评论功能
- 📱 响应式设计

## 开发进度

- [x] 项目初始化
- [ ] 首页实现
- [ ] 瀑布流布局
- [ ] 数据结构设计
- [ ] 数据获取和渲染
- [ ] 复制功能
- [ ] 点赞评论系统
- [ ] 用户认证
- [ ] 上传功能
- [ ] 响应式优化和部署