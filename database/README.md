# VRCFace 数据库设计

## 概述

VRCFace 使用 Supabase (PostgreSQL) 作为主数据库，支持用户管理、面部模型存储、评论系统、标签分类等功能。

## 数据库架构

### 核心表结构

1. **users** - 用户表
   - 存储用户基本信息、角色、验证状态
   - 支持用户名、邮箱唯一性约束

2. **user_stats** - 用户统计表
   - 存储用户的模型数量、获得点赞数、评论数、关注数等统计信息
   - 通过触发器自动更新

3. **face_models** - 面部模型表
   - 存储 VRChat 面部模型的元数据和 JSON 数据
   - 支持分类、公开性、验证状态等属性

4. **model_stats** - 模型统计表
   - 存储模型的浏览量、下载量、点赞数、评论数
   - 通过触发器自动更新

5. **model_metadata** - 模型元数据表
   - 存储模型版本、兼容性、文件大小等技术信息

6. **tags** - 标签表
   - 存储标签信息，支持分类和颜色标识
   - 自动统计使用次数

7. **model_tags** - 模型标签关联表
   - 多对多关系，连接模型和标签

8. **comments** - 评论表
   - 支持嵌套评论（回复功能）
   - 记录编辑状态和点赞数

9. **likes** - 点赞表
   - 支持对模型和评论的点赞
   - 防重复点赞约束

10. **favorites** - 收藏表
    - 用户收藏模型功能

11. **follows** - 关注表
    - 用户关注功能，防止自关注

12. **notifications** - 通知表
    - 系统通知功能，支持多种通知类型

## 特性

### 1. 自动统计更新
- 使用 PostgreSQL 触发器自动更新各种统计数据
- 包括点赞数、评论数、关注数、标签使用次数等

### 2. 全文搜索
- 对模型标题、描述和标签支持全文搜索
- 使用 PostgreSQL 的 GIN 索引优化搜索性能

### 3. 行级安全 (RLS)
- 实现细粒度的数据访问控制
- 用户只能访问公开内容和自己的私有内容

### 4. 性能优化
- 为常用查询字段创建索引
- 分离统计数据到独立表，避免频繁更新主表

## 迁移说明

### 初始化数据库

1. 在 Supabase 控制台中执行 `001_initial_schema.sql`
2. 确保启用了必要的 PostgreSQL 扩展
3. 验证所有表和索引创建成功

### 数据迁移步骤

```sql
-- 1. 执行初始化脚本
\i database/migrations/001_initial_schema.sql

-- 2. 验证表结构
\dt

-- 3. 验证索引
\di

-- 4. 验证触发器
\df
```

## 环境配置

### Supabase 配置

在 `.env.local` 中配置以下环境变量：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 数据库连接

项目使用 `@supabase/supabase-js` 客户端连接数据库，配置文件位于 `lib/supabase.ts`。

## 数据模型关系

```
User (1) -----> (N) FaceModel
User (1) -----> (N) Comment
User (1) -----> (N) Like
User (1) -----> (N) Favorite
User (1) -----> (N) Follow (as follower)
User (1) -----> (N) Follow (as following)
User (1) -----> (N) Notification

FaceModel (1) -----> (N) Comment
FaceModel (1) -----> (N) Like
FaceModel (1) -----> (N) Favorite
FaceModel (N) -----> (N) Tag (through model_tags)
FaceModel (1) -----> (1) ModelStats
FaceModel (1) -----> (1) ModelMetadata

Comment (1) -----> (N) Comment (replies)
Comment (1) -----> (N) Like

User (1) -----> (1) UserStats
```

## 查询示例

### 获取热门模型
```sql
SELECT fm.*, ms.views, ms.downloads, ms.likes, u.username
FROM face_models fm
JOIN model_stats ms ON fm.id = ms.model_id
JOIN users u ON fm.author_id = u.id
WHERE fm.is_public = true
ORDER BY ms.likes DESC, ms.views DESC
LIMIT 20;
```

### 搜索模型
```sql
SELECT fm.*, ts_rank(to_tsvector('english', fm.title || ' ' || fm.description), plainto_tsquery('english', $1)) as rank
FROM face_models fm
WHERE fm.is_public = true
  AND to_tsvector('english', fm.title || ' ' || fm.description) @@ plainto_tsquery('english', $1)
ORDER BY rank DESC;
```

### 获取用户统计
```sql
SELECT u.*, us.*
FROM users u
LEFT JOIN user_stats us ON u.id = us.user_id
WHERE u.id = $1;
```

## 维护建议

1. **定期备份**: 设置自动备份策略
2. **监控性能**: 监控慢查询和索引使用情况
3. **清理数据**: 定期清理过期通知和无用数据
4. **更新统计**: 定期重新计算统计数据以确保准确性

## 扩展计划

1. **缓存层**: 添加 Redis 缓存热门数据
2. **分析表**: 添加用户行为分析表
3. **版本控制**: 为模型添加版本控制功能
4. **审核系统**: 添加内容审核相关表