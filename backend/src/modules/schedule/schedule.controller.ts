import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { ScheduleService } from './schedule.service'
import { CreateScheduleDto, UpdateScheduleDto, QueryScheduleDto } from './dto/schedule.dto'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { CurrentFamily } from '../common/decorators/current-family.decorator'
import { FamilyRoleGuard } from '../common/guards/family-role.guard'
import { Roles } from '../common/decorators/roles.decorator'

@ApiTags('日程管理')
@Controller('schedules')
@UseGuards(FamilyRoleGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  @Roles('creator', 'member', 'viewer')
  @ApiOperation({ summary: '获取日程列表' })
  async findAll(@CurrentFamily() familyId: string, @Query() query: QueryScheduleDto) {
    return this.scheduleService.findAll(familyId, query)
  }

  @Get(':id')
  @Roles('creator', 'member', 'viewer')
  @ApiOperation({ summary: '获取单条日程' })
  async findOne(@CurrentFamily() familyId: string, @Param('id') id: string) {
    return this.scheduleService.findOne(id, familyId)
  }

  @Post()
  @Roles('creator', 'member')
  @ApiOperation({ summary: '创建日程' })
  async create(
    @CurrentFamily() familyId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateScheduleDto,
  ) {
    return this.scheduleService.create(familyId, userId, dto)
  }

  @Patch(':id')
  @Roles('creator', 'member')
  @ApiOperation({ summary: '更新日程' })
  async update(
    @CurrentFamily() familyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.scheduleService.update(id, familyId, dto)
  }

  @Delete(':id')
  @Roles('creator', 'member')
  @ApiOperation({ summary: '删除日程' })
  async remove(@CurrentFamily() familyId: string, @Param('id') id: string) {
    return this.scheduleService.remove(id, familyId)
  }
}
