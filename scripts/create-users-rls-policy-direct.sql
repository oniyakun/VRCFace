-- 直接修复 users 表的 RLS 策略
-- 需要在 Supabase 控制台的 SQL 编辑器中执行

-- 1. 删除可能存在的旧策略
DROP POLICY IF EXISTS "Users basic info is viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Service role can create users" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;

-- 2. 创建新的策略
-- 允许所有人查看用户的基本信息（用于显示作者信息）
CREATE POLICY "Users basic info is viewable by everyone" ON users
FOR SELECT USING (true);

-- 允许用户更新自己的信息
CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (auth.uid() = id);

-- 允许服务角色创建用户
CREATE POLICY "Service role can create users" ON users
FOR INSERT WITH CHECK (true);

-- 3. 确保 RLS 已启用
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. 验证策略是否创建成功
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;