import { Injectable } from '@nestjs/common';
import { PostsRepository } from './repository/posts.repo';
import { 
  CreatePostType,
  UpdatePostType,
  PostResponseType,
  PostListType,
  PostQueryType,
  PublishPostType,
  PostStatsType
} from './model/posts.model';
import { UserRole, PostStatus } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
  ) {}

  async createPost(data: CreatePostType, authorId: number): Promise<PostResponseType> {
    return await this.postsRepository.createPost(data, authorId);
  }

  async getPosts(query: PostQueryType): Promise<PostListType> {
    return await this.postsRepository.getPosts(query);
  }

  async getPostById(id: number): Promise<PostResponseType> {
    return await this.postsRepository.getPostById(id);
  }

  async getPostBySlug(slug: string): Promise<PostResponseType> {
    return await this.postsRepository.getPostBySlug(slug);
  }

  async updatePost(id: number, data: UpdatePostType, userId: number, userRole?: UserRole): Promise<PostResponseType> {
    if (userRole === UserRole.ADMIN) {
      return await this.postsRepository.updatePostAsAdmin(id, data);
    }
    
    return await this.postsRepository.updatePost(id, data, userId);
  }

  async deletePost(id: number, userId: number, userRole?: UserRole): Promise<void> {
    if (userRole === UserRole.ADMIN) {
      await this.postsRepository.deletePostAsAdmin(id);
      return;
    }
    
    await this.postsRepository.deletePost(id, userId);
  }

  async publishPost(id: number, data: PublishPostType, userId: number, userRole?: UserRole): Promise<PostResponseType> {
    if (userRole === UserRole.ADMIN) {
      return await this.postsRepository.publishPostAsAdmin(id, data);
    }
    
    return await this.postsRepository.publishPost(id, data, userId);
  }

  async getSearchSuggestions(searchTerm: string): Promise<{ title: string; slug: string }[]> {
  return await this.postsRepository.getSearchSuggestions(searchTerm);
}

async getPopularPosts(limit?: number): Promise<PostResponseType[]> {
  return await this.postsRepository.getPopularPosts(limit);
}

async getRecentPosts(limit?: number): Promise<PostResponseType[]> {
  return await this.postsRepository.getRecentPosts(limit);
}

  async forcePublishPost(id: number, data: PublishPostType): Promise<PostResponseType> {
    return await this.postsRepository.publishPostAsAdmin(id, data);
  }

  async changePostStatus(id: number, status: PostStatus): Promise<PostResponseType> {
    return await this.postsRepository.changePostStatusAsAdmin(id, status);
  }

  /**
   * Admin-only: Force delete bất kỳ post nào
   */
  async forceDeletePost(id: number): Promise<void> {
    await this.postsRepository.deletePostAsAdmin(id);
  }

  /**
   * Admin-only: Lấy tất cả posts (bao gồm drafts của authors)
   */
  async getAllPostsForAdmin(query: PostQueryType): Promise<PostListType> {
    return await this.postsRepository.getAllPostsForAdmin(query);
  }

  async getPostStats(userId?: number): Promise<PostStatsType> {
    return await this.postsRepository.getPostStats(userId);
  }

  async getMyPosts(query: PostQueryType, userId: number): Promise<PostListType> {
    const queryWithAuthor = { ...query, authorId: userId };
    return await this.postsRepository.getPosts(queryWithAuthor);
  }
}