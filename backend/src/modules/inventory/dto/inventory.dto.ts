import {
  IsString,
  IsDateString,
  IsOptional,
  MaxLength,
  Min,
  Max,
  IsInt,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

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

  @ApiPropertyOptional({ example: 'https://example.com/milk.jpg' })
  @IsString()
  @IsOptional()
  imageUrl?: string
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

  @ApiPropertyOptional({ example: 'https://example.com/milk.jpg' })
  @IsString()
  @IsOptional()
  imageUrl?: string
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
