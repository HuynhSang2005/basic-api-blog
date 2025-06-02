import { 
  Body, 
  Controller, 
  HttpCode, 
  HttpStatus, 
  Post
} from '@nestjs/common';
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
import { Auth } from '../../common/decorators/validators/auth-guard/auth.decorators'; // ← FIX IMPORT PATH

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Auth([AuthType.None])
  @ZodSerializerDto(RegisterResponseDto)
  async register(@Body() body: RegisterBodyDto) {
    return await this.authService.register(body);
  }

  @Post('login')
  @Auth([AuthType.None])
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(LoginResponseDto)
  async login(@Body() body: LoginBodyDto) {
    return await this.authService.login(body);
  }

  @Post('logout')
  @Auth([AuthType.Bear])
  @HttpCode(HttpStatus.OK)
  async logout(@Body() body: LogoutBodyDto) {
    return await this.authService.logout(body);
  }

  @Post('refresh-token')
  @Auth([AuthType.None])
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(RefreshTokenResponseDto)
  async refreshToken(@Body() body: RefreshTokenBodyDto) {
    return await this.authService.refreshToken(body);
  }
}