import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { HashingService } from '../../shared/services/hashing.service';
import { 
  UserProfileType, 
  UpdateProfileType, 
  ChangePasswordType,
  ChangePasswordResponseType 
} from './model/user.model';
import { UsersRepository } from './repository/user.repo';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hashingService: HashingService,
  ) {}

  async getProfile(userId: number): Promise<UserProfileType> {
    return await this.usersRepository.findUserById(userId);
  }

  async updateProfile(userId: number, data: UpdateProfileType): Promise<UserProfileType> {
    // Kiểm tra username trùng lặp nếu có thay đổi username
    if (data.username) {
      const usernameExists = await this.usersRepository.checkUsernameExists(
        data.username, 
        userId
      );
      
      if (usernameExists) {
        throw new ConflictException(`Username '${data.username}' đã tồn tại.`);
      }
    }

    return await this.usersRepository.updateProfile(userId, data);
  }

  async changePassword(
    userId: number, 
    data: ChangePasswordType
  ): Promise<ChangePasswordResponseType> {
    // Lấy thông tin user hiện tại (bao gồm password)
    const user = await this.usersRepository.findUserByIdWithPassword(userId);

    // Kiểm tra mật khẩu hiện tại
    const isCurrentPasswordValid = await this.hashingService.compare(
      data.currentPassword, 
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Mật khẩu hiện tại không chính xác.');
    }

    // Kiểm tra mật khẩu mới không giống mật khẩu cũ
    const isSamePassword = await this.hashingService.compare(
      data.newPassword, 
      user.password
    );

    if (isSamePassword) {
      throw new ConflictException('Mật khẩu mới phải khác mật khẩu hiện tại.');
    }

    // Hash mật khẩu mới
    const hashedNewPassword = await this.hashingService.hash(data.newPassword);

    // Cập nhật mật khẩu
    await this.usersRepository.updatePassword(userId, hashedNewPassword);

    return {
      message: 'Đổi mật khẩu thành công.',
    };
  }
}