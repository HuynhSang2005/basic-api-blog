import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { REQUEST_USER_KEY } from '../../shared/constants/auth.constant';
import { TokenPayload } from '../../shared/types/jwt.type';

export const ROLES_KEY = 'roles';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lấy roles được yêu cầu từ decorator
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Nếu không có role nào được yêu cầu, cho phép truy cập
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Lấy user từ request (đã được set bởi AccessTokenGuard)
    const request = context.switchToHttp().getRequest();
    const user: TokenPayload = request[REQUEST_USER_KEY];

    // Nếu không có user trong request, từ chối truy cập
    if (!user) {
      throw new ForbiddenException('User information not found in request');
    }

    // Kiểm tra role của user có trong danh sách yêu cầu không
    const hasRequiredRole = requiredRoles.some(role => user.role === role);

    if (!hasRequiredRole) {
      throw new ForbiddenException(`Access denied. Required roles: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}