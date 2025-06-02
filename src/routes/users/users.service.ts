import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from './repository/users.repo';
import { HashingService } from '../../shared/services/hashing.service';
import {
  UserProfileType,
  UpdateProfileType,
  ChangePasswordType,
  UserListType,
} from './model/user.model';
import { UserStatus, UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hashingService: HashingService,
  ) {}

  async getUserProfile(userId: number): Promise<UserProfileType> {
    return await this.usersRepository.findUserById(userId);
  }

  async updateUserProfile(userId: number, data: UpdateProfileType): Promise<UserProfileType> {
    // Kiểm tra username duplicate nếu có thay đổi
    if (data.username) {
      const usernameExists = await this.usersRepository.checkUsernameExists(data.username, userId);
      if (usernameExists) {
        throw new BadRequestException('Tên đăng nhập đã tồn tại.');
      }
    }

    return await this.usersRepository.updateProfile(userId, data);
  }

  async changePassword(userId: number, data: ChangePasswordType): Promise<void> {
    // Lấy user với password hiện tại
    const user = await this.usersRepository.findUserByIdWithPassword(userId);

    // Kiểm tra password hiện tại
    const isCurrentPasswordValid = await this.hashingService.compare(
      data.currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Mật khẩu hiện tại không đúng.');
    }

    // Hash password mới
    const hashedNewPassword = await this.hashingService.hash(data.newPassword);

    // Update password
    await this.usersRepository.updatePassword(userId, hashedNewPassword);
  }

  // ← ADMIN METHODS
  async getAllUsers(page: number = 1, limit: number = 10): Promise<UserListType> {
    return await this.usersRepository.getAllUsers(page, limit);
  }

  async updateUserStatus(userId: number, status: UserStatus): Promise<UserProfileType> {
    return await this.usersRepository.updateUserStatusAsAdmin(userId, status);
  }

  async promoteToAuthor(userId: number): Promise<UserProfileType> {
    return await this.usersRepository.updateUserRoleAsAdmin(userId, UserRole.AUTHOR);
  }

  async demoteToUser(userId: number): Promise<UserProfileType> {
    return await this.usersRepository.updateUserRoleAsAdmin(userId, UserRole.USER);
  }
}