# 家庭管理系统 — AI Agent 开发指南

> **重要**：Trae IDE Agent 在生成或修改代码时，**必须**遵循本文件中的所有规则。  
> **配套文档**：PRD.md | TECH_DESIGN.md | DEVELOPMENT_STANDARDS.md | DATABASE.md

---

## 1. 项目概述

### 1.1 简介

**"家庭管家"** 是一款面向现代家庭的日常生活管理 Web 应用，聚焦于 **家庭财务开支管理** 与 **成员日程协同** 两大核心场景。

### 1.2 核心功能模块

| 模块 | 功能 | 优先级 |
|------|------|:---:|
| 用户与家庭管理 | 注册/登录、创建/加入家庭组、角色权限（Creator/Member/Viewer） | P0 |
| 财务管理 | 收支记录 CRUD、预置 13 种分类、月度预算、统计报表（饼图/柱状图/折线图） | P0 |
| 日程管理 | 家庭共享日历（月/周/日视图）、日程 CRUD、待办清单 | P0 |
| 物品库存管理 | 库存台账、入库/出库流水、保质期预警、采购清单 | P1 |
| 仪表盘 | 收支概览、预算进度、库存预警、快捷操作 | P0 |

### 1.3 三种用户角色

| 角色 | 查看收支 | 新增收支 | 删除收支 | 管理成员 | 设置预算 | 创建日程 |
|------|:---:|:---:|:---:|:---:|:---:|:---:|
| Creator（管理员） | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Member（成员） | ✅ | ✅ | ✅(仅自己) | ❌ | ❌ | ✅ |
| Viewer（访客） | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 1.4 色彩系统（前端必须使用）

| 用途 | 色值 | Tailwind 类 |
|------|------|------------|
| 主色调 | `#4F46E5` | `indigo-600` |
| 成功/收入 | `#10B981` | `emerald-500` |
| 警告/预算预警 | `#F59E0B` | `amber-500` |
| 危险/超支/删除 | `#EF4444` | `red-500` |
| 中性/次要 | `#6B7280` | `gray-500` |
| 背景 | `#F9FAFB` | `gray-50` |
| 卡片 | `#FFFFFF` | `white` |

---

## 2. 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Vue 3 (Composition API + `<script setup>`) | ^3.5 |
| 构建工具 | Vite | ^6.0 |
| 语言 | TypeScript（全栈） | ^5.7 |
| 路由 | Vue Router | ^4.5 |
| 状态管理 | Pinia | ^2.3 |
| HTTP | Axios | ^1.7 |
| UI | Tailwind CSS + Headless UI | ^4.0 |
| 图表 | Chart.js + vue-chartjs | ^4.4 |
| 日历 | FullCalendar（月/周/日视图） | ^6.1 |
| 表单验证 | vee-validate + zod | ^4.15 |
| 后端框架 | NestJS | ^11.0 |
| ORM | Prisma | ^6.0 |
| 数据库 | MySQL（utf8mb4） | ^8.0 |
| 认证 | JWT + Passport | — |
| 任务调度 | @nestjs/schedule | ^5.0 |
| 包管理 | PNPM（Monorepo） | — |
| 容器 | Docker Compose | — |

---

## 3. 项目目录结构

**所有生成的文件必须放在以下对应的目录中**：

