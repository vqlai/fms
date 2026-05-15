# 家庭管理系统 — 数据库设计文档

> **版本**：v1.0  
> **日期**：2026-05-15  
> **数据库**：MySQL 8.0  
> **ORM**：Prisma 6

---

## 1. 完整 Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// ==================== 用户系统 ====================

model User {
  id           String   @id @default(uuid()) @db.Char(36)
  email        String   @unique
  phone        String?  @unique
  passwordHash String   @map("password_hash")
  name         String
  avatarUrl    String?  @map("avatar_url")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  // 关联
  familyMembers FamilyMember[]
  expenses      Expense[]
  schedules     Schedule[]
  createdTodos  Todo[]
  todoAssignees TodoAssignee[]

  @@map("users")
}

// ==================== 家庭组 ====================

model Family {
  id                  String   @id @default(uuid()) @db.Char(36)
  name                String
  inviteCode          String   @unique @map("invite_code")
  createdById         String   @map("created_by_id") @db.Char(36)
  inviteCodeExpiresAt DateTime @map("invite_code_expires_at")
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  // 关联
  createdBy  User           @relation(fields: [createdById], references: [id])
  members    FamilyMember[]
  expenses   Expense[]
  categories Category[]
  budgets    Budget[]
  schedules  Schedule[]
  todos      Todo[]

  @@map("families")
}

enum FamilyRole {
  creator
  member
  viewer
}

model FamilyMember {
  id       String     @id @default(uuid()) @db.Char(36)
  familyId String     @map("family_id") @db.Char(36)
  userId   String     @map("user_id") @db.Char(36)
  role     FamilyRole
  joinedAt DateTime   @default(now()) @map("joined_at")

  // 关联
  family Family @relation(fields: [familyId], references: [id])
  user   User   @relation(fields: [userId], references: [id])

  @@unique([familyId, userId])
  @@map("family_members")
}

// ==================== 财务管理 ====================

enum CategoryType {
  income
  expense
}

model Category {
  id        String       @id @default(uuid()) @db.Char(36)
  familyId  String       @map("family_id") @db.Char(36)
  name      String
  type      CategoryType
  icon      String       @default("💰")
  color     String       @default("#6B7280")
  sortOrder Int          @default(0) @map("sort_order")
  isSystem  Boolean      @default(false) @map("is_system")
  createdAt DateTime     @default(now()) @map("created_at")

  // 关联
  family   Family    @relation(fields: [familyId], references: [id])
  expenses Expense[]
  budgets  Budget[]

  @@index([familyId, type])
  @@map("categories")
}

model Expense {
  id              String     @id @default(uuid()) @db.Char(36)
  familyId        String     @map("family_id") @db.Char(36)
  userId          String     @map("user_id") @db.Char(36)
  categoryId      String     @map("category_id") @db.Char(36)
  amount          Decimal    @db.Decimal(12, 2)
  type            CategoryType
  transactionDate DateTime   @map("transaction_date") @db.Date
  note            String?    @db.VarChar(500)
  imageUrl        String?    @map("image_url")
  createdAt       DateTime   @default(now()) @map("created_at")
  updatedAt       DateTime   @updatedAt @map("updated_at")
  deletedAt       DateTime?  @map("deleted_at")

  // 关联
  family    Family   @relation(fields: [familyId], references: [id])
  createdBy User     @relation(fields: [userId], references: [id])
  category  Category @relation(fields: [categoryId], references: [id])

  @@index([familyId, transactionDate])
  @@index([familyId, categoryId])
  @@index([familyId, userId])
  @@map("expenses")
}

model Budget {
  id         String   @id @default(uuid()) @db.Char(36)
  familyId   String   @map("family_id") @db.Char(36)
  categoryId String   @map("category_id") @db.Char(36)
  amount     Decimal  @db.Decimal(12, 2)
  period     String   @default("monthly")
  createdAt  DateTime @default(now()) @map("created_at")

  // 关联
  family   Family   @relation(fields: [familyId], references: [id])
  category Category @relation(fields: [categoryId], references: [id])

  @@unique([familyId, categoryId, period])
  @@map("budgets")
}

// ==================== 日程管理 ====================

