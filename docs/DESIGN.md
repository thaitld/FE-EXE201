# DESIGN.md — MANTO EXE Design System

> **Quy tắc bắt buộc** — Mọi component mới phải tuân theo tài liệu này.  
> AI agent phải đọc file này trước khi tạo bất kỳ UI component nào.

---

## 1. Nguyên tắc cốt lõi

| Nguyên tắc | Mô tả |
|------------|-------|
| **Slate-first** | Màu nền và text chính dùng `slate-*` palette |
| **Semantic color** | Màu badge/alert có ý nghĩa cố định (xem bảng Color Semantics) |
| **Rounded-2xl cards** | Mọi card container dùng `rounded-2xl border border-slate-200 bg-white shadow-sm` |
| **Consistent density** | Padding card: `p-6`. Padding item list: `px-4 py-3` hay `px-6 py-4` |
| **Vietnamese labels** | Text hiển thị dùng tiếng Việt; code variable dùng tiếng Anh |
| **Lucide icons** | Chỉ dùng `lucide-react`, kích thước mặc định `size={18}` cho card header, `size={14}` cho inline |
| **No raw colors** | Không dùng `bg-gray-*`, `text-gray-*`, `bg-red-*` trực tiếp — thay bằng semantic tokens |

---

## 2. Color Semantics

### Status badges (Task, User, Alert)
```
PENDING / Chờ xử lý     → bg-amber-50 text-amber-700
IN_PROGRESS / Đang làm  → bg-blue-50 text-blue-700
PAUSED / Tạm dừng       → bg-slate-100 text-slate-600
WAITING_FOR_APPROVAL    → bg-violet-50 text-violet-700
COMPLETED / Hoàn thành  → bg-emerald-50 text-emerald-700
CANCELLED / Đã hủy      → bg-slate-100 text-slate-500
REJECTED / Từ chối      → bg-rose-50 text-rose-700
```

### Priority badges
```
HIGH   → bg-rose-50 text-rose-700
MEDIUM → bg-amber-50 text-amber-700
LOW    → bg-slate-100 text-slate-600
```

### Efficiency / Performance
```
≥ 110% (Xuất sắc)   → text-emerald-600, bg-emerald-50
90–110% (Tốt)        → text-blue-600, bg-blue-50
70–90% (Đạt)         → text-amber-600, bg-amber-50
< 70% (Cần cải thiện)→ text-rose-600, bg-rose-50
N/A                  → text-slate-400, bg-slate-50
```

### Burnout Risk
```
LOW    → bg-emerald-50 text-emerald-700
MEDIUM → bg-amber-50 text-amber-700
HIGH   → bg-rose-50 text-rose-700
```

### Severity (Alerts, Notifications)
```
HIGH severity   → border-rose-200 bg-rose-50 text-rose-700
MEDIUM severity → border-amber-200 bg-amber-50 text-amber-700
LOW severity    → border-emerald-200 bg-emerald-50 text-emerald-700
```

### Active / Inactive (User)
```
Active   → bg-emerald-50 text-emerald-700
Inactive → bg-slate-100 text-slate-600
```

---

## 3. Component Patterns

### 3.1 Card Container
```tsx
// ✅ Standard card
<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  ...
</div>

// ✅ Card với header + divider
<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
  <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
    <div>
      <h3 className="text-lg font-semibold text-slate-900">Title</h3>
      <p className="text-sm text-slate-500">Subtitle / meta</p>
    </div>
    <Icon className="text-slate-400" size={18} />
  </div>
  <div className="p-6">
    {/* content */}
  </div>
</div>
```

### 3.2 Stat Card (KPI)
```tsx
// ✅ 4-column grid of stat cards
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-slate-500">Label</p>
      <Icon className="text-emerald-600" size={18} />
    </div>
    <p className="mt-4 text-3xl font-bold text-slate-900">Value</p>
    <p className="mt-1 text-xs text-slate-500">Subtext</p>
  </div>
</div>
```

### 3.3 Status/Priority Badge
```tsx
// ✅ Rounded-full pill badge
<span className="rounded-full px-3 py-1 text-sm font-semibold bg-amber-50 text-amber-700">
  Chờ xử lý
</span>

// ❌ DON'T: rounded (square), bg-blue-100, text-blue-800 (Bootstrap style)
<span className="inline-block rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
  PENDING
</span>
```

