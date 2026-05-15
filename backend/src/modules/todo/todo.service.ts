import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../common/prisma/prisma.service'
import { CreateTodoDto, UpdateTodoDto, QueryTodoDto } from '../schedule/dto/schedule.dto'
import { Prisma } from '@prisma/client'

@Injectable()
export class TodoService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(familyId: string, query: QueryTodoDto) {
    const where: Prisma.TodoWhereInput = { familyId }

    if (query.isCompleted !== undefined) {
      where.isCompleted = query.isCompleted
    }

    if (query.assigneeId) {
      where.assignees = {
        some: { userId: query.assigneeId },
      }
    }

    return this.prisma.todo.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true, avatarUrl: true },
        },
        assignees: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
      },
      orderBy: [{ isCompleted: 'asc' }, { dueDate: 'asc' }, { priority: 'asc' }],
    })
  }

  async findOne(id: string, familyId: string) {
    const todo = await this.prisma.todo.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, avatarUrl: true },
        },
        assignees: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
      },
    })

    if (!todo) {
      throw new NotFoundException('待办事项不存在')
    }

    if (todo.familyId !== familyId) {
      throw new ForbiddenException('无权访问该待办事项')
    }

    return todo
  }

  async create(familyId: string, userId: string, dto: CreateTodoDto) {
    return this.prisma.$transaction(async (tx) => {
      const todo = await tx.todo.create({
        data: {
          familyId,
          createdById: userId,
          title: dto.title,
          description: dto.description,
          priority: dto.priority ?? 2,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        },
      })

      if (dto.assigneeIds && dto.assigneeIds.length > 0) {
        await tx.todoAssignee.createMany({
          data: dto.assigneeIds.map((assigneeId) => ({
            todoId: todo.id,
            userId: assigneeId,
          })),
        })
      }

      return this.findOne(todo.id, familyId)
    })
  }

  async update(id: string, familyId: string, dto: UpdateTodoDto) {
    const todo = await this.prisma.todo.findUnique({ where: { id } })

    if (!todo) {
      throw new NotFoundException('待办事项不存在')
    }

    if (todo.familyId !== familyId) {
      throw new ForbiddenException('无权修改该待办事项')
    }

    return this.prisma.$transaction(async (tx) => {
      const data: Prisma.TodoUpdateInput = {}

      if (dto.title !== undefined) data.title = dto.title
      if (dto.description !== undefined) data.description = dto.description
      if (dto.priority !== undefined) data.priority = dto.priority
      if (dto.dueDate !== undefined) data.dueDate = dto.dueDate ? new Date(dto.dueDate) : null

      if (dto.isCompleted !== undefined) {
        data.isCompleted = dto.isCompleted
        data.completedAt = dto.isCompleted ? new Date() : null
      }

      await tx.todo.update({
        where: { id },
        data,
      })

      if (dto.assigneeIds !== undefined) {
        await tx.todoAssignee.deleteMany({ where: { todoId: id } })

        if (dto.assigneeIds.length > 0) {
          await tx.todoAssignee.createMany({
            data: dto.assigneeIds.map((aid) => ({
              todoId: id,
              userId: aid,
            })),
          })
        }
      }

      return this.findOne(id, familyId)
    })
  }

  async remove(id: string, familyId: string) {
    const todo = await this.prisma.todo.findUnique({ where: { id } })

    if (!todo) {
      throw new NotFoundException('待办事项不存在')
    }

    if (todo.familyId !== familyId) {
      throw new ForbiddenException('无权删除该待办事项')
    }

    return this.prisma.todo.delete({ where: { id } })
  }
}
