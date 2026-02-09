---
project_name: 'multiforms'
user_name: 'Jack'
date: '2026-02-09'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'anti_patterns', 'feature_patterns']
status: 'complete'
rule_count: 95
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

### Core Technologies
- **Next.js**: 16.1.6 (App Router with proxy.ts for middleware)
- **React**: 19.2.3 (with @types/react 19)
- **TypeScript**: 5.9.3 (strict mode enabled)
- **Tailwind CSS**: v4 (using @tailwindcss/postcss)
- **Package Manager**: pnpm (required - see vercel.json)

### Backend & Auth
- **Supabase**: @supabase/ssr 0.8.0 (with PKCE flowType)
- **Auth**: Cookie-based sessions (default storage, NOT custom)

### State & Data
- **Zustand**: 5.0.10 (for auth and theme state)
- **React Hook Form**: 7.71.1 + Zod 4.3.6

### UI & Interaction
- **Drag & Drop**: @dnd-kit 6.3.1
- **Charts**: Recharts 3.7.0
- **Icons**: Lucide React 0.563.0
- **Animation**: Framer Motion 12.29.2

### Architecture & Routing (Next.js 16)
- **CRITICAL**: Next.js 16 uses `proxy.ts` for middleware, NOT `middleware.ts`
- Export default function named `proxy` from `src/proxy.ts`
- Route protection happens server-side via Supabase session in proxy

### React & TypeScript
- React Compiler: **TEMPORARILY DISABLED** due to build issues
- TypeScript strict mode: ALL code must pass strict type checking
- React 19 requires @types/react 19 (not 18)

### Supabase Client Pattern (CRITICAL)
- **THREE distinct clients** for different contexts:
  - `@/lib/supabase/client.ts` - Browser components (uses createBrowserClient)
  - `@/lib/supabase/server.ts` - Server components (uses createServerClient)
  - `@/lib/supabase/route-handler.ts` - API routes
- **CRITICAL**: Browser client uses DEFAULT cookie storage (not custom) for server compatibility
- Auth config includes `flowType: 'pkce'` for enhanced security

### Tailwind CSS v4
- Uses `@tailwindcss/postcss` plugin (NOT tailwindcss v3 plugin)
- Custom CSS variables in `src/app/globals.css` define design system
- 8-theme system requires `data-theme` attribute on BOTH `<html>` and `<body>`

### Package Manager
- **pnpm is REQUIRED** (configured in `vercel.json`)
- Never use npm or yarn for this project

### Dependencies - Key Versions
- @dnd-kit 6.3.1 for drag-drop (NOT react-dnd or dnd-kit-core)
- Zustand 5.0.10 for auth/theme state (NOT Redux or Context API for global state)
- Zod 4.3.6 for validation (NOT yup or Joi)

### Client Component Detection
- Browser client (`@/lib/supabase/client.ts`) throws error if used in server context
- Pattern: `if (typeof window === 'undefined') throw new Error('...')`
- Always use correct client for the execution context

### Auth State Initialization Pattern
- AuthProvider exposes `isInitialized` state
- Components MUST wait for `isInitialized === true` before checking auth state
- Prevents race conditions between auth init and component render
- Pattern: `if (!isInitialized) return <Loading />`

### Proxy Configuration Rules
- `proxy.ts` matcher only protects routes listed in config
- Other routes bypass Supabase client creation entirely
- Public routes with dynamic segments use `pathname.startsWith('/prefix')`
- Static assets detected by `pathname.includes('.')` or `/_next` prefix

### Type Generation Workflow
- Run after database schema changes: `supabase gen types typescript --local > src/lib/database.types.ts`
- Type definitions used for Supabase queries: `Database['public']['Tables']['table_name']['Row']`

---

## Language-Specific Rules

### TypeScript Configuration
- **strict mode enabled**: All code must pass strict type checking
- Path alias: `@/*` maps to `./src/*` - always use for imports
- Target: ES2017 with esnext modules
- JSX: react-jsx mode (no React import needed for JSX)

### Import/Export Conventions
- Components: Use named exports `export function ComponentName() {}`
- Utilities: Use named exports
- Types: Centralized in `src/types/index.ts`
- Avoid default exports for components (use named for better tree-shaking)

### Error Handling Patterns
- **AbortError handling**: Check `error.name === 'AbortError'` or `error.message.includes('abort')` - handle silently
- **Supabase missing table**: Check `error.code === 'PGRST116'` or `error.message.includes('does not exist')` - handle gracefully
- Always use `error instanceof Error` before accessing error properties
- Use try-catch for all async operations, especially Supabase calls

