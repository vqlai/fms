import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from '../common/prisma/prisma.service'

@Injectable()
export class ReminderScheduler {
  private readonly logger = new Logger(ReminderScheduler.name)

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async sendDueReminders() {
    const now = new Date()

    const reminders = await this.prisma.scheduleReminder.findMany({
      where: {
        isSent: false,
        remindAt: { lte: now },
      },
      include: {
        schedule: {
          select: {
            id: true,
            title: true,
            startTime: true,
            familyId: true,
            createdById: true,
          },
        },
      },
      take: 50,
    })

    if (reminders.length === 0) return

    this.logger.log(`处理 ${reminders.length} 条到期提醒`)

    await this.prisma.notification.createMany({
      data: reminders.map((r) => ({
        userId: r.schedule.createdById,
        familyId: r.schedule.familyId,
        type: 'schedule_reminder' as const,
        title: '日程提醒',
        body: `「${r.schedule.title}」即将开始`,
        metadata: { scheduleId: r.schedule.id, reminderId: r.id },
      })),
    })

    const reminderIds = reminders.map((r) => r.id)
    await this.prisma.scheduleReminder.updateMany({
      where: { id: { in: reminderIds } },
      data: { isSent: true },
    })

    this.logger.log(`已发送 ${reminders.length} 条提醒通知`)
  }
}
