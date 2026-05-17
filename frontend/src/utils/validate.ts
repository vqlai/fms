import { z } from 'zod'

export const emailSchema = z.string().email('请输入有效的邮箱地址')

export const passwordSchema = z
  .string()
  .min(8, '密码至少 8 位')
  .regex(/(?=.*[a-zA-Z])(?=.*\d)/, '密码必须包含字母和数字')

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, '请输入密码'),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, '姓名至少 2 个字符').max(50, '姓名不能超过 50 个字符'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次密码不一致',
    path: ['confirmPassword'],
  })

export const expenseSchema = z.object({
  type: z.enum(['income', 'expense'], { required_error: '请选择类型' }),
  amount: z.number({ required_error: '请输入金额' }).min(0.01, '金额至少 0.01').max(99999999.99, '金额不能超过 99999999.99'),
  categoryId: z.string({ required_error: '请选择分类' }).uuid('请选择有效的分类'),
  transactionDate: z.string().optional(),
  note: z.string().max(200, '备注不能超过 200 个字符').optional(),
})

export const scheduleSchema = z.object({
  title: z.string().min(1, '请输入标题').max(100, '标题不能超过 100 个字符'),
  date: z.string({ required_error: '请选择日期' }),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  allDay: z.boolean().optional(),
  repeatRule: z.enum(['none', 'daily', 'weekly', 'monthly', 'yearly']).optional(),
  note: z.string().max(500, '备注不能超过 500 个字符').optional(),
})
