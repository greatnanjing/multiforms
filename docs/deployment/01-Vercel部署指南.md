# Vercel 部署指南

| 文档版本 | 1.0 |
|----------|-----|
| 创建日期 | 2026-01-29 |
| 项目名称 | MultiForms |
| 部署平台 | Vercel |

---

## 1. Vercel 简介

**Vercel** 是 Next.js 团队开发的云平台，专为前端框架优化，提供零配置部署和全球 CDN 加速。

### 为什么选择 Vercel？

| 特性 | 说明 |
|------|------|
| 零配置 | 推送代码即可自动部署 |
| 全球 CDN | 70+ 边缘节点，低延迟访问 |
| 自动扩展 | 无需考虑服务器容量 |
| 预览部署 | 每个 PR 自动生成预览链接 |
| 边缘函数 | 支持 Serverless Functions |

### 免费额度

| 资源 | 免费额度 |
|------|----------|
| 带宽 | 100GB/月 |
| Serverless Function 执行时间 | 100小时/月 |
| 构建时间 | 6000分钟/月 |
| 域名 | 无限自定义域名 |

---

## 2. 部署前准备

### 2.1 环境要求

- Git 仓库 (GitHub / GitLab / Bitbucket)
- Node.js 18+ (本地开发)
- Vercel 账号

### 2.2 安装 Vercel CLI

```bash
# 使用 npm
npm install -g vercel

# 使用 pnpm（如使用 pnpm）
pnpm add -g vercel

# 登录
vercel login
```

---

## 3. 部署方式

### 方式一：通过 GitHub 集成部署（推荐）

#### 步骤 1：连接 GitHub

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "Sign Up" 或 "Login"
3. 选择 "Continue with GitHub"
4. 授权 Vercel 访问你的仓库

#### 步骤 2：导入项目

1. 点击 "Add New Project"
2. 选择 `multiforms` 仓库
3. 配置项目设置

#### 步骤 3：配置项目

```bash
# 项目配置
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: (自动检测)
Install Command: npm install
```

#### 步骤 4：设置环境变量

在 Vercel Dashboard 中添加以下环境变量：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | `eyJxxx...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务密钥（仅服务端） | `eyJxxx...` |
| `NEXT_PUBLIC_APP_URL` | 应用地址 | `https://yourdomain.com` |
| `NEXT_PUBLIC_APP_NAME` | 应用名称 | `MultiForms` |

**注意**：OAuth 回调 URL 需要在 Supabase Dashboard 的 Authentication > Providers 中配置，格式为 `https://yourdomain.com/api/auth/callback`

#### 步骤 5：部署

1. 点击 "Deploy"
2. 等待构建完成（约 1-2 分钟）
3. 部署成功后获得 `https://your-project.vercel.app`

### 方式二：使用 CLI 部署

```bash
# 在项目根目录执行
vercel

# 首次部署会询问：
# ? Set up and deploy "~/multiforms"? [Y/n] y
# ? Which scope do you want to deploy to? Your Username
# ? Link to existing project? [y/N] n
# ? What's your project's name? multiforms
# ? In which directory is your code located? ./
# ? Want to override the settings? [y/N] n

# 部署到生产环境
vercel --prod
```

---

## 4. 配置文件

### 4.1 vercel.json（可选）

