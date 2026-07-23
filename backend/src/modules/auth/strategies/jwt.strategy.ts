import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'

export interface JwtPayload {
  sub: string
  email: string
  name: string
  familyId?: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET')

    if (!secret || secret === 'default-secret-change-in-production') {
      if (configService.get<string>('NODE_ENV') === 'production') {
        throw new Error(
          'JWT_SECRET 环境变量未设置或使用了默认值，生产环境必须配置安全的密钥',
        )
      }
      console.warn(
        '⚠️  JWT_SECRET 未设置，正在使用默认密钥。请勿在生产环境使用！',
      )
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret ?? 'default-secret-change-in-production',
    })
  }

  async validate(payload: JwtPayload) {
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      familyId: payload.familyId,
    }
  }
}
