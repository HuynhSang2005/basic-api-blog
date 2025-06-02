
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { REQUEST_USER_KEY } from 'src/shared/constants/auth.constant';
import { TokenService } from 'src/shared/services/token.service';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}
  
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.headers['authorization']?.split(' ')[1];
    if (!accessToken) {
      // Nếu không có access token, ném lỗi 401
      throw new UnauthorizedException('Access token is missing');
    }
    try {
      // Xác thực access token, nếu hợp lệ sẽ trả về thông tin user (payload)
      const decodedAccessToken = await this.tokenService.verifyAccessToken(accessToken);

      // Gán thông tin user vào request để các middleware/controller phía sau có thể sử dụng
      request[REQUEST_USER_KEY] = decodedAccessToken;
      
      // Nếu true thì xem như là đã bypass guard
      return true;
    } catch {
      // Nếu token không hợp lệ hoặc hết hạn, ném lỗi 401
      throw new UnauthorizedException('Access token is invalid');
    }
  }
}
