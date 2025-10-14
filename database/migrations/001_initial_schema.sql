-- VRCFace 数据库初始化脚本
-- 创建时间: 2024-01-01
-- 描述: 创建用户、模型、评论、标签等核心表

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
    json_data JSONB NOT NULL,
    category VARCHAR(20) DEFAULT 'other' CHECK (category IN ('cute', 'cool', 'funny', 'gentle', 'sci-fi', 'animal', 'other')),
    is_public BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
CREATE INDEX idx_face_models_search ON face_models USING gin(to_tsvector('english', title || ' ' || description));
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

-- 创建点赞统计触发器
CREATE TRIGGER trigger_update_model_stats 
    AFTER INSERT OR DELETE ON likes 
    FOR EACH ROW EXECUTE FUNCTION update_model_stats();

-- 创建函数来自动更新评论统计
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

-- 创建评论统计触发器
CREATE TRIGGER trigger_update_comment_stats 
    AFTER INSERT OR DELETE ON comments 
    FOR EACH ROW EXECUTE FUNCTION update_comment_stats();

-- 创建函数来自动更新关注统计
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

-- 创建关注统计触发器
CREATE TRIGGER trigger_update_follow_stats 
    AFTER INSERT OR DELETE ON follows 
    FOR EACH ROW EXECUTE FUNCTION update_follow_stats();

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

-- 创建标签使用统计触发器
CREATE TRIGGER trigger_update_tag_usage_stats 
    AFTER INSERT OR DELETE ON model_tags 
    FOR EACH ROW EXECUTE FUNCTION update_tag_usage_stats();

-- 插入一些初始标签数据
INSERT INTO tags (name, description, category, color) VALUES
('可爱', '可爱风格的表情', 'emotion', '#FF69B4'),
('酷炫', '酷炫风格的表情', 'emotion', '#1E90FF'),
('搞笑', '搞笑风格的表情', 'emotion', '#FFD700'),
('温柔', '温柔风格的表情', 'emotion', '#98FB98'),
('科幻', '科幻风格的表情', 'style', '#9370DB'),
('动物', '动物风格的表情', 'character', '#8B4513'),
('经典', '经典风格的表情', 'style', '#696969'),
('现代', '现代风格的表情', 'style', '#4169E1'),
('卡通', '卡通风格的表情', 'style', '#FF6347'),
('写实', '写实风格的表情', 'style', '#2F4F4F');

-- 创建 RLS (Row Level Security) 策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE face_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 用户可以查看所有公开的模型
CREATE POLICY "Public models are viewable by everyone" ON face_models
    FOR SELECT USING (is_public = true);

-- 用户可以查看自己的所有模型
CREATE POLICY "Users can view own models" ON face_models
    FOR SELECT USING (auth.uid() = author_id);

-- 用户可以创建模型
CREATE POLICY "Users can create models" ON face_models
    FOR INSERT WITH CHECK (auth.uid() = author_id);

-- 用户可以更新自己的模型
CREATE POLICY "Users can update own models" ON face_models
    FOR UPDATE USING (auth.uid() = author_id);

-- 用户可以删除自己的模型
CREATE POLICY "Users can delete own models" ON face_models
    FOR DELETE USING (auth.uid() = author_id);

-- 评论策略
CREATE POLICY "Comments are viewable by everyone" ON comments
    FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own comments" ON comments
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments" ON comments
    FOR DELETE USING (auth.uid() = author_id);

-- 点赞策略
CREATE POLICY "Users can manage own likes" ON likes
    FOR ALL USING (auth.uid() = user_id);

-- 收藏策略
CREATE POLICY "Users can manage own favorites" ON favorites
    FOR ALL USING (auth.uid() = user_id);

-- 关注策略
CREATE POLICY "Users can manage own follows" ON follows
    FOR ALL USING (auth.uid() = follower_id);

-- 通知策略
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);