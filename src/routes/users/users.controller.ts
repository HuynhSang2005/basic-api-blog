import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Put,
  Query,
} from '@nestjs/common';

import { ZodSerializerDto } from 'nestjs-zod';
import {
  UserProfileDto,
  UpdateProfileDto,
  ChangePasswordDto,
  UserListDto,
  UpdateUserStatusDto,
} from './dto/users.dto';
import { Auth } from '../../common/decorators/validators/auth-guard/auth.decorators';
import { AuthType } from '../../shared/constants/auth.constant';
import { ActiveUser } from '../../common/decorators/validators/auth-guard/active-user.decorators';
import { TokenPayload } from '../../shared/types/jwt.type';
import { AdminOnlyAccess } from '../../common/decorators/validators/auth-guard/combined.decorators';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @Auth([AuthType.Bear]) // ← USER CÓ THỂ XEM PROFILE CỦA MÌNH
  @ZodSerializerDto(UserProfileDto)
  async getProfile(@ActiveUser() user: TokenPayload) {
    return await this.usersService.getUserProfile(user.userId);
  }

  @Put('profile')
  @Auth([AuthType.Bear]) // ← USER CÓ THỂ UPDATE PROFILE CỦA MÌNH
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(UserProfileDto)
  async updateProfile(
    @Body() updateData: UpdateProfileDto,
    @ActiveUser() user: TokenPayload
  ) {
    return await this.usersService.updateUserProfile(user.userId, updateData as any);
  }

  @Put('change-password')
  @Auth([AuthType.Bear]) // ← USER CÓ THỂ ĐỔI PASSWORD CỦA MÌNH
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Body() changePasswordData: ChangePasswordDto,
    @ActiveUser() user: TokenPayload
  ) {
    await this.usersService.changePassword(user.userId, changePasswordData as any);
    return { message: 'Đổi mật khẩu thành công.' };
  }

  // ← ADMIN-ONLY ENDPOINTS
  @Get('admin/all')
  @AdminOnlyAccess() // ← CHỈ ADMIN MỚI XEM ĐƯỢC TẤT CẢ USERS
  @ZodSerializerDto(UserListDto)
  async getAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return await this.usersService.getAllUsers(pageNumber, limitNumber);
  }

  @Get('admin/:id')
  @AdminOnlyAccess() // ← CHỈ ADMIN MỚI XEM ĐƯỢC PROFILE CỦA USER KHÁC
  @ZodSerializerDto(UserProfileDto)
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.getUserProfile(id);
  }

  @Put('admin/:id/status')
  @AdminOnlyAccess() // ← CHỈ ADMIN MỚI THAY ĐỔI STATUS CỦA USER
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(UserProfileDto)
  async updateUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() statusData: UpdateUserStatusDto
  ) {
    return await this.usersService.updateUserStatus(id, statusData.status);
  }

  // ← THÊM ADMIN METHOD ĐỂ PROMOTE USER TO AUTHOR
  @Put('admin/:id/promote-to-author')
  @AdminOnlyAccess() // ← CHỈ ADMIN MỚI PROMOTE USER THÀNH AUTHOR
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(UserProfileDto)
  async promoteToAuthor(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.promoteToAuthor(id);
  }

  @Put('admin/:id/demote-to-user')
  @AdminOnlyAccess() // ← CHỈ ADMIN MỚI DEMOTE AUTHOR VỀ USER
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(UserProfileDto)
  async demoteToUser(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.demoteToUser(id);
  }
}