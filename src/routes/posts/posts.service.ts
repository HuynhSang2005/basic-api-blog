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

  async updatePost(id: number, data: UpdatePostType, userId: number): Promise<PostResponseType> {
    return await this.postsRepository.updatePost(id, data, userId);
  }

  async deletePost(id: number, userId: number): Promise<void> {
    await this.postsRepository.deletePost(id, userId);
  }

  async publishPost(id: number, data: PublishPostType, userId: number): Promise<PostResponseType> {
    return await this.postsRepository.publishPost(id, data, userId);
  }

  async getPostStats(userId?: number): Promise<PostStatsType> {
    return await this.postsRepository.getPostStats(userId);
  }

  async getMyPosts(query: PostQueryType, userId: number): Promise<PostListType> {
    // Fix: Convert userId to number instead of string
    const queryWithAuthor = { ...query, authorId: userId };
    return await this.postsRepository.getPosts(queryWithAuthor);
  }
}