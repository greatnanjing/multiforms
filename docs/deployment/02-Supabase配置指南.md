# Supabase 配置指南

| 文档版本 | 1.0 |
|----------|-----|
| 创建日期 | 2026-01-29 |
| 项目名称 | MultiForms |
| 平台 | Supabase |

---

## 1. Supabase 简介

**Supabase** 是一个开源的 Firebase 替代方案，提供 PostgreSQL 数据库、身份验证、存储、实时订阅和边缘函数等功能。

### 核心功能

| 功能 | 说明 |
|------|------|
| **Database** | PostgreSQL 16 数据库，支持完整 SQL 功能 |
| **Authentication** | 邮箱/密码、OAuth、Magic Links 等认证方式 |
| **Storage** | 文件存储，支持 CDN 加速 |
| **Realtime** | PostgreSQL CDC 实时数据订阅 |
| **Edge Functions** | Deno 运行时的 Serverless 函数 |
| **RLS** | Row Level Security，行级安全策略 |

### 免费额度

| 资源 | 免费额度 |
|------|----------|
| 数据库 | 500MB |
| 文件存储 | 1GB |
| 带宽 | 1GB/月 |
| API 请求 | 50,000/月 |
| 同时连接数 | 60 |

---

## 2. 项目创建

### 步骤 1：注册账号

