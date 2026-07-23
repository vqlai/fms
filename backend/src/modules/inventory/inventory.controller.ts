import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { InventoryService } from './inventory.service'
import {
  CreateInventoryDto,
  UpdateInventoryDto,
  StockInOutDto,
  QueryInventoryDto,
} from './dto/inventory.dto'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { CurrentFamily } from '../common/decorators/current-family.decorator'
import { FamilyRoleGuard } from '../common/guards/family-role.guard'
import { Roles } from '../common/decorators/roles.decorator'

@ApiTags('库存管理')
@Controller('inventory')
@UseGuards(FamilyRoleGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @Roles('creator', 'member', 'viewer')
  @ApiOperation({ summary: '获取物品列表（支持分页、搜索）' })
  async findAll(@CurrentFamily() familyId: string, @Query() query: QueryInventoryDto) {
    return this.inventoryService.findAll(familyId, query)
  }

  @Get(':id')
  @Roles('creator', 'member', 'viewer')
  @ApiOperation({ summary: '获取物品详情（含操作流水）' })
  async findOne(@CurrentFamily() familyId: string, @Param('id') id: string) {
    return this.inventoryService.findOne(id, familyId)
  }

  @Post()
  @Roles('creator', 'member')
  @ApiOperation({ summary: '新增物品' })
  async create(@CurrentFamily() familyId: string, @Body() dto: CreateInventoryDto) {
    return this.inventoryService.create(familyId, dto)
  }

  @Patch(':id')
  @Roles('creator', 'member')
  @ApiOperation({ summary: '更新物品' })
  async update(
    @CurrentFamily() familyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateInventoryDto,
  ) {
    return this.inventoryService.update(id, familyId, dto)
  }

  @Delete(':id')
  @Roles('creator', 'member')
  @ApiOperation({ summary: '删除物品' })
  async remove(@CurrentFamily() familyId: string, @Param('id') id: string) {
    return this.inventoryService.remove(id, familyId)
  }

  @Post(':id/stock-in')
  @Roles('creator', 'member')
  @ApiOperation({ summary: '物品入库' })
  async stockIn(
    @CurrentFamily() familyId: string,
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: StockInOutDto,
  ) {
    return this.inventoryService.stockIn(id, familyId, userId, dto)
  }

  @Post(':id/stock-out')
  @Roles('creator', 'member')
  @ApiOperation({ summary: '物品出库/消耗' })
  async stockOut(
    @CurrentFamily() familyId: string,
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: StockInOutDto,
  ) {
    return this.inventoryService.stockOut(id, familyId, userId, dto)
  }

  @Post(':id/dispose')
  @Roles('creator', 'member')
  @ApiOperation({ summary: '物品报废处理' })
  async dispose(
    @CurrentFamily() familyId: string,
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body('note') note?: string,
  ) {
    return this.inventoryService.dispose(id, familyId, userId, note)
  }
}
