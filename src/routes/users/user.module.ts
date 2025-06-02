import { Module } from '@nestjs/common';
import { UsersController } from './user.controller';
import { UsersRepository } from './repository/user.repo';
import { UsersService } from './user.service';


@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}