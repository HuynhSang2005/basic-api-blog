import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../shared/services/prisma.service';
import { SlugService } from '../../../shared/services/slug.service';
import { 
  CreateTagType,
  UpdateTagType,
  TagResponseType,
  TagListType,
  TagQueryType,
  PopularTagsType
} from '../model/tags.model';

@Injectable()
export class TagsRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly slugService: SlugService
  ) {}

  // Kiểm tra name hoặc slug đã tồn tại
  private async checkDuplicateNameOrSlug(name: string, excludeId?: number): Promise<void> {
    const slug = this.slugService.generateSlug(name);
    
    const existingTag = await this.prismaService.tag.findFirst({
      where: {
        OR: [
          { name: { equals: name } },
          { slug }
        ],
        ...(excludeId && { id: { not: excludeId } })
      }
    });

    if (existingTag) {
      if (existingTag.name.toLowerCase() === name.toLowerCase()) {
        throw new ConflictException(`Tag với tên '${name}' đã tồn tại.`);
      }
      if (existingTag.slug === slug) {
        throw new ConflictException(`Slug '${slug}' đã tồn tại.`);
      }
    }
  }

  async createTag(data: CreateTagType): Promise<TagResponseType> {
    await this.checkDuplicateNameOrSlug(data.name);

    const slug = this.slugService.generateSlug(data.name);

    const tag = await this.prismaService.tag.create({
      data: {
        ...data,
        slug,
      },
    });

    return {
      ...tag,
      createdAt: tag.createdAt.toISOString(),
    };
  }

  async getTags(query: TagQueryType): Promise<TagListType> {
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;

    const where = search ? {
      name: { contains: search }
    } : {};

    const [tags, total] = await Promise.all([
      this.prismaService.tag.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.tag.count({ where }),
    ]);

    const formattedTags = tags.map(tag => ({
      ...tag,
      createdAt: tag.createdAt.toISOString(),
    }));

    return {
      tags: formattedTags,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTagById(id: number): Promise<TagResponseType> {
    const tag = await this.prismaService.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException('Tag không tồn tại.');
    }

    return {
      ...tag,
      createdAt: tag.createdAt.toISOString(),
    };
  }

  async getTagBySlug(slug: string): Promise<TagResponseType> {
    const tag = await this.prismaService.tag.findUnique({
      where: { slug },
    });

    if (!tag) {
      throw new NotFoundException('Tag không tồn tại.');
    }

    return {
      ...tag,
      createdAt: tag.createdAt.toISOString(),
    };
  }

  async updateTag(id: number, data: UpdateTagType): Promise<TagResponseType> {
    // Kiểm tra tag tồn tại
    await this.getTagById(id);

    // Kiểm tra trùng lặp nếu có thay đổi name
    if (data.name) {
      await this.checkDuplicateNameOrSlug(data.name, id);
    }

    const updateData: UpdateTagType & { slug?: string } = { ...data };
    if (data.name) {
      updateData.slug = this.slugService.generateSlug(data.name);
    }

    const tag = await this.prismaService.tag.update({
      where: { id },
      data: updateData,
    });

    return {
      ...tag,
      createdAt: tag.createdAt.toISOString(),
    };
  }

  async deleteTag(id: number): Promise<void> {
    // Kiểm tra tag tồn tại
    await this.getTagById(id);

    // Kiểm tra xem có bài viết nào đang sử dụng tag này không
    const postsCount = await this.prismaService.postTag.count({
      where: { tagId: id },
    });

    if (postsCount > 0) {
      throw new ConflictException(
        `Không thể xóa tag này vì có ${postsCount} bài viết đang sử dụng.`
      );
    }

    await this.prismaService.tag.delete({
      where: { id },
    });
  }

  async getPopularTags(limit: number = 10): Promise<PopularTagsType> {
    const tags = await this.prismaService.tag.findMany({
      include: {
        _count: {
          select: { postTags: true }
        }
      },
      orderBy: {
        postTags: {
          _count: 'desc'
        }
      },
      take: limit,
    });

    const formattedTags = tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      createdAt: tag.createdAt.toISOString(),
      postCount: tag._count.postTags,
    }));

    return {
      tags: formattedTags,
    };
  }

  async getAllTagsForDropdown(): Promise<TagResponseType[]> {
    const tags = await this.prismaService.tag.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
      },
    });

    return tags.map(tag => ({
      ...tag,
      createdAt: tag.createdAt.toISOString(),
    }));
  }
}