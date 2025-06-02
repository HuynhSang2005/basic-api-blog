import { createZodDto } from "nestjs-zod";
import { 
  CreatePostSchema,
  UpdatePostSchema,
  PostResponseSchema,
  PostListSchema,
  PostQuerySchema,
  PublishPostSchema,
  PostStatsSchema
} from "../model/posts.model";

export class CreatePostDto extends createZodDto(CreatePostSchema) {}
export class UpdatePostDto extends createZodDto(UpdatePostSchema) {}
export class PostResponseDto extends createZodDto(PostResponseSchema) {}
export class PostListDto extends createZodDto(PostListSchema) {}
export class PostQueryDto extends createZodDto(PostQuerySchema) {}
export class PublishPostDto extends createZodDto(PublishPostSchema) {}
export class PostStatsDto extends createZodDto(PostStatsSchema) {}