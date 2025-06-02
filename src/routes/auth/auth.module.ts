import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from './repository/auth.repo';

@Module({
  // imports: [AccessTokenGuard, AuthenticationGuard],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository],
})
export class AuthModule {}