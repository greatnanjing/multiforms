# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**MultiForms** is a cloud-based form builder platform targeting C-end users (individuals, small businesses, community operators). Users can create forms for voting, rating, surveys, information collection, and feedback - all through a drag-and-drop interface with no coding required.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router) + React + Tailwind CSS + shadcn/ui |
| Backend | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| Database | PostgreSQL 16 (hosted on Supabase) |
| Deployment | Vercel (frontend) + Supabase Cloud (backend) |

**Architecture Pattern:** Full-stack Serverless with Next.js App Router and Supabase BaaS

### Current State

The project is in **documentation/design phase**. Implementation has not yet begun. The repository contains:
- `docs/` - Complete requirements, design documentation, and deployment guides
- `design-pages/` - **Static HTML prototypes** organized by user role (public, creator, admin)

Static pages are fully functional and can be used as visual references for implementation.

### Quick Start: AI-Assisted Development

To begin implementation using the 20-step development guide:

1. **Open** [docs/development/开发步骤.md](docs/development/开发步骤.md)
2. **Copy** the "执行提示词" from Step 1
3. **Paste** into Claude Code
4. **Review** the auto-verification results
5. **Continue** to the next step

Each step includes auto-verification that runs `npx tsc --noEmit` and `pnpm build` to ensure code quality.

---

## Documentation Structure

```
docs/
├── requirements/
│   ├── 01-业务需求文档-BRD.md      # Product requirements, user roles, core features
│   └── 02-技术需求文档-TRD.md      # Technical architecture, database schema, API design
├── design/
│   ├── 01-UI-UX设计系统.md         # Design system: colors, typography, glassmorphism
│   ├── 02-页面设计规范.md          # Page layouts and structure
│   ├── 03-组件设计规范.md          # Component specifications
│   └── 04-静态页面规划.md          # Static page planning
├── deployment/
│   ├── 01-Vercel部署指南.md        # Vercel platform deployment guide
│   └── 02-Supabase配置指南.md      # Supabase setup and configuration
├── prompts/                        # AI prompt templates for development
│   ├── 01-静态页面设计提示词.md     # HTML static page generation prompts
│   ├── 02-组件设计提示词.md         # React component design prompts
│   ├── 03-功能开发提示词.md         # Feature module development prompts
│   └── 04-代码审查提示词.md         # Code review and optimization prompts
└── README.md                        # Documentation index
```

**AI Prompt Templates:** The `docs/prompts/` directory contains reusable prompt templates for AI-assisted development. Each template includes an auto-verification block:

```
【自动验证】
完成后请自动执行以下验证：
1. 检查所有文件是否已创建
2. 运行 npx tsc --noEmit 检查类型错误
3. 运行 pnpm build 检查构建是否成功
4. 报告验证结果，如有问题请修复
```

**Always reference these documents when making design or implementation decisions.**

---

## Design System

### Visual Style

- **Keywords**: Modern, Trendy, Youthful, Fun, Efficient, Professional
- **Style**: Glassmorphism + Bold Gradients
- **Theme**: Dark Mode First (with light mode support)

### Color Palette

```css
/* Primary Gradient */
--primary-start: #6366F1  /* Indigo 500 */
--primary-end:   #8B5CF6  /* Violet 500 */
--primary-glow:  #A78BFA  /* Violet 400 */

/* Accent Colors */
--accent-pink:  #EC4899  /* Pink 500 */
--accent-cyan:  #06B6D4  /* Cyan 500 */

/* Dark Mode (Default) */
--bg-primary:   #0F0F23
--bg-secondary: #1A1A2E
--bg-tertiary:  #2D2D44
--text-primary: #F8FAFC
--text-secondary: #94A3B8
```

### Typography

| Usage | Font | Weights |
|-------|------|---------|
| Headings (H1-H6) | Space Grotesk | 500-700 |
| Body | DM Sans | 400-500 |
| Code/Data | JetBrains Mono | 400-500 |

**Google Fonts import:**
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Glassmorphism Effect

```css
.glass-card {
  background: rgba(26, 26, 46, 0.6);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
}
```

### Border Radius Tokens

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 20px;
--radius-xl: 24px;
```

### Theme System (8 Built-in Themes)

MultiForms includes a dynamic theme switching system with 8 built-in themes:

| Theme | ID | Colors | Use Case |
|-------|-------|--------|----------|
| 星云紫 | `nebula` | `#6366F1 → #8B5CF6` | Default, general purpose |
| 海洋蓝 | `ocean` | `#0EA5E9 → #06B6D4` | Business, professional |
| 日落橙 | `sunset` | `#F97316 → #EC4899` | Energetic, youth-oriented |
| 森林绿 | `forest` | `#10B981 → #06B6D4` | Eco, health topics |
| 樱花粉 | `sakura` | `#EC4899 → #F472B6` | Romantic, feminine |
| 赛博霓虹 | `cyber` | `#22D3EE → #A855F7` | Tech, gaming |
| 极简灰 | `minimal` | `#64748B → #94A3B8` | Corporate, formal |
| 皇家金 | `royal` | `#F59E0B → #EAB308` | Premium, luxury |

