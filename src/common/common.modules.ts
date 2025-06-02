import { Module } from '@nestjs/common';
import { AccessTokenGuard } from './guards/access-token.guard';
import { AuthenticationGuard } from './guards/authentication.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  providers: [
    AccessTokenGuard,
    AuthenticationGuard, 
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
  exports: [AccessTokenGuard, AuthenticationGuard], 
})
export class CommonModule {}