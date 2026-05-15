import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const CurrentFamily = createParamDecorator((_data: undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  return request.user?.familyId
})
