# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 🚨 IMPORTANT: Read Project Context First

**Before implementing any code, read `docs/project-context.md`**

The project context file contains critical rules and patterns that AI agents must follow:
- 85+ critical implementation rules
- Technology stack with exact versions
- Framework-specific patterns and conventions
- Anti-patterns to avoid
- Edge cases and security requirements

This ensures consistent, high-quality implementation across all development work.

---

## Project Overview

**MultiForms** is a cloud-based form builder platform targeting C-end users (individuals, small businesses, community operators). Users can create forms for voting, rating, surveys, information collection, and feedback - all through a drag-and-drop interface with no coding required.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router) + React 19 + Tailwind CSS v4 |
| Backend | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| State | Zustand |
| Drag & Drop | @dnd-kit |
| Charts | Recharts |
| Icons | Lucide React |
| Deployment | Vercel (frontend) + Supabase Cloud (backend) |

**Package Manager:** pnpm (required - see `vercel.json`)

---

## Development Commands

```bash
# Install dependencies
pnpm install

# Start dev server (port 3000)
pnpm dev

# Type check
npx tsc --noEmit

# Build for production
pnpm build

# Start production server
pnpm start

# Lint
pnpm lint
```

### Supabase Commands

```bash
# Generate TypeScript types from Supabase
supabase gen types typescript --local > src/lib/database.types.ts

# Push database changes to remote
supabase db push

# Create migration
supabase migration new describe_migration

# Reset local database
supabase db reset
```

---

## Current Implementation Status

**Last Updated:** 2026-02-10 (New logo design, smart CTA navigation)

| Phase | Status | Notes |
|-------|--------|-------|
| Landing Page | ✅ Complete | All sections implemented |
| Layout Components | ✅ Complete | Navbar, Sidebar, TabBar, Admin layouts |
| Auth Pages | ✅ Complete | Login, Register, Admin Login pages |
| Form Builder | ✅ Complete | Drag-and-drop with @dnd-kit |
| Question Types | ✅ Complete | 10 question types implemented |
| Public Form View | ✅ Complete | Form filling with password gate |
| Dashboard | ✅ Complete | Bento grid layout, form cards |
| Analytics | ✅ Complete | Charts with Recharts |
| Theme System | ✅ Complete | 8 themes with hover preview |
| Template System | ✅ Complete | Database-stored templates with admin management |
| Admin Backend | ✅ Complete | Dashboard, Users, Forms, Review, Settings, Logs, Templates |
| Auth Features | ✅ Complete | Remember me, anonymous submission |
| Supabase Integration | ✅ Complete | Auth, middleware, type generation |

