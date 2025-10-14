-- 修复 Supabase Storage RLS 策略
-- 这些策略需要在 Supabase 控制台的 SQL 编辑器中执行

-- 首先删除可能存在的旧策略
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
DROP POLICY IF EXISTS "Service role can manage all files" ON storage.objects;

-- 1. 允许所有人查看 model-images 存储桶中的图片
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'model-images');

-- 2. 允许认证用户上传图片到 model-images 存储桶
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'model-images' 
  AND auth.role() = 'authenticated'
);

-- 3. 允许用户更新自己的图片
-- 这里假设文件路径格式为 users/{user_id}/...
CREATE POLICY "Users can update own images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'model-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. 允许用户删除自己的图片
CREATE POLICY "Users can delete own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'model-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. 允许服务角色管理所有文件（用于管理员操作）
CREATE POLICY "Service role can manage all files" ON storage.objects
FOR ALL USING (
  bucket_id = 'model-images' 
  AND auth.jwt() ->> 'role' = 'service_role'
);