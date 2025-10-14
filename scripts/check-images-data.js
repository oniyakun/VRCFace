require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少 Supabase 环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkImagesData() {
  console.log('🔍 检查 face_models 表中的 images 字段数据...');
  
  try {
    const { data, error } = await supabase
      .from('face_models')
      .select('id, title, images, thumbnail')
      .limit(5);
    
    if (error) {
      console.error('❌ 查询错误:', error);
      return;
    }
    
    console.log(`📊 找到 ${data.length} 条记录:`);
    
    data.forEach((model, index) => {
      console.log(`\n${index + 1}. ${model.title} (ID: ${model.id})`);
      console.log(`   缩略图: ${model.thumbnail || '无'}`);
      console.log(`   图片数组: ${model.images ? JSON.stringify(model.images) : '无'}`);
      console.log(`   图片数量: ${model.images ? model.images.length : 0}`);
    });
    
  } catch (err) {
    console.error('❌ 执行错误:', err);
  }
}

checkImagesData();