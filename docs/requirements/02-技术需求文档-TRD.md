# 技术需求文档 (TRD)
# MultiForms - 智能表单云平台

| 文档版本 | 1.1 |
|----------|-----|
| 创建日期 | 2026-01-29 |
| 项目名称 | MultiForms |
| 文档状态 | 已更新 |

---

## 1. 技术架构概述

### 1.1 整体架构

**架构选型：Next.js + Supabase + Vercel 全栈 Serverless 架构**

```
┌─────────────────────────────────────────────────────────────────┐
│                        客户端层 (Vercel)                        │
├─────────────────────────────────────────────────────────────────┤
│  Next.js 16 App Router  │  React Server Components  │  RSC     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓ HTTPS / WebSocket
┌─────────────────────────────────────────────────────────────────┐
│                    Vercel Edge Network (全球 CDN)               │
├─────────────────────────────────────────────────────────────────┤
│  静态资源  │  图片优化  │  Edge Functions  │  ISR/SSR          │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼─────────┐  ┌────────▼────────┐  ┌────────▼────────┐
│ Next.js API     │  │ Supabase        │  │ Supabase        │
│ Routes          │  │ PostgreSQL      │  │ Storage         │
│ (轻量业务逻辑)   │  │ (主数据库)       │  │ (文件存储)       │
└─────────────────┘  └─────────────────┘  └─────────────────┘
        │                     │                     │
┌───────▼─────────┐  ┌────────▼────────┐  ┌────────▼────────┐
│ Supabase Edge   │  │ Supabase Auth   │  │ Supabase        │
│ Functions       │  │ (JWT/OAuth)     │  │ Realtime        │
│ (复杂业务逻辑)   │  │                 │  │ (实时订阅)       │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

**架构优势：**
- **零运维**: 无需管理服务器，Vercel 和 Supabase 完全托管
- **全球部署**: Vercel Edge Network 提供全球低延迟访问
- **自动扩展**: Serverless 架构按需自动扩展
- **类型安全**: TypeScript + Supabase 生成类型，全栈类型安全
- **开发效率**: 专注业务逻辑，基础设施即服务

### 1.2 技术栈选型

#### 前端技术栈
| 类别 | 技术选型 | 说明 |
|------|----------|------|
| 框架 | Next.js 16 (App Router) | React 全栈框架，支持 SSR/SSG/ISR |
| 语言 | TypeScript 5+ | 类型安全，提高代码质量 |
| UI 组件 | shadcn/ui + Tailwind CSS | 现代化组件库 + 设计系统 |
| 状态管理 | Zustand + React Hooks | 轻量级状态管理 |
| 表单处理 | React Hook Form + Zod | 高性能表单 + 类型安全验证 |
| 数据请求 | Supabase JS Client | 官方 SDK，支持类型生成 |
| 图表 | Recharts / Tremor | React 原生图表库 |
| 拖拽功能 | dnd-kit / @dnd-kit/core | 现代化拖拽库 |
| 动画 | Framer Motion | 声明式动画库 |
| 图标 | Lucide React | 轻量级图标库 |

#### 后端技术栈 (Supabase)
| 类别 | 技术选型 | 说明 |
|------|----------|------|
| 数据库 | PostgreSQL 16 (Supabase) | 主数据存储，支持全文搜索 |
| 认证 | Supabase Auth | Email 密码 + OAuth (Google/GitHub) |
| 文件存储 | Supabase Storage | 图片/文件存储，CDN 加速 |
| 实时订阅 | Supabase Realtime | PostgreSQL CDC 实时推送 |
| 安全策略 | Row Level Security (RLS) | 数据库级别的行级权限控制 |
| 服务端逻辑 | Supabase Edge Functions | Deno 运行时，支持复杂业务 |
| API 规范 | Auto-generated REST | Supabase 自动生成 RESTful API |
| 类型生成 | Supabase CLI | 自动生成 TypeScript 类型 |

#### 部署平台
| 类别 | 技术选型 | 说明 |
|------|----------|------|
| 前端部署 | Vercel | Next.js 官方推荐平台，零配置部署 |
| 后端部署 | Supabase Cloud | PostgreSQL 即服务，全球边缘节点 |
| 域名管理 | Vercel Domains | 自动 SSL，自定义域名 |
| 环境变量 | Vercel Env Variables | 安全的环境变量管理 |
| 日志监控 | Vercel Analytics + Supabase Logs | 性能监控和错误追踪 |

#### 开发工具
| 类别 | 技术选型 | 说明 |
|------|----------|------|
| 代码规范 | ESLint + Prettier | 代码格式化和 lint |
| Git Hooks | Husky + lint-staged | 提交前自动检查 |
| 包管理 | pnpm | 快速、节省磁盘空间 |
| 类型生成 | Supabase gen types | 自动生成数据库类型 |
| 本地开发 | Supabase CLI | 本地模拟 Supabase 环境 |

---

## 2. 数据库设计

### 2.1 Supabase 数据库架构

**核心设计原则：**
- 使用 Supabase Auth 的 `auth.users` 表管理用户认证
- 在 `public` schema 创建业务表，通过 `user_id` 关联
- 使用 Row Level Security (RLS) 实现行级权限控制
- 使用 `storage` bucket 管理文件上传

### 2.2 核心数据模型

#### 用户扩展表 (public.profiles)

> Supabase Auth 在 `auth` schema 管理认证信息，我们在 `public` schema 创建扩展表存储用户资料。

```sql
-- 用户角色枚举
CREATE TYPE user_role AS ENUM ('admin', 'creator', 'guest');

