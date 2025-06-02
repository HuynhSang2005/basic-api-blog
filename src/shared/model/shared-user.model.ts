import { z } from "zod"
import { UserStatus, UserRole } from '@prisma/client'

export const UserSchema = z.object({
  id: z.number(),
  username: z.string().min(1).max(50),
  password: z.string().min(6).max(100),
  email: z.string().email(),
  fullName: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  role: z.nativeEnum(UserRole).default(UserRole.USER),
  status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE), 
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().nullable().optional(),
})

export type UserType = z.infer<typeof UserSchema>