在项目根目录创建 `vercel.json` 进行自定义配置：

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, must-revalidate"
        }
      ]
    },
    {
      "source": "/(.*)\\.(jpg|jpeg|png|gif|ico|svg|webp)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

**重要提示**：
- **不使用 `regions` 配置**：多区域部署需要 Pro 或 Enterprise 计划，Hobby 计划会自动选择最优区域
- **明确指定 `installCommand`**：使用 `npm install` 而非 `pnpm install`，避免包管理器自动检测错误

### 4.2 .vercelignore

```
# 测试文件
**/*.test.ts
**/*.test.tsx
**/*.spec.ts
coverage/

# 文档
docs/
*.md

# 开发配置
.vscode/
.idea/
*.log

# 依赖
node_modules/
.next/
```

---

## 5. 自定义域名

### 步骤 1：添加域名

1. 进入项目 Settings > Domains
2. 点击 "Add Domain"
3. 输入你的域名（如 `forms.yourdomain.com`）

### 步骤 2：配置 DNS

根据你的域名服务商添加 DNS 记录：

```
类型: CNAME
名称: forms (或 @)
值: cname.vercel-dns.com
```

### 步骤 3：验证 SSL

Vercel 会自动为你的域名配置 Let's Encrypt SSL 证书，通常几分钟内完成。

---

## 6. 环境变量管理

### 环境类型

| 环境 | 说明 | 用途 |
|------|------|------|
| Production | 生产环境 | 正式运行的环境 |
| Preview | 预览环境 | 每个 PR 的预览部署 |
| Development | 开发环境 | 本地开发 |

### 使用环境变量

```typescript
// 客户端可访问（NEXT_PUBLIC_ 前缀）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

// 仅服务端可访问
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
```

---

## 7. 部署工作流

### Git 工作流

```
┌─────────────────────────────────────────────────────────┐
│                      Git 推送                           │
└───────────────────────┬─────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌───────────────┐               ┌───────────────┐
│  main 分支     │               │  PR 分支      │
├───────────────┤               ├───────────────┤
│ → 生产部署    │               │ → 预览部署    │
│ → yourdomain. │               │ → random-url. │
│              com              │          vercel.app│
└───────────────┘               └───────────────┘
```

### 分支保护

在 GitHub 设置中：

1. Settings > Branches
2. 添加规则 `main`
3. 启用 "Require status checks to pass before merging"
4. 选择 "Vercel" 作为必需检查

---

## 8. 性能优化

### 8.1 启用 ISR

```typescript
// app/forms/page.tsx
export const revalidate = 3600 // 每小时重新验证
```

### 8.2 图片优化

```typescript
import Image from 'next/image'

<Image
  src="/logo.png"
  width={200}
  height={100}
  priority // 首屏图片
/>
```

### 8.3 字体优化

```typescript
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})
```

---

## 9. 监控与日志

### Vercel Analytics

```bash
# 安装（使用 npm）
npm install @vercel/analytics

# 或使用 pnpm
# pnpm add @vercel/analytics

# app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 查看日志

1. 进入项目 Dashboard
2. 点击 "Logs" 标签
3. 按时间、状态码筛选
4. 实时查看日志流

---

## 10. 故障排查

### 常见问题

| 问题 | 解决方案 |
|------|----------|
| 构建失败 | 检查 Build Log，确认依赖版本 |
| 环境变量不生效 | 重新部署，确保变量名正确 |
| 图片无法加载 | 检查图片域名配置 |
| API 超时 | 检查 Supabase 连接，考虑使用 Edge Functions |

### 部署错误案例

#### 1. 多区域部署限制错误

**错误信息**：
```
Deploying Serverless Functions to multiple regions is restricted to the Pro and Enterprise plans.
```

**原因**：`vercel.json` 中配置了 `regions: ["sin1", "hkg1"]`，但 Hobby 计划不支持多区域部署。

**解决方案**：删除 `regions` 配置，Vercel 会自动选择最优区域。

#### 2. Header 源模式错误

**错误信息**：
```
Header at index 2 has invalid source pattern "/(.*).(?:jpg|jpeg|png|gif|ico|svg|webp)"
```

**原因**：Vercel 路由模式使用通配符语法，不支持完整的正则表达式非捕获组 `(?:...)`。

**解决方案**：将模式改为 `"/(.*)\\.(jpg|jpeg|png|gif|ico|svg|webp)"`

#### 3. 包管理器自动检测错误

**错误信息**：
```
Error: Command "pnpm install" exited with 1
```

**原因**：项目中没有 `pnpm-lock.yaml`，但 Vercel 自动检测为 pnpm。

**解决方案**：在 `vercel.json` 中明确指定 `"installCommand": "npm install"`

#### 4. 构建错误：组件名称冲突

**错误信息**：
```
Error: the name `DashboardLayout` is defined multiple times
```

**原因**：导入的组件名称与当前函数/组件名称相同。

**解决方案**：重命名其中一个，如 `DashboardRouteLayout`。

#### 5. 构建错误：CSS 字体语法

**错误信息**：
```
Parsing ecmascript source code failed - Expected '</', got 'ident'
```

**原因**：Tailwind 类名中使用 `font-['Space_Grotesk']`，单引号冲突。

**解决方案**：改用双引号 `font-["Space_Grotesk"]`

#### 6. 构建错误：dnd-kit 导入错误

**错误信息**：
```
Export useDrag doesn't exist in target module. Did you mean to import useDraggable?
```

**原因**：`@dnd-kit/core` 的正确导出是 `useDraggable`，不是 `useDrag`。

**解决方案**：将 `import { useDrag }` 改为 `import { useDraggable }`

#### 7. 构建错误：dnd-kit useDraggable onDragStart 属性

**错误信息**：
```
Type error: Object literal may only specify known properties, and 'onDragStart' does not exist in type 'UseDraggableArguments'.
```

**原因**：`@dnd-kit/core` 的 `useDraggable` hook 不接受 `onDragStart` 作为配置参数。

**解决方案**：移除 `onDragStart` 配置，使用 `useEffect` 监听 `isDragging` 状态来触发回调：

```typescript
// 错误写法
const { attributes, listeners, setNodeRef } = useDraggable({
  id: `toolbox-${config.type}`,
  onDragStart: () => handleDragStart(config.type), // ❌ 不支持
})

// 正确写法
const hasCalledDragStart = useRef(false)
const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
  id: `toolbox-${config.type}`,
  data: {
    type: config.type,
    source: 'toolbox',
  },
})

