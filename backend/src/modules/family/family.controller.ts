import { Controller, Get, Post, Delete, Patch, Body, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { FamilyService } from './family.service'
import { CreateFamilyDto, JoinFamilyDto } from './dto/family.dto'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { CurrentFamily } from '../common/decorators/current-family.decorator'
import { FamilyRoleGuard } from '../common/guards/family-role.guard'
import { Roles } from '../common/decorators/roles.decorator'

@ApiTags('家庭管理')
@Controller('families')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Post()
  @ApiOperation({ summary: '创建家庭组' })
  async create(@CurrentUser('sub') userId: string, @Body() dto: CreateFamilyDto) {
    return this.familyService.create(userId, dto)
  }

  @Post('join')
  @ApiOperation({ summary: '通过邀请码加入家庭组' })
  async join(@CurrentUser('sub') userId: string, @Body() dto: JoinFamilyDto) {
    return this.familyService.join(userId, dto)
  }

  @Get()
  @ApiOperation({ summary: '获取用户的所有家庭组' })
  async getFamilies(@CurrentUser('sub') userId: string) {
    return this.familyService.getFamilies(userId)
  }

  @Get('current')
  @UseGuards(FamilyRoleGuard)
  @Roles('creator', 'member', 'viewer')
  @ApiOperation({ summary: '获取当前家庭组详情' })
  async getCurrentFamily(@CurrentFamily() familyId: string) {
    return this.familyService.getFamilyDetail(familyId)
  }

  @Get('current/members')
  @UseGuards(FamilyRoleGuard)
  @Roles('creator', 'member', 'viewer')
  @ApiOperation({ summary: '获取当前家庭组成员' })
  async getMembers(@CurrentFamily() familyId: string) {
    return this.familyService.getMembers(familyId)
  }

  @Patch('current/members/:memberId')
  @UseGuards(FamilyRoleGuard)
  @Roles('creator')
  @ApiOperation({ summary: '更新成员角色（仅管理员）' })
  async updateMemberRole(
    @CurrentFamily() familyId: string,
    @Param('memberId') memberId: string,
    @Body('role') role: 'member' | 'viewer',
  ) {
    return this.familyService.updateMemberRole(familyId, memberId, role)
  }

  @Delete('current/members/:memberId')
  @UseGuards(FamilyRoleGuard)
  @Roles('creator')
  @ApiOperation({ summary: '移除成员（仅管理员）' })
  async removeMember(@CurrentFamily() familyId: string, @Param('memberId') memberId: string) {
    return this.familyService.removeMember(familyId, memberId)
  }

  @Post('current/invite-code')
  @UseGuards(FamilyRoleGuard)
  @Roles('creator')
  @ApiOperation({ summary: '重新生成邀请码' })
  async regenerateInviteCode(@CurrentFamily() familyId: string) {
    return this.familyService.regenerateInviteCode(familyId)
  }
}
