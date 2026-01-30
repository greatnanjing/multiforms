# MultiForms 变更日志

本文档记录项目的重要变更。

## [未发布]

### 安全性改进

- **密码验证**: 移除 `password-gate.tsx` 中的 `demo123` 后门密码
- **环境变量验证**: 新增 `src/lib/env.ts`，提供环境变量安全访问工具
- **ID 生成**: 使用 `crypto.getRandomValues()` 替代 `Math.random()` 生成更安全的随机 ID

### 新增组件

- **Toast** (`src/components/shared/toast.tsx`): 替代原生 `alert()`，提供美观的通知提示
- **ConfirmDialog** (`src/components/shared/confirm-dialog.tsx`): 替代原生 `confirm()`，提供可自定义的确认对话框
- **ErrorBoundary** (`src/components/error-boundary.tsx`): 捕获 React 组件错误，防止应用崩溃

### 类型安全修复

- **Date 组件**: 修复 `toInputFormat` 和 `validate` 函数对 `null`/`undefined` 的处理
- **AuthProvider**: 添加 Supabase 用户属性的 `null`/`undefined` 回退
- **文件上传**: 使用 `as unknown as AnswerValue` 双重断言修复类型转换
- **类型导出**: 从 `lib/providers` 导出 `ThemeId` 和 `ThemeMode` 类型

### 代码质量改进

- **请求取消**: 在 `f/[shortId]/page.tsx` 中添加 `AbortController` 防止组件卸载后状态更新
- **文件上传**: 移除 `alert()`，使用自定义 Toast 组件显示错误信息

### 文档更新

- **组件设计规范**: 添加 `ConfirmDialog` 和 `ErrorBoundary` 组件文档
- **变更日志**: 新建此文件记录项目变更

## [1.0.0] - 2026-01-29

### 初始版本

- 完整的表单构建系统
- 8 种内置主题
- 13 种题目类型
- 用户认证系统 (Supabase)
- 响应式设计
