-- VRCFace 数据库初始化脚本
-- 创建时间: 2025-01-14
-- 描述: 完整的数据库结构初始化，包含所有核心表和功能

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar TEXT,
    bio TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户统计表
CREATE TABLE user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    models_count INTEGER DEFAULT 0,
    likes_received INTEGER DEFAULT 0,
    comments_received INTEGER DEFAULT 0,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 标签表
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7), -- HEX 颜色代码
    category VARCHAR(20) DEFAULT 'emotion' CHECK (category IN ('emotion', 'style', 'character', 'technical')),
    tag_type VARCHAR(20) DEFAULT 'model_style' CHECK (tag_type IN ('model_name', 'model_style')),
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 面部模型表
CREATE TABLE face_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    thumbnail TEXT,
    images TEXT[] DEFAULT '{}',
    json_data JSONB, -- 允许为空
    category VARCHAR(20) DEFAULT 'other' CHECK (category IN ('cute', 'cool', 'funny', 'gentle', 'sci-fi', 'animal', 'other')),
    is_public BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加约束：images 数组最多包含5个元素
ALTER TABLE face_models 
ADD CONSTRAINT face_models_images_max_count 
CHECK (array_length(images, 1) <= 5 OR images = '{}');

-- 模型统计表
CREATE TABLE model_stats (
    model_id UUID PRIMARY KEY REFERENCES face_models(id) ON DELETE CASCADE,
    views INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 模型元数据表
CREATE TABLE model_metadata (
    model_id UUID PRIMARY KEY REFERENCES face_models(id) ON DELETE CASCADE,
    version VARCHAR(20) DEFAULT '1.0.0',
    compatibility TEXT[], -- 兼容的 VRChat 版本
    file_size INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 模型标签关联表
CREATE TABLE model_tags (
    model_id UUID REFERENCES face_models(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (model_id, tag_id)
);

-- 评论表
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model_id UUID NOT NULL REFERENCES face_models(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    reply_count INTEGER DEFAULT 0,
    is_edited BOOLEAN DEFAULT FALSE,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 点赞表
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model_id UUID REFERENCES face_models(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT likes_target_check CHECK (
        (model_id IS NOT NULL AND comment_id IS NULL) OR 
        (model_id IS NULL AND comment_id IS NOT NULL)
    ),
    UNIQUE(user_id, model_id),
    UNIQUE(user_id, comment_id)
);

-- 收藏表
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model_id UUID NOT NULL REFERENCES face_models(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, model_id)
);

-- 关注表
CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CONSTRAINT follows_self_check CHECK (follower_id != following_id)
);

-- 通知表
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('like_model', 'comment_model', 'reply_comment', 'follow_user', 'model_verified', 'system_announcement')),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_face_models_author_id ON face_models(author_id);
CREATE INDEX idx_face_models_category ON face_models(category);
CREATE INDEX idx_face_models_is_public ON face_models(is_public);
CREATE INDEX idx_face_models_created_at ON face_models(created_at DESC);
CREATE INDEX idx_face_models_images ON face_models USING GIN (images);
CREATE INDEX idx_comments_model_id ON comments(model_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_model_id ON likes(model_id);
CREATE INDEX idx_likes_comment_id ON likes(comment_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_model_tags_model_id ON model_tags(model_id);
CREATE INDEX idx_model_tags_tag_id ON model_tags(tag_id);

-- 全文搜索索引
CREATE INDEX idx_face_models_search ON face_models USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_tags_search ON tags USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- 创建触发器函数来自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加 updated_at 触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_face_models_updated_at BEFORE UPDATE ON face_models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_model_stats_updated_at BEFORE UPDATE ON model_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建函数来自动更新统计数据
CREATE OR REPLACE FUNCTION update_model_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 更新模型点赞数
        IF NEW.model_id IS NOT NULL THEN
            UPDATE model_stats 
            SET likes = likes + 1, updated_at = NOW()
            WHERE model_id = NEW.model_id;
        END IF;
        
        -- 更新用户收到的点赞数
        IF NEW.model_id IS NOT NULL THEN
            UPDATE user_stats 
            SET likes_received = likes_received + 1, updated_at = NOW()
            WHERE user_id = (SELECT author_id FROM face_models WHERE id = NEW.model_id);
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- 更新模型点赞数
        IF OLD.model_id IS NOT NULL THEN
            UPDATE model_stats 
            SET likes = likes - 1, updated_at = NOW()
            WHERE model_id = OLD.model_id;
        END IF;
        
        -- 更新用户收到的点赞数
        IF OLD.model_id IS NOT NULL THEN
            UPDATE user_stats 
            SET likes_received = likes_received - 1, updated_at = NOW()
            WHERE user_id = (SELECT author_id FROM face_models WHERE id = OLD.model_id);
        END IF;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- 创建函数来自动更新评论统计数据
CREATE OR REPLACE FUNCTION update_comment_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 更新模型评论数
        UPDATE model_stats 
        SET comments = comments + 1, updated_at = NOW()
        WHERE model_id = NEW.model_id;
        
        -- 更新用户收到的评论数
        UPDATE user_stats 
        SET comments_received = comments_received + 1, updated_at = NOW()
        WHERE user_id = (SELECT author_id FROM face_models WHERE id = NEW.model_id);
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- 更新模型评论数
        UPDATE model_stats 
        SET comments = comments - 1, updated_at = NOW()
        WHERE model_id = OLD.model_id;
        
        -- 更新用户收到的评论数
        UPDATE user_stats 
        SET comments_received = comments_received - 1, updated_at = NOW()
        WHERE user_id = (SELECT author_id FROM face_models WHERE id = OLD.model_id);
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- 创建更新回复计数的函数
CREATE OR REPLACE FUNCTION update_reply_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 当插入新回复时，增加父评论的回复计数
        IF NEW.parent_id IS NOT NULL THEN
            UPDATE comments 
            SET reply_count = reply_count + 1 
            WHERE id = NEW.parent_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- 当删除回复时，减少父评论的回复计数
        IF OLD.parent_id IS NOT NULL THEN
            UPDATE comments 
            SET reply_count = GREATEST(reply_count - 1, 0) 
            WHERE id = OLD.parent_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- 创建函数来自动更新关注统计数据
CREATE OR REPLACE FUNCTION update_follow_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 更新关注者的关注数
        UPDATE user_stats 
        SET following_count = following_count + 1, updated_at = NOW()
        WHERE user_id = NEW.follower_id;
        
        -- 更新被关注者的粉丝数
        UPDATE user_stats 
        SET followers_count = followers_count + 1, updated_at = NOW()
        WHERE user_id = NEW.following_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- 更新关注者的关注数
        UPDATE user_stats 
        SET following_count = following_count - 1, updated_at = NOW()
        WHERE user_id = OLD.follower_id;
        
        -- 更新被关注者的粉丝数
        UPDATE user_stats 
        SET followers_count = followers_count - 1, updated_at = NOW()
        WHERE user_id = OLD.following_id;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- 创建函数来自动更新标签使用统计
CREATE OR REPLACE FUNCTION update_tag_usage_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tags 
        SET usage_count = usage_count + 1
        WHERE id = NEW.tag_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tags 
        SET usage_count = usage_count - 1
        WHERE id = OLD.tag_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- 创建函数来自动更新用户模型数量统计
CREATE OR REPLACE FUNCTION update_user_model_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE user_stats 
        SET models_count = models_count + 1, updated_at = NOW()
        WHERE user_id = NEW.author_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE user_stats 
        SET models_count = models_count - 1, updated_at = NOW()
        WHERE user_id = OLD.author_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- 添加触发器
CREATE TRIGGER likes_stats_trigger AFTER INSERT OR DELETE ON likes FOR EACH ROW EXECUTE FUNCTION update_model_stats();
CREATE TRIGGER comments_stats_trigger AFTER INSERT OR DELETE ON comments FOR EACH ROW EXECUTE FUNCTION update_comment_stats();
CREATE TRIGGER reply_count_trigger AFTER INSERT OR DELETE ON comments FOR EACH ROW EXECUTE FUNCTION update_reply_count();
CREATE TRIGGER follows_stats_trigger AFTER INSERT OR DELETE ON follows FOR EACH ROW EXECUTE FUNCTION update_follow_stats();
CREATE TRIGGER tag_usage_stats_trigger AFTER INSERT OR DELETE ON model_tags FOR EACH ROW EXECUTE FUNCTION update_tag_usage_stats();
CREATE TRIGGER user_model_stats_trigger AFTER INSERT OR DELETE ON face_models FOR EACH ROW EXECUTE FUNCTION update_user_model_stats();

-- 启用行级安全策略 (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE face_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 用户表的 RLS 策略
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- 面部模型表的 RLS 策略
CREATE POLICY "Anyone can view public models" ON face_models FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view own models" ON face_models FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Users can insert own models" ON face_models FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own models" ON face_models FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own models" ON face_models FOR DELETE USING (auth.uid() = author_id);

-- 评论表的 RLS 策略
CREATE POLICY "Anyone can view comments on public models" ON comments FOR SELECT USING (
    EXISTS (SELECT 1 FROM face_models WHERE id = comments.model_id AND is_public = true)
);
CREATE POLICY "Users can insert comments" ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = author_id);

-- 点赞表的 RLS 策略
CREATE POLICY "Users can view likes on public content" ON likes FOR SELECT USING (
    (model_id IS NOT NULL AND EXISTS (SELECT 1 FROM face_models WHERE id = likes.model_id AND is_public = true)) OR
    (comment_id IS NOT NULL AND EXISTS (SELECT 1 FROM comments c JOIN face_models m ON c.model_id = m.id WHERE c.id = likes.comment_id AND m.is_public = true))
);
CREATE POLICY "Users can manage own likes" ON likes FOR ALL USING (auth.uid() = user_id);

-- 收藏表的 RLS 策略
CREATE POLICY "Users can view own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);

-- 关注表的 RLS 策略
CREATE POLICY "Anyone can view follows" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can manage own follows" ON follows FOR ALL USING (auth.uid() = follower_id);

-- 通知表的 RLS 策略
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- 添加字段注释
COMMENT ON COLUMN face_models.images IS '模型图片URL数组，最多5张，第一张为封面图';
COMMENT ON COLUMN face_models.thumbnail IS '缩略图URL（保留用于向后兼容）';
COMMENT ON COLUMN face_models.json_data IS '捏脸数据JSON格式，可选字段，允许为空';
COMMENT ON COLUMN tags.tag_type IS '标签类型：model_name（模型名字）或 model_style（模型风格）';