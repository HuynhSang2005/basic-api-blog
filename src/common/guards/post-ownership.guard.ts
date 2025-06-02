import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import { REQUEST_USER_KEY } from '../../shared/constants/auth.constant';
import { TokenPayload } from '../../shared/types/jwt.type';
import { UserRole } from '@prisma/client';

@Injectable()
export class PostOwnershipGuard implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: TokenPayload = request[REQUEST_USER_KEY];

    // Nếu không có user (guard này chỉ dùng với authenticated routes)
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Nếu là Admin, cho phép truy cập tất cả posts
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Lấy postId từ params
    const postId = this.extractPostId(request);
    if (!postId) {
      throw new ForbiddenException('Post ID is required');
    }

    // Kiểm tra post tồn tại và ownership
    const post = await this.prismaService.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true, title: true }
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Kiểm tra ownership
    if (post.authorId !== user.userId) {
      throw new ForbiddenException('You can only access your own posts');
    }

    return true;
  }

  /**
   * Extract post ID từ request params
   * Hỗ trợ các pattern: /posts/:id, /posts/:id/publish, etc.
   */
  private extractPostId(request: any): number | null {
    const postId = request.params?.id;
    if (!postId) return null;
    
    const parsed = parseInt(postId, 10);
    return isNaN(parsed) ? null : parsed;
  }
}