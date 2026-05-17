export interface Schedule {
  id: string
  title: string
  startTime: string
  endTime: string | null
  isAllDay: boolean
  repeatRule: string | null
  repeatDays: number[] | null
  note: string | null
  familyId: string
  createdById: string
  createdBy: {
    id: string
    name: string
  }
  participants: ScheduleParticipant[]
  reminders: ScheduleReminder[]
  createdAt: string
  updatedAt: string
}

export interface ScheduleParticipant {
  id: string
  userId: string
  user: {
    id: string
    name: string
  }
}

export interface ScheduleReminder {
  id: string
  minutes: number
  notified: boolean
}

export interface CreateScheduleDto {
  title: string
  startTime: string
  endTime?: string
  isAllDay?: boolean
  repeatRule?: string
  repeatDays?: number[]
  note?: string
  participantIds?: string[]
  reminderMinutes?: number[]
}

export interface UpdateScheduleDto extends Partial<CreateScheduleDto> {}

export interface QueryScheduleDto {
  startDate?: string
  endDate?: string
  userId?: string
}

export interface Todo {
  id: string
  title: string
  description: string | null
  priority: number
  isCompleted: boolean
  dueDate: string | null
  completedAt: string | null
  familyId: string
  createdById: string
  createdBy: {
    id: string
    name: string
  }
  assignees: TodoAssignee[]
  createdAt: string
  updatedAt: string
}

export interface TodoAssignee {
  id: string
  userId: string
  user: {
    id: string
    name: string
  }
}

export interface CreateTodoDto {
  title: string
  description?: string
  priority?: number
  dueDate?: string
  assigneeIds?: string[]
}

export interface UpdateTodoDto {
  title?: string
  description?: string
  priority?: number
  dueDate?: string
  isCompleted?: boolean
  assigneeIds?: string[]
}

export interface QueryTodoDto {
  isCompleted?: boolean
  assigneeId?: string
}
