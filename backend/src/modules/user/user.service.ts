import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../common/prisma/prisma.service'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
      },
    })

    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    const families = await this.prisma.familyMember.findMany({
      where: { userId },
      include: {
        family: {
          select: { id: true, name: true },
        },
      },
    })

    return {
      ...user,
      families: families.map((m) => ({
        id: m.family.id,
        name: m.family.name,
        role: m.role,
      })),
    }
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    if (dto.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: dto.email },
      })

      if (existingEmail && existingEmail.id !== userId) {
        throw new ConflictException('该邮箱已被使用')
      }
    }

    if (dto.phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone: dto.phone },
      })

      if (existingPhone && existingPhone.id !== userId) {
        throw new ConflictException('该手机号已被使用')
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        avatarUrl: dto.avatarUrl,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        avatarUrl: true,
      },
    })
  }
}
