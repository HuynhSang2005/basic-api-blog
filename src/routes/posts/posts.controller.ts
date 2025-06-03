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
import { ApiTags, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { ZodSerializerDto } from 'nestjs-zod';
import { 
  CreatePostDto,
  UpdatePostDto,
  PostResponseDto,
  PostListDto,
  PostQueryDto,
  PublishPostDto,
  PostStatsDto
} from './dto/posts.dto';
import { Auth } from '../../common/decorators/validators/auth-guard/auth.decorators';
import { AuthType } from '../../shared/constants/auth.constant';
import { ActiveUser } from '../../common/decorators/validators/auth-guard/active-user.decorators';
import { TokenPayload } from '../../shared/types/jwt.type';
import { 
  AuthorOrAdmin, 
  AuthorWithOwnership, 
  AdminOnlyAccess 
} from '../../common/decorators/validators/auth-guard/combined.decorators';
import { ApiOperationDecorator } from '../../common/decorators/api-operation.decorator';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @AuthorOrAdmin()
  @ZodSerializerDto(PostResponseDto)
  @ApiOperationDecorator({
    type: PostResponseDto,
    summary: 'Create new post',
    description: 'Create a new blog post (Author/Admin only)',
    operationId: 'createPost',
    requireAuth: true,
  })
  async createPost(
    @Body() createData: CreatePostDto,
    @ActiveUser() user: TokenPayload
  ) {
    return await this.postsService.createPost(createData as any, user.userId);
  }

  @Get()
  @Auth([AuthType.None])
  @ZodSerializerDto(PostListDto)
  @ApiOperationDecorator({
    type: PostListDto,
    summary: 'Get all published posts',
    description: 'Get paginated list of published posts with search and filter capabilities',
    operationId: 'getPosts',
    requireAuth: false,
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in title and content' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by category ID' })
  @ApiQuery({ name: 'authorId', required: false, description: 'Filter by author ID' })
  @ApiQuery({ name: 'tagId', required: false, description: 'Filter by tag ID' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt', 'updatedAt', 'publishedAt', 'viewCount', 'title'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async getPosts(@Query() query: PostQueryDto) {
    return await this.postsService.getPosts(query as any);
  }

  @Get('stats')
  @AuthorOrAdmin()
  @ZodSerializerDto(PostStatsDto)
  @ApiOperationDecorator({
    type: PostStatsDto,
    summary: 'Get post statistics',
    description: 'Get post count statistics by status (Author/Admin only)',
    operationId: 'getPostStats',
    requireAuth: true,
  })
  async getPostStats(@ActiveUser() user: TokenPayload) {
    const userId = user.role === 'ADMIN' ? undefined : user.userId;
    return await this.postsService.getPostStats(userId);
  }

  @Get('search/suggestions')
  @Auth([AuthType.None])
  @ApiOperationDecorator({
    summary: 'Get search suggestions',
    description: 'Get post title suggestions for autocomplete',
    operationId: 'getSearchSuggestions',
    requireAuth: false,
    isArray: true,
  })
  @ApiQuery({ name: 'q', required: true, description: 'Search query (minimum 2 characters)' })
  async getSearchSuggestions(@Query('q') searchTerm?: string) {
    if (!searchTerm) {
      return [];
    }
    return await this.postsService.getSearchSuggestions(searchTerm);
  }

  @Get('popular')
  @Auth([AuthType.None])
  @ApiOperationDecorator({
    type: PostResponseDto,
    summary: 'Get popular posts',
    description: 'Get popular posts based on view count',
    operationId: 'getPopularPosts',
    requireAuth: false,
    isArray: true,
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of posts to return (max: 20)' })
  async getPopularPosts(@Query('limit') limit?: string) {
    const limitNumber = limit ? Math.min(parseInt(limit, 10), 20) : 5;
    return await this.postsService.getPopularPosts(limitNumber);
  }

  @Get('recent')
  @Auth([AuthType.None])
  @ApiOperationDecorator({
    type: PostResponseDto,
    summary: 'Get recent posts',
    description: 'Get most recently published posts',
    operationId: 'getRecentPosts',
    requireAuth: false,
    isArray: true,
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of posts to return (max: 20)' })
  async getRecentPosts(@Query('limit') limit?: string) {
    const limitNumber = limit ? Math.min(parseInt(limit, 10), 20) : 5;
    return await this.postsService.getRecentPosts(limitNumber);
  }

  @Get('my')
  @AuthorOrAdmin()
  @ZodSerializerDto(PostListDto)
  @ApiOperationDecorator({
    type: PostListDto,
    summary: 'Get my posts',
    description: 'Get posts created by current user (Author/Admin only)',
    operationId: 'getMyPosts',
    requireAuth: true,
  })
  async getMyPosts(
    @Query() query: PostQueryDto,
    @ActiveUser() user: TokenPayload
  ) {
    return await this.postsService.getMyPosts(query as any, user.userId);
  }

  @Get('admin/all')
  @AdminOnlyAccess()
  @ZodSerializerDto(PostListDto)
  @ApiOperationDecorator({
    type: PostListDto,
    summary: 'Get all posts (Admin)',
    description: 'Get all posts including drafts from all authors (Admin only)',
    operationId: 'getAllPostsAdmin',
    requireAuth: true,
  })
  async getAllPostsAdmin(@Query() query: PostQueryDto) {
    return await this.postsService.getAllPostsForAdmin(query as any);
  }

  @Get(':id')
  @Auth([AuthType.None])
  @ZodSerializerDto(PostResponseDto)
  @ApiOperationDecorator({
    type: PostResponseDto,
    summary: 'Get post by ID',
    description: 'Get a single post by its ID and increment view count',
    operationId: 'getPostById',
    requireAuth: false,
  })
  @ApiParam({ name: 'id', description: 'Post ID' })
  async getPostById(@Param('id', ParseIntPipe) id: number) {
    return await this.postsService.getPostById(id);
  }

  @Get('slug/:slug')
  @Auth([AuthType.None])
  @ZodSerializerDto(PostResponseDto)
  @ApiOperationDecorator({
    type: PostResponseDto,
    summary: 'Get post by slug',
    description: 'Get a single post by its slug and increment view count',
    operationId: 'getPostBySlug',
    requireAuth: false,
  })
  @ApiParam({ name: 'slug', description: 'Post slug' })
  async getPostBySlug(@Param('slug') slug: string) {
    return await this.postsService.getPostBySlug(slug);
  }

  @Put(':id')
  @AuthorWithOwnership()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(PostResponseDto)
  @ApiOperationDecorator({
    type: PostResponseDto,
    summary: 'Update post',
    description: 'Update a post (Author can only update their own posts)',
    operationId: 'updatePost',
    requireAuth: true,
  })
  @ApiParam({ name: 'id', description: 'Post ID' })
  async updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdatePostDto,
    @ActiveUser() user: TokenPayload
  ) {
    return await this.postsService.updatePost(id, updateData as any, user.userId, user.role);
  }

  @Put(':id/publish')
  @AuthorWithOwnership()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(PostResponseDto)
  @ApiOperationDecorator({
    type: PostResponseDto,
    summary: 'Publish post',
    description: 'Publish a draft post (Author can only publish their own posts)',
    operationId: 'publishPost',
    requireAuth: true,
  })
  @ApiParam({ name: 'id', description: 'Post ID' })
  async publishPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() publishData: PublishPostDto,
    @ActiveUser() user: TokenPayload
  ) {
    return await this.postsService.publishPost(id, publishData as any, user.userId, user.role);
  }

  @Put('admin/:id/force-publish')
  @AdminOnlyAccess()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(PostResponseDto)
  @ApiOperationDecorator({
    type: PostResponseDto,
    summary: 'Force publish post (Admin)',
    description: 'Force publish any post regardless of ownership (Admin only)',
    operationId: 'forcePublishPost',
    requireAuth: true,
  })
  @ApiParam({ name: 'id', description: 'Post ID' })
  async forcePublishPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() publishData: PublishPostDto
  ) {
    return await this.postsService.forcePublishPost(id, publishData as any);
  }

  @Put('admin/:id/status')
  @AdminOnlyAccess()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(PostResponseDto)
  @ApiOperationDecorator({
    type: PostResponseDto,
    summary: 'Change post status (Admin)',
    description: 'Change post status to DRAFT/PUBLISHED/ARCHIVED (Admin only)',
    operationId: 'changePostStatus',
    requireAuth: true,
  })
  @ApiParam({ name: 'id', description: 'Post ID' })
  async changePostStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() statusData: { status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' }
  ) {
    return await this.postsService.changePostStatus(id, statusData.status);
  }

  @Delete(':id')
  @AuthorWithOwnership()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperationDecorator({
    summary: 'Delete post',
    description: 'Delete a post (Author can only delete their own posts)',
    operationId: 'deletePost',
    requireAuth: true,
  })
  @ApiParam({ name: 'id', description: 'Post ID' })
  async deletePost(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: TokenPayload
  ) {
    await this.postsService.deletePost(id, user.userId, user.role);
  }

  @Delete('admin/:id/force-delete')
  @AdminOnlyAccess()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperationDecorator({
    summary: 'Force delete post (Admin)',
    description: 'Force delete any post regardless of ownership (Admin only)',
    operationId: 'forceDeletePost',
    requireAuth: true,
  })
  @ApiParam({ name: 'id', description: 'Post ID' })
  async forceDeletePost(@Param('id', ParseIntPipe) id: number) {
    await this.postsService.forceDeletePost(id);
  }
}