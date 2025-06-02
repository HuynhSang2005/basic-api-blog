import { z } from "zod"

// Base Tag Schema
export const TagSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(50),
  createdAt: z.date().optional(),
})

export type TagType = z.infer<typeof TagSchema>

// Create Tag Request Schema
export const CreateTagSchema = z.object({
  name: z.string().min(1, 'Tên tag không được để trống').max(50, 'Tên tag tối đa 50 ký tự'),
}).strict()

export type CreateTagType = z.infer<typeof CreateTagSchema>

// Update Tag Request Schema
export const UpdateTagSchema = z.object({
  name: z.string().min(1, 'Tên tag không được để trống').max(50, 'Tên tag tối đa 50 ký tự').optional(),
}).strict()

export type UpdateTagType = z.infer<typeof UpdateTagSchema>

// Tag Response Schema
export const TagResponseSchema = TagSchema.omit({}).extend({
  createdAt: z.string().optional(),
})

export type TagResponseType = z.infer<typeof TagResponseSchema>

// Tag List Response Schema với pagination
export const TagListSchema = z.object({
  tags: z.array(TagResponseSchema),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
})

export type TagListType = z.infer<typeof TagListSchema>

// Query Parameters cho GET tags
export const TagQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional().default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default('10'),
  search: z.string().min(1).optional(),
}).strict()

export type TagQueryType = z.infer<typeof TagQuerySchema>

// Popular Tags Response Schema
export const PopularTagsSchema = z.object({
  tags: z.array(TagResponseSchema.extend({
    postCount: z.number(),
  })),
})

export type PopularTagsType = z.infer<typeof PopularTagsSchema>