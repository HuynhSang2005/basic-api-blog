import { z } from "zod"
import { PostStatus as PrismaPostStatus } from '@prisma/client'
export { PostStatus } from '@prisma/client'

// Base Post Schema
export const PostSchema = z.object({
  id: z.number(),
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  content: z.string(),
  excerpt: z.string().nullable().optional(),
  featuredImage: z.string().url().nullable().optional(),
  status: z.nativeEnum(PrismaPostStatus).default(PrismaPostStatus.DRAFT),
  viewCount: z.number().default(0),
  authorId: z.number(),
  categoryId: z.number(),
  publishedAt: z.date().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export type PostType = z.infer<typeof PostSchema>

// Create Post Request Schema
export const CreatePostSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống').max(255, 'Tiêu đề tối đa 255 ký tự'),
  content: z.string().min(1, 'Nội dung không được để trống'),
  excerpt: z.string().max(500, 'Tóm tắt tối đa 500 ký tự').optional(),
  featuredImage: z.string().url('URL ảnh không hợp lệ').optional(),
  status: z.nativeEnum(PrismaPostStatus).default(PrismaPostStatus.DRAFT),
  categoryId: z.number().min(1, 'Danh mục là bắt buộc'),
  tagIds: z.array(z.number().min(1)).optional().default([]),
}).strict()

export type CreatePostType = z.infer<typeof CreatePostSchema>

// Update Post Request Schema
export const UpdatePostSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống').max(255, 'Tiêu đề tối đa 255 ký tự').optional(),
  content: z.string().min(1, 'Nội dung không được để trống').optional(),
  excerpt: z.string().max(500, 'Tóm tắt tối đa 500 ký tự').optional(),
  featuredImage: z.string().url('URL ảnh không hợp lệ').optional(),
  status: z.nativeEnum(PrismaPostStatus).optional(),
  categoryId: z.number().min(1, 'Danh mục là bắt buộc').optional(),
  tagIds: z.array(z.number().min(1)).optional(),
}).strict()

export type UpdatePostType = z.infer<typeof UpdatePostSchema>

// Post Response Schema với quan hệ
export const PostResponseSchema = PostSchema.omit({}).extend({
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  publishedAt: z.string().nullable().optional(),
  author: z.object({
    id: z.number(),
    username: z.string(),
    fullName: z.string().nullable(),
    avatarUrl: z.string().nullable(),
  }),
  category: z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    color: z.string().nullable(),
  }),
  tags: z.array(z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
  })),
})

export type PostResponseType = z.infer<typeof PostResponseSchema>

// Post List Response Schema với pagination
export const PostListSchema = z.object({
  posts: z.array(PostResponseSchema),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
})

export type PostListType = z.infer<typeof PostListSchema>

// Query Parameters cho GET posts
export const PostQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional().default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(50)).optional().default('10'),
  search: z.string().min(1).optional(),
  status: z.nativeEnum(PrismaPostStatus).optional(),
  categoryId: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  authorId: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  tagId: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'publishedAt', 'viewCount', 'title']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
}).strict()

export type PostQueryType = z.infer<typeof PostQuerySchema>

// Publish Post Schema
export const PublishPostSchema = z.object({
  publishedAt: z.string().datetime().optional(),
}).strict()

export type PublishPostType = z.infer<typeof PublishPostSchema>

// Post Stats Schema
export const PostStatsSchema = z.object({
  total: z.number(),
  draft: z.number(),
  published: z.number(),
  archived: z.number(),
})

export type PostStatsType = z.infer<typeof PostStatsSchema>