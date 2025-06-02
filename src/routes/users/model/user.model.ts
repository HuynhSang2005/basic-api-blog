import { UserSchema } from "src/shared/model/shared-user.model"
import { z } from "zod"



export type UserType = z.infer<typeof UserSchema>

// User Profile Response Schema (không có password)
export const UserProfileSchema = UserSchema.omit({
  password: true,
}).extend({
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  deletedAt: z.string().nullable().optional(),
  lastLoginAt: z.string().nullable().optional(),
})

export type UserProfileType = z.infer<typeof UserProfileSchema>

// Update Profile Request Schema
export const UpdateProfileSchema = z.object({
  username: z.string().min(1).max(100).optional(),
  fullName: z.string().min(1).max(200).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
}).strict()

export type UpdateProfileType = z.infer<typeof UpdateProfileSchema>

// Change Password Request Schema
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6).max(100),
  confirmPassword: z.string().min(6).max(100),
}).strict().superRefine(({ newPassword, confirmPassword }, ctx) => {
  if (newPassword !== confirmPassword) {
    ctx.addIssue({
      code: 'custom',
      message: 'Mật khẩu mới và xác nhận không khớp',
      path: ['confirmPassword'],
    })
  }
})

export type ChangePasswordType = z.infer<typeof ChangePasswordSchema>

// Change Password Response Schema
export const ChangePasswordResponseSchema = z.object({
  message: z.string(),
})

export type ChangePasswordResponseType = z.infer<typeof ChangePasswordResponseSchema>