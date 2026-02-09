-- 原子增量函数
-- 解决 incrementFormViewCount 和 incrementFormResponseCount 的竞态条件问题

-- 增加表单浏览次数（原子操作）
CREATE OR REPLACE FUNCTION increment_view_count(form_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE forms
  SET view_count = view_count + 1,
      updated_at = NOW()
  WHERE id = form_id;
END;
$$ LANGUAGE plpgsql;

-- 增加表单回复次数（原子操作）
CREATE OR REPLACE FUNCTION increment_response_count(form_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE forms
  SET response_count = response_count + 1,
      updated_at = NOW()
  WHERE id = form_id;
END;
$$ LANGUAGE plpgsql;

-- 授予执行这些函数的权限（通过 RLS 策略控制）
GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_response_count(UUID) TO authenticated;
