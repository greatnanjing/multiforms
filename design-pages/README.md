# MultiForms 静态页面

本目录包含 MultiForms 项目的静态 HTML 原型页面，用于演示 UI/UX 设计。

## 目录结构（按角色划分）

```
design-pages/
├── common.css              # 公共样式（设计系统）
├── theme-system.css        # 主题系统（8套主题变量）
├── themes.html             # 主题换肤演示页面
├── README.md               # 本文件
├── public/                 # 公开页面（guest/所有人可访问）
│   ├── landing.html        # 首页
│   ├── login.html          # 用户登录
│   ├── register.html       # 用户注册
│   ├── forgot-password.html # 忘记密码
│   ├── form-view.html      # 表单填写页
│   ├── form-result.html    # 结果展示页
│   ├── password-gate.html  # 密码验证页
│   ├── templates.html      # 模板库
│   └── utility/            # 工具页面
│       ├── 404.html
│       ├── 500.html
│       └── coming-soon.html
├── creator/                # 表单创建者页面（需要登录）
│   ├── dashboard.html      # 仪表盘
│   ├── form-builder.html   # 表单编辑器
│   └── form-analytics.html # 数据分析
└── admin/                  # 管理后台页面（admin专用）
    ├── login.html          # 管理员登录
    ├── dashboard.html      # 仪表盘
    ├── users.html          # 用户管理
    ├── user-detail.html    # 用户详情
    ├── forms.html          # 表单管理
    ├── review.html         # 内容审核
    ├── templates.html      # 模板管理
    ├── settings.html       # 系统设置
    └── logs.html           # 系统日志
```

## 角色说明

### public（公开页面）
- **访问权限**: 所有访客（guest）无需登录即可访问
- **页面类型**: 营销页、认证页、公开表单页、模板库、错误页

### creator（表单创建者）
- **访问权限**: 需要用户登录（role = creator 或 admin）
- **页面类型**: 仪表盘、表单编辑器、数据分析

### admin（管理后台）
- **访问权限**: 仅管理员可访问（role = admin）
- **页面类型**: 用户管理、表单管理、内容审核、系统设置、系统日志

## 页面列表

### Public 页面

#### Landing Page（首页）
- **文件**: `public/landing.html`
- **路由**: `/`
- **功能**: 产品展示、功能介绍、模板展示、用户评价、CTA
- **特点**:
  - 浮动玻璃态导航栏
  - 动态渐变 Hero 区域
  - 产品预览动画
  - 功能卡片网格（3x2）
  - 模板卡片网格（4列）
  - 用户评价轮播
  - 响应式设计

#### Auth Pages（认证页面）

**Login Page（登录页）**
- **文件**: `public/login.html`
- **路由**: `/login`
- **功能**: 用户登录
- **特点**:
  - 居中玻璃态卡片
  - 邮箱/密码输入
  - 社交登录（微信、Google）
  - 忘记密码链接

**Register Page（注册页）**
- **文件**: `public/register.html`
- **路由**: `/register`
- **功能**: 用户注册
- **特点**:
  - 姓名、邮箱输入
  - 密码强度指示器
  - 确认密码验证
  - 服务条款勾选
  - 社交注册选项

**Forgot Password（忘记密码）**
- **文件**: `public/forgot-password.html`
- **路由**: `/forgot-password`
- **功能**: 密码重置
- **特点**:
  - 邮箱输入
  - 发送重置链接
  - 成功状态动画
  - 重新发送功能

#### Form View（表单填写页）
- **文件**: `public/form-view.html`
- **路由**: `/f/:shortId`
- **功能**: 公开表单填写
- **特点**:
  - 居中卡片布局（最大宽640px）
  - 表单头部（Logo、标题、描述）
  - 多种题型展示（单选、评分、多选、文本）
  - 底部固定进度条
  - 上一步/提交导航按钮
  - 完全响应式设计

