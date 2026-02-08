# MultiForms UI/UX 设计系统

| 文档版本 | 1.0 |
|----------|-----|
| 创建日期 | 2026-01-29 |
| 项目名称 | MultiForms |
| 文档类型 | 设计系统 |

---

## 1. 设计哲学

MultiForms 的设计理念是 **"现代、年轻、时髦"**，融合当前最流行的设计趋势，为 C 端用户提供愉悦的表单创建与填写体验。

### 核心设计原则
- **Glassmorphism** - 玻璃态美学营造现代感
- **Bold Gradients** - 大胆渐变色彩表达活力
- **Smooth Interactions** - 流畅的微交互提升体验
- **Bento Grid** - 模块化布局清晰展示信息
- **Dark Mode First** - 深色模式优先，浅色模式适配

### 设计关键词
```
现代 · 时髦 · 年轻 · 有趣 · 高效 · 专业
```

---

## 2. 色彩系统

### 主色调 (Primary)
基于 **Micro SaaS** 配色方案，调整为更具活力的渐变风格：

| 颜色名称 | Hex | 用途 |
|----------|-----|------|
| **Primary Start** | `#6366F1` | Indigo 500 - 渐变起点 |
| **Primary End** | `#8B5CF6` | Violet 500 - 渐变终点 |
| **Primary Glow** | `#A78BFA` | Violet 400 - 发光效果 |
| **Accent Pink** | `#EC4899` | Pink 500 - 强调色 |
| **Accent Cyan** | `#06B6D4` | Cyan 500 - 辅助强调 |

### 中性色 (Neutral)
| 颜色名称 | Hex (Light) | Hex (Dark) | 用途 |
|----------|-------------|------------|------|
| Background | `#FFFFFF` | `#0F0F23` | 页面背景 |
| Surface | `#F5F3FF` | `#1A1A2E` | 卡片背景 |
| Surface Glass | `rgba(255,255,255,0.8)` | `rgba(26,26,46,0.8)` | 玻璃态卡片 |
| Border | `#E0E7FF` | `#2D2D44` | 边框 |
| Text Primary | `#1E1B4B` | `#F8FAFC` | 主要文字 |
| Text Secondary | `#64748B` | `#94A3B8` | 次要文字 |
| Text Muted | `#94A3B8` | `#64748B` | 弱化文字 |

### 功能色 (Functional)
| 颜色名称 | Hex | 用途 |
|----------|-----|------|
| Success | `#22C55E` | 成功状态 |
| Warning | `#F59E0B` | 警告状态 |
| Error | `#EF4444` | 错误状态 |
| Info | `#3B82F6` | 信息提示 |

### 渐变定义 (Gradients)
```css
/* 主渐变 - 用于按钮、强调元素 */
--gradient-primary: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
--gradient-accent: linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%);
--gradient-cyan: linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%);

/* 背景渐变 */
--gradient-bg-subtle: linear-gradient(180deg, #0F0F23 0%, #1A1A2E 100%);
--gradient-bg-vibrant: linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #2D1B4E 100%);

/* 文字渐变 */
--gradient-text: linear-gradient(135deg, #A78BFA 0%, #EC4899 100%);
```

---

## 3. 字体系统

### 主字体选择
**Tech Startup** 字体组合 - 最符合现代、科技感定位

| 用途 | 字体 | 权重 | CSS |
|------|------|------|-----|
| 标题 (H1-H6) | **Space Grotesk** | 500-700 | `font-family: 'Space Grotesk', sans-serif;` |
| 正文 | **DM Sans** | 400-500 | `font-family: 'DM Sans', sans-serif;` |
| 代码/数据 | **JetBrains Mono** | 400-500 | `font-family: 'JetBrains Mono', monospace;` |

### 中文字体 Fallback

考虑到 Google Fonts 在中国大陆可能被屏蔽，中文字体使用系统字体作为 fallback：