### 3.4 Loading State
```tsx
// ✅ Loading inside container
<div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
  <div className="flex items-center gap-3 text-slate-600">
    <Loader2 className="h-5 w-5 animate-spin" />
    Đang tải...
  </div>
</div>
```

### 3.5 Error State
```tsx
// ✅ Error card
<div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
  <p className="font-semibold">Không tải được dữ liệu</p>
  <p className="mt-1 text-sm">{errorMessage}</p>
</div>
```

### 3.6 Empty State
```tsx
// ✅ Empty state with icon
<div className="flex flex-col items-center justify-center py-16 text-slate-400">
  <CheckCircle2 size={32} className="mb-3 opacity-40" />
  <p className="text-sm">Không có dữ liệu.</p>
</div>
```

### 3.7 Button Styles
```tsx
// Primary (CTA)
className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"

// Secondary (outlined)
className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"

// Danger
className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"

// Disabled modifier (add to any button)
// disabled:cursor-not-allowed disabled:opacity-60
```

### 3.8 Tab Pattern
```tsx
// ✅ Tabs with icon + count badge
<div className="flex border-b border-slate-200 px-4 pt-2">
  {tabs.map((tab) => (
    <button
      key={tab.key}
      onClick={() => setActiveTab(tab.key)}
      className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
        activeTab === tab.key
          ? "border-slate-900 text-slate-900"
          : "border-transparent text-slate-500 hover:text-slate-700"
      }`}
    >
      <tab.icon size={14} />
      {tab.label}
      {tab.count > 0 && (
        <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-600">
          {tab.count}
        </span>
      )}
    </button>
  ))}
</div>
```

### 3.9 Form Fields (Modal)
```tsx
// ✅ Input field
<input
  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 disabled:bg-slate-50"
/>

// ✅ Select field
<select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none">
  ...
</select>

// ✅ Search input with icon
<div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
  <Search size={16} className="text-slate-400" />
  <input className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
</div>
```

### 3.10 Modal Overlay
```tsx
// ✅ Modal structure
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div className="absolute inset-0 bg-slate-950/40" onClick={onClose} />
  <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
    ...
  </div>
</div>
```

### 3.11 List/Table Row
```tsx
// ✅ Clickable list row
<div className="flex cursor-pointer items-start justify-between gap-4 px-6 py-4 transition hover:bg-slate-50">
  ...
</div>

// ✅ Table row
<tr className="border-t border-slate-100">
  <td className="px-6 py-4 text-sm text-slate-700">...</td>
</tr>

// ✅ Table header
<th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
  Column
</th>
```

### 3.12 Info Row (key-value in card)
```tsx
// ✅ Compact info tile
<div className="rounded-xl bg-slate-50 px-4 py-3">
  <p className="text-xs text-slate-500">Label</p>
  <p className="mt-1 font-semibold text-slate-900">Value</p>
</div>

// ✅ Inline info row in list
<div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
  <span className="text-sm font-medium text-slate-600">Label</span>
  <span className="text-lg font-bold text-slate-900">Value</span>
</div>
```

---

## 4. Typography

| Element | Class |
|---------|-------|
| Page/panel title (H1) | `text-2xl font-bold text-slate-900` |
| Card title (H3) | `text-lg font-semibold text-slate-900` |
| Card subtitle | `text-sm text-slate-500` |
| Stat value | `text-3xl font-bold text-slate-900` |
| Label text | `text-sm font-medium text-slate-700` |
| Small label | `text-xs font-semibold uppercase tracking-wide text-slate-500` |
| Body text | `text-sm text-slate-700` |
| Muted text | `text-sm text-slate-500` |
| Mono code (task code) | `font-mono text-sm font-semibold text-slate-400` |
| Font family | `'Barlow', sans-serif` (set globally in Dashboard.tsx) |

---

## 5. Layout

### Page wrapper
```tsx
// All panels render inside Dashboard.tsx content area (p-6)
// Panel root element: always `<div className="space-y-6">`
```

### Grid layouts
```tsx
// 4 columns (stat cards)
"grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"

// 3 columns (chart + sidebar)
"grid grid-cols-1 gap-6 xl:grid-cols-3"
// chart: xl:col-span-2 | sidebar: xl:col-span-1

