import { CreateScheduleDto, UpdateScheduleDto, QueryScheduleDto } from './dto/schedule.dto'
import { PrismaService } from '../common/prisma/prisma.service'
import { Prisma } from '@prisma/client'
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common'

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(familyId: string, query: QueryScheduleDto) {
    const where: Prisma.ScheduleWhereInput = { familyId }

    if (query.startDate || query.endDate) {
      where.startTime = {}
      if (query.startDate) where.startTime.gte = new Date(query.startDate)
      if (query.endDate) where.startTime.lte = new Date(query.endDate)
    }

    if (query.userId) {
      where.participants = {
        some: { userId: query.userId },
      }
    }

    return this.prisma.schedule.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true, avatarUrl: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
        reminders: true,
      },
      orderBy: { startTime: 'asc' },
    })
  }

  async findOne(id: string, familyId: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, avatarUrl: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
        reminders: true,
      },
    })

    if (!schedule) {
      throw new NotFoundException('日程不存在')
    }

    if (schedule.familyId !== familyId) {
      throw new ForbiddenException('无权访问该日程')
    }

    return schedule
  }

  async create(familyId: string, userId: string, dto: CreateScheduleDto) {
    if (dto.endTime && new Date(dto.endTime) <= new Date(dto.startTime)) {
      throw new BadRequestException('结束时间必须晚于开始时间')
    }

    return this.prisma.$transaction(async (tx) => {
      const schedule = await tx.schedule.create({
        data: {
          familyId,
          createdById: userId,
          title: dto.title,
          startTime: new Date(dto.startTime),
          endTime: dto.endTime ? new Date(dto.endTime) : null,
          isAllDay: dto.isAllDay ?? false,
          repeatRule: dto.repeatRule,
          repeatDays: dto.repeatDays,
          note: dto.note,
        },
      })

      if (dto.participantIds && dto.participantIds.length > 0) {
        await tx.scheduleParticipant.createMany({
          data: dto.participantIds.map((participantId) => ({
            scheduleId: schedule.id,
            userId: participantId,
          })),
        })
      }

      if (dto.reminderMinutes && dto.reminderMinutes.length > 0) {
        await tx.scheduleReminder.createMany({
          data: dto.reminderMinutes.map((minutes) => ({
            scheduleId: schedule.id,
            remindAt: new Date(new Date(dto.startTime).getTime() - minutes * 60000),
          })),
        })
      }

      return tx.schedule.findUnique({
        where: { id: schedule.id },
        include: {
          createdBy: {
            select: { id: true, name: true, avatarUrl: true },
          },
          participants: {
            include: {
              user: {
                select: { id: true, name: true, avatarUrl: true },
              },
            },
          },
          reminders: true,
        },
      })
    })
  }

  async update(id: string, familyId: string, dto: UpdateScheduleDto) {
    const schedule = await this.prisma.schedule.findUnique({ where: { id } })

    if (!schedule) {
      throw new NotFoundException('日程不存在')
    }

    if (schedule.familyId !== familyId) {
      throw new ForbiddenException('无权修改该日程')
    }

    return this.prisma.$transaction(async (tx) => {
      const data: Prisma.ScheduleUpdateInput = {}

      if (dto.title !== undefined) data.title = dto.title
      if (dto.startTime !== undefined) data.startTime = new Date(dto.startTime)
      if (dto.endTime !== undefined) data.endTime = dto.endTime ? new Date(dto.endTime) : null
      if (dto.isAllDay !== undefined) data.isAllDay = dto.isAllDay
      if (dto.repeatRule !== undefined) data.repeatRule = dto.repeatRule
      if (dto.repeatDays !== undefined) data.repeatDays = dto.repeatDays
      if (dto.note !== undefined) data.note = dto.note

      await tx.schedule.update({
        where: { id },
        data,
      })

      if (dto.participantIds !== undefined) {
        await tx.scheduleParticipant.deleteMany({ where: { scheduleId: id } })

        if (dto.participantIds.length > 0) {
          await tx.scheduleParticipant.createMany({
            data: dto.participantIds.map((pid) => ({
              scheduleId: id,
              userId: pid,
            })),
          })
        }
      }

      if (dto.reminderMinutes !== undefined) {
        await tx.scheduleReminder.deleteMany({ where: { scheduleId: id } })

        if (dto.reminderMinutes.length > 0) {
          const baseTime = dto.startTime ? new Date(dto.startTime) : schedule.startTime
          await tx.scheduleReminder.createMany({
            data: dto.reminderMinutes.map((minutes) => ({
              scheduleId: id,
              remindAt: new Date(baseTime.getTime() - minutes * 60000),
            })),
          })
        }
      }

      return tx.schedule.findUnique({
        where: { id },
        include: {
          createdBy: {
            select: { id: true, name: true, avatarUrl: true },
          },
          participants: {
            include: {
              user: {
                select: { id: true, name: true, avatarUrl: true },
              },
            },
          },
          reminders: true,
        },
      })
    })
  }

  async remove(id: string, familyId: string) {
    const schedule = await this.prisma.schedule.findUnique({ where: { id } })

    if (!schedule) {
      throw new NotFoundException('日程不存在')
    }

    if (schedule.familyId !== familyId) {
      throw new ForbiddenException('无权删除该日程')
    }

    return this.prisma.schedule.delete({ where: { id } })
  }
}
