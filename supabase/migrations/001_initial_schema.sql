/* ============================================
   MultiForms Initial Schema Migration
   基于 docs/requirements/02-技术需求文档-TRD.md
   ============================================ */

/* ============================================
   1. ENUM TYPES
   ============================================ */

-- 用户角色枚举
CREATE TYPE user_role AS ENUM ('admin', 'creator', 'guest');

-- 用户状态枚举
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'banned');

-- 管理员操作类型枚举
CREATE TYPE admin_action AS ENUM (
    'login', 'logout', 'view_user', 'update_user', 'ban_user', 'delete_user',
    'view_form', 'update_form', 'delete_form', 'ban_form',
    'approve_template', 'delete_template', 'update_settings',
    'export_data', 'view_logs'
);

-- 审核状态枚举
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');

-- 举报类型枚举
CREATE TYPE report_type AS ENUM (
    'inappropriate_content', 'spam', 'harassment',
    'false_information', 'copyright', 'other'
);

-- 模板分类枚举
CREATE TYPE template_category AS ENUM (
    'vote', 'survey', 'rating', 'feedback', 'collection'
);

/* ============================================
   2. PROFILES TABLE (用户资料表)
   ============================================ */

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    avatar_url VARCHAR(500),
    bio TEXT,

    -- 角色与权限
    role user_role DEFAULT 'creator',
    status user_status DEFAULT 'active',

    -- 使用统计
    form_count INTEGER DEFAULT 0,
    submission_count INTEGER DEFAULT 0,
    storage_used BIGINT DEFAULT 0,

    -- 偏好设置
    preferences JSONB DEFAULT '{}',
    email_verified BOOLEAN DEFAULT FALSE,

    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    banned_at TIMESTAMP WITH TIME ZONE,
    banned_reason TEXT
);

-- 索引
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_status ON public.profiles(status);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at);

-- RLS 策略
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
    ON public.profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

/* ============================================
   3. ADMIN LOGS TABLE (管理员操作日志表)
   ============================================ */

CREATE TABLE public.admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    -- 操作信息
    action admin_action NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,

    -- 操作详情
    details JSONB DEFAULT '{}',
    ip_address VARCHAR(50),
    user_agent TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_admin_logs_admin_id ON public.admin_logs(admin_id);
CREATE INDEX idx_admin_logs_action ON public.admin_logs(action);
CREATE INDEX idx_admin_logs_created_at ON public.admin_logs(created_at);

-- RLS 策略
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view logs"
    ON public.admin_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Only admins can insert logs"
    ON public.admin_logs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

/* ============================================
   4. CONTENT REVIEWS TABLE (内容审核表)
   ============================================ */

CREATE TABLE public.content_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 被举报内容
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID NOT NULL,

    -- 举报信息
    report_type report_type NOT NULL,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    report_reason TEXT,
    report_evidence JSONB DEFAULT '{}',

    -- 审核信息
    status review_status DEFAULT 'pending',
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    review_notes TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,

    -- 处理结果
    action_taken VARCHAR(50),
    resource_banned BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_content_reviews_status ON public.content_reviews(status);
CREATE INDEX idx_content_reviews_resource ON public.content_reviews(resource_type, resource_id);
CREATE INDEX idx_content_reviews_created_at ON public.content_reviews(created_at);

-- RLS 策略
ALTER TABLE public.content_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all reviews"
    ON public.content_reviews FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update reviews"
    ON public.content_reviews FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Anyone can create report"
    ON public.content_reviews FOR INSERT
    WITH CHECK (true);

/* ============================================
   5. TEMPLATES TABLE (模板库表)
   ============================================ */

CREATE TABLE public.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 基本信息
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category template_category NOT NULL,
    tags TEXT[],

    -- 模板预览
    preview_url VARCHAR(500),
    demo_form_id UUID,

    -- 使用统计
    use_count INTEGER DEFAULT 0,

    -- 状态
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,

    -- 创建者
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_templates_category ON public.templates(category);
CREATE INDEX idx_templates_featured ON public.templates(is_featured, sort_order);
CREATE INDEX idx_templates_active ON public.templates(is_active);

-- RLS 策略
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active templates are viewable by everyone"
    ON public.templates FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can view all templates"
    ON public.templates FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage templates"
    ON public.templates FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

/* ============================================
   6. SYSTEM SETTINGS TABLE (系统配置表)
   ============================================ */

CREATE TABLE public.system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 策略
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public settings are viewable by everyone"
    ON public.system_settings FOR SELECT
    USING (key LIKE 'public.%');

CREATE POLICY "Admins can view all settings"
    ON public.system_settings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Only admins can insert settings"
    ON public.system_settings FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Only admins can update settings"
    ON public.system_settings FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

/* ============================================
   7. FORMS TABLE (表单表)
   ============================================ */

CREATE TABLE public.forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    -- 基本信息
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft',

    -- 短链接（用于公开分享）
    short_id VARCHAR(20) UNIQUE NOT NULL,

    -- 主题配置
    theme_config JSONB DEFAULT '{}',
    logo_url VARCHAR(500),

    -- 权限配置
    access_type VARCHAR(20) DEFAULT 'public',
    access_password VARCHAR(255),
    allowed_emails TEXT[],
    ip_restrictions TEXT[],

    -- 限制配置
    max_responses INTEGER,
    max_per_user INTEGER DEFAULT 1,
    expires_at TIMESTAMP WITH TIME ZONE,

    -- 结果设置
    show_results BOOLEAN DEFAULT FALSE,
    results_password VARCHAR(255),

    -- 统计
    view_count INTEGER DEFAULT 0,
    response_count INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- 索引
