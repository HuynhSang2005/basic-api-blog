// Cập nhật users.controller.ts
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
import { ApiTags, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
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
import { ApiOperationDecorator } from '../../common/decorators/api-operation.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @Auth([AuthType.Bear])
  @ZodSerializerDto(UserProfileDto)
  @ApiOperationDecorator({
    type: UserProfileDto,
    summary: 'Get user profile',
    description: 'Get current user profile information',
    operationId: 'getUserProfile',
    requireAuth: true,
  })
  async getProfile(@ActiveUser() user: TokenPayload) {
    return await this.usersService.getUserProfile(user.userId);
  }

  @Put('profile')
  @Auth([AuthType.Bear])
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(UserProfileDto)
  @ApiOperationDecorator({
    type: UserProfileDto,
    summary: 'Update user profile',
    description: 'Update current user profile information',
    operationId: 'updateUserProfile',
    requireAuth: true,
  })
  async updateProfile(
    @Body() updateData: UpdateProfileDto,
    @ActiveUser() user: TokenPayload
  ) {
    return await this.usersService.updateUserProfile(user.userId, updateData as any);
  }

  @Put('change-password')
  @Auth([AuthType.Bear])
  @HttpCode(HttpStatus.OK)
  @ApiOperationDecorator({
    summary: 'Change password',
    description: 'Change current user password',
    operationId: 'changePassword',
    requireAuth: true,
  })
  async changePassword(
    @Body() changePasswordData: ChangePasswordDto,
    @ActiveUser() user: TokenPayload
  ) {
    await this.usersService.changePassword(user.userId, changePasswordData as any);
    return { message: 'Đổi mật khẩu thành công.' };
  }

  @Get('admin/all')
  @AdminOnlyAccess()
  @ZodSerializerDto(UserListDto)
  @ApiOperationDecorator({
    type: UserListDto,
    summary: 'Get all users (Admin)',
    description: 'Get paginated list of all users (Admin only)',
    operationId: 'getAllUsers',
    requireAuth: true,
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  async getAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return await this.usersService.getAllUsers(pageNumber, limitNumber);
  }

  @Get('admin/:id')
  @AdminOnlyAccess()
  @ZodSerializerDto(UserProfileDto)
  @ApiOperationDecorator({
    type: UserProfileDto,
    summary: 'Get user by ID (Admin)',
    description: 'Get any user profile by ID (Admin only)',
    operationId: 'getUserById',
    requireAuth: true,
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.getUserProfile(id);
  }

  @Put('admin/:id/status')
  @AdminOnlyAccess()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(UserProfileDto)
  @ApiOperationDecorator({
    type: UserProfileDto,
    summary: 'Update user status (Admin)',
    description: 'Update user status to ACTIVE/INACTIVE/BANNED (Admin only)',
    operationId: 'updateUserStatus',
    requireAuth: true,
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  async updateUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() statusData: UpdateUserStatusDto
  ) {
    return await this.usersService.updateUserStatus(id, statusData.status);
  }

  @Put('admin/:id/promote-to-author')
  @AdminOnlyAccess()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(UserProfileDto)
  @ApiOperationDecorator({
    type: UserProfileDto,
    summary: 'Promote user to author (Admin)',
    description: 'Promote user role from USER to AUTHOR (Admin only)',
    operationId: 'promoteToAuthor',
    requireAuth: true,
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  async promoteToAuthor(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.promoteToAuthor(id);
  }

  @Put('admin/:id/demote-to-user')
  @AdminOnlyAccess()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(UserProfileDto)
  @ApiOperationDecorator({
    type: UserProfileDto,
    summary: 'Demote author to user (Admin)',
    description: 'Demote user role from AUTHOR to USER (Admin only)',
    operationId: 'demoteToUser',
    requireAuth: true,
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  async demoteToUser(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.demoteToUser(id);
  }
}