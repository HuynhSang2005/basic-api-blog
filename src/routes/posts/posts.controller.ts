// Fix trong posts.controller.ts
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

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @AuthorOrAdmin()
  @ZodSerializerDto(PostResponseDto)
  async createPost(
    @Body() createData: CreatePostDto,
    @ActiveUser() user: TokenPayload
  ) {
    return await this.postsService.createPost(createData as any, user.userId);
  }

  @Get()
  @Auth([AuthType.None])
  @ZodSerializerDto(PostListDto)
  async getPosts(@Query() query: PostQueryDto) {
    return await this.postsService.getPosts(query as any);
  }

  @Get('stats')
  @AuthorOrAdmin()
  @ZodSerializerDto(PostStatsDto)
  async getPostStats(@ActiveUser() user: TokenPayload) {
    const userId = user.role === 'ADMIN' ? undefined : user.userId;
    return await this.postsService.getPostStats(userId);
  }

  @Get('search/suggestions')
  @Auth([AuthType.None]) 
  async getSearchSuggestions(@Query('q') searchTerm?: string) {
    if (!searchTerm) {
      return [];
    }
    return await this.postsService.getSearchSuggestions(searchTerm);
  }

  @Get('popular')
  @Auth([AuthType.None]) // Public endpoint
  async getPopularPosts(@Query('limit') limit?: string) {
    const limitNumber = limit ? Math.min(parseInt(limit, 10), 20) : 5;
    return await this.postsService.getPopularPosts(limitNumber);
  }

  @Get('recent')
  @Auth([AuthType.None]) // Public endpoint  
  async getRecentPosts(@Query('limit') limit?: string) {
    const limitNumber = limit ? Math.min(parseInt(limit, 10), 20) : 5;
    return await this.postsService.getRecentPosts(limitNumber);
  }

  @Get('my')
  @AuthorOrAdmin()
  @ZodSerializerDto(PostListDto)
  async getMyPosts(
    @Query() query: PostQueryDto,
    @ActiveUser() user: TokenPayload
  ) {
    return await this.postsService.getMyPosts(query as any, user.userId);
  }

  @Get('admin/all')
  @AdminOnlyAccess()
  @ZodSerializerDto(PostListDto)
  async getAllPostsAdmin(@Query() query: PostQueryDto) {
    return await this.postsService.getAllPostsForAdmin(query as any);
  }

  @Get(':id')
  @Auth([AuthType.None])
  @ZodSerializerDto(PostResponseDto)
  async getPostById(@Param('id', ParseIntPipe) id: number) {
    return await this.postsService.getPostById(id);
  }

  @Get('slug/:slug')
  @Auth([AuthType.None])
  @ZodSerializerDto(PostResponseDto)
  async getPostBySlug(@Param('slug') slug: string) {
    return await this.postsService.getPostBySlug(slug);
  }

  @Put(':id')
  @AuthorWithOwnership()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(PostResponseDto)
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
  async forcePublishPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() publishData: PublishPostDto,
    @ActiveUser() user: TokenPayload
  ) {
    return await this.postsService.forcePublishPost(id, publishData as any);
  }

  @Put('admin/:id/status')
  @AdminOnlyAccess()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(PostResponseDto)
  async changePostStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() statusData: { status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' }
  ) {
    return await this.postsService.changePostStatus(id, statusData.status);
  }

  @Delete(':id')
  @AuthorWithOwnership()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: TokenPayload
  ) {
    await this.postsService.deletePost(id, user.userId, user.role);
  }

  @Delete('admin/:id/force-delete')
  @AdminOnlyAccess()
  @HttpCode(HttpStatus.NO_CONTENT)
  async forceDeletePost(@Param('id', ParseIntPipe) id: number) {
    await this.postsService.forceDeletePost(id);
  }
}