See [docs/design/04-静态页面规划.md](docs/design/04-静态页面规划.md#17-实现状态追踪) for detailed component status.

---

## Source Code Architecture

### Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public routes (no auth required)
│   │   ├── layout.tsx            # Public layout with navbar
│   │   ├── login/                # Login page
│   │   └── register/             # Register page
│   ├── (dashboard)/              # Protected routes (auth required)
│   │   ├── layout.tsx            # Dashboard layout (sidebar/tabbar)
│   │   ├── dashboard/            # Dashboard home
│   │   └── forms/[id]/          # Form management
│   │       ├── edit/             # Form builder
│   │       └── analytics/        # Form analytics
│   ├── admin/                    # Admin routes (admin role required)
│   │   ├── dashboard/            # Admin dashboard with stats
│   │   ├── users/                # User management
│   │   ├── forms/                # Form moderation
│   │   ├── review/               # Content review queue
│   │   ├── settings/             # System settings
│   │   ├── logs/                 # Admin operation logs
│   │   └── templates/            # Template management (CRUD)
│   ├── admin-login/              # Admin login page (purple theme)
│   ├── templates/                # Template showcase for users
│   ├── settings/                 # User preferences
│   ├── f/[shortId]/              # Public form view
│   │   └── password-gate/        # Password protection
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   ├── proxy.ts                  # Route protection proxy (Next.js 16)
│   └── globals.css               # Global styles + design system
│
├── components/
│   ├── landing/                  # Landing page sections
│   ├── layout/                   # Layout components (navbar, sidebar, etc.)
│   ├── forms/                    # Form-related components
│   │   ├── questions/            # Question type components
│   │   ├── builder/              # Form builder (drag-drop)
│   │   └── view/                 # Public form view components
│   ├── analytics/                # Charts and statistics
│   ├── admin/                    # Admin-specific components
│   ├── providers/                # React context providers
│   └── shared/                   # Shared components (toast, modal)
│
├── lib/
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts             # Browser client (uses @supabase/supabase-js)
│   │   ├── server.ts             # Server client (RSC)
│   │   └── route-handler.ts      # API route client
│   ├── api/                      # API wrappers
│   │   ├── forms.ts              # Form CRUD
│   │   └── analytics.ts          # Analytics data
│   ├── themes.ts                 # Theme definitions
│   ├── env.ts                    # Environment variable validation
│   ├── utils.ts                  # Utility functions (cn, etc.)
│   └── database.types.ts         # Generated TypeScript types
│
├── stores/                       # Zustand state management
│   ├── authStore.ts              # Auth state
│   └── themeStore.ts             # Theme state
│
├── hooks/
│   └── useAuth.ts                # Auth hook wrapper
│
├── types/                        # TypeScript types
│   └── index.ts                  # Core type definitions
│
└── styles/
    └── theme-system.css          # 8-theme CSS variables
```

---

## Key Architecture Patterns

### Supabase Client Pattern

```tsx
// Client components (browser)
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// Server components (RSC)
import { createClient } from '@/lib/supabase/server'
const supabase = createClient()

// Route handlers (API routes)
import { createClient } from '@/lib/supabase/route-handler'
const supabase = createClient()
```

**Important:** The browser client uses `@supabase/ssr`'s `createBrowserClient` with **default cookie storage** (not custom). This ensures the proxy can correctly read sessions server-side. Auth config includes `flowType: 'pkce'` for enhanced security.

### Route Protection Proxy

Route protection is handled by `src/proxy.ts` (Next.js 16 proxy convention):

```tsx
// Protected routes:
// - /admin/* → Requires admin role (redirects to /admin-login)
// - /dashboard/*, /forms/* → Requires authentication (redirects to /login)
// - /, /login, /register, /f/* → Public (no auth required)

// The proxy checks:
// 1. Session existence via supabase.auth.getSession()
// 2. Admin role via profiles.role === 'admin'
```

### Auth Flow Patterns

To avoid race conditions during login:

1. **Login page** waits 100ms after `signInWithPassword` before redirecting, then verifies session exists
2. **Dashboard** checks `isInitialized` before fetching data to ensure auth state is ready
3. **AuthProvider** uses `onAuthStateChange` with `SIGNED_IN` event for automatic redirects
4. **Profile fetching** is non-blocking (fire-and-forget) to prevent UI delays
5. **"Remember me" functionality** stores session preference, clears form fields on logout if unchecked

```tsx
// Dashboard pattern - wait for isInitialized
const { isAuthenticated, isInitialized } = useAuth()

useEffect(() => {
  if (!isInitialized) return  // Wait for auth init
  if (isAuthenticated) {
    fetchForms()
  }
}, [isInitialized, isAuthenticated])
```

- `(public)` - No authentication required
- `(dashboard)` - Requires authentication (user must be logged in)
- `admin/` - Requires admin role (protected by proxy)

### State Management with Zustand

```tsx
// Auth store example
import { useAuthStore } from '@/stores/authStore'

const { user, signIn, signOut } = useAuthStore()
```

---

## Design System

### Visual Style

- **Keywords**: Modern, Trendy, Youthful, Fun, Efficient, Professional
- **Style**: Glassmorphism + Bold Gradients
- **Theme**: Dark Mode First (with light mode support)

### Color Palette (CSS Variables)

```css
/* Primary Gradient (Nebula - Default) */
--primary-start: #6366F1;  /* Indigo 500 */
--primary-end: #8B5CF6;    /* Violet 500 */
--primary-glow: #A78BFA;   /* Violet 400 */

/* Accent Colors */
--accent-pink: #EC4899;
--accent-cyan: #06B6D4;

/* Dark Mode Backgrounds */
--bg-primary: #0F0F23;
--bg-secondary: #1A1A2E;
--bg-tertiary: #2D2D44;
```

### 8 Built-in Themes

| ID | Name | Colors |
|----|------|--------|
| `nebula` | 星云紫 | `#6366F1 → #8B5CF6` |
| `ocean` | 海洋蓝 | `#0EA5E9 → #06B6D4` |
| `sunset` | 日落橙 | `#F97316 → #EC4899` |
| `forest` | 森林绿 | `#10B981 → #06B6D4` |
| `sakura` | 樱花粉 | `#EC4899 → #F472B6` |
| `cyber` | 赛博霓虹 | `#22D3EE → #A855F7` |
| `minimal` | 极简灰 | `#64748B → #94A3B8` |
| `royal` | 皇家金 | `#F59E0B → #EAB308` |

Themes are applied via `data-theme` attribute on both `<html>` and `<body>` elements.

### Theme Switcher Component

The `ThemeSwitcher` component provides theme switching with hover preview:

```tsx
import { ThemeSwitcher } from '@/components/layout/theme-switcher'

// Compact variant with mode toggle (for navbar)
<ThemeSwitcher variant="compact" showModeToggle={true} />

// Default variant (for settings pages)
<ThemeSwitcher variant="default" />

// Minimal variant (for tight spaces)
<ThemeSwitcher variant="minimal" />
```

**Hover Preview Behavior:**
- Hover over theme button → expands to show all 8 themes
- Hover over a theme row → page colors change in real-time (temporary preview)
- Click a theme row → permanently selects the theme (saves to store + localStorage)
- Mouse leave without clicking → restores original theme

**Timing:**
- Expand delay: None (instant)
- Theme preview: Instant (no delay)
- Close delay: 150ms (prevents accidental close)
- Transition animation: 200ms

### Theme Utility Functions

```tsx
import { getTheme, getAllThemes, applyTheme, getPreferredTheme, saveThemePreference } from '@/lib/themes'

// Get a specific theme configuration
const theme = getTheme('ocean')

// Get all available themes
const allThemes = getAllThemes()

// Apply theme to DOM (sets data-theme on both html and body)
applyTheme('sunset')

// Get user's preferred theme (from localStorage or default)
const preferredTheme = getPreferredTheme()

// Save theme preference to localStorage
saveThemePreference('forest')
```

**Important:** The `applyTheme()` function sets the `data-theme` attribute on BOTH `document.documentElement` and `document.body` to ensure CSS selectors `[data-theme="xxx"]` work correctly regardless of which element they target.

### Typography

| Usage | Font | Weights |
|-------|------|---------|
| Headings | Space Grotesk | 500-700 |
| Body | DM Sans | 400-500 |
| Code | JetBrains Mono | 400-500 |

### Glassmorphism Pattern

```tsx
className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl"
```

### Border Radius Tokens

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 20px;
--radius-xl: 24px;
```

---

## Component Patterns

### Question Types

All question types in `src/components/forms/questions/` follow this pattern:
- Accept `question`, `value`, `onChange`, `disabled` props
- Support both edit mode (builder) and view mode (public form)
- Use consistent glassmorphism styling

### Form Builder Pattern

The form builder uses `@dnd-kit` for drag-and-drop:
- `question-toolbox.tsx` - Draggable question type cards
- `question-card.tsx` - Rendered questions with edit controls
- `form-preview.tsx` - Central preview area
- `property-panel.tsx` - Right sidebar for editing question properties
- `mobile-drawer.tsx` - Bottom drawer for mobile

### Dashboard Cards

Bento grid layout using CSS Grid:
```tsx
// Use xl: instead of lg: for 4-column layouts to avoid narrow cards
className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
```

**Note:** The `lg:` breakpoint (1024px) was found to produce cards that are too narrow. Use `xl:` (1280px) for 4-column layouts.

### Dashboard Layout

The dashboard layout includes:
- Sidebar navigation (collapsible on mobile)
- Header with return-to-home button and user greeting
- Tab bar for mobile navigation

**Return Home Button:**
```tsx
// The dashboard header includes a return-to-home button
<Link href="/" className="flex items-center gap-1.5...">
  <Home className="w-4 h-4" />
  <span className="hidden sm:inline">首页</span>
</Link>
```

---

## Admin Backend

The admin backend (`/admin/*`) provides comprehensive administrative capabilities:

| Page | Path | Purpose |
|------|------|---------|
| Admin Login | `/admin-login` | Dedicated admin login with purple gradient theme |
| Dashboard | `/admin/dashboard` | Stats overview (users, forms, submissions, storage) |
| User Management | `/admin/users` | View, search, ban/unban users |
| Form Moderation | `/admin/forms` | View, ban, delete forms |
| Content Review | `/admin/review` | Process user reports and content moderation |
| System Settings | `/admin/settings` | Configure site parameters and feature toggles |
| Operation Logs | `/admin/logs` | View admin actions and audit trail |
| Template Management | `/admin/templates` | CRUD operations for form templates |

### Admin Layout

- Uses `AdminLayout` component in `src/components/layout/admin-layout.tsx`
- Sidebar navigation with collapsible mobile menu
- Header with gradient styling (purple/violet theme)
- Sticky positioning: `sticky top-0` (not `top-16` - admin has no navbar)

### Error Handling for Missing Tables

The admin pages gracefully handle missing database tables (e.g., `profiles`):

```tsx
// Pattern used in authStore and admin-login
try {
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()
  isAdmin = profile?.role === 'admin'
} catch (err) {
  // Fallback to user metadata
  const userMetadata = data.user.user_metadata
  isAdmin = userMetadata?.role === 'admin'
}
```

---

## User Roles & Access Control

| Role | Access | Key Restrictions |
|------|--------|------------------|
| **Guest** | Public pages, form filling, limited form creation | 3 forms/month, 5 basic question types, 100 responses/form |
| **Creator** | All guest features + dashboard, analytics, export | No limits on forms, all question types, data export |
| **Admin** | All creator features + admin backend | User management, content moderation, system settings |

**Route Prefixes:**
- `/` - Public pages
- `/login`, `/register` - Authentication (unauthenticated)
- `/dashboard`, `/forms/*` - Creator app (authenticated)
- `/f/:shortId` - Public form viewing
- `/admin` - Admin login (admin only)
- `/admin/*` - Admin backend (admin only)

---

## Important Design Principles

1. **No Emoji as Icons** - Use Lucide React icons
2. **Hover States** - All interactive elements need hover feedback
3. **No Layout Shift** - Hover effects should not cause layout shifts
4. **Brand Gradients** - Use `from-[#6366F1] to-[#8B5CF6]` pattern
5. **Moderate Glassmorphism** - Apply thoughtfully, not everywhere
6. **Chinese Language** - Primary language is Simplified Chinese (zh-CN)
7. **Client Components** - Use `'use client'` for interactive components (hooks, event handlers)

---

## HTML Prototypes (Reference)

The `design-pages/` directory contains static HTML prototypes for visual reference:

```
design-pages/
├── public/         # Landing, login, register, form view
├── creator/        # Dashboard, form builder, analytics
└── admin/          # Admin backend pages
```

All pages share `common.css` which defines the design system. Reference these for exact styling when implementing new features.

---

## Environment Variables

Required in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

Validation is in `src/lib/env.ts`.

---

## Documentation Reference

| Document | Purpose |
|----------|---------|
| **[docs/project-context.md](docs/project-context.md)** | **CRITICAL: AI Agent implementation rules (85+ rules)** |
| [docs/README.md](docs/README.md) | Main documentation index and roadmap |
| [docs/supabase-auth-setup.md](docs/supabase-auth-setup.md) | Email verification setup, redirect URLs |
| [docs/design/04-静态页面规划.md](docs/design/04-静态页面规划.md) | Page specifications + implementation status |
| [docs/development/开发步骤.md](docs/development/开发步骤.md) | 20-step development guide |
| [docs/design/01-UI-UX设计系统.md](docs/design/01-UI-UX设计系统.md) | Complete design system |
| [docs/requirements/02-技术需求文档-TRD.md](docs/requirements/02-技术需求文档-TRD.md) | Database schema, RLS policies |

---

## Deployment

- **Platform**: Vercel
- **Package Manager**: pnpm (configured in `vercel.json`)
- **Framework**: Next.js 16 with App Router
- **Deploy URL**: https://multiforms-filc7o0xa-greatnanjings-team.vercel.app/

---

## Troubleshooting

### Login Rendering Issues (Double Refresh Required)

If login requires a page refresh to reach dashboard:
1. This is caused by race condition between login redirect and auth provider initialization
2. Fixed by: login page waits for session before redirecting; dashboard waits for `isInitialized`
3. Check that `useAuth()` includes `isInitialized` in protected pages

### Email Verification Link Expires

Error: `access_denied&error_code=otp_expired`
- Add your dev URL to Supabase Dashboard → Authentication → URL Configuration → Redirect URLs
- Example: `http://localhost:3000/auth/callback`
- See [docs/supabase-auth-setup.md](docs/supabase-auth-setup.md) for details

### Browser Cache Issues

If layout appears broken in Chrome but works in Edge:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Try incognito mode

### Admin Layout Header Gap

If admin header has white space above it:
- Check header uses `sticky top-0`, NOT `sticky top-16`
- The `top-16` assumes a navbar that doesn't exist in admin layout

### Console "Failed to fetch profile" Errors

These are expected when `profiles` table doesn't exist yet:
- `authStore.ts` handles this gracefully with `console.warn`
- Falls back to `user_metadata.role` for admin checks

### TypeScript Type Errors

For `AuthChangeEvent` type mismatches:
- Use `string` or `any` type for the event parameter in auth listeners
- Supabase types may not always align with actual values received
