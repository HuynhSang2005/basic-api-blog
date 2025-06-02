import { 
  Body, 
  Controller, 
  Get, 
  Put,
  HttpCode, 
  HttpStatus
} from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { 
  UserProfileDto,
  UpdateProfileDto,
  ChangePasswordDto,
  ChangePasswordResponseDto
} from './dto/user.dto';
import { Auth } from '../../common/decorators/validators/auth-guard/auth.decorators';
import { AuthType } from '../../shared/constants/auth.constant';
import { ActiveUser } from '../../common/decorators/validators/auth-guard/active-user.decorators';
import { TokenPayload } from '../../shared/types/jwt.type';
import { UsersService } from './user.service';

@Controller('users')
@Auth([AuthType.Bear]) // Tất cả các route trong controller này đều yêu cầu xác thực bằng Bearer Token
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ZodSerializerDto(UserProfileDto)
  async getProfile(@ActiveUser() user: TokenPayload) {
    return await this.usersService.getProfile(user.userId);
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(UserProfileDto)
  async updateProfile(
    @ActiveUser() user: TokenPayload,
    @Body() updateData: UpdateProfileDto
  ) {
    return await this.usersService.updateProfile(user.userId, updateData);
  }

  @Put('change-password')
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(ChangePasswordResponseDto)
  async changePassword(
    @ActiveUser() user: TokenPayload,
    @Body() passwordData: ChangePasswordDto
  ) {
    return await this.usersService.changePassword(user.userId, passwordData);
  }
}