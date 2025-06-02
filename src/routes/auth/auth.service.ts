import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { HashingService } from '../../shared/services/hashing.service';
import { TokenService } from '../../shared/services/token.service';
import { isUniqueConstraintPrismaError } from '../../shared/types/helper';
import { AuthRepository } from './repository/auth.repo';
import { 
  RegisterBodyType, 
  LoginBodyType, 
  LoginResponseType,
  RefreshTokenBodyType,
  RefreshTokenResponseType,
  LogoutBodyType 
} from './model/auth.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly authRepository: AuthRepository,
  ) {}

  async register(body: RegisterBodyType) {
    const hashedPassword = await this.hashingService.hash(body.password);

    try {
      const { confirmPassword, ...userData } = body;
      
      return await this.authRepository.createUser({
        ...userData,
        password: hashedPassword,
      });
      
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        const target = error.meta?.target as string[] | undefined;
        if (target?.includes('email')) {
          throw new ConflictException(`Email '${body.email}' đã tồn tại.`);
        }
        throw new ConflictException('Thông tin đăng ký bị trùng lặp.');
      }
      
      console.error("Lỗi Prisma khi đăng ký:", error);
      throw new UnprocessableEntityException([
        {
          message: 'Email đã được sử dụng hoặc thông tin đăng ký không hợp lệ.',
          path: 'email',
        }
      ]); 
    }
  }

  async login(body: LoginBodyType): Promise<LoginResponseType> {
    const { email, password } = body;
    
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException('Tài khoản không tồn tại.');
    }

    if (!user.password) {
      throw new InternalServerErrorException('Tài khoản không hợp lệ.');
    }

    const isPasswordMatching = await this.hashingService.compare(password, user.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Mật khẩu không chính xác.');
    }

    // Update last login
    await this.authRepository.updateLastLogin(user.id);

    // Generate tokens
    const tokens = await this.authRepository.generateToken({ userId: user.id });

    // Return user without password and tokens
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      user: {
        ...userWithoutPassword,
        createdAt: user.createdAt?.toISOString(),
        updatedAt: user.updatedAt?.toISOString(),
        deletedAt: user.deletedAt?.toISOString() ?? null,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refreshToken(body: RefreshTokenBodyType): Promise<RefreshTokenResponseType> {
    const tokens = await this.authRepository.refreshToken(body.refreshToken);
    return tokens;
  }

  async logout(body: LogoutBodyType) {
    return await this.authRepository.logout(body.refreshToken);
  }
}