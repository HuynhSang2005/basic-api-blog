import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { HashingService } from './services/hashing.service';
import { TokenService } from './services/token.service';
import { JwtModule } from '@nestjs/jwt';
import { SlugService } from './services/slug.service';

const shareServices = [
  PrismaService,
  HashingService,
  TokenService,
  SlugService
]

@Global()
@Module({
  providers: [...shareServices],
  exports: shareServices,
  imports: [JwtModule],
})
export class SharedModule {}
