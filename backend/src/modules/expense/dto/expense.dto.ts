import {
  IsEnum,
  IsNumber,
  IsUUID,
  IsDateString,
  IsString,
  IsOptional,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateExpenseDto {
  @ApiProperty({ enum: ['income', 'expense'] })
  @IsEnum(['income', 'expense' as const])
  type: 'income' | 'expense'

  @ApiProperty({ example: 128.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(99999999.99)
  @Type(() => Number)
  amount: number

  @ApiProperty({ description: '分类 UUID' })
  @IsUUID()
  categoryId: string

  @ApiPropertyOptional({ example: '2026-05-15' })
  @IsDateString()
  @IsOptional()
  transactionDate?: string

  @ApiPropertyOptional({ example: '超市买菜' })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  note?: string

  @ApiPropertyOptional({ example: 'https://example.com/receipt.jpg' })
  @IsString()
  @IsOptional()
  imageUrl?: string
}

export class UpdateExpenseDto {
  @ApiPropertyOptional({ enum: ['income', 'expense'] })
  @IsEnum(['income', 'expense' as const])
  @IsOptional()
  type?: 'income' | 'expense'

  @ApiPropertyOptional({ example: 128.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(99999999.99)
  @IsOptional()
  @Type(() => Number)
  amount?: number

  @ApiPropertyOptional({ description: '分类 UUID' })
  @IsUUID()
  @IsOptional()
  categoryId?: string

  @ApiPropertyOptional({ example: '2026-05-15' })
  @IsDateString()
  @IsOptional()
  transactionDate?: string

  @ApiPropertyOptional({ example: '超市买菜' })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  note?: string

  @ApiPropertyOptional({ example: 'https://example.com/receipt.jpg' })
  @IsString()
  @IsOptional()
  imageUrl?: string
}

export class QueryExpenseDto {
  @ApiPropertyOptional({ default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number

  @ApiPropertyOptional({ default: 20 })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  pageSize?: number

  @ApiPropertyOptional({ enum: ['income', 'expense'] })
  @IsEnum(['income', 'expense' as const])
  @IsOptional()
  type?: 'income' | 'expense'

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  categoryId?: string

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  userId?: string

  @ApiPropertyOptional({ example: '2026-05-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string

  @ApiPropertyOptional({ example: '2026-05-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string
}

export class CreateCategoryDto {
  @ApiProperty({ example: '健身' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string

  @ApiProperty({ enum: ['income', 'expense'] })
  @IsEnum(['income', 'expense' as const])
  type: 'income' | 'expense'

  @ApiPropertyOptional({ example: '🏋️' })
  @IsString()
  @IsOptional()
  icon?: string

  @ApiPropertyOptional({ example: '#8B5CF6' })
  @IsString()
  @IsOptional()
  color?: string

  @ApiPropertyOptional({ default: 0 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sortOrder?: number
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: '健身运动' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @IsOptional()
  name?: string

  @ApiPropertyOptional({ example: '🏋️' })
  @IsString()
  @IsOptional()
  icon?: string

  @ApiPropertyOptional({ example: '#8B5CF6' })
  @IsString()
  @IsOptional()
  color?: string

  @ApiPropertyOptional({ default: 0 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sortOrder?: number
}

export class CreateBudgetDto {
  @ApiProperty({ description: '分类 UUID' })
  @IsUUID()
  categoryId: string

  @ApiProperty({ example: 5000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(99999999.99)
  @Type(() => Number)
  amount: number
}

export class UpdateBudgetDto {
  @ApiProperty({ example: 5000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(99999999.99)
  @Type(() => Number)
  amount: number
}

export class QueryReportDto {
  @ApiPropertyOptional({ example: '2026-05-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string

  @ApiPropertyOptional({ example: '2026-05-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string
}
