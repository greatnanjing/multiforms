# Supabase 本地开发配置指南

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
