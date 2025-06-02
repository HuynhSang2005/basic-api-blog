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
  @AuthorOrAdmin() // ← CHỈ AUTHOR/ADMIN MỚI TẠO ĐƯỢC POST
  @ZodSerializerDto(PostResponseDto)
  async createPost(
    @Body() createData: CreatePostDto,
    @ActiveUser() user: TokenPayload
  ) {
    return await this.postsService.createPost(createData as any, user.userId);
  }

  @Get()
  @Auth([AuthType.None]) // Public route - để user đọc blog
  @ZodSerializerDto(PostListDto)
  async getPosts(@Query() query: PostQueryDto) {
    return await this.postsService.getPosts(query as any);
  }

  @Get('stats')
  @AuthorOrAdmin() // ← CHỈ AUTHOR/ADMIN MỚI XEM ĐƯỢC STATS
  @ZodSerializerDto(PostStatsDto)
  async getPostStats(@ActiveUser() user: TokenPayload) {
    // Author chỉ xem stats của mình, Admin xem tất cả
    const userId = user.role === 'ADMIN' ? undefined : user.userId;
    return await this.postsService.getPostStats(userId);
  }

  @Get('my')
  @AuthorOrAdmin() // ← CHỈ AUTHOR/ADMIN MỚI XEM ĐƯỢC POSTS CỦA MÌNH
  @ZodSerializerDto(PostListDto)
  async getMyPosts(
    @Query() query: PostQueryDto,
    @ActiveUser() user: TokenPayload
  ) {
    return await this.postsService.getMyPosts(query as any, user.userId);
  }

  @Get('admin/all')
  @AdminOnlyAccess() // ← CHỈ ADMIN MỚI XEM ĐƯỢC TẤT CẢ POSTS (including drafts của authors)
  @ZodSerializerDto(PostListDto)
  async getAllPostsAdmin(@Query() query: PostQueryDto) {
    return await this.postsService.getAllPostsForAdmin(query as any);
  }

  @Get(':id')
  @Auth([AuthType.None]) // Public route
  @ZodSerializerDto(PostResponseDto)
  async getPostById(@Param('id', ParseIntPipe) id: number) {
    return await this.postsService.getPostById(id);
  }

  @Get('slug/:slug')
  @Auth([AuthType.None]) // Public route - tăng view count
  @ZodSerializerDto(PostResponseDto)
  async getPostBySlug(@Param('slug') slug: string) {
    return await this.postsService.getPostBySlug(slug);
  }

  @Put(':id')
  @AuthorWithOwnership() // ← AUTHOR với ownership check, ADMIN có thể edit tất cả
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
  @AuthorWithOwnership() // ← AUTHOR với ownership check cho publish
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
  @AdminOnlyAccess() // ← CHỈ ADMIN MỚI FORCE PUBLISH BẤT KỲ POST NÀO
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
  @AdminOnlyAccess() // ← CHỈ ADMIN MỚI THAY ĐỔI STATUS BẤT KỲ POST NÀO
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(PostResponseDto)
  async changePostStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() statusData: { status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' }
  ) {
    return await this.postsService.changePostStatus(id, statusData.status);
  }

  @Delete(':id')
  @AuthorWithOwnership() // ← AUTHOR với ownership check cho delete
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: TokenPayload
  ) {
    await this.postsService.deletePost(id, user.userId, user.role);
  }

  @Delete('admin/:id/force-delete')
  @AdminOnlyAccess() // ← CHỈ ADMIN MỚI FORCE DELETE BẤT KỲ POST NÀO
  @HttpCode(HttpStatus.NO_CONTENT)
  async forceDeletePost(@Param('id', ParseIntPipe) id: number) {
    await this.postsService.forceDeletePost(id);
  }
}