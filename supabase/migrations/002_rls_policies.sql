/* ============================================
   MultiForms RLS Policies Migration
   行级安全策略

   基于 docs/requirements/02-技术需求文档-TRD.md
   安全设计章节的完整 RLS 策略定义

   注意：此迁移文件会替换 001_initial_schema.sql 中的策略
   使用 DROP IF EXISTS 确保幂等性
   ============================================ */

/* ============================================
   HELPER FUNCTIONS (辅助函数)
   ============================================ */

-- 检查用户是否为管理员
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
        AND profiles.status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 检查用户是否为资源所有者或管理员
CREATE OR REPLACE FUNCTION public.is_owner_or_admin(resource_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.uid() = resource_user_id OR public.is_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 检查用户是否为认证用户
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/* ============================================
   1. PROFILES TABLE RLS POLICIES
   ============================================ */

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Guests can view profiles" ON public.profiles;

-- 新策略

-- 用户可以查看自己的资料
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- 管理员可以查看所有用户资料
CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (public.is_admin());

-- 用户可以更新自己的资料
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 管理员可以更新任何用户资料
CREATE POLICY "Admins can update any profile"
    ON public.profiles FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

/* ============================================
   2. FORMS TABLE RLS POLICIES
   ============================================ */

-- 删除旧策略
DROP POLICY IF EXISTS "Users can view own forms" ON public.forms;
DROP POLICY IF EXISTS "Admins can view all forms" ON public.forms;
DROP POLICY IF EXISTS "Users can create own forms" ON public.forms;
DROP POLICY IF EXISTS "Users can update own forms" ON public.forms;
DROP POLICY IF EXISTS "Admins can update any form" ON public.forms;
DROP POLICY IF EXISTS "Users can delete own forms" ON public.forms;
DROP POLICY IF EXISTS "Admins can delete any form" ON public.forms;
DROP POLICY IF EXISTS "Public forms are viewable by everyone" ON public.forms;
DROP POLICY IF EXISTS "Guests can create limited forms" ON public.forms;

-- 新策略

-- 用户可以查看自己的表单
CREATE POLICY "Users can view own forms"
    ON public.forms FOR SELECT
    USING (auth.uid() = user_id);

-- 管理员可以查看所有表单
CREATE POLICY "Admins can view all forms"
    ON public.forms FOR SELECT
    USING (public.is_admin());

-- 认证用户可以创建表单
CREATE POLICY "Authenticated users can create forms"
    ON public.forms FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的表单
CREATE POLICY "Users can update own forms"
    ON public.forms FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 管理员可以更新任何表单
CREATE POLICY "Admins can update any form"
    ON public.forms FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 用户可以删除自己的表单
CREATE POLICY "Users can delete own forms"
    ON public.forms FOR DELETE
    USING (auth.uid() = user_id);

-- 管理员可以删除任何表单
CREATE POLICY "Admins can delete any form"
    ON public.forms FOR DELETE
    USING (public.is_admin());

-- 公开表单可被所有人查看
CREATE POLICY "Published forms are public"
    ON public.forms FOR SELECT
    USING (status = 'published' AND access_type = 'public');

/* ============================================
   3. FORM_QUESTIONS TABLE RLS POLICIES
   ============================================ */

-- 删除旧策略
DROP POLICY IF EXISTS "Users can manage questions of own forms" ON public.form_questions;
DROP POLICY IF EXISTS "Questions of published forms are viewable" ON public.form_questions;

-- 新策略

-- 用户可以管理自己表单的题目
CREATE POLICY "Users can manage questions of own forms"
    ON public.form_questions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.forms
            WHERE forms.id = form_questions.form_id
            AND forms.user_id = auth.uid()
        )
    );

-- 公开表单的题目可被查看
CREATE POLICY "Questions of published forms are viewable"
    ON public.form_questions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.forms
            WHERE forms.id = form_questions.form_id
            AND forms.status = 'published'
            AND forms.access_type = 'public'
        )
    );

/* ============================================
   4. FORM_SUBMISSIONS TABLE RLS POLICIES
   ============================================ */

-- 删除旧策略
DROP POLICY IF EXISTS "Form owners can view submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Anyone can submit to published forms" ON public.form_submissions;
DROP POLICY IF EXISTS "Users can view own submissions" ON public.form_submissions;

-- 新策略