```
family-manager/
├── client/src/
│   ├── api/               # Axios 请求层（auth.ts / expense.ts / schedule.ts / inventory.ts / family.ts）
│   ├── components/
│   │   ├── common/        # AppHeader / AppSidebar / EmptyState / Skeleton
│   │   ├── expense/       # ExpenseForm / ExpenseList / ExpenseFilter / BudgetProgress
│   │   ├── schedule/      # FamilyCalendar / ScheduleForm / TodoList
│   │   ├── inventory/     # InventoryGrid / InventoryDetail / InventoryForm / ShoppingList
│   │   └── dashboard/     # SummaryCard / RecentSchedule / QuickActions
│   ├── composables/       # useAuth / useFamily / useExpense / useSchedule / useInventory
│   ├── layouts/           # DefaultLayout / AuthLayout
│   ├── router/            # index.ts
│   ├── stores/            # auth.ts / family.ts / ui.ts (Pinia)
│   ├── types/             # expense.ts / schedule.ts / inventory.ts / family.ts / api.ts
│   ├── utils/             # format.ts / validate.ts / constants.ts
│   └── views/
│       ├── Dashboard.vue / Expenses.vue / Budgets.vue / Reports.vue
│       ├── Calendar.vue / Todos.vue / Inventory.vue / ShoppingList.vue
│       ├── Family.vue / Settings.vue
│       └── auth/          # Login.vue / Register.vue
│
├── server/src/
│   ├── modules/
│   │   ├── auth/          # module / controller / service / dto / guards / strategies
│   │   ├── user/          # module / controller / service
│   │   ├── family/        # module / controller / service / dto
│   │   ├── expense/       # module / controller / service / dto
│   │   ├── schedule/      # module / controller / service / dto
│   │   ├── inventory/     # module / controller / service / dto
│   │   └── common/        # prisma.service / decorators / guards / interceptors
│   ├── config/
│   ├── app.module.ts
│   └── main.ts
│
└── shared/
    ├── types/             # 前后端共享类型
    └── constants/
```

---

## 4. 代码风格规范

### 4.1 必须遵守

- ❌ **禁止使用 `var`** — 只用 `const` / `let`
- ❌ **禁止 `==`** — 只用 `===`
- ❌ **禁止 `any`** — 特殊情况必须注释说明原因
- ❌ **禁止冗余注释** — 代码应自解释，只对非显而易见的业务规则写注释
- ✅ **必须使用箭头函数** 作为回调
- ✅ **必须使用模板字符串** `\`Hello, ${name}!\``
- ✅ **必须使用可选链 + 空值合并** `user?.profile?.avatar ?? DEFAULT`
- ✅ **必须使用 async/await** 而非 `.then()`
- ✅ **尽早 return**，减少嵌套层级

### 4.2 命名规范（必须遵守）

| 元素 | 规范 | 示例 |
|------|------|------|
| 文件名 | `kebab-case` | `expense-form.vue`、`use-auth.ts` |
| Vue 组件（template 中） | `PascalCase` | `<ExpenseForm />` |
| Composable 函数 | `camelCase` + `use` 前缀 | `useExpense()` |
| TypeScript 接口/类型 | `PascalCase` | `ExpenseCreateDto`、`UserProfile` |
| 变量/函数 | `camelCase` | `currentMonth`、`getExpenseList` |
| 常量 | `UPPER_SNAKE_CASE` | `MAX_UPLOAD_SIZE`、`API_BASE_URL` |
| 函数（GET 操作） | `get` / `fetch` 前缀 | `fetchExpenses()`、`getUserProfile()` |
| 函数（事件处理） | `handle` 前缀 | `handleSubmit()`、`handleClick()` |
| Prisma 模型 | `PascalCase`（单数） | `Expense`、`FamilyMember` |
| 数据库表 | `snake_case`（复数） | `expenses`、`family_members` |
| 数据库列 | `snake_case` | `transaction_date`、`family_id` |
| API 路径 | `kebab-case`（复数） | `/api/expense-categories` |

### 4.3 Prettier 配置（必须遵循）

```jsonc
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "trailingComma": "all",
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

---

## 5. Vue 3 前端代码模板

### 5.1 组件结构（`<script setup lang="ts">` — 唯一允许的写法）

```vue
<script setup lang="ts">
// 1. 导入
import { ref, computed, onMounted } from 'vue'

// 2. Props & Emits
const props = defineProps<{ familyId: string; limit?: number }>()
const emit = defineEmits<{ (e: 'created', expense: Expense): void }>()

