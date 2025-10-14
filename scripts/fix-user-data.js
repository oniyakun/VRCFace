const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// 使用服务角色密钥创建管理员客户端
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

async function fixUserData() {
  try {
    console.log('开始修复用户数据...')
    
    // 获取所有Auth用户
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      console.error('获取Auth用户失败:', authError)
      return
    }
    
    console.log(`找到 ${authUsers.users.length} 个Auth用户`)
    
    for (const authUser of authUsers.users) {
      console.log(`\n处理用户: ${authUser.email} (ID: ${authUser.id})`)
      
      // 检查数据库中是否存在该用户
      const { data: dbUser, error: dbError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()
      
      if (dbError && dbError.code === 'PGRST116') {
        // 用户不存在，检查是否有相同邮箱的用户
        const { data: emailUser, error: emailError } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', authUser.email)
          .single()
        
        if (emailUser) {
          console.log(`  发现邮箱匹配但ID不同的用户，更新ID: ${emailUser.id} -> ${authUser.id}`)
          
          // 更新用户ID
          const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ id: authUser.id })
            .eq('email', authUser.email)
          
          if (updateError) {
            console.error(`  更新用户ID失败:`, updateError)
          } else {
            console.log(`  ✓ 用户ID更新成功`)
            
            // 检查并创建user_stats记录
            const { data: statsData, error: statsError } = await supabaseAdmin
              .from('user_stats')
              .select('*')
              .eq('user_id', authUser.id)
              .single()
            
            if (statsError && statsError.code === 'PGRST116') {
              // 创建user_stats记录
              const { error: createStatsError } = await supabaseAdmin
                .from('user_stats')
                .insert({
                  user_id: authUser.id,
                  models_count: 0,
                  likes_received: 0,
                  comments_received: 0,
                  followers_count: 0,
                  following_count: 0
                })
              
              if (createStatsError) {
                console.error(`  创建用户统计失败:`, createStatsError)
              } else {
                console.log(`  ✓ 用户统计记录创建成功`)
              }
            }
          }
        } else {
          console.log(`  用户在数据库中不存在，创建新记录`)
          
          // 创建新用户记录
          const { error: insertError } = await supabaseAdmin
            .from('users')
            .insert({
              id: authUser.id,
              email: authUser.email,
              username: authUser.email.split('@')[0], // 使用邮箱前缀作为用户名
              display_name: authUser.email.split('@')[0],
              is_verified: !!authUser.email_confirmed_at,
              created_at: authUser.created_at
            })
          
          if (insertError) {
            console.error(`  创建用户记录失败:`, insertError)
          } else {
            console.log(`  ✓ 用户记录创建成功`)
            
            // 创建user_stats记录
            const { error: createStatsError } = await supabaseAdmin
              .from('user_stats')
              .insert({
                user_id: authUser.id,
                models_count: 0,
                likes_received: 0,
                comments_received: 0,
                followers_count: 0,
                following_count: 0
              })
            
            if (createStatsError) {
              console.error(`  创建用户统计失败:`, createStatsError)
            } else {
              console.log(`  ✓ 用户统计记录创建成功`)
            }
          }
        }
      } else if (dbUser) {
        console.log(`  ✓ 用户已存在于数据库中`)
        
        // 检查user_stats记录
        const { data: statsData, error: statsError } = await supabaseAdmin
          .from('user_stats')
          .select('*')
          .eq('user_id', authUser.id)
          .single()
        
        if (statsError && statsError.code === 'PGRST116') {
          console.log(`  创建缺失的用户统计记录`)
          
          const { error: createStatsError } = await supabaseAdmin
            .from('user_stats')
            .insert({
              user_id: authUser.id,
              models_count: 0,
              likes_received: 0,
              comments_received: 0,
              followers_count: 0,
              following_count: 0
            })
          
          if (createStatsError) {
            console.error(`  创建用户统计失败:`, createStatsError)
          } else {
            console.log(`  ✓ 用户统计记录创建成功`)
          }
        } else {
          console.log(`  ✓ 用户统计记录已存在`)
        }
      }
    }
    
    console.log('\n用户数据修复完成！')
    
  } catch (error) {
    console.error('修复用户数据时发生错误:', error)
  }
}

fixUserData()