#### Form Result（结果展示页）
- **文件**: `public/form-result.html`
- **路由**: `/f/:shortId/result`
- **功能**: 公开投票/表单结果展示
- **特点**:
  - 结果统计头部（总投票数、候选人、开放时长）
  - 获奖者高亮卡片（皇冠标识）
  - 排名结果条形图（金、银、铜配色）
  - 评分分布展示（圆形评分图 + 分解条）
  - 分享功能（复制链接、社交媒体）
  - 完全响应式设计

#### Password Gate（密码验证页）
- **文件**: `public/password-gate.html`
- **路由**: 访问受密码保护的表单时
- **功能**: 密码验证访问
- **特点**:
  - 居中卡片布局
  - 锁定图标
  - 表单信息展示
  - 密码输入（显示/隐藏切换）
  - 错误提示
  - 尝试次数警告（可选）
  - 联系创建者入口

#### Templates（模板库）
- **文件**: `public/templates.html`
- **路由**: `/templates`
- **功能**: 模板浏览与使用
- **特点**:
  - 顶部搜索框
  - 分类标签筛选（投票、问卷、评分、反馈、信息收集等）
  - 4列模板卡片网格
  - 模板预览悬停效果
  - 模板元信息（使用次数、评分）
  - 一键使用模板
  - 响应式网格布局

#### Utility Pages（工具页面）

**404 Page（页面未找到）**
- **文件**: `public/utility/404.html`
- **功能**: 404错误页面
- **特点**:
  - 大号404错误码（渐变色）
  - 友好的错误提示
  - 返回首页/上一页按钮
  - 浮动装饰图形

**500 Page（服务器错误）**
- **文件**: `public/utility/500.html`
- **功能**: 500服务器错误页面
- **特点**:
  - 大号500错误码（红色渐变）
  - 系统异常状态指示器
  - 刷新页面/返回首页按钮
  - 客服联系入口

**Coming Soon（即将推出）**
- **文件**: `public/utility/coming-soon.html`
- **功能**: 功能上线倒计时页面
- **特点**:
  - 品牌Logo
  - "即将推出"徽章
  - 倒计时计时器（天、时、分、秒）
  - 邮箱订阅通知表单
  - 社交媒体链接
  - 动态背景装饰

### Creator 页面

#### Dashboard（仪表盘）
- **文件**: `creator/dashboard.html`
- **路由**: `/dashboard`
- **权限**: 需要登录（creator/admin）
- **功能**: 数据概览、快捷操作、最近表单
- **特点**:
  - 侧边栏导航（桌面）/ 底部Tab导航（移动端）
  - Bento Grid 统计卡片（4列布局）
  - 快速开始 CTA 卡片
  - 表单列表卡片（带操作按钮）
  - 通知按钮和用户菜单
  - 完全响应式设计

#### Form Builder（表单编辑器）
- **文件**: `creator/form-builder.html`
- **路由**: `/forms/:id/edit` 或 `/forms/new`
- **权限**: 需要登录（creator/admin）
- **功能**: 拖拽式表单构建
- **特点**:
  - 左侧题型工具箱（280px宽）
  - 9种题型卡片（单选、多选、下拉、评分、滑动条、文本、数字、日期、文件上传）
  - 中央表单预览区（最大宽720px）
  - 题目卡片悬停显示操作按钮
  - 拖拽添加/排序题目
  - 高级功能入口（逻辑跳转、主题样式、隐私设置）
  - 移动端底部抽屉式工具箱

#### Form Analytics（数据分析）
- **文件**: `creator/form-analytics.html`
- **路由**: `/forms/:id/analytics`
- **权限**: 需要登录（creator/admin）
- **功能**: 数据可视化、统计分析、导出
- **特点**:
  - 顶部导航栏（返回、标题、操作按钮）
  - 统计卡片（4列：总回复数、完成率、平均耗时、今日新增）
  - 回复趋势折线图（SVG绘制）
  - 题目统计卡片（横向柱状图、星级分布）
  - 原始回复数据表格
  - 时间范围筛选器
  - 数据导出功能入口

### Admin 页面