**Implementation:**
- Themes use CSS variables with `data-theme` attribute on `<body>`
- All theme colors cascade to buttons, inputs, charts, and UI components
- Real-time preview available in form builder and admin template management
- See [design-pages/themes.html](design-pages/themes.html) for live demo

### Animation Timing

```css
--ease-out: cubic-bezier(0.33, 1, 0.68, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

**Durations:**
- Micro-interactions (hover): 150-200ms
- State transitions: 250-300ms
- Page transitions: 400-500ms

---

## User Roles & Access Control

MultiForms has three account types with different permissions:

| Role | Access | Key Restrictions |
|------|--------|------------------|
| **Guest** | Public pages, form filling, limited form creation | 3 forms/month, 5 basic question types, 100 responses/form |
| **Creator** | All guest features + dashboard, analytics, export | No limits on forms, all question types, data export |
| **Admin** | All creator features + admin backend | User management, content moderation, system settings |

**Route Prefixes:**
- `/` - Public pages (all users)
- `/login`, `/register` - Authentication (unauthenticated)
- `/dashboard`, `/forms/*` - Creator app (authenticated creators/admins)
- `/templates` - Template library (all users)
- `/profile` - User profile (authenticated users)
- `/f/:shortId` - Public form viewing (all users)
- `/admin` - Admin login (admin only)
- `/admin/*` - Admin backend (admin only)

See [docs/requirements/01-业务需求文档-BRD.md](docs/requirements/01-业务需求文档-BRD.md) for detailed permissions matrix.

---

## Page Architecture

### Public Pages
- **Landing Page** (`/`) - Hero + Features + Templates + CTA
- **Login** (`/login`), **Register** (`/register`), **Forgot Password** (`/forgot-password`)
- **Templates** (`/templates`) - Template library

### App Pages (Authenticated)
- **Dashboard** (`/dashboard`) - Bento Grid layout with stats and recent forms
- **Form Builder** (`/forms/:id/edit`) - Drag-and-drop form builder
- **Form Analytics** (`/forms/:id/analytics`) - Charts and data visualization
- **Form Settings** (`/forms/:id/settings`)
- **Profile** (`/profile`)

### Public Form Pages
- **Form View** (`/f/:shortId`) - Form filling page
- **Form Result** (`/f/:shortId/result`) - Public results page
- **Password Gate** - For password-protected forms

See [docs/design/04-静态页面规划.md](docs/design/04-静态页面规划.md) for detailed page specifications.

---

## Component Categories

| Category | Components |
|----------|------------|
| Navigation | Navbar, Sidebar, TabBar, Breadcrumb |
| Buttons | Button, IconButton, ButtonGroup |
| Forms | Input, Textarea, Select, Checkbox, Radio, Switch, Slider, DatePicker, FileUpload, Matrix, Sorting |
| Cards | StatCard, FormCard, FeatureCard |
| Feedback | Toast, Modal, Alert, Loading |
| Charts | LineChart, BarChart, PieChart, ProgressBar |
| Display | Avatar, Badge, Tag, EmptyState |

See [docs/design/03-组件设计规范.md](docs/design/03-组件设计规范.md) for detailed component specifications.

---

## Responsive Breakpoints

```css
--breakpoint-xs: 375px;   /* Small phones */
--breakpoint-sm: 640px;   /* Phones */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Small laptops */
--breakpoint-xl: 1280px;  /* Desktops */
```

**Mobile First** approach is recommended.

---

## Form Types & Question Types

### Form Types
- **投票** (Vote) - Single/multiple choice voting
- **评分** (Rating) - Star/number ratings
- **调研问卷** (Survey) - Multi-question surveys with logic jumps
- **信息收集** (Collection) - Registration, information gathering
- **反馈表** (Feedback) - User feedback collection

### Question Types
- Single Choice (单选题)
- Multiple Choice (多选题)
- Dropdown (下拉选择)
- Rating (评分题) - Stars/Number/Slider
- Text (文本题) - Single/Multi-line
- Number (数字题)
- Date (日期题)
- Email/Phone (联系题)
- File Upload (文件上传)
- Matrix (矩阵题)
- Sorting (排序题)

---

## Database Schema (Key Tables)

**Supabase Architecture:**
- `auth.users` - Managed by Supabase Auth (authentication)
- `public.profiles` - User profile extensions (linked to auth.users)
- `public.forms` - Form definitions with RLS policies
- `public.form_questions` - Form questions with RLS policies
- `public.form_submissions` - Form responses with RLS policies
- `public.uploaded_files` - File upload records
- `public.guest_forms` - Guest-created forms
- `public.notifications` - User notifications
- `public.templates` - Template library
- `public.admin_logs` - Admin operation logs
- `public.content_reviews` - Content moderation records
- `public.system_settings` - System configuration

**Row Level Security (RLS)** is enabled on all `public` tables. Policies use `auth.uid()` to enforce data isolation - users can only access their own data unless explicitly shared (e.g., published forms).

See [docs/requirements/02-技术需求文档-TRD.md](docs/requirements/02-技术需求文档-TRD.md) for complete schema with RLS policies.

---

## HTML Prototypes

The `design-pages/` directory contains static HTML prototypes organized by user role:

```
design-pages/
├── common.css              # Shared design system (CSS variables, glassmorphism)
├── theme-system.css        # 8-theme system CSS variables
├── themes.html             # Live theme switching demo page
├── README.md               # Detailed page documentation
├── public/                 # Public pages (no auth required)
│   ├── landing.html
│   ├── login.html
│   ├── register.html
│   ├── forgot-password.html
│   ├── form-view.html
│   ├── form-result.html
│   ├── password-gate.html
│   ├── templates.html
│   └── utility/           # Error pages
│       ├── 404.html
│       ├── 500.html
│       └── coming-soon.html
├── creator/               # Creator dashboard pages (auth required)
│   ├── dashboard.html
│   ├── form-builder.html
│   └── form-analytics.html
└── admin/                 # Admin backend pages (admin only)
    ├── login.html
    ├── dashboard.html
    ├── users.html
    ├── user-detail.html
    ├── forms.html
    ├── review.html
    ├── templates.html
    ├── settings.html
    └── logs.html
