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
    
    // 读取迁移SQL文件
    const migrationPath = path.join(__dirname, '../database/migrations/002_add_multiple_images.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // 分割SQL语句（按分号分割，忽略注释）
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'))
    
    console.log(`📝 找到 ${statements.length} 条SQL语句`)
    
    // 逐条执行SQL语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (!statement) continue
      
      console.log(`⚡ 执行语句 ${i + 1}/${statements.length}...`)
      console.log(`   ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`)
      
      const { error } = await supabaseAdmin.rpc('exec_sql', {
        sql: statement
      })
      
      if (error) {
        console.error(`❌ 执行语句 ${i + 1} 失败:`, error)
        throw error
      }
      
      console.log(`✅ 语句 ${i + 1} 执行成功`)
    }
    
    console.log('🎉 多张图片支持迁移应用成功！')
    
    // 验证迁移结果
    console.log('🔍 验证迁移结果...')
    
    // 检查 images 字段是否存在
    const { data: columns, error: columnsError } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'face_models')
      .eq('column_name', 'images')
    
    if (columnsError) {
      console.error('❌ 验证字段失败:', columnsError)
    } else if (columns && columns.length > 0) {
      console.log('✅ images 字段已成功添加')
      console.log('   字段信息:', columns[0])
    } else {
      console.log('⚠️  未找到 images 字段')
    }
    
    // 检查现有数据的迁移情况
    const { data: models, error: modelsError } = await supabaseAdmin
      .from('face_models')
      .select('id, title, thumbnail, images')
      .limit(5)
    
    if (modelsError) {
      console.error('❌ 查询模型数据失败:', modelsError)
    } else {
      console.log('📊 前5条模型的图片数据:')
      models.forEach((model, index) => {
        console.log(`${index + 1}. ${model.title}`)
        console.log(`   thumbnail: ${model.thumbnail || 'null'}`)
        console.log(`   images: ${JSON.stringify(model.images)}`)
      })
    }
    
  } catch (error) {
    console.error('💥 迁移失败:', error)
    process.exit(1)
  }
}

// 执行迁移
applyMigration()