1. 访问 [supabase.com](https://supabase.com)
2. 点击 "Start your project"
3. 使用 GitHub 账号登录（推荐）

### 步骤 2：创建项目

1. 点击 "New Project"
2. 填写项目信息：

```
项目名称: multiforms
数据库密码: [生成强密码]
区域: Southeast Asia (Singapore)  // 选择离用户最近的区域
```

3. 等待项目创建完成（约 2 分钟）

### 步骤 3：获取密钥

在项目 Settings > API 中获取：

```
Project URL: https://xxx.supabase.co
anon public: eyJxxx...  // 客户端使用
service_role: eyJxxx...  // 服务端使用（保密！）
```

---

## 3. 安装 Supabase CLI

### 安装

```bash
# macOS
brew install supabase/tap/supabase

# Windows
scoop install supabase

# Linux
curl -fsSL https://packages.supabase.com/linux/install.sh | bash

# 验证安装
supabase --version
```

### 登录

```bash
supabase login
```

### 链接项目

```bash
supabase link --project-ref xxxxxxxx
```

---

## 4. 数据库配置

### 4.1 启用扩展

在 SQL Editor 中执行：

```sql
-- 启用 UUID 生成
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 启用加密功能
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 启用全文搜索
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 启用向量搜索（可选）
CREATE EXTENSION IF NOT EXISTS vector;
```

### 4.2 创建表结构

通过 Supabase Dashboard 的 Table Editor 创建表，或使用 Migration 文件：

```bash
# 创建 migration
supabase migration new create_profiles_table

# 编辑迁移文件
# supabase/migrations/xxxxx_create_profiles_table.sql
```

示例迁移文件：

```sql
-- 用户资料表
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    avatar_url VARCHAR(500),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS 策略
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 新用户触发器
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
```

### 4.3 推送迁移

```bash
# 推送到远程数据库
supabase db push

# 或使用迁移历史
supabase migration up
```

---

## 5. 认证配置

### 5.1 启用 Email 认证

在 Authentication > Settings 中：

| 设置项 | 值 |
|--------|-----|
| Enable email confirmations | 开启 |
| Email template | 自定义邮件模板 |

### 5.2 配置 OAuth

在 Authentication > Providers 中启用：

| Provider | 配置说明 |
|----------|----------|
| **GitHub** | 创建 GitHub OAuth App，填写 Client ID 和 Secret |
| **Google** | 创建 Google Cloud OAuth 2.0 凭据 |
| **微信** | 需要使用自定义 OAuth |

#### GitHub OAuth 配置

1. 访问 GitHub Settings > Developer settings > OAuth Apps
2. 新建 OAuth App：

```
Application name: MultiForms
Homepage URL: https://yourdomain.com
Authorization callback URL: https://xxx.supabase.co/auth/v1/callback
```

3. 复制 Client ID 和 Secret 到 Supabase

### 5.3 自定义邮件模板

在 Authentication > Email Templates 中自定义：

```html
<!-- Confirm Signup -->
<h2>确认您的邮箱</h2>
<p>感谢注册 MultiForms！</p>
<p><a href="{{ .ConfirmationURL }}">点击确认</a></p>
```

---

## 6. Storage 配置

### 6.1 创建 Bucket

在 Storage 中创建：

```
Bucket Name: avatars
Public: false (通过 RLS 控制访问)
File Size Limit: 5MB
Allowed MIME Types: image/jpeg, image/png, image/webp
```

### 6.2 Storage RLS 策略

在 SQL Editor 中执行：

```sql
-- 允许用户上传自己的头像
CREATE POLICY "Users can upload own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- 允许公开读取头像
CREATE POLICY "Public can view avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');
```

### 6.3 配置 CDN

在 Storage > Settings 中：

```
Image Transformation: Enabled
CDN: Enabled (通过 Supabase CDN)
```

---

## 7. 实时订阅配置

### 7.1 启用 Realtime

在 Database > Replication 中启用：

| 表 | 实时 |
|------|-----|
| form_submissions | ✓ |
| notifications | ✓ |

### 7.2 客户端订阅

```typescript
// 订阅新提交
const channel = supabase
  .channel('submissions')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'form_submissions',
      filter: `form_id=eq.${formId}`
    },
    (payload) => {
      console.log('新提交:', payload.new)
    }
  )
  .subscribe()
```

---

## 8. Edge Functions

### 8.1 创建 Edge Function

```bash
# 创建函数
supabase functions new send-notification
```

### 8.2 函数代码

```typescript
// supabase/functions/send-notification/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { userId, message } = await req.json()

  // 处理逻辑
  // ...

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { "Content-Type": "application/json" } }
  )
})
```

### 8.3 部署

```bash
# 部署单个函数
supabase functions deploy send-notification

# 部署所有函数
supabase functions deploy
```

### 8.4 调用

```typescript
const { data, error } = await supabase.functions.invoke('send-notification', {
  body: { userId, message }
})
```

---

## 9. 本地开发

### 启动本地 Stack

```bash
# 启动本地 Supabase
supabase start

# 查看状态
supabase status

# 查看日志
supabase logs
```

### 本地配置

```bash
# 生成类型
supabase gen types typescript --local > lib/database.types.ts

# 重置数据库
supabase db reset
```

---

## 10. 类型生成

### 自动生成 TypeScript 类型

```bash
# 生成远程类型
supabase gen types typescript --project-id xxxxxxxx > lib/database.types.ts

# 生成本地类型
supabase gen types typescript --local > lib/database.types.ts
```

### 使用类型

```typescript
import { Database } from '@/lib/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type NewProfile = Database['public']['Tables']['profiles']['Insert']

// 类型安全的查询
const { data } = await supabase
  .from('profiles')
  .select('*')
  .returns<Profile[]>()
```

---

## 11. 安全最佳实践

### 11.1 RLS 策略

- 所有表都应启用 RLS
- 使用 `auth.uid()` 获取当前用户 ID
- 避免使用 `service_role` 密钥在客户端

### 11.2 密钥管理

| 密钥 | 使用场景 | 暴露风险 |
|------|----------|----------|
| `anon` key | 客户端调用 | 可公开，受 RLS 保护 |
| `service_role` key | 服务端/Edge Functions | 绝不暴露到前端 |

### 11.3 API 限流

在 Database > Settings 中配置：

```
Max Requests (per minute): 100
Max Requests (per hour): 1000
```

---

## 12. 备份与恢复

### 自动备份

Supabase 免费计划包含：

- 每日自动备份
- 保留 7 天

### 手动备份

```bash
# 导出所有数据
supabase db dump -f backup.sql

# 恢复
supabase db reset --db-url "postgresql://..."
```

---

## 13. 监控与日志

### 性能监控

在 Database > Reports 中查看：

- 慢查询分析
- 表大小统计
- 索引使用情况

### 日志

在 Logs > Database Logs 中查看：

- 查询日志
- 认证事件
- API 调用

---

## 14. OAuth 回调配置

### Vercel 部署时的回调 URL

当使用 Vercel 部署时，需要在 Supabase 中配置正确的 OAuth 回调 URL：

| 环境 | 回调 URL 格式 |
|------|---------------|
| 本地开发 | `http://localhost:3000/api/auth/callback` |
| 预览环境 | `https://your-project.vercel.app/api/auth/callback` |
| 生产环境 | `https://yourdomain.com/api/auth/callback` |

### 配置步骤

1. 在 Supabase Dashboard 中进入 Authentication > Providers
2. 选择要配置的 Provider（如 GitHub、Google）
3. 在 "Callback URL" 中添加对应的回调地址
4. 保存设置

### Vercel 环境变量

确保在 Vercel 项目中设置以下环境变量：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...  # 仅服务端使用
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_APP_NAME=MultiForms
```

---

## 15. 故障排查

### 常见问题

| 问题 | 解决方案 |
|------|----------|
| 连接数超限 | 使用 Connection Pooling |
| RLS 策略不生效 | 检查 `ENABLE ROW LEVEL SECURITY` |
| 文件上传失败 | 检查 Storage RLS 策略 |
| 实时订阅不工作 | 检查 Replication 设置 |

### 获取帮助

- [Supabase 文档](https://supabase.com/docs)
- [Supabase GitHub](https://github.com/supabase/supabase)
- [Supabase Discord](https://supabase.com/discord)

---

## 15. 成本估算

### Free（免费）

- 适合开发和小规模应用
- 500MB 数据库
- 1GB 存储

### Pro ($25/月)

- 适合生产环境
- 8GB 数据库
- 100GB 存储
- 暂停功能（按小时计费）

### Pro（更大规模）

按使用量计费：

- 数据库：$0.125/GB/月
- 存储：$0.021/GB/月
- API 请求：$2/百万次

---

*文档由 Claude AI 协助创建*
