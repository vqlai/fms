import { Controller, Get, Patch, Body } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { UserService } from './user.service'
import { UpdateUserDto } from './dto/update-user.dto'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('用户')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @ApiOperation({ summary: '获取当前用户信息' })
  async getProfile(@CurrentUser('sub') userId: string) {
    return this.userService.getProfile(userId)
  }

  @Patch('profile')
  @ApiOperation({ summary: '更新当前用户信息' })
  async updateProfile(@CurrentUser('sub') userId: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateProfile(userId, dto)
  }
}
