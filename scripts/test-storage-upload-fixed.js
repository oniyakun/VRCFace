const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// 加载环境变量
require('dotenv').config({ path: '.env.local' })

// 创建管理员客户端
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

const BUCKET_NAME = 'model-images'

async function testStorageUpload() {
  console.log('🧪 测试存储上传功能...')
  
  try {
    // 1. 检查存储桶是否存在
    console.log('\n1. 检查存储桶状态...')
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
    
    if (listError) {
      console.error('❌ 获取存储桶列表失败:', listError)
      return
    }
    
    const bucket = buckets?.find(b => b.name === BUCKET_NAME)
    if (bucket) {
      console.log(`✅ 存储桶 "${BUCKET_NAME}" 存在`)
      console.log(`   - 公开访问: ${bucket.public}`)
      console.log(`   - 创建时间: ${bucket.created_at}`)
    } else {
      console.log(`❌ 存储桶 "${BUCKET_NAME}" 不存在`)
      return
    }
    
    // 2. 创建测试图片文件（简单的SVG）
    console.log('\n2. 创建测试图片文件...')
    const testImageContent = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#4F46E5"/>
  <text x="50" y="50" text-anchor="middle" dy=".3em" fill="white" font-family="Arial" font-size="12">TEST</text>
</svg>`
    const testFileName = `test-${Date.now()}.svg`
    const testFilePath = `users/test-user/models/${testFileName}`
    
    // 3. 测试上传
    console.log('\n3. 测试图片上传...')
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(testFilePath, testImageContent, {
        contentType: 'image/svg+xml',
        cacheControl: '3600',
        upsert: false
      })
    
    if (uploadError) {
      console.error('❌ 上传失败:', uploadError)
      console.error('   错误代码:', uploadError.statusCode)
      console.error('   错误信息:', uploadError.message)
      return
    }
    
    console.log('✅ 文件上传成功')
    console.log('   上传路径:', uploadData.path)
    
    // 4. 测试获取公共URL
    console.log('\n4. 测试获取公共URL...')
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(testFilePath)
    
    console.log('✅ 公共URL获取成功')
    console.log('   URL:', urlData.publicUrl)
    
    // 5. 测试文件列表
    console.log('\n5. 测试文件列表...')
    const { data: listData, error: listFileError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .list('users/test-user/models', {
        limit: 10,
        offset: 0
      })
    
    if (listFileError) {
      console.error('❌ 获取文件列表失败:', listFileError)
    } else {
      console.log('✅ 文件列表获取成功')
      console.log(`   找到 ${listData?.length || 0} 个文件`)
      listData?.forEach(file => {
        console.log(`   - ${file.name} (${file.metadata?.size || 0} bytes)`)
      })
    }
    
    // 6. 清理测试文件
    console.log('\n6. 清理测试文件...')
    const { error: deleteError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove([testFilePath])
    
    if (deleteError) {
      console.error('❌ 删除测试文件失败:', deleteError)
    } else {
      console.log('✅ 测试文件删除成功')
    }
    
    console.log('\n🎉 存储上传测试完成！所有功能正常工作。')
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error)
  }
}

// 运行测试
testStorageUpload()