### Async/Await Patterns
- Prefer async/await over Promise chains
- Always await or handle Promise rejections
- Use AbortController for cancellable requests

### Type Safety Rules
- Avoid `any` - use `unknown` when type is truly unknown
- Use Zod schemas for runtime validation of external data
- Supabase types: Use `Database['public']['Tables']['table']['Row']` pattern

---

## Framework-Specific Rules

### 'use client' Directive
- **REQUIRED** for any component using hooks, event handlers, or browser APIs
- Place at very top of file, before imports
- Server components (no hooks) do NOT need this directive

### React Hooks Patterns
- **Zustand selectors**: Use selector functions for performance
  - Bad: `const store = useAuthStore()` (causes re-render on any state change)
  - Good: `const user = useAuthStore((state) => state.user)`
- **useEffect**: Include all dependencies in dependency array
- **useState**: Prefer kebab-case for state variable names

### Component Structure
- Use function components with TypeScript interfaces
- Props interface defined before component: `interface ComponentProps { ... }`
- Export named functions: `export function ComponentName() {}`
- Support dual modes where applicable: `mode?: 'edit' | 'fill'`

### State Management Guidelines
- **Global state**: Use Zustand (authStore, themeStore)
- **Local component state**: Use useState
- **Form state**: Use React Hook Form + Zod validation
- **Server state**: Fetch directly in Server Components or use Supabase client

### Performance Rules
- **Grid layouts**: Use `xl:` breakpoint for 4-column layouts (NOT `lg:`)
  - lg: (1024px) produces cards that are too narrow
  - xl: (1280px) provides appropriate card width
- **Data fetching**: Wait for `isInitialized` before fetching authenticated data
- **Selector optimization**: Use specific selectors instead of entire store

### Next.js 16 Specifics
- **Server Components**: Default (no 'use client' needed)
- **Client Components**: Add 'use client' directive for hooks/interactivity
- **Dynamic rendering**: Use `export const dynamic = 'force-dynamic'` for Supabase routes
- **Image optimization**: Use Next.js Image component for photos (not icons)

### Styling Patterns
- Use CSS variables for theme colors: `var(--primary-start)`, `var(--bg-primary)`
- Glassmorphism: `bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]`
- Border radius tokens: `var(--radius-sm/md/lg/xl)`
- Always use Lucide React icons, NEVER emoji as icons

---

## Testing Rules

### Test Framework (To Be Implemented)
- **E2E Testing**: Playwright 1.58.1 installed but not configured
- **Unit Testing**: No framework currently configured
- Consider adding Vitest for unit/component testing

### Test Organization (When Implemented)
- Place E2E tests in `tests/` or `e2e/` directory
- Place unit tests alongside source files: `Component.test.tsx`
- Use `.spec.ts` suffix for Playwright tests

### Testing Patterns (When Implemented)
- Test Supabase queries with mocked responses
- Test auth flows with test accounts
- Test form submission workflows end-to-end

### Coverage Goals
- No current coverage requirements
- Aim for >80% coverage on critical business logic

---

## Code Quality & Style Rules

### ESLint Configuration
- **Flat Config**: Uses `eslint.config.mjs` (NOT `.eslintrc.*`)
- Based on `eslint-config-next` with typescript and core-web-vitals
- Key overrides:
  - `@typescript-eslint/no-explicit-any: warn` (avoid but allow when necessary)
  - `@typescript-eslint/no-unused-vars: warn`
  - `react-hooks/exhaustive-deps: warn`

### Code Organization
- **App Router Structure**:
  - `(public)/` - Public routes (no auth required)
  - `(dashboard)/` - Protected routes (auth required)
  - `admin/` - Admin routes (admin role required)
- **Components**:
  - `components/landing/` - Landing page sections
  - `components/forms/` - Form-related components
    - `questions/` - Question type components
    - `builder/` - Form builder components
    - `view/` - Public form view components
  - `components/analytics/` - Charts and statistics
  - `components/layout/` - Layout components (navbar, sidebar, etc.)
  - `components/shared/` - Shared components (toast, modal)
- **Lib**: `lib/` for utilities, helpers, API wrappers
- **Stores**: `stores/` for Zustand state management
- **Types**: Centralized in `types/index.ts`

### Naming Conventions
- **Files**: kebab-case (`dashboard-layout.tsx`, `theme-switcher.tsx`)
- **Components**: PascalCase (`DashboardLayout`, `ThemeSwitcher`)
- **Utilities**: camelCase (`cn()`, `getTheme()`, `createClient()`)
- **Types/Interfaces**: PascalCase (`Profile`, `ThemeId`, `QuestionProps`)
- **Constants**: UPPER_SNAKE_CASE for theme IDs, SCREAMING_SNAKE_CASE for env variables

