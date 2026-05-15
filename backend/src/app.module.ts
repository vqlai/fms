import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { CommonModule } from './modules/common/common.module'
import { AuthModule } from './modules/auth/auth.module'
import { UserModule } from './modules/user/user.module'
import { FamilyModule } from './modules/family/family.module'
import { ExpenseModule } from './modules/expense/expense.module'
import { ScheduleModule as FamilyScheduleModule } from './modules/schedule/schedule.module'
import { TodoModule } from './modules/todo/todo.module'
import { InventoryModule } from './modules/inventory/inventory.module'
import { JwtAuthGuard } from './modules/common/guards/jwt-auth.guard'
import { TransformInterceptor } from './modules/common/interceptors/transform.interceptor'
import appConfig from './config/app.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    ScheduleModule.forRoot(),
    CommonModule,
    AuthModule,
    UserModule,
    FamilyModule,
    ExpenseModule,
    FamilyScheduleModule,
    TodoModule,
    InventoryModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
