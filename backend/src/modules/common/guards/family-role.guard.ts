import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PrismaService } from '../prisma/prisma.service'
import { FamilyRole } from '@prisma/client'
import { ROLES_KEY } from '../decorators/roles.decorator'

@Injectable()
export class FamilyRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<FamilyRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const userId = request.user?.sub
    const familyId = request.user?.familyId ?? request.headers['x-family-id']

    if (!userId || !familyId) {
      throw new ForbiddenException('无法验证家庭成员身份，请先创建或加入家庭组')
    }

    const membership = await this.prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId,
        },
      },
    })

    if (!membership) {
      throw new ForbiddenException('您不属于该家庭组')
    }

    if (!requiredRoles.includes(membership.role)) {
      throw new ForbiddenException('您没有执行此操作的权限')
    }

    return true
  }
}
