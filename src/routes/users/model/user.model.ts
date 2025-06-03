import { z } from 'zod';
import { UserSchema } from '../../../shared/model/shared-user.model';
import { UserStatus } from '@prisma/client';

// User Profile Schema 
export const UserProfileSchema = UserSchema.omit({
  password: true,
}).extend({
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  deletedAt: z.string().nullable().optional(),
  lastLoginAt: z.string().nullable().optional(),
});

export type UserProfileType = z.infer<typeof UserProfileSchema>;

// Update Profile Schema (only allowed fields)
export const UpdateProfileSchema = z.object({
  username: z.string().min(1).max(50).optional(),
  fullName: z.string().min(1).max(100).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
}).strict();

export type UpdateProfileType = z.infer<typeof UpdateProfileSchema>;

// Change Password Schema
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6).max(100),
  confirmPassword: z.string().min(6).max(100),
}).strict().superRefine(({ newPassword, confirmPassword }, ctx) => {
  if (newPassword !== confirmPassword) {
    ctx.addIssue({
      code: 'custom',
      message: 'Mật khẩu xác nhận không khớp',
      path: ['confirmPassword'],
    });
  }
});

export type ChangePasswordType = z.infer<typeof ChangePasswordSchema>;

// ← THÊM ADMIN SCHEMAS
export const UserListSchema = z.object({
  users: z.array(UserProfileSchema),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export type UserListType = z.infer<typeof UserListSchema>;

export const UpdateUserStatusSchema = z.object({
  status: z.nativeEnum(UserStatus),
});

export type UpdateUserStatusType = z.infer<typeof UpdateUserStatusSchema>;

// ← THÊM RESPONSE SCHEMAS
export const ChangePasswordResponseSchema = z.object({
  message: z.string(),
});

export type ChangePasswordResponseType = z.infer<typeof ChangePasswordResponseSchema>;