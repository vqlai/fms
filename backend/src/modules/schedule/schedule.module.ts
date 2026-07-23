import { Module } from '@nestjs/common'
import { ScheduleController } from './schedule.controller'
import { ScheduleService } from './schedule.service'
import { ReminderScheduler } from './reminder.scheduler'

@Module({
  controllers: [ScheduleController],
  providers: [ScheduleService, ReminderScheduler],
  exports: [ScheduleService],
})
export class ScheduleModule {}
