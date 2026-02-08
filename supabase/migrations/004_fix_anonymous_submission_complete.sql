/* ============================================
   MultiForms Complete Fix for Anonymous Submission

   完整修复匿名用户提交表单

   这个迁移会：
   1. 删除所有可能有冲突的策略
   2. 重新创建正确的 SECURITY DEFINER 函数
   3. 创建新的 RLS 策略

   执行此迁移后，匿名用户可以：
   - 查看已发布的公开表单
   - 查看表单题目
   - 提交表单答案
============================================ */

-- ==================================================
-- 1. 清理旧策略（确保删除所有版本）
-- ==================================================

DROP POLICY IF EXISTS "Anyone can submit to published forms" ON public.form_submissions;
DROP POLICY IF EXISTS "Form owners can view submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Admins can view all submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Users can view own submissions" ON public.form_submissions;

DROP POLICY IF EXISTS "Published forms are public" ON public.forms;
DROP POLICY IF EXISTS "Users can view own forms" ON public.forms;
DROP POLICY IF EXISTS "Admins can view all forms" ON public.forms;

DROP POLICY IF EXISTS "Questions of published forms are viewable" ON public.form_questions;
DROP POLICY IF EXISTS "Users can manage questions of own forms" ON public.form_questions;

-- ==================================================
-- 2. 重新创建 SECURITY DEFINER 函数
-- ==================================================

-- 删除旧函数
DROP FUNCTION IF EXISTS public.can_insert_submission(UUID);
DROP FUNCTION IF EXISTS public.can_view_questions(UUID);
DROP FUNCTION IF EXISTS public.is_form_accessible(UUID);

-- 函数：检查是否可以向表单提交（任何人都可以向已发布的表单提交）
CREATE OR REPLACE FUNCTION public.can_insert_submission(form_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    form_status TEXT;
    form_expires_at TIMESTAMP WITH TIME ZONE;
    form_max_responses INTEGER;
    current_responses INTEGER;
BEGIN
    -- 直接查询表单状态（绕过 RLS）
    SELECT status, expires_at, max_responses
    INTO form_status, form_expires_at, form_max_responses
    FROM public.forms
    WHERE id = form_uuid;

    -- 检查表单是否已发布
    IF form_status != 'published' THEN
        RETURN FALSE;
    END IF;

    -- 检查是否过期
    IF form_expires_at IS NOT NULL AND form_expires_at < NOW() THEN
        RETURN FALSE;
    END IF;

    -- 检查是否达到最大响应数
    IF form_max_responses IS NOT NULL THEN
        SELECT COUNT(*) INTO current_responses
        FROM public.form_submissions
        WHERE form_id = form_uuid;

        IF current_responses >= form_max_responses THEN
            RETURN FALSE;
        END IF;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 函数：检查是否可以查看表单（已发布的公开表单）
CREATE OR REPLACE FUNCTION public.can_view_form(form_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    form_status TEXT;
    form_access_type TEXT;
BEGIN
    SELECT status, access_type
    INTO form_status, form_access_type
    FROM public.forms
    WHERE id = form_uuid;

    RETURN (form_status = 'published' AND form_access_type = 'public');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 函数：检查是否可以查看题目（已发布的公开表单的题目）
CREATE OR REPLACE FUNCTION public.can_view_questions(form_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    form_status TEXT;
    form_access_type TEXT;
BEGIN
    SELECT status, access_type
    INTO form_status, form_access_type
    FROM public.forms
    WHERE id = form_uuid;

    RETURN (form_status = 'published' AND form_access_type = 'public');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==================================================
-- 3. 创建 RLS 策略
-- ==================================================

-- ==================================================
-- form_submissions 表策略
-- ==================================================

-- 策略：任何人都可以向已发布的表单提交（包括匿名用户）
CREATE POLICY "Anyone can submit to published forms"
    ON public.form_submissions FOR INSERT
    WITH CHECK (public.can_insert_submission(form_id));

-- 策略：表单所有者可以查看提交
CREATE POLICY "Form owners can view submissions"
    ON public.form_submissions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.forms
            WHERE forms.id = form_submissions.form_id
            AND forms.user_id = auth.uid()
        )
    );

-- 策略：管理员可以查看所有提交
CREATE POLICY "Admins can view all submissions"
    ON public.form_submissions FOR SELECT
    USING (public.is_admin());

-- 策略：用户可以查看自己的提交
CREATE POLICY "Users can view own submissions"
    ON public.form_submissions FOR SELECT
    USING (auth.uid() = user_id);

-- ==================================================
-- forms 表策略
-- ==================================================

-- 策略：已发布的公开表单可被所有人查看（包括匿名用户）
CREATE POLICY "Published forms are public"
    ON public.forms FOR SELECT
    USING (public.can_view_form(id));

-- 策略：用户可以查看自己的表单
CREATE POLICY "Users can view own forms"
    ON public.forms FOR SELECT
    USING (auth.uid() = user_id);

-- 策略：管理员可以查看所有表单
CREATE POLICY "Admins can view all forms"
    ON public.forms FOR SELECT
    USING (public.is_admin());

-- ==================================================
-- form_questions 表策略
-- ==================================================

-- 策略：已发布的公开表单的题目可被查看（包括匿名用户）
CREATE POLICY "Questions of published forms are viewable"
    ON public.form_questions FOR SELECT
    USING (public.can_view_questions(form_id));

-- 策略：用户可以管理自己表单的题目
CREATE POLICY "Users can manage questions of own forms"
    ON public.form_questions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.forms
            WHERE forms.id = form_questions.form_id
            AND forms.user_id = auth.uid()
        )
    );

-- ==================================================
-- 验证
-- ==================================================

-- 验证函数已创建
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'can_insert_submission') THEN
        RAISE NOTICE '✓ Function can_insert_submission created';
    ELSE
        RAISE NOTICE '✗ Function can_insert_submission NOT found';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'can_view_form') THEN
        RAISE NOTICE '✓ Function can_view_form created';
    ELSE
        RAISE NOTICE '✗ Function can_view_form NOT found';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'can_view_questions') THEN
        RAISE NOTICE '✓ Function can_view_questions created';
    ELSE
        RAISE NOTICE '✗ Function can_view_questions NOT found';
    END IF;
END $$;

-- 验证策略已创建
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'form_submissions'
    AND policyname = 'Anyone can submit to published forms';

    IF policy_count > 0 THEN
        RAISE NOTICE '✓ Policy "Anyone can submit to published forms" created';
    ELSE
        RAISE NOTICE '✗ Policy "Anyone can submit to published forms" NOT found';
    END IF;
END $$;
