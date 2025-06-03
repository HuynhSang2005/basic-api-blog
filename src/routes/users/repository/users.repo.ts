import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/services/prisma.service';
import { 
  UserProfileType, 
  UpdateProfileType, 
} from '../model/user.model';
import { UserStatus, UserRole } from '@prisma/client';

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
        role: true,
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
      role: user.role,
      status: user.status as UserStatus,
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
      deletedAt: user.deletedAt?.toISOString() ?? null,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    };
  }

  // ← THÊM METHOD findUserByIdWithPassword
  async findUserByIdWithPassword(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
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
        deletedAt: true,
      },
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
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });

    return {
      ...user,
      role: user.role,
      status: user.status as UserStatus,
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
      deletedAt: user.deletedAt?.toISOString() ?? null,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    };
  }

  // ← THÊM METHOD updatePassword
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

  async checkEmailExists(email: string, excludeUserId?: number): Promise<boolean> {
    const user = await this.prismaService.user.findFirst({
      where: {
        email,
        ...(excludeUserId && { id: { not: excludeUserId } }),
      },
    });

    return !!user;
  }

  // ← ADMIN METHODS
  async getAllUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prismaService.user.findMany({
        select: {
          id: true,
          email: true,
          username: true,
          fullName: true,
          avatarUrl: true,
          role: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prismaService.user.count(),
    ]);

    return {
      users: users.map(user => ({
        ...user,
        role: user.role,
        status: user.status as UserStatus,
        createdAt: user.createdAt?.toISOString(),
        updatedAt: user.updatedAt?.toISOString(),
        lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
        deletedAt: null, 
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  async updateUserStatusAsAdmin(userId: number, status: UserStatus): Promise<UserProfileType> {
    const user = await this.prismaService.user.update({
      where: { id: userId },
      data: {
        status,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });

    return {
      ...user,
      role: user.role,
      status: user.status as UserStatus,
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
      deletedAt: user.deletedAt?.toISOString() ?? null,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    };
  }

  // ← THÊM METHOD updateUserRoleAsAdmin
  async updateUserRoleAsAdmin(userId: number, role: UserRole): Promise<UserProfileType> {
    const user = await this.prismaService.user.update({
      where: { id: userId },
      data: {
        role,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });

    return {
      ...user,
      role: user.role,
      status: user.status as UserStatus,
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
      deletedAt: user.deletedAt?.toISOString() ?? null,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    };
  }
}