import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/services/prisma.service';
import { 
  UserProfileType, 
  UpdateProfileType, 

} from '../model/user.model';
import { UserStatus } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUserById(userId: number): Promise<UserProfileType> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại.');
    }

    return {
      ...user,
      status: user.status as UserStatus,
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
      deletedAt: user.deletedAt?.toISOString() ?? null,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    };
  }

  async findUserByIdWithPassword(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại.');
    }

    return user;
  }

  async updateProfile(userId: number, data: UpdateProfileType): Promise<UserProfileType> {
    const user = await this.prismaService.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });

    return {
      ...user,
      status: user.status as UserStatus,
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
      deletedAt: user.deletedAt?.toISOString() ?? null,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    };
  }

  async updatePassword(userId: number, hashedPassword: string): Promise<void> {
    await this.prismaService.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });
  }

  async checkUsernameExists(username: string, excludeUserId?: number): Promise<boolean> {
    const user = await this.prismaService.user.findFirst({
      where: {
        username,
        ...(excludeUserId && { id: { not: excludeUserId } }),
      },
    });

    return !!user;
  }
}