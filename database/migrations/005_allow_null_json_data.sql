-- 允许 face_models 表的 json_data 字段为 null
-- 创建时间: 2025-01-14
-- 描述: 修改 json_data 字段约束，允许用户发布没有捏脸数据的帖子

-- 修改 json_data 字段，允许 NULL 值
ALTER TABLE face_models 
ALTER COLUMN json_data DROP NOT NULL;

-- 添加注释说明字段用途
COMMENT ON COLUMN face_models.json_data IS '捏脸数据JSON格式，可选字段，允许为空';