-- 表单所有者可以查看提交
CREATE POLICY "Form owners can view submissions"
    ON public.form_submissions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.forms
            WHERE forms.id = form_submissions.form_id
            AND forms.user_id = auth.uid()
        )
    );

-- 管理员可以查看所有提交
CREATE POLICY "Admins can view all submissions"
    ON public.form_submissions FOR SELECT
    USING (public.is_admin());

-- 任何人都可以向已发布的表单提交
CREATE POLICY "Anyone can submit to published forms"
    ON public.form_submissions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.forms
            WHERE forms.id = form_submissions.form_id
            AND forms.status = 'published'
        )
    );

-- 用户可以查看自己的提交记录
CREATE POLICY "Users can view own submissions"
    ON public.form_submissions FOR SELECT
    USING (auth.uid() = user_id);

/* ============================================
   5. UPLOADED_FILES TABLE RLS POLICIES
   ============================================ */

-- 删除旧策略
DROP POLICY IF EXISTS "Form owners can view uploaded files" ON public.uploaded_files;

-- 新策略

-- 表单所有者可以查看上传文件
CREATE POLICY "Form owners can view uploaded files"
    ON public.uploaded_files FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.form_submissions
            JOIN public.forms ON forms.id = form_submissions.form_id
            WHERE form_submissions.id = uploaded_files.submission_id
            AND forms.user_id = auth.uid()
        )
    );

-- 管理员可以查看所有上传文件
CREATE POLICY "Admins can view all uploaded files"
    ON public.uploaded_files FOR SELECT
    USING (public.is_admin());

/* ============================================
   6. GUEST_FORMS TABLE RLS POLICIES
   ============================================ */

-- 删除旧策略
DROP POLICY IF EXISTS "Guests with token can manage their forms" ON public.guest_forms;

-- 新策略

-- 拥有访问令牌的访客可以管理其表单
CREATE POLICY "Guests with valid access token can manage"
    ON public.guest_forms FOR ALL
    USING (true);  -- 通过 API 层验证 access_token

/* ============================================
   7. NOTIFICATIONS TABLE RLS POLICIES
   ============================================ */

-- 删除旧策略
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

-- 新策略

-- 用户只能查看自己的通知
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

-- 用户只能更新自己的通知
CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

/* ============================================
   8. ADMIN_LOGS TABLE RLS POLICIES
   ============================================ */

-- 删除旧策略
DROP POLICY IF EXISTS "Only admins can view logs" ON public.admin_logs;
DROP POLICY IF EXISTS "Only admins can insert logs" ON public.admin_logs;

-- 新策略

-- 只有管理员可以查看日志
CREATE POLICY "Only admins can view logs"
    ON public.admin_logs FOR SELECT
    USING (public.is_admin());

-- 只有管理员可以插入日志（通过 Edge Function）
CREATE POLICY "Only admins can insert logs"
    ON public.admin_logs FOR INSERT
    WITH CHECK (public.is_admin());

/* ============================================
   9. CONTENT_REVIEWS TABLE RLS POLICIES
   ============================================ */

-- 删除旧策略
DROP POLICY IF EXISTS "Admins can view all reviews" ON public.content_reviews;
DROP POLICY IF EXISTS "Admins can update reviews" ON public.content_reviews;
DROP POLICY IF EXISTS "Anyone can create report" ON public.content_reviews;

-- 新策略

-- 管理员可以查看所有审核记录
CREATE POLICY "Admins can view all reviews"
    ON public.content_reviews FOR SELECT
    USING (public.is_admin());

-- 管理员可以更新审核记录
CREATE POLICY "Admins can update reviews"
    ON public.content_reviews FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 任何人都可以创建举报
CREATE POLICY "Anyone can create report"
    ON public.content_reviews FOR INSERT
    WITH CHECK (true);  -- 任何人都可以举报

-- 举报者可以查看自己的举报
CREATE POLICY "Reporters can view own reports"
    ON public.content_reviews FOR SELECT
    USING (auth.uid() = reporter_id);

/* ============================================
   10. TEMPLATES TABLE RLS POLICIES
   ============================================ */

-- 删除旧策略
DROP POLICY IF EXISTS "Active templates are viewable by everyone" ON public.templates;
DROP POLICY IF EXISTS "Admins can view all templates" ON public.templates;
DROP POLICY IF EXISTS "Admins can manage templates" ON public.templates;

-- 新策略

