-- 添加多张图片支持的数据库迁移
-- 创建时间: 2024-01-02
-- 描述: 为 face_models 表添加多张图片存储支持

-- 为 face_models 表添加 images 字段，存储图片URL数组
ALTER TABLE face_models 
ADD COLUMN images TEXT[] DEFAULT '{}';

-- 将现有的 thumbnail 数据迁移到 images 数组的第一个位置
UPDATE face_models 
SET images = ARRAY[thumbnail] 
WHERE thumbnail IS NOT NULL AND thumbnail != '';

-- 添加约束：images 数组最多包含5个元素
ALTER TABLE face_models 
ADD CONSTRAINT face_models_images_max_count 
CHECK (array_length(images, 1) <= 5);

-- 添加约束：images 数组不能为空（至少要有一张图片）
ALTER TABLE face_models 
ADD CONSTRAINT face_models_images_not_empty 
CHECK (array_length(images, 1) >= 1);

-- 创建索引以提高查询性能
CREATE INDEX idx_face_models_images ON face_models USING GIN (images);

-- 添加注释
COMMENT ON COLUMN face_models.images IS '模型图片URL数组，最多5张，第一张为封面图';
COMMENT ON COLUMN face_models.thumbnail IS '缩略图URL（保留用于向后兼容）';