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
