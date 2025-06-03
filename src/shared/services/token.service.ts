import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload, RefreshTokenPayload } from '../types/jwt.type';
import envConfig from 'config';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  // Tạo Access Token với đầy đủ thông tin user
  signAccessToken(payload: TokenPayload): string {
    try {
      // payload đã có đầy đủ: userId, username, role
      return this.jwtService.sign(payload, {
        secret: envConfig.ACCESS_TOKEN_SECRET,
        expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN,
        algorithm: 'HS256',
      });
    } catch (error) {
      console.error('❌ Lỗi khi tạo access token:', error);
      throw new Error('Không thể tạo access token');
    }
  }

  // Tạo Refresh Token với payload riêng
  signRefreshToken(payload: RefreshTokenPayload): string {
    try {
      // payload chỉ cần: userId, refreshTokenId
      return this.jwtService.sign(payload, {
        secret: envConfig.REFRESH_TOKEN_SECRET,
        expiresIn: envConfig.REFRESH_TOKEN_EXPIRES_IN,
        algorithm: 'HS256',
      });
    } catch (error) {
      console.error('❌ Lỗi khi tạo refresh token:', error);
      throw new Error('Không thể tạo refresh token');
    }
  }

  // Verify Access Token trả về TokenPayload đầy đủ
  async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      return await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: envConfig.ACCESS_TOKEN_SECRET,
      });
    } catch (error) {
      console.error('❌ Lỗi khi verify access token:', error);
      throw new Error('Access token không hợp lệ');
    }
  }

  // Verify Refresh Token trả về RefreshTokenPayload
  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    try {
      return await this.jwtService.verifyAsync<RefreshTokenPayload>(token, {
        secret: envConfig.REFRESH_TOKEN_SECRET,
      });
    } catch (error) {
      console.error('❌ Lỗi khi verify refresh token:', error);
      throw new Error('Refresh token không hợp lệ');
    }
  }
}