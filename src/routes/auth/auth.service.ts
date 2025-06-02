import { 
  Injectable, 
  ConflictException, 
  NotFoundException, 
  UnprocessableEntityException,
  UnauthorizedException,
  InternalServerErrorException
} from '@nestjs/common';
import { AuthRepository } from './repository/auth.repo';
import { HashingService } from '../../shared/services/hashing.service';
import { 
  RegisterBodyType, 
  RegisterResponseType,
  LoginBodyType,
  LoginResponseType,
  RefreshTokenBodyType,
  RefreshTokenResponseType,
  LogoutBodyType,
  LogoutResponseType
} from './model/auth.model';
import { 
  isUniqueConstraintPrismaError, 
  isNotFoundPrismaError 
} from '../../shared/types/helper';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly hashingService: HashingService,
  ) {}

  async register(body: RegisterBodyType): Promise<RegisterResponseType> {
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
        if (target?.includes('username')) {
          throw new ConflictException(`Username '${body.username}' đã tồn tại.`);
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

    await this.authRepository.updateLastLogin(user.id);

    // Generate tokens
    const tokens = await this.authRepository.generateToken({ userId: user.id });

    // Return user without password and tokens
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      user: {
        ...userWithoutPassword,
        role: user.role, 
        status: user.status, 
        createdAt: user.createdAt?.toISOString(),
        updatedAt: user.updatedAt?.toISOString(),
        deletedAt: null,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refreshToken(body: RefreshTokenBodyType): Promise<RefreshTokenResponseType> {
    const tokens = await this.authRepository.refreshToken(body.refreshToken);
    return tokens;
  }

  async logout(body: LogoutBodyType): Promise<LogoutResponseType> {
    return await this.authRepository.logout(body.refreshToken);
  }
}