-- 用户状态枚举
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'banned');

-- 用户资料表
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    avatar_url VARCHAR(500),
    bio TEXT,

    -- 角色与权限
    role user_role DEFAULT 'creator',  -- admin, creator, guest
    status user_status DEFAULT 'active', -- active, inactive, banned

    -- 使用统计
    form_count INTEGER DEFAULT 0,
    submission_count INTEGER DEFAULT 0,
    storage_used BIGINT DEFAULT 0,     -- 字节

    -- 偏好设置
    preferences JSONB DEFAULT '{}',    -- 用户偏好设置
    email_verified BOOLEAN DEFAULT FALSE,

    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    banned_at TIMESTAMP WITH TIME ZONE,
    banned_reason TEXT
);

-- RLS 策略
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的资料
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- 管理员可以查看所有用户资料
CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 用户只能更新自己的资料
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 管理员可以更新所有用户资料
CREATE POLICY "Admins can update any profile"
    ON public.profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

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

-- 索引
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_status ON public.profiles(status);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at);
```

#### 管理员操作日志表 (public.admin_logs)

```sql
-- 操作类型枚举
CREATE TYPE admin_action AS ENUM (
    'login', 'logout', 'view_user', 'update_user', 'ban_user', 'delete_user',
    'view_form', 'update_form', 'delete_form', 'ban_form',
    'approve_template', 'delete_template', 'update_settings',
    'export_data', 'view_logs'
);

CREATE TABLE public.admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    -- 操作信息
    action admin_action NOT NULL,
    resource_type VARCHAR(50),     -- user, form, template, setting
    resource_id UUID,

    -- 操作详情
    details JSONB DEFAULT '{}',     -- 操作的详细信息
    ip_address VARCHAR(50),
    user_agent TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 策略（仅管理员可查看）
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

-- 索引
CREATE INDEX idx_admin_logs_admin_id ON public.admin_logs(admin_id);
CREATE INDEX idx_admin_logs_action ON public.admin_logs(action);
CREATE INDEX idx_admin_logs_created_at ON public.admin_logs(created_at);
```

#### 内容审核表 (public.content_reviews)

```sql
-- 审核状态枚举
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');

-- 举报类型枚举
CREATE TYPE report_type AS ENUM (
    'inappropriate_content', 'spam', 'harassment',
    'false_information', 'copyright', 'other'
);

CREATE TABLE public.content_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 被举报内容
    resource_type VARCHAR(50) NOT NULL, -- form, submission, comment
    resource_id UUID NOT NULL,

    -- 举报信息
    report_type report_type NOT NULL,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- 举报人
    report_reason TEXT,
    report_evidence JSONB DEFAULT '{}',  -- 举报证据（截图等）

    -- 审核信息
    status review_status DEFAULT 'pending',
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- 审核员
    review_notes TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,

    -- 处理结果
    action_taken VARCHAR(50),     -- banned, warning, no_action
    resource_banned BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 策略
ALTER TABLE public.content_reviews ENABLE ROW LEVEL SECURITY;

-- 管理员可查看所有审核记录
CREATE POLICY "Admins can view all reviews"
    ON public.content_reviews FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 管理员可更新审核状态
CREATE POLICY "Admins can update reviews"
    ON public.content_reviews FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 任何用户可创建举报
CREATE POLICY "Anyone can create report"
    ON public.content_reviews FOR INSERT
    WITH CHECK (true);

-- 索引
CREATE INDEX idx_content_reviews_status ON public.content_reviews(status);
CREATE INDEX idx_content_reviews_resource ON public.content_reviews(resource_type, resource_id);
CREATE INDEX idx_content_reviews_created_at ON public.content_reviews(created_at);
```

#### 模板库表 (public.templates)

```sql
-- 模板分类枚举
CREATE TYPE template_category AS ENUM (
    'vote', 'survey', 'rating', 'feedback', 'collection'
);

CREATE TABLE public.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 基本信息
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category template_category NOT NULL,
    tags TEXT[],

    -- 模板预览
    preview_url VARCHAR(500),      -- 预览图URL
    demo_form_id UUID REFERENCES public.forms(id) ON DELETE SET NULL,

    -- 使用统计
    use_count INTEGER DEFAULT 0,

    -- 状态
    is_featured BOOLEAN DEFAULT FALSE,  -- 是否精选
    is_active BOOLEAN DEFAULT TRUE,     -- 是否启用
    sort_order INTEGER DEFAULT 0,

    -- 创建者
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 策略
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- 所有人可查看启用的模板
CREATE POLICY "Active templates are viewable by everyone"
    ON public.templates FOR SELECT
    USING (is_active = true);

