-- 修复 users 表的 RLS 策略

-- 1. 创建允许所有人查看用户基本信息的策略
CREATE POLICY IF NOT EXISTS "Users basic info is viewable by everyone" ON users
FOR SELECT USING (true);

-- 2. 创建用户可以更新自己信息的策略
CREATE POLICY IF NOT EXISTS "Users can update own profile" ON users
FOR UPDATE USING (auth.uid() = id);

-- 3. 创建服务角色可以插入用户的策略
CREATE POLICY IF NOT EXISTS "Service role can insert users" ON users
FOR INSERT WITH CHECK (true);