// 2 columns (form fields)
"grid grid-cols-1 gap-4 md:grid-cols-2"

// Meta tiles (2–4 cols)
"grid grid-cols-2 gap-3 md:grid-cols-4"
```

---

## 6. Icons

Library: **`lucide-react`** only.

| Use case | Size |
|----------|------|
| Card header icon | `size={18}` |
| Inline icon beside text | `size={14}` |
| Tab icon | `size={14}` |
| Empty state illustration | `size={32}` với `className="opacity-40"` |
| Loading spinner | `<Loader2 className="animate-spin" />` |

Common icons per domain:
```
Tasks     → ClipboardList, Tag, Clock, CheckCircle2, AlertTriangle
Users     → UserRound, ShieldCheck, Users
Charts    → TrendingUp, Activity, BarChart2, Zap
Burnout   → Brain, AlertTriangle, Heart
General   → RefreshCw, Search, Plus, Pencil, ArrowLeft, Menu
```

---

## 7. Pagination Pattern

```tsx
// ✅ Standard pagination bar
<div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
  <p className="text-sm text-slate-500">
    Trang {page} / {totalPages} · {totalCount} items
  </p>
  <div className="flex items-center gap-2">
    <button
      onClick={() => setPage(p => Math.max(1, p - 1))}
      disabled={!hasPreviousPage}
      className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <ChevronLeft size={16} />
    </button>
    <span className="px-2 text-sm text-slate-500">{page}</span>
    <button
      onClick={() => setPage(p => hasNextPage ? p + 1 : p)}
      disabled={!hasNextPage}
      className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <ChevronRight size={16} />
    </button>
  </div>
</div>
```

---

## 8. Filter Tabs (Horizontal scroll)

```tsx
// ✅ Filter tab bar (pill style)
<div className="flex gap-1 overflow-x-auto border-b border-slate-200 px-4 py-2">
  {filters.map((f) => (
    <button
      key={f}
      onClick={() => setFilter(f)}
      className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
        filter === f
          ? "bg-slate-900 text-white"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {f}
    </button>
  ))}
</div>
```

---

## 9. Anti-Patterns

| ❌ DON'T | ✅ DO |
|----------|-------|
| `rounded` (square corners) | `rounded-xl` hoặc `rounded-2xl` |
| `bg-gray-*`, `text-gray-*` | `bg-slate-*`, `text-slate-*` |
| `bg-red-*`, `text-red-*` | `bg-rose-*`, `text-rose-*` |
| `bg-green-*` | `bg-emerald-*` |
| Bootstrap-style badge (rectangular) | Rounded-full pill badge |
| Hardcode màu (`bg-blue-500`) cho status | Dùng statusMeta map |
| `text-center text-gray-500` cho loading | `flex items-center gap-3` với Loader2 |
| `<div className="text-center text-gray-500">Loading...</div>` | Loading card với `min-h-[420px]` |
| `<div className="rounded-lg bg-red-50 p-4">` | `<div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">` |

---

## 10. Progress Bar

```tsx
// ✅ Risk score / progress
<div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
  <div
    className="h-full rounded-full transition-all bg-rose-500"  // color = severity
    style={{ width: `${score}%` }}
  />
</div>
```

---

## 11. Slide-out Panel (Notifications)

```tsx
// ✅ Side panel overlay
<div className={`fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-white shadow-2xl transition-transform ${
  isOpen ? "translate-x-0" : "translate-x-full"
}`}>
  ...
</div>
// backdrop
<div className="fixed inset-0 z-30 bg-slate-950/30" onClick={onClose} />
```

---

## Quick Reference Card

```
Card:        rounded-2xl border border-slate-200 bg-white p-6 shadow-sm
Title:       text-lg font-semibold text-slate-900
Subtitle:    text-sm text-slate-500
Stat:        text-3xl font-bold text-slate-900
Badge pill:  rounded-full px-3 py-1 text-sm font-semibold {color}
Tile:        rounded-xl bg-slate-50 px-4 py-3
Row hover:   hover:bg-slate-50
Input:       rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none
Btn primary: rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800
Btn sec:     rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50
Icon (card): size={18} className="text-slate-400"
Divider:     border-t border-slate-200  OR  divide-y divide-slate-100
Grid 4col:   grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4
Grid 3col:   grid grid-cols-1 gap-6 xl:grid-cols-3
```
