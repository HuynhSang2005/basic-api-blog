import { Controller, Get, Post, Body, Put, Param, Delete, Query, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { ZodSerializerDto } from 'nestjs-zod';
import { CreateCategoryDto, UpdateCategoryDto, CategoryResponseDto, CategoryListDto, CategoryQueryDto } from './dto/categories.dto';
import { Auth } from '../../common/decorators/validators/auth-guard/auth.decorators';
import { AuthType } from '../../shared/constants/auth.constant';
import { AdminOnlyAccess } from '../../common/decorators/validators/auth-guard/combined.decorators';
import { ApiOperationDecorator } from '../../common/decorators/api-operation.decorator';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @AdminOnlyAccess()
  @ZodSerializerDto(CategoryResponseDto)
  @ApiOperationDecorator({
    type: CategoryResponseDto,
    summary: 'Create category',
    description: 'Create a new blog category (Admin only)',
    operationId: 'createCategory',
    requireAuth: true,
  })
  async createCategory(@Body() createData: CreateCategoryDto) {
    return await this.categoriesService.createCategory(createData as any);
  }

  @Get()
  @Auth([AuthType.None])
  @ZodSerializerDto(CategoryListDto)
  @ApiOperationDecorator({
    type: CategoryListDto,
    summary: 'Get all categories',
    description: 'Get paginated list of all categories with post counts',
    operationId: 'getCategories',
    requireAuth: false,
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in category name' })
  async getCategories(@Query() query: CategoryQueryDto) {
    return await this.categoriesService.getCategories(query as any);
  }

  @Get(':id')
  @Auth([AuthType.None])
  @ZodSerializerDto(CategoryResponseDto)
  @ApiOperationDecorator({
    type: CategoryResponseDto,
    summary: 'Get category by ID',
    description: 'Get a single category by its ID',
    operationId: 'getCategoryById',
    requireAuth: false,
  })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async getCategoryById(@Param('id', ParseIntPipe) id: number) {
    return await this.categoriesService.getCategoryById(id);
  }

  @Get('slug/:slug')
  @Auth([AuthType.None])
  @ZodSerializerDto(CategoryResponseDto)
  @ApiOperationDecorator({
    type: CategoryResponseDto,
    summary: 'Get category by slug',
    description: 'Get a single category by its slug',
    operationId: 'getCategoryBySlug',
    requireAuth: false,
  })
  @ApiParam({ name: 'slug', description: 'Category slug' })
  async getCategoryBySlug(@Param('slug') slug: string) {
    return await this.categoriesService.getCategoryBySlug(slug);
  }

  @Put(':id')
  @AdminOnlyAccess()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(CategoryResponseDto)
  @ApiOperationDecorator({
    type: CategoryResponseDto,
    summary: 'Update category',
    description: 'Update an existing category (Admin only)',
    operationId: 'updateCategory',
    requireAuth: true,
  })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdateCategoryDto
  ) {
    return await this.categoriesService.updateCategory(id, updateData as any);
  }

  @Delete(':id')
  @AdminOnlyAccess()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperationDecorator({
    summary: 'Delete category',
    description: 'Delete a category (Admin only). Cannot delete if category has posts.',
    operationId: 'deleteCategory',
    requireAuth: true,
  })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    await this.categoriesService.deleteCategory(id);
  }
}