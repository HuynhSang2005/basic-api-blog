import { z } from "zod"
import { UserStatus as PrismaUserStatus } from '@prisma/client' 
export { UserStatus } from '@prisma/client'

// Base User Schema
export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  username: z.string().min(1).max(100),
  password: z.string().min(6).max(100),
  fullName: z.string().min(1).max(200).nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  status: z.nativeEnum(PrismaUserStatus).default(PrismaUserStatus.ACTIVE), 
  createdAt: z.date().optional(), 
  updatedAt: z.date().optional(),
  deletedAt: z.date().nullable().optional(),
})
