/* ============================================
   MultiForms 修复数据分析 RLS 问题

   创建 SECURITY DEFINER 函数来获取表单提交数据
   绕过 RLS 限制，允许表单所有者查看数据
============================================ */

-- 函数：检查用户是否可以查看表单提交
CREATE OR REPLACE FUNCTION public.can_view_submissions(form_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    form_owner_id UUID;
BEGIN
    -- 直接查询表单所有者（绕过 RLS）
    SELECT user_id INTO form_owner_id
    FROM public.forms
    WHERE id = form_uuid;

    -- 表单所有者或管理员可以查看
    RETURN (form_owner_id = user_uuid OR public.is_admin());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 删除旧的 SELECT 策略
DROP POLICY IF EXISTS "Form owners can view submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Admins can view all submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Users can view own submissions" ON public.form_submissions;

-- 创建新的 SELECT 策略（使用 SECURITY DEFINER 函数）
CREATE POLICY "Form owners can view submissions"
    ON public.form_submissions FOR SELECT
    USING (public.can_view_submissions(form_id, auth.uid()));

CREATE POLICY "Admins can view all submissions"
    ON public.form_submissions FOR SELECT
    USING (public.is_admin());

-- 验证策略
SELECT
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'form_submissions'
AND cmd = 'SELECT';
