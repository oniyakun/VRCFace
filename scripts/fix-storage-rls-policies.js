const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function fixStorageRLSPolicies() {
  console.log('🔧 修复 Supabase Storage RLS 策略...')

  try {
    // 1. 确保存储桶存在
    console.log('1. 检查存储桶是否存在...')
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
    
    if (listError) {
      console.error('❌ 获取存储桶列表失败:', listError)
      return
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === 'model-images')
    
    if (!bucketExists) {
      console.log('创建 model-images 存储桶...')
      const { error: createError } = await supabaseAdmin.storage.createBucket('model-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        fileSizeLimit: 10485760 // 10MB
      })
      
      if (createError) {
        console.error('❌ 创建存储桶失败:', createError)
        return
      } else {
        console.log('✅ 存储桶创建成功')
      }
    } else {
      console.log('✅ 存储桶已存在')
    }

    // 2. 创建存储策略
    console.log('\n2. 创建存储策略...')
    
    const storagePolicies = [
      {
        name: '允许所有人查看图片',
        sql: `
          CREATE POLICY IF NOT EXISTS "Public Access" ON storage.objects
          FOR SELECT USING (bucket_id = 'model-images');
        `
      },
      {
        name: '允许认证用户上传图片',
        sql: `
          CREATE POLICY IF NOT EXISTS "Authenticated users can upload" ON storage.objects
          FOR INSERT WITH CHECK (
            bucket_id = 'model-images' 
            AND auth.role() = 'authenticated'
          );
        `
      },
      {
        name: '允许用户更新自己的图片',
        sql: `
          CREATE POLICY IF NOT EXISTS "Users can update own images" ON storage.objects
          FOR UPDATE USING (
            bucket_id = 'model-images' 
            AND auth.uid()::text = (storage.foldername(name))[1]
          );
        `
      },
      {
        name: '允许用户删除自己的图片',
        sql: `
          CREATE POLICY IF NOT EXISTS "Users can delete own images" ON storage.objects
          FOR DELETE USING (
            bucket_id = 'model-images' 
            AND auth.uid()::text = (storage.foldername(name))[1]
          );
        `
      }
    ]

    for (const policy of storagePolicies) {
      try {
        console.log(`创建策略: ${policy.name}`)
        
        // 使用 rpc 执行原始 SQL
        const { error } = await supabaseAdmin.rpc('exec_sql', {
          sql: policy.sql
        })
        
        if (error) {
          console.error(`❌ 创建策略失败 (${policy.name}):`, error.message)
        } else {
          console.log(`✅ 策略创建成功: ${policy.name}`)
        }
      } catch (err) {
        console.error(`❌ 执行策略时出错 (${policy.name}):`, err)
      }
    }

    // 3. 测试上传功能
    console.log('\n3. 测试存储功能...')
    
    // 创建一个测试文件
    const testContent = 'test image content'
    const testFile = new Blob([testContent], { type: 'text/plain' })
    const testPath = `test/test-${Date.now()}.txt`
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('model-images')
      .upload(testPath, testFile)
    
    if (uploadError) {
      console.error('❌ 测试上传失败:', uploadError)
    } else {
      console.log('✅ 测试上传成功:', uploadData.path)
      
      // 清理测试文件
      await supabaseAdmin.storage
        .from('model-images')
        .remove([testPath])
      
      console.log('✅ 测试文件已清理')
    }

    console.log('\n🎉 Storage RLS 策略修复完成！')

  } catch (error) {
    console.error('💥 修复过程中出错:', error)
  }
}

fixStorageRLSPolicies()