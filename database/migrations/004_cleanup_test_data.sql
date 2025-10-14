-- 清理测试数据和无用标签的迁移脚本
-- 创建时间: 2024-01-01
-- 描述: 删除所有测试数据，只保留必要的标签结构

-- 首先添加tag_type字段（如果不存在）
ALTER TABLE tags ADD COLUMN IF NOT EXISTS tag_type VARCHAR(20) DEFAULT 'model_style' 
CHECK (tag_type IN ('model_name', 'model_style'));

-- 删除所有现有标签数据
DELETE FROM model_tags;
DELETE FROM tags;

-- 重置标签表的序列（如果使用的话）
-- 注意：由于使用UUID，这里不需要重置序列

-- 插入基础的模型名字标签（保留一些常用的）
INSERT INTO tags (name, description, category, color, tag_type) VALUES
('初音未来', '初音未来角色模型', 'character', '#39C5BB', 'model_name'),
('原神', '原神游戏角色', 'character', '#FFD700', 'model_name'),
('VTuber', 'VTuber虚拟主播', 'character', '#FF69B4', 'model_name');

-- 插入基础的模型风格标签（保留一些常用的）
INSERT INTO tags (name, description, category, color, tag_type) VALUES
('可爱', '可爱风格的表情', 'emotion', '#FF69B4', 'model_style'),
('酷炫', '酷炫风格的表情', 'emotion', '#1E90FF', 'model_style'),
('温柔', '温柔风格的表情', 'emotion', '#98FB98', 'model_style'),
('写实', '写实风格的表情', 'style', '#2F4F4F', 'model_style'),
('卡通', '卡通风格的表情', 'style', '#FF6347', 'model_style');