// 使用 useEffect 触发回调
useEffect(() => {
  if (isDragging && !hasCalledDragStart.current) {
    hasCalledDragStart.current = true
    handleDragStart(config.type)
  } else if (!isDragging) {
    hasCalledDragStart.current = false
  }
}, [isDragging, config.type])
```

#### 8. 构建错误：组件名与全局构造函数冲突

**错误信息**：
```
Type error: 'new' expression, whose target lacks a construct signature, implicitly has an 'any' type.
```

**原因**：组件名为 `Date`，与 JavaScript 全局构造函数 `Date` 冲突，导致类型推断错误。

**解决方案**：重命名组件，然后在导出时使用别名：

```typescript
// date.tsx - 重命名组件
export function DateQuestion({ value, onChange, ... }: DateProps) {
  // 组件实现
}

// index.ts - 使用别名导出
export { DateQuestion as Date, DateSkeleton } from './date'
export type { DateProps } from './date'
```

#### 9. 构建错误：联合类型 null 值处理

**错误信息**：
```
Type error: Argument of type 'AnswerValue' is not assignable to parameter of type 'string'.
Type 'null' is not assignable to type 'string'.
```

**原因**：`AnswerValue` 是联合类型 `string | null | string[] | ...`，但函数只接受 `string` 类型。

**解决方案**：使用空值合并运算符 `??` 或可选链 `?.` 处理可能的 null 值：

```typescript
// 错误写法
const inputFormat = toInputFormat(currentValue) // ❌ currentValue 可能是 null
const validationError = validate(currentValue)

// 正确写法
const inputFormat = toInputFormat(currentValue ?? '') // ✅ 提供 fallback
const validationError = validate(currentValue ?? '')
```

#### 10. 预渲染错误：构建时环境变量未设置

**错误信息**：
```
Error occurred prerendering page "/login".
Error: 缺少必需的 Supabase 环境变量。请确保已设置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY。
```

**原因**：浏览器端 Supabase 客户端在构建时被调用，此时环境变量尚未设置。构建时不应该验证环境变量。

**解决方案**：移除环境变量验证，使用空字符串作为 fallback，运行时会有实际值：

```typescript
// 错误写法
function getBrowserSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('缺少必需的 Supabase 环境变量...') // ❌ 构建时会报错
  }
  return { url, key }
}

// 正确写法
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

  if (clientInstance) {
    return clientInstance
  }

  clientInstance = createBrowserClient(url, key)
  return clientInstance
}
```

#### 11. TypeScript 错误：Supabase 回调参数类型缺失

**错误信息**：
```
Type error: Parameter 'event' implicitly has an 'any' type.
./src/components/providers/auth-provider.tsx:105:79
```

**原因**：Supabase `onAuthStateChange` 回调函数的 `event` 参数需要明确的类型注解。

**解决方案**：为回调参数添加类型注解：

```typescript
// 错误写法
supabase.auth.onAuthStateChange(async (event, session) => { // ❌ event 隐式 any 类型

// 正确写法
supabase.auth.onAuthStateChange(
  async (event: 'INITIAL_SESSION' | 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED', session: any) => {

### 获取帮助

- [Vercel 文档](https://vercel.com/docs)
- [Vercel GitHub Discussions](https://github.com/vercel/vercel/discussions)
- [Vercel Discord](https://vercel.com/discord)

---

## 11. 成本估算

### Hobby（免费）

- 适合个人项目和小型应用
- 100GB 带宽/月
- 无限项目

### Pro ($20/月)

- 适合生产环境
- 1TB 带宽/月
- 团队协作功能
- 零配置预览部署

### Enterprise

- 按需定制
- SLA 保证
- 专属支持

---

*文档由 Claude AI 协助创建*