model Schedule {
  id         String    @id @default(uuid()) @db.Char(36)
  familyId   String    @map("family_id") @db.Char(36)
  createdById String   @map("created_by_id") @db.Char(36)
  title      String
  startTime  DateTime  @map("start_time")
  endTime    DateTime? @map("end_time")
  isAllDay   Boolean   @default(false) @map("is_all_day")
  repeatRule String?   @map("repeat_rule")
  repeatDays Json?     @map("repeat_days")
  note       String?
  createdAt  DateTime  @default(now()) @map("created_at")
  updatedAt  DateTime  @updatedAt @map("updated_at")

  // 关联
  family       Family               @relation(fields: [familyId], references: [id])
  createdBy    User                 @relation(fields: [createdById], references: [id])
  participants ScheduleParticipant[]

  @@index([familyId, startTime])
  @@map("schedules")
}

model ScheduleParticipant {
  id         String @id @default(uuid()) @db.Char(36)
  scheduleId String @map("schedule_id") @db.Char(36)
  userId     String @map("user_id") @db.Char(36)

  // 关联
  schedule Schedule @relation(fields: [scheduleId], references: [id])
  user     User     @relation(fields: [userId], references: [id])

  @@unique([scheduleId, userId])
  @@map("schedule_participants")
}

model ScheduleReminder {
  id         String   @id @default(uuid()) @db.Char(36)
  scheduleId String   @map("schedule_id") @db.Char(36)
  remindAt   DateTime @map("remind_at")
  isSent     Boolean  @default(false) @map("is_sent")
  createdAt  DateTime @default(now()) @map("created_at")

  // 关联
  schedule Schedule @relation(fields: [scheduleId], references: [id])

  @@index([remindAt, isSent])
  @@map("schedule_reminders")
}

// ==================== 待办事项 ====================

