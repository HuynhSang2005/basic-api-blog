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

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @Auth([AuthType.Bear]) 
  @ZodSerializerDto(PostResponseDto)
  async createPost(
    @Body() createData: CreatePostDto,
    @ActiveUser() user: TokenPayload
  ) {
    // Convert DTO to Type
    return await this.postsService.createPost(createData as any, user.userId);
  }

  @Get()
  @Auth([AuthType.None]) // Public route
  @ZodSerializerDto(PostListDto)
  async getPosts(@Query() query: PostQueryDto) {
    // Convert DTO to Type
    return await this.postsService.getPosts(query as any);
  }

  @Get('stats')
  @Auth([AuthType.Bear]) 
  @ZodSerializerDto(PostStatsDto)
  async getPostStats(@ActiveUser() user: TokenPayload) {
    return await this.postsService.getPostStats(user.userId);
  }

  @Get('my')
  @Auth([AuthType.Bear]) // Lấy bài viết của user hiện tại
  @ZodSerializerDto(PostListDto)
  async getMyPosts(
    @Query() query: PostQueryDto,
    @ActiveUser() user: TokenPayload
  ) {
    // Convert DTO to Type
    return await this.postsService.getMyPosts(query as any, user.userId);
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
  @Auth([AuthType.Bear]) // Cần đăng nhập và là chủ sở hữu
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(PostResponseDto)
  async updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdatePostDto,
    @ActiveUser() user: TokenPayload
  ) {
    // Convert DTO to Type
    return await this.postsService.updatePost(id, updateData as any, user.userId);
  }

  @Put(':id/publish')
  @Auth([AuthType.Bear]) // Cần đăng nhập và là chủ sở hữu
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(PostResponseDto)
  async publishPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() publishData: PublishPostDto,
    @ActiveUser() user: TokenPayload
  ) {
    // Convert DTO to Type
    return await this.postsService.publishPost(id, publishData as any, user.userId);
  }

  @Delete(':id')
  @Auth([AuthType.Bear]) 
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: TokenPayload
  ) {
    await this.postsService.deletePost(id, user.userId);
  }
}