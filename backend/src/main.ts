import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api')

  const defaultOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000']
  const allowedOrigins =
    process.env.NODE_ENV === 'production'
      ? (process.env.ALLOWED_ORIGINS?.split(',').filter(Boolean) ?? defaultOrigins)
      : true

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )

  const config = new DocumentBuilder()
    .setTitle('家庭管家 API')
    .setDescription('家庭管理系统 — 财务、日程、库存一站式管理')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  const port = process.env.PORT ?? 3000
  await app.listen(port)

  console.log(`🚀 家庭管家服务已启动: http://localhost:${port}`)
  console.log(`📖 Swagger 文档: http://localhost:${port}/api/docs`)
}

bootstrap()
