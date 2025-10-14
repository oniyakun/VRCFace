const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

// 创建Supabase管理员客户端
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function applyMigration() {
  try {
    console.log('🚀 开始应用多张图片支持迁移...')
    
    // 手动执行迁移步骤
    console.log('📝 步骤1: 添加 images 字段...')
    
    // 检查 images 字段是否已存在
    const { data: existingColumn } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'face_models')
      .eq('column_name', 'images')
      .single()
    
    if (existingColumn) {
      console.log('⚠️  images 字段已存在，跳过添加步骤')
    } else {
      console.log('⚡ 添加 images 字段...')
      // 由于无法直接执行DDL，我们需要提示用户手动执行
      console.log('❌ 无法通过API直接执行DDL语句')
      console.log('📋 请在Supabase控制台的SQL编辑器中手动执行以下SQL:')
      console.log('')
      console.log('-- 添加 images 字段')
      console.log('ALTER TABLE face_models ADD COLUMN images TEXT[] DEFAULT \'{}\';')
      console.log('')
      console.log('-- 迁移现有数据')
      console.log('UPDATE face_models SET images = ARRAY[thumbnail] WHERE thumbnail IS NOT NULL AND thumbnail != \'\';')
      console.log('')
      console.log('-- 添加约束')
      console.log('ALTER TABLE face_models ADD CONSTRAINT face_models_images_max_count CHECK (array_length(images, 1) <= 5);')
      console.log('ALTER TABLE face_models ADD CONSTRAINT face_models_images_not_empty CHECK (array_length(images, 1) >= 1);')
      console.log('')
      console.log('-- 创建索引')
      console.log('CREATE INDEX idx_face_models_images ON face_models USING GIN (images);')
      console.log('')
      return
    }
    
    // 如果字段已存在，检查数据迁移情况
    console.log('🔍 检查数据迁移情况...')
    
    const { data: models, error: modelsError } = await supabaseAdmin
      .from('face_models')
      .select('id, title, thumbnail, images')
      .limit(5)
    
    if (modelsError) {
      console.error('❌ 查询模型数据失败:', modelsError)
      return
    }
    
    console.log('📊 前5条模型的图片数据:')
    models.forEach((model, index) => {
      console.log(`${index + 1}. ${model.title}`)
      console.log(`   thumbnail: ${model.thumbnail || 'null'}`)
      console.log(`   images: ${JSON.stringify(model.images)}`)
    })
    
    // 检查是否需要数据迁移
    const needsMigration = models.some(model => 
      model.thumbnail && (!model.images || model.images.length === 0)
    )
    
    if (needsMigration) {
      console.log('⚡ 执行数据迁移...')
      
      for (const model of models) {
        if (model.thumbnail && (!model.images || model.images.length === 0)) {
          const { error: updateError } = await supabaseAdmin
            .from('face_models')
            .update({ images: [model.thumbnail] })
            .eq('id', model.id)
          
          if (updateError) {
            console.error(`❌ 迁移模型 ${model.title} 失败:`, updateError)
          } else {
            console.log(`✅ 迁移模型 ${model.title} 成功`)
          }
        }
      }
    } else {
      console.log('✅ 数据已完成迁移')
    }
    
    console.log('🎉 迁移检查完成！')
    
  } catch (error) {
    console.error('💥 迁移失败:', error)
    process.exit(1)
  }
}

// 执行迁移
applyMigration()