-- 管理员可查看所有模板
CREATE POLICY "Admins can view all templates"
    ON public.templates FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 管理员可创建/更新/删除模板
CREATE POLICY "Admins can manage templates"
    ON public.templates FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 索引
CREATE INDEX idx_templates_category ON public.templates(category);
CREATE INDEX idx_templates_featured ON public.templates(is_featured, sort_order);
CREATE INDEX idx_templates_active ON public.templates(is_active);
```

#### 系统配置表 (public.system_settings)

```sql
CREATE TABLE public.system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 策略
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- 所有人可查看公开配置
CREATE POLICY "Public settings are viewable by everyone"
    ON public.system_settings FOR SELECT
    USING (key LIKE 'public.%');

-- 管理员可查看所有配置
CREATE POLICY "Admins can view all settings"
    ON public.system_settings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 仅管理员可更新配置
CREATE POLICY "Only admins can update settings"
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

-- 初始化默认配置
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
```

#### 表单表 (public.forms)
```sql
CREATE TABLE public.forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    -- 基本信息
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,    -- vote, rating, survey, collection, feedback
    status VARCHAR(20) DEFAULT 'draft', -- draft, published, closed, archived

    -- 短链接（用于公开分享）
    -- 首次发布时生成，6-10位随机字符（大小写字母+数字）
    -- 使用加密安全随机数生成器确保唯一性
    short_id VARCHAR(20) UNIQUE,      -- 草稿状态可为 NULL，发布时生成

    -- 主题配置
    theme_config JSONB DEFAULT '{}',  -- 颜色、字体、背景等配置
    logo_url VARCHAR(500),

    -- 权限配置
    access_type VARCHAR(20) DEFAULT 'public', -- public, private, password
    access_password VARCHAR(255),     -- 密码保护时使用（需加密）
    allowed_emails TEXT[],            -- 私密访问的邮箱白名单
    ip_restrictions TEXT[],           -- IP白名单/黑名单限制

    -- 限制配置
    max_responses INTEGER,            -- 最大提交数
    max_per_user INTEGER DEFAULT 1,   -- 每人最大提交次数
    expires_at TIMESTAMP WITH TIME ZONE, -- 截止时间

    -- 结果设置
    show_results BOOLEAN DEFAULT FALSE,
    results_password VARCHAR(255),    -- 结果查看密码（需加密）

    -- 统计
    view_count INTEGER DEFAULT 0,
    response_count INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE  -- 首次发布时设置
);

-- RLS 策略
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的表单
CREATE POLICY "Users can view own forms"
    ON public.forms FOR SELECT
    USING (auth.uid() = user_id);

-- 管理员可以查看所有表单
CREATE POLICY "Admins can view all forms"
    ON public.forms FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 用户只能创建自己的表单
CREATE POLICY "Users can create own forms"
    ON public.forms FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的表单
CREATE POLICY "Users can update own forms"
    ON public.forms FOR UPDATE
    USING (auth.uid() = user_id);

-- 管理员可以更新所有表单
CREATE POLICY "Admins can update any form"
    ON public.forms FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 用户只能删除自己的表单
CREATE POLICY "Users can delete own forms"
    ON public.forms FOR DELETE
    USING (auth.uid() = user_id);

-- 管理员可以删除任何表单
CREATE POLICY "Admins can delete any form"
    ON public.forms FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 公开表单可被所有人查看（用于表单填写）
CREATE POLICY "Public forms are viewable by everyone"
    ON public.forms FOR SELECT
    USING (status = 'published' AND access_type = 'public');

-- 索引
CREATE INDEX idx_forms_user_id ON public.forms(user_id);
CREATE INDEX idx_forms_status ON public.forms(status);
CREATE INDEX idx_forms_type ON public.forms(type);
CREATE INDEX idx_forms_short_id ON public.forms(short_id);

-- 自动更新 updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_forms_updated_at
    BEFORE UPDATE ON public.forms
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- short_id 生成说明
-- short_id 在表单创建时可以为 NULL，仅在发布时生成
-- 使用应用层生成（TypeScript/JavaScript）以确保更好的随机性和唯一性检查
-- 生成方式：使用 crypto.getRandomValues() 生成 6 个随机字节，转换为 base62 字符集
-- 字符集：a-z, A-Z, 0-9（共 62 个字符）
-- 长度：6-10 位，通常为 6 位即可满足需求（62^6 ≈ 568 亿种组合）
-- 唯一性检查：生成后查询数据库确保唯一性，最多重试 10 次

