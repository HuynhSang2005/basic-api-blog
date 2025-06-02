import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../shared/services/prisma.service';
import { SlugService } from '../../../shared/services/slug.service';
import { 
  CreatePostType,
  UpdatePostType,
  PostResponseType,
  PostListType,
  PostQueryType,
  PublishPostType,
  PostStatsType,
  PostStatus
} from '../model/posts.model';

@Injectable()
export class PostsRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly slugService: SlugService
  ) {}

  // Kiểm tra slug đã tồn tại
  private async checkDuplicateSlug(title: string, excludeId?: number): Promise<string> {
    let baseSlug = this.slugService.generateSlug(title);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existingPost = await this.prismaService.post.findFirst({
        where: {
          slug,
          ...(excludeId && { id: { not: excludeId } })
        }
      });

      if (!existingPost) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  // Format post response với relations
  private formatPostResponse(post: any): PostResponseType {
    return {
      ...post,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      publishedAt: post.publishedAt?.toISOString() ?? null,
      author: {
        id: post.author.id,
        username: post.author.username,
        fullName: post.author.fullName,
        avatarUrl: post.author.avatarUrl,
      },
      category: {
        id: post.category.id,
        name: post.category.name,
        slug: post.category.slug,
        color: post.category.color,
      },
      tags: post.postTags.map((postTag: any) => ({
        id: postTag.tag.id,
        name: postTag.tag.name,
        slug: postTag.tag.slug,
      })),
    };
  }

  async createPost(data: CreatePostType, authorId: number): Promise<PostResponseType> {
    // Kiểm tra category tồn tại
    const category = await this.prismaService.category.findUnique({
      where: { id: data.categoryId }
    });

    if (!category) {
      throw new NotFoundException('Danh mục không tồn tại.');
    }

    // Kiểm tra tags tồn tại (nếu có)
    if (data.tagIds && data.tagIds.length > 0) {
      const existingTags = await this.prismaService.tag.findMany({
        where: { id: { in: data.tagIds } }
      });

      if (existingTags.length !== data.tagIds.length) {
        throw new NotFoundException('Một hoặc nhiều tag không tồn tại.');
      }
    }

    // Tạo slug unique
    const slug = await this.checkDuplicateSlug(data.title);

    // Tạo post
    const { tagIds, ...postData } = data;
    const post = await this.prismaService.post.create({
      data: {
        ...postData,
        slug,
        authorId,
        publishedAt: data.status === PostStatus.PUBLISHED ? new Date() : null,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          }
        },
        postTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            }
          }
        }
      }
    });

    // Thêm tags nếu có
    if (tagIds && tagIds.length > 0) {
      await this.prismaService.postTag.createMany({
        data: tagIds.map(tagId => ({
          postId: post.id,
          tagId
        }))
      });

      // Lấy lại post với tags
      const postWithTags = await this.prismaService.post.findUnique({
        where: { id: post.id },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true,
            }
          },
          postTags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                }
              }
            }
          }
        }
      });

      return this.formatPostResponse(postWithTags);
    }

    return this.formatPostResponse(post);
  }

  async getPosts(query: PostQueryType): Promise<PostListType> {
    const { page, limit, search, status, categoryId, authorId, tagId, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    // Build where conditions
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { excerpt: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (tagId) {
      where.postTags = {
        some: { tagId }
      };
    }

    // Build orderBy
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [posts, total] = await Promise.all([
      this.prismaService.post.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true,
            }
          },
          postTags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                }
              }
            }
          }
        }
      }),
      this.prismaService.post.count({ where }),
    ]);

    const formattedPosts = posts.map(post => this.formatPostResponse(post));

    return {
      posts: formattedPosts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPostById(id: number): Promise<PostResponseType> {
    const post = await this.prismaService.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          }
        },
        postTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            }
          }
        }
      }
    });

    if (!post) {
      throw new NotFoundException('Bài viết không tồn tại.');
    }

    return this.formatPostResponse(post);
  }

  async getPostBySlug(slug: string): Promise<PostResponseType> {
    const post = await this.prismaService.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          }
        },
        postTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            }
          }
        }
      }
    });

    if (!post) {
      throw new NotFoundException('Bài viết không tồn tại.');
    }

    // Tăng view count
    await this.prismaService.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } }
    });

    return this.formatPostResponse(post);
  }

  async updatePost(id: number, data: UpdatePostType, userId: number): Promise<PostResponseType> {
    // Kiểm tra post tồn tại và quyền sở hữu
    const existingPost = await this.prismaService.post.findUnique({
      where: { id },
      select: { id: true, authorId: true, title: true }
    });

    if (!existingPost) {
      throw new NotFoundException('Bài viết không tồn tại.');
    }

    if (existingPost.authorId !== userId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật bài viết này.');
    }

    // Kiểm tra category tồn tại (nếu có thay đổi)
    if (data.categoryId) {
      const category = await this.prismaService.category.findUnique({
        where: { id: data.categoryId }
      });

      if (!category) {
        throw new NotFoundException('Danh mục không tồn tại.');
      }
    }

    // Kiểm tra tags tồn tại (nếu có)
    if (data.tagIds && data.tagIds.length > 0) {
      const existingTags = await this.prismaService.tag.findMany({
        where: { id: { in: data.tagIds } }
      });

      if (existingTags.length !== data.tagIds.length) {
        throw new NotFoundException('Một hoặc nhiều tag không tồn tại.');
      }
    }

    // Tạo slug mới nếu title thay đổi
    let slug: string | undefined;
    if (data.title && data.title !== existingPost.title) {
      slug = await this.checkDuplicateSlug(data.title, id);
    }

    // Chuẩn bị data update
    const { tagIds, ...updateData } = data;
    const postUpdateData: any = { ...updateData };
    
    if (slug) {
      postUpdateData.slug = slug;
    }

    // Set publishedAt nếu chuyển sang PUBLISHED
    if (data.status === PostStatus.PUBLISHED) {
      postUpdateData.publishedAt = new Date();
    }

    // Update post
    const updatedPost = await this.prismaService.post.update({
      where: { id },
      data: postUpdateData,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          }
        },
        postTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            }
          }
        }
      }
    });

    // Update tags nếu có
    if (tagIds !== undefined) {
      // Xóa tags cũ
      await this.prismaService.postTag.deleteMany({
        where: { postId: id }
      });

      // Thêm tags mới
      if (tagIds.length > 0) {
        await this.prismaService.postTag.createMany({
          data: tagIds.map(tagId => ({
            postId: id,
            tagId
          }))
        });
      }

      // Lấy lại post với tags mới
      const postWithNewTags = await this.prismaService.post.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true,
            }
          },
          postTags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                }
              }
            }
          }
        }
      });

      return this.formatPostResponse(postWithNewTags);
    }

    return this.formatPostResponse(updatedPost);
  }

  async deletePost(id: number, userId: number): Promise<void> {
    // Kiểm tra post tồn tại và quyền sở hữu
    const existingPost = await this.prismaService.post.findUnique({
      where: { id },
      select: { id: true, authorId: true }
    });

    if (!existingPost) {
      throw new NotFoundException('Bài viết không tồn tại.');
    }

    if (existingPost.authorId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa bài viết này.');
    }

    // Xóa post tags trước
    await this.prismaService.postTag.deleteMany({
      where: { postId: id }
    });

    // Xóa post
    await this.prismaService.post.delete({
      where: { id }
    });
  }

  async publishPost(id: number, data: PublishPostType, userId: number): Promise<PostResponseType> {
    // Kiểm tra post tồn tại và quyền sở hữu
    const existingPost = await this.prismaService.post.findUnique({
      where: { id },
      select: { id: true, authorId: true, status: true }
    });

    if (!existingPost) {
      throw new NotFoundException('Bài viết không tồn tại.');
    }

    if (existingPost.authorId !== userId) {
      throw new ForbiddenException('Bạn không có quyền publish bài viết này.');
    }

    const publishedAt = data.publishedAt ? new Date(data.publishedAt) : new Date();

    const post = await this.prismaService.post.update({
      where: { id },
      data: {
        status: PostStatus.PUBLISHED,
        publishedAt,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          }
        },
        postTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            }
          }
        }
      }
    });

    return this.formatPostResponse(post);
  }

  async getPostStats(userId?: number): Promise<PostStatsType> {
    const where = userId ? { authorId: userId } : {};

    const [total, draft, published, archived] = await Promise.all([
      this.prismaService.post.count({ where }),
      this.prismaService.post.count({ where: { ...where, status: PostStatus.DRAFT } }),
      this.prismaService.post.count({ where: { ...where, status: PostStatus.PUBLISHED } }),
      this.prismaService.post.count({ where: { ...where, status: PostStatus.ARCHIVED } }),
    ]);

    return {
      total,
      draft,
      published,
      archived,
    };
  }

  /**
   * Admin-only update post (không check ownership)
   */
  async updatePostAsAdmin(id: number, data: UpdatePostType): Promise<PostResponseType> {
    // Kiểm tra post tồn tại
    const existingPost = await this.prismaService.post.findUnique({
      where: { id },
      select: { id: true, title: true }
    });

    if (!existingPost) {
      throw new NotFoundException('Bài viết không tồn tại.');
    }

    // Kiểm tra category tồn tại (nếu có thay đổi)
    if (data.categoryId) {
      const category = await this.prismaService.category.findUnique({
        where: { id: data.categoryId }
      });

      if (!category) {
        throw new NotFoundException('Danh mục không tồn tại.');
      }
    }

    // Kiểm tra tags tồn tại (nếu có)
    if (data.tagIds && data.tagIds.length > 0) {
      const existingTags = await this.prismaService.tag.findMany({
        where: { id: { in: data.tagIds } }
      });

      if (existingTags.length !== data.tagIds.length) {
        throw new NotFoundException('Một hoặc nhiều tag không tồn tại.');
      }
    }

    // Tạo slug mới nếu title thay đổi
    let slug: string | undefined;
    if (data.title && data.title !== existingPost.title) {
      slug = await this.checkDuplicateSlug(data.title, id);
    }

    // Chuẩn bị data update
    const { tagIds, ...updateData } = data;
    const postUpdateData: any = { ...updateData };
    
    if (slug) {
      postUpdateData.slug = slug;
    }

    // Set publishedAt nếu chuyển sang PUBLISHED
    if (data.status === PostStatus.PUBLISHED) {
      postUpdateData.publishedAt = new Date();
    }

    // Update post (ADMIN - không check authorId)
    const updatedPost = await this.prismaService.post.update({
      where: { id },
      data: postUpdateData,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          }
        },
        postTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            }
          }
        }
      }
    });

    // Update tags nếu có
    if (tagIds !== undefined) {
      // Xóa tags cũ
      await this.prismaService.postTag.deleteMany({
        where: { postId: id }
      });

      // Thêm tags mới
      if (tagIds.length > 0) {
        await this.prismaService.postTag.createMany({
          data: tagIds.map(tagId => ({
            postId: id,
            tagId
          }))
        });
      }

      // Lấy lại post với tags mới
      const postWithNewTags = await this.prismaService.post.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true,
            }
          },
          postTags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                }
              }
            }
          }
        }
      });

      return this.formatPostResponse(postWithNewTags);
    }

    return this.formatPostResponse(updatedPost);
  }

  /**
   * Admin-only delete post (không check ownership)
   */
  async deletePostAsAdmin(id: number): Promise<void> {
    // Kiểm tra post tồn tại
    const existingPost = await this.prismaService.post.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!existingPost) {
      throw new NotFoundException('Bài viết không tồn tại.');
    }

    // Xóa post tags trước
    await this.prismaService.postTag.deleteMany({
      where: { postId: id }
    });

    // Xóa post (ADMIN - không check authorId)
    await this.prismaService.post.delete({
      where: { id }
    });
  }

  /**
   * Admin-only publish post (không check ownership)
   */
  async publishPostAsAdmin(id: number, data: PublishPostType): Promise<PostResponseType> {
    // Kiểm tra post tồn tại
    const existingPost = await this.prismaService.post.findUnique({
      where: { id },
      select: { id: true, status: true }
    });

    if (!existingPost) {
      throw new NotFoundException('Bài viết không tồn tại.');
    }

    const publishedAt = data.publishedAt ? new Date(data.publishedAt) : new Date();

    const post = await this.prismaService.post.update({
      where: { id },
      data: {
        status: PostStatus.PUBLISHED,
        publishedAt,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          }
        },
        postTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            }
          }
        }
      }
    });

    return this.formatPostResponse(post);
  }

  /**
   * Admin-only: Change post status
   */
  async changePostStatusAsAdmin(id: number, status: PostStatus): Promise<PostResponseType> {
    // Kiểm tra post tồn tại
    const existingPost = await this.prismaService.post.findUnique({
      where: { id },
      select: { id: true, status: true }
    });

    if (!existingPost) {
      throw new NotFoundException('Bài viết không tồn tại.');
    }

    const updateData: any = { status };

    // Set publishedAt nếu chuyển sang PUBLISHED
    if (status === PostStatus.PUBLISHED && existingPost.status !== PostStatus.PUBLISHED) {
      updateData.publishedAt = new Date();
    }

    // Clear publishedAt nếu chuyển về DRAFT hoặc ARCHIVED
    if (status !== PostStatus.PUBLISHED) {
      updateData.publishedAt = null;
    }

    const post = await this.prismaService.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          }
        },
        postTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            }
          }
        }
      }
    });

    return this.formatPostResponse(post);
  }

  /**
   * Admin-only: Lấy tất cả posts (bao gồm drafts của authors)
   */
  async getAllPostsForAdmin(query: PostQueryType): Promise<PostListType> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      categoryId,
      authorId,
      tagId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    const skip = (page - 1) * limit;

    // Điều kiện where cho admin (có thể xem tất cả posts)
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (tagId) {
      where.postTags = {
        some: {
          tagId: tagId
        }
      };
    }

    // Count total posts
    const total = await this.prismaService.post.count({ where });

    // Get posts với pagination
    const posts = await this.prismaService.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          }
        },
        postTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            }
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip,
      take: limit,
    });

    const formattedPosts = posts.map(post => this.formatPostResponse(post));

    return {
      posts: formattedPosts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

}