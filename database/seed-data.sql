-- VRCFace 测试数据插入脚本
-- 注意：执行前请确保已经运行了 001_initial_schema.sql

-- 插入测试用户
INSERT INTO users (id, username, email, display_name, avatar_url, bio, role, is_verified, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'alice_creator', 'alice@example.com', 'Alice Chen', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150', '专业的 VRChat 面部表情设计师，擅长可爱风格', 'creator', true, NOW() - INTERVAL '30 days'),
('550e8400-e29b-41d4-a716-446655440002', 'bob_artist', 'bob@example.com', 'Bob Wilson', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', '3D 艺术家，专注于写实风格面部表情', 'creator', true, NOW() - INTERVAL '25 days'),
('550e8400-e29b-41d4-a716-446655440003', 'charlie_user', 'charlie@example.com', 'Charlie Kim', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'VRChat 爱好者，喜欢收集各种表情', 'user', false, NOW() - INTERVAL '20 days'),
('550e8400-e29b-41d4-a716-446655440004', 'diana_mod', 'diana@example.com', 'Diana Rodriguez', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', '社区管理员', 'moderator', true, NOW() - INTERVAL '15 days'),
('550e8400-e29b-41d4-a716-446655440005', 'eve_newbie', 'eve@example.com', 'Eve Johnson', 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150', '新手用户，刚开始接触 VRChat', 'user', false, NOW() - INTERVAL '5 days');

-- 插入测试面部模型
INSERT INTO face_models (id, title, description, author_id, category, json_data, thumbnail_url, preview_images, is_public, is_verified, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', '可爱猫咪表情包', '一套包含12种不同猫咪表情的面部动画，适合可爱风格的角色', '550e8400-e29b-41d4-a716-446655440001', 'cute', '{"expressions": [{"name": "happy", "blendshapes": {"mouthSmile": 0.8, "eyeSquint": 0.3}}, {"name": "sad", "blendshapes": {"mouthFrown": 0.7, "eyeWide": 0.2}}], "version": "1.0"}', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300', '["https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600", "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600"]', true, true, NOW() - INTERVAL '28 days'),
('660e8400-e29b-41d4-a716-446655440002', '写实人类表情', '高质量的写实人类面部表情，包含细腻的微表情变化', '550e8400-e29b-41d4-a716-446655440002', 'realistic', '{"expressions": [{"name": "neutral", "blendshapes": {}}, {"name": "smile", "blendshapes": {"mouthSmile": 0.6, "cheekPuff": 0.2}}], "version": "2.1"}', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300', '["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600"]', true, true, NOW() - INTERVAL '22 days'),
('660e8400-e29b-41d4-a716-446655440003', '动漫风格表情', '日式动漫风格的夸张表情包，适合二次元角色', '550e8400-e29b-41d4-a716-446655440001', 'anime', '{"expressions": [{"name": "excited", "blendshapes": {"eyeWide": 0.9, "mouthOpen": 0.7}}, {"name": "embarrassed", "blendshapes": {"eyeSquint": 0.8, "mouthSmile": 0.3}}], "version": "1.5"}', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300', '["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600", "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600"]', true, false, NOW() - INTERVAL '18 days'),
('660e8400-e29b-41d4-a716-446655440004', '机器人表情模块', '科幻风格的机器人面部表情，带有LED效果', '550e8400-e29b-41d4-a716-446655440002', 'fantasy', '{"expressions": [{"name": "boot", "blendshapes": {"eyeGlow": 1.0}}, {"name": "error", "blendshapes": {"eyeGlow": 0.0, "mouthOpen": 0.1}}], "version": "1.0", "effects": ["led", "glow"]}', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300', '["https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600"]', true, true, NOW() - INTERVAL '12 days'),
('660e8400-e29b-41d4-a716-446655440005', '恐怖表情包', '万圣节主题的恐怖表情，适合恐怖游戏', '550e8400-e29b-41d4-a716-446655440001', 'horror', '{"expressions": [{"name": "scary", "blendshapes": {"eyeWide": 1.0, "mouthOpen": 0.8}}, {"name": "evil_smile", "blendshapes": {"mouthSmile": 0.9, "eyeSquint": 0.7}}], "version": "1.2"}', 'https://images.unsplash.com/photo-1509909756405-be0199881695?w=300', '["https://images.unsplash.com/photo-1509909756405-be0199881695?w=600"]', true, false, NOW() - INTERVAL '8 days');

-- 插入模型元数据
INSERT INTO model_metadata (model_id, version, file_size, compatibility, requirements, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', '1.0', 2048576, '["VRChat SDK 3.0+", "Unity 2019.4+"]', '{"unity_version": "2019.4.31f1", "vrchat_sdk": "3.0.0"}', NOW() - INTERVAL '28 days'),
('660e8400-e29b-41d4-a716-446655440002', '2.1', 4194304, '["VRChat SDK 3.0+", "Unity 2020.3+"]', '{"unity_version": "2020.3.48f1", "vrchat_sdk": "3.1.0"}', NOW() - INTERVAL '22 days'),
('660e8400-e29b-41d4-a716-446655440003', '1.5', 1572864, '["VRChat SDK 3.0+", "Unity 2019.4+"]', '{"unity_version": "2019.4.31f1", "vrchat_sdk": "3.0.0"}', NOW() - INTERVAL '18 days'),
('660e8400-e29b-41d4-a716-446655440004', '1.0', 3145728, '["VRChat SDK 3.0+", "Unity 2021.3+"]', '{"unity_version": "2021.3.23f1", "vrchat_sdk": "3.2.0"}', NOW() - INTERVAL '12 days'),
('660e8400-e29b-41d4-a716-446655440005', '1.2', 2621440, '["VRChat SDK 3.0+", "Unity 2020.3+"]', '{"unity_version": "2020.3.48f1", "vrchat_sdk": "3.1.0"}', NOW() - INTERVAL '8 days');

-- 插入模型标签关联
INSERT INTO model_tags (model_id, tag_id) VALUES
-- 可爱猫咪表情包
('660e8400-e29b-41d4-a716-446655440001', (SELECT id FROM tags WHERE name = 'cute')),
('660e8400-e29b-41d4-a716-446655440001', (SELECT id FROM tags WHERE name = 'animal')),
('660e8400-e29b-41d4-a716-446655440001', (SELECT id FROM tags WHERE name = 'beginner-friendly')),
-- 写实人类表情
('660e8400-e29b-41d4-a716-446655440002', (SELECT id FROM tags WHERE name = 'realistic')),
('660e8400-e29b-41d4-a716-446655440002', (SELECT id FROM tags WHERE name = 'human')),
('660e8400-e29b-41d4-a716-446655440002', (SELECT id FROM tags WHERE name = 'high-quality')),
-- 动漫风格表情
('660e8400-e29b-41d4-a716-446655440003', (SELECT id FROM tags WHERE name = 'anime')),
('660e8400-e29b-41d4-a716-446655440003', (SELECT id FROM tags WHERE name = 'expressive')),
-- 机器人表情模块
('660e8400-e29b-41d4-a716-446655440004', (SELECT id FROM tags WHERE name = 'sci-fi')),
('660e8400-e29b-41d4-a716-446655440004', (SELECT id FROM tags WHERE name = 'robot')),
('660e8400-e29b-41d4-a716-446655440004', (SELECT id FROM tags WHERE name = 'effects')),
-- 恐怖表情包
('660e8400-e29b-41d4-a716-446655440005', (SELECT id FROM tags WHERE name = 'horror')),
('660e8400-e29b-41d4-a716-446655440005', (SELECT id FROM tags WHERE name = 'halloween'));

-- 插入测试评论
INSERT INTO comments (id, model_id, author_id, content, created_at) VALUES
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '这个表情包太可爱了！我的猫咪角色用起来效果很棒！', NOW() - INTERVAL '25 days'),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', '新手友好，安装很简单，推荐！', NOW() - INTERVAL '20 days'),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '写实度很高，细节处理得很好', NOW() - INTERVAL '18 days'),
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', '动漫风格很棒，但是需要调整一下兼容性', NOW() - INTERVAL '15 days'),
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'LED效果太酷了！科幻感十足', NOW() - INTERVAL '10 days');

-- 插入回复评论
INSERT INTO comments (id, model_id, author_id, content, parent_id, created_at) VALUES
('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '谢谢你的支持！我会继续制作更多可爱的表情包', '770e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '24 days'),
('770e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '兼容性问题已经在新版本中修复了，请更新到1.5版本', '770e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '14 days');

-- 插入点赞数据
INSERT INTO likes (user_id, target_type, target_id, created_at) VALUES
-- 模型点赞
('550e8400-e29b-41d4-a716-446655440003', 'model', '660e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '25 days'),
('550e8400-e29b-41d4-a716-446655440005', 'model', '660e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '20 days'),
('550e8400-e29b-41d4-a716-446655440004', 'model', '660e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '15 days'),
('550e8400-e29b-41d4-a716-446655440003', 'model', '660e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '18 days'),
('550e8400-e29b-41d4-a716-446655440005', 'model', '660e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '12 days'),
('550e8400-e29b-41d4-a716-446655440003', 'model', '660e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '10 days'),
('550e8400-e29b-41d4-a716-446655440005', 'model', '660e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '8 days'),
-- 评论点赞
('550e8400-e29b-41d4-a716-446655440001', 'comment', '770e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '24 days'),
('550e8400-e29b-41d4-a716-446655440004', 'comment', '770e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '22 days'),
('550e8400-e29b-41d4-a716-446655440002', 'comment', '770e8400-e29b-41d4-a716-446655440005', NOW() - INTERVAL '9 days');

-- 插入收藏数据
INSERT INTO favorites (user_id, model_id, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '25 days'),
('550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '20 days'),
('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '18 days'),
('550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '8 days');

-- 插入关注数据
INSERT INTO follows (follower_id, following_id, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '25 days'),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '20 days'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '18 days'),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '15 days'),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '12 days');

-- 插入通知数据
INSERT INTO notifications (id, user_id, type, title, message, data, created_at) VALUES
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'like', '新的点赞', 'Charlie Kim 点赞了你的模型 "可爱猫咪表情包"', '{"model_id": "660e8400-e29b-41d4-a716-446655440001", "user_id": "550e8400-e29b-41d4-a716-446655440003"}', NOW() - INTERVAL '25 days'),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'comment', '新的评论', 'Charlie Kim 评论了你的模型 "可爱猫咪表情包"', '{"model_id": "660e8400-e29b-41d4-a716-446655440001", "comment_id": "770e8400-e29b-41d4-a716-446655440001"}', NOW() - INTERVAL '25 days'),
('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'follow', '新的关注者', 'Charlie Kim 开始关注你', '{"user_id": "550e8400-e29b-41d4-a716-446655440003"}', NOW() - INTERVAL '25 days'),
('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'like', '新的点赞', 'Charlie Kim 点赞了你的模型 "写实人类表情"', '{"model_id": "660e8400-e29b-41d4-a716-446655440002", "user_id": "550e8400-e29b-41d4-a716-446655440003"}', NOW() - INTERVAL '18 days');

-- 手动更新统计数据（触发器会自动处理，但为了确保数据一致性）
-- 更新模型统计
UPDATE model_stats SET 
  views = FLOOR(RANDOM() * 1000) + 100,
  downloads = FLOOR(RANDOM() * 500) + 50,
  likes = (SELECT COUNT(*) FROM likes WHERE target_type = 'model' AND target_id = model_id),
  comments = (SELECT COUNT(*) FROM comments WHERE model_id = model_stats.model_id AND parent_id IS NULL),
  favorites = (SELECT COUNT(*) FROM favorites WHERE model_id = model_stats.model_id)
WHERE model_id IN (
  '660e8400-e29b-41d4-a716-446655440001',
  '660e8400-e29b-41d4-a716-446655440002',
  '660e8400-e29b-41d4-a716-446655440003',
  '660e8400-e29b-41d4-a716-446655440004',
  '660e8400-e29b-41d4-a716-446655440005'
);

-- 更新用户统计
UPDATE user_stats SET
  models_count = (SELECT COUNT(*) FROM face_models WHERE author_id = user_stats.user_id),
  total_likes = (SELECT COUNT(*) FROM likes l JOIN face_models fm ON l.target_id = fm.id WHERE l.target_type = 'model' AND fm.author_id = user_stats.user_id),
  total_comments = (SELECT COUNT(*) FROM comments c JOIN face_models fm ON c.model_id = fm.id WHERE fm.author_id = user_stats.user_id),
  followers_count = (SELECT COUNT(*) FROM follows WHERE following_id = user_stats.user_id),
  following_count = (SELECT COUNT(*) FROM follows WHERE follower_id = user_stats.user_id)
WHERE user_id IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440005'
);

-- 更新标签使用次数
UPDATE tags SET usage_count = (
  SELECT COUNT(*) FROM model_tags WHERE tag_id = tags.id
);

COMMIT;