-- 发布表单时设置 short_id 和 published_at
-- 示例应用层代码：
-- const shortId = generateShortId() // 生成 6 位随机字符串
-- const { data } = await supabase.from('forms').select('short_id').eq('short_id', shortId).single()
-- if (!data) {
--   await supabase.from('forms').update({ short_id: shortId, published_at: new Date().toISOString() })
-- }
```

#### 表单题目表 (public.form_questions)
```sql
CREATE TABLE public.form_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL, -- single_choice, multiple_choice, dropdown,
                                         -- rating, text, number, date, email, phone,
                                         -- file_upload, matrix, sorting
    options JSONB DEFAULT '{}',     -- 题目配置: 选项列表、评分范围等
    validation JSONB DEFAULT '{}',  -- 验证规则: 必填、字数限制、格式等
    logic_rules JSONB DEFAULT '[]', -- 逻辑跳转规则
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 策略（通过表单所有者间接控制）
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

CREATE INDEX idx_form_questions_form_id ON public.form_questions(form_id);
```

#### 表单提交表 (public.form_submissions)
```sql
CREATE TABLE public.form_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- 注册用户填写
    session_id VARCHAR(255),       -- 访客会话ID

    -- 提交者信息
    submitter_ip VARCHAR(50),
    submitter_user_agent TEXT,
    submitter_location JSONB,      -- IP解析的地理位置

    -- 提交数据
    answers JSONB NOT NULL,        -- {question_id: answer_value}
    duration_seconds INTEGER,      -- 填写耗时

    status VARCHAR(20) DEFAULT 'completed', -- draft, completed

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 策略
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- 表单所有者可以查看该表单的提交
CREATE POLICY "Form owners can view submissions"
    ON public.form_submissions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.forms
            WHERE forms.id = form_submissions.form_id
            AND forms.user_id = auth.uid()
        )
    );

-- 任何人可以创建提交（已发布的表单）
CREATE POLICY "Anyone can submit to published forms"
    ON public.form_submissions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.forms
            WHERE forms.id = form_submissions.form_id
            AND forms.status = 'published'
        )
    );

CREATE INDEX idx_submissions_form_id ON public.form_submissions(form_id);
CREATE INDEX idx_submissions_user_id ON public.form_submissions(user_id);
CREATE INDEX idx_submissions_created_at ON public.form_submissions(created_at);
```

#### 文件上传记录 (public.uploaded_files)
```sql
CREATE TABLE public.uploaded_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES public.form_submissions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,  -- Supabase Storage URL
    file_size BIGINT,
    file_type VARCHAR(100),
    storage_path VARCHAR(500),       -- Storage bucket path
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 策略
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;

-- 表单所有者可以查看文件
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

CREATE INDEX idx_uploaded_files_submission ON public.uploaded_files(submission_id);
```

#### 访客创建表单表 (public.guest_forms)
```sql
CREATE TABLE public.guest_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    guest_email VARCHAR(255),       -- 可选，用于找回
    session_id VARCHAR(255) NOT NULL,
    access_token VARCHAR(255) UNIQUE, -- 用于编辑管理
    expires_at TIMESTAMP WITH TIME ZONE, -- 访客表单过期时间
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 策略（访客通过 access_token 访问）
ALTER TABLE public.guest_forms ENABLE ROW LEVEL SECURITY;

-- 持有正确 token 的访客可以管理
CREATE POLICY "Guests with token can manage their forms"
    ON public.guest_forms FOR ALL
    USING (true); -- 实际在应用层通过 access_token 验证

CREATE INDEX idx_guest_forms_token ON public.guest_forms(access_token);
```

#### 通知记录表 (public.notifications)
```sql
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    form_id UUID REFERENCES public.forms(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,     -- new_response, form_expiring, etc.
    content JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 策略
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
```

### 2.3 数据索引策略
| 表 | 索引字段 | 索引类型 | 用途 |
|----|----------|----------|------|
| forms | user_id + status | B-tree | 用户表单列表查询 |
| forms | type + status | B-tree | 按类型筛选表单 |
| form_submissions | form_id + created_at | B-tree | 表单提交时间排序 |
| form_submissions | answers | GIN | 答案内容全文搜索 |

---

## 3. API 设计

### 3.1 前台交互与访问控制

#### 3.1.1 模板访问登录检测

**技术实现**:
- 使用 `useAuthStore` 获取用户登录状态
- 通过 `useRouter` 实现条件导航
- 客户端组件通过 `'use client'` 指令启用交互功能

**组件**: `src/components/landing/templates-section.tsx`

```typescript
'use client'

import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'

// 模板点击处理函数
const handleTemplateClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
  if (!isAuthenticated) {
    e.preventDefault()
    router.push('/login')
  }
}

// 条件渲染链接
<Link
  href={isAuthenticated ? '/dashboard' : '/login'}
  onClick={handleTemplateClick}
>
  {/* 模板内容 */}
</Link>
```

#### 3.1.2 用户评价轮播跑马灯

**技术实现**:
- 使用 `useState` 管理当前激活的评价索引
- 使用 `useEffect` 实现自动轮播（5秒间隔）
- `setInterval` 控制自动切换，`clearInterval` 清理定时器
- CSS 动画实现进度条效果

**组件**: `src/components/landing/testimonials-section.tsx`

```typescript
const AUTO_ROTATE_INTERVAL = 5000 // 5秒自动切换