// 3. Composables
const { expenses, isLoading, error, fetchExpenses } = useExpense()

// 4. 响应式状态
const showForm = ref(false)

// 5. 计算属性
const displayExpenses = computed(() => props.limit ? expenses.value.slice(0, props.limit) : expenses.value)

// 6. 方法
async function handleSubmit(data: ExpenseFormData) { /* ... */ }

// 7. 生命周期
onMounted(() => { fetchExpenses() })
</script>

<template>
  <div class="space-y-4">
    <div v-if="isLoading" class="flex justify-center py-8"><!-- Skeleton --></div>
    <div v-else-if="error" class="text-red-500 text-center py-8">{{ error }}</div>
    <div v-else-if="displayExpenses.length === 0" class="text-gray-400 text-center py-8"><!-- Empty state --></div>
    <ExpenseItem v-for="expense in displayExpenses" :key="expense.id" :expense="expense" />
  </div>
</template>
```

### 5.2 Composable 模板

```typescript
export function useExpense() {
  const expenses = ref<Expense[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchExpenses(params?: Record<string, unknown>) {
    isLoading.value = true; error.value = null
    try {
      const response = await expenseApi.getList(params)
      expenses.value = response.data
    } catch (err) {
      error.value = '加载失败，请重试'
    } finally {
      isLoading.value = false
    }
  }

  return {
    expenses: computed(() => expenses.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    fetchExpenses,
  }
}
```

### 5.3 组件必须处理的状态

**每个列表/数据组件必须覆盖 4 种状态**：`Loading`（骨架屏） → `Error`（错误提示） → `Empty`（空状态引导） → `Data`（正常渲染）。

### 5.4 Pinia Store 使用场景

| 场景 | 方案 |
|------|------|
| 跨组件共享（auth、family） | Pinia Store |
| 页面内部状态 | `ref` / `reactive` |
| URL 参数 | `vue-router` query params |

### 5.5 Tailwind CSS 约定

- 类名顺序：布局 → 尺寸 → 间距 → 排版 → 外观 → 交互
- 避免单个元素超过 10 个 class — 超过则提取为组件或 `@apply`
- 金额输入框使用大字体 + 千分位格式化

### 5.6 Axios 请求层

- 所有 API 调用统一走 `@/api/` 下的模块文件
- Axios 拦截器处理：Token 注入 → 401 自动刷新 → 统一错误处理
- 响应格式统一 `{ code: 0, data: T, message: 'success' }`

---

## 6. NestJS 后端代码模板

### 6.1 模块目录结构（每个模块必须包含）

```
modules/<name>/
├── <name>.module.ts
├── <name>.controller.ts
├── <name>.service.ts
└── dto/
    ├── create-<name>.dto.ts
    ├── update-<name>.dto.ts
    └── query-<name>.dto.ts
```

### 6.2 Controller 模板

```typescript
@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get()
  async findAll(@Query() query: QueryExpenseDto) { return this.expenseService.findAll(query) }

  @Post()
  async create(@Body() dto: CreateExpenseDto) { return this.expenseService.create(dto) }

  @Get(':id')
  async findOne(@Param('id') id: string) { return this.expenseService.findOne(id) }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateExpenseDto) { return this.expenseService.update(id, dto) }

  @Delete(':id')
  async remove(@Param('id') id: string) { return this.expenseService.softDelete(id) }
}
```

### 6.3 Service 查询必须遵守

- 所有查询 **必须携带 `familyId`** 过滤条件（数据隔离）
- 列表查询 **必须分页** — 默认 `page=1, pageSize=20`，上限 `pageSize≤100`
- 使用 `select` 替代 `include` 减少数据传输
- 写操作使用 `$transaction` 保证一致性
- 异常使用 **NestJS 内置异常类**：`NotFoundException`、`BadRequestException`、`ForbiddenException`、`UnauthorizedException`

### 6.4 DTO 校验（class-validator）

```typescript
export class CreateExpenseDto {
  @IsEnum(['income', 'expense'])
  type: 'income' | 'expense'

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(99999999.99)
  amount: number

