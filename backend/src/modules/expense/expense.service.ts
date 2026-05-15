import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '../common/prisma/prisma.service'
import {
  CreateExpenseDto,
  UpdateExpenseDto,
  QueryExpenseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateBudgetDto,
  UpdateBudgetDto,
  QueryReportDto,
} from './dto/expense.dto'
import { Prisma } from '@prisma/client'

@Injectable()
export class ExpenseService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(familyId: string, query: QueryExpenseDto) {
    const { page = 1, pageSize = 20, type, categoryId, userId, startDate, endDate } = query

    const where: Prisma.ExpenseWhereInput = {
      familyId,
      deletedAt: null,
    }

    if (type) where.type = type
    if (categoryId) where.categoryId = categoryId
    if (userId) where.userId = userId

    if (startDate || endDate) {
      where.transactionDate = {}
      if (startDate) where.transactionDate.gte = new Date(startDate)
      if (endDate) where.transactionDate.lte = new Date(endDate)
    }

    const [data, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, icon: true, color: true },
          },
          createdBy: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
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

  async findOne(id: string, familyId: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true },
        },
        createdBy: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    })

    if (!expense || expense.deletedAt) {
      throw new NotFoundException('收支记录不存在')
    }

    if (expense.familyId !== familyId) {
      throw new ForbiddenException('无权访问该记录')
    }

    return expense
  }

  async create(familyId: string, userId: string, dto: CreateExpenseDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    })

    if (!category || category.familyId !== familyId) {
      throw new BadRequestException('分类不存在')
    }

    if (category.type !== dto.type) {
      throw new BadRequestException('分类类型与收支类型不匹配')
    }

    return this.prisma.expense.create({
      data: {
        familyId,
        userId,
        categoryId: dto.categoryId,
        amount: dto.amount,
        type: dto.type,
        transactionDate: dto.transactionDate ? new Date(dto.transactionDate) : new Date(),
        note: dto.note,
        imageUrl: dto.imageUrl,
      },
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true },
        },
        createdBy: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    })
  }

  async update(id: string, familyId: string, dto: UpdateExpenseDto) {
    const expense = await this.prisma.expense.findUnique({ where: { id } })

    if (!expense || expense.deletedAt) {
      throw new NotFoundException('收支记录不存在')
    }

    if (expense.familyId !== familyId) {
      throw new ForbiddenException('无权修改该记录')
    }

    const data: Prisma.ExpenseUpdateInput = {}

    if (dto.type !== undefined) data.type = dto.type
    if (dto.amount !== undefined) data.amount = dto.amount
    if (dto.categoryId !== undefined) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      })

      if (!category || category.familyId !== familyId) {
        throw new BadRequestException('分类不存在')
      }

      data.category = { connect: { id: dto.categoryId } }
    }
    if (dto.transactionDate !== undefined) data.transactionDate = new Date(dto.transactionDate)
    if (dto.note !== undefined) data.note = dto.note
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl

    return this.prisma.expense.update({
      where: { id },
      data,
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true },
        },
        createdBy: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    })
  }

  async softDelete(id: string, familyId: string) {
    const expense = await this.prisma.expense.findUnique({ where: { id } })

    if (!expense || expense.deletedAt) {
      throw new NotFoundException('收支记录不存在')
    }

    if (expense.familyId !== familyId) {
      throw new ForbiddenException('无权删除该记录')
    }

    return this.prisma.expense.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  async getCategories(familyId: string) {
    return this.prisma.category.findMany({
      where: { familyId },
      orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
    })
  }

  async createCategory(familyId: string, dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        familyId,
        name: dto.name,
        type: dto.type,
        icon: dto.icon,
        color: dto.color,
        sortOrder: dto.sortOrder ?? 0,
      },
    })
  }

  async updateCategory(id: string, familyId: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } })

    if (!category || category.familyId !== familyId) {
      throw new NotFoundException('分类不存在')
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name,
        icon: dto.icon,
        color: dto.color,
        sortOrder: dto.sortOrder,
      },
    })
  }

  async deleteCategory(id: string, familyId: string) {
    const category = await this.prisma.category.findUnique({ where: { id } })

    if (!category || category.familyId !== familyId) {
      throw new NotFoundException('分类不存在')
    }

    if (category.isSystem) {
      throw new BadRequestException('系统预置分类不能删除')
    }

    const expenseCount = await this.prisma.expense.count({
      where: { categoryId: id, deletedAt: null },
    })

    if (expenseCount > 0) {
      throw new BadRequestException('该分类下存在收支记录，不能删除')
    }

    return this.prisma.category.delete({ where: { id } })
  }

  async getBudgets(familyId: string) {
    return this.prisma.budget.findMany({
      where: { familyId },
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true },
        },
      },
    })
  }

  async setBudget(familyId: string, dto: CreateBudgetDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    })

    if (!category || category.familyId !== familyId) {
      throw new BadRequestException('分类不存在')
    }

    if (category.type !== 'expense') {
      throw new BadRequestException('只能为支出分类设置预算')
    }

    return this.prisma.budget.upsert({
      where: {
        familyId_categoryId_period: {
          familyId,
          categoryId: dto.categoryId,
          period: 'monthly',
        },
      },
      update: { amount: dto.amount },
      create: {
        familyId,
        categoryId: dto.categoryId,
        amount: dto.amount,
        period: 'monthly',
      },
    })
  }

  async updateBudget(id: string, familyId: string, dto: UpdateBudgetDto) {
    const budget = await this.prisma.budget.findUnique({ where: { id } })

    if (!budget || budget.familyId !== familyId) {
      throw new NotFoundException('预算不存在')
    }

    return this.prisma.budget.update({
      where: { id },
      data: { amount: dto.amount },
    })
  }

  async deleteBudget(id: string, familyId: string) {
    const budget = await this.prisma.budget.findUnique({ where: { id } })

    if (!budget || budget.familyId !== familyId) {
      throw new NotFoundException('预算不存在')
    }

    return this.prisma.budget.delete({ where: { id } })
  }

  async getReport(familyId: string, query: QueryReportDto) {
    const now = new Date()
    const startDate = query.startDate
      ? new Date(query.startDate)
      : new Date(now.getFullYear(), now.getMonth(), 1)
    const endDate = query.endDate ? new Date(query.endDate) : now

    const where: Prisma.ExpenseWhereInput = {
      familyId,
      deletedAt: null,
      transactionDate: {
        gte: startDate,
        lte: endDate,
      },
    }

    const expenses = await this.prisma.expense.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { transactionDate: 'asc' },
    })

    const totalIncome = expenses
      .filter((e) => e.type === 'income')
      .reduce((sum, e) => sum + Number(e.amount), 0)

    const totalExpense = expenses
      .filter((e) => e.type === 'expense')
      .reduce((sum, e) => sum + Number(e.amount), 0)

    const categoryBreakdown = new Map<
      string,
      { name: string; icon: string; color: string; amount: number; count: number }
    >()

    const memberBreakdown = new Map<string, { name: string; amount: number; count: number }>()

    expenses
      .filter((e) => e.type === 'expense')
      .forEach((e) => {
        const cat = categoryBreakdown.get(e.categoryId) || {
          name: e.category.name,
          icon: e.category.icon,
          color: e.category.color,
          amount: 0,
          count: 0,
        }
        cat.amount += Number(e.amount)
        cat.count += 1
        categoryBreakdown.set(e.categoryId, cat)

        const member = memberBreakdown.get(e.userId) || {
          name: e.createdBy.name,
          amount: 0,
          count: 0,
        }
        member.amount += Number(e.amount)
        member.count += 1
        memberBreakdown.set(e.userId, member)
      })

    return {
      summary: {
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalExpense: Math.round(totalExpense * 100) / 100,
        balance: Math.round((totalIncome - totalExpense) * 100) / 100,
        startDate: startDate.toISOString().slice(0, 10),
        endDate: endDate.toISOString().slice(0, 10),
      },
      categoryBreakdown: Array.from(categoryBreakdown.entries())
        .map(([, v]) => ({
          ...v,
          amount: Math.round(v.amount * 100) / 100,
        }))
        .sort((a, b) => b.amount - a.amount),
      memberBreakdown: Array.from(memberBreakdown.entries())
        .map(([, v]) => ({
          ...v,
          amount: Math.round(v.amount * 100) / 100,
        }))
        .sort((a, b) => b.amount - a.amount),
    }
  }
}
