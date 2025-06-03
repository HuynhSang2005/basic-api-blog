import { 
  Body, 
  Controller, 
  HttpCode, 
  HttpStatus, 
  Post
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ZodSerializerDto } from 'nestjs-zod';
import { 
  RegisterBodyDto, 
  RegisterResponseDto,
  LoginBodyDto,
  LoginResponseDto,
  RefreshTokenBodyDto,
  RefreshTokenResponseDto,
  LogoutBodyDto
} from './dto/auth.dto';
import { AuthType } from '../../shared/constants/auth.constant';
import { Auth } from '../../common/decorators/validators/auth-guard/auth.decorators';
import { ApiOperationDecorator } from '../../common/decorators/api-operation.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Auth([AuthType.None])
  @ZodSerializerDto(RegisterResponseDto)
  @ApiOperationDecorator({
    type: RegisterResponseDto,
    summary: 'Register new user',
    description: 'Create a new user account with email, username, and password',
    operationId: 'register',
    requireAuth: false,
  })
  async register(@Body() body: RegisterBodyDto) {
    return await this.authService.register(body);
  }

  @Post('login')
  @Auth([AuthType.None])
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(LoginResponseDto)
  @ApiOperationDecorator({
    type: LoginResponseDto,
    summary: 'User login',
    description: 'Authenticate user and return access token and refresh token',
    operationId: 'login',
    requireAuth: false,
  })
  async login(@Body() body: LoginBodyDto) {
    return await this.authService.login(body);
  }

  @Post('logout')
  @Auth([AuthType.Bear])
  @HttpCode(HttpStatus.OK)
  @ApiOperationDecorator({
    summary: 'User logout',
    description: 'Logout user and invalidate refresh token',
    operationId: 'logout',
    requireAuth: true,
  })
  async logout(@Body() body: LogoutBodyDto) {
    return await this.authService.logout(body);
  }

  @Post('refresh-token')
  @Auth([AuthType.None])
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(RefreshTokenResponseDto)
  @ApiOperationDecorator({
    type: RefreshTokenResponseDto,
    summary: 'Refresh access token',
    description: 'Generate new access token using refresh token',
    operationId: 'refreshToken',
    requireAuth: false,
  })
  async refreshToken(@Body() body: RefreshTokenBodyDto) {
    return await this.authService.refreshToken(body);
  }
}