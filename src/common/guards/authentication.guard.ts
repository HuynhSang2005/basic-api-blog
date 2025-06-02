import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessTokenGuard } from './access-token.guard';
import { AuthType, ConditionGuard } from 'src/shared/constants/auth.constant';
import { AUTH_TYPE, AuthTypeDecoratorPayLoad } from '../decorators/validators/auth-guard/auth.decorators';


@Injectable()
export class AuthenticationGuard implements CanActivate {
  // mapping từng loại AuthType với guard tương ứng
  private readonly authTypeGuardMap: Record<string, CanActivate>;

  constructor(
    private reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
  ) {
    // Khởi tạo map giữa AuthType và guard
    this.authTypeGuardMap = {
      [AuthType.Bear]: this.accessTokenGuard, // Bearer token
      [AuthType.None]: { canActivate: () => true }, // Không cần xác thực
    };
  }

  /**
   * Hàm kiểm tra quyền truy cập cho mỗi request.
   * Cho phép cấu hình nhiều loại xác thực và điều kiện (AND/OR) giữa các guard.
   */
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    // Lấy metadata về loại xác thực từ decorator @Auth trên controller/route
    // Nếu không có, mặc định là không cần xác thực (AuthType.None)
    const authTypeValue = this.reflector.getAllAndOverride<AuthTypeDecoratorPayLoad | undefined>(AUTH_TYPE, [
      context.getHandler(),
      context.getClass(),
    ]) ?? { authType: [AuthType.None], options: { condition: ConditionGuard.And } };

    // Lấy danh sách các guard tương ứng với từng AuthType
    const guards = authTypeValue.authType.map((authType) => this.authTypeGuardMap[authType]);
    let error = new UnauthorizedException('All guards failed');

    // Nếu điều kiện là OR: chỉ cần 1 guard pass là cho phép truy cập
    if (authTypeValue.options.condition === ConditionGuard.Or) {
      for (const instance of guards) {
        // Dùng Promise.resolve để bắt lỗi nếu guard throw exception
        const canActivate = await Promise.resolve(instance.canActivate(context)).catch((err) => {
          error = err;
          return false;
        });
        if (canActivate) {
          return true; // Chỉ cần 1 guard pass
        }
      }
      // Nếu tất cả guard đều fail, ném lỗi
      throw new UnauthorizedException('All guards failed');
    } else {
      // Nếu điều kiện là AND: tất cả guard đều phải pass
      for (const instance of guards) {
        const canActivate = await instance.canActivate(context);
        if (!canActivate) {
          throw new UnauthorizedException('All guards failed');
        }
      }
      return true; // Tất cả guard đều pass
    }
  }
}