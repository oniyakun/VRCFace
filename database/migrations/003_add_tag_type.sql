-- 添加标签类型字段的数据库迁移
-- 创建时间: 2024-01-02
-- 描述: 为tags表添加tag_type字段，区分模型名字和模型风格

-- 添加tag_type字段
ALTER TABLE tags ADD COLUMN tag_type VARCHAR(20) DEFAULT 'model_style' 
CHECK (tag_type IN ('model_name', 'model_style'));

-- 更新现有标签的类型
-- 将一些标签设置为模型名字类型（这些通常是角色名或具体模型名）
UPDATE tags SET tag_type = 'model_name' 
WHERE name IN ('动物', '科幻', '卡通', '写实');

-- 其他标签保持为模型风格类型
UPDATE tags SET tag_type = 'model_style' 
WHERE tag_type = 'model_style';

-- 添加一些示例的模型名字标签
INSERT INTO tags (name, description, category, color, tag_type) VALUES
('初音未来', '初音未来角色模型', 'character', '#39C5BB', 'model_name'),
('洛天依', '洛天依角色模型', 'character', '#66CCFF', 'model_name'),
('原神', '原神游戏角色', 'character', '#FFD700', 'model_name'),
('VTuber', 'VTuber虚拟主播', 'character', '#FF69B4', 'model_name'),
('动漫角色', '动漫角色模型', 'character', '#FF6347', 'model_name'),
('游戏角色', '游戏角色模型', 'character', '#4169E1', 'model_name');

-- 添加一些示例的模型风格标签
INSERT INTO tags (name, description, category, color, tag_type) VALUES
('清新', '清新自然风格', 'style', '#98FB98', 'model_style'),
('暗黑', '暗黑哥特风格', 'style', '#2F2F2F', 'model_style'),
('梦幻', '梦幻唯美风格', 'style', '#DDA0DD', 'model_style'),
('复古', '复古怀旧风格', 'style', '#CD853F', 'model_style'),
('未来', '未来科技风格', 'style', '#00CED1', 'model_style'),
('简约', '简约极简风格', 'style', '#F5F5DC', 'model_style');