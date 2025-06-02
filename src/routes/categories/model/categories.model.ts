import { z } from "zod"

// Base Category Schema
export const CategorySchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().nullable().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Mã màu phải có định dạng hex (vd: #FF5733)').nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export type CategoryType = z.infer<typeof CategorySchema>

// Create Category Request Schema
export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục không được để trống').max(100, 'Tên danh mục tối đa 100 ký tự'),
  description: z.string().min(1).max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Mã màu phải có định dạng hex (vd: #FF5733)').optional(),
}).strict()

export type CreateCategoryType = z.infer<typeof CreateCategorySchema>

// Update Category Request Schema
export const UpdateCategorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục không được để trống').max(100, 'Tên danh mục tối đa 100 ký tự').optional(),
  description: z.string().min(1).max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Mã màu phải có định dạng hex (vd: #FF5733)').optional(),
}).strict()

export type UpdateCategoryType = z.infer<typeof UpdateCategorySchema>

// Category Response Schema
export const CategoryResponseSchema = CategorySchema.omit({}).extend({
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type CategoryResponseType = z.infer<typeof CategoryResponseSchema>

// Category List Response Schema với pagination
export const CategoryListSchema = z.object({
  categories: z.array(CategoryResponseSchema),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
})

export type CategoryListType = z.infer<typeof CategoryListSchema>

// Query Parameters cho GET categories
export const CategoryQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional().default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default('10'),
  search: z.string().min(1).optional(),
}).strict()

export type CategoryQueryType = z.infer<typeof CategoryQuerySchema>