```css
/* 英文字体优先，中文字体 fallback */
--font-heading: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
                'Space Grotesk', 'Microsoft YaHei', 'SimHei', 'PingFang SC',
                'Hiragino Sans GB', sans-serif;
--font-body: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
              'DM Sans', 'Microsoft YaHei', 'SimHei', 'PingFang SC',
              'Hiragino Sans GB', sans-serif;
--font-mono: ui-monospace, SFMono-Regular, 'JetBrains Mono',
              'Consolas', 'Liberation Mono', monospace;
```

### 字体栈说明

| 平台 | 中文字体 | 用途 |
|------|----------|------|
| Windows | Microsoft YaHei (微软雅黑) | 主要中文字体 |
| Windows | SimHei (黑体) | 备选中文字体 |
| macOS | PingFang SC (苹方) | 主要中文字体 |
| macOS | Hiragino Sans GB | 备选中文字体 |
| iOS | PingFang SC | 主要中文字体 |

### Google Fonts 引入
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<!-- 仅引入英文字体，中文字体使用系统 fallback -->
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### 字体大小规范
| 级别 | 大小 | 行高 | 用途 |
|------|------|------|------|
| Display | 48/56/64px | 1.1 | Hero 标题 |
| H1 | 36/40/48px | 1.2 | 页面主标题 |
| H2 | 28/32px | 1.3 | 区块标题 |
| H3 | 20/24px | 1.4 | 卡片标题 |
| Body Large | 18px | 1.5 | 重要正文 |
| Body | 16px | 1.6 | 常规正文 |
| Body Small | 14px | 1.6 | 次要正文 |
| Caption | 12px | 1.5 | 说明文字 |

---

## 4. Glassmorphism 玻璃态效果

### 玻璃卡片样式
```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border-radius: 20px;
}

/* 浅色模式玻璃态 */
.glass-card-light {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(99, 102, 241, 0.1);
  box-shadow:
    0 8px 32px rgba(99, 102, 241, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}
```

### 光晕效果
```css
.glow-primary {
  box-shadow:
    0 0 20px rgba(99, 102, 241, 0.4),
    0 0 40px rgba(139, 92, 246, 0.2);
}

.glow-text {
  text-shadow:
    0 0 20px rgba(167, 139, 250, 0.5),
    0 0 40px rgba(236, 72, 153, 0.3);
}
```

---

## 5. 组件设计规范

### 5.1 按钮 (Buttons)

#### 主按钮
```css
.btn-primary {
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}
```

#### 次要按钮
```css
.btn-secondary {
  background: rgba(99, 102, 241, 0.1);
  color: #A78BFA;
  border: 1px solid rgba(99, 102, 241, 0.3);
  padding: 12px 24px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.5);
}
```

#### 幽灵按钮
```css
.btn-ghost {
  background: transparent;
  color: #94A3B8;
  padding: 12px 24px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.btn-ghost:hover {
  background: rgba(148, 163, 184, 0.1);
  color: #F8FAFC;
}
```

### 5.2 输入框 (Inputs)

```css
.input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 14px 16px;
  color: #F8FAFC;
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: #8B5CF6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
}

.input::placeholder {
  color: #64748B;
}
```

### 5.3 卡片 (Cards)

```css
.card {
  background: rgba(26, 26, 46, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  border-color: rgba(139, 92, 246, 0.3);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.2),
    0 0 40px rgba(139, 92, 246, 0.1);
}
```

### 5.4 标签 (Tags/Badges)

```css
.tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.tag-primary {
  background: rgba(99, 102, 241, 0.15);
  color: #A78BFA;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.tag-success {
  background: rgba(34, 197, 94, 0.15);
  color: #4ADE80;
  border: 1px solid rgba(34, 197, 94, 0.3);
}
```

---

## 6. Bento Grid 布局系统