-- 激活的模板可被所有人查看
CREATE POLICY "Active templates are viewable by everyone"
    ON public.templates FOR SELECT
    USING (is_active = true);

-- 管理员可以查看所有模板（包括未激活的）
CREATE POLICY "Admins can view all templates"
    ON public.templates FOR SELECT
    USING (public.is_admin());

-- 管理员可以管理模板
CREATE POLICY "Admins can manage templates"
    ON public.templates FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

/* ============================================
   11. SYSTEM_SETTINGS TABLE RLS POLICIES
   ============================================ */

-- 删除旧策略
DROP POLICY IF EXISTS "Public settings are viewable by everyone" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can view all settings" ON public.system_settings;
DROP POLICY IF EXISTS "Only admins can insert settings" ON public.system_settings;
DROP POLICY IF EXISTS "Only admins can update settings" ON public.system_settings;

-- 新策略

-- 公开配置可被所有人查看（以 'public.' 开头的 key）
CREATE POLICY "Public settings are viewable by everyone"
    ON public.system_settings FOR SELECT
    USING (key LIKE 'public.%');

-- 管理员可以查看所有配置
CREATE POLICY "Admins can view all settings"
    ON public.system_settings FOR SELECT
    USING (public.is_admin());

-- 只有管理员可以插入配置
CREATE POLICY "Only admins can insert settings"
    ON public.system_settings FOR INSERT
    WITH CHECK (public.is_admin());

-- 只有管理员可以更新配置
CREATE POLICY "Only admins can update settings"
    ON public.system_settings FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

/* ============================================
   SECURITY DEFINER FUNCTIONS (安全函数)
   用于需要提升权限的操作
   ============================================ */

-- 获取用户角色（用于应用层权限检查）
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role AS $$
DECLARE
    user_role user_role;
BEGIN
    SELECT role INTO user_role
    FROM public.profiles
    WHERE id = user_id;
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 检查表单是否可访问（用于公开表单访问）
CREATE OR REPLACE FUNCTION public.is_form_accessible(form_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.forms
        WHERE forms.id = form_uuid
        AND forms.status = 'published'
        AND (
            forms.access_type = 'public'
            OR (forms.access_type = 'password' AND forms.access_password IS NOT NULL)
        )
        AND (forms.expires_at IS NULL OR forms.expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 检查用户是否可以提交表单
CREATE OR REPLACE FUNCTION public.can_submit_form(form_uuid UUID, user_uuid UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    form_record RECORD;
    submission_count INTEGER;
BEGIN
    -- 获取表单信息
    SELECT * INTO form_record
    FROM public.forms
    WHERE forms.id = form_uuid
    AND forms.status = 'published';

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- 检查是否过期
    IF form_record.expires_at IS NOT NULL AND form_record.expires_at <= NOW() THEN
        RETURN FALSE;
    END IF;

    -- 检查是否达到最大提交数
    IF form_record.max_responses IS NOT NULL THEN
        SELECT COUNT(*) INTO submission_count
        FROM public.form_submissions
        WHERE form_id = form_uuid;

        IF submission_count >= form_record.max_responses THEN
            RETURN FALSE;
        END IF;
    END IF;

    -- 检查用户是否达到每用户提交限制
    IF user_uuid IS NOT NULL AND form_record.max_per_user > 0 THEN
        SELECT COUNT(*) INTO submission_count
        FROM public.form_submissions
        WHERE form_id = form_uuid
        AND user_id = user_uuid;

        IF submission_count >= form_record.max_per_user THEN
            RETURN FALSE;
        END IF;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/* ============================================
   END OF RLS POLICIES MIGRATION
   ============================================ */

-- 验证所有表都已启用 RLS
DO $$
DECLARE
    table_name TEXT;
    rls_enabled BOOLEAN;
BEGIN
    FOR table_name IN
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
        AND tablename IN ('profiles', 'forms', 'form_questions', 'form_submissions',
                         'uploaded_files', 'guest_forms', 'notifications',
                         'admin_logs', 'content_reviews', 'templates', 'system_settings')
    LOOP
        SELECT relrowsecurity INTO rls_enabled
        FROM pg_class WHERE relname = table_name AND relnamespace = 'public'::regnamespace;

        IF NOT rls_enabled THEN
            RAISE NOTICE 'Enabling RLS for table: %', table_name;
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
        END IF;
    END LOOP;
END $$;
