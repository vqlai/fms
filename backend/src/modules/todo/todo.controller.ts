import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { TodoService } from './todo.service'
import { CreateTodoDto, UpdateTodoDto, QueryTodoDto } from './dto/todo.dto'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { CurrentFamily } from '../common/decorators/current-family.decorator'
import { FamilyRoleGuard } from '../common/guards/family-role.guard'
import { Roles } from '../common/decorators/roles.decorator'

@ApiTags('待办管理')
@Controller('todos')
@UseGuards(FamilyRoleGuard)
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  @Roles('creator', 'member', 'viewer')
  @ApiOperation({ summary: '获取待办列表' })
  async findAll(@CurrentFamily() familyId: string, @Query() query: QueryTodoDto) {
    return this.todoService.findAll(familyId, query)
  }

  @Get(':id')
  @Roles('creator', 'member', 'viewer')
  @ApiOperation({ summary: '获取单条待办' })
  async findOne(@CurrentFamily() familyId: string, @Param('id') id: string) {
    return this.todoService.findOne(id, familyId)
  }

  @Post()
  @Roles('creator', 'member')
  @ApiOperation({ summary: '创建待办事项' })
  async create(
    @CurrentFamily() familyId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateTodoDto,
  ) {
    return this.todoService.create(familyId, userId, dto)
  }

  @Patch(':id')
  @Roles('creator', 'member')
  @ApiOperation({ summary: '更新待办事项' })
  async update(
    @CurrentFamily() familyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTodoDto,
  ) {
    return this.todoService.update(id, familyId, dto)
  }

  @Delete(':id')
  @Roles('creator', 'member')
  @ApiOperation({ summary: '删除待办事项' })
  async remove(@CurrentFamily() familyId: string, @Param('id') id: string) {
    return this.todoService.remove(id, familyId)
  }
}
