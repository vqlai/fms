# 家庭管理系统 — 开发规范文档

> **版本**：v1.0\
> **状态**：已定稿\
> **日期**：2026-05-15\
> **适用对象**：全栈开发团队

***

## 目录

1. [总则](#1-总则)
2. [工作流程规范](#2-工作流程规范)
3. [代码风格规范](#3-代码风格规范)
4. [命名规范](#4-命名规范)
5. [TypeScript 使用规范](#5-typescript-使用规范)
6. [Vue 3 前端开发规范](#6-vue-3-前端开发规范)
7. [NestJS 后端开发规范](#7-nestjs-后端开发规范)
8. [数据库与 Prisma 规范](#8-数据库与-prisma-规范)
9. [API 开发规范](#9-api-开发规范)
10. [测试规范](#10-测试规范)
11. [文档规范](#11-文档规范)

***

## 1. 总则

### 1.1 核心原则

| 原则        | 描述                                    |
| --------- | ------------------------------------- |
| **可读性优先** | 代码是写给人看的，其次才是机器。优先选择清晰而非巧妙            |
| **一致性**   | 所有代码风格必须与本规范保持一致，包括缩进、命名、结构           |
| **类型安全**  | 全栈 TypeScript，禁止使用 `any`（特殊情况需注释说明原因） |
| **关注点分离** | 业务逻辑、UI 展示、数据获取各司其职                   |
| **小步提交**  | 每个 commit 只做一件事，粒度控制在 30 分钟内可回滚的大小    |
| **无注释代码** | 代码本身应自解释，仅在业务逻辑复杂处允许注释                |

### 1.2 工具链

| 工具          | 配置文件                    | 用途           |
| ----------- | ----------------------- | ------------ |
| PNPM        | `pnpm-workspace.yaml`   | Monorepo 包管理 |
| ESLint      | `.eslintrc.cjs`         | 代码静态检查       |
| Prettier    | `.prettierrc`           | 代码格式化        |
| Husky       | `.husky/`               | Git hooks    |
| lint-staged | `.lintstagedrc.cjs`     | 暂存区检查        |
| Commitlint  | `commitlint.config.cjs` | 提交信息校验       |

### 1.3 编辑器设置

所有开发者在 VSCode 中安装以下插件并启用"保存时自动格式化"：

- ESLint
- Prettier - Code formatter
- Vue - Official (Volar)
- Prisma
- Tailwind CSS IntelliSense
- Error Lens

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  }
}
```

***

## 2. 工作流程规范

### 2.1 Git 分支策略

```
main (生产分支，受保护)
  │
  ├── develop (开发主分支，PR 合入)
  │     │
  │     ├── feature/FAM-001-user-auth
  │     ├── feature/FAM-002-expense-crud
  │     ├── fix/FAM-010-budget-calculation
  │     └── chore/FAM-020-package-upgrade
  │
  └── release/v1.0.0 (发布分支)
```

| 分支类型      | 命名格式                               | 示例                           | 说明     |
| --------- | ---------------------------------- | ---------------------------- | ------ |
| `feature` | `feature/{TICKET}-{short-desc}`    | `feature/FAM-001-user-auth`  | 新功能开发  |
| `fix`     | `fix/{TICKET}-{short-desc}`        | `fix/FAM-010-budget-calc`    | Bug 修复 |
| `chore`   | `chore/{TICKET}-{short-desc}`      | `chore/FAM-020-upgrade-vite` | 工程化/依赖 |
| `release` | `release/v{major}.{minor}.{patch}` | `release/v1.0.0`             | 发布预备   |
| `hotfix`  | `hotfix/{TICKET}-{short-desc}`     | `hotfix/FAM-050-login-crash` | 紧急修复   |

### 2.2 Commit 规范（Conventional Commits）

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

| Type       | 含义       | 示例                                                     |
| ---------- | -------- | ------------------------------------------------------ |
| `feat`     | 新功能      | `feat(expense): add expense category management`       |
| `fix`      | 修复 Bug   | `fix(schedule): correct timezone offset for reminders` |
| `refactor` | 重构（不改功能） | `refactor(auth): extract token logic to service`       |
| `style`    | 代码格式     | `style(client): format with prettier`                  |
| `docs`     | 文档变更     | `docs(api): update expense endpoint description`       |
| `test`     | 测试相关     | `test(expense): add unit tests for budget service`     |
| `chore`    | 构建/工具    | `chore(deps): upgrade vite to 6.0`                     |
| `perf`     | 性能优化     | `perf(report): optimize aggregate query`               |

**Scope 规范**：使用模块名，如 `auth`、`expense`、`schedule`、`family`、`client`、`server`、`deps`、`config`。

### 2.3 PR 流程

```
1. 从 develop 拉取 feature 分支
2. 开发 + 本地自测（lint + test 通过）
3. 提交 PR 到 develop
4. 至少 1 位 reviewer Approve
5. CI 流水线通过（lint / typecheck / test / build）
6. Squash Merge 到 develop
7. 删除 feature 分支
```

**PR 描述模板**：

```markdown
## 变更说明
简述此 PR 做了什么

## 关联 Issue
Fixes #xxx

## 变更类型
- [ ] 新功能
- [ ] Bug 修复
- [ ] 重构
- [ ] 其他

## 自测清单
- [ ] 本地 lint 通过
- [ ] 本地 typecheck 通过
- [ ] 单元测试通过
- [ ] 手动测试无回归

## 截图/录屏（前端变更时必填）
（图片）
```

***

## 3. 代码风格规范

### 3.1 Prettier 配置

```jsonc
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "trailingComma": "all",
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "vueIndentScriptAndStyle": false,
  "htmlWhitespaceSensitivity": "ignore"
}
```

### 3.2 通用编码约定

```typescript
// ✅ 正确 — 使用 const/let，不用 var
const name = 'John'
let count = 0

// ❌ 错误
var name = 'John'

// ✅ 正确 — 使用 === 而非 ==
if (status === 'active') { /* ... */ }

// ✅ 正确 — 使用模板字符串
const message = `Hello, ${name}!`

// ✅ 正确 — 使用箭头函数作为回调
items.map((item) => item.id)

// ✅ 正确 — 使用解构赋值
const { name, email } = user

// ✅ 正确 — 使用可选链和空值合并
const avatarUrl = user?.profile?.avatar ?? DEFAULT_AVATAR

// ✅ 正确 — 尽早 return，减少嵌套
function processOrder(order: Order) {
  if (!order) return null
  if (order.status === 'cancelled') return null
  // 主逻辑...
}

// ✅ 正确 — 使用 async/await 而非 .then()
async function fetchData() {
  const result = await api.getData()
  return result
}
```

### 3.3 文件组织

每个文件只包含一个主要的类/组件/函数。文件名使用 kebab-case。

```
✅ expense-form.vue
✅ use-expense.ts
✅ expense.service.ts
❌ ExpenseForm.vue        # 不使用 PascalCase 文件名
❌ useExpense.ts           # 不使用 camelCase 文件名
```

***

## 4. 命名规范

### 4.1 命名约定总表

| 元素                     | 风格                   | 示例                               |
| ---------------------- | -------------------- | -------------------------------- |
| **文件名**                | kebab-case           | `expense-form.vue`、`use-auth.ts` |
| **Vue 组件（template 中）** | PascalCase           | `<ExpenseForm />`                |
| **Composable 函数**      | camelCase + `use` 前缀 | `useExpense()`、`useSchedule()`   |
| **TypeScript 接口**      | PascalCase + `I` 不推荐 | `ExpenseCreateDto`、`UserProfile` |
| **TypeScript 类型别名**    | PascalCase           | `ExpenseType`、`MemberRole`       |
| **枚举**                 | PascalCase           | `ExpenseStatus`                  |
| **枚举值**                | UPPER\_SNAKE\_CASE   | `EXPENSE_STATUS_ACTIVE`          |
| **变量/函数**              | camelCase            | `currentMonth`、`getExpenseList`  |
| **常量**                 | UPPER\_SNAKE\_CASE   | `MAX_UPLOAD_SIZE`、`API_BASE_URL` |
| **Prisma 模型**          | PascalCase（单数）       | `Expense`、`FamilyMember`         |
| **数据库表名**              | snake\_case（复数）      | `expenses`、`family_members`      |
| **数据库列名**              | snake\_case          | `transaction_date`、`family_id`   |
| **API 路径**             | kebab-case（复数）       | `/api/expense-categories`        |
| **CSS 类名**             | Tailwind 原子类         | `flex items-center gap-2`        |

### 4.2 Vue 组件命名

```typescript
// 单文件组件使用 PascalCase import
import ExpenseForm from '@/components/expense/ExpenseForm.vue'
import EmptyState from '@/components/common/EmptyState.vue'

// template 中使用 PascalCase
<ExpenseForm :loading="isLoading" @submit="handleSubmit" />

// 页面组件以 View 后缀区分
import DashboardView from '@/views/DashboardView.vue'
```

### 4.3 函数命名约定

| 操作   | 前缀                   | 示例                                   |
| ---- | -------------------- | ------------------------------------ |
| 获取数据 | `get` / `fetch`      | `fetchExpenses()`、`getUserProfile()` |
| 创建   | `create`             | `createExpense()`                    |
| 更新   | `update`             | `updateBudget()`                     |
| 删除   | `delete` / `remove`  | `deleteExpense()`、`removeMember()`   |
| 设置   | `set`                | `setActiveFamily()`                  |
| 切换   | `toggle`             | `toggleSidebar()`                    |
| 检查   | `is` / `has` / `can` | `isOverBudget()`、`hasPermission()`   |
| 格式化  | `format`             | `formatCurrency()`、`formatDate()`    |
| 处理事件 | `handle` + Event     | `handleSubmit()`、`handleClick()`     |
| 验证   | `validate`           | `validateEmail()`                    |

***

## 5. TypeScript 使用规范

### 5.1 类型定义

```typescript
// ✅ 优先使用 interface 定义对象类型
interface Expense {
  id: string
  amount: number
  category: ExpenseCategory
  transactionDate: string
}

// ✅ 使用 type 定义联合类型和工具类型
type ExpenseType = 'income' | 'expense'
type ExpensePreview = Pick<Expense, 'id' | 'amount' | 'category'>

// ✅ 枚举用于有限集合
enum ScheduleRepeatRule {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

// ✅ 泛型命名有语义
type ApiResponse<TData> = { code: number; data: TData; message: string }

// ❌ 禁止
const data: any = api.getData()  // 使用 unknown + 类型守卫替代
```

### 5.2 函数签名

```typescript
// ✅ 明确参数类型和返回值类型
function calculateBalance(income: number, expense: number): number {
  return income - expense
}

// ✅ 可选参数使用 ?
function filterExpenses(categoryId?: string, dateRange?: DateRange): Expense[] { /*...*/ }

// ✅ 函数参数超过 3 个时使用对象参数
function createExpense(params: {
  amount: number
  categoryId: string
  transactionDate: string
  note?: string
}): Promise<Expense> { /*...*/ }
```

### 5.3 null/undefined 处理

```typescript
// ✅ 使用可选链
const memberCount = family?.members?.length ?? 0

// ✅ 使用类型守卫
function isExpenseValid(expense: Expense | null): expense is Expense {
  return expense !== null && expense.amount > 0
}
```

***

## 6. Vue 3 前端开发规范

### 6.1 组件结构

```vue
<script setup lang="ts">
// 1. 导入
import { ref, computed, onMounted } from 'vue'
import { useExpense } from '@/composables/useExpense'

// 2. Props & Emits
const props = defineProps<{
  familyId: string
  limit?: number
}>()

const emit = defineEmits<{
  (e: 'created', expense: Expense): void
  (e: 'error', message: string): void
}>()

// 3. Composables
const { expenses, isLoading, error, fetchExpenses, createExpense } = useExpense()

// 4. 响应式状态
const showForm = ref(false)

// 5. 计算属性
const displayExpenses = computed(() =>
  props.limit ? expenses.value.slice(0, props.limit) : expenses.value,
)

// 6. 方法
async function handleSubmit(data: ExpenseFormData) {
  await createExpense(data)
  showForm.value = false
}

// 7. 生命周期
onMounted(() => {
  fetchExpenses()
})
</script>

<template>
  <div class="space-y-4">
    <div v-if="isLoading" class="flex justify-center py-8">
      <!-- Skeleton loading -->
    </div>
    <div v-else-if="error" class="text-red-500 text-center py-8">
      {{ error }}
    </div>
    <div v-else-if="displayExpenses.length === 0" class="text-gray-400 text-center py-8">
      <!-- Empty state -->
    </div>
    <ExpenseItem
      v-for="expense in displayExpenses"
      :key="expense.id"
      :expense="expense"
    />
  </div>
</template>
```

### 6.2 Composable 规范

```typescript
// composables/useExpense.ts
import { ref, computed } from 'vue'
import { expenseApi } from '@/api/expense'
import type { Expense } from '@/types/expense'

export function useExpense() {
  const expenses = ref<Expense[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchExpenses(params?: Record<string, unknown>) {
    isLoading.value = true
    error.value = null
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

### 6.3 状态管理 (Pinia) 使用场景

| 场景        | 方案                         |
| --------- | -------------------------- |
| 跨组件共享状态   | Pinia Store                |
| 页面/组件内部状态 | `ref` / `reactive`         |
| 服务端数据缓存   | Composable 内部 `ref` + 请求去重 |
| URL 参数状态  | `vue-router` query params  |

```typescript
// stores/auth.ts — 典型 Pinia Store
import { defineStore } from 'pinia'
import { authApi } from '@/api/auth'
import type { User } from '@/types/user'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = useLocalStorage<string | null>('access_token', null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  async function login(credentials: LoginDto) {
    const response = await authApi.login(credentials)
    token.value = response.data.accessToken
    user.value = response.data.user
  }

  function logout() {
    token.value = null
    user.value = null
  }

  return { user, token, isAuthenticated, login, logout }
})
```

### 6.4 API 层封装

```typescript
// api/axios.ts
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期，尝试刷新或跳转登录
    }
    return Promise.reject(error)
  },
)

export default http
```

### 6.5 Tailwind CSS 约定

```html
<!-- ✅ 遵循 Tailwind 推荐顺序：布局 → 尺寸 → 间距 → 排版 → 外观 → 交互 -->
<div class="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-700 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
  <!-- content -->
</div>

<!-- ✅ 使用 @apply 提取重复样式为组件类 -->
<style scoped>
.card {
  @apply bg-white rounded-xl shadow-sm border border-gray-100 p-6;
}
</style>

<!-- ❌ 避免超过 10 个 class 的堆积，必要时提取组件 -->
```

***

## 7. NestJS 后端开发规范

### 7.1 模块结构

每个业务模块遵循统一的目录结构：

```
modules/expense/
├── expense.module.ts          # 模块定义
├── expense.controller.ts      # 路由与请求处理
├── expense.service.ts         # 业务逻辑
├── dto/
│   ├── create-expense.dto.ts  # 请求 DTO
│   ├── update-expense.dto.ts
│   └── query-expense.dto.ts   # 查询参数 DTO
└── test/
    ├── expense.controller.spec.ts
    └── expense.service.spec.ts
```

### 7.2 Controller 规范

```typescript
import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'
import { ExpenseService } from './expense.service'
import { CreateExpenseDto } from './dto/create-expense.dto'
import { QueryExpenseDto } from './dto/query-expense.dto'

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get()
  async findAll(@Query() query: QueryExpenseDto) {
    return this.expenseService.findAll(query)
  }

  @Post()
  async create(@Body() dto: CreateExpenseDto) {
    return this.expenseService.create(dto)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.expenseService.findOne(id)
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateExpenseDto) {
    return this.expenseService.update(id, dto)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.expenseService.softDelete(id)
  }
}
```

### 7.3 Service 规范

```typescript
import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/modules/common/prisma/prisma.service'

@Injectable()
export class ExpenseService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryExpenseDto) {
    const { page = 1, pageSize = 20, categoryId, startDate, endDate } = query

    const where: Prisma.ExpenseWhereInput = {
      familyId: query.familyId, // 从请求上下文获取
      deletedAt: null,
    }

    if (categoryId) where.categoryId = categoryId
    if (startDate || endDate) {
      where.transactionDate = {}
      if (startDate) where.transactionDate.gte = new Date(startDate)
      if (endDate) where.transactionDate.lte = new Date(endDate)
    }

    const [data, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        include: { category: true, createdBy: { select: { id: true, name: true } } },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { transactionDate: 'desc' },
      }),
      this.prisma.expense.count({ where }),
    ])

    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  }

  async findOne(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: { category: true },
    })
    if (!expense) {
      throw new NotFoundException(`Expense with ID "${id}" not found`)
    }
    return expense
  }
}
```

### 7.4 DTO 规范

```typescript
import { IsEnum, IsNumber, IsUUID, IsDateString, IsString, IsOptional, Min, Max, MaxLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateExpenseDto {
  @ApiProperty({ enum: ['income', 'expense'] })
  @IsEnum(['income', 'expense'])
  type: 'income' | 'expense'

  @ApiProperty({ example: 128.50 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(99999999.99)
  amount: number

  @ApiProperty({ description: '分类 UUID' })
  @IsUUID()
  categoryId: string

  @ApiPropertyOptional({ example: '2026-05-15' })
  @IsDateString()
  @IsOptional()
  transactionDate?: string

  @ApiPropertyOptional({ example: '超市买菜' })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  note?: string
}
```

### 7.5 异常处理

```typescript
// ✅ 使用 NestJS 内置异常类
throw new NotFoundException('Family not found')
throw new BadRequestException('Invalid invite code')
throw new ForbiddenException('Only the creator can manage members')
throw new UnauthorizedException('Invalid credentials')

// ✅ 不直接抛出原始 Error
// ❌ throw new Error('something wrong')
```

### 7.6 配置管理

```typescript
// 使用 @nestjs/config 统一管理配置
import { registerAs } from '@nestjs/config'

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
}))
```

***

## 8. 数据库与 Prisma 规范

### 8.1 Prisma Schema 规范

```prisma
// ✅ Model 名使用 PascalCase 单数
model Expense {
  id              String    @id @default(uuid()) @db.Char(36)
  familyId        String    @db.Char(36)
  userId          String    @db.Char(36)
  categoryId      String    @db.Char(36)
  amount          Decimal   @db.Decimal(12, 2)
  type            ExpenseType
  transactionDate DateTime  @db.Date
  note            String?
  imageUrl        String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?

  // 关联
  family    Family   @relation(fields: [familyId], references: [id])
  createdBy User     @relation(fields: [userId], references: [id])
  category  Category @relation(fields: [categoryId], references: [id])

  // 索引
  @@index([familyId, transactionDate])
  @@index([familyId, categoryId])
  @@index([familyId, userId])
  @@map("expenses")
}

enum ExpenseType {
  income
  expense
}
```

### 8.2 迁移规范

```bash
# 开发阶段：生成迁移文件
pnpm --filter server prisma migrate dev --name add_expense_notes

# 审查迁移 SQL 后再提交
# 生产环境：执行迁移（不自动生成）
pnpm --filter server prisma migrate deploy
```

**迁移原则**：

1. 每次迁移只做一件事
2. 迁移文件纳入版本控制
3. 禁止手动修改已执行的迁移文件
4. 重命名列需分两步：新增 → 迁移数据 → 删除旧列
5. 迁移前在本地备份数据

### 8.3 查询规范

```typescript
// ✅ 使用 select 而非 include 减少数据传输
const expense = await this.prisma.expense.findUnique({
  where: { id },
  select: {
    id: true,
    amount: true,
    transactionDate: true,
    category: { select: { id: true, name: true } },
    createdBy: { select: { id: true, name: true } },
  },
})

// ✅ 分页查询必须设置 take
const expenses = await this.prisma.expense.findMany({
  take: 20,
  skip: 0,
  orderBy: { transactionDate: 'desc' },
})

// ✅ 使用事务保证一致性
await this.prisma.$transaction(async (tx) => {
  await tx.expense.create({ data: expenseData })
  await tx.budgetLog.create({ data: budgetLogData })
})
```

***

## 9. API 开发规范

### 9.1 统一响应

```typescript
// ✅ 使用拦截器统一包装响应
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        code: 0,
        data,
        message: 'success',
      })),
    )
  }
}
```

### 9.2 分页查询参数

```typescript
import { IsInt, IsOptional, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'

export class PaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1

  @ApiPropertyOptional({ default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  pageSize?: number = 20
}
```

### 9.3 Swagger 文档

```typescript
// 为每个 Controller 和 DTO 添加 Swagger 装饰器
@ApiTags('Expenses')
@Controller('expenses')
export class ExpenseController {
  @Post()
  @ApiOperation({ summary: '新增收支记录' })
  @ApiResponse({ status: 201, description: '创建成功', type: ExpenseResponse })
  @ApiResponse({ status: 400, description: '参数校验失败' })
  create(@Body() dto: CreateExpenseDto) { /*...*/ }
}
```

***

## 10. 测试规范

### 10.1 测试金字塔

```
        ┌──────────┐
        │   E2E    │  Playwright — 核心用户流程
        │  (少量)  │
       ┌┴──────────┴┐
       │ Integration │  Supertest — API 集成测试
       │   (中量)    │
      ┌┴─────────────┴┐
      │    Unit        │  Vitest — 工具函数、Service、Composable
      │    (大量)      │
     └────────────────┘
```

### 10.2 前端测试 (Vitest)

```typescript
// composables/useExpense.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { useExpense } from './useExpense'

describe('useExpense', () => {
  it('should return correct initial state', () => {
    const { expenses, isLoading, error } = useExpense()
    expect(expenses.value).toEqual([])
    expect(isLoading.value).toBe(false)
    expect(error.value).toBeNull()
  })
})
```

### 10.3 后端测试 (Supertest)

```typescript
// expense.controller.spec.ts
import { Test } from '@nestjs/testing'
import * as request from 'supertest'

describe('ExpenseController (e2e)', () => {
  let app

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('/api/expenses (GET) — should return paginated list', () => {
    return request(app.getHttpServer())
      .get('/api/expenses?page=1&pageSize=10')
      .expect(200)
      .expect((res) => {
        expect(res.body.code).toBe(0)
        expect(res.body.pagination).toBeDefined()
      })
  })

  afterAll(async () => {
    await app.close()
  })
})
```

### 10.4 测试覆盖率要求

| 类型              | 最低覆盖率     |
| --------------- | --------- |
| Service 层       | ≥ 80%     |
| 工具函数            | ≥ 90%     |
| Composable      | ≥ 70%     |
| Controller (集成) | 核心路径 100% |
| 整体项目            | ≥ 60%     |

***

## 11. 文档规范

### 11.1 代码注释

本项目遵循 **"无注释代码"** 原则。代码本身应通过变量命名、函数拆分、类型定义来自我解释。

```typescript
// ❌ 错误：冗余注释
// 获取用户
function getUser(id: string) { /*...*/ }

// ✅ 正确：函数名已足够清晰
function getUserById(id: string): Promise<User> { /*...*/ }

// ✅ 可接受：解释非显而易见的业务规则
function calculateLateFee(dueDate: Date, paidDate: Date): number {
  const diffDays = differenceInDays(paidDate, dueDate)
  if (diffDays <= 0) return 0
  // 滞纳金 = 金额 × 0.05% × 逾期天数
  return Math.round(amount * 0.0005 * diffDays * 100) / 100
}
```

### 11.2 API 文档

- 使用 Swagger 装饰器自动生成 OpenAPI 文档
- 每个接口标注请求参数、响应结构、可能的错误码
- Swagger 文档地址：`http://localhost:3000/api/docs`

### 11.3 环境搭建文档

`README.md` 需要包含：

````markdown
## 快速开始

### 前置要求
- Node.js >= 20
- PNPM >= 9
- MySQL >= 8.0

### 安装与运行
```bash
# 安装依赖
pnpm install

# 启动数据库
docker compose up -d mysql

# 初始化数据库
pnpm --filter server prisma migrate dev

# 启动开发服务器
pnpm dev
````

服务启动后：

- 前端：<http://localhost:5173>
- 后端：<http://localhost:3000>
- API 文档：<http://localhost:3000/api/docs>

```

---

> **文档变更记录**

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v1.0 | 2026-05-15 | 初版发布 | 技术团队 |
```

