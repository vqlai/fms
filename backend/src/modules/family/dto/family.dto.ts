import { IsString, MinLength, MaxLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateFamilyDto {
  @ApiProperty({ example: '幸福小家庭' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string
}

export class JoinFamilyDto {
  @ApiProperty({ example: 'ABC123XY' })
  @IsString()
  @MinLength(1)
  @MaxLength(16)
  inviteCode: string
}

export class UpdateMemberRoleDto {
  @IsString()
  role: 'member' | 'viewer'
}
