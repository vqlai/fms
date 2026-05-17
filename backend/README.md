# 家庭管家 — 后端服务

> 基于 NestJS 11 构建的 RESTful API 服务，为"家庭管家"应用提供数据持久化和业务逻辑支持。

---

## 技术栈

| 技术 | 版本 | 用途 |
|------|:----:|------|
| NestJS | ^11.0 | 后端框架 |
| TypeScript | ^5.7 | 开发语言 |
| Prisma | ^6.0 | ORM 数据库操作 |
| MySQL | ^8.0 | 数据库 |
| Passport + JWT | — | 认证鉴权 |
| class-validator | — | DTO 参数校验 |
| Swagger | — | API 文档 |
| @nestjs/schedule | ^5.0 | 定时任务 |

---

## 目录结构

```
backend/
├── prisma/
│   └── schema.prisma              # 数据库模型定义（14 个模型）
├── src/
│   ├── config/
│   │   └── app.config.ts          # 全局配置（JWT、bcrypt、邀请码等）
│   ├── modules/
│   │   ├── auth/                  # 认证模块（注册/登录/JWT 签发）
│   │   ├── common/                # 公共模块（Prisma、Guards、Decorators、Interceptors）
│   │   ├── expense/               # 财务管理模块（收支/分类/预算/统计）
│   │   ├── family/                # 家庭管理模块（创建/加入/成员管理）
│   │   ├── inventory/             # 物品库存模块（入库/出库/库存流水）
│   │   ├── schedule/              # 日程管理模块（日程/参与者/提醒）
│   │   ├── todo/                  # 待办事项模块（任务/指派人）
│   │   └── user/                  # 用户管理模块（个人信息）
│   ├── app.module.ts              # 根模块
│   └── main.ts                    # 应用入口
├── .eslintrc.cjs                  # ESLint 配置
├── .prettierrc                    # Prettier 配置
├── nest-cli.json                  # NestJS CLI 配置
├── package.json                   # 依赖管理
├── tsconfig.build.json            # 构建配置
└── tsconfig.json                  # TypeScript 配置
```

---

## 快速开始

### 环境要求

- Node.js >= 18
- PNPM >= 8
- MySQL >= 8.0

### 安装与运行

```bash
# 1. 进入后端目录
cd backend

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
#    编辑 .env 文件，填入 MySQL 数据库连接信息，如密码等
#    确保 MySQL 8.4 服务已启动

# 4. 生成 Prisma Client（类型安全的 ORM 客户端）
npx prisma generate

# 5. 执行数据库迁移（创建所有表结构）
npx prisma migrate dev --name init

# 6. 启动开发服务器（热重载，默认 http://localhost:3000）
pnpm start:dev
```

服务默认启动在 `http://localhost:3000`。

### API 文档

启动服务后访问 Swagger 文档：

```
http://localhost:3000/api/docs
```

---

## API 概览

### 认证模块

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|:----:|
| POST | `/api/auth/register` | 用户注册 | ❌ |
| POST | `/api/auth/login` | 用户登录 | ❌ |
| POST | `/api/auth/switch-family` | 切换当前家庭 | ✅ |

### 家庭模块

| 方法 | 路径 | 说明 | 角色 |
|------|------|------|:----:|
| POST | `/api/families` | 创建家庭组 | ✅ |
| POST | `/api/families/join` | 通过邀请码加入 | ✅ |
| GET | `/api/families` | 获取用户的所有家庭组 | ✅ |
| GET | `/api/families/current` | 获取当前家庭详情 | ✅ |
| GET | `/api/families/current/members` | 获取成员列表 | ✅ |
| PATCH | `/api/families/current/members/:memberId` | 更新成员角色 | Creator |
| DELETE | `/api/families/current/members/:memberId` | 移除成员 | Creator |
| POST | `/api/families/current/invite-code` | 重新生成邀请码 | Creator |

### 财务管理模块

| 方法 | 路径 | 说明 | 角色 |
|------|------|------|:----:|
| GET | `/api/expense-categories` | 获取分类列表 | ✅ |
| POST | `/api/expense-categories` | 创建自定义分类 | Member+ |
| DELETE | `/api/expense-categories/:id` | 删除自定义分类 | Member+ |
| GET | `/api/expenses` | 收支列表（分页） | Viewer+ |
| POST | `/api/expenses` | 新增收支 | Member+ |
| GET | `/api/expenses/:id` | 收支详情 | Viewer+ |
| PATCH | `/api/expenses/:id` | 更新收支 | Member+ |
| DELETE | `/api/expenses/:id` | 删除收支（软删除） | Member+ |
| GET | `/api/expenses/statistics/summary` | 收支汇总统计 | Viewer+ |
| GET | `/api/expenses/statistics/by-category` | 分类占比统计 | Viewer+ |
| GET | `/api/expenses/statistics/by-member` | 成员占比统计 | Viewer+ |
| GET | `/api/budgets` | 预算列表 | Viewer+ |
| POST | `/api/budgets` | 设置/更新预算 | Creator |
| GET | `/api/budgets/:id` | 预算详情 | Viewer+ |
| DELETE | `/api/budgets/:id` | 删除预算 | Creator |

### 日程模块

| 方法 | 路径 | 说明 | 角色 |
|------|------|------|:----:|
| GET | `/api/schedules` | 日程列表（按时间范围筛选） | Viewer+ |
| POST | `/api/schedules` | 创建日程 | Member+ |
| GET | `/api/schedules/:id` | 日程详情 | Viewer+ |
| PATCH | `/api/schedules/:id` | 更新日程 | Member+ |
| DELETE | `/api/schedules/:id` | 删除日程 | Member+ |

### 待办模块

