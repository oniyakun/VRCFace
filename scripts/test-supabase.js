const { createClient } = require('@supabase/supabase-js');

// 从环境变量加载配置
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少 Supabase 配置信息');
  console.error('请确保 .env.local 文件中包含以下变量:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// 使用 service role key 创建客户端（具有完整权限）
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  console.log('🔗 测试 Supabase 连接...');
  
  try {
    // 测试基本连接
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ 连接失败:', error.message);
      return false;
    }
    
    console.log('✅ Supabase 连接成功！');
    return true;
  } catch (err) {
    console.error('❌ 连接异常:', err.message);
    return false;
  }
}

async function insertTestUsers() {
  console.log('👥 插入测试用户...');
  
  const testUsers = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      username: 'alice_designer',
      email: 'alice@example.com',
      display_name: 'Alice Chen',
      bio: '专业的 VRChat 面部表情设计师，擅长可爱风格',
      role: 'user',  // 使用有效的角色
      is_verified: true
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      username: 'bob_artist',
      email: 'bob@example.com',
      display_name: 'Bob Wilson',
      bio: '3D 艺术家，专注于写实风格面部表情',
      role: 'user',  // 使用有效的角色
      is_verified: true
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      username: 'charlie_user',
      email: 'charlie@example.com',
      display_name: 'Charlie Kim',
      bio: 'VRChat 爱好者，喜欢收集各种表情',
      role: 'user',
      is_verified: false
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      username: 'admin_user',
      email: 'admin@example.com',
      display_name: 'Admin User',
      bio: '网站管理员',
      role: 'admin',
      is_verified: true
    }
  ];
  
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(testUsers, { onConflict: 'id' });
    
    if (error) {
      console.error('❌ 插入用户失败:', error.message);
      return false;
    }
    
    console.log(`✅ 成功插入 ${testUsers.length} 个用户`);
    return true;
  } catch (err) {
    console.error('❌ 插入用户异常:', err.message);
    return false;
  }
}

async function insertTestModels() {
  console.log('🎭 插入测试模型...');
  
  const testModels = [
    {
      id: '660e8400-e29b-41d4-a716-446655440001',
      title: '可爱猫咪表情包',
      description: '一套包含12种不同猫咪表情的面部动画，适合可爱风格的角色',
      author_id: '550e8400-e29b-41d4-a716-446655440001',
      category: 'cute',  // 有效分类
      json_data: {
        expressions: [
          { name: 'happy', blendshapes: { mouthSmile: 0.8, eyeSquint: 0.3 } },
          { name: 'sad', blendshapes: { mouthFrown: 0.7, eyeWide: 0.2 } }
        ],
        version: '1.0'
      },
      is_public: true,
      is_verified: true
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440002',
      title: '写实人类表情',
      description: '高质量的写实人类面部表情，包含细腻的微表情变化',
      author_id: '550e8400-e29b-41d4-a716-446655440002',
      category: 'gentle',  // 修正为有效分类
      json_data: {
        expressions: [
          { name: 'neutral', blendshapes: {} },
          { name: 'smile', blendshapes: { mouthSmile: 0.6, cheekPuff: 0.2 } }
        ],
        version: '2.1'
      },
      is_public: true,
      is_verified: true
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440003',
      title: '动漫风格表情',
      description: '日式动漫风格的夸张表情包，适合二次元角色',
      author_id: '550e8400-e29b-41d4-a716-446655440001',
      category: 'funny',  // 修正为有效分类
      json_data: {
        expressions: [
          { name: 'excited', blendshapes: { eyeWide: 0.9, mouthOpen: 0.7 } },
          { name: 'embarrassed', blendshapes: { eyeSquint: 0.8, mouthSmile: 0.3 } }
        ],
        version: '1.5'
      },
      is_public: true,
      is_verified: false
    }
  ];
  
  try {
    const { data, error } = await supabase
      .from('face_models')
      .upsert(testModels, { onConflict: 'id' });
    
    if (error) {
      console.error('❌ 插入模型失败:', error.message);
      return false;
    }
    
    console.log(`✅ 成功插入 ${testModels.length} 个模型`);
    return true;
  } catch (err) {
    console.error('❌ 插入模型异常:', err.message);
    return false;
  }
}

async function insertTestComments() {
  console.log('💬 插入测试评论...');
  
  const testComments = [
    {
      id: '770e8400-e29b-41d4-a716-446655440001',
      model_id: '660e8400-e29b-41d4-a716-446655440001',
      author_id: '550e8400-e29b-41d4-a716-446655440003',
      content: '这个表情包太可爱了！我的猫咪角色用起来效果很棒！'
    },
    {
      id: '770e8400-e29b-41d4-a716-446655440002',
      model_id: '660e8400-e29b-41d4-a716-446655440002',
      author_id: '550e8400-e29b-41d4-a716-446655440003',
      content: '写实度很高，细节处理得很好'
    },
    {
      id: '770e8400-e29b-41d4-a716-446655440003',
      model_id: '660e8400-e29b-41d4-a716-446655440003',
      author_id: '550e8400-e29b-41d4-a716-446655440002',
      content: '动漫风格很棒，表情很生动'
    }
  ];
  
  try {
    const { data, error } = await supabase
      .from('comments')
      .upsert(testComments, { onConflict: 'id' });
    
    if (error) {
      console.error('❌ 插入评论失败:', error.message);
      return false;
    }
    
    console.log(`✅ 成功插入 ${testComments.length} 个评论`);
    return true;
  } catch (err) {
    console.error('❌ 插入评论异常:', err.message);
    return false;
  }
}

