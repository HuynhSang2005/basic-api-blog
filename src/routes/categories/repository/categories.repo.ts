import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../shared/services/prisma.service';
import { SlugService } from '../../../shared/services/slug.service'; // Import SlugService
import { 
  CreateCategoryType,
  UpdateCategoryType,
  CategoryResponseType,
  CategoryListType,
  CategoryQueryType
} from '../model/categories.model';

@Injectable()
export class CategoriesRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly slugService: SlugService 
  ) {}

  // Kiểm tra name hoặc slug đã tồn tại
  private async checkDuplicateNameOrSlug(name: string, excludeId?: number): Promise<void> {
    const slug = this.slugService.generateSlug(name); 
    const existingCategory = await this.prismaService.category.findFirst({
      where: {
        OR: [
          { name: { equals: name } }, 
          { slug }
        ],
        ...(excludeId && { id: { not: excludeId } })
      }
    });

    if (existingCategory) {
      if (existingCategory.name.toLowerCase() === name.toLowerCase()) {
        throw new ConflictException(`Danh mục với tên '${name}' đã tồn tại.`);
      }
      if (existingCategory.slug === slug) {
        throw new ConflictException(`Slug '${slug}' đã tồn tại.`);
      }
    }
  }

  async createCategory(data: CreateCategoryType): Promise<CategoryResponseType> {
    await this.checkDuplicateNameOrSlug(data.name);

    const slug = this.slugService.generateSlug(data.name); 
    const category = await this.prismaService.category.create({
      data: {
        ...data,
        slug,
      },
    });

    return {
      ...category,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }

  async getCategories(query: CategoryQueryType): Promise<CategoryListType> {
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;

    const where = search ? {
      OR: [
        { name: { contains: search } }, 
        { description: { contains: search } },
      ]
    } : {};

    const [categories, total] = await Promise.all([
      this.prismaService.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.category.count({ where }),
    ]);

    const formattedCategories = categories.map(category => ({
      ...category,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    }));

    return {
      categories: formattedCategories,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCategoryById(id: number): Promise<CategoryResponseType> {
    const category = await this.prismaService.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Danh mục không tồn tại.');
    }

    return {
      ...category,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }

  async getCategoryBySlug(slug: string): Promise<CategoryResponseType> {
    const category = await this.prismaService.category.findUnique({
      where: { slug },
    });

    if (!category) {
      throw new NotFoundException('Danh mục không tồn tại.');
    }

    return {
      ...category,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }

  async updateCategory(id: number, data: UpdateCategoryType): Promise<CategoryResponseType> {
    // Kiểm tra category tồn tại
    await this.getCategoryById(id);

    // Kiểm tra trùng lặp nếu có thay đổi name
    if (data.name) {
      await this.checkDuplicateNameOrSlug(data.name, id);
    }

    // Định nghĩa đúng type cho updateData
    const updateData: UpdateCategoryType & { slug?: string } = { ...data };
    if (data.name) {
      updateData.slug = this.slugService.generateSlug(data.name); 
    }

    const category = await this.prismaService.category.update({
      where: { id },
      data: updateData,
    });

    return {
      ...category,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }

  async deleteCategory(id: number): Promise<void> {
    // Kiểm tra category tồn tại
    await this.getCategoryById(id);

    // Kiểm tra xem có bài viết nào đang sử dụng category này không
    const postsCount = await this.prismaService.post.count({
      where: { categoryId: id },
    });

    if (postsCount > 0) {
      throw new ConflictException(
        `Không thể xóa danh mục này vì có ${postsCount} bài viết đang sử dụng.`
      );
    }

    await this.prismaService.category.delete({
      where: { id },
    });
  }
}