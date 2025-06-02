import { Module } from '@nestjs/common';
import { AccessTokenGuard } from './guards/access-token.guard';
import { AuthenticationGuard } from './guards/authentication.guard';
import { RoleGuard } from './guards/role.guard';
import { APP_GUARD } from '@nestjs/core';
import { SharedModule } from '../shared/shared.module';
import { PostOwnershipGuard } from './guards/post-ownership.guard';

@Module({
  imports: [SharedModule], 
  providers: [
    AccessTokenGuard,
    AuthenticationGuard, 
    RoleGuard,
    PostOwnershipGuard,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
  exports: [
    AccessTokenGuard, 
    AuthenticationGuard, 
    RoleGuard, 
    PostOwnershipGuard 
  ],
})
export class CommonModule {}