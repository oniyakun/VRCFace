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

async function createStoragePolicies() {
  console.log('🔧 创建 Supabase Storage RLS 策略...')

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

    // 2. 使用原始查询创建存储策略
    console.log('\n2. 创建存储策略...')
    
    const storagePolicies = [
      {
        name: '允许所有人查看图片',
        sql: `CREATE POLICY IF NOT EXISTS "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'model-images');`
      },
      {
        name: '允许认证用户上传图片',
        sql: `CREATE POLICY IF NOT EXISTS "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'model-images' AND auth.role() = 'authenticated');`
      },
      {
        name: '允许用户更新自己的图片',
        sql: `CREATE POLICY IF NOT EXISTS "Users can update own images" ON storage.objects FOR UPDATE USING (bucket_id = 'model-images' AND auth.uid()::text = (storage.foldername(name))[1]);`
      },
      {
        name: '允许用户删除自己的图片',
        sql: `CREATE POLICY IF NOT EXISTS "Users can delete own images" ON storage.objects FOR DELETE USING (bucket_id = 'model-images' AND auth.uid()::text = (storage.foldername(name))[1]);`
      },
      {
        name: '允许服务角色管理所有文件',
        sql: `CREATE POLICY IF NOT EXISTS "Service role can manage all files" ON storage.objects FOR ALL USING (bucket_id = 'model-images' AND auth.jwt() ->> 'role' = 'service_role');`
      }
    ]

    for (const policy of storagePolicies) {
      try {
        console.log(`创建策略: ${policy.name}`)
        
        // 直接使用 PostgreSQL 查询
        const { error } = await supabaseAdmin
          .from('_dummy')
          .select('*')
          .limit(0)
        
        // 尝试使用原始查询
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
          },
          body: JSON.stringify({ sql: policy.sql })
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error(`❌ 创建策略失败 (${policy.name}):`, errorText)
        } else {
          console.log(`✅ 策略创建成功: ${policy.name}`)
        }
      } catch (err) {
        console.error(`❌ 执行策略时出错 (${policy.name}):`, err.message)
      }
    }

    // 3. 测试上传功能（使用正确的 MIME 类型）
    console.log('\n3. 测试存储功能...')
    
    // 创建一个简单的图片文件（1x1 像素的 PNG）
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
      0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x37, 0x6E, 0xF9, 0x24, 0x00, 0x00,
      0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ])
    
    const testFile = new Blob([pngData], { type: 'image/png' })
    const testPath = `test/test-${Date.now()}.png`
    
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

    console.log('\n🎉 Storage RLS 策略创建完成！')
    console.log('\n📝 如果策略创建失败，请在 Supabase 控制台的 SQL 编辑器中手动执行 fix-storage-policies-direct.sql 文件中的 SQL 语句。')

  } catch (error) {
    console.error('💥 创建过程中出错:', error)
  }
}

createStoragePolicies()