#### Admin Login（管理员登录）
- **文件**: `admin/login.html`
- **路由**: `/admin/login`
- **权限**: admin专用
- **功能**: 管理员身份验证
- **特点**:
  - 安全警告提示
  - 访问日志记录提示
  - 紫色渐变主题（区别于前台）

#### Admin Dashboard（管理仪表盘）
- **文件**: `admin/dashboard.html`
- **路由**: `/admin/dashboard`
- **权限**: admin专用
- **功能**: 系统数据总览、快速操作入口
- **特点**:
  - 侧边栏导航（7项）
  - 统计卡片（用户、表单、提交、审核队列）
  - 最近活动列表
  - 待处理事项

#### User Management（用户管理）
- **文件**: `admin/users.html`
- **路由**: `/admin/users`
- **权限**: admin专用
- **功能**: 用户列表、角色管理、状态控制
- **特点**:
  - 搜索和筛选
  - 用户列表（角色标签、状态标签）
  - 批量操作
  - 分页

#### User Detail（用户详情）
- **文件**: `admin/user-detail.html`
- **路由**: `/admin/users/:id`
- **权限**: admin专用
- **功能**: 单个用户详细信息管理
- **特点**:
  - 用户信息卡片
  - 统计数据
  - 操作历史

#### Form Management（表单管理）
- **文件**: `admin/forms.html`
- **路由**: `/admin/forms`
- **权限**: admin专用
- **功能**: 全站表单管理
- **特点**:
  - 表单列表（创建者、类型、状态）
  - 搜索和筛选
  - 批量操作

#### Content Review（内容审核）
- **文件**: `admin/review.html`
- **路由**: `/admin/review`
- **权限**: admin专用
- **功能**: 用户举报内容审核
- **特点**:
  - 举报队列
  - 审核操作（通过/驳回/警告）
  - 举报类型分类

#### Template Management（模板管理）
- **文件**: `admin/templates.html`
- **路由**: `/admin/templates`
- **权限**: admin专用
- **功能**: 官方模板库管理
- **特点**:
  - 统计概览（总模板数、分类数、使用次数、精选数）
  - 搜索和筛选（状态、类型、分类标签）
  - 模板卡片展示（带主题预览色、使用统计）
  - 启用/禁用切换
  - 添加/编辑模板弹窗（含8种主题选择器）
  - 删除确认弹窗
  - **支持实时主题切换**（右上角按钮）

#### System Settings（系统设置）
- **文件**: `admin/settings.html`
- **路由**: `/admin/settings`
- **权限**: admin专用（超级管理员）
- **功能**: 系统配置管理
- **特点**:
  - 功能开关（用户注册、访客创建等）
  - 系统参数配置

#### System Logs（系统日志）
- **文件**: `admin/logs.html`
- **路由**: `/admin/logs`
- **权限**: admin专用（超级管理员）
- **功能**: 操作日志查看
- **特点**:
  - 日志列表（时间、操作人、操作类型）
  - 筛选和搜索
  - 分页

## 设计系统

### 主题换肤系统

MultiForms 支持 **8套主题** 动态切换，通过 CSS 变量实现：

| 主题名称 | 主题标识 | 色调风格 | 适用场景 |
|----------|----------|----------|----------|
| 星云紫 | `nebula` | 神秘优雅的紫色渐变 | 默认主题，通用场景 |
| 海洋蓝 | `ocean` | 清新自然的海洋蓝 | 商务、专业场景 |
| 日落橙 | `sunset` | 温暖活力的橙红色 | 活力、年轻化场景 |
| 森林绿 | `forest` | 自然清新的绿色调 | 环保、健康主题 |
| 樱花粉 | `sakura` | 浪漫柔和的粉紫色 | 情人节、女性向场景 |
| 赛博霓虹 | `cyber` | 未来科技感的霓虹色 | 科技、游戏主题 |
| 极简灰 | `minimal` | 简约专业的灰色调 | 企业、正式场合 |
| 皇家金 | `royal` | 奢华质感的金色调 | 高端、尊贵主题 |

