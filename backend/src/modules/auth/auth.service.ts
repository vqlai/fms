import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../common/prisma/prisma.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, dto.phone ? { phone: dto.phone } : {}],
      },
    })

    if (existing) {
      throw new ConflictException('邮箱或手机号已被注册')
    }

    const saltRounds = this.configService.get<number>('bcrypt.saltRounds', 12)
    const passwordHash = await bcrypt.hash(dto.password, saltRounds)

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        phone: dto.phone,
      },
    })

    const families = await this.getUserFamilies(user.id)

    return this.generateTokens(
      { sub: user.id, email: user.email, name: user.name },
      families,
    )
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误')
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash)

    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误')
    }

    const families = await this.getUserFamilies(user.id)

    return this.generateTokens(
      { sub: user.id, email: user.email, name: user.name },
      families,
    )
  }

  private async getUserFamilies(userId: string) {
    const memberships = await this.prisma.familyMember.findMany({
      where: { userId },
      include: { family: true },
    })
    return memberships.map((m) => ({
      id: m.family.id,
      name: m.family.name,
      inviteCode: m.family.inviteCode,
      inviteCodeExpiresAt: m.family.inviteCodeExpiresAt,
      createdAt: m.family.createdAt,
      updatedAt: m.family.updatedAt,
      role: m.role,
    }))
  }

  private generateTokens(
    payload: { sub: string; email: string; name: string },
    families: { id: string; name: string; role: string }[] = [],
  ) {
    const accessToken = this.jwtService.sign(payload)

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
    })

    return {
      accessToken,
      refreshToken,
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
      },
      families,
    }
  }

  async switchFamily(userId: string, familyId: string) {
    const membership = await this.prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId,
        },
      },
      include: {
        family: true,
        user: true,
      },
    })

    if (!membership) {
      throw new BadRequestException('您不属于该家庭组')
    }

    const accessToken = this.jwtService.sign({
      sub: userId,
      email: membership.user.email,
      name: membership.user.name,
      familyId,
    })

    const refreshToken = this.jwtService.sign(
      {
        sub: userId,
        email: membership.user.email,
        name: membership.user.name,
        familyId,
      },
      { expiresIn: '30d' },
    )

    return {
      accessToken,
      refreshToken,
      family: {
        id: membership.family.id,
        name: membership.family.name,
        role: membership.role,
      },
    }
  }
}
