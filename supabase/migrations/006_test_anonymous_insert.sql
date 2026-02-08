/* ============================================
   MultiForms 简化版 RLS 修复

   这是一个简化的测试版本，允许任何人提交
   用于调试目的
============================================ */

-- 删除现有的插入策略
DROP POLICY IF EXISTS "Anyone can submit to published forms" ON public.form_submissions;

-- 创建一个宽松的策略用于测试（允许任何人插入）
-- 注意：这只是用于测试，实际使用需要验证表单状态
CREATE POLICY "Allow anonymous insert for testing"
    ON public.form_submissions FOR INSERT
    WITH CHECK (true);

-- 验证策略已创建
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'form_submissions'
        AND policyname = 'Allow anonymous insert for testing'
    ) THEN
        RAISE NOTICE '✓ 测试策略 "Allow anonymous insert for testing" 已创建';
        RAISE NOTICE '⚠️  这只是一个测试策略，允许任何人提交表单';
    ELSE
        RAISE NOTICE '✗ 策略创建失败';
    END IF;
END $$;
