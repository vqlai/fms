import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { ExpenseService } from './expense.service'
import {
  CreateExpenseDto,
  UpdateExpenseDto,
  QueryExpenseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateBudgetDto,
  UpdateBudgetDto,
  QueryReportDto,
} from './dto/expense.dto'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { CurrentFamily } from '../common/decorators/current-family.decorator'
import { FamilyRoleGuard } from '../common/guards/family-role.guard'
import { Roles } from '../common/decorators/roles.decorator'

@ApiTags('财务管理')
@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get()
  @ApiOperation({ summary: '获取收支列表（支持分页、筛选）' })
  async findAll(@CurrentFamily() familyId: string, @Query() query: QueryExpenseDto) {
    return this.expenseService.findAll(familyId, query)
  }

  @Get('report')
  @ApiOperation({ summary: '获取统计报表' })
  async getReport(@CurrentFamily() familyId: string, @Query() query: QueryReportDto) {
    return this.expenseService.getReport(familyId, query)
  }

  @Get('categories')
  @ApiOperation({ summary: '获取收支分类列表' })
  async getCategories(@CurrentFamily() familyId: string) {
    return this.expenseService.getCategories(familyId)
  }

  @Post('categories')
  @UseGuards(FamilyRoleGuard)
  @Roles('creator')
  @ApiOperation({ summary: '创建自定义分类（仅管理员）' })
  async createCategory(@CurrentFamily() familyId: string, @Body() dto: CreateCategoryDto) {
    return this.expenseService.createCategory(familyId, dto)
  }

  @Patch('categories/:id')
  @UseGuards(FamilyRoleGuard)
  @Roles('creator')
  @ApiOperation({ summary: '更新分类（仅管理员）' })
  async updateCategory(
    @CurrentFamily() familyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.expenseService.updateCategory(id, familyId, dto)
  }

  @Delete('categories/:id')
  @UseGuards(FamilyRoleGuard)
  @Roles('creator')
  @ApiOperation({ summary: '删除分类（仅管理员）' })
  async deleteCategory(@CurrentFamily() familyId: string, @Param('id') id: string) {
    return this.expenseService.deleteCategory(id, familyId)
  }

  @Get('budgets')
  @ApiOperation({ summary: '获取预算列表' })
  async getBudgets(@CurrentFamily() familyId: string) {
    return this.expenseService.getBudgets(familyId)
  }

  @Post('budgets')
  @UseGuards(FamilyRoleGuard)
  @Roles('creator', 'member')
  @ApiOperation({ summary: '设置分类预算' })
  async setBudget(@CurrentFamily() familyId: string, @Body() dto: CreateBudgetDto) {
    return this.expenseService.setBudget(familyId, dto)
  }

  @Patch('budgets/:id')
  @UseGuards(FamilyRoleGuard)
  @Roles('creator', 'member')
  @ApiOperation({ summary: '更新预算' })
  async updateBudget(
    @CurrentFamily() familyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBudgetDto,
  ) {
    return this.expenseService.updateBudget(id, familyId, dto)
  }

  @Delete('budgets/:id')
  @UseGuards(FamilyRoleGuard)
  @Roles('creator')
  @ApiOperation({ summary: '删除预算（仅管理员）' })
  async deleteBudget(@CurrentFamily() familyId: string, @Param('id') id: string) {
    return this.expenseService.deleteBudget(id, familyId)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单条收支记录' })
  async findOne(@CurrentFamily() familyId: string, @Param('id') id: string) {
    return this.expenseService.findOne(id, familyId)
  }

  @Post()
  @ApiOperation({ summary: '新增收支记录' })
  async create(
    @CurrentFamily() familyId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.expenseService.create(familyId, userId, dto)
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新收支记录' })
  async update(
    @CurrentFamily() familyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expenseService.update(id, familyId, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除收支记录（软删除）' })
  async remove(@CurrentFamily() familyId: string, @Param('id') id: string) {
    return this.expenseService.softDelete(id, familyId)
  }
}
