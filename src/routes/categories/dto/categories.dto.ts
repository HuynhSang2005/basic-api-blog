import { createZodDto } from "nestjs-zod";
import { CategoryListSchema, CategoryQuerySchema, CategoryResponseSchema, CreateCategorySchema, UpdateCategorySchema } from "../model/categories.model";


export class CreateCategoryDto extends createZodDto(CreateCategorySchema) {}
export class UpdateCategoryDto extends createZodDto(UpdateCategorySchema) {}
export class CategoryResponseDto extends createZodDto(CategoryResponseSchema) {}
export class CategoryListDto extends createZodDto(CategoryListSchema) {}
export class CategoryQueryDto extends createZodDto(CategoryQuerySchema) {}