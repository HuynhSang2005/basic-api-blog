import { 
  Body, 
  Controller, 
  Delete,
  Get, 
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ZodSerializerDto } from 'nestjs-zod';
import { 
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryResponseDto,
  CategoryListDto,
  CategoryQueryDto
} from './dto/categories.dto';
import { Auth } from '../../common/decorators/validators/auth-guard/auth.decorators';
import { AuthType } from '../../shared/constants/auth.constant';
import { AdminOnlyAccess } from '../../common/decorators/validators/auth-guard/combined.decorators';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @AdminOnlyAccess() // ← CHỈ ADMIN MỚI TẠO ĐƯỢC CATEGORY
  @ZodSerializerDto(CategoryResponseDto)
  async createCategory(@Body() createData: CreateCategoryDto) {
    return await this.categoriesService.createCategory(createData);
  }

  @Get()
  @Auth([AuthType.None]) // Public route - để user filter posts
  @ZodSerializerDto(CategoryListDto)
  async getCategories(@Query() query: CategoryQueryDto) {
    return await this.categoriesService.getCategories(query);
  }

  @Get(':id')
  @Auth([AuthType.None]) // Public route
  @ZodSerializerDto(CategoryResponseDto)
  async getCategoryById(@Param('id', ParseIntPipe) id: number) {
    return await this.categoriesService.getCategoryById(id);
  }

  @Get('slug/:slug')
  @Auth([AuthType.None]) // Public route
  @ZodSerializerDto(CategoryResponseDto)
  async getCategoryBySlug(@Param('slug') slug: string) {
    return await this.categoriesService.getCategoryBySlug(slug);
  }

  @Put(':id')
  @AdminOnlyAccess() // ← CHỈ ADMIN MỚI CẬP NHẬT ĐƯỢC CATEGORY
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(CategoryResponseDto)
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdateCategoryDto
  ) {
    return await this.categoriesService.updateCategory(id, updateData);
  }

  @Delete(':id')
  @AdminOnlyAccess() // ← CHỈ ADMIN MỚI XÓA ĐƯỢC CATEGORY
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    await this.categoriesService.deleteCategory(id);
  }
}