| 方法 | 路径 | 说明 | 角色 |
|------|------|------|:----:|
| GET | `/api/todos` | 待办列表（按状态/指派人筛选） | Viewer+ |
| POST | `/api/todos` | 创建待办 | Member+ |
| GET | `/api/todos/:id` | 待办详情 | Viewer+ |
| PATCH | `/api/todos/:id` | 更新待办 | Member+ |
| DELETE | `/api/todos/:id` | 删除待办 | Member+ |

### 库存模块

| 方法 | 路径 | 说明 | 角色 |
|------|------|------|:----:|
| GET | `/api/inventory-items` | 物品列表（分页/搜索） | Viewer+ |
| POST | `/api/inventory-items` | 新增物品 | Member+ |
| GET | `/api/inventory-items/:id` | 物品详情 | Viewer+ |
| PATCH | `/api/inventory-items/:id` | 更新物品 | Member+ |
| DELETE | `/api/inventory-items/:id` | 删除物品 | Member+ |
| POST | `/api/inventory-items/:id/stock-in` | 入库操作 | Member+ |
| POST | `/api/inventory-items/:id/stock-out` | 出库操作 | Member+ |
| GET | `/api/inventory-items/stock-logs` | 库存流水列表 | Viewer+ |

### 用户模块

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|:----:|
| GET | `/api/user/profile` | 获取个人信息 | ✅ |
| PATCH | `/api/user/profile` | 更新个人信息 | ✅ |

> **角色说明**：Creator（管理员）、Member（成员）、Viewer（访客）

---

## 数据库模型

| 模型 | 表名 | 说明 |
|------|------|------|
| `User` | `users` | 用户基础信息 |
| `Family` | `families` | 家庭组（含邀请码及过期时间） |
| `FamilyMember` | `family_members` | 家庭成员关联（含角色） |
| `Category` | `categories` | 收支分类（系统预置/自定义） |
| `Expense` | `expenses` | 收支记录（软删除） |
| `Budget` | `budgets` | 月度预算 |
| `Schedule` | `schedules` | 日程 |
| `ScheduleParticipant` | `schedule_participants` | 日程参与者 |
| `ScheduleReminder` | `schedule_reminders` | 日程提醒 |
| `Todo` | `todos` | 待办事项 |
| `TodoAssignee` | `todo_assignees` | 待办指派人 |
| `InventoryItem` | `inventory_items` | 库存物品 |
| `StockLog` | `stock_logs` | 库存操作流水 |
| `Notification` | `notifications` | 通知消息 |

---

## 架构设计

### 数据隔离

所有业务表均包含 `family_id` 字段，查询时强制携带该条件，确保不同家庭组之间的数据完全隔离。

### 认证鉴权

- **JWT 认证**：全局注册 `JwtAuthGuard`，除 `@Public()` 标记的接口外，所有请求需携带 Bearer Token
- **角色权限**：`FamilyRoleGuard` + `@Roles()` 装饰器实现 Creator/Member/Viewer 三级权限控制
- **当前家庭**：JWT payload 中包含 `currentFamilyId`，通过 `@CurrentFamily()` 装饰器注入

### 统一响应格式

```json
// 成功响应
{ "code": 0, "data": { ... }, "message": "success" }

// 分页响应
{ "code": 0, "data": [...], "message": "success", "pagination": { "page": 1, "pageSize": 20, "total": 100, "totalPages": 5 } }

// 错误响应
{ "code": 4000, "data": null, "message": "资源不存在" }
```

**错误码约定**：

| 范围 | 含义 |
|:----:|------|
| 0 | 成功 |
| 1000-1999 | 参数错误 |
| 2000-2999 | 认证/授权错误 |
| 3000-3999 | 业务逻辑错误 |
| 4000-4999 | 资源不存在 |
| 5000-5999 | 系统错误 |

### 公共基础设施（`common` 模块）

| 组件 | 说明 |
|------|------|
| `PrismaService` | Prisma ORM 封装，管理数据库连接生命周期 |
| `JwtAuthGuard` | JWT 令牌校验守卫，支持 `@Public()` 跳过认证 |
| `FamilyRoleGuard` | 家庭角色权限守卫，配合 `@Roles()` 装饰器 |
| `TransformInterceptor` | 统一响应格式 `{ code, data, message }` |
| `@Public()` | 标记公开接口，跳过 JWT 认证 |
| `@Roles()` | 角色控制装饰器 |
| `@CurrentUser()` | 获取当前登录用户信息 |
| `@CurrentFamily()` | 从 JWT payload 中提取当前家庭 ID |

---

## 开发命令

```bash
# 开发模式（热重载）
pnpm run start:dev

# 生产构建
pnpm run build

# 生产运行
pnpm run start:prod

# 代码检查
pnpm run lint

# 代码格式化
pnpm run format

# 运行测试
pnpm run test

# 测试覆盖率
pnpm run test:cov

# 数据库迁移
npx prisma migrate dev

# Prisma Studio（数据库管理 UI）
npx prisma studio
```

---

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DATABASE_URL` | MySQL 连接字符串 | — |
| `JWT_SECRET` | JWT 签名密钥 | — |
| `JWT_EXPIRES_IN` | access_token 有效期 | `7d` |
| `JWT_REFRESH_EXPIRES_IN` | refresh_token 有效期 | `30d` |
| `BCRYPT_SALT_ROUNDS` | bcrypt 加密轮数 | `12` |
| `INVITE_CODE_EXPIRES_IN` | 邀请码有效期（小时） | `24` |

---

## 相关文档

- [项目 PRD](../../PRD.md)
- [技术架构设计](../../TECH_DESIGN.md)
- [开发规范](../../DEVELOPMENT_STANDARDS.md)
- [数据库设计](../../DATABASE.md)