const [activeIndex, setActiveIndex] = useState(0)
const [isPaused, setIsPaused] = useState(false)

// 自动轮播
useEffect(() => {
  if (isPaused) return

  const interval = setInterval(() => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
  }, AUTO_ROTATE_INTERVAL)

  return () => clearInterval(interval)
}, [isPaused])

// 鼠标悬停暂停
onMouseEnter={() => setIsPaused(true)}
onMouseLeave={() => setIsPaused(false)}
```

**进度条动画**:
```css
@keyframes marquee {
  from { width: 0%; }
  to { width: 100%; }
}

.progress-bar {
  animation: marquee 5000ms linear;
  animation-play-state: paused; /* 鼠标悬停时暂停 */
}
```

### 3.2 API 架构

**混合 API 架构：**

```
┌─────────────────────────────────────────────────────────────┐
│                      客户端请求                              │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌──────────────────────┐      ┌──────────────────────────────┐
│  Next.js API Routes  │      │   Supabase REST API          │
│  (自定义业务逻辑)      │      │   (自动生成的 CRUD API)       │
├──────────────────────┤      ├──────────────────────────────┤
│ /api/auth/*          │      │ /rest/v1/forms/*             │
│ /api/forms/*/export  │      │ /rest/v1/form_questions/*    │
│ /api/stats/*         │      │ /rest/v1/form_submissions/*  │
│ /api/guest/*         │      │ /rest/v1/profiles/*          │
└──────────────────────┘      └──────────────────────────────┘
         │                               │
         └───────────────┬───────────────┘
                         ▼
                 ┌───────────────┐
                 │  Supabase     │
                 │  PostgreSQL   │
                 └───────────────┘
```

**API 分层策略：**

| 层级 | 技术 | 用途 | 示例 |
|------|------|------|------|
| 客户端直连 | Supabase JS Client | 简单 CRUD，实时订阅 | 表单列表、提交表单 |
| API Routes | Next.js Route Handlers | 业务逻辑、权限验证 | 数据导出、统计分析 |
| Edge Functions | Supabase Edge Functions | 复杂计算、定时任务 | 数据聚合、邮件发送 |

### 3.2 Supabase 直接访问

大部分数据操作通过 Supabase JS Client 直接访问：

```typescript
// 客户端直接访问示例
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// 获取用户的表单列表
const { data: forms } = await supabase
  .from('forms')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })

// 提交表单
const { data } = await supabase
  .from('form_submissions')
  .insert({
    form_id: formId,
    answers: answers,
    // ...
  })

// 实时监听新提交
const channel = supabase
  .channel('submissions')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'form_submissions',
    filter: `form_id=eq.${formId}`
  }, (payload) => {
    console.log('新提交:', payload.new)
  })
  .subscribe()
```

### 3.3 Next.js API Routes

复杂业务逻辑通过 Next.js API Routes 处理：

#### 认证相关
```
POST   /api/auth/callback          # OAuth 回调处理
POST   /api/auth/logout            # 登出处理
```

#### 表单管理
```
GET    /api/forms/[id]/export      # 导出表单数据 (Excel/CSV)
POST   /api/forms/[id]/duplicate   # 复制表单
POST   /api/forms/[id]/publish     # 发布表单（包含验证逻辑）
```

#### 统计分析
```
GET    /api/forms/[id]/stats/overview    # 概览统计（聚合查询）
GET    /api/forms/[id]/stats/trend       # 趋势分析
GET    /api/forms/[id]/stats/cross       # 交叉分析
```

#### 文件处理
```
POST   /api/upload                  # 文件上传（处理到 Supabase Storage）
GET    /api/storage/[path]          # 代理存储文件
```

#### 访客功能
```
POST   /api/guest/forms             # 访客创建表单
GET    /api/guest/forms/[token]     # 访客获取表单
```

#### 公开表单访问

**表单状态验证**:
- 公开表单访问路径：`/f/{shortId}`
- 访问时必须验证表单状态为 `published`
- 未发布的表单返回友好错误提示："表单尚未发布，无法访问"
- 表单状态检查在 RLS 策略和应用层双重验证

**RLS 策略示例**:
```sql
-- 公开表单可被所有人查看（用于表单填写）
CREATE POLICY "Public forms are viewable by everyone"
    ON public.forms FOR SELECT
    USING (status = 'published' AND access_type = 'public');
```

**应用层验证**:
```typescript
// 在 Server Component 或 API Route 中验证
const formData = await getFormByShortId(shortId)
if (formData.status !== 'published') {
  return {
    error: '表单尚未发布，无法访问',
    isUnpublished: true
  }
}
```

### 3.4 Supabase Edge Functions

复杂或耗时操作使用 Supabase Edge Functions：

```
POST   /send-notification           # 发送邮件/推送通知
POST   /generate-report             # 生成复杂报告
POST   /cleanup-expired             # 清理过期数据（定时任务）
```

### 3.5 API 响应格式

#### 成功响应
```json
{
    "success": true,
    "data": {
        // 响应数据
    },
    "message": "操作成功"
}
```

#### 错误响应
```json
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "参数验证失败",
        "details": [
            {
                "field": "email",
                "message": "邮箱格式不正确"
            }
        ]
    }
}
```

### 3.5 错误码定义
| 错误码 | 说明 | HTTP状态码 |
|--------|------|------------|
| SUCCESS | 成功 | 200 |
| UNAUTHORIZED | 未授权 | 401 |
| FORBIDDEN | 禁止访问 | 403 |
| NOT_FOUND | 资源不存在 | 404 |
| VALIDATION_ERROR | 参数验证失败 | 400 |
| DUPLICATE_ERROR | 重复数据 | 409 |
| RATE_LIMIT_EXCEEDED | 超出频率限制 | 429 |
| INTERNAL_ERROR | 服务器内部错误 | 500 |

---

## 4. 安全设计

### 4.1 认证与授权

#### Supabase Auth

使用 Supabase Auth 处理所有认证：

```typescript
// 登录示例
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// 邮箱密码登录
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// OAuth 登录（Google、GitHub 等）
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${origin}/api/auth/callback`
  }
})

// 获取当前用户
const { data: { user } } = await supabase.auth.getUser()
```

**认证流程：**
1. 用户通过 Supabase Auth 登录（Email/OAuth）
2. Supabase 返回 JWT Access Token 和 Refresh Token
3. Token 存储在 httpOnly Cookie 中（安全）
4. 每次请求自动携带 Token
5. Supabase RLS 根据 `auth.uid()` 自动验证权限

#### Row Level Security (RLS)

所有表都启用 RLS，实现数据库级别的权限控制：

```sql
-- 示例：用户只能操作自己的表单
CREATE POLICY "Users can manage own forms"
    ON public.forms FOR ALL
    USING (auth.uid() = user_id);

-- 示例：公开表单可被所有人查看
CREATE POLICY "Published forms are public"
    ON public.forms FOR SELECT
    USING (status = 'published' AND access_type = 'public');
```

**RLS 优势：**
- 权限控制在数据库层，无法绕过
- 即使 API 被绕过，数据依然安全
- 减少应用层权限判断代码

#### 权限模型

##### 按角色划分的权限矩阵

| 资源/操作 | 访客 | 表单创建者 | 管理员 |
|-----------|------|------------|--------|
| **前台访问** |
| 访问公开表单 | ✅ | ✅ | ✅ |
| 填写表单 | ✅ | ✅ | ✅ |
| **账户管理** |
| 注册账户 | ✅ | - | - |
| 登录系统 | ✅ | ✅ | ✅（独立入口） |
| 编辑个人资料 | ✅ | ✅ | ✅ |
| **表单管理** |
| 创建表单 | 3个/月 | 无限 | - |
| 编辑自己的表单 | ✅ | ✅ | ✅ |
| 删除自己的表单 | ✅ | ✅ | ✅ |
| 查看所有表单 | ❌ | ❌ | ✅ |
| 编辑任何表单 | ❌ | ❌ | ✅ |
| 删除任何表单 | ❌ | ❌ | ✅ |
| **数据管理** |
| 查看自己的数据 | ✅ | ✅ | ✅ |
| 导出数据 | ❌ | ✅ | ✅ |
| **用户管理** |
| 查看用户列表 | ❌ | ❌ | ✅ |
| 查看用户详情 | ❌ | 仅自己 | ✅ |
| 禁用/封禁用户 | ❌ | ❌ | ✅ |
| 删除用户 | ❌ | ❌ | ✅ |
| **内容管理** |
| 举报内容 | ✅ | ✅ | ✅ |
| 审核内容 | ❌ | ❌ | ✅ |
| 管理模板 | ❌ | ❌ | ✅ |
| **系统管理** |
| 查看系统日志 | ❌ | ❌ | ✅ |
| 修改系统设置 | ❌ | ❌ | ✅ |
| 查看平台统计 | ❌ | ❌ | ✅ |

##### 管理员权限验证函数

```sql
-- 检查用户是否为管理员
CREATE OR REPLACE FUNCTION is_admin()
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
CREATE OR REPLACE FUNCTION is_owner_or_admin(resource_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.uid() = resource_user_id OR is_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

##### 使用示例

```sql
-- 在 RLS 策略中使用管理员检查
CREATE POLICY "Owners or admins can delete"
    ON public.forms FOR DELETE
    USING (is_owner_or_admin(forms.user_id));

-- 在应用代码中检查
import { supabase } from '@/lib/supabase'

// 检查当前用户是否为管理员
const { data: { user } } = await supabase.auth.getUser()
const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

if (profile?.role === 'admin') {
    // 显示管理员功能
}
```

### 4.2 数据安全

#### 密码安全
- Supabase Auth 自动处理密码哈希
- 使用 PBKDF2 + SHA256 算法
- 密码强度要求: 最少8位，包含字母和数字
- 登录失败限制: Supabase 内置防护

#### 数据加密
- 传输层: 全站 HTTPS (TLS 1.3)
- 敏感字段: 使用 pgcrypto 扩展加密 (AES-256)
- 密码保护表单: 使用 crypt() 函数验证

```sql
-- 加密敏感字段
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 存储加密的密码
INSERT INTO forms (access_password)
VALUES (crypt('raw_password', gen_salt('bf')));

-- 验证密码
SELECT * FROM forms
WHERE access_password IS NOT NULL
  AND access_password = crypt('input_password', access_password);
```

#### 防攻击措施
| 攻击类型 | 防护措施 |
|----------|----------|
| SQL 注入 | Supabase 参数化查询 + RLS |
| XSS | Next.js 自动转义 + CSP Headers |
| CSRF | Supabase httpOnly Cookie + SameSite |
| DDoS | Vercel Edge Protection + 速率限制 |
| 暴力破解 | Supabase Auth 内置限制 |

#### Storage 安全
```typescript
// Storage RLS 策略
const { data, error } = await supabase
  .storage
  .from('avatars')
  .upload(`public/${filename}`, file, {
    cacheControl: '3600',
    upsert: false
  })

// 带签名的私有文件访问
const { data } = await supabase
  .storage
  .from('private-files')
  .createSignedUrl('path/to/file', 60) // 60秒有效期
```

### 4.3 隐私合规
- 遵守 GDPR、个人信息保护法
- 提供数据导出功能 (数据可携权)
- 提供账户删除功能 (被遗忘权)
- 明确隐私政策和用户协议
- 可选的匿名数据收集

---

## 5. 性能优化

### 5.1 前端优化
| 优化项 | 方案 |
|--------|------|
| 代码分割 | Next.js App Router 自动分割 |
| 资源压缩 | Vercel 自动 Gzip + Brotli |
| 图片优化 | next/image 自动 WebP + 响应式 |
| 缓存策略 | Next.js ISR + SWR |
| 首屏优化 | Server Components + Streaming |
| 请求优化 | React Server Components 减少客户端 JS |

### 5.2 数据库优化
| 优化项 | 方案 |
|--------|------|
| 索引优化 | 合理创建 B-tree / GIN 索引 |
| 查询优化 | 使用 Supabase Query Builder |
| 连接池 | Supabase 内置连接池 (PgBouncer) |
| 缓存 | Supabase Edge Cache + HTTP Cache Headers |

### 5.3 Vercel 优化
| 优化项 | 方案 |
|--------|------|
| CDN | Vercel Edge Network 全球分发 |
| ISR | 增量静态再生，减少数据库查询 |
| ISR | 按需重新验证 |
| Edge Functions | 边缘计算，低延迟 |
| Image Optimization | 自动图片优化和缓存 |
| 数据库读写 | 主从分离 + 读写分离 |

### 5.4 性能指标
| 指标 | 目标值 |
|------|--------|
| 首屏加载 (FCP) | < 1.5s |
| 可交互时间 (TTI) | < 3s |
| API 响应时间 (P95) | < 200ms |
| 表单提交响应 | < 500ms |

---

## 6. 部署架构

### 6.1 生产环境架构 (Vercel + Supabase)

```
                        ┌─────────────────────────────────┐
                        │           全球用户              │
                        └───────────────┬─────────────────┘
                                        │
                        ┌───────────────▼─────────────────┐
                        │     Vercel Edge Network         │
                        │   (全球 70+ 节点 CDN)           │
                        └───────────────┬─────────────────┘
                                        │
                ┌───────────────────────┼───────────────────────┐
                │                       │                       │
        ┌───────▼────────┐    ┌────────▼─────────┐   ┌────────▼─────────┐
        │  Next.js App   │    │  Edge Functions  │   │  Image Opt.      │
        │  (SSR/ISR)     │    │  (API Routes)    │   │  (自动优化)       │
        └───────┬────────┘    └────────┬─────────┘   └──────────────────┘
                │                       │
                └───────────────────────┼───────────────────────┐
                                        │                       │
                ┌───────────────────────▼────────┐   ┌──────────▼─────────┐
                │         Supabase Cloud         │   │  Supabase Storage  │
                ├────────────────────────────────┤   │  (文件存储 + CDN)  │
                │  • PostgreSQL 16              │   └────────────────────┘
                │  • Auth (JWT)                 │
                │  • Edge Functions             │
                │  • Realtime                   │
                └────────────────────────────────┘
```

**架构优势：**
- **零运维**: 无需管理服务器，自动扩展
- **全球部署**: Vercel + Supabase 全球节点
- **自动 CI/CD**: Git 推送即部署
- **免费额度**: 两者都有慷慨的免费计划

### 6.2 部署流程

```
┌───────────┐     ┌───────────┐     ┌─────────────┐     ┌───────────┐
│  开发者    │ ──> │  GitHub   │ ──> │   Vercel    │ ──> │  生产环境  │
│  (本地开发) │     │ (代码仓库) │     │  (自动部署)  │     │  (全球可用) │
└───────────┘     └───────────┘     └─────────────┘     └───────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  Supabase   │
                                        │ (数据库迁移) │
                                        └─────────────┘
```

**部署步骤：**
1. 推送代码到 GitHub
2. Vercel 自动触发部署
3. 运行 `pnpm build` 构建
4. 部署到 Vercel Edge Network
5. 数据库迁移通过 Supabase Migrations

### 6.3 环境配置

**Vercel 环境变量：**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...  # 仅服务端使用

# 应用配置
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_APP_NAME=MultiForms

# OAuth 回调
NEXT_PUBLIC_OAUTH_REDIRECT_URL=https://yourdomain.com/api/auth/callback
```

### 6.4 本地开发

```bash
# 使用 Supabase CLI 本地模拟
pnpm dev
# 或
supabase start  # 启动本地 Supabase
```

---

## 7. 监控与运维

### 7.1 监控方案

| 平台 | 监控内容 |
|------|----------|
| Vercel Analytics | 页面访问、性能指标、Web Vitals |
| Vercel Logs | 应用日志、错误追踪 |
| Supabase Dashboard | 数据库性能、API 调用、存储使用 |
| Supabase Logs | 数据库查询、认证事件 |

### 7.2 错误追踪

推荐集成：
- **Sentry**: 错误追踪和性能监控
- **Logflare**: Supabase 日志分析

### 7.3 告警通知

| 告警项 | 触发条件 | 通知方式 |
|--------|----------|----------|
| 部署失败 | Vercel 部署错误 | Email / Slack |
| 错误率激增 | 错误率 > 5% | Email / Slack |
| 数据库连接 | 连接数 > 80% | Email |
| 配额超限 | 使用量 > 90% | Email |

---

## 8. 技术债务与风险

### 8.1 技术债务
- Serverless 冷启动可能影响首次响应时间
- Supabase 免费层有连接数限制
- 需要评估 Vercel 和 Supabase 的成本增长

### 8.2 技术风险
| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 平台依赖 | 迁移成本 | 保持业务逻辑独立，避免深度绑定 |
| 配额限制 | 服务中断 | 监控使用量，设置告警 |
| 高并发提交 | 服务响应慢 | 使用 Supabase Edge Functions 异步处理 |
| 数据存储增长 | 成本上升 | 定期清理过期数据，数据归档 |
| 恶意刷单攻击 | 数据污染 | 风控规则 + 限流 |

---

## 9. 开发计划

### Phase 1: 前台 MVP (8周)
- Week 1-2: 项目搭建 + 用户系统（注册/登录/Profile）
- Week 3-4: 表单创建 + 基础题型实现
- Week 5-6: 提交收集 + 基础统计
- Week 7-8: 测试 + 前台上线

### Phase 2: 前台功能完善 (6周)
- Week 1-2: 高级题型 + 逻辑跳转
- Week 3-4: 模板库 + 主题系统
- Week 5-6: 高级分析 + 数据导出

### Phase 3: 管理后台 (6周)
- Week 1: 管理员认证 + 权限系统
- Week 2-3: 用户管理 + 表单管理
- Week 4: 内容审核 + 模板管理
- Week 5: 系统设置 + 操作日志
- Week 6: 管理后台测试 + 上线

### Phase 4: 高级功能 (8周)
- Week 1-3: 协作功能
- Week 4-5: API 开放平台
- Week 6-8: 第三方集成 + AI 分析

---

## 10. 版本更新记录

### v1.2 (2026-02-09)
- **新增**: 主题 Hover 预览切换系统
  - 文件: `src/components/layout/theme-switcher.tsx`, `src/lib/themes.ts`
  - Hover 展开显示所有主题（每行一个）
  - Hover 临时预览主题效果（页面颜色实时变化）
  - 点击确认选择主题
  - 移出不点击恢复原主题
- **新增**: 实时模板同步
  - 文件: `src/lib/templates/definitions.ts`, `src/app/templates/page.tsx`
  - 使用 Supabase Realtime 订阅 templates 表变更
  - 管理员创建模板后，创建者模板库实时更新
  - 迁移: `supabase/migrations/009_enable_templates_realtime.sql`
- **更新**: 数据分析页面
  - 文件: `src/app/analytics/page.tsx`
  - 移除重复的"数据分析"标题
  - "热门表单排行" → "热门TOP10表单排行"

### v1.1 (2026-02-08)
- **新增**: 首页模板登录检测功能
  - 文件: `src/components/landing/templates-section.tsx`
  - 使用 Zustand authStore 检测登录状态
  - 条件导航至 Dashboard 或登录页
- **新增**: 用户评价自动轮播跑马灯
  - 文件: `src/components/landing/testimonials-section.tsx`
  - 5秒自动切换间隔
  - 进度条、导航箭头、圆点导航
  - 鼠标悬停暂停功能
