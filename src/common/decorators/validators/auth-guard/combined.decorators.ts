import { applyDecorators, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Auth } from './auth.decorators';
import { Roles } from './role.decorators'; 
import { AuthType } from '../../../../shared/constants/auth.constant'; // ← FIX PATH
import { RoleGuard } from '../../../guards/role.guard';
import { PostOwnershipGuard } from '../../../guards/post-ownership.guard'; // ← FIX PATH

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

/**
 * Decorator cho Author với ownership check
 * Chỉ Author/Admin có thể truy cập và Author chỉ truy cập posts của mình
 */
export const AuthorWithOwnership = () => applyDecorators(
  Auth([AuthType.Bear]),                    // Cần đăng nhập
  Roles(UserRole.AUTHOR, UserRole.ADMIN),  // Cần role AUTHOR hoặc ADMIN
  UseGuards(RoleGuard, PostOwnershipGuard) // Sử dụng cả RoleGuard và OwnershipGuard
);

/**
 * Decorator strict cho Author-only với ownership
 * Chỉ Author có thể truy cập posts của mình (không bao gồm Admin override)
 */
export const AuthorOnlyWithOwnership = () => applyDecorators(
  Auth([AuthType.Bear]),                    // Cần đăng nhập
  Roles(UserRole.AUTHOR),                   // Chỉ role AUTHOR
  UseGuards(RoleGuard, PostOwnershipGuard)  // Ownership check
);

/**
 * Decorator cho Admin-only operations (không cần ownership check)
 */
export const AdminOnlyAccess = () => applyDecorators(
  Auth([AuthType.Bear]),        // Cần đăng nhập
  Roles(UserRole.ADMIN),        // Chỉ role ADMIN
  UseGuards(RoleGuard)          // Chỉ cần RoleGuard
);