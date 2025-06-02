import { Module } from '@nestjs/common';
import { AccessTokenGuard } from './guards/access-token.guard';
import { AuthenticationGuard } from './guards/authentication.guard';

@Module({
  providers: [AccessTokenGuard, {
    provide: 'APP_GUARD',
    useClass: AuthenticationGuard
  }],
})
export class CommonModule {}
