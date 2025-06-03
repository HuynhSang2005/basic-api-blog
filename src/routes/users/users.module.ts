import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersRepository } from './repository/users.repo';
import { UsersService } from './users.service';
import { SharedModule } from 'src/shared/shared.module';


@Module({
  imports: [SharedModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}