  @IsUUID()
  categoryId: string

  @IsDateString()
  @IsOptional()
  transactionDate?: string

  @IsString()
  @MaxLength(200)
  @IsOptional()
  note?: string
}
```

### 6.5 统一响应格式

```typescript
// 成功响应（Interceptor 自动包装）
{ "code": 0, "data": { ... }, "message": "success" }

// 分页响应额外携带
{ "pagination": { "page": 1, "pageSize": 20, "total": 100, "totalPages": 5 } }

// 错误码约定
// 0=成功, 1000-1999=参数错误, 2000-2999=认证/授权错误
// 3000-3999=业务逻辑错误, 4000-4999=资源不存在, 5000-5999=系统错误
```

---

## 7. 数据库规范

### 7.1 Prisma Schema 规范

```prisma
datasource db {
  provider = "mysql"       // 必须用 mysql，不是 postgresql
  url      = env("DATABASE_URL")
}

model Example {
  id        String   @id @default(uuid()) @db.Char(36)  // MySQL UUID 用 @db.Char(36)
  familyId  String   @map("family_id") @db.Char(36)     // 外键列必须 snake_case
  amount    Decimal  @db.Decimal(12, 2)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([familyId, ...])  // 查询频繁的字段建立索引
  @@map("examples")          // 表面必须 snake_case 复数
}
```

### 7.2 关键数据库规则

- **所有业务表必须包含 `family_id`** — 这是数据隔离的基础
- **ID 主键**：`CHAR(36) PRIMARY KEY DEFAULT (UUID())`
- **时间戳**：`DEFAULT CURRENT_TIMESTAMP` / `ON UPDATE CURRENT_TIMESTAMP`
- **字符集**：所有表 `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
- **软删除**：Expense 表使用 `deleted_at` 字段标记删除（不物理删）
- **索引**：所有 `family_id` + 常用筛选字段需建联合索引
- **迁移**：每次迁移只做一件事，迁移文件纳入版本控制

### 7.3 Entity 表对应关系（生成代码时参考）

| 模块 | 表名 | Prisma Model |
|------|------|-------------|
| 用户 | `users` | `User` |
| 家庭 | `families` | `Family` |
| 家庭成员 | `family_members` | `FamilyMember` |
| 收支 | `expenses` | `Expense` |
| 分类 | `categories` | `Category` |
| 预算 | `budgets` | `Budget` |
| 日程 | `schedules` | `Schedule` |
| 日程参与者 | `schedule_participants` | `ScheduleParticipant` |
| 日程提醒 | `schedule_reminders` | `ScheduleReminder` |
| 待办 | `todos` | `Todo` |
| 待办指派人 | `todo_assignees` | `TodoAssignee` |
| 库存物品 | `inventory_items` | `InventoryItem` |
| 库存流水 | `stock_logs` | `StockLog` |
| 通知 | `notifications` | `Notification` |

---

## 8. 安全要求（必须遵守）

| 规则 | 要求 |
|------|------|
| 密码存储 | **bcrypt hash**，saltRounds=12，不可逆 |
| JWT Token | access_token 7 天 + refresh_token 30 天，HS256 签名 |
| 数据隔离 | **所有查询必须携带 familyId**，`Guard` 校验用户是否属于当前家庭组 |
| SQL 注入防护 | 使用 Prisma 参数化查询，**禁止字符串拼接 SQL** |
| XSS 防护 | 前端输出自动转义 + Helmet HTTP 头 |
| CORS | 生产环境白名单域名 |
| 敏感字段 | `password_hash` 查询时**默认 exclude** |
| API 鉴权 | 除 `/api/auth/*` 外所有接口需 JWT 鉴权 |
| 角色控制 | 危险操作（删除、改权限）需 `@Roles('creator')` 装饰器保护 |

---

## 9. 测试要求

### 9.1 测试金字塔

