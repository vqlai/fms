import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '../common/prisma/prisma.service'
import {
  CreateInventoryDto,
  UpdateInventoryDto,
  StockInOutDto,
  QueryInventoryDto,
} from '../schedule/dto/schedule.dto'
import { Prisma, InventoryCategory } from '@prisma/client'

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(familyId: string, query: QueryInventoryDto) {
    const { page = 1, pageSize = 20, category, location, keyword } = query

    const where: Prisma.InventoryItemWhereInput = { familyId }

    if (category) where.category = category as InventoryCategory
    if (location) where.location = { contains: location }
    if (keyword) where.name = { contains: keyword }

    const [data, total] = await Promise.all([
      this.prisma.inventoryItem.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ expiryDate: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.inventoryItem.count({ where }),
    ])

    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  }

  async findOne(id: string, familyId: string) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        logs: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })

    if (!item) {
      throw new NotFoundException('物品不存在')
    }

    if (item.familyId !== familyId) {
      throw new ForbiddenException('无权访问该物品')
    }

    return item
  }

  async create(familyId: string, dto: CreateInventoryDto) {
    return this.prisma.inventoryItem.create({
      data: {
        familyId,
        name: dto.name,
        category: dto.category as InventoryCategory,
        quantity: dto.quantity,
        unit: dto.unit ?? '件',
        location: dto.location,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        minQuantity: dto.minQuantity ?? 0,
        note: dto.note,
        barcode: dto.barcode,
      },
    })
  }

  async update(id: string, familyId: string, dto: UpdateInventoryDto) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id } })

    if (!item || item.familyId !== familyId) {
      throw new NotFoundException('物品不存在')
    }

    return this.prisma.inventoryItem.update({
      where: { id },
      data: {
        name: dto.name,
        category: dto.category as InventoryCategory,
        unit: dto.unit,
        location: dto.location,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
        minQuantity: dto.minQuantity,
        note: dto.note,
        barcode: dto.barcode,
      },
    })
  }

  async remove(id: string, familyId: string) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id } })

    if (!item || item.familyId !== familyId) {
      throw new NotFoundException('物品不存在')
    }

    return this.prisma.inventoryItem.delete({ where: { id } })
  }

  async stockIn(id: string, familyId: string, userId: string, dto: StockInOutDto) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id } })

    if (!item || item.familyId !== familyId) {
      throw new NotFoundException('物品不存在')
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.inventoryItem.update({
        where: { id },
        data: {
          quantity: { increment: dto.quantity },
        },
      })

      return tx.stockLog.create({
        data: {
          itemId: id,
          userId,
          action: 'stock_in',
          quantity: dto.quantity,
          price: dto.price,
          note: dto.note,
        },
      })
    })
  }

  async stockOut(id: string, familyId: string, userId: string, dto: StockInOutDto) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id } })

    if (!item || item.familyId !== familyId) {
      throw new NotFoundException('物品不存在')
    }

    if (Number(item.quantity) < dto.quantity) {
      throw new BadRequestException('库存不足')
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.inventoryItem.update({
        where: { id },
        data: {
          quantity: { decrement: dto.quantity },
        },
      })

      return tx.stockLog.create({
        data: {
          itemId: id,
          userId,
          action: 'stock_out',
          quantity: dto.quantity,
          note: dto.note,
        },
      })
    })
  }

  async dispose(id: string, familyId: string, userId: string, note?: string) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id } })

    if (!item || item.familyId !== familyId) {
      throw new NotFoundException('物品不存在')
    }

    const remainQuantity = Number(item.quantity)

    return this.prisma.$transaction(async (tx) => {
      await tx.inventoryItem.update({
        where: { id },
        data: { quantity: 0 },
      })

      return tx.stockLog.create({
        data: {
          itemId: id,
          userId,
          action: 'disposed',
          quantity: remainQuantity,
          note: note ?? '已处理',
        },
      })
    })
  }
}
