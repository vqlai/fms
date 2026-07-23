import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)
  private retryCount = 0
  private readonly maxRetries = 3

  async onModuleInit() {
    await this.connectWithRetry()
  }

  async onModuleDestroy() {
    await this.$disconnect()
    this.logger.log('数据库连接已断开')
  }

  private async connectWithRetry() {
    while (this.retryCount < this.maxRetries) {
      try {
        await this.$connect()
        this.logger.log('数据库连接成功')
        this.retryCount = 0
        return
      } catch (error) {
        this.retryCount++
        this.logger.error(`数据库连接失败（第 ${this.retryCount}/${this.maxRetries} 次）: ${error}`)
        if (this.retryCount >= this.maxRetries) {
          throw error
        }
        await new Promise((resolve) => setTimeout(resolve, 2000 * this.retryCount))
      }
    }
  }
}