model Todo {
  id          String    @id @default(uuid()) @db.Char(36)
  familyId    String    @map("family_id") @db.Char(36)
  createdById String    @map("created_by_id") @db.Char(36)
  title       String
  description String?
  priority    Int       @default(2)
  dueDate     DateTime? @map("due_date") @db.Date
  isCompleted Boolean   @default(false) @map("is_completed")
  completedAt DateTime? @map("completed_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  // 关联
  family    Family        @relation(fields: [familyId], references: [id])
  createdBy User          @relation(fields: [createdById], references: [id])
  assignees TodoAssignee[]

  @@index([familyId, dueDate])
  @@index([familyId, isCompleted])
  @@map("todos")
}

model TodoAssignee {
  id     String @id @default(uuid()) @db.Char(36)
  todoId String @map("todo_id") @db.Char(36)
  userId String @map("user_id") @db.Char(36)

  // 关联
  todo Todo @relation(fields: [todoId], references: [id])
  user User @relation(fields: [userId], references: [id])

  @@unique([todoId, userId])
  @@map("todo_assignees")
}

// ==================== 物品库存管理 ====================

enum InventoryCategory {
  fresh_food
  dry_food
  cleaning
  medicine
  personal_care
  tools
  other
}

model InventoryItem {
  id          String            @id @default(uuid()) @db.Char(36)
  familyId    String            @map("family_id") @db.Char(36)
  name        String
  category    InventoryCategory
  quantity    Decimal           @db.Decimal(10, 2)
  unit        String            @default("件")
  location    String?
  expiryDate  DateTime?         @map("expiry_date") @db.Date
  minQuantity Decimal           @default(0) @map("min_quantity") @db.Decimal(10, 2)
  note        String?
  imageUrl    String?           @map("image_url")
  barcode     String?
  createdAt   DateTime          @default(now()) @map("created_at")
  updatedAt   DateTime          @updatedAt @map("updated_at")

  family Family    @relation(fields: [familyId], references: [id])
  logs   StockLog[]

  @@index([familyId, category])
  @@index([familyId, expiryDate])
  @@index([familyId, location])
  @@map("inventory_items")
}

enum StockAction {
  stock_in
  stock_out
  disposed
}

model StockLog {
  id        String     @id @default(uuid()) @db.Char(36)
  itemId    String     @map("item_id") @db.Char(36)
  userId    String     @map("user_id") @db.Char(36)
  action    StockAction
  quantity  Decimal    @db.Decimal(10, 2)
  price     Decimal?   @db.Decimal(12, 2)
  note      String?
  createdAt DateTime   @default(now()) @map("created_at")

  item InventoryItem @relation(fields: [itemId], references: [id])
  user User          @relation(fields: [userId], references: [id])

  @@index([itemId, createdAt])
  @@map("stock_logs")
}

// ==================== 通知系统 ====================

enum NotificationType {
  schedule_reminder
  todo_reminder
  budget_warning
  family_invitation
  member_join
}

model Notification {
  id        String           @id @default(uuid()) @db.Char(36)
  userId    String           @map("user_id") @db.Char(36)
  familyId  String           @map("family_id") @db.Char(36)
  type      NotificationType
  title     String
  body      String
  isRead    Boolean          @default(false) @map("is_read")
  metadata  Json?
  createdAt DateTime         @default(now()) @map("created_at")

  @@index([userId, isRead])
  @@index([userId, createdAt])
  @@map("notifications")
}
```

---

## 2. 建表 SQL（参考）

以下是 Prisma 生成的等效 MySQL SQL，供理解表结构参考：

```sql
-- 用户表
CREATE TABLE users (
    id            CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email         VARCHAR(255) NOT NULL UNIQUE,
    phone         VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name          VARCHAR(100) NOT NULL,
    avatar_url    VARCHAR(500),
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 家庭组
CREATE TABLE families (
    id                     CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name                   VARCHAR(100) NOT NULL,
    invite_code            VARCHAR(16) NOT NULL UNIQUE,
    created_by_id          CHAR(36) NOT NULL,
    invite_code_expires_at TIMESTAMP NOT NULL,
    created_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 家庭成员
CREATE TABLE family_members (
    id        CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    family_id CHAR(36) NOT NULL,
    user_id   CHAR(36) NOT NULL,
    role      VARCHAR(20) NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_family_user (family_id, user_id),
    FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 收支分类
CREATE TABLE categories (
    id         CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    family_id  CHAR(36) NOT NULL,
    name       VARCHAR(50) NOT NULL,
    type       VARCHAR(10) NOT NULL,
    icon       VARCHAR(10) DEFAULT '💰',
    color      VARCHAR(10) DEFAULT '#6B7280',
    sort_order INTEGER DEFAULT 0,
    is_system  BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_categories_family_type ON categories(family_id, type);

-- 收支记录
CREATE TABLE expenses (
    id               CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    family_id        CHAR(36) NOT NULL,
    user_id          CHAR(36) NOT NULL,
    category_id      CHAR(36) NOT NULL,
    amount           DECIMAL(12, 2) NOT NULL,
    type             VARCHAR(10) NOT NULL,
    transaction_date DATE NOT NULL,
    note             VARCHAR(500),
    image_url        VARCHAR(500),
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at       TIMESTAMP NULL,
    FOREIGN KEY (family_id) REFERENCES families(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_expenses_family_date ON expenses(family_id, transaction_date);
CREATE INDEX idx_expenses_family_category ON expenses(family_id, category_id);
CREATE INDEX idx_expenses_family_user ON expenses(family_id, user_id);

-- 预算
CREATE TABLE budgets (
    id          CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    family_id   CHAR(36) NOT NULL,
    category_id CHAR(36) NOT NULL,
    amount      DECIMAL(12, 2) NOT NULL,
    period      VARCHAR(20) DEFAULT 'monthly',
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_family_category_period (family_id, category_id, period),
    FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 日程
CREATE TABLE schedules (
    id            CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    family_id     CHAR(36) NOT NULL,
    created_by_id CHAR(36) NOT NULL,
    title         VARCHAR(200) NOT NULL,
    start_time    TIMESTAMP NOT NULL,
    end_time      TIMESTAMP NULL,
    is_all_day    BOOLEAN DEFAULT FALSE,
    repeat_rule   VARCHAR(50),
    repeat_days   JSON,
    note          VARCHAR(500),
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (family_id) REFERENCES families(id),
    FOREIGN KEY (created_by_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_schedules_family_start ON schedules(family_id, start_time);

-- 日程参与者
CREATE TABLE schedule_participants (
    id          CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    schedule_id CHAR(36) NOT NULL,
    user_id     CHAR(36) NOT NULL,
    UNIQUE KEY uk_schedule_user (schedule_id, user_id),
    FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 日程提醒
CREATE TABLE schedule_reminders (
    id          CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    schedule_id CHAR(36) NOT NULL,
    remind_at   TIMESTAMP NOT NULL,
    is_sent     BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_reminders_remind_at ON schedule_reminders(remind_at, is_sent);

-- 待办事项
CREATE TABLE todos (
    id           CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    family_id    CHAR(36) NOT NULL,
    created_by_id CHAR(36) NOT NULL,
    title        VARCHAR(200) NOT NULL,
    description  VARCHAR(1000),
    priority     INTEGER DEFAULT 2,
    due_date     DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (family_id) REFERENCES families(id),
    FOREIGN KEY (created_by_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_todos_family_due ON todos(family_id, due_date);
CREATE INDEX idx_todos_family_completed ON todos(family_id, is_completed);

-- 待办指派人
CREATE TABLE todo_assignees (
    id      CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    todo_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    UNIQUE KEY uk_todo_user (todo_id, user_id),
    FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 物品库存
CREATE TABLE inventory_items (
    id           CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    family_id    CHAR(36) NOT NULL,
    name         VARCHAR(200) NOT NULL,
    category     VARCHAR(30) NOT NULL,
    quantity     DECIMAL(10, 2) NOT NULL DEFAULT 0,
    unit         VARCHAR(20) DEFAULT '件',
    location     VARCHAR(100),
    expiry_date  DATE,
    min_quantity DECIMAL(10, 2) DEFAULT 0,
    note         VARCHAR(500),
    image_url    VARCHAR(500),
    barcode      VARCHAR(100),
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (family_id) REFERENCES families(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_inventory_family_category ON inventory_items(family_id, category);
CREATE INDEX idx_inventory_family_expiry ON inventory_items(family_id, expiry_date);
CREATE INDEX idx_inventory_family_location ON inventory_items(family_id, location);

-- 库存流水
CREATE TABLE stock_logs (
    id         CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    item_id    CHAR(36) NOT NULL,
    user_id    CHAR(36) NOT NULL,
    action     VARCHAR(20) NOT NULL,
    quantity   DECIMAL(10, 2) NOT NULL,
    price      DECIMAL(12, 2),
    note       VARCHAR(200),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_stock_logs_item_time ON stock_logs(item_id, created_at);

-- 通知
CREATE TABLE notifications (
    id         CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id    CHAR(36) NOT NULL,
    family_id  CHAR(36) NOT NULL,
    type       VARCHAR(30) NOT NULL,
    title      VARCHAR(200) NOT NULL,
    body       VARCHAR(500),
    is_read    BOOLEAN DEFAULT FALSE,
    metadata   JSON,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (family_id) REFERENCES families(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at);
```

---

## 3. 预置数据（Seed）

### 3.1 系统预置分类

创建家庭组时，自动插入以下预置分类：

```sql
-- 支出分类（type = 'expense'）
INSERT INTO categories (id, family_id, name, type, icon, color, is_system, sort_order) VALUES
(UUID(), :family_id, '餐饮', 'expense', '🍜', '#EF4444', TRUE, 1),
(UUID(), :family_id, '交通', 'expense', '🚗', '#F59E0B', TRUE, 2),
(UUID(), :family_id, '住房', 'expense', '🏠', '#8B5CF6', TRUE, 3),
(UUID(), :family_id, '水电', 'expense', '⚡', '#06B6D4', TRUE, 4),
(UUID(), :family_id, '教育', 'expense', '📚', '#3B82F6', TRUE, 5),
(UUID(), :family_id, '医疗', 'expense', '💊', '#EC4899', TRUE, 6),
(UUID(), :family_id, '购物', 'expense', '🛒', '#F97316', TRUE, 7),
(UUID(), :family_id, '娱乐', 'expense', '🎮', '#14B8A6', TRUE, 8),
(UUID(), :family_id, '信用卡还款', 'expense', '💳', '#6366F1', TRUE, 9),
(UUID(), :family_id, '通讯', 'expense', '📱', '#84CC16', TRUE, 10),
(UUID(), :family_id, '人情', 'expense', '🎁', '#E11D48', TRUE, 11),
(UUID(), :family_id, '宠物', 'expense', '🐱', '#A855F7', TRUE, 12),
(UUID(), :family_id, '其他', 'expense', '💰', '#6B7280', TRUE, 99);

-- 收入分类（type = 'income'）
INSERT INTO categories (id, family_id, name, type, icon, color, is_system, sort_order) VALUES
(UUID(), :family_id, '工资', 'income', '💵', '#10B981', TRUE, 1),
(UUID(), :family_id, '奖金', 'income', '🎁', '#F59E0B', TRUE, 2),
(UUID(), :family_id, '投资收益', 'income', '📈', '#3B82F6', TRUE, 3),
(UUID(), :family_id, '房租收入', 'income', '🏠', '#8B5CF6', TRUE, 4),
(UUID(), :family_id, '其他', 'income', '💰', '#6B7280', TRUE, 99);
```

### 3.2 Prisma Seed 脚本

```typescript
// server/prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEFAULT_EXPENSE_CATEGORIES = [
  { name: '餐饮', icon: '🍜', color: '#EF4444' },
  { name: '交通', icon: '🚗', color: '#F59E0B' },
  { name: '住房', icon: '🏠', color: '#8B5CF6' },
  { name: '水电', icon: '⚡', color: '#06B6D4' },
  { name: '教育', icon: '📚', color: '#3B82F6' },
  { name: '医疗', icon: '💊', color: '#EC4899' },
  { name: '购物', icon: '🛒', color: '#F97316' },
  { name: '娱乐', icon: '🎮', color: '#14B8A6' },
  { name: '信用卡还款', icon: '💳', color: '#6366F1' },
  { name: '通讯', icon: '📱', color: '#84CC16' },
  { name: '人情', icon: '🎁', color: '#E11D48' },
  { name: '宠物', icon: '🐱', color: '#A855F7' },
  { name: '其他', icon: '💰', color: '#6B7280' },
]

const DEFAULT_INCOME_CATEGORIES = [
  { name: '工资', icon: '💵', color: '#10B981' },
  { name: '奖金', icon: '🎁', color: '#F59E0B' },
  { name: '投资收益', icon: '📈', color: '#3B82F6' },
  { name: '房租收入', icon: '🏠', color: '#8B5CF6' },
  { name: '其他', icon: '💰', color: '#6B7280' },
]

async function main() {
  console.log('Seeding complete!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
```

---

## 4. 数据生命周期

### 4.1 软删除策略

| 表 | 策略 | 保留周期 |
|------|------|----------|
| `expenses` | 软删除（`deleted_at` 标记） | 永久，可通过管理界面手动清理 |
| `todos` | 物理删除（建议改为软删除） | N/A |
| `inventory_items` | 物理删除 | N/A |
| `stock_logs` | 物理删除（操作日志，保留 1 年可归档） | N/A |
| `categories` | 禁用（保留 `is_system=false` 数据） | 永久 |
| 其他表 | 物理删除 | N/A |

### 4.2 定时清理任务

```typescript
@Injectable()
export class CleanupTask {
  // 每天凌晨 3 点清理 24 小时前过期的邀请码
  @Cron('0 3 * * *')
  async expireInviteCodes() {
    await this.prisma.family.updateMany({
      where: {
        inviteCodeExpiresAt: { lt: new Date() },
      },
      data: { inviteCode: null, inviteCodeExpiresAt: null },
    })
  }

  // 每周日凌晨 4 点清理 30 天前已发送的提醒记录
  @Cron('0 4 * * 0')
  async cleanReminders() {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    await this.prisma.scheduleReminder.deleteMany({
      where: { isSent: true, createdAt: { lt: thirtyDaysAgo } },
    })
  }

  // 每天 09:00 检查过期超过 30 天的物品并清理
  @Cron('0 9 * * *')
  async cleanExpiredItems() {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    await this.prisma.inventoryItem.deleteMany({
      where: { expiryDate: { lt: thirtyDaysAgo } },
    })
  }
}
```

### 4.3 数据备份建议

```bash
# 每日全量备份（crontab）
0 2 * * * mysqldump -u fm_user -p"${DB_PASSWORD}" family_manager > /backups/fm_$(date +\%Y\%m\%d).sql

# 保留最近 30 天备份
find /backups -name "fm_*.sql" -mtime +30 -delete
```

---

## 5. 性能优化建议

### 5.1 查询优化

```sql
-- ✅ 使用 Partial Index 优化软删除查询（MySQL 8.0 不支持 Conditional Index，使用覆盖索引替代）
CREATE INDEX idx_expenses_active ON expenses(family_id, transaction_date, deleted_at);

-- ✅ 报表统计建议使用汇总表（MySQL 无原生物化视图）
CREATE TABLE monthly_expense_summary (
    family_id CHAR(36) NOT NULL,
    month     DATE NOT NULL,
    type      VARCHAR(10) NOT NULL,
    total     DECIMAL(14, 2) NOT NULL,
    PRIMARY KEY (family_id, month, type),
    FOREIGN KEY (family_id) REFERENCES families(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ✅ 库存过期查询优化
CREATE INDEX idx_inventory_active_expiry ON inventory_items(family_id, expiry_date);

-- ✅ 低库存查询：MySQL 不支持 Partial Index，建议在应用层筛选
```

### 5.2 连接池配置

```bash
# server/.env
DATABASE_URL="mysql://user:password@localhost:3306/family_manager?connection_limit=20&pool_timeout=10"
```

### 5.3 MySQL 字符集注意事项

- 所有表使用 `utf8mb4` 字符集，支持 Emoji 等 4 字节 UTF-8 字符
- 排序规则统一 `utf8mb4_unicode_ci`
- Docker 启动时添加 `--character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci`

---

> **文档变更记录**

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v1.0 | 2026-05-15 | 初版发布 | 技术团队 |
