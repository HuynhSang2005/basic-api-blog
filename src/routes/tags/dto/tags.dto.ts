import { createZodDto } from "nestjs-zod";
import { 
  CreateTagSchema,
  UpdateTagSchema,
  TagResponseSchema,
  TagListSchema,
  TagQuerySchema,
  PopularTagsSchema
} from "../model/tags.model";

export class CreateTagDto extends createZodDto(CreateTagSchema) {}
export class UpdateTagDto extends createZodDto(UpdateTagSchema) {}
export class TagResponseDto extends createZodDto(TagResponseSchema) {}
export class TagListDto extends createZodDto(TagListSchema) {}
export class TagQueryDto extends createZodDto(TagQuerySchema) {}
export class PopularTagsDto extends createZodDto(PopularTagsSchema) {}