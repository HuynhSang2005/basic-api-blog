import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/services/prisma.service';
import {
  RegisterBodyType,
  RegisterResponseType,
  TokenResponseType 
} from '../model/auth.model';
import { TokenPayload, RefreshTokenPayload } from '../../../shared/types/jwt.type';
import { TokenService } from '../../../shared/services/token.service';
import { isNotFoundPrismaError } from '../../../shared/types/helper';
import { UserStatus, UserRole } from '@prisma/client';

@Injectable()
export class AuthRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async generateToken(payload: { userId: number }): Promise<TokenResponseType> {
    // Lấy thông tin user để include role vào JWT
    const user = await this.prismaService.user.findUnique({
      where: { id: payload.userId },
      select: { 
        id: true, 
        username: true, 
        role: true,
        status: true
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Kiểm tra user status
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Tài khoản đã bị khóa hoặc không hoạt động');
    }

    // Tạo JWT payload với role
    const jwtPayload: TokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };

    // Tạo refresh token record trước
    const refreshTokenRecord = await this.prismaService.refreshToken.create({
      data: {
        token: '', // Tạm thời để trống, sẽ update sau
        userId: payload.userId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
      },
    });

    // Tạo refresh token payload
    const refreshTokenPayload: RefreshTokenPayload = {
      userId: payload.userId,
      refreshTokenId: refreshTokenRecord.id,
    };

    // Generate cả 2 tokens
    const [accessToken, refreshTokenString] = await Promise.all([
      this.tokenService.signAccessToken(jwtPayload),
      this.tokenService.signRefreshToken(refreshTokenPayload),
    ]);

    // Update refresh token với string đã generate
    await this.prismaService.refreshToken.update({
      where: { id: refreshTokenRecord.id },
      data: { token: refreshTokenString },
    });

    return {
      accessToken,
      refreshToken: refreshTokenString,
    };
  }

  async refreshToken(refreshToken: string): Promise<TokenResponseType> {
    try {
      // Verify refresh token và lấy payload
      const refreshPayload = await this.tokenService.verifyRefreshToken(refreshToken);
      
      // Kiểm tra refresh token tồn tại trong database
      const tokenRecord = await this.prismaService.refreshToken.findUniqueOrThrow({
        where: { 
          token: refreshToken,
          id: refreshPayload.refreshTokenId
        },
        include: {
          user: {
            select: {
              id: true,
              status: true,
            }
          }
        }
      });

      // Kiểm tra user status
      if (tokenRecord.user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Tài khoản đã bị khóa hoặc không hoạt động');
      }

      // Kiểm tra token đã hết hạn chưa
      if (tokenRecord.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token đã hết hạn');
      }

      // Xóa refresh token cũ (rotation)
      await this.prismaService.refreshToken.delete({
        where: { id: tokenRecord.id },
      });

      // Tạo tokens mới
      return await this.generateToken({ userId: refreshPayload.userId });
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new UnauthorizedException('Refresh token không tồn tại hoặc đã hết hạn.');
      }
      throw new UnauthorizedException('Token không hợp lệ.');
    }
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    try {
      // Verify refresh token
      const refreshPayload = await this.tokenService.verifyRefreshToken(refreshToken);
      
      // Xóa refresh token khỏi database
      await this.prismaService.refreshToken.delete({
        where: { 
          token: refreshToken,
          id: refreshPayload.refreshTokenId
        },
      });

      return { message: 'Đăng xuất thành công.' };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new UnauthorizedException('Refresh token không tồn tại.');
      }
      throw new UnauthorizedException('Đăng xuất không thành công.');
    }
  }

  async findUserByEmail(email: string) {
    return await this.prismaService.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      }
    });
  }

  async updateLastLogin(userId: number): Promise<void> {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  async createUser(
    userData: Omit<RegisterBodyType, 'confirmPassword'>,
  ): Promise<RegisterResponseType> {
    const user = await this.prismaService.user.create({
      data: {
        ...userData,
        role: UserRole.USER, // ← SỬA: Dùng enum thay vì string
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        password: false,
      },
    });

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      role: user.role, 
      status: user.status,
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
      deletedAt: user.deletedAt?.toISOString() ?? null,
    };
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.prismaService.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        }
      }
    });
  }

  async revokeAllUserTokens(userId: number): Promise<void> {
    await this.prismaService.refreshToken.deleteMany({
      where: { userId }
    });
  }
}