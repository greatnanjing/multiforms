/* ============================================
   MultiForms Fix Anonymous Form Submission

   修复匿名用户提交表单的问题

   问题：原有的 "Anyone can submit to published forms" 策略
   使用 EXISTS 子查询检查 forms 表单，但 RLS 策略会递归应用，
   导致匿名用户无法提交。

   解决：使用 SECURITY DEFINER 函数来绕过 RLS 检查
============================================ */

-- 删除旧的提交策略
DROP POLICY IF EXISTS "Anyone can submit to published forms" ON public.form_submissions;

-- 创建一个 SECURITY DEFINER 函数来检查表单是否可提交
-- 这个函数会绕过 RLS 策略，直接检查表单状态
CREATE OR REPLACE FUNCTION public.can_insert_submission(form_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    form_status TEXT;
    form_is_published BOOLEAN;
BEGIN
    -- 直接查询表单状态（绕过 RLS）
    SELECT status INTO form_status
    FROM public.forms
    WHERE id = form_uuid;

    -- 检查表单是否已发布
    form_is_published := (form_status = 'published');

    RETURN form_is_published;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 创建新的提交策略，使用 SECURITY DEFINER 函数
-- 允许任何人（包括匿名用户）向已发布的表单提交
CREATE POLICY "Anyone can submit to published forms"
    ON public.form_submissions FOR INSERT
    WITH CHECK (public.can_insert_submission(form_id));

-- 同时修复表单读取策略，允许匿名用户查看已发布的公开表单
-- 删除旧策略
DROP POLICY IF EXISTS "Published forms are public" ON public.forms;

-- 创建新策略：公开的已发布表单可被所有人查看（包括匿名用户）
CREATE POLICY "Published forms are public"
    ON public.forms FOR SELECT
    USING (status = 'published' AND access_type = 'public');

-- 修复 form_questions 的读取策略，允许匿名用户查看题目
-- 删除旧策略
DROP POLICY IF EXISTS "Questions of published forms are viewable" ON public.form_questions;

-- 创建 SECURITY DEFINER 函数来检查题目是否可查看
CREATE OR REPLACE FUNCTION public.can_view_questions(form_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    form_status TEXT;
    form_access_type TEXT;
BEGIN
    -- 直接查询表单状态（绕过 RLS）
    SELECT status, access_type INTO form_status, form_access_type
    FROM public.forms
    WHERE id = form_uuid;

    -- 检查表单是否已发布且公开访问
    RETURN (form_status = 'published' AND form_access_type = 'public');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 创建新策略
CREATE POLICY "Questions of published forms are viewable"
    ON public.form_questions FOR SELECT
    USING (public.can_view_questions(form_id));