async function insertTestLikes() {
  console.log('👍 插入测试点赞...');
  
  const testLikes = [
    {
      user_id: '550e8400-e29b-41d4-a716-446655440003',
      model_id: '660e8400-e29b-41d4-a716-446655440001'
    },
    {
      user_id: '550e8400-e29b-41d4-a716-446655440003',
      model_id: '660e8400-e29b-41d4-a716-446655440002'
    },
    {
      user_id: '550e8400-e29b-41d4-a716-446655440002',
      model_id: '660e8400-e29b-41d4-a716-446655440001'
    },
    {
      user_id: '550e8400-e29b-41d4-a716-446655440004',
      model_id: '660e8400-e29b-41d4-a716-446655440003'
    }
  ];
  
  try {
    const { data, error } = await supabase
      .from('likes')
      .upsert(testLikes, { onConflict: 'user_id,model_id' });
    
    if (error) {
      console.error('❌ 插入点赞失败:', error.message);
      return false;
    }
    
    console.log(`✅ 成功插入 ${testLikes.length} 个点赞`);
    return true;
  } catch (err) {
    console.error('❌ 插入点赞异常:', err.message);
    return false;
  }
}

async function insertTestFavorites() {
  console.log('⭐ 插入测试收藏...');
  
  const testFavorites = [
    {
      user_id: '550e8400-e29b-41d4-a716-446655440003',
      model_id: '660e8400-e29b-41d4-a716-446655440001'
    },
    {
      user_id: '550e8400-e29b-41d4-a716-446655440003',
      model_id: '660e8400-e29b-41d4-a716-446655440002'
    },
    {
      user_id: '550e8400-e29b-41d4-a716-446655440002',
      model_id: '660e8400-e29b-41d4-a716-446655440003'
    }
  ];
  
  try {
    const { data, error } = await supabase
      .from('favorites')
      .upsert(testFavorites, { onConflict: 'user_id,model_id' });
    
    if (error) {
      console.error('❌ 插入收藏失败:', error.message);
      return false;
    }
    
    console.log(`✅ 成功插入 ${testFavorites.length} 个收藏`);
    return true;
  } catch (err) {
    console.error('❌ 插入收藏异常:', err.message);
    return false;
  }
}

async function verifyData() {
  console.log('🔍 验证数据插入...');
  
  try {
    // 检查用户数量
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, display_name, role');
    
    if (usersError) {
      console.error('❌ 查询用户失败:', usersError.message);
      return false;
    }
    
    console.log(`👥 用户数量: ${users.length}`);
    users.forEach(user => {
      console.log(`   - ${user.username} (${user.display_name}) - ${user.role}`);
    });
    
    // 检查模型数量
    const { data: models, error: modelsError } = await supabase
      .from('face_models')
      .select('id, title, author_id, category, is_verified');
    
    if (modelsError) {
      console.error('❌ 查询模型失败:', modelsError.message);
      return false;
    }
    
    console.log(`🎭 模型数量: ${models.length}`);
    models.forEach(model => {
      console.log(`   - ${model.title} (${model.category}) ${model.is_verified ? '✅' : '⏳'}`);
    });
    
    // 检查评论数量
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('id, content, author_id');
    
    if (commentsError) {
      console.error('❌ 查询评论失败:', commentsError.message);
      return false;
    }
    
    console.log(`💬 评论数量: ${comments.length}`);
    
    // 检查点赞数量
    const { data: likes, error: likesError } = await supabase
      .from('likes')
      .select('user_id, model_id');
    
    if (likesError) {
      console.error('❌ 查询点赞失败:', likesError.message);
      return false;
    }
    
    console.log(`👍 点赞数量: ${likes.length}`);
    
    // 检查收藏数量
    const { data: favorites, error: favoritesError } = await supabase
      .from('favorites')
      .select('user_id, model_id');
    
    if (favoritesError) {
      console.error('❌ 查询收藏失败:', favoritesError.message);
      return false;
    }
    
    console.log(`⭐ 收藏数量: ${favorites.length}`);
    
    // 检查标签数量
    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('id, name, category, usage_count');
    
    if (tagsError) {
      console.error('❌ 查询标签失败:', tagsError.message);
      return false;
    }
    
    console.log(`🏷️  标签数量: ${tags.length}`);
    if (tags.length > 0) {
      tags.slice(0, 5).forEach(tag => {
        console.log(`   - ${tag.name} (${tag.category || 'N/A'}) - 使用 ${tag.usage_count || 0} 次`);
      });
      if (tags.length > 5) {
        console.log(`   ... 还有 ${tags.length - 5} 个标签`);
      }
    }
    
    console.log('✅ 数据验证完成！');
    return true;
  } catch (err) {
    console.error('❌ 验证数据失败:', err.message);
    return false;
  }
}

