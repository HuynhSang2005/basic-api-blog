import { z } from "zod"
import { UserSchema } from "../../../shared/model/shared-user.model" 

export type UserType = z.infer<typeof UserSchema>

// Register Request Schema
export const RegisterBodySchema = UserSchema
  .pick({
    email: true,
    username: true,
    password: true,
    })
  .extend({
    confirmPassword: z.string().min(6).max(100),
  })
  .strict()
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Mật khẩu xác nhận không khớp',
        path: ['confirmPassword'],
      })
    }
  })

export type RegisterBodyType = z.infer<typeof RegisterBodySchema>

// Register Response Schema
export const RegisterResponseSchema = UserSchema.omit({
  password: true,
}).extend({
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  deletedAt: z.string().nullable().optional(),
})

export type RegisterResponseType = z.infer<typeof RegisterResponseSchema>

// Login Request Schema
export const LoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export type LoginBodyType = z.infer<typeof LoginBodySchema>

// Login Response Schema
export const LoginResponseSchema = z.object({
  user: RegisterResponseSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
})

export type LoginResponseType = z.infer<typeof LoginResponseSchema>

// Token Response Schema (chỉ chứa tokens)
export const TokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

export type TokenResponseType = z.infer<typeof TokenResponseSchema>

// Refresh Token Request Schema
export const RefreshTokenBodySchema = z.object({
  refreshToken: z.string(),
})

export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>

// Refresh Token Response Schema
export const RefreshTokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

export type RefreshTokenResponseType = z.infer<typeof RefreshTokenResponseSchema>

// Logout Request Schema
export const LogoutBodySchema = z.object({
  refreshToken: z.string(),
})

export type LogoutBodyType = z.infer<typeof LogoutBodySchema>

// Logout Response Schema
export const LogoutResponseSchema = z.object({
  message: z.string(),
})

export type LogoutResponseType = z.infer<typeof LogoutResponseSchema>

// User Public Schema
export const UserPublicSchema = UserSchema.omit({
  password: true,
})

export type UserPublicType = z.infer<typeof UserPublicSchema>