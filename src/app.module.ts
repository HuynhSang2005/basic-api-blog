import { Module } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { CommonModule } from './common/common.modules';
import CustomZodValidationPipe from './common/pipes/custom-zod-validation.pipes';
import { ZodSerializerInterceptor } from 'nestjs-zod';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AuthModule } from './routes/auth/auth.module';
import { UsersModule } from './routes/users/users.module';
import { TagsModule } from './routes/tags/tags.module';
import { CategoriesModule } from './routes/categories/categories.module';
import { PostsModule } from './routes/posts/posts.module';

@Module({
  imports: [SharedModule, CommonModule, AuthModule, UsersModule, TagsModule, CategoriesModule, PostsModule],
  providers: [
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}