### 网格定义
```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: minmax(140px, auto);
  gap: 16px;
  padding: 16px;
}

/* 单元格尺寸 */
.bento-sm { grid-column: span 4; grid-row: span 1; }  /* 1/3 宽度 */
.bento-md { grid-column: span 6; grid-row: span 1; }  /* 1/2 宽度 */
.bento-lg { grid-column: span 8; grid-row: span 2; }  /* 2/3 宽度, 2行高 */
.bento-xl { grid-column: span 12; grid-row: span 2; } /* 全宽, 2行高 */

/* 响应式 */
@media (max-width: 1024px) {
  .bento-grid { grid-template-columns: repeat(6, 1fr); }
  .bento-sm { grid-column: span 3; }
  .bento-md { grid-column: span 6; }
}

@media (max-width: 640px) {
  .bento-grid { grid-template-columns: 1fr; }
  .bento-sm, .bento-md, .bento-lg, .bento-xl { grid-column: span 1; }
}
```

### Bento 单元格样式
```css
.bento-cell {
  background: rgba(26, 26, 46, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.bento-cell:hover {
  border-color: rgba(139, 92, 246, 0.3);
  transform: scale(1.01);
}
```

---

## 7. 动画规范

### 缓动函数
```css
--ease-out: cubic-bezier(0.33, 1, 0.68, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### 动画时长
| 类型 | 时长 |
|------|------|
| 微交互 (hover) | 150-200ms |
| 状态切换 | 250-300ms |
| 页面转场 | 400-500ms |
| 加载动画 | 1000-1500ms |

### 常用动画
```css
/* 淡入 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 从下滑入 */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 脉冲发光 */
@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(139, 92, 246, 0.6);
  }
}

/* 渐变流动 */
@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 跑马灯进度条 */
@keyframes marquee {
  from { width: 0%; }
  to { width: 100%; }
}
```

### 跑马灯动画规格

用于用户评价自动轮播的进度条动画：

| 属性 | 值 |
|------|-----|
| 动画名称 | marquee |
| 时长 | 5000ms (5秒) |
| 缓动函数 | linear |
| 暂停状态 | animation-play-state: paused |

**使用示例**:
```css
.progress-bar {
  animation: marquee 5000ms linear;
  animation-play-state: running;
}

