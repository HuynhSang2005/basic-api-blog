import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/services/prisma.service';
import {
  RegisterBodyType,
  RegisterResponseType,
  UserStatus,
} from '../model/auth.model';
import { AuthTokens } from 'src/shared/types/jwt.type';
import { TokenService } from 'src/shared/services/token.service';
import { isNotFoundPrismaError } from 'src/shared/types/helper';

@Injectable()
export class AuthRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async generateToken(payload: { userId: number }): Promise<AuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken(payload),
      this.tokenService.signRefreshToken(payload),
    ]);

    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 30);

    await this.prismaService.refreshToken.create({
      data: {
        token: refreshToken,
        userId: payload.userId,
        expiresAt: refreshTokenExpiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string) {
    try {
      const { userId } = await this.tokenService.verifyRefreshToken(refreshToken);
      
      await this.prismaService.refreshToken.findUniqueOrThrow({
        where: { token: refreshToken },
      });

      await this.prismaService.refreshToken.delete({
        where: { token: refreshToken },
      });

      return await this.generateToken({ userId });
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new UnauthorizedException('Refresh token không tồn tại hoặc đã hết hạn.');
      }
      throw new UnauthorizedException('Token không hợp lệ.');
    }
  }

  async logout(refreshToken: string) {
    try {
      await this.tokenService.verifyRefreshToken(refreshToken);
      
      await this.prismaService.refreshToken.delete({
        where: { token: refreshToken },
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
    });
  }

  async updateLastLogin(userId: number) {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  async createUser(
    userData: Omit<RegisterBodyType, 'confirmPassword'>,
  ): Promise<RegisterResponseType> {
    const user = await this.prismaService.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        username: true,
        avatarUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        password: false,
      },
    });

    const result = {
      ...user,
      status: user.status as UserStatus,
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
      deletedAt: user.deletedAt?.toISOString() ?? null,
    };

    return result;
  }
}