CREATE INDEX idx_forms_user_id ON public.forms(user_id);
CREATE INDEX idx_forms_status ON public.forms(status);
CREATE INDEX idx_forms_type ON public.forms(type);
CREATE INDEX idx_forms_short_id ON public.forms(short_id);
CREATE INDEX idx_forms_published_at ON public.forms(published_at);

-- RLS 策略
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own forms"
    ON public.forms FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all forms"
    ON public.forms FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Users can create own forms"
    ON public.forms FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own forms"
    ON public.forms FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any form"
    ON public.forms FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Users can delete own forms"
    ON public.forms FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any form"
    ON public.forms FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Public forms are viewable by everyone"
    ON public.forms FOR SELECT
    USING (status = 'published' AND access_type = 'public');

/* ============================================
   8. FORM QUESTIONS TABLE (表单题目表)
   ============================================ */

CREATE TABLE public.form_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    options JSONB DEFAULT '{}',
    validation JSONB DEFAULT '{}',
    logic_rules JSONB DEFAULT '[]',
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_form_questions_form_id ON public.form_questions(form_id);
CREATE INDEX idx_form_questions_order ON public.form_questions(form_id, order_index);

-- RLS 策略
ALTER TABLE public.form_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage questions of own forms"
    ON public.form_questions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.forms
            WHERE forms.id = form_questions.form_id
            AND forms.user_id = auth.uid()
        )
    );

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
   9. FORM SUBMISSIONS TABLE (表单提交表)
   ============================================ */

CREATE TABLE public.form_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    session_id VARCHAR(255),

    -- 提交者信息
    submitter_ip VARCHAR(50),
    submitter_user_agent TEXT,
    submitter_location JSONB,

    -- 提交数据
    answers JSONB NOT NULL,
    duration_seconds INTEGER,

    status VARCHAR(20) DEFAULT 'completed',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_submissions_form_id ON public.form_submissions(form_id);
CREATE INDEX idx_submissions_user_id ON public.form_submissions(user_id);
CREATE INDEX idx_submissions_created_at ON public.form_submissions(created_at);

-- RLS 策略
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Form owners can view submissions"
    ON public.form_submissions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.forms
            WHERE forms.id = form_submissions.form_id
            AND forms.user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can submit to published forms"
    ON public.form_submissions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.forms
            WHERE forms.id = form_submissions.form_id
            AND forms.status = 'published'
        )
    );

/* ============================================
   10. UPLOADED FILES TABLE (文件上传记录表)
   ============================================ */

CREATE TABLE public.uploaded_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES public.form_submissions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(100),
    storage_path VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_uploaded_files_submission ON public.uploaded_files(submission_id);
CREATE INDEX idx_uploaded_files_question ON public.uploaded_files(question_id);

-- RLS 策略
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;

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

/* ============================================
   11. GUEST FORMS TABLE (访客创建表单表)
   ============================================ */

CREATE TABLE public.guest_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    guest_email VARCHAR(255),
    session_id VARCHAR(255) NOT NULL,
    access_token VARCHAR(255) UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_guest_forms_token ON public.guest_forms(access_token);
CREATE INDEX idx_guest_forms_session ON public.guest_forms(session_id);

-- RLS 策略
ALTER TABLE public.guest_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guests with token can manage their forms"
    ON public.guest_forms FOR ALL
    USING (true);

/* ============================================
   12. NOTIFICATIONS TABLE (通知记录表)
   ============================================ */

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    form_id UUID REFERENCES public.forms(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    content JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_form_id ON public.notifications(form_id);

-- RLS 策略
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

/* ============================================
   13. FUNCTIONS AND TRIGGERS
   ============================================ */

-- 新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 自动更新 updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_forms_updated_at
    BEFORE UPDATE ON public.forms
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON public.templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_submissions_updated_at
    BEFORE UPDATE ON public.form_submissions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 自动生成 short_id
CREATE OR REPLACE FUNCTION public.generate_short_id()
RETURNS TRIGGER AS $$
DECLARE
    new_short_id VARCHAR(20);
    attempts INTEGER := 0;
BEGIN
    WHILE attempts < 10 LOOP
        new_short_id := encode(gen_random_bytes(8), 'base64');
        new_short_id := regexp_replace(new_short_id, '[+/=]', '', 'g');
        new_short_id := substring(new_short_id, 1, 10);

        IF NOT EXISTS (SELECT 1 FROM public.forms WHERE short_id = new_short_id) THEN
            NEW.short_id := new_short_id;
            RETURN NEW;
        END IF;
        attempts := attempts + 1;
    END LOOP;
    RAISE EXCEPTION 'Failed to generate unique short_id';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_forms_short_id
    BEFORE INSERT ON public.forms
    FOR EACH ROW EXECUTE FUNCTION public.generate_short_id();

/* ============================================
   14. HELPER FUNCTIONS
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

/* ============================================
   15. INITIAL DATA
   ============================================ */

-- 初始化默认系统配置
INSERT INTO public.system_settings (key, value, description) VALUES
('public.site_name', '"MultiForms"', '站点名称'),
('public.site_description', '"5分钟创建专业表单"', '站点描述'),
('public.logo_url', '""', '站点Logo URL'),
('public.user_registration', 'true', '是否允许用户注册'),
('public.guest_form_creation', 'true', '是否允许访客创建表单'),
('public.max_forms_per_guest', '3', '访客最大表单数'),
('public.max_responses_per_form', '100', '访客表单最大提交数'),
('storage.max_file_size', '10485760', '最大文件上传大小（字节）'),
('storage.allowed_file_types', '["jpg","jpeg","png","gif","pdf","doc","docx"]', '允许的文件类型');

/* ============================================
   END OF MIGRATION
   ============================================ */
