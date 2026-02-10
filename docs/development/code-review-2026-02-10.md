# 代码审查日志 - 2026-02-10

## 概述

**审查范围**: 表单构建器组件 (Form Builder)
**审查方法**: 对抗性代码审查 (Adversarial Code Review)
**审查工具**: bmad-gds-code-review
**审查人**: Claude AI

---

## 修复的问题 (9个)

### 🔴 HIGH 严重问题 (3个)

| # | 问题 | 文件 | 修复 |
|---|------|------|------|
| 1 | 密码输入框使用 `type="text"` 暴露密码 | form-preview.tsx:232 | `type="password"` + 长度验证 |
| 2 | 排序题类型映射不支持字符串数组 | question-renderer.tsx:160 | 添加类型检查 |
| 3 | 缺少密码长度验证 | form-preview.tsx:241 | `minLength={4}` |

### 🟡 MEDIUM 中等问题 (5个)

| # | 问题 | 文件 | 修复 |
|---|------|------|------|
| 4 | 未使用的导入 `Circle` | question-card.tsx:14 | 已移除 |
| 5 | 未使用的导入 `useState` | question-card.tsx:13 | 已移除 |
| 6 | FormHeader useEffect 不必要重渲染 | form-preview.tsx:84 | 添加编辑状态跟踪 |
| 7 | PropertyPanel useEffect 依赖过多 | property-panel.tsx:79 | 移除 `question_text` |
| 8 | 文案错误 "最多题数" | property-panel.tsx | 改为 "最多选项数" |

### 🟢 LOW 低级问题 (1个)

| # | 问题 | 文件 | 修复 |
|---|------|------|------|
| 9 | 缺少键盘导航 skip-link | form-preview.tsx | 已添加 |

---

## 详细修复说明

### 1. 密码输入框安全性修复

**文件**: `src/components/forms/builder/form-preview.tsx`

**修复前**:
```tsx
<input
  type="text"  // ⚠️ 密码可见
  value={password || ''}
  onChange={(e) => onSettingsChange({ ...settings, password: e.target.value })}
  placeholder="设置访问密码"
/>
```

**修复后**:
```tsx
<input
  type="password"
  value={password || ''}
  onChange={(e) => {
    const value = e.target.value
    if (value.length <= 32) {
      onSettingsChange({ ...settings, password: value })
    }
  }}
  placeholder="设置访问密码（至少4位）"
  minLength={4}
  aria-label="访问密码"
/>
```

---

### 2. 排序题类型映射修复

**文件**: `src/components/forms/view/question-renderer.tsx`

**修复前**:
```tsx
case 'sorting':
  componentProps.items = options?.sortable_items?.map((item, index) => ({
    id: `${index}`,
    label: item,
    value: item,
    order: index,
  })) || []
```

**修复后**:
```tsx
case 'sorting':
  // sortable_items can be string[] or {id, label, order}[]
  componentProps.items = options?.sortable_items?.map((item: any, index: number) => {
    if (typeof item === 'string') {
      return {
        id: `sort-${index}`,
        label: item,
        value: item,
        order: index,
      }
    }
    return item
  }) || []
```

---

### 3. FormHeader useEffect 性能优化

**文件**: `src/components/forms/builder/form-preview.tsx`

**修复前**:
```tsx
useEffect(() => {
  setEditTitle(title)
  setEditDesc(description)
}, [title, description])
```

**修复后**:
```tsx
// Track if user is currently editing to avoid overwriting their input
const isEditingTitleRef = useRef(false)
const isEditingDescRef = useRef(false)

// Sync local state when props change (only if not editing)
useEffect(() => {
  if (!isEditingTitleRef.current) {
    setEditTitle(title)
  }
  if (!isEditingDescRef.current) {
    setEditDesc(description)
  }
}, [title, description])

const handleTitleFocus = () => {
  isEditingTitleRef.current = true
}

const handleDescFocus = () => {
  isEditingDescRef.current = true
}
```

---

### 4. PropertyPanel useEffect 优化

**文件**: `src/components/forms/builder/property-panel.tsx`

**修复前**:
```tsx
}, [question.id, question.question_text, question.required])
```

**修复后**:
```tsx
// Note: question_text is NOT in dependencies to prevent re-render on every keystroke
}, [question.id, question.required])
```

---

### 5. 键盘导航可访问性

**文件**: `src/components/forms/builder/form-preview.tsx`

**添加内容**:
```tsx
{/* Skip link for keyboard navigation */}
<a
  href="#form-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--primary-start)] focus:text-white focus:rounded-lg focus:shadow-lg"
>
  跳转到表单内容
</a>
<div id="form-content" className="max-w-2xl mx-auto px-4 py-6 pb-32">
```

---

## 修改的文件

| 文件 | 变更 |
|------|------|
| `src/components/forms/builder/form-preview.tsx` | 密码安全、useEffect 优化、skip-link |
| `src/components/forms/builder/property-panel.tsx` | useEffect 优化、文案修正 |
| `src/components/forms/builder/question-card.tsx` | 移除未使用导入 |
| `src/components/forms/view/question-renderer.tsx` | 排序题类型映射 |

---

## 统计

- **修复的问题**: 9个
- **HIGH 级别**: 3个
- **MEDIUM 级别**: 5个
- **LOW 级别**: 1个
- **代码变更**: +89 / -64 行

---

*本文档由 bmad-gds-code-review 工作流生成*
