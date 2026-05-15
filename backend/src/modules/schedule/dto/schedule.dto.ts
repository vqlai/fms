import {
  IsString,
  IsDateString,
  IsBoolean,
  IsUUID,
  IsOptional,
  IsArray,
  MaxLength,
  Min,
  Max,
  IsInt,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateScheduleDto {
  @ApiProperty({ example: '家庭聚餐' })
  @IsString()
  @MaxLength(200)
  title: string

  @ApiProperty({ example: '2026-05-15T18:00:00.000Z' })
  @IsDateString()
  startTime: string

  @ApiPropertyOptional({ example: '2026-05-15T20:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  endTime?: string

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isAllDay?: boolean

  @ApiPropertyOptional({ example: 'weekly' })
  @IsString()
  @IsOptional()
  repeatRule?: string

  @ApiPropertyOptional({ example: [1, 3, 5] })
  @IsArray()
  @IsOptional()
  repeatDays?: number[]

  @ApiPropertyOptional({ example: '带上相机' })
  @IsString()
  @IsOptional()
  note?: string

  @ApiPropertyOptional({ example: ['uuid1', 'uuid2'], description: '参与者 UUID 列表' })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  participantIds?: string[]

  @ApiPropertyOptional({ example: [15, 60], description: '提前提醒分钟数' })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  reminderMinutes?: number[]
}

export class UpdateScheduleDto {
  @ApiPropertyOptional({ example: '家庭聚餐' })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  title?: string

  @ApiPropertyOptional({ example: '2026-05-15T18:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  startTime?: string

  @ApiPropertyOptional({ example: '2026-05-15T20:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  endTime?: string

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isAllDay?: boolean

  @ApiPropertyOptional({ example: 'weekly' })
  @IsString()
  @IsOptional()
  repeatRule?: string

  @ApiPropertyOptional({ example: [1, 3, 5] })
  @IsArray()
  @IsOptional()
  repeatDays?: number[]

  @ApiPropertyOptional({ example: '带上相机' })
  @IsString()
  @IsOptional()
  note?: string

  @ApiPropertyOptional({ example: ['uuid1', 'uuid2'], description: '参与者 UUID 列表' })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  participantIds?: string[]

  @ApiPropertyOptional({ example: [15, 60], description: '提前提醒分钟数' })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  reminderMinutes?: number[]
}

export class QueryScheduleDto {
  @ApiPropertyOptional({ example: '2026-05-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string

  @ApiPropertyOptional({ example: '2026-05-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string

  @ApiPropertyOptional({ example: 'uuid', description: '按成员筛选' })
  @IsUUID()
  @IsOptional()
  userId?: string
}

export class CreateTodoDto {
  @ApiProperty({ example: '买菜' })
  @IsString()
  @MaxLength(200)
  title: string

  @ApiPropertyOptional({ example: '去超市买蔬菜和水果' })
  @IsString()
  @IsOptional()
  description?: string

  @ApiPropertyOptional({ default: 2, description: '1=高, 2=中, 3=低' })
  @IsInt()
  @Min(1)
  @Max(3)
  @IsOptional()
  @Type(() => Number)
  priority?: number

  @ApiPropertyOptional({ example: '2026-05-16' })
  @IsDateString()
  @IsOptional()
  dueDate?: string

  @ApiPropertyOptional({ example: ['uuid1', 'uuid2'], description: '指派用户 UUID 列表' })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  assigneeIds?: string[]
}

export class UpdateTodoDto {
  @ApiPropertyOptional({ example: '买菜' })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  title?: string

  @ApiPropertyOptional({ example: '去超市买蔬菜和水果' })
  @IsString()
  @IsOptional()
  description?: string

  @ApiPropertyOptional({ default: 2, description: '1=高, 2=中, 3=低' })
  @IsInt()
  @Min(1)
  @Max(3)
  @IsOptional()
  @Type(() => Number)
  priority?: number

  @ApiPropertyOptional({ example: '2026-05-16' })
  @IsDateString()
  @IsOptional()
  dueDate?: string

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean

  @ApiPropertyOptional({ example: ['uuid1', 'uuid2'], description: '指派用户 UUID 列表' })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  assigneeIds?: string[]
}

export class QueryTodoDto {
  @ApiPropertyOptional({ description: '按完成状态筛选' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isCompleted?: boolean

  @ApiPropertyOptional({ description: '按指派人 UUID 筛选' })
  @IsUUID()
  @IsOptional()
  assigneeId?: string
}

export class CreateInventoryDto {
  @ApiProperty({ example: '牛奶' })
  @IsString()
  @MaxLength(100)
  name: string

  @ApiProperty({
    enum: ['fresh_food', 'dry_food', 'cleaning', 'medicine', 'personal_care', 'tools', 'other'],
  })
  @IsString()
  category: string

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  quantity: number

  @ApiProperty({ example: '瓶' })
  @IsString()
  @IsOptional()
  unit?: string

  @ApiPropertyOptional({ example: '冰箱冷藏室' })
  @IsString()
  @IsOptional()
  location?: string

  @ApiPropertyOptional({ example: '2026-05-30' })
  @IsDateString()
  @IsOptional()
  expiryDate?: string

  @ApiPropertyOptional({ example: 3, description: '最低库存阈值' })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minQuantity?: number

  @ApiPropertyOptional({ example: '成人奶粉' })
  @IsString()
  @IsOptional()
  note?: string

  @ApiPropertyOptional({ example: '6901234567890' })
  @IsString()
  @IsOptional()
  barcode?: string
}

export class UpdateInventoryDto {
  @ApiPropertyOptional({ example: '牛奶' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  name?: string

  @ApiPropertyOptional({
    enum: ['fresh_food', 'dry_food', 'cleaning', 'medicine', 'personal_care', 'tools', 'other'],
  })
  @IsString()
  @IsOptional()
  category?: string

  @ApiPropertyOptional({ example: '瓶' })
  @IsString()
  @IsOptional()
  unit?: string

  @ApiPropertyOptional({ example: '冰箱冷藏室' })
  @IsString()
  @IsOptional()
  location?: string

  @ApiPropertyOptional({ example: '2026-05-30' })
  @IsDateString()
  @IsOptional()
  expiryDate?: string

  @ApiPropertyOptional({ example: 3 })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minQuantity?: number

  @ApiPropertyOptional({ example: '成人奶粉' })
  @IsString()
  @IsOptional()
  note?: string

  @ApiPropertyOptional({ example: '6901234567890' })
  @IsString()
  @IsOptional()
  barcode?: string
}

export class StockInOutDto {
  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number

  @ApiPropertyOptional({ example: 35.5 })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  price?: number

  @ApiPropertyOptional({ example: '超市采购' })
  @IsString()
  @IsOptional()
  note?: string
}

export class QueryInventoryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  category?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  location?: string

  @ApiPropertyOptional({ example: '牛奶' })
  @IsString()
  @IsOptional()
  keyword?: string

  @ApiPropertyOptional({ default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number

  @ApiPropertyOptional({ default: 20 })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  pageSize?: number
}