### Documentation Requirements
- **File headers**: Chinese comments at top of file explaining purpose
- **Complex components**: Include usage examples in comments
- **Props interfaces**: Document with JSDoc comments when not self-explanatory

### File Size Guidelines
- Keep components under 300 lines when possible
- Split large components into sub-components
- Extract reusable logic into custom hooks

---

## Development Workflow Rules

### Package Manager
- **pnpm is REQUIRED** (enforced in vercel.json)
- Install: `pnpm install`
- Dev server: `pnpm dev`
- Build: `pnpm build`
- Lint: `pnpm lint`

### Git/Repository Conventions
- **Main branch**: `main`
- **Commit messages**: Use conventional commit format
  - `feat:` for new features
  - `fix:` for bug fixes
  - `refactor:` for code refactoring
  - `docs:` for documentation changes

### Branch Naming (When Implementing)
- Use descriptive branch names: `feature/feature-name` or `fix/bug-name`
- Examples: `feature/admin-templates`, `fix/auth-race-condition`

### Environment Variables
- Required in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Validation in `src/lib/env.ts`
- Never commit `.env.local` to git

### Deployment
- **Platform**: Vercel
- **Build command**: `pnpm build` (handled by Vercel)
- **Deploy URL**: https://multiforms-filc7o0xa-greatnanjings-team.vercel.app/

### Local Development
- Run dev server on port 3000: `pnpm dev`
- Type check: `npx tsc --noEmit`
- Supabase local: `supabase start`

---

## Critical Don't-Miss Rules

### Anti-Patterns to Avoid
- ❌ **NEVER use emoji as icons** - Always use Lucide React icons
- ❌ **NEVER use custom cookie storage** in browser Supabase client - use default storage only
- ❌ **NEVER check auth state before `isInitialized`** - causes race conditions
- ❌ **NEVER use `lg:` breakpoint for 4-column grids** - use `xl:` instead (1280px)
- ❌ **NEVER use `top-16` for admin header** - admin has no navbar, use `top-0`
- ❌ **NEVER set `data-theme` only on `<html>`** - must set on BOTH `<html>` and `<body>`

### Edge Cases to Handle
- **Missing profiles table**: Check `error.code === 'PGRST116'` and handle gracefully
- **AbortError**: Detect with `error.name === 'AbortError'` or `error.message.includes('abort')` - handle silently
- **Login redirect**: Wait ~100ms after signIn for session to establish before redirecting
- **Dashboard loading**: Show loading state until `isInitialized === true`
- **Logout form clearing**: When "Remember me" was unchecked, clear all form fields on logout

### Security Requirements
- **Supabase auth config**: Always include `flowType: 'pkce'` for enhanced security
- **Route protection**: Server-side only - check session in `proxy.ts`, not client-side
- **Admin verification**: Check both `profiles.role` and `user_metadata.role` for admin access
- **Env validation**: Use `src/lib/env.ts` for environment variable validation

### Performance Gotchas
- **Zustand selectors**: Always use specific selectors, never entire store
- **Data fetching timing**: Wait for `isInitialized` before fetching authenticated data
- **Re-renders**: Use `React.memo()` for expensive components when needed
- **Bundle size**: Lazy load heavy components with `next/dynamic`

### Theme System Gotchas
- **Theme application**: Must call `applyTheme()` which sets `data-theme` on both elements
- **Theme preview**: Hover preview in ThemeSwitcher is temporary - requires click to persist
- **Theme storage**: Saved to localStorage as `multiforms-theme`
- **Theme switcher variants**: Use `compact` for navbar with mode toggle, `default` for settings, `minimal` for tight spaces

---

## Feature-Specific Patterns

### Template System
- **Database storage**: Templates stored in `templates` table with JSONB `form_data`
- **Categories**: vote, survey, rating, feedback, collection
- **Admin management**: Only admins can create/edit/delete templates via `/admin/templates`
- **Realtime sync**: Use Supabase Realtime for live template updates
- **Usage tracking**: Increment `usage_count` when user creates form from template
- **Soft delete**: Set `is_active = false` instead of hard delete

### "Remember Me" Feature
- **Storage**: Save preference to localStorage as `multiforms-remember-me`
- **Login flow**: If checked, browser will persist session; if unchecked, session clears on close
- **Logout behavior**: When unchecked, clear form fields after logout
- **Default state**: Unchecked (don't remember by default)

---

## Usage Guidelines

### For AI Agents

- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge

### For Humans

- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

**Last Updated**: 2026-02-09