```
E2E（少量）        Playwright — 核心用户流程
Integration（中量） Supertest — API 集成测试
Unit（大量）        Vitest — 工具函数、Service、Composable
```

### 9.2 覆盖率最低要求

| 类型 | 最低覆盖率 |
|------|:---:|
| Service 层 | ≥ 80% |
| 工具函数 | ≥ 90% |
| Composable | ≥ 70% |
| Controller 核心路径 | 100% |
| 整体项目 | ≥ 60% |

### 9.3 必须测试的场景

- **前端**：Composable 初始状态、加载/错误/空状态、用户操作触发 API
- **后端**：CRUD 正常路径、参数校验、权限拦截、分页边界值
- **每个 API 至少覆盖**：200 成功、400 参数错误、401 未认证、403 权限不足

---

## 10. 重要约束与注意事项

### 10.1 必须遵守

1. **不引入文档未列的依赖** — 如在 TECH_DESIGN.md 技术栈中未出现，不要自行添加新库
2. **保持架构一致性** — 前端用 `<script setup>` + Composition API，后端用 NestJS 模块化结构
3. **API 路径统一** — `GET/POST /api/<plural-noun>`，用 kebab-case
4. **软删除** — Expense 删除只设置 `deleted_at`，不物理删除，查询默认 `WHERE deleted_at IS NULL`
5. **分页** — 所有列表接口必须支持分页，默认 `page=1, pageSize=20`
6. **邀请码** — 创建家庭自动生成 24 小时有效邀请码，成员通过邀请码加入
7. **预置数据** — 创建家庭时自动插入 13 种支出分类 + 5 种收入分类
8. **金额精度** — 所有金额字段使用 `DECIMAL(12, 2)`，前端显示千分位格式化
9. **Toast 反馈** — 所有增删改操作必须有 Toast 提示（成功/失败）
10. **删除确认** — 所有删除操作必须有二次确认弹窗
11. **空状态** — 每个列表/图表页面必须有空状态设计
12. **骨架屏** — 异步加载的数据区域必须有 Loading 态

### 10.2 禁止事项

1. ❌ 不要手写 `any` 类型
2. ❌ 不要跨越家庭组查询数据（必须带 `familyId` 过滤）
3. ❌ 不要在 Controller 中写业务逻辑（全部在 Service 层）
4. ❌ 不要在模板中写复杂表达式（用 `computed` 替代）
5. ❌ 不要直接拼接 SQL 字符串
6. ❌ 不要使用 Options API 写 Vue 组件
7. ❌ 不要提交 `console.log` 到正式代码
8. ❌ 不要忽略 .gitignore（node_modules / .env / dist / uploads）

### 10.3 典型错误与纠正

| ❌ 错误做法 | ✅ 正确做法 |
|-----------|-----------|
| `<script>` 无 `setup` | `<script setup lang="ts">` |
| `prisma.user.findFirst({ where: { id } })` — 遗漏 familyId | `prisma.user.findFirst({ where: { id, familyId } })` |
| `throw new Error('xxx')` | `throw new NotFoundException('xxx')` |
| `@db.Uuid` 在 Prisma Schema 中 | `@db.Char(36)` |
| `provider = "postgresql"` | `provider = "mysql"` |
| `DATE_TRUNC(...)` | `DATE_FORMAT(..., '%Y-%m-01')` |
| `var count = 0` | `let count = 0` |
| `if (data == null)` | `if (data === null)` |
| Response 直接返回原始数据 | 通过 Interceptor 包装为 `{ code, data, message }` |

---

> **配套文档索引**  
> 📋 需求：[PRD.md](./PRD.md) | 🏗️ 架构：[TECH_DESIGN.md](./TECH_DESIGN.md)  
> 📐 规范：[DEVELOPMENT_STANDARDS.md](./DEVELOPMENT_STANDARDS.md) | 🗄️ 数据库：[DATABASE.md](./DATABASE.md)
