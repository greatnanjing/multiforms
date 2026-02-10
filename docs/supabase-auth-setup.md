# Supabase 认证配置指南

本文档包含邮箱验证和 GitHub OAuth 登录的配置说明。

---

## 问题：邮箱验证链接过期或无效

当你看到以下错误时：
```
error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired
```

这是因为 Supabase 生成的邮件验证链接中的 `redirect_to` 参数与 Supabase 项目配置的 Site URL 不匹配。

## 解决方案

### 方法 1：配置 Supabase 项目的 Redirect URLs（推荐）

1. 登录 [Supabase Dashboard](https://app.supabase.io)
2. 选择你的项目
3. 进入 **Authentication** → **URL Configuration**
4. 在 **Redirect URLs** 中添加：
   ```
   http://localhost:3002/auth/callback
   ```
   （根据你实际的端口调整）

### 方法 2：使用 Site URL

1. 在 **Site URL** 中设置为你的开发环境地址：
   ```
   http://localhost:3002
   ```

### 方法 3：禁用邮箱验证（仅开发环境）

如果你不想处理邮箱验证，可以在 Supabase 中禁用它：

1. 进入 **Authentication** → **Providers**
2. 找到 **Email** 提供商
3. 关闭 **Confirm email** 选项

## 本地开发注意事项

1. **端口变化**：Next.js 在端口被占用时会自动使用其他端口（如 3001、3002 等）
   - 确保 Supabase 配置中的 URL 与实际运行端口匹配

2. **邮件捕获**：在开发环境中，Supabase 不会真正发送邮件，你可以在 Dashboard 的 **Authentication** → **Users** 中查看邮件内容

3. **直接验证**：在开发环境中，你可以：
   - 注册后查看 Supabase Dashboard 的 Users 页面
   - 手动确认用户邮箱
   - 或者直接登录（如果禁用了邮箱验证）

## 测试流程

1. 确保 Supabase 项目配置了正确的 Redirect URL
2. 注册账号
3. 在 Supabase Dashboard 中查看确认邮件
4. 点击邮件中的链接，或者复制链接在浏览器中打开
5. 应该成功跳转到 `/auth/callback` 然后到 `/dashboard`

## 生产环境配置

生产环境需要配置正确的域名：

```
Site URL: https://yourdomain.com
Redirect URLs:
  - https://yourdomain.com/auth/callback
```

## 常见问题

### Q: 为什么邮件链接显示已过期？
A: 因为链接中的 `redirect_to` 参数与 Supabase 配置不匹配。Supabase 为了安全会拒绝这些链接。

### Q: 如何重新发送验证邮件？
A: 在登录页面点击"重新发送验证邮件"，或者调用 `supabase.auth.resend({
  type: 'signup',
  email: 'user@example.com'
})`

### Q: 可以跳过邮箱验证吗？
A: 在 Supabase 的 Auth Settings 中可以禁用邮箱验证，但生产环境不建议这样做。

---

## GitHub OAuth 配置

### 启用 GitHub 提供商

1. 登录 [Supabase Dashboard](https://app.supabase.io)
2. 选择你的项目
3. 进入 **Authentication** → **Providers**
4. 找到 **GitHub** 提供商
5. 点击启用，并记下 **Client ID** 和 **Redirect URL**

### 在 GitHub 创建 OAuth App

1. 登录 GitHub，进入 **Settings** → **Developer settings** → **OAuth Apps**
2. 点击 **New OAuth App**
3. 填写以下信息：
   - **Application name**: MultiForms (或你喜欢的名称)
   - **Homepage URL**: `http://localhost:3000` (开发环境)
   - **Authorization callback URL**: 从 Supabase Dashboard 复制的 Redirect URL
4. 创建后记下 **Client ID** 和生成 **Client Secret**

### 配置 Supabase

回到 Supabase Dashboard：

1. 在 GitHub provider 设置中：
   - 填入 **Client ID**
   - 填入 **Client Secret**
2. 保存设置

### 环境变量

确保 `.env.local` 中包含：
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

### 本地开发测试

1. 启动开发服务器：`pnpm dev`
2. 访问登录页面，点击 GitHub 登录按钮
3. 应该跳转到 GitHub 授权页面
4. 授权后自动跳转回 `/auth/callback`，然后到 `/dashboard`

### 生产环境配置

生产环境需要创建新的 GitHub OAuth App：

1. 在 GitHub 创建新的 OAuth App
2. **Homepage URL**: `https://yourdomain.com`
3. **Authorization callback URL**: Supabase 生产环境的 Redirect URL
4. 在 Supabase 生产项目中配置新的 Client ID 和 Secret

### OAuth 流程详解

详细的 GitHub OAuth 登录流程请参考 [docs/github-oauth-flow.md](github-oauth-flow.md)

关键点：
- GitHub Access Token 只在 Supabase 后端使用
- 前端只收到 Supabase Session JWT（通过 HttpOnly Cookie）
- Client Secret 只用于 Supabase ↔ GitHub 的服务器通信

### 常见问题

**Q: GitHub 登录后没有跳转回应用？**
A: 检查 GitHub OAuth App 的 Authorization callback URL 是否与 Supabase 配置一致。

**Q: 提示 "Application was not registered" 错误？**
A: 确保 GitHub OAuth App 的 Homepage URL 和 Callback URL 配置正确。

**Q: 如何获取用户的 GitHub 信息？**
A: 登录成功后，用户信息存储在 `user.user_metadata` 中，包含 avatar_url、name 等字段。