.progress-bar.paused {
  animation-play-state: paused;
}
```

---

## 8. 页面布局规范

### 8.1 导航栏 (Navbar)
```css
.navbar {
  position: fixed;
  top: 16px;
  left: 16px;
  right: 16px;
  height: 64px;
  background: rgba(15, 15, 35, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 100;
}
```

### 8.2 主容器
```css
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

.container-fluid {
  width: 100%;
  padding: 0 24px;
}
```

### 8.3 间距系统
| Token | 值 | 用途 |
|-------|-----|------|
| --spacing-1 | 4px | 最小间距 |
| --spacing-2 | 8px | 紧凑间距 |
| --spacing-3 | 12px | 小间距 |
| --spacing-4 | 16px | 默认间距 |
| --spacing-6 | 24px | 中等间距 |
| --spacing-8 | 32px | 大间距 |
| --spacing-12 | 48px | 超大间距 |

---

## 9. 图表可视化

### 图表色彩
```css
/* 数据系列配色 */
--chart-1: #6366F1;  /* Indigo */
--chart-2: #EC4899;  /* Pink */
--chart-3: #06B6D4;  /* Cyan */
--chart-4: #F59E0B;  /* Amber */
--chart-5: #22C55E;  /* Green */
--chart-6: #8B5CF6;  /* Violet */
```

### 图表类型选择
| 数据类型 | 推荐图表 | 交互级别 |
|----------|----------|----------|
| 趋势变化 | 折线图/面积图 | Hover + Zoom |
| 分类对比 | 柱状图 | Hover + Sort |
| 占比分布 | 环形图/堆叠柱状图 | Hover + Drill |
| 评分分布 | 直方图 + 箱线图 | Hover |
| 时间序列 | 折线图 + 预测带 | Hover + Toggle |

---

## 10. 响应式断点

```css
/* 断点定义 */
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;

/* 移动优先媒体查询 */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

---

## 11. 可访问性 (Accessibility)

### 对比度标准
- 正文文本: 最小 4.5:1 对比度
- 大文本 (18px+): 最小 3:1 对比度
- 交互元素: 最小 3:1 对比度

### 焦点状态
```css
:focus-visible {
  outline: 2px solid #8B5CF6;
  outline-offset: 2px;
  border-radius: 4px;
}
```

### 减少动画
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 12. Tailwind CSS 配置

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1',
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        accent: {
          pink: '#EC4899',
          cyan: '#06B6D4',
        },
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

---

## 13. 设计资源

### 推荐图标库
- **Heroicons** - 精致的线性图标
- **Lucide** - 现代、一致的图标集
- **Phosphor Icons** - 多样化的图标风格

### 推荐图表库
- **Recharts** - React 声明式图表
- **Chart.js** - 灵活的 Canvas 图表
- **ApexCharts** - 现代交互式图表

### 推荐动画库
- **Framer Motion** - React 动画库
- **GSAP** - 强大的动画平台
- **Lottie** - JSON 动画格式

---

## 14. 页面模板结构

### 14.1 Landing Page 首页
采用 **Hero + Features + CTA** 模式

```
┌─────────────────────────────────────────────────────┐
│                    Navbar (Floating)                 │
├─────────────────────────────────────────────────────┤
│                      Hero Section                    │
│           ┌─────────────────────────────┐           │
│           │   渐变标题 + CTAs + 预览图    │           │
│           └─────────────────────────────┘           │
├─────────────────────────────────────────────────────┤
│                    Features Grid                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Feature 1│ │ Feature 2│ │ Feature 3│           │
│  └──────────┘ └──────────┘ └──────────┘           │
├─────────────────────────────────────────────────────┤
│                   Templates Showcase                 │
├─────────────────────────────────────────────────────┤
│                      CTA Section                     │
├─────────────────────────────────────────────────────┤
│                      Footer                          │
└─────────────────────────────────────────────────────┘
```

### 14.2 Dashboard 仪表盘
采用 **Bento Grid** 布局

```
┌─────────────────────────────────────────────────────┐
│                    Navbar (Fixed)                    │
├─────────────┬───────────────────────────────────────┤
│             │                                       │
│   Sidebar   │          Bento Grid                   │
│             │  ┌────────┬────────┬────────┐        │
│             │  │  统计   │  统计   │  统计  │        │
│             │  ├────────┼────────┼────────┤        │
│             │  │         │ 最近表单│        │        │
│             │  │  大图   │   列表  │ 活动   │        │
│             │  │  卡片   │        │  流    │        │
│             │  │         │        │        │        │
│             │  └────────┴────────┴────────┘        │
└─────────────┴───────────────────────────────────────┘
```

### 14.3 Form Builder 表单构建器
```
┌─────────────────────────────────────────────────────┐
│          Header: [表单标题] [保存] [发布]            │
├─────────────────────┬───────────────────────────────┤
│                     │                               │
│    题型工具栏        │          表单预览区            │
│   ┌───────────┐    │  ┌─────────────────────────┐ │
│   │ 单选题     │    │  │  题目 1                 │ │
│   ├───────────┤    │  │  ○ 选项 A                │ │
│   │ 多选题     │    │  │  ○ 选项 B                │ │
│   ├───────────┤    │  └─────────────────────────┘ │
│   │ 评分题     │    │                               │
│   ├───────────┤    │  ┌─────────────────────────┐ │
│   │ 文本题     │    │  │  题目 2                 │ │
│   ├───────────┤    │  │  ___________________     │ │
│   │ ...       │    │  └─────────────────────────┘ │
│   └───────────┘    │                               │
│                     │         + 添加题目             │
└─────────────────────┴───────────────────────────────┘
```

---

## 15. Dark Mode 实现

```css
/* 默认深色模式 */
:root {
  --bg-primary: #0F0F23;
  --bg-secondary: #1A1A2E;
  --bg-tertiary: #2D2D44;
  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;
  --border: rgba(255, 255, 255, 0.08);
}

/* 浅色模式覆盖 */
.light {
  --bg-primary: #FFFFFF;
  --bg-secondary: #F5F3FF;
  --bg-tertiary: #E0E7FF;
  --text-primary: #1E1B4B;
  --text-secondary: #64748B;
  --text-muted: #94A3B8;
  --border: rgba(99, 102, 241, 0.15);
}
```

---

## 16. 设计检查清单

### 视觉质量
- [ ] 无 Emoji 作为图标使用
- [ ] 所有图标来自统一图标集
- [ ] Hover 状态不导致布局偏移
- [ ] 渐变使用品牌色彩
- [ ] 玻璃态效果适度应用

### 交互体验
- [ ] 可点击元素有 cursor-pointer
- [ ] Hover 状态有视觉反馈
- [ ] 动画时长 150-300ms
- [ ] 焦点状态可见
- [ ] 加载状态有骨架屏

### 深浅模式
- [ ] 浅色模式文字对比度足够
- [ ] 玻璃态在浅色下可见
- [ ] 边框在两种模式下可见
- [ ] 测试两种模式

### 响应式
- [ ] 375px 移动端适配
- [ ] 768px 平板适配
- [ ] 1024px+ 桌面适配
- [ ] 无横向滚动

---

## 17. 交互模式规范

### 17.1 条件导航模式

基于用户状态的导航行为：

| 场景 | 已登录 | 未登录 |
|------|--------|--------|
| 模板卡片点击 | 跳转至 Dashboard | 跳转至登录页 |

**实现方式**:
```typescript
// 使用 Zustand store 检测登录状态
const isAuthenticated = useAuthStore((state) => state.user !== null)
const router = useRouter()

// 条件导航
const handleClick = (e: React.MouseEvent) => {
  if (!isAuthenticated) {
    e.preventDefault()
    router.push('/login')
  }
}
```

### 17.2 自动轮播模式

用于内容循环展示的交互模式：

| 配置项 | 值 |
|--------|-----|
| 切换间隔 | 5000ms (5秒) |
| 暂停触发 | 鼠标悬停 |
| 导航方式 | 左右箭头 + 圆点导航 |
| 视觉反馈 | 顶部进度条 |

**状态管理**:
```typescript
const [activeIndex, setActiveIndex] = useState(0)
const [isPaused, setIsPaused] = useState(false)

// 自动轮播逻辑
useEffect(() => {
  if (isPaused) return
  const interval = setInterval(() => {
    setActiveIndex((prev) => (prev + 1) % items.length)
  }, 5000)
  return () => clearInterval(interval)
}, [isPaused])
```

---

## 18. 版本更新记录

### v1.2 (2026-02-08)
- **更新**: 字体系统
  - 移除 Google Fonts 的 Noto Sans SC（中国大陆可能被屏蔽）
  - 添加中文字体系统 fallback（微软雅黑、黑体、苹方等）
  - 英文字体继续使用 Google Fonts
- **新增**: 数据分析按钮样式统一
  - 导出数据按钮使用渐变样式
  - 刷新数据按钮使用渐变样式（替代分享结果按钮）

### v1.1 (2026-02-08)
- **新增**: 条件导航交互模式
  - 模板卡片基于登录状态的条件导航
- **新增**: 跑马灯进度条动画
  - `@keyframes marquee` 动画定义
- **新增**: 自动轮播交互模式规范
  - 5秒间隔、鼠标悬停暂停、导航控制

---

*此设计系统为 MultiForms 项目专用，基于 2025-2026 年最新 UI/UX 趋势制定。*
