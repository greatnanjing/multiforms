# MultiForms 项目文档

> 智能表单云平台 - 5分钟创建专业表单

---

## 文档目录

### 项目核心文档

| 文档 | 说明 |
|------|------|
| [project-context.md](project-context.md) | ⭐ **AI 智能体关键规则** (85+ 实现规则) |
| [supabase-auth-setup.md](supabase-auth-setup.md) | Supabase 认证配置和故障排除 |

### 需求文档 `requirements/`

| 文档 | 说明 |
|------|------|
| [01-业务需求文档-BRD.md](requirements/01-业务需求文档-BRD.md) | 产品概述、用户角色、核心功能、业务流程、成功标准 |
| [02-技术需求文档-TRD.md](requirements/02-技术需求文档-TRD.md) | 技术架构、数据库设计、API设计、安全设计、部署方案 |

### 设计文档 `design/`

| 文档 | 说明 |
|------|------|
| [01-UI-UX设计系统.md](design/01-UI-UX设计系统.md) | 色彩系统、字体系统、Glassmorphism规范、动画规范、Tailwind配置 |
| [02-页面设计规范.md](design/02-页面设计规范.md) | Landing页、Dashboard、Builder、Analytics等页面布局设计 |
| [03-组件设计规范.md](design/03-组件设计规范.md) | 按钮、表单、卡片、导航、反馈、图表等组件详细规范 |
| [04-静态页面规划.md](design/04-静态页面规划.md) | 静态页面的详细规划和规范 |

### 提示词文档 `prompts/`

| 文档 | 说明 |
|------|------|
| [01-静态页面设计提示词.md](prompts/01-静态页面设计提示词.md) | HTML 静态原型页面生成的提示词模板 |
| [02-组件设计提示词.md](prompts/02-组件设计提示词.md) | React 组件设计的提示词模板 |
| [03-功能开发提示词.md](prompts/03-功能开发提示词.md) | 功能模块开发的提示词模板 |
| [04-代码审查提示词.md](prompts/04-代码审查提示词.md) | 代码审查和优化的提示词模板 |

### 部署文档 `deployment/`

| 文档 | 说明 |
|------|------|
| [01-Vercel部署指南.md](deployment/01-Vercel部署指南.md) | Vercel 平台部署配置、环境变量、自定义域名 |
| [02-Supabase配置指南.md](deployment/02-Supabase配置指南.md) | Supabase 项目创建、数据库配置、认证、Storage |

### 开发指南 `development/`

| 文档 | 说明 |
|------|------|
| [README.md](development/README.md) | 开发指南索引 |
| [开发步骤.md](development/开发步骤.md) | 20步完整开发指南，含可执行提示词模板 |

### 静态页面原型 `design-pages/`

| 目录 | 说明 |
|------|------|
| [public/landing.html](../design-pages/public/landing.html) | 产品首页 |
| [public/login.html](../design-pages/public/login.html) | 用户登录 |
| [public/register.html](../design-pages/public/register.html) | 用户注册 |
| [public/forgot-password.html](../design-pages/public/forgot-password.html) | 忘记密码 |
| [public/form-view.html](../design-pages/public/form-view.html) | 表单填写页 |
| [public/form-result.html](../design-pages/public/form-result.html) | 结果展示页 |
| [public/password-gate.html](../design-pages/public/password-gate.html) | 密码验证页 |
| [public/templates.html](../design-pages/public/templates.html) | 模板库 |
| [creator/dashboard.html](../design-pages/creator/dashboard.html) | 创建者仪表盘 |
| [creator/form-builder.html](../design-pages/creator/form-builder.html) | 表单编辑器 |
| [creator/form-analytics.html](../design-pages/creator/form-analytics.html) | 数据分析 |
| [admin/login.html](../design-pages/admin/login.html) | 管理员登录 |
| [admin/dashboard.html](../design-pages/admin/dashboard.html) | 管理仪表盘 |
| [admin/users.html](../design-pages/admin/users.html) | 用户管理 |
| [admin/forms.html](../design-pages/admin/forms.html) | 表单管理 |
| [admin/review.html](../design-pages/admin/review.html) | 内容审核 |
| [admin/templates.html](../design-pages/admin/templates.html) | 模板管理 |
| [admin/settings.html](../design-pages/admin/settings.html) | 系统设置 |
| [admin/logs.html](../design-pages/admin/logs.html) | 系统日志 |
| [public/utility/](../design-pages/public/utility/) | 404/500/Coming Soon |

---

## 快速导航

### 产品概述
MultiForms 是一个面向 C 端用户的智能表单云平台，支持创建投票、评分、调研问卷、信息收集、反馈表等多种类型的表单。

### 核心功能
1. **表单创建** - 拖拽式构建器，支持 10 种题型
2. **模板系统** - 数据库存储的模板库，支持分类和搜索
3. **分享分发** - 自动生成链接和二维码
4. **权限控制** - 公开/私密/密码保护
5. **数据分析** - 实时统计和可视化展示 (Recharts)
6. **主题系统** - 8 种内置主题，支持悬停预览
7. **匿名提交** - 支持未登录用户填写表单

### 技术栈
| 层级 | 技术选型 |
|------|----------|
| 前端 | Next.js 16 (App Router) + React 19 + Tailwind CSS v4 |
| 后端 | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| 状态管理 | Zustand |
| 拖拽 | @dnd-kit |
| 图表 | Recharts |
| 图标 | Lucide React |
| 数据库 | PostgreSQL 16 (Supabase 托管) |
| 部署 | Vercel (前端) + Supabase Cloud (后端) |
| 包管理器 | pnpm |

### 设计风格
| 属性 | 值 |
|------|-----|
| 风格 | Glassmorphism + Bold Gradients |
| 主题 | Dark Mode First |
| 标题字体 | Space Grotesk |
| 正文字体 | DM Sans |
| 主色渐变 | Indigo (#6366F1) → Violet (#8B5CF6) |
| 强调色 | Pink (#EC4899), Cyan (#06B6D4) |

---

## 开发路线图

```
Phase 1: MVP (8周)
├── Week 1-2: 项目搭建 + 用户系统
├── Week 3-4: 表单创建 + 题型实现
├── Week 5-6: 提交收集 + 基础统计
└── Week 7-8: 测试 + 上线

Phase 2: 功能完善 (6周)
├── Week 1-2: 高级题型 + 逻辑跳转
├── Week 3-4: 模板库 + 主题系统
└── Week 5-6: 高级分析 + 数据导出

Phase 3: 高级功能 (8周)
├── Week 1-3: 协作功能
├── Week 4-5: API 开放平台
└── Week 6-8: 第三方集成 + AI 分析
```

---

## 文档版本

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| v1.0 | 2025-01-29 | 初始版本，完成需求文档和设计系统 |
| v1.1 | 2025-01-29 | 添加提示词文档，补充静态页面规划 |
| v2.0 | 2025-01-29 | 技术架构调整：Next.js + Supabase + Vercel |
| v2.1 | 2026-02-09 | 添加模板系统、记住我功能、主题悬停预览；更新实现状态 |

---

*文档由 Claude AI 协助创建*