**使用方法**：
```html
<!-- 在 body 上设置 data-theme 属性 -->
<body data-theme="ocean">
  <!-- 页面内容 -->
</body>
```

**预览页面**：打开 [themes.html](themes.html) 可实时预览所有主题效果

### 颜色
- **Primary Gradient**: `#6366F1` → `#8B5CF6`
- **Accent Pink**: `#EC4899`
- **Accent Cyan**: `#06B6D4`
- **Background Primary**: `#0F0F23`
- **Background Secondary**: `#1A1A2E`
- **Text Primary**: `#F8FAFC`
- **Text Secondary**: `#94A3B8`

**Admin 主题色**: `#8B5CF6` → `#EC4899`（紫色渐变，区别于前台）

### 字体
- **Headings**: Space Grotesk (400-700)
- **Body**: DM Sans (400-500)
- **Code**: JetBrains Mono (400-500)

### 效果
- **Glassmorphism**: `backdrop-filter: blur(20px) saturate(180%)`
- **Border Radius**: 8px / 12px / 20px / 24px
- **Animation**: cubic-bezier 缓动函数

### 断点
- **XS**: < 375px
- **SM**: 375px - 640px
- **MD**: 640px - 768px
- **LG**: 768px - 1024px
- **XL**: 1024px - 1280px
- **2XL**: > 1280px

## 使用方法

### 本地预览

直接在浏览器中打开 HTML 文件即可预览：

```bash
# Windows
start public\landing.html

# macOS
open public/landing.html

# Linux
xdg-open public/landing.html
```

### 使用本地服务器

推荐使用本地服务器以避免某些浏览器安全限制：

```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npx http-server

# PHP
php -S localhost:8000
```

然后访问 http://localhost:8000

## 开发对接

### 组件复用

在开发时请参考以下组件规范：

1. **按钮组件**: `btn`, `btn-primary`, `btn-ghost`, `btn-outline`
2. **输入组件**: `input`, `input-with-icon`, `form-group`
3. **卡片组件**: `glass-card`, `feature-card`, `template-card`
4. **导航组件**: `navbar`, `navbar-link`, `navbar-actions`

### 样式变量

所有设计 token 已在 `common.css` 中定义为 CSS 变量，开发时可直接使用：

```css
color: var(--text-primary);
background: var(--bg-secondary);
border-radius: var(--radius-lg);
```

### 动画时长

- **微交互** (hover): 150-200ms
- **状态切换**: 250-300ms
- **页面转场**: 400-500ms

## 注意事项

1. 所有页面均使用深色主题作为默认设计
2. 图标使用 SVG 内联，避免使用 emoji 作为图标
3. 所有交互元素都有 hover 状态
4. 表单输入框都有 focus 状态
5. 页面完全响应式，支持移动端到桌面端

## 页面完成状态

### 主题演示页面
- [x] 主题换肤系统（8套主题）
- [x] 主题演示页面（实时预览）

根据 [静态页面规划文档](../docs/design/06-静态页面规划.md)，所有页面已完成：

### Public（公开页面）
- [x] Landing Page（首页）
- [x] Auth Pages（认证页面：登录、注册、忘记密码）
- [x] Form View（表单填写页）
- [x] Form Result（结果展示页）
- [x] Password Gate（密码验证页）
- [x] Templates（模板库）
- [x] Utility Pages（工具页面：404、500、Coming Soon）

### Creator（表单创建者页面）
- [x] Dashboard（仪表盘）
- [x] Form Builder（表单构建器）
- [x] Form Analytics（数据分析）

### Admin（管理后台页面）
- [x] Admin Login（管理员登录）
- [x] Admin Dashboard（管理仪表盘）
- [x] User Management（用户管理）
- [x] User Detail（用户详情）
- [x] Form Management（表单管理）
- [x] Content Review（内容审核）
- [x] Template Management（模板管理）
- [x] System Settings（系统设置）
- [x] System Logs（系统日志）

---

*设计文档参考: [docs/design/](../docs/design/)*