```

All pages share `common.css` which defines the design system (CSS variables, typography, glassmorphism effects). The `theme-system.css` contains all 8 theme variable definitions. See [design-pages/README.md](design-pages/README.md) for detailed documentation.

### Previewing Static Pages

```bash
# Direct open (Windows)
start design-pages/public/landing.html

# Local server (recommended)
python -m http.server 8000 --directory design-pages
# Then visit http://localhost:8000
```

**When implementing components, reference these HTML files for exact styling.**

---

## Icon Library

Use **Lucide** or **Heroicons** for consistent iconography. Avoid using emoji as icons.

---

## Accessibility Standards

- Text contrast: Minimum 4.5:1 for body text
- Focus states: Visible outline on all interactive elements
- Reduced motion: Respect `prefers-reduced-motion` setting
- Form labels: All inputs must have associated labels

---

## Important Design Principles

1. **No Emoji as Icons** - Use proper SVG icons from Lucide/Heroicons
2. **Hover States** - All interactive elements need hover feedback
3. **No Layout Shift** - Hover effects should not cause layout shifts
4. **Brand Gradients** - Use the defined gradient colors, not random colors
5. **Moderate Glassmorphism** - Apply glass effects thoughtfully, not everywhere
6. **Chinese Language** - Primary language is Simplified Chinese (zh-CN)

---

## Development Commands

### Development Workflow with AI

The project includes **AI-assisted development guides** with auto-verification:

| Document | Purpose |
|----------|---------|
| [docs/development/开发步骤.md](docs/development/开发步骤.md) | 20-step implementation guide with executable prompts |
| [docs/prompts/](docs/prompts/) | Reusable AI prompt templates for components, features, and code review |

**Auto-Verification**: Each development step includes a `【自动验证】` section that instructs AI to automatically:
1. Check required files exist
2. Run `npx tsc --noEmit` for type checking
3. Run `pnpm build` to verify successful build
4. Report results and auto-fix issues

When using AI for development, always include the auto-verification block from the prompt templates.

### Project Initialization (When Ready)

```bash
# Create Next.js project with pnpm
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Install core dependencies
pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs
pnpm add zustand react-hook-form zod @dnd-kit/core framer-motion recharts lucide-react
pnpm add -D @supabase/cli

# Install shadcn/ui (interactive)
pnpm dlx shadcn@latest init
```

### Local Development

```bash
# Install dependencies
pnpm install

# Start Next.js dev server
pnpm dev

# Start Supabase local stack (for local database testing)
supabase start

# Generate TypeScript types from Supabase
supabase gen types typescript --local > src/lib/database.types.ts
```

### Database Operations

```bash
# Push database changes to remote
supabase db push

# Create a new migration
supabase migration new describe_migration

# Reset local database
supabase db reset
```

### Deployment

```bash
# Deploy to Vercel (via CLI)
vercel --prod

# Deploy Supabase Edge Functions
supabase functions deploy
```

See [docs/deployment/01-Vercel部署指南.md](docs/deployment/01-Vercel部署指南.md) and [docs/deployment/02-Supabase配置指南.md](docs/deployment/02-Supabase配置指南.md) for complete deployment instructions.
