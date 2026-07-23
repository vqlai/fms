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
