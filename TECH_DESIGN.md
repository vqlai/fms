# 家庭管理系统 — 技术设计文档 (TDD)

> **版本**：v1.0  
> **状态**：已定稿  
> **日期**：2026-05-15  
> **技术栈**：Vue 3 + Vite / NestJS / TypeScript / MySQL

---

## 目录

1. [技术选型总览](#1-技术选型总览)
2. [系统架构](#2-系统架构)
3. [前端架构设计](#3-前端架构设计)
4. [后端架构设计](#4-后端架构设计)
5. [数据库设计](#5-数据库设计)
6. [API 设计规范](#6-api-设计规范)
7. [核心模块详细设计](#7-核心模块详细设计)
8. [安全设计](#8-安全设计)
9. [部署架构](#9-部署架构)
10. [监控与日志](#10-监控与日志)

---

## 1. 技术选型总览

### 1.1 选型原则

- **类型安全优先**：全栈 TypeScript，前后端共享类型定义
- **轻量高效**：避免过度设计，MVP 阶段保持架构扁平
- **生态成熟**：优先选择社区活跃、文档完善的库
- **易维护**：统一代码风格、目录结构、命名规范

### 1.2 技术栈一览

| 层级 | 技术 | 版本 | 选型理由 |
|------|------|------|----------|
| **前端框架** | Vue 3 (Composition API) | ^3.5 | 渐进式、学习曲线友好、生态成熟 |
| **构建工具** | Vite | ^6.0 | 极速 HMR、Tree Shaking、开箱即用 |
| **语言** | TypeScript | ^5.7 | 类型安全、智能提示、降低运行时错误 |
| **路由** | Vue Router | ^4.5 | 官方路由方案 |
| **状态管理** | Pinia | ^2.3 | Vue 3 官方推荐、TypeScript 原生支持 |
| **HTTP 客户端** | Axios | ^1.7 | 拦截器、请求取消、成熟稳定 |
| **UI 框架** | Tailwind CSS + Headless UI | ^4.0 | 原子化 CSS、无样式组件、灵活定制 |
| **图表库** | Chart.js + vue-chartjs | ^4.4 | 轻量、Canvas 渲染、社区活跃 |
| **日历组件** | FullCalendar | ^6.1 | 功能齐全、视图丰富、可扩展 |
| **表单验证** | vee-validate + zod | ^4.15 | 声明式校验、TypeScript 友好 |
| **后端框架** | NestJS | ^11.0 | 企业级架构、依赖注入、模块化 |
| **ORM** | Prisma | ^6.0 | 类型安全、迁移管理、直观的数据建模 |
| **数据库** | MySQL | ^8.0 | 关系型、JSON 支持、InnoDB 事务 |
| **认证** | JWT + Passport | — | 无状态认证、标准化 |
| **API 文档** | Swagger (OpenAPI) | ^3.0 | 自动生成、在线调试 |
| **任务调度** | @nestjs/schedule | ^5.0 | 定时提醒、预算重置 |
| **文件存储** | MinIO / 本地文件系统 | — | 图片凭证存储 |
| **日志系统** | Winston / Pino | — | 结构化日志、级别控制 |
| **容器化** | Docker + Docker Compose | — | 一致环境、一键部署 |

### 1.3 开发环境

| 工具 | 用途 |
|------|------|
| PNPM | 包管理器（Monorepo） |
| ESLint + Prettier | 代码规范与格式化 |
| Husky + lint-staged | Git Hooks 自动检查 |
| Vitest | 前端单元测试 |
| Supertest | 后端 E2E 测试 |
| Playwright | 端到端测试 |

---

## 2. 系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────┐
│                       Client Layer                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │        Vue 3 SPA (Vite + TypeScript)              │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │  │
│  │  │  Views   │ │Components│ │  Composables      │  │  │
│  │  └────┬─────┘ └────┬─────┘ └────────┬─────────┘  │  │
│  │       └─────────────┼───────────────┘             │  │
│  │              ┌──────┴──────┐                      │  │
│  │              │   Stores    │                      │  │
│  │              │  (Pinia)    │                      │  │
│  │              └──────┬──────┘                      │  │
│  │              ┌──────┴──────┐                      │  │
│  │              │   API Layer │                      │  │
│  │              │  (Axios)    │                      │  │
│  │              └──────┬──────┘                      │  │
│  └─────────────────────┼────────────────────────────┘  │
└────────────────────────┼────────────────────────────────┘
                         │ HTTPS
┌────────────────────────┼────────────────────────────────┐
│              Server Layer (NestJS)                       │
│  ┌─────────────────────┴──────────────────────────────┐ │
│  │                  Middleware Pipeline                 │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │ │
│  │  │  CORS    │→│  Auth    │→│  Validation      │   │ │
│  │  └──────────┘ └──────────┘ └──────────────────┘   │ │
│  └─────────────────────────────────────────────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Auth    │ │ Expense  │ │ Schedule │ │  Family  │  │
│  │  Module  │ │  Module  │ │  Module  │ │  Module  │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘  │
│       └─────────────┼────────────┼────────────┘        │
│              ┌──────┴──────┐     │                      │
│              │  Prisma     │     │                      │
│              │  (ORM)      │     │                      │
│              └──────┬──────┘     │                      │
│                     │            │                      │
└─────────────────────┼────────────┼──────────────────────┘
                      │            │
┌─────────────────────┼────────────┼──────────────────────┐
│            Data Layer                │                    │
│  ┌──────────────────┐ ┌────────────┴─────────────────┐ │
│  │   MySQL        │ │       File Storage            │ │
│  │   (主数据库)     │ │   (图片/文件凭证)            │ │
│  └──────────────────┘ └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 2.2 项目目录结构

```
family-manager/
├── client/                          # 前端项目
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── api/                     # API 请求层
│   │   │   ├── axios.ts             # Axios 实例与拦截器
│   │   │   ├── auth.ts
│   │   │   ├── expense.ts
│   │   │   ├── schedule.ts
│   │   │   └── family.ts
│   │   ├── assets/                  # 静态资源
│   │   │   ├── images/
│   │   │   └── styles/
│   │   │       └── main.css         # Tailwind 入口
│   │   ├── components/              # 可复用组件
│   │   │   ├── common/              # 通用组件
│   │   │   │   ├── AppHeader.vue
│   │   │   │   ├── AppSidebar.vue
│   │   │   │   ├── EmptyState.vue
│   │   │   │   └── Skeleton.vue
│   │   │   ├── expense/             # 财务相关组件
│   │   │   │   ├── ExpenseForm.vue
│   │   │   │   ├── ExpenseList.vue
│   │   │   │   ├── ExpenseFilter.vue
│   │   │   │   └── BudgetProgress.vue
│   │   │   ├── schedule/            # 日程相关组件
│   │   │   │   ├── FamilyCalendar.vue
│   │   │   │   ├── ScheduleForm.vue
│   │   │   │   └── TodoList.vue
│   │   │   ├── inventory/           # 库存相关组件
│   │   │   │   ├── InventoryGrid.vue
│   │   │   │   ├── InventoryDetail.vue
│   │   │   │   ├── InventoryForm.vue
│   │   │   │   └── ShoppingList.vue
│   │   │   └── dashboard/           # 仪表盘组件
│   │   │       ├── SummaryCard.vue
│   │   │       ├── RecentSchedule.vue
│   │   │       └── QuickActions.vue
│   │   ├── composables/             # 组合式函数
│   │   │   ├── useAuth.ts
│   │   │   ├── useFamily.ts
│   │   │   ├── useExpense.ts
│   │   │   ├── useSchedule.ts
│   │   │   ├── useInventory.ts
│   │   │   └── useNotification.ts
│   │   ├── layouts/                 # 布局组件
│   │   │   ├── DefaultLayout.vue
│   │   │   └── AuthLayout.vue
│   │   ├── router/                  # 路由配置
│   │   │   └── index.ts
│   │   ├── stores/                  # Pinia 状态管理
│   │   │   ├── auth.ts
│   │   │   ├── family.ts
│   │   │   └── ui.ts
│   │   ├── types/                   # TypeScript 类型定义
│   │   │   ├── expense.ts
│   │   │   ├── schedule.ts
│   │   │   ├── family.ts
│   │   │   └── api.ts               # 通用 API 响应类型
│   │   ├── utils/                   # 工具函数
│   │   │   ├── format.ts            # 金额/日期格式化
│   │   │   ├── validate.ts          # 表单校验
│   │   │   └── constants.ts         # 常量定义
│   │   ├── App.vue
│   │   └── main.ts
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── server/                          # 后端项目
│   ├── src/
│   │   ├── modules/                 # 业务模块
│   │   │   ├── auth/
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── login.dto.ts
│   │   │   │   │   └── register.dto.ts
│   │   │   │   ├── guards/
│   │   │   │   │   └── jwt-auth.guard.ts
│   │   │   │   └── strategies/
│   │   │   │       └── jwt.strategy.ts
│   │   │   ├── user/
│   │   │   │   ├── user.module.ts
│   │   │   │   ├── user.controller.ts
│   │   │   │   └── user.service.ts
│   │   │   ├── family/
│   │   │   │   ├── family.module.ts
│   │   │   │   ├── family.controller.ts
│   │   │   │   ├── family.service.ts
│   │   │   │   └── dto/
│   │   │   ├── expense/
│   │   │   │   ├── expense.module.ts
│   │   │   │   ├── expense.controller.ts
│   │   │   │   ├── expense.service.ts
│   │   │   │   └── dto/
│   │   │   ├── schedule/
│   │   │   │   ├── schedule.module.ts
│   │   │   │   ├── schedule.controller.ts
│   │   │   │   ├── schedule.service.ts
│   │   │   │   └── dto/
│   │   │   ├── inventory/
│   │   │   │   ├── inventory.module.ts
│   │   │   │   ├── inventory.controller.ts
│   │   │   │   ├── inventory.service.ts
│   │   │   │   └── dto/
│   │   │   └── common/              # 公共模块
│   │   │       ├── prisma/
│   │   │       │   └── prisma.service.ts
│   │   │       ├── decorators/
│   │   │       │   ├── current-user.decorator.ts
│   │   │       │   └── current-family.decorator.ts
│   │   │       ├── guards/
│   │   │       │   └── family-role.guard.ts
│   │   │       └── interceptors/
│   │   │           └── transform.interceptor.ts
│   │   ├── config/                  # 配置模块
│   │   │   ├── app.config.ts
│   │   │   └── database.config.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── test/
│   ├── tsconfig.json
│   └── package.json
│
├── shared/                          # 前后端共享类型
│   ├── types/
│   │   ├── expense.ts
│   │   ├── schedule.ts
│   │   ├── inventory.ts
│   │   ├── family.ts
│   │   └── api.ts
│   └── constants/
│       └── index.ts
│
├── docker-compose.yml
├── .gitignore
├── pnpm-workspace.yaml
├── package.json                     # 根 package.json
└── README.md
```

---

## 3. 前端架构设计

### 3.1 技术栈版本详情

| 依赖 | 版本 | 说明 |
|------|------|------|
| vue | ^3.5 | 核心框架 |
| vue-router | ^4.5 | SPA 路由 |
| pinia | ^2.3 | 状态管理 |
| axios | ^1.7 | HTTP 请求 |
| @vueuse/core | ^12.0 | 组合式工具集 |
| vee-validate | ^4.15 | 表单校验 |
| zod | ^3.24 | Schema 校验 |
| chart.js | ^4.4 | 图表绘制 |
| vue-chartjs | ^5.3 | Vue 集成 Chart.js |
| @fullcalendar/vue3 | ^6.1 | 日历组件 |
| @fullcalendar/daygrid | ^6.1 | 月视图 |
| @fullcalendar/timegrid | ^6.1 | 周/日视图 |
| @headlessui/vue | ^2.2 | 无样式 Headless UI |
| @heroicons/vue | ^2.2 | 图标库 |
| date-fns | ^4.1 | 日期处理 |

### 3.2 路由设计

```typescript
// client/src/router/index.ts
const routes = [
  {
    path: '/',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
      },
      {
        path: 'expenses',
        name: 'Expenses',
        component: () => import('@/views/Expenses.vue'),
      },
      {
        path: 'budgets',
        name: 'Budgets',
        component: () => import('@/views/Budgets.vue'),
        meta: { requiresRole: 'creator' },
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/views/Reports.vue'),
      },
      {
        path: 'calendar',
        name: 'Calendar',
        component: () => import('@/views/Calendar.vue'),
      },
      {
        path: 'todos',
        name: 'Todos',
        component: () => import('@/views/Todos.vue'),
      },
      {
        path: 'inventory',
        name: 'Inventory',
        component: () => import('@/views/Inventory.vue'),
      },
      {
        path: 'shopping-list',
        name: 'ShoppingList',
        component: () => import('@/views/ShoppingList.vue'),
      },
      {
        path: 'family',
        name: 'Family',
        component: () => import('@/views/Family.vue'),
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/Settings.vue'),
      },
    ],
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/auth/Login.vue'),
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/views/auth/Register.vue'),
      },
    ],
  },
]
```

### 3.3 状态管理 (Pinia)

```typescript
// client/src/stores/auth.ts — 示意结构
interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
}
// actions: login(), register(), logout(), refreshToken()

// client/src/stores/family.ts — 示意结构
interface FamilyState {
  currentFamily: Family | null
  families: Family[]
  members: FamilyMember[]
}
// actions: fetchFamilies(), switchFamily(), inviteMember()

// client/src/stores/ui.ts — 示意结构
interface UIState {
  sidebarCollapsed: boolean
  globalLoading: boolean
  toast: { type, message } | null
}
```

### 3.4 组件树（关键页面）

```
App.vue
├── DefaultLayout.vue
│   ├── AppSidebar.vue
│   │   ├── FamilySwitcher.vue
│   │   └── NavItem.vue (×N)
│   ├── AppHeader.vue
│   │   ├── Breadcrumb.vue
│   │   └── UserMenu.vue
│   └── <router-view>
│       └── Dashboard.vue
│           ├── SummaryCard.vue (×3: 收入/支出/结余)
│           ├── BudgetProgress.vue
│           ├── RecentSchedule.vue
│           └── QuickActions.vue
│
│       └── Expenses.vue
│           ├── ExpenseFilter.vue
│           ├── ExpenseList.vue
│           │   └── ExpenseItem.vue (×N)
│           ├── ExpenseForm.vue        # 抽屉/模态框
│           └── ExpenseDrawer.vue
│
│       └── Calendar.vue
│           ├── CalendarHeader.vue     # 月份切换、视图切换
│           ├── MemberFilter.vue
│           ├── FamilyCalendar.vue     # FullCalendar 封装
│           └── ScheduleForm.vue       # 抽屉/模态框
│
│       └── Inventory.vue
│           ├── InventoryFilter.vue    # 搜索+分类+位置筛选
│           ├── InventoryGrid.vue      # 物品卡片网格
│           │   └── InventoryCard.vue (×N)
│           ├── InventoryForm.vue      # 入库/出库抽屉
│           └── InventoryDetail.vue    # 物品详情+流水
│
│       └── ShoppingList.vue
│           ├── ShoppingItem.vue (×N)
│           └── BatchStockIn.vue       # 一键入库弹窗
│
└── AuthLayout.vue
    ├── Login.vue
    └── Register.vue
```

### 3.5 数据流模式

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   Vue Page  │────→│  Composable  │────→│  API Layer   │────→ Server
│  (View)     │←────│  (useXxx)   │←────│  (Axios)     │←────
└─────────────┘     └──────┬──────┘     └──────────────┘
                           │
                    ┌──────┴──────┐
                    │   Pinia     │
                    │   Store     │
                    └─────────────┘

数据流向：
1. View 调用 composable 方法
2. Composable 通过 API Layer 发起请求
3. 响应数据进入 Pinia Store（需要跨组件共享的）或 composable 的 ref（局部状态）
4. View 通过 computed/ref 响应式渲染
```

---

## 4. 后端架构设计

### 4.1 NestJS 模块依赖图

```mermaid
graph TD
    AppModule --> AuthModule
    AppModule --> UserModule
    AppModule --> FamilyModule
    AppModule --> ExpenseModule
    AppModule --> ScheduleModule
    AppModule --> InventoryModule
    AppModule --> PrismaModule

    AuthModule --> UserModule
    FamilyModule --> UserModule
    ExpenseModule --> FamilyModule
    ScheduleModule --> FamilyModule
    InventoryModule --> FamilyModule
```

### 4.2 模块职责

| 模块 | 职责 | Controller 数量 | Service 数量 |
|------|------|:---:|:---:|
| **AppModule** | 根模块，注册全局中间件、拦截器、管道 | 0 | 0 |
| **PrismaModule** | 数据库连接管理，全局导出 PrismaService | 0 | 1 |
| **AuthModule** | 注册、登录、JWT 签发与校验 | 1 | 1 |
| **UserModule** | 用户信息 CRUD、个人设置 | 1 | 1 |
| **FamilyModule** | 家庭组 CRUD、成员邀请、角色管理 | 1 | 1 |
| **ExpenseModule** | 收支记录 CRUD、分类管理、预算管理、报表查询 | 1 | 1 |
| **ScheduleModule** | 日程 CRUD、待办 CRUD、提醒调度 | 1 | 1 |
| **InventoryModule** | 物品库存 CRUD、入库/出库流水、保质期预警、采购清单 | 1 | 1 |

### 4.3 请求处理管线

```
HTTP Request
    │
    ▼
┌──────────────┐
│  CORS        │  允许跨域
├──────────────┤
│  Helmet      │  HTTP 安全头
├──────────────┤
│  Rate Limiter│  限流（生产环境）
├──────────────┤
│  Validation  │  class-validator DTO 校验
│  Pipe        │
├──────────────┤
│  Auth Guard  │  JWT 鉴权（白名单路由跳过）
├──────────────┤
│  Family      │  校验用户是否属于当前家庭组
│  Guard       │
├──────────────┤
│  Controller  │  路由匹配 → Service 调用
├──────────────┤
│  Interceptor │  统一响应包装 { code, data, message }
├──────────────┤
│  Exception   │  统一异常处理 → 标准错误响应
│  Filter      │
└──────────────┘
    │
    ▼
HTTP Response
```

### 4.4 统一响应格式

```typescript
// shared/types/api.ts
interface ApiResponse<T = unknown> {
  code: number       // 业务状态码 0=成功
  data: T
  message: string
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}
```

**业务状态码约定**：

| 范围 | 含义 |
|------|------|
| 0 | 成功 |
| 1000-1999 | 参数错误（校验失败） |
| 2000-2999 | 认证/授权错误 |
| 3000-3999 | 业务逻辑错误 |
| 4000-4999 | 资源不存在 |
| 5000-5999 | 系统内部错误 |

---

## 5. 数据库设计

### 5.1 ER 图（核心表）

```mermaid
erDiagram
    User ||--o{ FamilyMember : "is member"
    User ||--o{ Expense : "creates"
    User ||--o{ Schedule : "creates"
    Family ||--o{ FamilyMember : "contains"
    Family ||--o{ Expense : "has"
    Family ||--o{ Schedule : "has"
    Family ||--o{ Category : "owns"
    Family ||--o{ Budget : "has"
    Category ||--o{ Expense : "categorizes"
    Schedule }o--o{ User : "participants"
    Todo ||--o{ User : "assignees"

    User {
        uuid id PK
        string email UK
        string phone UK
        string password_hash
        string name
        string avatar_url
        datetime created_at
        datetime updated_at
    }

    Family {
        uuid id PK
        string name
        string invite_code UK
        uuid created_by FK
        datetime invite_code_expires_at
        datetime created_at
        datetime updated_at
    }

    FamilyMember {
        uuid id PK
        uuid family_id FK
        uuid user_id FK
        enum role "creator|member|viewer"
        datetime joined_at
    }

    Category {
        uuid id PK
        uuid family_id FK
        string name
        enum type "income|expense"
        string icon
        string color
        int sort_order
        boolean is_system
        datetime created_at
    }

    Expense {
        uuid id PK
        uuid family_id FK
        uuid user_id FK
        uuid category_id FK
        decimal amount
        enum type "income|expense"
        date transaction_date
        string note
        string image_url
        datetime created_at
        datetime updated_at
        datetime deleted_at
    }

    Budget {
        uuid id PK
        uuid family_id FK
        uuid category_id FK
        decimal amount
        string period "monthly|yearly"
        datetime created_at
    }

    Schedule {
        uuid id PK
        uuid family_id FK
        uuid created_by FK
        string title
        datetime start_time
        datetime end_time
        boolean is_all_day
        string repeat_rule
        string note
        datetime created_at
        datetime updated_at
    }

    ScheduleParticipant {
        uuid id PK
        uuid schedule_id FK
        uuid user_id FK
    }

    Todo {
        uuid id PK
        uuid family_id FK
        uuid created_by FK
        string title
        string description
        int priority "1=high|2=medium|3=low"
        datetime due_date
        boolean is_completed
        datetime completed_at
        datetime created_at
        datetime updated_at
    }

    TodoAssignee {
        uuid id PK
        uuid todo_id FK
        uuid user_id FK
    }
```

### 5.2 索引策略

| 表名 | 索引 | 用途 |
|------|------|------|
| User | `(email)` UNIQUE | 邮箱登录查询 |
| User | `(phone)` UNIQUE | 手机号登录查询 |
| Family | `(invite_code)` UNIQUE | 邀请码查询 |
| FamilyMember | `(family_id, user_id)` UNIQUE | 防重复加入 |
| Expense | `(family_id, transaction_date)` | 按日期范围查询 |
| Expense | `(family_id, category_id)` | 按分类筛选 |
| Expense | `(family_id, user_id)` | 按成员筛选 |
| Schedule | `(family_id, start_time)` | 日历查询 |
| Todo | `(family_id, due_date)` | 待办排序 |
| Todo | `(family_id, is_completed)` | 按完成状态筛选 |
| InventoryItem | `(family_id, category)` | 按分类筛选 |
| InventoryItem | `(family_id, expiry_date)` | 保质期预警查询 |
| InventoryItem | `(family_id, location)` | 按存放位置筛选 |
| StockLog | `(item_id, created_at)` | 物品流水时间排序 |

### 5.3 数据隔离策略

所有业务表均包含 `family_id` 外键，查询时强制带上 `family_id` 条件：

```typescript
// Prisma 查询示例 — 确保数据隔离
this.prisma.expense.findMany({
  where: {
    familyId: currentFamilyId,  // 必须携带
    // ...其他条件
  }
})
```

**Prisma Middleware 自动注入 familyId**（方案）：

```typescript
// 全局 Prisma Middleware
prisma.$use(async (params, next) => {
  if (['Expense', 'Schedule', 'Todo', 'Category', 'Budget', 'InventoryItem', 'StockLog'].includes(params.model)) {
    if (params.action === 'findMany' || params.action === 'findFirst') {
      // 从 AsyncLocalStorage 获取当前请求的 familyId
      const familyId = requestContext.familyId
      if (familyId) {
        params.args.where.familyId = familyId
      }
    }
  }
  return next(params)
})
```

---

## 6. API 设计规范

### 6.1 RESTful 风格

| 方法 | 资源命名 | 示例 |
|------|----------|------|
| GET | 复数名词 | `GET /api/expenses` |
| GET | 带 ID | `GET /api/expenses/:id` |
| POST | 复数名词 | `POST /api/expenses` |
| PATCH | 带 ID | `PATCH /api/expenses/:id` |
| DELETE | 带 ID | `DELETE /api/expenses/:id` |

### 6.2 完整 API 列表

#### 认证模块

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|:---:|
| POST | `/api/auth/register` | 用户注册 | ❌ |
| POST | `/api/auth/login` | 用户登录 | ❌ |
| POST | `/api/auth/refresh` | 刷新 Token | ❌(需 refresh_token) |
| GET | `/api/auth/me` | 获取当前用户信息 | ✅ |

#### 家庭模块

| 方法 | 路径 | 说明 | 角色 |
|------|------|------|------|
| POST | `/api/families` | 创建家庭组 | Creator |
| GET | `/api/families` | 获取我的家庭列表 | 任意 |
| GET | `/api/families/:id` | 获取家庭详情 | 任意 |
| POST | `/api/families/join` | 通过邀请码加入 | 任意 |
| POST | `/api/families/:id/invite` | 生成/刷新邀请码 | Creator |
| GET | `/api/families/:id/members` | 家庭成员列表 | 任意 |
| PATCH | `/api/families/:id/members/:memberId` | 修改成员角色 | Creator |
| DELETE | `/api/families/:id/members/:memberId` | 移除成员 | Creator |

#### 财务模块

| 方法 | 路径 | 说明 | 角色 |
|------|------|------|------|
| GET | `/api/expenses` | 收支列表（分页/筛选） | 任意 |
| POST | `/api/expenses` | 新增收支记录 | Member+ |
| GET | `/api/expenses/:id` | 收支详情 | 任意 |
| PATCH | `/api/expenses/:id` | 编辑收支记录 | 创建者+Creator |
| DELETE | `/api/expenses/:id` | 删除（软删） | 创建者+Creator |
| GET | `/api/categories` | 分类列表 | 任意 |
| POST | `/api/categories` | 新增自定义分类 | Creator |
| PATCH | `/api/categories/:id` | 编辑分类 | Creator |
| DELETE | `/api/categories/:id` | 删除/禁用分类 | Creator |
| GET | `/api/budgets` | 预算列表 | 任意 |
| POST | `/api/budgets` | 设置预算 | Creator |
| PATCH | `/api/budgets/:id` | 编辑预算 | Creator |
| GET | `/api/reports/summary` | 月度汇总报表 | 任意 |
| GET | `/api/reports/trend` | 月度趋势报表 | 任意 |
| GET | `/api/reports/category` | 分类占比报表 | 任意 |
| GET | `/api/reports/member` | 成员消费统计 | 任意 |

#### 日程模块

| 方法 | 路径 | 说明 | 角色 |
|------|------|------|------|
| GET | `/api/schedules` | 日程列表（按日期范围） | 任意 |
| POST | `/api/schedules` | 创建日程 | Member+ |
| GET | `/api/schedules/:id` | 日程详情 | 任意 |
| PATCH | `/api/schedules/:id` | 编辑日程 | 创建者+Creator |
| DELETE | `/api/schedules/:id` | 删除日程 | 创建者+Creator |
| GET | `/api/todos` | 待办列表 | 任意 |
| POST | `/api/todos` | 创建待办 | Member+ |
| PATCH | `/api/todos/:id` | 编辑待办 | 创建者+负责人 |
| PATCH | `/api/todos/:id/complete` | 标记完成 | 负责人 |
| DELETE | `/api/todos/:id` | 删除待办 | 创建者+Creator |

#### 库存模块

| 方法 | 路径 | 说明 | 角色 |
|------|------|------|------|
| GET | `/api/inventory/items` | 物品列表（分页/分类/位置筛选） | 任意 |
| POST | `/api/inventory/items` | 新增物品（含初始入库） | Member+ |
| GET | `/api/inventory/items/:id` | 物品详情 | 任意 |
| PATCH | `/api/inventory/items/:id` | 编辑物品信息 | Member+ |
| DELETE | `/api/inventory/items/:id` | 删除物品 | Creator |
| POST | `/api/inventory/items/:id/stock-in` | 入库（增加数量） | Member+ |
| POST | `/api/inventory/items/:id/stock-out` | 出库/消耗（减少数量） | Member+ |
| GET | `/api/inventory/items/:id/logs` | 出入库流水记录 | 任意 |
| GET | `/api/inventory/alerts` | 保质期 + 低库存预警 | 任意 |
| GET | `/api/inventory/shopping-list` | 采购清单（低库存物品） | 任意 |
| POST | `/api/inventory/shopping-list/checkout` | 采购完成一键入库 | Member+ |

### 6.3 请求/响应示例

```typescript
// POST /api/expenses — 请求体
{
  "type": "expense",
  "amount": 128.50,
  "categoryId": "uuid",
  "transactionDate": "2026-05-15",
  "note": "超市买菜",
  "imageUrl": null
}

// 响应
{
  "code": 0,
  "data": {
    "id": "uuid",
    "type": "expense",
    "amount": "128.50",
    "category": { "id": "uuid", "name": "餐饮", "icon": "🍜" },
    "transactionDate": "2026-05-15",
    "note": "超市买菜",
    "createdBy": { "id": "uuid", "name": "张三" },
    "createdAt": "2026-05-15T10:30:00Z"
  },
  "message": "success"
}

// GET /api/reports/summary?month=2026-05 — 响应
{
  "code": 0,
  "data": {
    "month": "2026-05",
    "totalIncome": "25000.00",
    "totalExpense": "18320.50",
    "balance": "6679.50",
    "budgetTotal": "20000.00",
    "budgetRemaining": "1679.50",
    "budgetPercent": 91.6,
    "categoryBreakdown": [
      { "categoryId": "uuid", "categoryName": "餐饮", "icon": "🍜", "amount": "3200.00", "percent": 17.5 },
      ...
    ]
  },
  "message": "success"
}

// POST /api/inventory/items — 请求体
{
  "name": "牛奶",
  "category": "食材生鲜",
  "quantity": 2,
  "unit": "瓶",
  "location": "冰箱冷藏",
  "expiryDate": "2026-05-22",
  "minQuantity": 1,
  "note": "1L装"
}

// GET /api/inventory/alerts — 响应
{
  "code": 0,
  "data": {
    "expiringSoon": [
      { "id": "uuid", "name": "牛奶", "expiryDate": "2026-05-20", "daysLeft": 3 }
    ],
    "lowStock": [
      { "id": "uuid", "name": "洗衣液", "quantity": 0, "minQuantity": 1 }
    ],
    "expired": [
      { "id": "uuid", "name": "面包", "expiryDate": "2026-05-10", "daysOverdue": 7 }
    ]
  },
  "message": "success"
}
```

---

## 7. 核心模块详细设计

### 7.1 用户认证流程

```
注册流程：
  用户提交注册信息
  → class-validator 校验 DTO
  → 检查邮箱/手机号唯一性
  → bcrypt 加密密码（saltRounds=12）
  → 创建 User 记录
  → 生成 JWT access_token（7天） + refresh_token（30天）
  → 返回 token + user 信息

登录流程：
  用户提交凭证
  → 校验 DTO
  → 查找用户
  → bcrypt 比较密码
  → 生成 Token pair
  → 返回

Token 刷新：
  客户端 401 被拦截
  → 使用 refresh_token 调用 /auth/refresh
  → 验证 refresh_token
  → 签发新 access_token
```

### 7.2 定时任务

```typescript
// server/src/modules/schedule/schedule.task.ts
import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'

@Injectable()
export class ScheduleTask {
  // 每月 1 号 00:00 重置预算
  @Cron('0 0 1 * *')
  async resetBudgets() { /* ... */ }

  // 每天 08:00 发送日程提醒（检查未来 1 小时内的日程）
  @Cron('0 8 * * *')
  async sendScheduleReminders() { /* ... */ }

  // 每天 20:00 发送未完成待办提醒
  @Cron('0 20 * * *')
  async sendTodoReminders() { /* ... */ }

  // 每小时清理过期邀请码
  @Cron('0 * * * *')
  async expireInviteCodes() { /* ... */ }
}
```

### 7.3 图表数据查询（报表模块）

```typescript
// 月度趋势查询 — 原生 SQL 示例（MySQL 语法）
const trend = await this.prisma.$queryRaw`
  SELECT
    DATE_FORMAT(transaction_date, '%Y-%m-01') as month,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
  FROM expenses
  WHERE family_id = ${familyId}
    AND transaction_date >= ${sixMonthsAgo}
    AND deleted_at IS NULL
  GROUP BY DATE_FORMAT(transaction_date, '%Y-%m-01')
  ORDER BY month ASC
`

// 分类占比查询
const categoryBreakdown = await this.prisma.expense.groupBy({
  by: ['categoryId'],
  where: {
    familyId,
    type: 'expense',
    transactionDate: { gte: startOfMonth, lte: endOfMonth },
    deletedAt: null,
  },
  _sum: { amount: true },
  orderBy: { _sum: { amount: 'desc' } },
})
```

---

## 8. 安全设计

### 8.1 认证安全

| 措施 | 实现 |
|------|------|
| 密码哈希 | bcrypt, saltRounds=12 |
| JWT 签名 | HS256, 强随机密钥（环境变量注入） |
| Token 过期 | access_token: 7天, refresh_token: 30天 |
| Token 刷新 | refresh_token 一次性使用后轮换 |
| 登录限流 | 5 次/分钟/IP（NestJS Throttler） |

### 8.2 数据安全

| 措施 | 实现 |
|------|------|
| 数据隔离 | family_id 强制过滤，Global Guard 校验归属 |
| SQL 注入防护 | Prisma 参数化查询，禁止拼接 SQL |
| XSS 防护 | 前端输出转义 + Helmet 头设置 |
| CORS | 白名单域名，生产环境收紧 |
| 敏感字段 | password_hash 查询时默认 exclude |
| 软删除 | Expense/Todo 使用 deleted_at，不物理删除 |

### 8.3 输入校验

```typescript
// DTO 示例 — 多重校验
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

---

## 9. 部署架构

### 9.1 Docker Compose 编排

```yaml
# docker-compose.yml — 开发环境
version: '3.8'
services:
  mysql:
    image: mysql:8.4
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: family_manager
      MYSQL_USER: fm_user
      MYSQL_PASSWORD: ${DB_PASSWORD}
    ports:
      - '3306:3306'
    volumes:
      - mysqldata:/var/lib/mysql
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci

  server:
    build: ./server
    ports:
      - '3000:3000'
    environment:
      DATABASE_URL: mysql://fm_user:${DB_PASSWORD}@mysql:3306/family_manager
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - mysql

  client:
    build: ./client
    ports:
      - '5173:80'
    depends_on:
      - server

volumes:
  mysqldata:
```

### 9.2 生产部署建议

| 环境 | 方案 |
|------|------|
| **小规模** | 单台 VPS + Docker Compose |
| **中等规模** | Nginx 反向代理 + PM2 进程管理 |
| **云部署** | 阿里云 ECS / 腾讯云 CVM + 云数据库 MySQL |
| **静态资源** | Nginx 托管 Vue SPA 静态文件 |
| **CDN** | 静态资源走 CDN（可选） |

### 9.3 环境变量

```bash
# server/.env
DATABASE_URL=mysql://user:password@localhost:3306/family_manager
JWT_SECRET=your-256-bit-secret
JWT_REFRESH_SECRET=your-another-256-bit-secret
UPLOAD_DIR=./uploads
CORS_ORIGINS=http://localhost:5173
PORT=3000
NODE_ENV=development

# client/.env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_TITLE=家庭管家
```

---

## 10. 监控与日志

### 10.1 日志规范

```typescript
// 使用 NestJS Logger
this.logger.log(`User ${userId} created expense #${expenseId}`)
this.logger.warn(`Budget exceeded for family ${familyId}: ${percent}%`)
this.logger.error(`Failed to send reminder: ${error.message}`, error.stack)
```

### 10.2 性能监控（建议引入）

| 工具 | 用途 |
|------|------|
| NestJS Axios Interceptors | API 请求耗时记录 |
| Prisma Query Logging | 慢查询日志（开发环境） |
| PM2 metrics | 进程级别 CPU/内存监控 |

---

> **文档变更记录**

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v1.0 | 2026-05-15 | 初版发布 | 技术团队 |
