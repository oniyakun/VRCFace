-- 数据库函数定义
-- 用于更新用户统计数据

-- 增加关注数
CREATE OR REPLACE FUNCTION increment_following_count(user_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE user_stats 
    SET following_count = following_count + 1, updated_at = NOW()
    WHERE user_stats.user_id = increment_following_count.user_id;
    
    -- 如果用户统计记录不存在，则创建一个
    IF NOT FOUND THEN
        INSERT INTO user_stats (user_id, following_count, models_count, likes_received, comments_received, followers_count)
        VALUES (increment_following_count.user_id, 1, 0, 0, 0, 0);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 减少关注数
CREATE OR REPLACE FUNCTION decrement_following_count(user_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE user_stats 
    SET following_count = GREATEST(following_count - 1, 0), updated_at = NOW()
    WHERE user_stats.user_id = decrement_following_count.user_id;
END;
$$ LANGUAGE plpgsql;

-- 增加粉丝数
CREATE OR REPLACE FUNCTION increment_followers_count(user_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE user_stats 
    SET followers_count = followers_count + 1, updated_at = NOW()
    WHERE user_stats.user_id = increment_followers_count.user_id;
    
    -- 如果用户统计记录不存在，则创建一个
    IF NOT FOUND THEN
        INSERT INTO user_stats (user_id, followers_count, models_count, likes_received, comments_received, following_count)
        VALUES (increment_followers_count.user_id, 1, 0, 0, 0, 0);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 减少粉丝数
CREATE OR REPLACE FUNCTION decrement_followers_count(user_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE user_stats 
    SET followers_count = GREATEST(followers_count - 1, 0), updated_at = NOW()
    WHERE user_stats.user_id = decrement_followers_count.user_id;
END;
$$ LANGUAGE plpgsql;

-- 增加模型数量
CREATE OR REPLACE FUNCTION increment_models_count(user_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE user_stats 
    SET models_count = models_count + 1, updated_at = NOW()
    WHERE user_stats.user_id = increment_models_count.user_id;
    
    -- 如果用户统计记录不存在，则创建一个
    IF NOT FOUND THEN
        INSERT INTO user_stats (user_id, models_count, likes_received, comments_received, followers_count, following_count)
        VALUES (increment_models_count.user_id, 1, 0, 0, 0, 0);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 减少模型数量
CREATE OR REPLACE FUNCTION decrement_models_count(user_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE user_stats 
    SET models_count = GREATEST(models_count - 1, 0), updated_at = NOW()
    WHERE user_stats.user_id = decrement_models_count.user_id;
END;
$$ LANGUAGE plpgsql;

-- 增加收到的点赞数
CREATE OR REPLACE FUNCTION increment_likes_received(user_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE user_stats 
    SET likes_received = likes_received + 1, updated_at = NOW()
    WHERE user_stats.user_id = increment_likes_received.user_id;
    
    -- 如果用户统计记录不存在，则创建一个
    IF NOT FOUND THEN
        INSERT INTO user_stats (user_id, likes_received, models_count, comments_received, followers_count, following_count)
        VALUES (increment_likes_received.user_id, 1, 0, 0, 0, 0);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 减少收到的点赞数
CREATE OR REPLACE FUNCTION decrement_likes_received(user_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE user_stats 
    SET likes_received = GREATEST(likes_received - 1, 0), updated_at = NOW()
    WHERE user_stats.user_id = decrement_likes_received.user_id;
END;
$$ LANGUAGE plpgsql;

-- 增加模型浏览量
CREATE OR REPLACE FUNCTION increment_model_views(model_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE model_stats 
    SET views = views + 1, updated_at = NOW()
    WHERE model_stats.model_id = increment_model_views.model_id;
    
    -- 如果模型统计记录不存在，则创建一个
    IF NOT FOUND THEN
        INSERT INTO model_stats (model_id, views, downloads, likes, comments)
        VALUES (increment_model_views.model_id, 1, 0, 0, 0);
    END IF;
END;
$$ LANGUAGE plpgsql;