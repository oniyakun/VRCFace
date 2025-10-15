# VRCFace

VRCFace 是一个专为 VRChat 玩家打造的免费开源捏脸数据分享平台。通过我们的平台，您可以轻松分享和发现各种精美的 VRChat 角色捏脸数据，让您的虚拟形象更加独特。

## 🎯 项目作用

VRCFace 旨在为 VRChat 社区提供一个便捷的捏脸数据分享平台，帮助玩家：

- **分享创作**：展示您精心制作的角色捏脸数据
- **发现灵感**：浏览其他玩家的优秀作品
- **快速应用**：一键复制 JSON 数据到Unity中
- **社区互动**：通过点赞和评论与其他玩家交流

## 🚀 快速开始

### 第一步：访问平台
打开浏览器访问 VRCFace 平台，开始您的捏脸数据分享之旅。

### 第二步：浏览捏脸数据
在首页浏览各种精美的捏脸数据，使用标签筛选功能找到您感兴趣的角色模型。

### 第三步：复制数据
找到喜欢的捏脸数据后，点击复制按钮将 JSON 数据复制到剪贴板。

### 第四步：安装导入工具
1. 前往 [VRChat BlendShapes Extractor](https://github.com/oniyakun/VRChat-BlendShapes-Extractor/releases) 下载对应的 Unity Package
2. 在 Unity 中导入下载的 Unity Package 以获得导入功能

### 第五步：导入到 Unity
1. 打开 Unity 中的 BlendShape Extractor 工具
2. 找到"通过json文件导入blendshapes"项
3. 将含有对应 blendshapes 的 gameobject 拖入其中
4. 点击"从剪贴板粘贴"按钮
5. 选择需要导入的 blendshapes 数据
6. 按下"导入blendshape"按钮完成导入

### 第六步：应用捏脸数据
确认导入的数据无误后，应用到您的角色上，享受全新的虚拟形象。

### 第七步：分享您的作品
如果您也有优秀的捏脸数据，欢迎通过我们的插件分享给社区。

## 💡 使用方法

### 浏览和搜索
- 使用首页的瀑布流布局浏览所有捏脸数据
- 通过标签筛选特定的角色模型
- 使用搜索功能快速找到目标内容

### 数据操作
- **复制数据**：点击复制按钮获取 JSON 格式的捏脸数据
- **点赞作品**：为喜欢的作品点赞表示支持
- **评论互动**：在作品下方留言与作者交流

### 分享作品
- 下载并安装我们的 VRChat 插件
- 在游戏中使用插件一键上传您的捏脸数据
- 添加适当的标签和描述，让其他玩家更容易发现

## 🛠️ 技术栈

- **前端**: Next.js 14 (App Router) + TypeScript + TailwindCSS
- **后端**: Supabase (数据库 + 认证 + 存储)
- **部署**: Vercel (自动部署)
- **分析**: Vercel Analytics

## 🌟 功能特性

- 🎭 **专业的捏脸数据分享平台**
- 🔌 **VRChat 插件支持**，便捷分享捏脸数据
- 🏷️ **智能标签分类**，快速筛选目标模型
- 💾 **一键复制功能**，JSON 数据即时获取
- 👍 **社区互动系统**，点赞评论增进交流
- 🖼️ **瀑布流布局**，优雅展示作品集
- 👤 **用户认证系统**，安全可靠的账户管理
- 📱 **响应式设计**，完美适配各种设备
- 🆓 **完全免费开源**，无任何使用限制
- 🌐 **多语言支持**，服务全球 VRChat 玩家

## 🔧 开发环境设置

### 1. 克隆项目
```bash
git clone https://github.com/your-username/VRCFace.git
cd VRCFace
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
```bash
cp .env.local.example .env.local
```
编辑 `.env.local` 文件，填入您的 Supabase 项目信息。

### 4. 启动开发服务器
```bash
npm run dev
```

### 5. 访问应用
打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 📁 项目结构

```
VRCFace/
├── app/                    # Next.js App Router 页面
│   ├── docs/              # 文档页面
│   │   └── quickstart/    # 快速开始指南
│   ├── globals.css        # 全局样式
│   └── layout.tsx         # 根布局组件
├── components/            # React 组件库
├── lib/                   # 工具函数和配置
│   └── translations/      # 多语言翻译文件
├── public/               # 静态资源文件
├── types/                # TypeScript 类型定义
└── README.md             # 项目说明文档
```

## 🤝 贡献指南

我们欢迎社区贡献！如果您想为 VRCFace 做出贡献，请：

1. Fork 本项目
2. 创建您的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接

- [官方网站](https://vrcface.vercel.app)
- [快速开始指南](https://vrcface.vercel.app/docs/quickstart)
- [问题反馈](https://github.com/your-username/VRCFace/issues)

---

**让我们一起打造更美好的 VRChat 社区！** 🎮✨