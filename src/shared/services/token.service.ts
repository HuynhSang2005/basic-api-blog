import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from '../types/jwt.type';
import envConfig from 'src/config/config';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  signAccessToken(payload: { userId: number }): string {
    try {
      const tokenPayload: TokenPayload = {
        userId: payload.userId,
      };

      return this.jwtService.sign(tokenPayload, {
        secret: envConfig.ACCESS_TOKEN_SECRET,
        expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN,
        algorithm: 'HS256',
      });
    } catch (error) {
      console.error('❌ Lỗi khi tạo access token:', error);
      throw new Error('Không thể tạo access token');
    }
  }

  signRefreshToken(payload: { userId: number }): string {
    try {
      const tokenPayload: TokenPayload = {
        userId: payload.userId,
      };

      return this.jwtService.sign(tokenPayload, {
        secret: envConfig.REFRESH_TOKEN_SECRET,
        expiresIn: envConfig.REFRESH_TOKEN_EXPIRES_IN,
        algorithm: 'HS256',
      });
    } catch (error) {
      console.error('❌ Lỗi khi tạo refresh token:', error);
      throw new Error('Không thể tạo refresh token');
    }
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: envConfig.ACCESS_TOKEN_SECRET,
      });
    } catch (error) {
      console.error('❌ Lỗi khi verify access token:', error);
      throw new Error('Access token không hợp lệ');
    }
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: envConfig.REFRESH_TOKEN_SECRET,
      });
    } catch (error) {
      console.error('❌ Lỗi khi verify refresh token:', error);
      throw new Error('Refresh token không hợp lệ');
    }
  }
}