async function testQueries() {
  console.log('🔍 测试常用查询...');
  
  try {
    // 测试获取模型和作者信息
    const { data: modelsWithAuthors, error: modelsError } = await supabase
      .from('face_models')
      .select(`
        id,
        title,
        category,
        is_verified,
        users!face_models_author_id_fkey (
          username,
          display_name
        )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (modelsError) {
      console.error('❌ 查询模型失败:', modelsError.message);
      return false;
    }
    
    console.log('🔥 最新模型:');
    modelsWithAuthors.forEach(model => {
      const author = model.users || {};
      const verifiedIcon = model.is_verified ? '✅' : '⏳';
      console.log(`   - ${model.title} by ${author.display_name || author.username || '未知作者'} ${verifiedIcon}`);
      console.log(`     分类: ${model.category}`);
    });
    
    // 测试搜索功能
    const { data: searchResults, error: searchError } = await supabase
      .from('face_models')
      .select('id, title, description')
      .or('title.ilike.%表情%,description.ilike.%表情%')
      .eq('is_public', true)
      .limit(3);
    
    if (searchError) {
      console.error('❌ 搜索测试失败:', searchError.message);
      return false;
    }
    
    console.log('🔍 搜索结果 (关键词: "表情"):');
    searchResults.forEach(model => {
      console.log(`   - ${model.title}`);
    });
    
    // 测试评论查询
    const { data: commentsWithUsers, error: commentsError } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        users!comments_author_id_fkey (
          username,
          display_name
        ),
        face_models!comments_model_id_fkey (
          title
        )
      `)
      .limit(3);
    
    if (commentsError) {
      console.error('❌ 查询评论失败:', commentsError.message);
      return false;
    }
    
    console.log('💬 最新评论:');
    commentsWithUsers.forEach(comment => {
      const author = comment.users || {};
      const model = comment.face_models || {};
      console.log(`   - ${author.display_name || author.username || '匿名'} 在 "${model.title || '未知模型'}" 中说:`);
      console.log(`     "${comment.content}"`);
    });
    
    // 测试点赞统计
    const { data: likeStats, error: likeStatsError } = await supabase
      .from('likes')
      .select(`
        model_id,
        face_models!likes_model_id_fkey (
          title
        )
      `);
    
    if (likeStatsError) {
      console.error('❌ 查询点赞统计失败:', likeStatsError.message);
    } else {
      console.log('👍 点赞统计:');
      const likeCount = {};
      likeStats.forEach(like => {
        const modelTitle = like.face_models?.title || '未知模型';
        likeCount[modelTitle] = (likeCount[modelTitle] || 0) + 1;
      });
      Object.entries(likeCount).forEach(([title, count]) => {
        console.log(`   - ${title}: ${count} 个点赞`);
      });
    }
    
    console.log('✅ 查询测试完成！');
    return true;
  } catch (err) {
    console.error('❌ 查询测试失败:', err.message);
    return false;
  }
}

async function main() {
  console.log('🚀 开始 Supabase 连接和数据测试...\n');
  
  // 测试连接
  const connectionOk = await testConnection();
  if (!connectionOk) {
    process.exit(1);
  }
  
  console.log('');
  
  // 插入测试数据
  console.log('📝 插入测试数据...');
  const usersOk = await insertTestUsers();
  const modelsOk = await insertTestModels();
  const commentsOk = await insertTestComments();
  const likesOk = await insertTestLikes();
  const favoritesOk = await insertTestFavorites();
  
  console.log('');
  
  // 验证数据
  const verifyOk = await verifyData();
  if (!verifyOk) {
    process.exit(1);
  }
  
  console.log('');
  
  // 测试查询
  const queryOk = await testQueries();
  if (!queryOk) {
    process.exit(1);
  }
  
  console.log('\n🎉 所有测试完成！Supabase 连接和数据都正常工作。');
  console.log('\n📊 测试总结:');
  console.log(`   ✅ 连接测试: ${connectionOk ? '成功' : '失败'}`);
  console.log(`   ✅ 用户插入: ${usersOk ? '成功' : '失败'}`);
  console.log(`   ✅ 模型插入: ${modelsOk ? '成功' : '失败'}`);
  console.log(`   ✅ 评论插入: ${commentsOk ? '成功' : '失败'}`);
  console.log(`   ✅ 点赞插入: ${likesOk ? '成功' : '失败'}`);
  console.log(`   ✅ 收藏插入: ${favoritesOk ? '成功' : '失败'}`);
  console.log(`   ✅ 数据验证: ${verifyOk ? '成功' : '失败'}`);
  console.log(`   ✅ 查询测试: ${queryOk ? '成功' : '失败'}`);
  
  console.log('\n🎯 下一步建议:');
  console.log('   1. 开始开发前端界面');
  console.log('   2. 实现用户认证系统');
  console.log('   3. 创建模型上传和管理功能');
  console.log('   4. 添加搜索和筛选功能');
}

// 运行测试
main().catch(err => {
  console.error('💥 测试过程中发生错误:', err);
  process.exit(1);
});