const { createClient } = require('@supabase/supabase-js');

// 从环境变量加载配置
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少 Supabase 配置信息');
  process.exit(1);
}

// 使用 service role key 创建客户端（具有完整权限）
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getTableColumns(tableName) {
  console.log(`\n📋 查询表 ${tableName} 的字段结构:`);
  
  try {
    // 使用 PostgreSQL 信息模式查询字段
    const { data, error } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns 
          WHERE table_name = '${tableName}' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      });
    
    if (error) {
      console.log(`   ❌ 查询失败: ${error.message}`);
      
      // 备用方法：尝试查询现有数据
      const { data: sampleData, error: sampleError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (!sampleError && sampleData && sampleData.length > 0) {
        console.log(`   字段列表: ${Object.keys(sampleData[0]).join(', ')}`);
        console.log(`   示例数据:`, sampleData[0]);
      } else {
        console.log(`   表为空或无法访问`);
      }
    } else {
      console.log(`   字段信息:`);
      data.forEach(col => {
        console.log(`     - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(必填)' : '(可选)'}`);
      });
    }
  } catch (err) {
    console.error(`   检查失败: ${err.message}`);
  }
}

async function checkExistingData() {
  console.log('\n📊 检查现有数据:');
  
  const tables = ['users', 'face_models', 'comments', 'likes', 'favorites', 'tags'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`);
      } else {
        console.log(`   ✅ ${table}: ${data.length} 条记录`);
        if (data.length > 0) {
          console.log(`      字段: ${Object.keys(data[0]).join(', ')}`);
        }
      }
    } catch (err) {
      console.log(`   ❌ ${table}: ${err.message}`);
    }
  }
}

async function testValidRoles() {
  console.log('\n👤 测试 users 表的有效角色:');
  
  const testId = '550e8400-e29b-41d4-a716-446655440000'; // 有效的 UUID
  const roles = ['user', 'creator', 'admin', 'moderator'];
  
  for (const role of roles) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: testId,
          username: 'test_user',
          email: 'test@example.com',
          role: role
        })
        .select();
      
      if (error) {
        console.log(`   ❌ ${role}: ${error.message}`);
      } else {
        console.log(`   ✅ ${role}: 有效角色`);
        // 清理测试数据
        await supabase.from('users').delete().eq('id', testId);
      }
    } catch (err) {
      console.log(`   ❌ ${role}: ${err.message}`);
    }
  }
}

async function main() {
  console.log('🔍 检查数据库表结构和约束...\n');
  
  const tables = ['users', 'face_models', 'comments', 'likes', 'favorites', 'tags'];
  
  // 检查每个表的字段结构
  for (const table of tables) {
    await getTableColumns(table);
  }
  
  // 检查现有数据
  await checkExistingData();
  
  // 测试角色约束
  await testValidRoles();
  
  console.log('\n✅ 检查完成！');
}

// 运行检查
main().catch(err => {
  console.error('💥 检查过程中发生错误:', err);
  process.exit(1);
});