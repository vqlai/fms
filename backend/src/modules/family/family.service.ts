import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../common/prisma/prisma.service'
import { CreateFamilyDto, JoinFamilyDto } from './dto/family.dto'
import { v4 as uuidv4 } from 'uuid'

const PRESET_EXPENSE_CATEGORIES = [
  { name: '餐饮', icon: '🍜', color: '#EF4444' },
  { name: '交通', icon: '🚗', color: '#F59E0B' },
  { name: '住房', icon: '🏠', color: '#8B5CF6' },
  { name: '水电', icon: '⚡', color: '#06B6D4' },
  { name: '教育', icon: '📚', color: '#3B82F6' },
  { name: '医疗', icon: '💊', color: '#EC4899' },
  { name: '购物', icon: '🛒', color: '#F97316' },
  { name: '娱乐', icon: '🎮', color: '#A855F7' },
  { name: '信用卡还款', icon: '💳', color: '#64748B' },
  { name: '通讯', icon: '📱', color: '#14B8A6' },
  { name: '人情', icon: '🎁', color: '#E11D48' },
  { name: '宠物', icon: '🐱', color: '#FBBF24' },
  { name: '其他', icon: '💰', color: '#6B7280' },
]

const PRESET_INCOME_CATEGORIES = [
  { name: '工资', icon: '💵', color: '#10B981' },
  { name: '奖金', icon: '🎁', color: '#34D399' },
  { name: '投资收益', icon: '📈', color: '#059669' },
  { name: '房租收入', icon: '🏠', color: '#047857' },
  { name: '其他', icon: '💰', color: '#6B7280' },
]

@Injectable()
export class FamilyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateFamilyDto) {
    const inviteCode = uuidv4().substring(0, 8).toUpperCase()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    const family = await this.prisma.$transaction(async (tx) => {
      const created = await tx.family.create({
        data: {
          name: dto.name,
          createdById: userId,
          inviteCode,
          inviteCodeExpiresAt: expiresAt,
        },
      })

      await tx.familyMember.create({
        data: {
          familyId: created.id,
          userId,
          role: 'creator',
        },
      })

      const categoryData = [
        ...PRESET_EXPENSE_CATEGORIES.map((c, i) => ({
          familyId: created.id,
          name: c.name,
          type: 'expense' as const,
          icon: c.icon,
          color: c.color,
          sortOrder: i,
          isSystem: true,
        })),
        ...PRESET_INCOME_CATEGORIES.map((c, i) => ({
          familyId: created.id,
          name: c.name,
          type: 'income' as const,
          icon: c.icon,
          color: c.color,
          sortOrder: i,
          isSystem: true,
        })),
      ]

      await tx.category.createMany({ data: categoryData })

      return created
    })

    return {
      ...family,
      inviteCode: family.inviteCode,
    }
  }

  async join(userId: string, dto: JoinFamilyDto) {
    const family = await this.prisma.family.findUnique({
      where: { inviteCode: dto.inviteCode },
    })

    if (!family) {
      throw new BadRequestException('邀请码无效')
    }

    if (new Date() > family.inviteCodeExpiresAt) {
      throw new BadRequestException('邀请码已过期，请联系管理员重新生成')
    }

    const existing = await this.prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId: family.id,
          userId,
        },
      },
    })

    if (existing) {
      throw new BadRequestException('您已加入该家庭组')
    }

    await this.prisma.familyMember.create({
      data: {
        familyId: family.id,
        userId,
        role: 'member',
      },
    })

    return {
      familyId: family.id,
      familyName: family.name,
    }
  }

  async getFamilies(userId: string) {
    const memberships = await this.prisma.familyMember.findMany({
      where: { userId },
      include: {
        family: {
          include: {
            _count: {
              select: { members: true },
            },
          },
        },
      },
    })

    return memberships.map((m) => ({
      id: m.family.id,
      name: m.family.name,
      role: m.role,
      memberCount: m.family._count.members,
      joinedAt: m.joinedAt,
    }))
  }

  async getFamilyDetail(familyId: string) {
    const family = await this.prisma.family.findUnique({
      where: { id: familyId },
      include: {
        _count: {
          select: { members: true },
        },
      },
    })

    if (!family) {
      throw new NotFoundException('家庭组不存在')
    }

    return family
  }

  async getMembers(familyId: string) {
    return this.prisma.familyMember.findMany({
      where: { familyId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    })
  }

  async updateMemberRole(familyId: string, memberId: string, role: 'member' | 'viewer') {
    const membership = await this.prisma.familyMember.findUnique({
      where: { id: memberId },
    })

    if (!membership || membership.familyId !== familyId) {
      throw new NotFoundException('成员不存在')
    }

    if (membership.role === 'creator') {
      throw new ForbiddenException('不能修改管理员的角色')
    }

    return this.prisma.familyMember.update({
      where: { id: memberId },
      data: { role },
    })
  }

  async removeMember(familyId: string, memberId: string) {
    const membership = await this.prisma.familyMember.findUnique({
      where: { id: memberId },
    })

    if (!membership || membership.familyId !== familyId) {
      throw new NotFoundException('成员不存在')
    }

    if (membership.role === 'creator') {
      throw new ForbiddenException('不能移除管理员')
    }

    return this.prisma.familyMember.delete({
      where: { id: memberId },
    })
  }

  async regenerateInviteCode(familyId: string) {
    const inviteCode = uuidv4().substring(0, 8).toUpperCase()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    return this.prisma.family.update({
      where: { id: familyId },
      data: {
        inviteCode,
        inviteCodeExpiresAt: expiresAt,
      },
      select: {
        inviteCode: true,
        inviteCodeExpiresAt: true,
      },
    })
  }
}
