-- 修复用户表的 RLS 策略
-- 添加缺失的用户表策略

-- 用户可以查看所有用户的基本信息（用于显示作者信息等）
CREATE POLICY "Users are viewable by everyone" ON users
    FOR SELECT USING (true);

-- 用户可以更新自己的信息
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- 允许系统创建用户记录（通过服务角色）
CREATE POLICY "Service role can create users" ON users
    FOR INSERT WITH CHECK (true);

-- 用户统计表策略
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- 用户统计可以被所有人查看
CREATE POLICY "User stats are viewable by everyone" ON user_stats
    FOR SELECT USING (true);

-- 允许系统创建和更新用户统计
CREATE POLICY "Service role can manage user stats" ON user_stats
    FOR ALL WITH CHECK (true);