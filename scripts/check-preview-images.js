const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkPreviewImages() {
  try {
    console.log('🔍 检查 preview_images 字段数据...')
    
    const { data, error } = await supabase
      .from('face_models')
      .select('id, title, preview_images, thumbnail')
      .limit(5)
    
    if (error) {
      console.error('❌ 查询失败:', error)
      return
    }
    
    console.log('📋 Preview Images 数据:')
    data.forEach((model, index) => {
      console.log(`${index + 1}. ${model.title}:`)
      console.log(`   preview_images: ${JSON.stringify(model.preview_images)}`)
      console.log(`   preview_images 类型: ${typeof model.preview_images}`)
      console.log(`   preview_images 长度: ${model.preview_images ? model.preview_images.length : 'null'}`)
      console.log(`   thumbnail: ${model.thumbnail}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('💥 检查过程中出错:', error)
  }
}

checkPreviewImages()