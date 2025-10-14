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

async function checkRLSPolicies() {
  try {
    console.log('检查 users 表的 RLS 策略...')
    
    // 检查 RLS 是否启用
    const { data: rlsStatus, error: rlsError } = await supabaseAdmin
      .from('pg_class')
      .select('relname, relrowsecurity')
      .eq('relname', 'users')
      .single()
    
    if (rlsError) {
      console.error('检查 RLS 状态失败:', rlsError)
    } else {
      console.log('RLS 状态:', rlsStatus)
    }
    
    // 检查现有策略
    const { data: policies, error: policiesError } = await supabaseAdmin
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'users')
    
    if (policiesError) {
      console.error('检查策略失败:', policiesError)
    } else {
      console.log('现有策略:', policies)
    }
    
    // 尝试直接插入用户记录
    console.log('\n尝试直接插入用户记录...')
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: '00000000-0000-0000-0000-000000000001',
        username: 'test_user',
        email: 'test@example.com',
        display_name: 'Test User',
        role: 'user'
      })
      .select()
    
    if (insertError) {
      console.error('插入失败:', insertError)
    } else {
      console.log('插入成功:', insertData)
      
      // 清理测试数据
      await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', '00000000-0000-0000-0000-000000000001')
    }
    
  } catch (error) {
    console.error('检查过程中出错:', error)
  }
}

checkRLSPolicies()