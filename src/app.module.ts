import { Module } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { CommonModule } from './common/common.modules';
import CustomZodValidationPipe from './common/pipes/custom-zod-validation.pipes';
import { ZodSerializerInterceptor } from 'nestjs-zod';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';


@Module({
  imports: [SharedModule, CommonModule],
  providers: [
    {
      provide: 'APP_PIPE',
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
