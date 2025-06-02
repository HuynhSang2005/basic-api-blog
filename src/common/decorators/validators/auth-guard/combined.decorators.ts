import { applyDecorators, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Auth } from './auth.decorators';
import { Roles } from './role.decorators';
import { AuthType } from 'src/shared/constants/auth.constant';
import { RoleGuard } from 'src/common/guards/role.guard';

/**
 * Decorator kết hợp Authentication + Admin Role
 * Chỉ ADMIN mới có thể truy cập
 */
export const AdminOnly = () => applyDecorators(
  Auth([AuthType.Bear]),        // Cần đăng nhập
  Roles(UserRole.ADMIN),        // Cần role ADMIN
  UseGuards(RoleGuard)          // Sử dụng RoleGuard
);

/**
 * Decorator kết hợp Authentication + Author/Admin Role
 * AUTHOR hoặc ADMIN đều có thể truy cập
 */
export const AuthorOrAdmin = () => applyDecorators(
  Auth([AuthType.Bear]),                    // Cần đăng nhập
  Roles(UserRole.AUTHOR, UserRole.ADMIN),  // Cần role AUTHOR hoặc ADMIN
  UseGuards(RoleGuard)                      // Sử dụng RoleGuard
);